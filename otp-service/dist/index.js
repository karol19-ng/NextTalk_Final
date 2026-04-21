"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const otp_1 = __importDefault(require("./routes/otp"));
const users_1 = __importDefault(require("./routes/users"));
const contacts_1 = __importDefault(require("./routes/contacts"));
const chats_1 = __importDefault(require("./routes/chats"));
const messages_1 = __importDefault(require("./routes/messages"));
const status_1 = __importDefault(require("./routes/status"));
const media_1 = __importDefault(require("./routes/media"));
const admin_1 = __importDefault(require("./routes/admin"));
const ai_1 = __importDefault(require("./routes/ai"));
const socket_1 = require("./socket/socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});
exports.io = io;
// const corsOptions: cors.CorsOptions = {
//   origin: (origin, callback) => {
//     callback(null, origin || "*");
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   // ✅ x-admin-key agregado para que el panel admin funcione
//   allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
// };
const corsOptions = {
    origin: "https://robust-spontaneity-production.up.railway.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
// ✅ CORS y preflight ANTES que cualquier ruta
app.options("*", (0, cors_1.default)(corsOptions));
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Rutas
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/otp", otp_1.default);
app.use("/api/users", users_1.default);
app.use("/api/contacts", contacts_1.default);
app.use("/api/chats", chats_1.default);
app.use("/api/messages", messages_1.default);
app.use("/api/status", status_1.default);
app.use("/api/media", media_1.default);
app.use("/api/ai", ai_1.default);
// ✅ Admin DESPUÉS del middleware CORS
app.use("/api/admin", admin_1.default);
(0, socket_1.setupSocket)(io);
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB conectado"))
    .catch((err) => console.error("Error MongoDB:", err));
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
