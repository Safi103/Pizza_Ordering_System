import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The client uses relative '/api/...' URLs. In dev, Vite proxies them to the
// Express server so there are no CORS or hard-coded-host issues.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:3001',
        },
    },
});