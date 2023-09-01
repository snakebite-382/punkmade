import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton() {
    let { loginWithPopup } = useAuth0();

    return (
        <button onClick={loginWithPopup}>Login</button>
    )
}