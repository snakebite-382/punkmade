defmodule Punkmade.Scenes.State do
  use Ecto.Schema
  import Ecto.Changeset

  # Alabama
  @states [
    "AL",
    # Alaska
    "AK",
    # Arizona
    "AZ",
    # Arkansas
    "AR",
    # California
    "CA",
    # Colorado
    "CO",
    # Connecticut
    "CT",
    # Delaware
    "DE",
    # Florida
    "FL",
    # Georgia
    "GA",
    # Hawaii
    "HI",
    # Idaho
    "ID",
    # Illinois
    "IL",
    # Indiana
    "IN",
    # Iowa
    "IA",
    # Kansas
    "KS",
    # Kentucky
    "KY",
    # Louisiana
    "LA",
    # Maine
    "ME",
    # Maryland
    "MD",
    # Massachusetts
    "MA",
    # Michigan
    "MI",
    # Minnesota
    "MN",
    # Mississippi
    "MS",
    # Missouri
    "MO",
    # Montana
    "MT",
    # Nebraska
    "NE",
    # Nevada
    "NV",
    # New Hampshire
    "NH",
    # New Jersey
    "NJ",
    # New Mexico
    "NM",
    # New York
    "NY",
    # North Carolina
    "NC",
    # North Dakota
    "ND",
    # Ohio
    "OH",
    # Oklahoma
    "OK",
    # Oregon
    "OR",
    # Pennsylvania
    "PA",
    # Rhode Island
    "RI",
    # South Carolina
    "SC",
    # South Dakota
    "SD",
    # Tennessee
    "TN",
    # Texas
    "TX",
    # Utah
    "UT",
    # Vermont
    "VT",
    # Virginia
    "VA",
    # Washington
    "WA",
    # West Virginia
    "WV",
    # Wisconsin
    "WI",
    # Wyoming
    "WY"
  ]

  schema "states" do
    field :name, :string
    timestamps(type: :utc_datetime)
  end

  @doc """
  returns a validated changeset based on the state and attrs passed
  """
  def create(state, attrs) do
    state
    |> cast(attrs, [:name])
    |> validate_name()
  end

  defp validate_name(changeset) do
    changeset
    |> validate_inclusion(:name, @states)
    |> validate_required(:name)
    |> validate_length(:name, is: 2)
    |> unsafe_validate_unique(:name, Punkmade.Repo)
    |> unique_constraint(:name)
  end
end
