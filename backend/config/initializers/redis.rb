# config/initializers/redis.rb
# Cria uma conexão global com o Redis que pode ser usada em qualquer lugar com:
#   REDIS.get("chave")
#   REDIS.set("chave", "valor")
#   REDIS.del("chave")

REDIS = Redis.new(url: ENV.fetch("REDIS_URL", "redis://localhost:6379/0"))

# Também configura o Rails para usar Redis como cache store
Rails.application.config.cache_store = :redis_cache_store, {
  url:       ENV.fetch("REDIS_URL", "redis://localhost:6379/0"),
  namespace: "drawpad"
}