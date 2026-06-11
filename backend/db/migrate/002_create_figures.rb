# db/migrate/002_create_figures.rb
# Cria a tabela de figuras desenhadas.
# O campo "data" é do tipo jsonb (JSON binário do PostgreSQL) —
# muito eficiente para armazenar dados semiestruturados como pontos de um pincel.

class CreateFigures < ActiveRecord::Migration[7.1]
  def change
    create_table :figures do |t|
      # Chave estrangeira: liga a figura à sala
      t.references :room, null: false, foreign_key: true

      # Tipo da figura: "brush", "circle" ou "rectangle"
      t.string :figure_type, null: false

      # Dados da figura em formato JSON:
      # brush:     { color, strokeWidth, points: [{x, y}, ...] }
      # circle:    { color, strokeWidth, x, y, radius }
      # rectangle: { color, strokeWidth, x, y, width, height }
      t.jsonb :data, null: false, default: {}

      t.timestamps
    end

    # Índice para buscas rápidas por sala
    # Índice GIN para consultas dentro do JSON (opcional, mas recomendado)
    add_index :figures, :data, using: :gin
  end
end