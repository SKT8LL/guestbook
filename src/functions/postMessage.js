const { app } = require('@azure/functions');
const store = require('../store');

app.http('postMessage', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'api/messages',
    handler: async (request, context) => {
        try {
            const body = await request.json();
            const { name, message } = body;

            if (!name || !message) {
                return { status: 400, body: 'Name and message are required' };
            }

            store.addMessage({ name, message });
            return { status: 201, body: 'Message added' };
        } catch (error) {
            context.error(error);
            return { status: 400, body: 'Invalid JSON' };
        }
    }
});
