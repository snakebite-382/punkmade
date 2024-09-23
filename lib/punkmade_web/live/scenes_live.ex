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
      |> assign(:search_results, [])
      |> assign(:raw_search_results, [])

    {:ok, socket}
  end

  def handle_event("validate_scene", params, socket) do
    scene_validation_results = Scenes.validate_form(params)

    scene_form =
      scene_validation_results
      |> to_form()
      |> Map.put(:errors, Map.get(scene_validation_results, "errors"))

    %{"city_name" => city_name, "scene_name" => name, "state_name" => state_name} = params

    {search_results, raw_search_results} =
      Scenes.search_scenes(name, city_name, state_name)
      |> Scenes.get_scenes_from_search()
      |> case do
        {:ok, scenes} ->
          my_scenes = socket.assigns.my_scenes
          {search_results, _} = diff_lists(scenes, my_scenes)

          {search_results, scenes}

        {:error, _} ->
          {[], []}
      end

    {:noreply,
     socket
     |> assign(:scene_form, scene_form)
     |> assign(
       :search_results,
       search_results
     )
     |> assign(
       :raw_search_results,
       raw_search_results
     )}
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

        my_scenes = Scenes.get_users_scenes(socket.assigns.my_user.id)

        {:noreply,
         socket
         |> put_flash(:info, "Scene successfully created!")
         |> put_flash(join_message_type, join_message)
         |> assign(:scene_form, form)
         |> assign(:my_scenes, my_scenes)}
    end
  end

  def handle_event("leave_scene", %{"id" => id}, socket) do
    case(Scenes.leave_scene(id, socket.assigns.my_user.id)) do
      :ok ->
        my_scenes =
          socket.assigns.my_scenes
          |> Enum.reject(fn scene -> to_string(scene.id) == id end)

        {search_results, _} = diff_lists(socket.assigns.raw_search_results, my_scenes)

        {:noreply,
         socket
         |> put_flash(:info, "Left successfully!")
         |> assign(:my_scenes, my_scenes)
         |> assign(:search_results, search_results)}

      :error ->
        {:noreply,
         socket
         |> put_flash(:error, "Couldn't leave scene, try refreshing the page and trying again.'")}
    end
  end

  def handle_event("join_scene", %{"id" => id}, socket) do
    Scenes.join_scene?(socket.assigns.my_user.id, id)
    |> if do
      my_scenes = Scenes.get_users_scenes(socket.assigns.my_user.id)

      {search_results, my_scenes} = diff_lists(socket.assigns.search_results, my_scenes)

      {:noreply,
       socket
       |> put_flash(:info, "Joined successfully!")
       |> assign(:my_scenes, my_scenes)
       |> assign(:search_results, search_results)}
    else
      {:noreply, socket |> put_flash(:error, "Could not join scene")}
    end
  end

  defp diff_lists(search_results, my_scenes) do
    my_scene_ids = Enum.map(my_scenes, & &1.id)

    search_results =
      Enum.reject(
        search_results,
        fn scene ->
          scene.id in my_scene_ids
        end
      )

    {search_results, my_scenes}
  end
end
