defmodule Punkmade.ElasticsearchCluster do
  use Elasticsearch.Cluster, otp_app: :punkmade
end
