const { app } = require('@azure/functions');
const fs = require('fs/promises');
const path = require('path');

app.http('serveFrontend', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: '{*path}', // Catch-all for frontend
    handler: async (request, context) => {
        const url = new URL(request.url);
        let filepath = url.pathname;

        // Remove leading slash
        if (filepath.startsWith('/')) {
            filepath = filepath.substring(1);
        }

        // Default to index.html including /api/ prefixes if accidentally routed here (though explicit routes take precedence)
        // But for static serving:
        if (filepath === '' || filepath === 'index.html' || filepath.startsWith('api/')) {
            // Basic fallback
            filepath = 'index.html';
        }

        const basePath = path.join(__dirname, '../public');
        // Prevent directory traversal
        const fullPath = path.resolve(basePath, filepath);
        if (!fullPath.startsWith(basePath)) {
            return { status: 403, body: 'Forbidden' };
        }

        try {
            // Check if file exists, if not serve index.html for SPA feeling (or just 404)
            // For now, let's just serve index.html if asking for root, otherwise try file.
            let fileToServe = fullPath;
            let stats;
            try {
                stats = await fs.stat(fullPath);
            } catch (e) {
                // If not found, and it's looking for root styled things, serve index.
                fileToServe = path.join(basePath, 'index.html');
            }

            if (stats && stats.isDirectory()) {
                fileToServe = path.join(basePath, 'index.html');
            }

            const content = await fs.readFile(fileToServe);

            // Determine content type
            const ext = path.extname(fileToServe);
            let contentType = 'text/html';
            if (ext === '.css') contentType = 'text/css';
            if (ext === '.js') contentType = 'application/javascript';
            if (ext === '.png') contentType = 'image/png';
            if (ext === '.ico') contentType = 'image/x-icon';

            return {
                body: content,
                headers: {
                    'Content-Type': contentType
                }
            };
        } catch (error) {
            context.error(error);
            return { status: 404, body: 'Not Found' };
        }
    }
});
