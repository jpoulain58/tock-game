import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import authRoutes from "../api/auth";
import { GamesRegistry } from "./types";
import { registerSocketEvents } from "./events";

const app = express();
const httpServer = createServer(app);

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

app.use(express.json());

app.use("/api/auth", authRoutes);

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

const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins for now
    methods: ["GET", "POST"],
    credentials: true
  }
});

const games: GamesRegistry = new Map();
registerSocketEvents(io, games);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
});