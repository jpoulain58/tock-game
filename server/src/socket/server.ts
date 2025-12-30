import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import authRoutes from "../api/auth";
import { GamesRegistry } from "./types";
import { registerSocketEvents } from "./events";

const app = express();
const httpServer = createServer(app);

const allowedOrigins: string[] = [
  "http://localhost:3000",
  "https://tock-game.vercel.app",
  "https://tock-game-le783z0y4-jpoulain58s-projects.vercel.app",
  "https://tock-game-git-main-jpoulain58s-projects.vercel.app",
  "https://tock-game-*-jpoulain58s-projects.vercel.app",
  process.env.CLIENT_URL || "",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  process.env.FRONTEND_URL || ""
].filter(origin => origin !== "");


app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost in development
    if (origin.includes('localhost')) return callback(null, true);

    // Allow Vercel deployments
    if (origin.includes('vercel.app')) return callback(null, true);

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
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.options("*", cors()); // Enable preflight for all routes

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow localhost in development
      if (origin.includes('localhost')) return callback(null, true);

      // Allow Vercel deployments
      if (origin.includes('vercel.app')) return callback(null, true);

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

const games: GamesRegistry = new Map();
registerSocketEvents(io, games);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
});

