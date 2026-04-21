"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const User_1 = __importDefault(require("../models/User"));
const setupSocket = (io) => {
    const onlineUsers = new Map(); // phone -> socketId
    io.on("connection", (socket) => {
        // Usuario conectado: registrar presencia y unirse a sala personal
        socket.on("user_connected", async (phone) => {
            onlineUsers.set(phone, socket.id);
            // Sala personal: permite enviar notificaciones dirigidas a este usuario
            // (ej: "te agregaron a un grupo nuevo")
            socket.join(`user_${phone}`);
            await User_1.default.findOneAndUpdate({ phone }, { online: true, lastSeen: new Date() });
            socket.broadcast.emit("user_online", { phone });
        });
        // Unirse a sala de chat (para recibir mensajes en tiempo real)
        socket.on("join_chat", (chatId) => {
            socket.join(chatId);
        });
        socket.on("leave_chat", (chatId) => {
            socket.leave(chatId);
        });
        // Indicador de escritura
        socket.on("typing", ({ chatId, phone }) => {
            socket.to(chatId).emit("user_typing", { chatId, phone });
        });
        socket.on("stop_typing", ({ chatId, phone }) => {
            socket.to(chatId).emit("user_stop_typing", { chatId, phone });
        });
        // Confirmación de entrega
        socket.on("message_delivered", ({ messageId, chatId }) => {
            io.to(chatId).emit("message_delivered", { messageId });
        });
        // Desconexión
        socket.on("disconnect", async () => {
            let disconnectedPhone = null;
            for (const [phone, sid] of onlineUsers.entries()) {
                if (sid === socket.id) {
                    disconnectedPhone = phone;
                    onlineUsers.delete(phone);
                    break;
                }
            }
            if (disconnectedPhone) {
                await User_1.default.findOneAndUpdate({ phone: disconnectedPhone }, { online: false, lastSeen: new Date() });
                socket.broadcast.emit("user_offline", {
                    phone: disconnectedPhone,
                    lastSeen: new Date(),
                });
            }
        });
    });
};
exports.setupSocket = setupSocket;
