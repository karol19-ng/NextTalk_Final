"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
});
const uploadToCloudinary = (buffer, mimetype, folder) => new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith("video") || mimetype.startsWith("audio")
        ? "video"
        : "image";
    const stream = cloudinary_1.v2.uploader.upload_stream({ resource_type: resourceType, folder: `nexttalk/${folder}` }, (err, result) => (err ? reject(err) : resolve(result)));
    stream.end(buffer);
});
const router = (0, express_1.Router)();
// POST /api/media/upload
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "No se recibió archivo" });
        const { mimetype, originalname, size } = req.file;
        const folder = mimetype.startsWith("image")
            ? "images"
            : mimetype.startsWith("video")
                ? "videos"
                : mimetype.startsWith("audio")
                    ? "audio"
                    : "files";
        const result = await uploadToCloudinary(req.file.buffer, mimetype, folder);
        const type = mimetype.startsWith("image")
            ? "image"
            : mimetype.startsWith("video")
                ? "video"
                : mimetype.startsWith("audio")
                    ? "audio"
                    : "file";
        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            type,
            fileName: originalname,
            fileSize: size,
            duration: result.duration || null,
            thumbnail: type === "video"
                ? result.secure_url.replace("/upload/", "/upload/so_0/")
                : null,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Error al subir archivo" });
    }
});
exports.default = router;
