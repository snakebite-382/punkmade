defmodule Punkmade.Posts.Textpane do
  use Ecto.Schema
  import Ecto.Changeset
  
  schema "textpanes" do
    field :post_id, :integer
    field :content, :string

    timestamps(type: :utc_datetime)
  end
  
  def create(textpane, attrs) do
    textpane
    |> cast(attrs, [:post_id, :content])
    |> validate_required([:post_id, :content])
    |> validate_length(:content, min: 128, max: 4096)
  end
end
