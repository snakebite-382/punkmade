defmodule Punkmade.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "users" do
    field :username, :string
    field :email, :string
    field :profile_picture_url, :string
    field :gravatar_hash, :string
    field :pronoun_subjective, :string
    field :pronoun_objective, :string
    field :pronoun_possesive, :string
    field :bio, :string

    timestamps(type: :utc_datetime)
  end

  def create(user, attrs) do
    user
    |> cast(attrs, [
      :username,
      :email,
      :pronoun_subjective,
      :pronoun_objective,
      :pronoun_possesive,
      :bio
    ])
    |> validate_required([
      :username,
      :email,
      :pronoun_subjective,
      :pronoun_objective,
      :pronoun_possesive,
      :bio
    ])
    |> validate_username()
    |> validate_email()
    |> validate_pronouns()
    |> validate_bio()
  end

  def change_username(user, attrs \\ %{}) do
    user 
    |> cast(attrs, [:username])
    |> validate_required(:username)
    |> validate_username()
  end

  def change_bio(user, attrs \\ %{}) do
    user
    |> cast(attrs, [:bio])
    |> validate_required(:bio)
    |> validate_bio()
  end

  defp validate_username(changeset) do
    changeset
    |> unsafe_validate_unique(:username, Punkmade.Repo)
    |> unique_constraint(:username)
    |> validate_length(:username, min: 4, max: 16)
  end

  defp validate_email(changeset) do
    changeset
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> validate_length(:email, max: 160)
    |> unsafe_validate_unique(:email, Punkmade.Repo)
    |> add_gravatar()
  end

  defp add_gravatar(changeset) do
    email = get_change(changeset, :email)

    if email do
      hash =
        :crypto.hash(:sha256, email |> String.trim() |> String.downcase())
        |> Base.encode16(case: :lower)

      changeset
      |> put_change(:gravatar_hash, hash)
    else
      changeset
    end
  end

  defp validate_pronouns(changeset) do
    changeset
    |> validate_pronoun(:pronoun_possesive)
    |> validate_pronoun(:pronoun_objective)
    |> validate_pronoun(:pronoun_subjective)
  end

  defp validate_pronoun(changeset, pronoun_atom) do
    changeset
    |> validate_length(pronoun_atom, min: 2, max: 16)
    |> validate_format(pronoun_atom, ~r/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/,
      message: "must contain letters (accents are fine) only"
    )
  end

  defp validate_bio(changeset) do
    changeset
    |> validate_length(:bio, min: 4, max: 2048)
  end
end
