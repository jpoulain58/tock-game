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
app.set("trust proxy", 1);
// Simple CORS configuration that works
const corsOptions = {
    origin: true, // Allow all origins (for debugging, we'll restrict after it works)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/cors-test", (req, res) => {
    console.log('🌐 CORS test request from origin:', req.headers.origin);
    res.json({
        message: "CORS test successful",
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    });
});
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: true, // Allow all origins for now
        methods: ["GET", "POST"],
        credentials: true
    }
});
const games = new Map();
(0, events_1.registerSocketEvents)(io, games);
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
});
