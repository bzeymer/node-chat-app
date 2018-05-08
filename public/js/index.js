var person = prompt("Please enter your name");

if (person) {
    var socket = io({ query: "name="+person });

    socket.on('connect', function() {
        console.log('Connected to server');
    });

    socket.on('disconnect', function() {
        console.log('Disconnected from server');
    });

    socket.on('oldMessages', function(messages) {
        messages.forEach(function(message) {
            if (message.type === 'message') {
                appendMessage(message);
            } else if (message.type === 'location') {
                appendLocationMessage(message);
            } else {
                return;
            }
        });
    });

    socket.on('newMessage', function(message) {
        appendMessage(message);
    });

    socket.on('newLocationMessage', function(message) {
        appendLocationMessage(message);
    });

    socket.on('notify', function(message) {
        notification(message);
    });

    function appendMessage(message) {
        var d = new Date(message.createdAt);
        var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        
        var node = document.createElement("li");
        
        var userNode = document.createElement("div");
        userNode.className = "user";
        userNode.appendChild(document.createTextNode(message.from));

        var arrowNode = document.createElement("div");
        arrowNode.className = "arrow";

        var timeNode = document.createElement("div");
        timeNode.className = "time";
        timeNode.appendChild(document.createTextNode(time));

        var textNode = document.createElement("div");
        textNode.className = "text";
        textNode.appendChild(document.createTextNode(message.text));

        node.appendChild(userNode);
        node.appendChild(arrowNode);
        node.appendChild(textNode);
        node.appendChild(timeNode);
        document.getElementById("messages").appendChild(node);
    }

    function appendLocationMessage(message) {
        var d = new Date(message.createdAt);
        var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        
        var node = document.createElement("li");

        var userNode = document.createElement("div");
        userNode.className = "user";
        userNode.appendChild(document.createTextNode(message.from));

        var arrowNode = document.createElement("div");
        arrowNode.className = "arrow";

        var urlNode = document.createElement("a");
        urlNode.className = "location";
        urlNode.href = message.url;
        urlNode.target = "_blank";

        var iconNode = document.createElement("i");
        iconNode.className = "material-icons";
        iconNode.href = message.url;
        iconNode.target = "_blank";
        iconNode.appendChild(document.createTextNode("place"));

        urlNode.appendChild(iconNode);
        urlNode.appendChild(document.createTextNode("Click to see my location"));
        
        var timeNode = document.createElement("div");
        timeNode.className = "time";
        timeNode.appendChild(document.createTextNode(time));

        node.appendChild(userNode);
        node.appendChild(arrowNode);
        node.appendChild(urlNode);
        node.appendChild(timeNode);
        document.getElementById("messages").appendChild(node);
    }

    function notification(message) {
        var node = document.createElement("li");
        node.className = "notification";
        var textNode = document.createTextNode(message);
        node.appendChild(textNode);
        document.getElementById("messages").appendChild(node);
    }

    function submitMessage() {
        var form = document.getElementById("msgForm");
        
        if (form.message.value) {
            socket.emit('sendMessage', form.message.value, function(success, data) {
                if (success) {
                    appendMessage(data);
                } else {
                    notification(data);
                }
            });
        }

        form.message.value = '';
        
        return false;
    };

    function sendLocation() {
        if (!navigator.geolocation) {
            return alert('Geolocation not supported by your browser.');
        }
        navigator.geolocation.getCurrentPosition(function(position) {
            socket.emit('createLocationMessage', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            })
        }, function(error) {
            alert('Unable to fetch location.');
        })
    }
}