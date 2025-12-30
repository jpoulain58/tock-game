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
  process.env.CLIENT_URL || "",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""
].filter(origin => origin !== "");


app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

const games: GamesRegistry = new Map();
registerSocketEvents(io, games);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
});

