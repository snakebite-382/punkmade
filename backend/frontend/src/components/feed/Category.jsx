import React from "react";

import { useQuery } from "@tanstack/react-query";

import { useAuth0 } from "@auth0/auth0-react";

import axios from "axios";

import CreatePostForm from "./CreatePostForm";

export default function Category(props) {
    const { getAccessTokenSilently } = useAuth0();

    async function getPosts(scene, category) {
        let token = await getAccessTokenSilently();

        let result = await axios.get(
            process.env.REACT_APP_API_URL + `/feed/get_posts/${scene}/${category}/`,
            {headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}}
        )

        return result.data
    }

    const {data: posts, isLoading, isError} = useQuery({
        queryFn: () => getPosts(props.sceneID, props.name),
        queryKey: ["posts", props.sceneID, props.name],
        enabled: props.sceneID != null,
    })



    return (
        <div className="Category">
            {isLoading || isError ? (<h1>{isError ? "ERROR" : "Loading..."}</h1> ) : // if loading or an error return an h1 with content depending on if it's an error or loading
                <> 
                    <h2 className="header">{props.name}</h2> {/* otherwise return the page */}
                    <div className="posts">{JSON.stringify(posts)}</div>
                </>
            } 
            {/* this allows us to always show the form and conditionally render the rest */}
            <CreatePostForm sceneID={props.sceneID} categoryName={props.name}/>
        </div>
    )
}