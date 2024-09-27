defmodule Punkmade.ElasticseachStore do
  @behaviour Elasticsearch.Store

  alias Punkmade.Repo

  @impl true
  def stream(schema) do
    Repo.stream(schema)
  end

  @impl true
  def transaction(func) do
    {:ok, result} = Repo.transaction(func, timeout: :infinity)
    result
  end
end
