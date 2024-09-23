defmodule PunkmadeWeb.FeedLive do
  alias Punkmade.ElasticsearchCluster
  alias Punkmade.Scenes
  use PunkmadeWeb, :live_view

  def mount(_params, _session, socket) do
    users_scenes = Scenes.get_users_scenes(socket.assigns.my_user.id)

    socket =
      socket
      |> assign(:users_scenes, users_scenes)

    {:ok, socket}
  end
end
