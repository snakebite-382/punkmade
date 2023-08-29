import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./loginButton";
import LogoutButton from "./logoutButton";

export default function AuthButton() {
    let {isAuthenticated} = useAuth0();

    if(isAuthenticated) {
        return <LogoutButton/>
    }

    return <LoginButton/>
}