"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../api/auth"));
const stats_1 = __importDefault(require("../api/stats"));
const events_1 = require("./events");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.set("trust proxy", 1);
// Manual CORS handling - more reliable than the cors package
app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    // Set CORS headers manually
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('✅ Preflight request handled');
        return res.sendStatus(204);
    }
    next();
});
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api/stats", stats_1.default);
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
