# app/controllers/api/v1/base_controller.rb
# Todos os controllers da API herdam daqui.
# É aqui que ficam filtros e comportamentos comuns (ex: autenticação futura).

module Api
  module V1
    class BaseController < ActionController::API
      # Captura erros de registro não encontrado e retorna 404
      rescue_from ActiveRecord::RecordNotFound do |e|
        render json: { error: e.message }, status: :not_found
      end

      # Captura erros de validação e retorna 422
      rescue_from ActiveRecord::RecordInvalid do |e|
        render json: { error: e.message }, status: :unprocessable_entity
      end
    end
  end
end