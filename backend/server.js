// imports
const express = require('express');
const dotEnv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createServer } = require('node:http');
const { Server } = require('socket.io')
const RateLimit = require('express-rate-limit');

// DOTENV
dotEnv.config({path: __dirname + "/.env"})

// Setup the express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? "https://punkmade.fly.dev/" : "http://localhost:5173",
      methods: ["GET", "POST"],
    }
});

//Security
let limiter = RateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // max 100 requests per windowMs (100 req/10min, 10 req/min, ~0.16 req/sec)
});

// apply rate limiter to all requests
app.use(limiter);

// runtime constants 
// prod:
// const frontendDir = __dirname + "/frontend/dist";
//test:
const frontendDir = __dirname + '/frontend/dist'
const port = 5000;

// security
const clientOrigins = ["http://localhost:5173", "http://localhost:5000/", "https://punkmade.fly.dev/"];
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
app.get('*', (request, response) => {
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
