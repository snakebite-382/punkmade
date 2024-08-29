defmodule Punkmade.Elasticsearch.Client do
  use Elasticsearch.Cluster, otp_app: :punkmade

  def config do
    [json_library: Jason]
  end
end
