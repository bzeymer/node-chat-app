var socket = io();

socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('oldMessages', function(messages) {
    messages.forEach(function(message) {
        appendMessage(message);
    });
});

socket.on('newMessage', function(message) {
    appendMessage(message);
});

function appendMessage(message) {
    var d = new Date(message.createdAt);
    var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    
    var node = document.createElement("li");
    var textNode = document.createTextNode(time + " - " + message.from + " says: " + message.text);
    node.appendChild(textNode);
    document.getElementById("messages").appendChild(node);
}

function submitMessage() {
    var form = document.getElementById("msgForm");

    if (form.message.value) {
        socket.emit('sendMessage', {
            from: form.user.value,
            text: form.message.value,
            createdAt: new Date().getTime()
        });
    }

    form.message.value = '';
    
    return false;
};