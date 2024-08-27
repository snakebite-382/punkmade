defmodule Punkmade.Posts.Comment do
  use Ecto.Schema
  import Ecto.Changeset

  schema "comments" do
    field :content, :string
    field :user_id, :binary_id
    field :post_id, :integer

    timestamps(type: :utc_datetime)
  end

  def create(comment, attrs) do
    comment
    |> cast(attrs, [:content, :user_id, :post_id])
    |> validate_required([:content, :user_id, :post_id])
    |> validate_length(:content, min: 8, max: 512)
  end
end
