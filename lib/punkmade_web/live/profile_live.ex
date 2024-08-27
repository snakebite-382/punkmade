defmodule PunkmadeWeb.ProfileLive do
  alias Punkmade.Accounts.User
  use PunkmadeWeb, :live_view
  alias Punkmade.Accounts

  def mount(params, _session, socket) do
    %{"uuid" => uuid} = params

    user = Accounts.get_user_by_uuid(uuid)
    # TODO: Redirect to a 404 if user is not found

    oauth_users =
      Accounts.get_oauth_providers_by_uuid(uuid)
      |> Enum.map(fn el -> el.provider end)

    socket =
      socket
      |> assign(:user, user)
      |> assign(:oauth_users, oauth_users)
      |> assign(:new_user, Map.get(params, "new_user", false))
      |> assign(:new_oauth, Map.get(params, "new_oauth", false))
      |> assign(:is_me, uuid == socket.assigns.my_user.id)

    if socket.assigns.is_me do
      username_changeset = User.change_username(socket.assigns.my_user)
      bio_changeset = User.change_bio(socket.assigns.my_user)

      socket =
        socket
        |> assign(:username_form, to_form(username_changeset))
        |> assign(:bio_form, to_form(bio_changeset))

      {:ok, socket}
    else
      {:ok, socket}
    end
  end
end
