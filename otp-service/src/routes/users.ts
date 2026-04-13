import { Router, Request, Response } from "express";
import User from "../models/User";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

// GET /api/users/:phone
router.get("/:phone", async (req: Request, res: Response) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const user = await User.findOne({ phone }).select("-__v");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ user });
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

// PUT /api/users/:phone — actualizar perfil
router.put("/:phone", async (req: Request, res: Response) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const { name, status } = req.body;
    const user = await User.findOneAndUpdate(
      { phone },
      { name, status },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ user });
  } catch {
    res.status(500).json({ error: "Error al actualizar" });
  }
});

// POST /api/users/:phone/avatar — subir foto de perfil
router.post(
  "/:phone/avatar",
  upload.single("avatar"),
  async (req: any, res: Response) => {
    try {
      const phone = decodeURIComponent(req.params.phone);
      if (!req.file)
        return res.status(400).json({ error: "No se recibió imagen" });

      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "nexttalk/avatars",
            transformation: [{ width: 300, height: 300, crop: "fill" }],
          },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file!.buffer);
      });

      const user = await User.findOneAndUpdate(
        { phone },
        { avatar: result.secure_url },
        { new: true }
      );
      res.json({ url: result.secure_url, user });
    } catch {
      res.status(500).json({ error: "Error al subir avatar" });
    }
  }
);

// GET /api/users/search?phone=+506...
router.get("/search/by-phone", async (req: Request, res: Response) => {
  try {
    const { phone } = req.query as { phone: string };
    const user = await User.findOne({ phone }).select(
      "_id phone name avatar online lastSeen"
    );
    if (!user)
      return res
        .status(404)
        .json({ error: "Usuario no encontrado en NextTalk" });
    res.json({ user });
  } catch {
    res.status(500).json({ error: "Error al buscar" });
  }
});

export default router;
