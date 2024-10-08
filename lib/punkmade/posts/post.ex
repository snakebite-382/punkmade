defmodule Punkmade.Posts.Post do
  use Ecto.Schema
  import Ecto.Changeset

  schema "posts" do
    field :user_id, :binary_id
    field :scene_id, :integer
    field :title, :string

    timestamps(type: :utc_datetime)
  end

  def create(post, attrs) do
    post
    |> cast(attrs, [:user_id, :scene_id, :title])
    |> validate_required([:user_id, :scene_id, :title])
    |> validate_title()
  end

  def form(post, attrs) do
    post
    |> cast(attrs, [:title])
    |> validate_required([:title])
    |> validate_title()
  end

  def validate_title(changeset) do
    changeset
    |> validate_length(:title, min: 8, max: 128)
  end
end
