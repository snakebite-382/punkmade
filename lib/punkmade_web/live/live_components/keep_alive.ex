defmodule PunkmadeWeb.LiveComponent.KeepAlive do
  use Phoenix.LiveComponent
  alias PunkmadeWeb.UserAuth

  def render(assigns) do
    ~H"""
    <div phx-hook="KeepAlive" id="keep-alive"></div>
    """
  end

  def update(%{session_id: session_id}, socket) do
    {:ok, socket |> assign(session_id: session_id)}
  end

  def handle_event("user_activity_report", params, socket) do
    UserAuth.handle_activity_report(
      params,
      socket.assigns.session_id
    )
    |> case do
      :invalid ->
        {:noreply, redirect(socket, to: "/sign_out")}

      :refreshed ->
        IO.puts("Token refreshed for session id #{socket.assigns.session_id}")

        {:noreply,
         socket
         |> push_event("session_refresh", %{})}

      :idle ->
        IO.puts("User is idle")
        {:noreply, socket}

      :active ->
        IO.puts("User is active")
        {:noreply, socket}
    end
  end
end
