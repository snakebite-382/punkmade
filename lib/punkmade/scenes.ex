defmodule Punkmade.Scenes do
  import Ecto.Query

  use Phoenix.VerifiedRoutes,
    router: PunkmadeWeb.Router,
    endpoint: PunkmadeWeb.Endpoint,
    statics: ~w(images)

  alias Hex.API.User
  alias Punkmade.Accounts.Userscene
  alias Hex.State
  alias Hex.State
  alias Punkmade.Repo
  alias Punkmade.Scenes.State
  alias Punkmade.Scenes.City
  alias Punkmade.Scenes.Scene

  def get_users_scenes(user_id) do
    from(u in Punkmade.Accounts.Userscene,
      where: u.user_id == ^user_id,
      join: s in Punkmade.Scenes.Scene,
      on: s.id == u.scene_id,
      select: %{
        scene: s
      }
    )
    |> Repo.all()
  end

  def create_scene_from_form(form, user) do
    state_name = Map.get(form, "state_name")
    city_name = Map.get(form, "city_name")
    scene_name = Map.get(form, "scene_name")

    {form, scene} =
      form
      |> Map.put("errors", [])
      |> add_state(state_name)
      |> add_city(city_name)
      |> add_scene(scene_name)

    joined =
      if not is_atom(scene) do
        Elasticsearch.put_document(Punkmade.ElasticsearchCluster, scene, "scenes")
        join_scene?(user.id, scene.id)
      else
        false
      end

    {form, scene, joined}
  end

  defp join_scene?(user_id, scene_id) do
    Userscene.create(%Userscene{}, %{user_id: user_id, scene_id: scene_id})
    |> Repo.insert()
    |> case do
      {:ok, _} -> true
      {:error, _} -> false
    end
  end

  defp add_state(form, name) do
    state =
      from(s in State, where: s.name == ^name)
      |> Repo.one()

    if is_nil(state) do
      State.create(%State{}, %{name: name})
      |> Repo.insert()
      |> case do
        {:ok, state} ->
          {form, {state, false}}

        {:error, changeset} ->
          error =
            changeset
            |> Map.get(:errors)
            |> Keyword.get(:name)

          errors =
            form
            |> Map.get("errors", [])
            |> attach_error(:state_name, error)

          form =
            form
            |> Map.put("errors", errors)

          {form, {nil, nil}}
      end
    else
      {form, {state, true}}
    end
  end

  defp add_city({form, {state, state_exists}}, name) when not is_nil(state) do
    city =
      from(c in City, where: c.name == ^name)
      |> Repo.one()

    if is_nil(city) do
      City.create(%City{}, %{name: name, state_id: state.id}, state.name)
      |> Repo.insert()
      |> case do
        {:ok, city} ->
          {form, {state, state_exists}, {city, false}}

        {:error, changeset} ->
          error =
            changeset
            |> Map.get(:errors)
            |> Keyword.get(:name)

          errors =
            form
            |> Map.get("errors", [])
            |> attach_error(:city_name, error)

          form =
            form
            |> Map.put("errors", errors)

          if not state_exists do
            state
            |> Repo.delete(allow_stale: true)
          end

          {form, {state, state_exists}, {nil, nil}}
      end
    else
      {form, {state, state_exists}, {city, true}}
    end
  end

  defp add_city({form, {state, _exists}}, _name) when is_nil(state) do
    {form, nil, nil}
  end

  defp add_scene({form, {state, _state_exists}, {city, _city_exists}}, _name)
       when is_nil(state) or is_nil(city) do
    {form, :error}
  end

  defp add_scene({form, {state, state_exists}, {city, city_exists}}, name)
       when not is_nil(state) and not is_nil(city) do
    Scene.create(%Scene{}, %{
      name: name,
      city_id: city.id,
      mascot_url: ~p"/images/micheal_cera.webp"
    })
    |> Repo.insert()
    |> case do
      {:ok, scene} ->
        {form, scene}

      {:error, changeset} ->
        error =
          changeset
          |> Map.get(:errors)
          |> Keyword.get(:name)

        errors =
          form
          |> Map.get("errors", [])
          |> attach_error(:scene_name, error)

        form =
          form
          |> Map.put("errors", errors)

        if not state_exists do
          state
          |> Repo.delete(allow_stale: true)
        end

        if not city_exists do
          city
          |> Repo.delete(allow_stale: true)
        end

        {form, :error}
    end
  end

  def validate_form(form) do
    state_name = Map.get(form, "state_name")
    city_name = Map.get(form, "city_name")
    scene_name = Map.get(form, "scene_name")

    state_error =
      from(s in State, where: s.name == ^state_name)
      |> Repo.one()
      |> is_nil()
      |> if do
        State.create(%State{}, %{name: state_name})
        |> Map.get(:errors)
        |> Keyword.get(:name)
      else
        nil
      end

    city_error =
      from(c in City, where: c.name == ^city_name)
      |> Repo.one()
      |> is_nil()
      |> if do
        City.create(%City{}, %{name: city_name}, state_name)
        |> Map.get(:errors)
        |> Keyword.get(:name)
      else
        nil
      end

    scene_error =
      Scene.create(%Scene{}, %{name: scene_name})
      |> Map.get(:errors)
      |> Keyword.get(:name)

    errors =
      []
      |> attach_error(:state_name, state_error)
      |> attach_error(:city_name, city_error)
      |> attach_error(:scene_name, scene_error)

    form
    |> Map.put("errors", errors)
  end

  defp attach_error(errors, error_name, error) do
    if is_nil(error) do
      errors
    else
      [{error_name, error} | errors]
    end
  end
end
