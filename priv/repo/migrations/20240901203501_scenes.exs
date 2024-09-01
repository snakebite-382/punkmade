defmodule Punkmade.Repo.Migrations.Scenes do
  use Ecto.Migration

  def change do
    create table("states") do
      add :name, :string, size: 2, null: false

      timestamps()
    end

    create unique_index("states", [:name])

    create table("cities") do
      add :name, :string, null: false
      add :state_id, references("states", on_delete: :delete_all), null: false

      timestamps()
    end

    create unique_index("cities", [:name, :state_id])

    create table("scenes") do
      add :name, :string, size: 128, null: false
      add :city_id, references("cities", on_delete: :delete_all), null: false
      add :mascot_url, :string, null: false

      timestamps()
    end

    create unique_index("scenes", [:name, :city_id])
  end
end
