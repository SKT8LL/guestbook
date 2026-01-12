const messages = [];

module.exports = {
    getMessages: () => messages,
    addMessage: (msg) => {
        messages.push({
            ...msg,
            createdAt: new Date()
        });
    }
};
