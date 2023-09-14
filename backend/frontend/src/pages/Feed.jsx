import React, {useState} from "react";
import { withAuthenticationRequired, useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import DefaultLoading from "../components/loading/defaultLoading"

import axios from "axios";

import Category from "../components/feed/Category";

export default withAuthenticationRequired(function Feed() {
    let { user, getAccessTokenSilently} = useAuth0();

    const [currentScene, setCurrentScene] = useState({})
    const [currentCategory, setCurrentCategory] = useState({})

    async function getFeedInitData() {
        let token = await getAccessTokenSilently();

        let result = await axios.get(
            process.env.REACT_APP_API_URL + `/feed/get_feed_init_data/${user.sub}`,
            {headers: { 'Authorization': `Bearer ${token}`}} 
        )

        return result.data
    }

    const {isError, isLoading, error} = useQuery({
        queryFn: () => getFeedInitData(),
        queryKey: ["init_data"],
        onSuccess: (result) => {
            console.log(result)
            setScene(result.app_metadata.preferredScene, result.scenes);
        }
    })

    function setScene(id, list) {
        list.forEach(scene => {
            if(scene._id === id) {
                setCurrentScene(scene)
                setCurrentCategory("general") //whenever we switch immediately go to general
            }
        })
    }

    if(isError) {
        console.error(error);
    }

    if(isLoading) {
        return (
            <DefaultLoading/>
        )
    }

    return (
        <div className="Feed">
            <h1>{currentScene.name}</h1>
            <Category sceneID={currentScene._id} name={currentCategory}/>
        </div>
    )
})