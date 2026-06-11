# app/models/room.rb
# Um "model" no Rails representa uma tabela do banco de dados.
# Aqui, Room (Sala) corresponde à tabela "rooms".

class Room < ApplicationRecord
  # Uma sala tem muitas figuras. Se a sala for deletada, as figuras também são.
  has_many :figures, dependent: :destroy

  # Validação: o identificador é obrigatório e deve ser único
  validates :identifier, presence: true, uniqueness: true

  # Método auxiliar: busca uma sala pelo identificador ou cria uma nova
  def self.find_or_create_by_identifier(identifier)
    find_or_create_by(identifier: identifier)
  end
end