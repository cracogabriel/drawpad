# app/models/figure.rb
# Uma figura é qualquer elemento desenhado no canvas: pincel, círculo ou retângulo.
# Os dados de posição/forma ficam num campo JSON chamado "data".

class Figure < ApplicationRecord
  # Pertence a uma sala
  belongs_to :room

  # Tipos válidos de figura (correspondentes às ferramentas do frontend)
  TYPES = %w[brush circle rectangle].freeze

  validates :figure_type, presence: true, inclusion: { in: TYPES }
  validates :data,        presence: true
  validates :room,        presence: true

  # Scope: retorna figuras ordenadas por criação (útil ao carregar a sala)
  scope :ordered, -> { order(:created_at) }
end