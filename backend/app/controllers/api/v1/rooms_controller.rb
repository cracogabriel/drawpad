# app/controllers/api/v1/rooms_controller.rb
# Responsável pelos endpoints HTTP da sala:
#   GET  /api/v1/rooms/:id  → carrega sala + figuras (com cache)
#   POST /api/v1/rooms      → cria uma sala pelo identificador

module Api
  module V1
    class RoomsController < BaseController

      # GET /api/v1/rooms/:id
      # O frontend chama isso ao entrar numa sala para carregar os desenhos existentes.
      def show
        room = Room.find_or_create_by_identifier(params[:id])

        # Tenta buscar os dados do cache Redis primeiro (cache hit)
        # Se não estiver em cache, vai ao banco (cache miss) e armazena no Redis
        cache_key = "room:#{room.identifier}:figures"

        figures_json = REDIS.get(cache_key)

        if figures_json
          # Cache HIT: dados já estavam no Redis
          puts "Cache HIT para sala #{room.identifier}"
          figures = JSON.parse(figures_json)
        else
          # Cache MISS: busca no banco de dados e salva no Redis por 1 hora
          puts "Cache MISS para sala #{room.identifier}"
          figures = room.figures.ordered.map do |f|
            { id: f.id, figure_type: f.figure_type, data: f.data }
          end
          REDIS.setex(cache_key, 3600, figures.to_json)
        end

        render json: {
          room: { id: room.id, identifier: room.identifier },
          figures: figures
        }
      end

      # POST /api/v1/rooms
      # Corpo esperado: { "identifier": "nome-da-sala" }
      def create
        room = Room.find_or_create_by_identifier(room_params[:identifier])
        render json: { room: { id: room.id, identifier: room.identifier } },
               status: :created
      end

      private

      def room_params
        params.require(:room).permit(:identifier)
      end
    end
  end
end
