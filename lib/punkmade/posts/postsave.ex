defmodule Punkmade.Posts.Postsave do
  use Ecto.Schema
  import Ecto.Changeset

  schema "postsaves" do
    field :post_id, :integer
    field :user_id, :binary_id
    timestamps(type: :utc_datetime)
  end
  
  def create(postsave, attrs) do
    postsave
    |> cast(attrs, [:post_id, :user_id])
    |> validate_required([:post_id, :user_id])
  end
end
