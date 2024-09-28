defmodule Punkmade.Accounts do
  alias Plug.Session
  alias Punkmade.Accounts.Session
  alias Punkmade.Accounts.Oauthuser
  alias Punkmade.Repo
  alias Punkmade.Accounts.User
  import Ecto.Query

  def register_user!(email) do
    User.create(%User{}, %{
      email: email,
      username: "Jane Doe",
      pronoun_subjective: "they",
      pronoun_objective: "them",
      pronoun_possesive: "theirs",
      bio: "New user bio!"
    })
    |> Repo.insert!()
  end

  def get_user_by_uuid(uuid) do
    from(u in User, where: u.id == ^uuid)
    |> Repo.one()
  end

  def get_oauth_providers_by_uuid(uuid) do
    from(
      u in User,
      where: u.id == ^uuid,
      left_join: o in Oauthuser,
      on: o.user_id == u.id,
      select: %{
        provider: o
      }
    )
    |> Repo.all()
  end

  def add_oauth_user!(provider, user_id, provider_user_id) do
    Oauthuser.create(%Oauthuser{}, %{
      provider: provider,
      user_id: user_id,
      provider_user_id: provider_user_id
    })
    |> Repo.insert!()
  end

  def create_session!(oauth_user_id, user_id, %{
        access_token: access_token,
        refresh_token: refresh_token,
        expiry: expiry
      }) do
    Session.create(%Session{}, %{
      oauth_user_id: oauth_user_id,
      user_id: user_id,
      access_token: access_token,
      refresh_token: refresh_token,
      token_expiry: expiry
    })
    |> Repo.insert!()
    |> Map.get(:id)
  end

  def remove_session_by_token(access_token) do
    from(
      s in Session,
      where: s.access_token == ^access_token
    )
    |> Repo.delete_all()
  end
end
