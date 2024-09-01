defmodule Punkmade.Repo.Migrations.Posts do
  use Ecto.Migration

  def change do
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
  end
end
