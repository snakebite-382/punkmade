defmodule Punkmade.Scenes do
  import Ecto.Query

  use Phoenix.VerifiedRoutes,
    router: PunkmadeWeb.Router,
    endpoint: PunkmadeWeb.Endpoint,
    statics: ~w(images)

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
      left_join: c in Punkmade.Scenes.City,
      on: s.city_id == c.id,
      left_join: st in Punkmade.Scenes.State,
      on: c.state_id == st.id,
      select: %{
        scene: s,
        city: c,
        state: st
      }
    )
    |> Repo.all()
    |> Enum.map(fn entry ->
      entry.scene
      |> Map.put(:state, entry.state)
      |> Map.put(:city, entry.city)
    end)
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

  def join_scene?(user_id, scene_id) do
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

  def leave_scene(scene_id, user_id) do
    from(us in Userscene,
      where:
        us.user_id == ^user_id and
          us.scene_id == ^scene_id
    )
    |> Repo.one()
    |> case do
      nil ->
        :error

      userscene ->
        Repo.delete(userscene)
        |> case do
          {:ok, _} -> :ok
          {:error, _} -> :error
        end
    end
  end

  def search_scenes(name, city, state) do
    should_clauses =
      []
      |> add_scene_clause(name, 1.5)
      |> add_city_clause(city, 2)

    must_clauses =
      []
      |> add_state_clause(state)

    query =
      %{
        "query" => %{
          "bool" => %{
            "should" => should_clauses,
            "must" => must_clauses
          }
        }
      }

    if Enum.empty?(should_clauses) and Enum.empty?(must_clauses) do
      []
    else
      Elasticsearch.post(
        Punkmade.ElasticsearchCluster,
        "/scenes/_search",
        query
      )
      |> case do
        {:ok, result} ->
          result
          |> Map.get("hits")
          |> Map.get("hits")

        {:error, _} ->
          []
      end
    end
  end

  defp add_scene_clause(clauses, value, boost)
  defp add_scene_clause(clauses, nil, _), do: clauses
  defp add_scene_clause(clauses, "", _), do: clauses

  defp add_scene_clause(clauses, value, boost) do
    clauses ++
      [
        %{
          "match" => %{
            "name" => %{
              "query" => String.downcase(value),
              "boost" => boost
            }
          }
        }
      ]
  end

  defp add_city_clause(clauses, value, boost)

  defp add_city_clause(clauses, nil, _), do: clauses
  defp add_city_clause(clauses, "", _), do: clauses

  defp add_city_clause(clauses, value, boost) do
    clauses ++
      [
        %{
          "fuzzy" => %{
            "city_name" => %{
              "value" => String.downcase(value),
              "fuzziness" => "AUTO",
              "boost" => boost
            }
          }
        }
      ]
  end

  defp add_state_clause(clauses, value, boost \\ 1)
  defp add_state_clause(clauses, nil, _), do: clauses
  defp add_state_clause(clauses, "", _), do: clauses

  defp add_state_clause(clauses, value, boost) do
    clauses ++
      [
        %{
          "term" => %{
            "state_name" => %{
              "value" => String.downcase(value),
              "boost" => boost
            }
          }
        }
      ]
  end

  def get_scenes_from_search(results) do
    multi =
      Enum.reduce(results, Ecto.Multi.new(), fn result, multi ->
        id = Map.get(result, "_id")
        source = Map.get(result, "_source")
        score = Map.get(result, "_score")

        Ecto.Multi.run(
          multi,
          "get_scene_#{id}",
          fn _repo, _ ->
            case Repo.get(Scene, id) do
              nil ->
                {:error, "not found"}

              scene ->
                {:ok,
                 scene
                 |> Map.put(
                   :city,
                   %{
                     name:
                       Map.get(source, "city_name")
                       |> first_letter_upcase()
                   }
                 )
                 |> Map.put(
                   :state,
                   %{
                     name:
                       Map.get(source, "state_name")
                       |> String.upcase()
                   }
                 )
                 |> Map.put(:search_score, score)}
            end
          end
        )
      end)

    case Repo.transaction(multi) do
      {:ok, results} ->
        {:ok,
         Enum.map(results, fn {_key, scene} -> scene end)
         |> Enum.sort_by(& &1.search_score, :desc)}

      {:error, _, reason, _} ->
        {:error, reason}
    end
  end

  defp first_letter_upcase(string) do
    {first_letter, rest} = String.split_at(string, 1)

    String.upcase(first_letter) <> rest
  end
end
