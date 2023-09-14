import React from "react";

import {Circle, useMapEvents} from "react-leaflet";

import axios from "axios";

import { useAuth0 } from "@auth0/auth0-react";

import { useQuery, useQueryClient } from "@tanstack/react-query";


export default function MapCircle(props) {
    const { getAccessTokenSilently } = useAuth0();

    async function getName(location) { // sends a request to our API to figure out the name for a preview
        let token = await getAccessTokenSilently();
        let res = await axios.get(
            process.env.REACT_APP_API_URL + `/scenes/get_locality/${location}`,
            {headers: { 'Authorization': `Bearer ${token}`}}
        );
        props.setName(res.data + " Punk");
        return res.data
    }

    const {isLoading, isError, error}= useQuery({
        queryFn: () => {return getName(props.center.join(","))},
        queryKey: ["scene_name", props.center.join(",")]
    })
    let queryClient = useQueryClient();

    useMapEvents({ // click listener for map
        async click(e) {
            props.setCenter([e.latlng.lat, e.latlng.lng])
            queryClient.invalidateQueries({queryKey: ["scene_name"]})
        }
    })

    if(isLoading) {
        props.setName("Loading...");
    }

    if(isError) {
        props.setName("ERROR")
        console.error(error)
    }

    return (
        <>
        <Circle // outer circle
            center={props.center}
            radius={props.radius}
        />
        <Circle // center circle
            center={props.center}
            radius={50}
            color="red"
        />
        </>
    )
}