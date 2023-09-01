import React from "react";

import {Circle, useMapEvents} from "react-leaflet";

import axios from "axios";

import { useAuth0 } from "@auth0/auth0-react";


export default function MapCircle(props) {
    const { getAccessTokenSilently } = useAuth0();

    async function getName() { // sends a request to our API to figure out the name for a preview
        let token = await getAccessTokenSilently();
        axios.get(
            process.env.REACT_APP_API_URL + `/scenes/get_locality/${props.center.join(",")}`,
            {headers: { 'Authorization': `Bearer ${token}`}}
        ).then(result => {
                props.setName(result.data + " Punk")
            }
        ).catch(e => console.error(e))
    }

    const map = useMapEvents({ // click listener for map
        async click(e) {
            props.setCenter([e.latlng.lat, e.latlng.lng])
            getName()
        }
    })

    if(props.name === "") { // if we haven't gotten a name yet, get one(so it loads the name when you load the page)
        getName();
    }

    console.log(map); // get rid of annoying warning

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