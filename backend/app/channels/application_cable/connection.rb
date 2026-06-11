# app/channels/application_cable/connection.rb
# Esta classe é a "porta de entrada" do WebSocket.
# É chamada quando um cliente se conecta em ws://localhost:3000/cable.
# Aqui você pode identificar quem é o cliente (ex: via token).

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    # identified_by cria um atributo acessível em todos os channels.
    # Por enquanto usamos um ID aleatório — sem autenticação.
    identified_by :connection_id

    def connect
      self.connection_id = SecureRandom.uuid
    end
  end
end