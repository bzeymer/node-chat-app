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

    socket.emit('notify', `Welcome to Chatterson ${socket.handshake.query.name}`);
    socket.broadcast.emit('notify', `${socket.handshake.query.name} has joined the room`);

    socket.emit('oldMessages', messages);

    socket.on('sendMessage', (message) => {
        message.from = socket.handshake.query.name;
        messages.push(message);
        socket.broadcast.emit('newMessage', message);
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('notify', `${socket.handshake.query.name} has left the room`);
    })
});

server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});