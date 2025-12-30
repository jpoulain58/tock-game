import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import authRoutes from "../api/auth";
import { GamesRegistry } from "./types";
import { registerSocketEvents } from "./events";

const app = express();
const httpServer = createServer(app);

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "https://tock-game.vercel.app",
  process.env.CLIENT_URL || "",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  process.env.FRONTEND_URL || ""
].filter(origin => origin !== "");

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log('🔍 CORS check for origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow localhost in development
    if (origin.includes('localhost')) {
      console.log('✅ Allowing localhost origin:', origin);
      return callback(null, true);
    }
    
    // Allow main production domain
    if (origin === 'https://tock-game.vercel.app') {
      console.log('✅ Allowing main production domain:', origin);
      return callback(null, true);
    }
    
    // Allow ANY Vercel domain (for previews and production)
    if (origin && origin.includes('vercel.app')) {
      console.log('✅ Allowing Vercel domain:', origin);
      return callback(null, true);
    }
    
    // Check against allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Allowing from allowed origins:', origin);
      return callback(null, true);
    }
    
    console.log('❌ Blocking origin:', origin);
    return callback(null, true); // TEMPORARILY ALLOW ALL for debugging
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
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
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
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow localhost in development
      if (origin.includes('localhost')) return callback(null, true);
      
      // Allow main production domain
      if (origin === 'https://tock-game.vercel.app') return callback(null, true);
      
      // Allow ANY Vercel domain (for previews and production)
      if (origin && origin.includes('vercel.app')) {
        return callback(null, true);
      }
      
      // Check against allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

const games: GamesRegistry = new Map();
registerSocketEvents(io, games);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
});