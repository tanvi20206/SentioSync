const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/db");
const feedRoutes = require("./routes/feed");
const setupSocketHandlers = require("./socket/handlers");

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app); // http server banao

// Socket.IO ko same server pe attach karo
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4200", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── MongoDB Connect ──────────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:8000"],
    credentials: true,
  }),
);
app.use(express.json()); // JSON body parse karo
app.use(morgan("dev")); // Request logs dikhao terminal mein

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/feed", feedRoutes);

// Health check — server chal raha hai ya nahi check karne ke liye
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "SentioSync Node server is running!",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
setupSocketHandlers(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║   SentioSync Node Server           ║
  ║   Running on: http://localhost:${PORT} ║
  ║   Socket.IO: Active ⚡              ║
  ╚════════════════════════════════════╝
  `);
});
