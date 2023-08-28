const express = require('express');
const app = express();

let frontendDir = __dirname + "/frontend/build";
const port = process.env.port || 5000;

app.use(express.static(frontendDir));

app.get('/', (request, response) => {
    response.sendFile(frontendDir + "/index.html");
});

// listen for requests :)
const listener = app.listen(port, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});