import { Router, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const uploadToCloudinary = (
  buffer: Buffer,
  mimetype: string,
  folder: string
): Promise<any> =>
  new Promise((resolve, reject) => {
    const resourceType =
      mimetype.startsWith("video") || mimetype.startsWith("audio")
        ? "video"
        : "image";
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: `nexttalk/${folder}` },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

const router = Router();

// POST /api/media/upload
router.post(
  "/upload",
  upload.single("file"),
  async (req: any, res: Response) => {
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

      const result = await uploadToCloudinary(
        req.file.buffer,
        mimetype,
        folder
      );

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
        thumbnail:
          type === "video"
            ? result.secure_url.replace("/upload/", "/upload/so_0/")
            : null,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Error al subir archivo" });
    }
  }
);

export default router;
