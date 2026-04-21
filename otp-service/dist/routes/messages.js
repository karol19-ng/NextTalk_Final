"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Message_1 = __importDefault(require("../models/Message"));
const Chat_1 = __importDefault(require("../models/Chat"));
const User_1 = __importDefault(require("../models/User"));
const index_1 = require("../index");
const router = (0, express_1.Router)();
// GET /api/messages/:chatId
router.get("/:chatId", async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const messages = await Message_1.default.find({
            chat: req.params.chatId,
            deleted: false,
        })
            .populate("sender", "_id phone name avatar")
            .sort({ createdAt: -1 })
            .skip((+page - 1) * +limit)
            .limit(+limit);
        res.json({ messages: messages.reverse() });
    }
    catch {
        res.status(500).json({ error: "Error al obtener mensajes" });
    }
});
// POST /api/messages — enviar mensaje
router.post("/", async (req, res) => {
    try {
        const { chatId, senderPhone, content, type = "text", mediaUrl, fileName, fileSize, duration, } = req.body;
        const sender = await User_1.default.findOne({ phone: senderPhone });
        if (!sender)
            return res.status(404).json({ error: "Usuario no encontrado" });
        const message = await Message_1.default.create({
            chat: chatId,
            sender: sender._id,
            type,
            content,
            mediaUrl,
            fileName,
            fileSize,
            duration,
            status: "sent",
        });
        await message.populate("sender", "_id phone name avatar");
        await Chat_1.default.findByIdAndUpdate(chatId, {
            lastMessage: message._id,
            updatedAt: new Date(),
        });
        // Emitir en tiempo real
        index_1.io.to(chatId).emit("new_message", message);
        res.status(201).json({ message });
    }
    catch {
        res.status(500).json({ error: "Error al enviar mensaje" });
    }
});
// PUT /api/messages/:messageId/read
router.put("/:messageId/read", async (req, res) => {
    try {
        const { readerPhone } = req.body;
        const reader = await User_1.default.findOne({ phone: readerPhone });
        if (!reader)
            return res.status(404).json({ error: "Usuario no encontrado" });
        const message = await Message_1.default.findByIdAndUpdate(req.params.messageId, { $addToSet: { readBy: reader._id }, status: "read" }, { new: true });
        if (!message)
            return res.status(404).json({ error: "Mensaje no encontrado" });
        index_1.io.to(message.chat.toString()).emit("message_read", {
            messageId: message._id,
            readerId: reader._id,
        });
        res.json({ message });
    }
    catch {
        res.status(500).json({ error: "Error" });
    }
});
// PUT /api/messages/:messageId/edit
router.put("/:messageId/edit", async (req, res) => {
    try {
        const { content } = req.body;
        const message = await Message_1.default.findByIdAndUpdate(req.params.messageId, { content, edited: true }, { new: true }).populate("sender", "_id phone name avatar");
        if (!message)
            return res.status(404).json({ error: "Mensaje no encontrado" });
        index_1.io.to(message.chat.toString()).emit("message_edited", message);
        res.json({ message });
    }
    catch {
        res.status(500).json({ error: "Error al editar" });
    }
});
// DELETE /api/messages/:messageId
router.delete("/:messageId", async (req, res) => {
    try {
        const message = await Message_1.default.findByIdAndUpdate(req.params.messageId, { deleted: true, content: "Mensaje eliminado" }, { new: true });
        if (!message)
            return res.status(404).json({ error: "Mensaje no encontrado" });
        index_1.io.to(message.chat.toString()).emit("message_deleted", {
            messageId: message._id,
        });
        res.json({ message: "Mensaje eliminado" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar" });
    }
});
exports.default = router;
