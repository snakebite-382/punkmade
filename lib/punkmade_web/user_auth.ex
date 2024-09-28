defmodule PunkmadeWeb.UserAuth do
  alias Punkmade.Accounts.Session
  alias Punkmade.Accounts.Oauthuser
  alias Ecto.Repo
  alias Punkmade.Repo
  alias Punkmade.Accounts
  import Ecto.Query
  import Plug.Conn

  def login(
        %{
          email: email,
          provider: provider,
          provider_user_id: provider_user_id
        },
        token = %{
          access_token: _access,
          refresh_token: _refresh,
          expiry: _expiry
        }
      ) do
    get_user_query =
      from u in Accounts.User,
        where: u.email == ^email

    user = Repo.one(get_user_query)

    if is_nil(user) do
      user = Accounts.register_user!(email)
      oauth_user = Accounts.add_oauth_user!(provider, user.id, provider_user_id)

      id = Accounts.create_session!(oauth_user.id, user.id, token)

      {"/users/#{user.id}?new_user=true&new_oauth=#{provider}", id}
    else
      get_oauth_user_query =
        from o in Accounts.Oauthuser,
          where: o.user_id == ^user.id and o.provider == ^provider

      oauth_user = Repo.one(get_oauth_user_query)

      if is_nil(oauth_user) do
        oauth_user = Accounts.add_oauth_user!(provider, user.id, provider_user_id)
        id = Accounts.create_session!(oauth_user.id, user.id, token)

        {"/users/#{user.id}?new_oauth=#{provider}", id}
      else
        id = Accounts.create_session!(oauth_user.id, user.id, token)

        {"/feed", id}
      end
    end
  end

  def authenticate(conn, _opts) do
    token_valid =
      get_token(conn)
      |> validate_token?()

    conn
    |> put_session(:authed, token_valid)
    |> assign(:authed, token_valid)
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
        refresh_session(session)
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

  defp refresh_session(session) do
    from(o in Oauthuser, where: o.id == ^session.oauth_user_id)
    |> Repo.one()
    |> case do
      nil ->
        {:error, "No OAuthuser"}

      oauth_user ->
        case oauth_user.provider do
          "google" ->
            Punkmade.OAuth.Google.refresh_token(
              session.refresh_token,
              session.access_token,
              session.token_expiry
            )
            |> case do
              {:error, _} ->
                {:error, "Could Not Refresh"}

              {:ok, refresh_token} ->
                expiry =
                  DateTime.utc_now()
                  |> DateTime.add(1, :hour)

                Session.refresh(session, %{token_expiry: expiry})
                |> Repo.update!()

                {:ok, refresh_token}
            end
        end
    end
  end

  defp get_token(conn) do
    conn
    |> fetch_cookies(encrypted: ~w(_access_token))
    |> Map.get(:cookies)
    |> Map.get("_access_token")
  end

  defp validate_token?(token) when not is_nil(token) do
    session =
      from(s in Accounts.Session, where: s.access_token == ^token)
      |> Repo.one()

    if is_nil(session) do
      false
    else
      DateTime.before?(DateTime.utc_now(), session.token_expiry)
    end
  end

  defp validate_token?(_token), do: false

  def get_my_user(conn, _opts) do
    if conn.assigns.authed do
      user =
        conn
        |> get_token()
        |> get_user_by_token()

      conn
      |> put_session(:my_user, user.user)
      |> assign(:my_user, user.user)
    else
      conn
    end
  end

  defp get_user_by_token(token) when not is_nil(token) do
    from(s in Accounts.Session,
      where: s.access_token == ^token,
      join: u in Accounts.User,
      on: u.id == s.user_id,
      select: %{
        user: u
      }
    )
    |> Repo.one()
  end

  defp get_user_by_token(_token), do: nil

  def redirect_to_feed(conn, _opts) do
    if conn.assigns.authed do
      conn |> Phoenix.Controller.redirect(to: "/feed") |> halt()
    else
      conn
    end
  end

  def on_mount(:redirect_if_authed, _params, session, socket) do
    if Map.get(session, "authed") do
      {:halt, Phoenix.LiveView.redirect(socket, to: "/feed")}
    else
      {:cont, socket}
    end
  end

  def on_mount(:redirect_if_not_authed, _params, session, socket) do
    if not Map.get(session, "authed") do
      {:halt, socket |> Phoenix.LiveView.redirect(to: "/")}
    else
      {:cont, socket}
    end
  end

  def on_mount(:mount_auth_state, _params, session, socket) do
    socket =
      socket
      |> Phoenix.Component.assign(:my_user, Map.get(session, "my_user"))
      |> Phoenix.Component.assign(:authed, Map.get(session, "authed"))

    {:cont, socket}
  end
end
