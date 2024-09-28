defmodule Punkmade.OAuth.Google do
  use OAuth2.Strategy

  def client do
    OAuth2.Client.new(
      strategy: __MODULE__,
      client_id: System.get_env("GOOGLE_CLIENT_ID"),
      client_secret: System.get_env("GOOGLE_CLIENT_SECRET"),
      site: "https://www.googleapis.com",
      authorize_url: "https://accounts.google.com/o/oauth2/v2/auth",
      token_url: "https://oauth2.googleapis.com/token",
      redirect_uri: "http://localhost:4000/oauth/callback/google"
    )
  end

  def get_email(token) do
    client()
    |> OAuth2.Client.put_header(
      "Authorization",
      "Bearer #{token}"
    )
    |> OAuth2.Client.get("https://www.googleapis.com/oauth2/v2/userinfo")
  end

  def authorize_url! do
    client()
    |> OAuth2.Client.authorize_url!(
      scope: "https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      prompt: "consent"
    )
  end

  def get_token!(params) do
    client()
    |> OAuth2.Client.get_token!(params)
  end

  def authorize_url(client, params) do
    OAuth2.Strategy.AuthCode.authorize_url(client, params)
  end

  def get_token(client, params, headers) do
    client
    |> put_header("accept", "application/json")
    |> OAuth2.Strategy.AuthCode.get_token(params, headers)
  end

  def refresh_token(refresh_token, access_token, token_expiry) do
    client()
    |> Map.put(:token, %OAuth2.AccessToken{
      access_token: access_token,
      refresh_token: refresh_token,
      expires_at: token_expiry,
      token_type: "Bearer"
    })
    |> OAuth2.Client.refresh_token()
  end
end
