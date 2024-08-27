defmodule PunkmadeWeb.Router do
  use PunkmadeWeb, :router

  import PunkmadeWeb.UserAuth

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {PunkmadeWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :authenticate
    plug :get_my_user
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :home do
    plug :redirect_to_feed
  end

  scope "/", PunkmadeWeb do
    pipe_through :browser

    get "/oauth/callback/:provider", AuthController, :callback
    get "/sign_in/failure", AuthController, :failure
    get "/sign_out", AuthController, :sign_out

    live_session :unauthed,
      on_mount: [
        {PunkmadeWeb.UserAuth, :redirect_if_authed},
        {PunkmadeWeb.UserAuth, :mount_auth_state}
      ] do
      live "/sign_in", SignInLive
    end

    live_session :authed,
      on_mount: [
        {PunkmadeWeb.UserAuth, :redirect_if_not_authed},
        {PunkmadeWeb.UserAuth, :mount_auth_state}
      ] do
      live "/users/:uuid", ProfileLive
      live "/feed", FeedLive
      live "/scenes", ScenesLive
    end
  end

  scope "/", PunkmadeWeb do
    pipe_through :browser
    pipe_through :home

    get "/", PageController, :home

  end

  # Other scopes may use custom stacks.
  # scope "/api", PunkmadeWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:punkmade, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: PunkmadeWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
