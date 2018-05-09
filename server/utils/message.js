const moment = require('moment');

let generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: moment().valueOf(),
        type: "message"
    }
};

let generateLocationMessage = (from, lat, long) => {
    return {
        from,
        url: `https://www.google.com.br/maps?q=${lat},${long}`,
        createdAt: moment().valueOf(),
        type: "location"
    }
};

module.exports = { generateMessage, generateLocationMessage };