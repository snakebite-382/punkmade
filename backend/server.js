// imports
const express = require('express');
const dotEnv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require('node:http');
const { Server } = require('socket.io')

// DOTENV
dotEnv.config({path: __dirname + "/.env"})

// Setup the express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    }
});

// runtime constants 
const frontendDir = __dirname + "/frontend/dist";
const port = process.env.port || 5000;

// security
const clientOrigins = ["http://localhost:5173", "http://localhost:5000/"];
app.use(cors({ origin: clientOrigins }));

// form parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API
const APIRouter = express.Router();
app.use("/api", APIRouter);

const ScenesRouter = require("./api/Scenes/Scenes.router.js")
APIRouter.use("/scenes", ScenesRouter)

const FeedRouter = require("./api/Feed/Feed.router.js");
APIRouter.use("/feed", FeedRouter);

const UsersRouter = require('./api/Users/Users.router.js');
APIRouter.use('/users', UsersRouter)

// static files
app.use(express.static(frontendDir));

// redirect all requests to the frontend that aren't api reqs or static files
app.get('/', (request, response) => {
    response.sendFile(frontendDir + "/index.html");
});

// Socket.io
const {WebsocketServer} = require('./api/Websockets')

WebsocketServer(io);

process.on("exit", () => { // close mongo on close
    console.log("CLOSING")
    const { dbDriver } = require("./api/db.js");
    dbDriver.close();
    console.log("CLOSED")
})

// listen for requests :)
server.listen(port, () => {
    console.log('Your app is listening on port ' + port);
});