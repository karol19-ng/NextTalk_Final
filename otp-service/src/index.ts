import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import otpRoutes from "./routes/otp";
import userRoutes from "./routes/users";
import contactRoutes from "./routes/contacts";
import chatRoutes from "./routes/chats";
import messageRoutes from "./routes/messages";
import statusRoutes from "./routes/status";
import mediaRoutes from "./routes/media";
import { setupSocket } from "./socket/socket";
import aiRoutes from "./routes/ai";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();
app.use("/api/admin", adminRoutes);
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Configuración de CORS
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    callback(null, origin || "*");
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Responder preflight OPTIONS antes que cualquier otra ruta
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/ai", aiRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/media", mediaRoutes);

// Socket.IO
setupSocket(io);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error MongoDB:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

export { io };
