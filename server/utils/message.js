let generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: new Date().getTime(),
        type: "message"
    }
};

let generateLocationMessage = (from, lat, long) => {
    return {
        from,
        url: `https://www.google.com.br/maps?q=${lat},${long}`,
        createdAt: new Date().getTime(),
        type: "location"
    }
};

module.exports = { generateMessage, generateLocationMessage };