defmodule Punkmade.Repo.Migrations.Users do
  use Ecto.Migration

  def change do
    execute "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""

    create table("users", primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :username, :string, size: 16
      add :email, :string, null: false
      add :profile_picture_url, :string
      add :gravatar_hash, :string, null: false
      add :pronoun_subjective, :string, size: 16
      add :pronoun_objective, :string, size: 16
      add :pronoun_possesive, :string, size: 16
      add :bio, :string, size: 2048

      timestamps()
    end

    create unique_index("users", [:username])
    create unique_index("users", [:email])

    create table("oauthusers") do
      add :provider, :string, null: false
      add :user_id, references("users", on_delete: :delete_all, type: :uuid), null: false
      add :provider_user_id, :string, null: false

      timestamps()
    end

    create unique_index("oauthusers", [:provider, :user_id])

    create table("sessions") do
      add :oauth_user_id, references("oauthusers", on_delete: :delete_all), null: false
      add :user_id, references("users", on_delete: :delete_all, type: :uuid), null: false
      add :access_token, :string, null: false
      add :refresh_token, :string, null: false
      add :token_expiry, :utc_datetime, null: false

      timestamps()
    end

    create index("sessions", [:user_id])
    create index("sessions", [:access_token])

    create table("relationships") do
      add :user_id, references("users", on_delete: :delete_all, type: :uuid), null: false
      add :other_user_id, references("users", on_delete: :delete_all, type: :uuid), null: false
      add :standing, :string, null: false

      timestamps()
    end

    create unique_index("relationships", [:user_id, :standing])

    create table("userscenes") do
      add :user_id, references("users", on_delete: :delete_all, type: :uuid), null: false
      add :scene_id, references("scenes", on_delete: :delete_all), null: false
      timestamps()
    end

    create unique_index("userscenes", [:user_id, :scene_id])
  end
end
