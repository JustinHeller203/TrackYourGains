import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: { "@": "/src" },
    },
    server: {
        port: 5173,
        proxy: {
            // alles unter /api -> an .NET Backend
            "/api": {
                target: "http://localhost:5054", // dein Backend-Port aus dotnet run
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
