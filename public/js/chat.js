const momentFormater = 'D [de] MMMM [de] YYYY [às] H:mm:ss';

var socket = io();

socket.on('connect', function() {
    console.log('Connected to server');
    var params = jQuery.deparam(window.location.search);

    socket.emit('join', params, (error) => {
        if (error) {
            alert(error);
            window.location.href = '/';
        } else {
            console.log('No errors');
        }
    });
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('updateUserList', function(users) {
    renderUsersList(users);
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

socket.on('newDiceMessage', function(message) {
    appendDiceMessage(message);
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

function rollDice(dice) {
    var input = document.getElementById("modifier");
    var modifier = +input.value;

    var result = Math.floor( Math.random() * dice ) + 1;
    socket.emit('rollDiceMessage', {
        dice,
        result,
        modifier
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

function appendDiceMessage(message) {

    var template = jQuery("#dice-template").html();
    var time = moment(message.createdAt);

    var html = Mustache.render(template, {
        from: message.from,
        dice: message.dice,
        modifier: message.modifier,
        result: message.result,
        total: message.result + message.modifier,
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

function renderUsersList(users) {
    var template = jQuery("#user-template").html();
    var list = jQuery(".users-list");
    
    list.html('');
    users.forEach(function(user) {
        var html = Mustache.render(template, {
            user
        });

        list.append(html);
    });
    scroll();
}
