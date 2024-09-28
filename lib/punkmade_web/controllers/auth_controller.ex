defmodule PunkmadeWeb.AuthController do
  alias Punkmade.Accounts
  alias PunkmadeWeb.UserAuth
  alias Punkmade.OAuth.Google
  alias OAuth2
  use PunkmadeWeb, :controller

  def callback(conn, %{"code" => code, "provider" => "google"}) do
    client = Google.get_token!(code: code)

    decode_google_access_token(client.token.access_token)
    |> get_google_user_email()
    |> case do
      {info, token} ->
        info = Jason.decode!(info)

        id_token = Map.get(token, "id_token")
        claims = JOSE.JWT.peek_payload(id_token)
        provider_user_id = Map.get(claims.fields, "sub")

        expires_at =
          DateTime.add(
            DateTime.utc_now(),
            Map.get(token, "expires_in"),
            :second
          )

        {redirect_uri, session_id} =
          UserAuth.login(
            %{
              email: Map.get(info, "email"),
              provider: "google",
              provider_user_id: provider_user_id
            },
            %{
              access_token: Map.get(token, "access_token"),
              refresh_token: Map.get(token, "refresh_token"),
              expiry: expires_at
            }
          )

        cookie_opts = [
          max_age: Map.get(token, "expires_in"),
          http_only: false,
          secure: true,
          encrypt: true,
          same_site: "lax"
        ]

        clear_active_session(conn, cookie_opts)
        |> put_resp_cookie("_access_token", Map.get(token, "access_token"), cookie_opts)
        |> put_session(:session_id, session_id)
        |> redirect(to: redirect_uri)

      :error ->
        redirect(conn, to: "/sign_in/failure")
    end
  end

  def callback(conn, _params) do
    redirect(conn, to: "/")
  end

  def sign_out(conn, _params) do
    fetch_cookies(conn, encrypted: ~w(_access_token))
    |> Map.get(:cookies)
    |> Map.get("_access_token")
    |> Accounts.remove_session_by_token()

    redirect(conn, to: "/")
  end

  defp clear_active_session(conn, cookie_opts) do
    token_value =
      fetch_cookies(conn, encrypted: ~w(_access_token))
      |> Map.get(:cookies)
      |> Map.get("_access_token")

    if !is_nil(token_value) do
      Accounts.remove_session_by_token(token_value)
    end

    delete_resp_cookie(conn, "_access_token", cookie_opts)
  end

  defp decode_google_access_token(token_json) do
    case Jason.decode(token_json) do
      {:ok, token} -> token
      {:error, _} -> :error
    end
  end

  defp get_google_user_email(token) do
    case Google.get_email(Map.get(token, "access_token")) do
      {:ok, %OAuth2.Response{status_code: 200, body: info}} ->
        {info, token}

      {:error, _} ->
        :error
    end
  end

  def failure(conn, _params) do
    render(conn, :login_failure)
  end
end
