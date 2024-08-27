defmodule Punkmade.Accounts.Session do
  use Ecto.Schema
  import Ecto.Changeset

  schema "sessions" do
    field :oauth_user_id, :integer
    field :user_id, :binary_id
    field :access_token, :string
    field :refresh_token, :string
    field :token_expiry, :utc_datetime

    timestamps(type: :utc_datetime)
  end

  def create(session, attrs) do
    session
    |> cast(attrs, [:oauth_user_id, :user_id, :access_token, :refresh_token, :token_expiry])
    |> validate_required([:oauth_user_id, :user_id, :access_token, :refresh_token, :token_expiry])
  end
end
