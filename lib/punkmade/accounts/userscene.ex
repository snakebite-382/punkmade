defmodule Punkmade.Accounts.Userscene do
  use Ecto.Schema
  import Ecto.Changeset

  schema "userscenes" do
    field :user_id, :binary_id
    field :scene_id, :integer

    timestamps(type: :utc_datetime)
  end

  def create(userscene, attrs) do
    userscene
    |> cast(attrs, [:user_id, :scene_id])
    |> validate_required([:user_id, :scene_id])
  end
end
