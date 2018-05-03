const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

let messages = [];

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.emit('oldMessages', messages);

    socket.on('sendMessage', (message) => {
        messages.push(message);
        io.emit('newMessage', message);
    })

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
});

server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});