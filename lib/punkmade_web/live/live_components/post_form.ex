defmodule PunkmadeWeb.LiveComponents.PostForm do
  use Phoenix.LiveComponent
  alias PunkmadeWeb.CoreComponents
  alias Punkmade.Posts.Post
  import CoreComponents

  def render(assigns) do
    ~H"""
    <div id="post-form">
      <.simple_form for={@post_form} phx-change="post_change">
        <.input field={@post_form[:title]} label="Title" />
      </.simple_form>

      <form phx-submit="add_pane" phx-change="pane_change_selection" phx-target={@myself}>
        <label for="pane_type">Add pane: </label>
        <select name="pane_type" id="pane-type-select">
          <%= for type <- @pane_types do %>
            <option value={type} selected={type == @pane_type}>
              <%= Atom.to_string(type) %>
            </option>
          <% end %>
        </select>
        <.button>
          <.icon name="hero-plus" />
        </.button>
      </form>

      <div id="panes">
        <ul class="flex flex-row">
          <%= for {pane, index} <- @panes do %>
            <li
              id={"pane-#{index}"}
              class={
                if index == @current_index do
                  "bg-green-50"
                else
                  "bg-red-50"
                end
              }
              phx-click="select_pane"
              phx-value-id={index}
              phx-target={@myself}
            >
              <%= pane.type %>:
              <%= case pane.type do %>
                <% :text -> %>
                  <div class="pane-preview">
                    <%= pane.content %>
                  </div>
                <% _ -> %>
                  invalid
              <% end %>
            </li>
          <% end %>
        </ul>
      </div>

      <div id="edit-pane">
        <%= if @current_index != -1 do %>
          <.simple_form for={@pane_form} phx-change="pane_change" phx-target={@myself}>
            <%= case @current_pane.type do %>
              <% :text -> %>
                <.input field={@pane_form[:content]} label="Content" type="textarea" />
              <% _ -> %>
                invalid
            <% end %>
          </.simple_form>
        <% end %>
      </div>
    </div>
    """
  end

  def update(_assigns, socket) do
    post_form = to_form(Post.form(%Post{}, %{}))
    pane_form = to_form(%{"type" => :text, "content" => nil})
    pane_types = [:text, :image, :video]
    # pane_types = [:text]
    panes = Enum.with_index([%{type: :text, content: "1"}, %{type: :text, content: "2"}])
    {current_pane, current_index} = get_current_pane(panes, 0)

    socket =
      socket
      |> assign(:post_form, post_form)
      |> assign(:pane_form, pane_form)
      |> assign(:pane_types, pane_types)
      |> assign(:pane_type, :text)
      |> assign(:panes, panes)
      |> assign(:current_pane, current_pane)
      |> assign(:current_index, current_index)

    {:ok, socket}
  end

  defp get_current_pane(panes, index) do
    case Enum.fetch(panes, index) do
      {:ok, {pane, _}} -> {pane, index}
      :error -> {nil, -1}
    end
  end

  def handle_event("add_pane", _params, socket) do
    new_index =
      case Enum.take(socket.assigns.panes, -1) do
        [{_, last_index}] -> last_index + 1
        [] -> 0
      end

    new_pane =
      case socket.assigns.pane_type do
        :text -> %{type: :text, content: ""}
        _ -> raise("Invalid new pane type (this should not be possible)")
      end

    new_form =
      %{"type" => new_pane.type, "content" => new_pane.content}
      |> to_form()

    panes = socket.assigns.panes ++ [{new_pane, new_index}]

    {:noreply,
     socket
     |> assign(:panes, panes)
     |> assign(:current_pane, new_pane)
     |> assign(:current_index, new_index)
     |> assign(:pane_form, new_form)}
  end

  def handle_event("select_pane", params, socket) do
    %{"id" => id} = params
    id = String.to_integer(id)
    {selection, _} = Enum.at(socket.assigns.panes, id)

    new_form =
      %{"type" => selection.type, "content" => selection.content}
      |> to_form()

    {:noreply,
     socket
     |> assign(:current_pane, selection)
     |> assign(:current_index, id)
     |> assign(:pane_form, new_form)}
  end

  def handle_event("pane_change_selection", params, socket) do
    %{"pane_type" => value} = params
    new_value = String.to_atom(value)

    if Enum.member?(socket.assigns.pane_types, new_value) do
      {:noreply, socket |> assign(:pane_type, new_value)}
    else
      {:noreply, socket}
    end
  end

  def handle_event("pane_change", _params, socket) do
    {:noreply, socket}
  end
end
