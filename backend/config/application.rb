require_relative "boot"
require "rails"
require "active_model/railtie"
require "active_record/railtie"
require "active_job/railtie"
require "action_controller/railtie"
require "action_cable/engine"

# Carrega todas as gems do Gemfile
Bundler.require(*Rails.groups)


# Em um sistema distribuído com múltiplos servidores, cada instância mantém
# suas próprias conexões WebSocket em memória. Sem um intermediário, um usuário
# conectado ao Servidor A nunca receberia mensagens de um usuário no Servidor B.
#
# O Redis resolve isso atuando como um hub central no padrão Pub/Sub:
#
#   Usuário A ── Servidor 1 ──► publica no Redis
#                                      │
#                               Redis distribui
#                                      │
#               Servidor 2 ◄── recebe do Redis ── Usuário B
#
# Dessa forma, qualquer servidor pode publicar uma mensagem e todos os outros
# servidores, e seus respectivos clientes, recebem automaticamente.
#
# O adapter padrão do Rails é o "async", que guarda tudo na memória de um único
# processo. Aqui usamos "redis" para simular o comportamento real de produção
# com múltiplos nós se comunicando.

module DrawpadBackend
  class Application < Rails::Application
    config.load_defaults 7.1

    # API-only: sem views HTML, só JSON
    config.api_only = true

    # Action Cable precisa ser montado mesmo em modo API
    config.action_cable.mount_path = "/cable"

    # Configura o Redis como adapter do Action Cable
    config.action_cable.cable = {
      "adapter" => "redis",
      "url"     => ENV.fetch("REDIS_URL", "redis://localhost:6379/0")
    }
  end
end