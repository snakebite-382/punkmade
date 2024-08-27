defmodule Punkmade.Scenes.City do
  use Ecto.Schema
  import Ecto.Changeset
  @apikey System.get_env("GOOGLE_API_KEY")
  @apiurl "https://maps.googleapis.com/maps/api/place/textsearch/json"

  schema "cities" do
    field :name, :string
    field :state_id, :integer
    timestamps(type: :utc_datetime)
  end

  def create(city, attrs, state) do
    city
    |> cast(attrs, [:name, :state_id])
    |> validate_required([:name, :state_id])
    |> validate_city(state)
  end

  defp validate_city(changeset, state) do
    city =
      case fetch_change(changeset, :name) do
        {:ok, city} -> city
        :error -> nil
      end

    if is_nil(city) do
      add_error(changeset, :city, "NO CITY")
    else
      if city_exists?(city, state) do
        changeset
      else
        add_error(changeset, :city, "City does not exist")
      end
    end
  end

  def city_exists?(city, state) do
    query = "#{city}, #{state}"
    url = "#{@apiurl}?query=#{URI.encode(query)}&key=#{@apikey}"

    case HTTPoison.get(url) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} -> parse_response(body, city)
      {:ok, %HTTPoison.Response{status_code: 404}} -> {:error, "NOT FOUND"}
      {:error, reason} -> {:error, reason}
    end
  end

  def parse_response(body, city) do
    case Jason.decode(body) do
      {:ok, %{"results" => results}} when length(results) != [] ->
        IO.inspect(results)
        result = Enum.at(results, 0)
        types = Map.get(result, "types")

        if String.downcase(Map.get(result, "name")) == String.downcase(city) and
             Enum.member?(types, "locality") and
             Enum.member?(types, "political") do
          true
        else
          false
        end

      {:ok, _} ->
        false

      {:error, reason} ->
        {:error, reason}
    end
  end
end
