# config/initializers/cors.rb
# CORS = Cross-Origin Resource Sharing
# Sem isso, o browser bloqueia requisições do frontend (porta 5173) para o backend (porta 3000)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Em produção, troque pelo domínio real do seu frontend
    origins ENV.fetch("FRONTEND_URL", "http://localhost:5173")

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose:  ["Authorization"]
  end
end