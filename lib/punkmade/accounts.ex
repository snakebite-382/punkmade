defmodule Punkmade.Accounts do
  alias PunkmadeWeb.UserAuth
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

  def handle_activity_report(
        %{
          "active" => active,
          "last_change" => last_change
        },
        session_id
      ) do
    if active do
      handle_active_session(session_id)
    else
      handle_inactive_session(last_change)
    end
  end

  defp handle_active_session(session_id) do
    Repo.get(Session, session_id)
    |> case do
      nil ->
        :invalid

      session ->
        validate_and_refresh(session)
    end
  end

  defp validate_and_refresh(session) do
    if DateTime.before?(DateTime.utc_now(), session.token_expiry) do
      if(
        # if the token expires in a 5 minutes or less
        DateTime.diff(
          session.token_expiry,
          DateTime.utc_now(),
          :minute
        ) <= 5
      ) do
        UserAuth.refresh_session(session)
        |> case do
          {:ok, _} -> :refreshed
          {:error, _} -> :invalid
        end
      else 
        :active
      end
    else
      :invalid
    end
  end

  defp handle_inactive_session(last_change) do
    {:ok, last_change} =
      last_change
      |> div(1000)
      |> DateTime.from_unix()

    if DateTime.diff(DateTime.utc_now(), last_change, :minute) >= 15 do
      :invalid
    else 
      :idle
    end
  end
end
