defmodule Punkmade.Posts.Commentsave do
  use Ecto.Schema
  import Ecto.Changeset

  schema "commentsaves" do
    field :comment_id, :integer
    field :user_id, :binary_id
    timestamps(type: :utc_datetime)
  end

  def create(commentsave, attrs) do
    commentsave
    |> cast(attrs, [:comment_id, :user_id])
    |> validate_required([:comment_id, :user_id])
  end
end
