defmodule Punkmade.Accounts.Relationship do
  use Ecto.Schema
  import Ecto.Changeset

  @standings ["friend", "enemy", "friend_requested", "enemy_requested", "blocked"]
  schema "relationships" do
    field :user_id, :binary_id
    field :other_user_id, :binary_id
    field :standing, :string

    timestamps(type: :utc_datetime)
  end

  def create(relationship, attrs) do
    relationship
    |> cast(attrs, [:user_id, :other_user_id, :standing])
    |> validate_required([:user_id, :other_user_id, :standing])
    |> validate_inclusion(:standing, @standings)
  end
end
