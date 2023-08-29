import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function LogoutButton() {
    let {logout} = useAuth0();

    let logoutParams = {
        returnTo: window.location.origin
    }

    return (
        <button 
            onClick={() => {
                logout({logoutParams: logoutParams})
            }}
        >Logout</button>
    )
}