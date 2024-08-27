defmodule :"Elixir.Punkmade.Repo.Migrations.Initialize-schema" do
  use Ecto.Migration

  def change do
    execute "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""

    create table("states") do
      add :name, :string, size: 2, null: false

      timestamps()
    end

    create unique_index("states", [:name])

    create table("cities") do
      add :name, :string, null: false
      add :state_id, references("states", on_delete: :delete_all), null: false

      timestamps()
    end

    create unique_index("cities", [:name, :state_id])

    create table("scenes") do
      add :name, :string, size: 128, null: false
      add :city_id, references("cities", on_delete: :delete_all), null: false
      add :mascot_url, :string, null: false

      timestamps()
    end

    create unique_index("scenes", [:name, :city_id])

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

    create table("posts") do
      add :user_id, references("users", on_delete: :delete_all, type: :uuid), null: false
      add :scene_id, references("scenes", on_delete: :delete_all), null: false
      add :title, :string, size: 128, null: false

      timestamps()
    end

    create index("posts", [:scene_id, :title])

    create table("textpanes") do
      add :post_id, references("posts", on_delete: :delete_all), null: false
      add :content, :string, size: 4096, null: false

      timestamps()
    end

    create index("textpanes", [:post_id])

    create table("videopanes") do
      add :post_id, references("posts", on_delete: :delete_all), null: false
      add :media_url, :string, null: false

      timestamps()
    end

    create index("videopanes", [:post_id])

    create table("imagepanes") do
      add :post_id, references("posts", on_delete: :delete_all), null: false
      add :media_url, :string, null: false

      timestamps()
    end

    create index("imagepanes", [:post_id])

    create table("tags") do
      add :content, :string, size: 16, null: false
      add :scene_id, references("scenes", on_delete: :delete_all), null: false

      timestamps()
    end

    create table("posttags") do
      add :post_id, references("posts", on_delete: :delete_all), null: false
      add :tag_id, references("tags", on_delete: :delete_all), null: false

      timestamps()
    end

    create index("posttags", [:post_id])

    create table("comments") do
      add :content, :string, size: 512, null: false
      add :user_id, references("users", on_delete: :delete_all, type: :uuid), null: false
      add :post_id, references("posts", on_delete: :delete_all), null: false

      timestamps()
    end

    create index("comments", [:post_id])

    create table("postsaves") do
      add :post_id, references("posts", on_delete: :delete_all), null: false
      add :user_id, references("users", on_delete: :delete_all, type: :uuid), null: false

      timestamps()
    end

    create index("postsaves", [:post_id])
    create index("postsaves", [:user_id])

    create table("commentsaves") do
      add :comment_id, references("comments", on_delete: :delete_all), null: false
      add :user_id, references("users", on_delete: :delete_all, type: :uuid), null: false

      timestamps()
    end

    create index("commentsaves", [:comment_id])
    create index("commentsaves", [:user_id])

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
