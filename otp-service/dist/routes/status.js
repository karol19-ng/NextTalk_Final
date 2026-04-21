"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Status_1 = __importDefault(require("../models/Status"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// GET /api/status/:phone — estados de contactos
router.get("/:phone", async (req, res) => {
    try {
        const phone = decodeURIComponent(req.params.phone);
        const me = await User_1.default.findOne({ phone }).populate("contacts");
        if (!me)
            return res.status(404).json({ error: "Usuario no encontrado" });
        const contactIds = me.contacts.map((c) => c._id);
        const statuses = await Status_1.default.find({
            user: { $in: [...contactIds, me._id] },
            expiresAt: { $gt: new Date() },
        }).populate("user", "_id phone name avatar").sort({ createdAt: -1 });
        const grouped = {};
        statuses.forEach((s) => {
            const uid = s.user._id.toString();
            if (!grouped[uid])
                grouped[uid] = { user: s.user, statuses: [] };
            grouped[uid].statuses.push(s);
        });
        res.json({ statuses: Object.values(grouped) });
    }
    catch {
        res.status(500).json({ error: "Error al obtener estados" });
    }
});
// POST /api/status — publicar estado
router.post("/", async (req, res) => {
    try {
        const { phone, type, content, caption, bgColor } = req.body;
        const user = await User_1.default.findOne({ phone });
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const status = await Status_1.default.create({ user: user._id, type, content, caption, bgColor, expiresAt });
        await status.populate("user", "_id phone name avatar");
        res.status(201).json({ status });
    }
    catch {
        res.status(500).json({ error: "Error al publicar estado" });
    }
});
// PUT /api/status/:statusId/view
router.put("/:statusId/view", async (req, res) => {
    try {
        const { phone } = req.body;
        const user = await User_1.default.findOne({ phone });
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
        await Status_1.default.findByIdAndUpdate(req.params.statusId, { $addToSet: { viewedBy: user._id } });
        res.json({ message: "Visto" });
    }
    catch {
        res.status(500).json({ error: "Error" });
    }
});
// DELETE /api/status/:statusId
router.delete("/:statusId", async (req, res) => {
    try {
        await Status_1.default.findByIdAndDelete(req.params.statusId);
        res.json({ message: "Estado eliminado" });
    }
    catch {
        res.status(500).json({ error: "Error" });
    }
});
exports.default = router;
