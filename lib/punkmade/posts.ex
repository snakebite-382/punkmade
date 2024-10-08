defmodule Punkmade.Posts do
  alias Punkmade.Posts.Videopane
  alias Punkmade.Posts.Imagepane
  alias Punkmade.Posts.Post
  alias Ecto.Multi
  alias Punkmade.Repo
  alias Punkmade.Posts.Textpane

  def create_post(user_id, scene_id, title, panes) do
    multi =
      Multi.new()
      |> Multi.insert(
        :post,
        Post.create(%Post{}, %{
          user_id: user_id,
          scene_id: scene_id,
          title: title
        })
      )

    Enum.with_index(panes)
    |> Enum.reduce(multi, fn multi, {pane, index} ->
      Multi.run(multi, {:pane, index}, fn _repo, changes ->
        post = Map.get(changes, :post)

        attrs = %{
          post_id: post.id,
          content: Map.get(pane, :content)
        }

        case Map.get(pane, :type) do
          :text ->
            Textpane.create(%Textpane{}, attrs)
            |> Repo.insert()

          :image ->
            Imagepane.create(%Imagepane{}, attrs)
            |> Repo.insert()

          :video ->
            Videopane.create(%Videopane{}, attrs)
            |> Repo.insert()

          _ ->
            {:error, "invalid pane type"}
        end
      end)
    end)
    |> Repo.transaction()
  end
end

# defmodule Punkmade.Postable do
#   defstruct type: :postable, content: nil, interactions: %{}, author: %{}, parent_id: -1
# end
#
defmodule Punkmade.Posts.Pane do
  import Ecto.Changeset

  defstruct type: :pane, post_id: -1, content: nil

  def form(pane, attrs) do
    changset =
      pane
      |> cast(attrs, [:type, :content])
      |> validate_required([:type, :post_id, :content])
      |> validate_inclusion(:type, [:text, :image, :video])

    changset
    |> validate_content(get_change(changset, :type))
  end

  defp validate_content(changeset, :text) do
    changeset
    |> validate_length(:content, min: 128, max: 4096)
  end

  defp validate_content(changeset, _) do
    changeset
    |> add_error(:type, "Invalid Type")
  end
end
