defmodule Punkmade.Scenes do
  import Ecto.Query
  alias Punkmade.Repo

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
end
