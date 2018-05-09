var person = prompt("Please enter your name");
const momentFormater = 'D [de] MMMM [de] YYYY [às] H:mm:ss';

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

    
    function notification(message) {
        var node = document.createElement("li");
        node.className = "notification";
        var textNode = document.createTextNode(message);
        node.appendChild(textNode);
        document.getElementById("messages").appendChild(node);
        
        scroll();
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

    function scroll() {
        var element = document.getElementsByClassName('chat');
        element[0].scrollTop = element[0].scrollHeight - element[0].clientHeight;
    }

    function appendMessage(message) {
        var template = jQuery("#message-template").html();
        var time = moment(message.createdAt);

        var html = Mustache.render(template, {
            from: message.from,
            text: message.text,
            time: time.fromNow(),
            title: time.format(momentFormater)
        });

        jQuery("#messages").append(html);
        scroll();
    }

    function appendLocationMessage(message) {

        var template = jQuery("#location-template").html();
        var time = moment(message.createdAt);

        var html = Mustache.render(template, {
            from: message.from,
            location: message.url,
            time: time.fromNow(),
            title: time.format(momentFormater)
        });

        jQuery("#messages").append(html);        
        scroll();
    }

}