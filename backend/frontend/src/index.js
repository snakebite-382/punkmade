// react stuff
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// pages
import Home from "./pages/home"
import Error404 from './pages/404';
import CreateScene from './pages/CreateScene';
import Feed from './pages/Feed';

//nav
import NavBar from "./components/navigation/navbar";

//auth
import { Auth0Provider } from "@auth0/auth0-react";

//query
import { QueryClient, QueryClientProvider} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

//leaflet map
import 'leaflet/dist/leaflet.css';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBar/>,
    errorElement: <Error404/>,
    children: [
      {
        path: "/",
        element: <Home/>,
        
      },
      {
        path: "/create_scene",
        element: <CreateScene/>
      },
      {
        path: "/feed",
        element: <Feed/>
      }
    ]
  }
]);


const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="punkmade.us.auth0.com"
      clientId="Pw8TzxKzHXe7GqQdty1jKnz7nkmXFtGe"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://punkmade.us.auth0.com/api/v2/",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
        {process.env.REACT_APP_ENVIRONMENT === "dev" ? <ReactQueryDevtools/>: <></> }
      </QueryClientProvider>
    </Auth0Provider>
  </React.StrictMode>
);