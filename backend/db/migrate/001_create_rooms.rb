# db/migrate/001_create_rooms.rb
# Migrations são como "histórico de versões" do banco de dados.
# Cada migration descreve uma alteração na estrutura das tabelas.
# Execute com: rails db:migrate

class CreateRooms < ActiveRecord::Migration[7.1]
  def change
    create_table :rooms do |t|
      # identifier é o nome/slug da sala (ex: "minha-sala", "turma-ds-2025")
      t.string :identifier, null: false

      # timestamps cria automaticamente created_at e updated_at
      t.timestamps
    end

    # Índice único garante que não existam duas salas com o mesmo nome
    add_index :rooms, :identifier, unique: true
  end
end