"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});
const router = (0, express_1.Router)();
// GET /api/users/:phone
router.get("/:phone", async (req, res) => {
    try {
        const phone = decodeURIComponent(req.params.phone);
        const user = await User_1.default.findOne({ phone }).select("-__v");
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
        res.json({ user });
    }
    catch {
        res.status(500).json({ error: "Error" });
    }
});
// PUT /api/users/:phone — actualizar perfil
router.put("/:phone", async (req, res) => {
    try {
        const phone = decodeURIComponent(req.params.phone);
        const { name, status } = req.body;
        const user = await User_1.default.findOneAndUpdate({ phone }, { name, status }, { new: true });
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
        res.json({ user });
    }
    catch {
        res.status(500).json({ error: "Error al actualizar" });
    }
});
// POST /api/users/:phone/avatar — subir foto de perfil
router.post("/:phone/avatar", upload.single("avatar"), async (req, res) => {
    try {
        const phone = decodeURIComponent(req.params.phone);
        if (!req.file)
            return res.status(400).json({ error: "No se recibió imagen" });
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({
                folder: "nexttalk/avatars",
                transformation: [{ width: 300, height: 300, crop: "fill" }],
            }, (err, result) => (err ? reject(err) : resolve(result)));
            stream.end(req.file.buffer);
        });
        const user = await User_1.default.findOneAndUpdate({ phone }, { avatar: result.secure_url }, { new: true });
        res.json({ url: result.secure_url, user });
    }
    catch {
        res.status(500).json({ error: "Error al subir avatar" });
    }
});
// GET /api/users/search?phone=+506...
router.get("/search/by-phone", async (req, res) => {
    try {
        const { phone } = req.query;
        const user = await User_1.default.findOne({ phone }).select("_id phone name avatar online lastSeen");
        if (!user)
            return res
                .status(404)
                .json({ error: "Usuario no encontrado en NextTalk" });
        res.json({ user });
    }
    catch {
        res.status(500).json({ error: "Error al buscar" });
    }
});
exports.default = router;
