import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: { "@": "/src" },
    },
    base: '/',
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:5054", 
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
