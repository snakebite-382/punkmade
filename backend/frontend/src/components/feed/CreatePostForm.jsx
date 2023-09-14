import React from "react";
// form stuff
import { Formik, Field, Form } from 'formik';

import { useAuth0 } from "@auth0/auth0-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import axios from "axios";

export default function CreatePostForm(props) {
    const {user, getAccessTokenSilently} = useAuth0()
    const queryClient = useQueryClient();

    async function createPost({content, type, user, scene, category}) {
        let token = await getAccessTokenSilently();

        axios.post(
            process.env.REACT_APP_API_URL + `/feed/create_post/`,
            {
                scene: scene,
                category: category,
                content: content,
                type: type,
                user: user,
            },
            {headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}}
        )
    }

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onSuccess:(data, variables, context) => {
            console.log(variables)
            queryClient.invalidateQueries({queryKey: ["posts", variables.scene, variables.category]})
          },
    })

    return (
        <Formik // other types and type selection to be implemented soon
            initialValues={{content: "", type:"text"}}

            onSubmit={(vals) => {
                createPostMutation.mutate({content: vals.content, type: vals.type, user: user.sub, scene: props.sceneID, category: props.categoryName})
            }}
        >
            <Form>
                <label htmlFor="content">Content:</label>
                <Field name="content" id="content"/>

                <button type="submit">submit</button>
            </Form>
        </Formik>
    )
}