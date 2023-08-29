import React from "react";
//auth
import { useAuth0 } from "@auth0/auth0-react";
import AuthButton from "../components/auth/authButton";

//loading
import DefaultLoading from "../components/loading/defaultLoading";

export default function Home () {
    const {user, isLoading, isAuthenticated} = useAuth0();

    let bannerMessage = isAuthenticated ? "Welcome back " + user.name : "Hello!";
    
    if(isLoading) {
        return (
            <DefaultLoading/>
        )
    }

    return(
        <div className="app">
            <h1>{bannerMessage}</h1>
            <AuthButton/>
        </div>
    )
}