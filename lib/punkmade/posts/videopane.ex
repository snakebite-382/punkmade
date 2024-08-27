defmodule Punkmade.Posts.Videopane do
  use Ecto.Schema
  import Ecto.Changeset

  schema "videopanes" do
    field :post_id, :integer
    field :media_url, :string
    timestamps(type: :utc_datetime)
  end

  def create(videopane, attrs) do
    videopane
    |> cast(attrs, [:post_id, :media_url])
    |> validate_required([:post_id, :media_url])
  end
end
