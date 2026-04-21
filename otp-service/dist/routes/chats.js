"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Chat_1 = __importDefault(require("../models/Chat"));
const User_1 = __importDefault(require("../models/User"));
const Message_1 = __importDefault(require("../models/Message"));
const index_1 = require("../index");
const router = (0, express_1.Router)();
// ⚠️ IMPORTANTE: la ruta /group debe ir ANTES de /:chatId
// Si va después, Express interpreta "group" como un chatId y falla silenciosamente.
// POST /api/chats/group — crear grupo
router.post("/group", async (req, res) => {
    try {
        const { myPhone, participantPhones, groupName, groupAvatar } = req.body;
        const me = await User_1.default.findOne({ phone: myPhone });
        if (!me)
            return res.status(404).json({ error: "Usuario no encontrado" });
        const participants = await User_1.default.find({ phone: { $in: participantPhones } });
        if (participants.length === 0)
            return res.status(400).json({ error: "No se encontraron participantes" });
        const allIds = [me._id, ...participants.map((p) => p._id)];
        const chat = await Chat_1.default.create({
            participants: allIds,
            isGroup: true,
            groupName,
            groupAvatar,
            admins: [me._id],
        });
        await chat.populate("participants", "_id phone name avatar online lastSeen");
        // Notificar a todos los participantes (incluyendo al creador) para que
        // recarguen sus chats y el grupo aparezca en su lista.
        const allPhones = [myPhone, ...participantPhones];
        allPhones.forEach((phone) => {
            index_1.io.to(`user_${phone}`).emit("new_group", { chat });
        });
        res.status(201).json({ chat });
    }
    catch (err) {
        console.error("Error al crear grupo:", err);
        res.status(500).json({ error: "Error al crear grupo" });
    }
});
// GET /api/chats/:phone — listar chats del usuario
router.get("/:phone", async (req, res) => {
    try {
        const phone = decodeURIComponent(req.params.phone);
        const me = await User_1.default.findOne({ phone });
        if (!me)
            return res.status(404).json({ error: "Usuario no encontrado" });
        const chats = await Chat_1.default.find({ participants: me._id })
            .populate("participants", "_id phone name avatar online lastSeen")
            .populate({
            path: "lastMessage",
            populate: { path: "sender", select: "name phone" },
        })
            .sort({ updatedAt: -1 });
        res.json({ chats });
    }
    catch {
        res.status(500).json({ error: "Error al obtener chats" });
    }
});
// POST /api/chats — crear o abrir chat 1 a 1
router.post("/", async (req, res) => {
    try {
        const { myPhone, participantPhone } = req.body;
        const me = await User_1.default.findOne({ phone: myPhone });
        const participant = await User_1.default.findOne({ phone: participantPhone });
        if (!me || !participant)
            return res.status(404).json({ error: "Usuario no encontrado" });
        let chat = await Chat_1.default.findOne({
            isGroup: false,
            participants: { $all: [me._id, participant._id], $size: 2 },
        }).populate("participants", "_id phone name avatar online lastSeen");
        if (!chat) {
            chat = await Chat_1.default.create({
                participants: [me._id, participant._id],
                isGroup: false,
            });
            await chat.populate("participants", "_id phone name avatar online lastSeen");
        }
        res.json({ chat });
    }
    catch {
        res.status(500).json({ error: "Error al crear chat" });
    }
});
// DELETE /api/chats/:chatId
router.delete("/:chatId", async (req, res) => {
    try {
        await Chat_1.default.findByIdAndDelete(req.params.chatId);
        await Message_1.default.deleteMany({ chat: req.params.chatId });
        res.json({ message: "Chat eliminado" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar chat" });
    }
});
exports.default = router;
