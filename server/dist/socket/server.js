"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("../api/auth"));
const events_1 = require("./events");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const allowedOrigins = [
    "http://localhost:3000",
    "https://tock-game.vercel.app",
    "https://tock-game-le783z0y4-jpoulain58s-projects.vercel.app",
    process.env.CLIENT_URL || "",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""
].filter(origin => origin !== "");
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
});
const games = new Map();
(0, events_1.registerSocketEvents)(io, games);
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
});
