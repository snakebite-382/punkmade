defmodule Punkmade.Posts.Posttag do
  use Ecto.Schema
  import Ecto.Changeset

  schema "posttags" do
    field :post_id, :integer
    field :tag_id, :integer
    timestamps(type: :utc_datetime)
  end
  
  def create(posttag, attrs) do
    posttag
    |> cast(attrs, [:post_id, :tag_id])
    |> validate_required([:post_id, :tag_id])
    |> unsafe_validate_unique([:post_id, :tag_id], Punkmade.Repo)
    |> unique_constraint([:post_id, :tag_id])
  end
end
