const { app } = require('@azure/functions');
const store = require('../store');

app.http('getMessages', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'api/messages',
    handler: async (request, context) => {
        const messages = store.getMessages();
        // Sort by newest first
        const sortedMessages = [...messages].sort((a, b) => b.createdAt - a.createdAt);
        return { body: JSON.stringify(sortedMessages) };
    }
});
