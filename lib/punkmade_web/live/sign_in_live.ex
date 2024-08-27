defmodule PunkmadeWeb.SignInLive do
  alias Punkmade.OAuth.Google
  use PunkmadeWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:google_url, Google.authorize_url!())}
  end
end
