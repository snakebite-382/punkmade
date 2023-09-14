import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function NavBar() {
    return (
        <> 
        <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create_scene">Create Scene</Link></li>
            <li><Link to="/feed">Feed</Link></li>
        </ul>
        <Outlet/>
        </>
    );
}