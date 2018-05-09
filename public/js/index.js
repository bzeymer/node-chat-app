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
        var chat = jQuery(".chat");
        var newMessage = jQuery("#messages").children("li:last-child");

        var clientHeight = chat.prop('clientHeight');
        var scrollTop = chat.prop('scrollTop');
        var scrollHeight = chat.prop('scrollHeight');
        var newMessageHeight = newMessage.innerHeight();
        var lastMessageHeight = newMessage.prev().innerHeight();
        
        if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
            chat.scrollTop(scrollHeight - clientHeight);
        }

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

    function notification(message) {

        var template = jQuery("#notification-template").html();
        var time = moment(message.createdAt);

        var html = Mustache.render(template, {
            text: message
        });

        jQuery("#messages").append(html);        
        scroll();
    }

}