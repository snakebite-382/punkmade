defmodule Punkmade.Posts.Imagepane do
  use Ecto.Schema
  import Ecto.Changeset

  schema "imagepanes" do
    field :post_id, :integer
    field :media_url, :string
    timestamps(type: :utc_datetime)
  end

  def create(imagepane, attrs) do
    imagepane
    |> cast(attrs, [:post_id, :media_url])
    |> validate_required([:post_id, :media_url])
  end
end
