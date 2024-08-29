defmodule PunkmadeWeb.ScenesLive do
  alias Punkmade.Scenes
  use PunkmadeWeb, :live_view

  @scene_form_default %{
    "state_name" => "",
    "city_name" => "",
    "scene_name" => "",
    "errors" => []
  }

  def mount(_params, _session, socket) do
    users_scenes = Scenes.get_users_scenes(socket.assigns.my_user.id)

    socket =
      socket
      |> assign(:my_scenes, users_scenes)
      |> assign(:scene_form, to_form(@scene_form_default))

    {:ok, socket}
  end

  def handle_event("validate_scene", params, socket) do
    scene_validation_results = Scenes.validate_form(params)

    scene_form =
      scene_validation_results
      |> to_form()
      |> Map.put(:errors, Map.get(scene_validation_results, "errors"))

    {:noreply, socket |> assign(:scene_form, scene_form)}
  end

  def handle_event("create_scene", params, socket) do
    Scenes.create_scene_from_form(params, socket.assigns.my_user)
    |> case do
      {form, :error, _joined} ->
        form =
          form
          |> to_form()
          |> Map.put(:errors, Map.get(form, "errors"))

        {:noreply,
         socket
         |> put_flash(:error, "Error creating scene")
         |> assign(:scene_form, form)}

      {form, _scene, joined} ->
        form =
          form
          |> to_form()
          |> Map.put(:errors, Map.get(form, "errors"))

        {join_message_type, join_message} =
          if joined do
            {:info, "Scene successfully joined!"}
          else
            {:error, "Failed to join scene, try again manaully"}
          end

        {:noreply,
         socket
         |> put_flash(:info, "Scene successfully created!")
         |> put_flash(join_message_type, join_message)
         |> assign(:scene_form, form)}
    end
  end
end
