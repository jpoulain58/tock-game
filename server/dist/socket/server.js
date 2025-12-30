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
    "https://tock-game-git-main-jpoulain58s-projects.vercel.app",
    "https://tock-game-*-jpoulain58s-projects.vercel.app",
    process.env.CLIENT_URL || "",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    process.env.FRONTEND_URL || ""
].filter(origin => origin !== "");
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Allow localhost in development
        if (origin.includes('localhost'))
            return callback(null, true);
        // Allow Vercel deployments
        if (origin.includes('vercel.app'))
            return callback(null, true);
        // Check against allowed origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.options("*", (0, cors_1.default)()); // Enable preflight for all routes
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin)
                return callback(null, true);
            // Allow localhost in development
            if (origin.includes('localhost'))
                return callback(null, true);
            // Allow Vercel deployments
            if (origin.includes('vercel.app'))
                return callback(null, true);
            // Check against allowed origins
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        methods: ["GET", "POST"],
        credentials: true
    },
});
const games = new Map();
(0, events_1.registerSocketEvents)(io, games);
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
});
