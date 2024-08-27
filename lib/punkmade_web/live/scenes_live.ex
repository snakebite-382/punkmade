defmodule PunkmadeWeb.ScenesLive do
  alias Punkmade.Scenes
  use PunkmadeWeb, :live_view

  def mount(_params, _session, socket) do
    users_scenes = Scenes.get_users_scenes(socket.assigns.my_user.id)

    socket = 
      socket
      |> assign(:my_scenes, users_scenes)

    {:ok, socket}
  end
end
