// react stuff
import React, { useState } from "react";

//auth and API protection
import { withAuthenticationRequired } from "@auth0/auth0-react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

// form stuff
import { Formik, Field, Form, ErrorMessage } from 'formik';
// import * as Yup from "yup";

// Maps (yay this hopefully won't be hell)
import { MapContainer, TileLayer, LayerGroup } from 'react-leaflet'

import MapCircle from "../components/map/mapCircle";

export default withAuthenticationRequired(function Scenes() {
    const rangeMin = 10;
    const rangeMax = 100;
    const defaultRange = 20;
    const milesToMeters = 1609.34;

    let { getAccessTokenSilently } = useAuth0();
    async function test() {
        let token = await getAccessTokenSilently();
        alert(token)
        await axios.get(
            process.env.REACT_APP_API_URL + "/scenes/",
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
        ).catch(e => {
            console.log(e);
        })
    }

    const { user } = useAuth0()

    const [center, setCenter] = useState([0, 0])
    const [range, setRange] = useState(defaultRange);
    const [name, setName] = useState("");

    navigator.geolocation.getCurrentPosition((position) => { // success callback
        if(center[0] === 0 && center[1] === 0) {
            setCenter([position.coords.latitude, position.coords.longitude]);
        }
    }, (e) => { // on failure
        console.error(e);
    });

    function handleChange(event) {
        let val = parseInt(event.target.value);
        if(event.target.id === "range" && val >= rangeMin && val <= rangeMax) {
            setRange(val)
        }
    }

    return (
        <>
            <h1>Scenes:</h1>
            <Formik
                initialValues={{center: "", range: defaultRange}}

                onSubmit={async values => {
                    let token = await getAccessTokenSilently();
                    values.user = user;
                    values.range = range;
                    values.center = center
                    console.log(values)
                    await axios.post(
                        process.env.REACT_APP_API_URL + "/scenes/create/",
                        {...values},
                        {headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}}
                    ).catch(e => {
                        console.error(e);
                    })
                }}
            >
                <Form onBlur={handleChange}>
                    <label htmlFor="range">Range: </label>
                    <Field name="range" id="range"/><br/>
                    <ErrorMessage name="range"/>

                    <button type="submit">Submit</button> <br/>
                </Form>
            </Formik>
            <h1>Will be called {name}</h1>
            {
                (center[0] !== 0 || center[1] !== 0) && Number.isInteger(range)? // only render the map if we have a center and a range
                    <MapContainer 
                        center={center} 
                        zoom={13}
                        style={{ 
                            height:"400px",
                            marginTop:"80px", 
                            marginBottom:'90px'
                        }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LayerGroup>
                            <MapCircle
                                center={center}
                                setCenter = {setCenter}
                                setName = {setName}
                                name={name}
                                radius={range * milesToMeters}
                            />
                        </LayerGroup>
                    </MapContainer>
                :
                    <h1>Not Rendering</h1>
            }
            

            <button onClick={test}>test</button>

        </>
    )
})