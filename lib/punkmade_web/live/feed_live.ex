defmodule PunkmadeWeb.FeedLive do
  alias Punkmade.Scenes
  use PunkmadeWeb, :live_view

  def mount(_params, session, socket) do
    users_scenes = Scenes.get_users_scenes(socket.assigns.my_user.id)

    socket =
      socket
      |> assign(:users_scenes, users_scenes)
      |> assign(:session_id, Map.get(session, "session_id"))

    {:ok, socket}
  end
end
