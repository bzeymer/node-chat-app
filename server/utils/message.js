const moment = require('moment');

let generateMessage = (user, text) => {
    return {
        from: user.name,
        room: user.room,
        text,
        createdAt: moment().valueOf(),
        type: "message"
    }
};

let generateLocationMessage = (user, lat, long) => {
    return {
        from: user.name,
        room: user.room,
        url: `https://www.google.com.br/maps?q=${lat},${long}`,
        createdAt: moment().valueOf(),
        type: "location"
    }
};

let generateRollDiceMessage = (user, { result, dice, modifier }) => {
    return {
        from: user.name,
        room: user.room,
        dice: dice,
        modifier: modifier,
        result: result,
        createdAt: moment().valueOf(),
        type: "dice"
    }
};

let getOldMessages = (messages, room) => {
    return messages.filter((message) => message.room === room);
}

module.exports = { generateMessage, generateLocationMessage, getOldMessages, generateRollDiceMessage };