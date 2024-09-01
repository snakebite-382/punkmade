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

defimpl Elasticsearch.Document, for: Punkmade.Scenes.Scene do
  import Ecto.Query
  alias Punkmade.Scenes.{City, State, Scene}
  alias Punkmade.Repo

  def id(scene), do: scene.id

  def routing(_), do: false

  def encode(scene) do
    location_info =
      from(s in Scene,
        where: s.id == ^scene.id,
        join: c in City,
        on: c.id == s.city_id,
        join: st in State,
        on: st.id == c.state_id,
        select: %{
          state: st,
          city: c
        }
      )
      |> Repo.one()

    %{
      id: scene.id,
      name: scene.name,
      city_id: scene.id,
      mascot_url: scene.mascot_url,
      state_name: location_info.state.name,
      city_name: location_info.city.name
    }
  end
end
