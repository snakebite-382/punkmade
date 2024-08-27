defmodule Punkmade.Posts.Tag do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tags" do
    field :content, :string
    field :scene_id, :integer
    timestamps(type: :utc_datetime)
  end

  def create(tag, attrs) do
    tag
    |> cast(attrs, [:scene_id, :content])
    |> validate_required([:scene_id, :content])
    |> validate_length(:content, min: 2, max: 16)
    |> unsafe_validate_unique([:content, :scene_id], Punkmade.Repo)
    |> unique_constraint([:content, :scene_id])
  end
  
end
