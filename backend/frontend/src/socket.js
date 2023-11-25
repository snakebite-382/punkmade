import { reactive } from "vue";
import { io } from "socket.io-client";

export const socketState = reactive({
    connected: false,
    fooEvents: [],
    taskID: NaN,
    posts: [],
    comments: [

    ]
//   barEvents: []
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? 'https://punkmade.fly.dev' : "http://localhost:5000";

export const socket = io(URL,  { transports: ["websocket"] });

socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});

socket.on("connect", () => {
    socketState.connected = true;
});

socket.on("disconnect", () => {
    socketState.connected = false;
});

socket.on("set taskID", (id) => {
    socketState.taskID = id;
});

socket.on("return post", (response) => {
    if(response.taskID !== socketState.taskID) return;
    socketState.posts.push(response.post);
})

socket.on("return comment", (response) => {
    console.log("GOT A COMMENT")
    if(!socketState.comments[response.mediaID]) socketState.comments[response.mediaID] = [];
    socketState.comments[response.mediaID].push(response.comment);
})

export async function initSocket(token) {
    socket.connect();
    console.log("CONN");
    socketState.socketAuthed = await socket.emitWithAck("auth", token);
}

socket.on("foo", (...args) => {
   socketState.fooEvents.push(args);
    console.log("FOOOOO");
});

// socket.on("bar", (...args) => {
//   state.barEvents.push(args);
// });
