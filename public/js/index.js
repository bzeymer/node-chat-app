var person = prompt("Please enter your name");

if (person) {
    var socket = io("http://127.0.0.1:3000/", { query: "name="+person });

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

    socket.on('notify', function(message) {
        notification(message);
    });

    function appendMessage(message) {
        var d = new Date(message.createdAt);
        var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        
        var node = document.createElement("li");

        var timeNode = document.createElement("div");
        timeNode.className = "time";
        timeNode.appendChild(document.createTextNode(time));

        var userNode = document.createElement("div");
        userNode.className = "user";
        userNode.appendChild(document.createTextNode(message.from));

        var textNode = document.createElement("div");
        textNode.className = "text";
        textNode.appendChild(document.createTextNode(message.text));

        node.appendChild(timeNode);
        node.appendChild(userNode);
        node.appendChild(textNode);
        document.getElementById("messages").appendChild(node);
    }

    function notification(message) {
        var node = document.createElement("li");
        var textNode = document.createTextNode(message);
        node.appendChild(textNode);
        document.getElementById("messages").appendChild(node);
    }

    function submitMessage() {
        var form = document.getElementById("msgForm");
        
        if (form.message.value) {
            console.log(form);
            var message = {
                text: form.message.value,
                createdAt: new Date().getTime()
            };

            socket.emit('sendMessage', message);

            message.from = person;
            appendMessage(message);
        }

        form.message.value = '';
        
        return false;
    };
}