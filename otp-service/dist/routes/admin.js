"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const Chat_1 = __importDefault(require("../models/Chat"));
const Message_1 = __importDefault(require("../models/Message"));
const OTP_1 = require("../models/OTP");
const router = (0, express_1.Router)();
// ── Middleware simple de autenticación admin ───────────────────────────────────
// En producción usar JWT o sesión real. Aquí usamos una clave de entorno.
router.use((req, res, next) => {
    const key = req.headers["x-admin-key"];
    if (key !== (process.env.ADMIN_KEY || "nexttalk-admin-2025")) {
        return res.status(401).json({ error: "No autorizado" });
    }
    next();
});
// ── USUARIOS ───────────────────────────────────────────────────────────────────
// GET /api/admin/users — todos los usuarios con stats
router.get("/users", async (_req, res) => {
    try {
        const users = await User_1.default.find()
            .select("_id phone name avatar online lastSeen status createdAt contacts")
            .sort({ createdAt: -1 });
        const result = await Promise.all(users.map(async (u) => {
            const msgCount = await Message_1.default.countDocuments({ sender: u._id });
            const chatCount = await Chat_1.default.countDocuments({ participants: u._id });
            return {
                _id: u._id,
                phone: u.phone,
                name: u.name,
                avatar: u.avatar,
                online: u.online,
                lastSeen: u.lastSeen,
                status: u.status,
                createdAt: u.createdAt,
                contacts: u.contacts?.length || 0,
                messages: msgCount,
                chats: chatCount,
                sanctions: 0, // se maneja en colección separada si se implementa
            };
        }));
        res.json({ users: result, total: result.length });
    }
    catch (err) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});
// DELETE /api/admin/users/:id — eliminar cuenta
router.delete("/users/:id", async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
        // Eliminar mensajes, chats, OTPs y registro del usuario
        await Message_1.default.deleteMany({ sender: user._id });
        await Chat_1.default.updateMany({ participants: user._id }, { $pull: { participants: user._id } });
        await OTP_1.OTP.deleteMany({ phone: user.phone });
        await OTP_1.RegisteredPhone.deleteOne({ phone: user.phone });
        await User_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Cuenta eliminada correctamente" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});
// PATCH /api/admin/users/:id/ban — banear/desbanear usuario
router.patch("/users/:id/ban", async (req, res) => {
    try {
        const { banned } = req.body;
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { status: banned ? "banned" : "Hola, uso NextTalk" }, { new: true });
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
        res.json({ user });
    }
    catch {
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
});
// ── GRUPOS ─────────────────────────────────────────────────────────────────────
// GET /api/admin/groups — todos los grupos con miembros
router.get("/groups", async (_req, res) => {
    try {
        const groups = await Chat_1.default.find({ isGroup: true })
            .populate("participants", "_id phone name avatar online")
            .populate("admins", "_id phone name")
            .populate({
            path: "lastMessage",
            populate: { path: "sender", select: "name phone" },
        })
            .sort({ updatedAt: -1 });
        const result = await Promise.all(groups.map(async (g) => {
            const msgCount = await Message_1.default.countDocuments({ chat: g._id });
            return {
                _id: g._id,
                groupName: g.groupName,
                groupAvatar: g.groupAvatar,
                participants: g.participants,
                admins: g.admins,
                lastMessage: g.lastMessage,
                createdAt: g.createdAt,
                updatedAt: g.updatedAt,
                messageCount: msgCount,
            };
        }));
        res.json({ groups: result, total: result.length });
    }
    catch {
        res.status(500).json({ error: "Error al obtener grupos" });
    }
});
// DELETE /api/admin/groups/:id — eliminar grupo
router.delete("/groups/:id", async (req, res) => {
    try {
        await Message_1.default.deleteMany({ chat: req.params.id });
        await Chat_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Grupo eliminado" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar grupo" });
    }
});
// ── ESTADÍSTICAS GLOBALES ──────────────────────────────────────────────────────
// GET /api/admin/stats — métricas generales
router.get("/stats", async (_req, res) => {
    try {
        const [totalUsers, onlineUsers, totalGroups, totalMessages, totalChats, newUsersToday,] = await Promise.all([
            User_1.default.countDocuments(),
            User_1.default.countDocuments({ online: true }),
            Chat_1.default.countDocuments({ isGroup: true }),
            Message_1.default.countDocuments({ deleted: false }),
            Chat_1.default.countDocuments({ isGroup: false }),
            User_1.default.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            }),
        ]);
        // Mensajes últimos 7 días
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentMessages = await Message_1.default.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, deleted: false } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json({
            totalUsers,
            onlineUsers,
            totalGroups,
            totalMessages,
            totalChats,
            newUsersToday,
            messagesChart: recentMessages,
        });
    }
    catch {
        res.status(500).json({ error: "Error al obtener estadísticas" });
    }
});
// ── SANCIONES / REPORTES ───────────────────────────────────────────────────────
// Almacenamos en memoria (en producción usar una colección MongoDB)
const sanctions = {};
// GET /api/admin/sanctions — lista de usuarios sancionados
router.get("/sanctions", async (_req, res) => {
    try {
        const sanctionedIds = Object.keys(sanctions);
        const users = await User_1.default.find({ _id: { $in: sanctionedIds } }).select("_id phone name avatar");
        const result = users.map((u) => ({
            ...u.toObject(),
            sanctions: sanctions[u._id.toString()],
        }));
        res.json({ sanctions: result });
    }
    catch {
        res.status(500).json({ error: "Error" });
    }
});
// POST /api/admin/sanctions/:userId — agregar sanción
router.post("/sanctions/:userId", async (req, res) => {
    try {
        const { reason } = req.body;
        const id = req.params.userId;
        if (!sanctions[id]) {
            sanctions[id] = { count: 0, reasons: [], date: new Date() };
        }
        sanctions[id].count += 1;
        sanctions[id].reasons.push(reason || "Violación de normas");
        sanctions[id].date = new Date();
        // Auto-eliminar cuenta si llega a 2 sanciones
        if (sanctions[id].count >= 2) {
            const user = await User_1.default.findById(id);
            if (user) {
                await Message_1.default.deleteMany({ sender: user._id });
                await OTP_1.OTP.deleteMany({ phone: user.phone });
                await OTP_1.RegisteredPhone.deleteOne({ phone: user.phone });
                await User_1.default.findByIdAndDelete(id);
                delete sanctions[id];
                return res.json({
                    message: "Cuenta eliminada automáticamente por 2 sanciones",
                    autoDeleted: true,
                });
            }
        }
        res.json({ sanctions: sanctions[id] });
    }
    catch {
        res.status(500).json({ error: "Error al aplicar sanción" });
    }
});
exports.default = router;
