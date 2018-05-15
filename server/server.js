const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const { generateMessage, generateLocationMessage, getOldMessages } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

app.use(express.static(publicPath));

let messages = [];

io.on('connection', (socket) => {
    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and Room are required fields');
        }
        
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        
        socket.emit('oldMessages', getOldMessages(messages, params.room));
        socket.emit('notify', `Welcome to Chatterson ${params.name}`);
        socket.broadcast.to(params.room).emit('notify', `${params.name} has joined the room`);
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));

        callback();
    });

    socket.on('sendMessage', (text, callback) => {
        if (text === 'shit') {
            callback(false, 'Please watch your tongue');
            return;
        }

        let user = users.getUser(socket.id);
        let message = generateMessage(user, text);
        messages.push(message);
        callback(true, message);
        socket.broadcast.to(user.room).emit('newMessage', message);
    })

    socket.on('createLocationMessage', (coords) => {
        let user = users.getUser(socket.id);
        let message = generateLocationMessage(user, coords.latitude, coords.longitude);
        messages.push(message);
        io.to(user.room).emit('newLocationMessage', message);
    })

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);

        if (user) {
            socket.broadcast.to(user.room).emit('notify', `${user.name} has left the room`);
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
        }
    })
});

server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});