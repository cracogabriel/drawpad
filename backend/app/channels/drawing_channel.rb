# app/channels/drawing_channel.rb
# Este é o coração do sistema de tempo real.
#
# Fluxo:
#   1. Cliente chama subscribe({ room_id: "minha-sala" })
#   2. O servidor coloca esse cliente no "stream" da sala
#   3. Quando alguém desenha, o cliente chama perform("draw", { ... })
#   4. O servidor salva no banco + Redis e transmite para todos na sala

class DrawingChannel < ApplicationCable::Channel

  # Chamado quando o cliente se inscreve numa sala via WebSocket
  # Parâmetros esperados: { "room_id": "identificador-da-sala" }
  def subscribed
    room_id = params[:room_id]

    if room_id.present?
      # stream_from: inscreve este cliente no "canal" da sala
      # Qualquer broadcast para "drawing_room_X" chega a todos inscritos nele
      stream_from "drawing_room_#{room_id}"
    else
      reject # Rejeita a conexão se não foi informada sala
    end
  end

  # Chamado quando o cliente se desconecta
  def unsubscribed
    # O Action Cable já limpa os streams automaticamente
    # Aqui você pode adicionar lógica de cleanup se necessário
  end

  # Chamado quando o cliente envia uma ação "draw"
  # Dados esperados:
  # {
  #   "room_id":     "minha-sala",
  #   "figure_type": "brush" | "circle" | "rectangle",
  #   "data": {
  #     "color": "#ff0000",
  #     "points": [...],   # para brush
  #     "x": 10, "y": 20, "width": 100, "height": 50  # para formas
  #   }
  # }
  def draw(payload)
    room_id     = payload["room_id"]
    figure_type = payload["figure_type"]
    data        = payload["data"]

    return unless room_id && figure_type && data

    # Busca ou cria a sala no banco
    room = Room.find_or_create_by_identifier(room_id)

    # Persiste a figura no PostgreSQL
    figure = room.figures.create!(
      figure_type: figure_type,
      data:        data
    )

    # Invalida o cache Redis da sala (para a próxima leitura ir ao banco)
    invalidate_cache(room_id)

    # Transmite o evento para TODOS os clientes da sala (incluindo quem desenhou)
    ActionCable.server.broadcast(
      "drawing_room_#{room_id}",
      {
        event:       "new_figure",
        figure_id:   figure.id,
        figure_type: figure.figure_type,
        data:        figure.data
      }
    )
  rescue ActiveRecord::RecordInvalid => e
    # Envia erro só para quem enviou o dado inválido
    transmit({ event: "error", message: e.message })
  end

  private

  def invalidate_cache(room_id)
    REDIS.del("room:#{room_id}:figures")
  end
end
