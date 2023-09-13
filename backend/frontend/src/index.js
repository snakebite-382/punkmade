// react stuff
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// pages
import Home from "./pages/home"
import Error404 from './pages/404';
import Scenes from './pages/Scenes';

//auth
import { Auth0Provider } from "@auth0/auth0-react";

//leaflet map
import 'leaflet/dist/leaflet.css';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
    errorElement: <Error404/>,
  },
  {
    path: "/scenes",
    element: <Scenes/>
  }
]);

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
      <RouterProvider router={router}/>
    </Auth0Provider>
  </React.StrictMode>
);