defmodule Punkmade.Accounts.Oauthuser do
  use Ecto.Schema
  import Ecto.Changeset

  @providers ["google", "github", "facebook", "microsoft"]
  
  schema "oauthusers" do
    field :provider, :string
    field :user_id, :binary_id
    field :provider_user_id, :string

    timestamps(type: :utc_datetime)
  end

  def create(oauthuser, attrs) do
    oauthuser
    |> cast(attrs, [:provider, :user_id, :provider_user_id])
    |> validate_required([:provider, :user_id, :provider_user_id])
    |> validate_inclusion(:provider, @providers)
  end
end
