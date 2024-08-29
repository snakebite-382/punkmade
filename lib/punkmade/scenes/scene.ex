defmodule Punkmade.Scenes.Scene do
  use Ecto.Schema
  import Ecto.Changeset

  schema "scenes" do
    field :name, :string
    field :city_id, :integer
    field :mascot_url, :string

    timestamps(type: :utc_datetime)
  end

  def create(scene, attrs) do
    scene
    |> cast(attrs, [:name, :city_id, :mascot_url])
    |> validate_required([:name, :city_id])
    |> unsafe_validate_unique([:name, :city_id], Punkmade.Repo)
    |> unique_constraint([:name, :city_id])
  end

end
