"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// POST /api/contacts — agregar contacto (usado por el cliente)
router.post("/", async (req, res) => {
    try {
        const { phone: contactPhone } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: "No autorizado" });
        const token = authHeader.replace("Bearer ", "");
        const newLocal = "jsonwebtoken";
        const jwt = await Promise.resolve(`${newLocal}`).then(s => __importStar(require(s)));
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "secret");
        const myPhone = decoded.phone;
        if (!contactPhone)
            return res.status(400).json({ error: "Número requerido" });
        if (myPhone === contactPhone)
            return res.status(400).json({ error: "No puedes agregarte a ti mismo" });
        const me = await User_1.default.findOne({ phone: myPhone });
        if (!me)
            return res.status(404).json({ error: "Usuario no encontrado" });
        const contact = await User_1.default.findOne({ phone: contactPhone });
        if (!contact)
            return res
                .status(404)
                .json({ error: "Ese número no está registrado en NextTalk" });
        const alreadyAdded = me.contacts.some((id) => id.toString() === contact._id.toString());
        if (alreadyAdded)
            return res.status(400).json({ error: "Ya es tu contacto" });
        me.contacts.push(contact._id);
        await me.save();
        // Buscar o crear chat entre los dos
        const Chat = (await Promise.resolve().then(() => __importStar(require("../models/Chat")))).default;
        let chat = await Chat.findOne({
            participants: { $all: [me._id, contact._id], $size: 2 },
        });
        if (!chat) {
            chat = await Chat.create({
                participants: [me._id, contact._id],
                messages: [],
            });
        }
        res.json({
            contact: {
                _id: contact._id,
                phone: contact.phone,
                name: contact.name,
                avatar: contact.avatar,
                online: contact.online,
            },
            chat: {
                _id: chat._id,
                participants: chat.participants,
            },
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message || "Error al agregar contacto" });
    }
});
// GET /api/contacts/:phone — listar contactos
router.get("/:phone", async (req, res) => {
    try {
        const phone = decodeURIComponent(req.params.phone);
        const user = await User_1.default.findOne({ phone }).populate("contacts", "_id phone name avatar online lastSeen status");
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
        res.json({ contacts: user.contacts });
    }
    catch {
        res.status(500).json({ error: "Error al obtener contactos" });
    }
});
// POST /api/contacts/:phone/add — agregar contacto por número
router.post("/:phone/add", async (req, res) => {
    try {
        const phone = decodeURIComponent(req.params.phone);
        const { contactPhone } = req.body;
        if (!contactPhone)
            return res.status(400).json({ error: "Número requerido" });
        if (phone === contactPhone)
            return res.status(400).json({ error: "No puedes agregarte a ti mismo" });
        const me = await User_1.default.findOne({ phone });
        if (!me)
            return res.status(404).json({ error: "Usuario no encontrado" });
        const contact = await User_1.default.findOne({ phone: contactPhone });
        if (!contact)
            return res
                .status(404)
                .json({ error: "Ese número no está registrado en NextTalk" });
        const alreadyAdded = me.contacts.some((id) => id.toString() === contact._id.toString());
        if (alreadyAdded)
            return res.status(400).json({ error: "Ya es tu contacto" });
        me.contacts.push(contact._id);
        await me.save();
        res.json({
            contact: {
                _id: contact._id,
                phone: contact.phone,
                name: contact.name,
                avatar: contact.avatar,
                online: contact.online,
            },
        });
    }
    catch {
        res.status(500).json({ error: "Error al agregar contacto" });
    }
});
// DELETE /api/contacts/:phone/remove/:contactId
router.delete("/:phone/remove/:contactId", async (req, res) => {
    try {
        const phone = decodeURIComponent(req.params.phone);
        const me = await User_1.default.findOne({ phone });
        if (!me)
            return res.status(404).json({ error: "Usuario no encontrado" });
        me.contacts = me.contacts.filter((id) => id.toString() !== req.params.contactId);
        await me.save();
        res.json({ message: "Contacto eliminado" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar contacto" });
    }
});
exports.default = router;
