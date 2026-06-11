Rails.application.routes.draw do
  # Monta o servidor WebSocket no caminho /cable
  # O frontend vai se conectar em ws://localhost:3000/cable
  mount ActionCable.server => "/cable"

  namespace :api do
    namespace :v1 do
      # GET  /api/v1/rooms/:id  → carrega sala e seus desenhos
      # POST /api/v1/rooms      → cria uma nova sala (opcional)
      resources :rooms, only: [:show, :create]
    end
  end

  # Rota de health check — útil para verificar se o servidor está vivo
  get "/health", to: proc { [200, {}, ["OK"]] }
end