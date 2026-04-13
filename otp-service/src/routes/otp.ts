import { Router, Request, Response } from "express";
import { OTP, RegisteredPhone } from "../models/OTP";
import User from "../models/User";
import mongoose from "mongoose";
//import RegisteredPhone from "../models/RegisteredPhone";

const router = Router();

const generateCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const createOTP = async (phone: string) => {
  await OTP.deleteMany({ phone, verified: false });
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await OTP.create({ phone, code, expiresAt });
  return code;
};

// POST /api/otp/send — LOGIN (número debe existir)
router.post("/send", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Número requerido" });

    const registered = await RegisteredPhone.findOne({ phone });
    if (!registered) {
      return res.status(403).json({
        error: "Número no registrado",
        message: "Este número no tiene cuenta. ¿Quieres registrarte?",
      });
    }

    const code = await createOTP(phone);
    res.json({ success: true, phone, code, expiresIn: 600 });
  } catch {
    res.status(500).json({ error: "Error al generar código" });
  }
});

// POST /api/otp/send-register — REGISTRO (número NO debe existir)
router.post("/send-register", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Número requerido" });

    const existing = await RegisteredPhone.findOne({ phone });
    if (existing) {
      return res.status(409).json({
        error: "Número ya registrado",
        message: "Este número ya tiene cuenta. Inicia sesión en su lugar.",
      });
    }

    const code = await createOTP(phone);
    res.json({ success: true, phone, code, expiresIn: 600 });
  } catch {
    res.status(500).json({ error: "Error al generar código" });
  }
});

// POST /api/otp/verify — verifica código (login y registro)
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code)
      return res.status(400).json({ error: "Número y código requeridos" });

    const otp = await OTP.findOne({
      phone,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp)
      return res
        .status(400)
        .json({ error: "Código expirado. Solicita uno nuevo." });

    if (otp.attempts >= 5) {
      await OTP.deleteOne({ _id: otp._id });
      return res
        .status(400)
        .json({ error: "Demasiados intentos. Solicita un nuevo código." });
    }

    if (otp.code !== code) {
      otp.attempts += 1;
      await otp.save();
      return res.status(400).json({
        error: "Código incorrecto",
        attemptsLeft: 5 - otp.attempts,
      });
    }

    otp.verified = true;
    await otp.save();

    const registered = await RegisteredPhone.findOne({ phone });
    res.json({
      success: true,
      phone,
      name: registered?.name || "",
      message: "Verificación exitosa",
    });
  } catch {
    res.status(500).json({ error: "Error al verificar código" });
  }
});

// POST /api/otp/register — guardar número tras registro exitoso
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: "Número requerido" });

    const existing = await RegisteredPhone.findOne({ phone });
    if (existing) {
      if (name) {
        existing.name = name;
        await existing.save();
      }
      // Sincronizar también en User
      await User.findOneAndUpdate(
        { phone },
        { name: name || existing.name || phone },
        { upsert: true, new: true }
      );
      return res.json({ message: "Perfil actualizado", phone: existing.phone });
    }

    const registered = await RegisteredPhone.create({
      phone,
      name: name || "",
    });

    // ✅ Crear también en la colección User
    await User.findOneAndUpdate(
      { phone },
      { phone, name: name || phone },
      { upsert: true, new: true }
    );

    res
      .status(201)
      .json({ message: "Número registrado", phone: registered.phone });
  } catch {
    res.status(500).json({ error: "Error al registrar número" });
  }
});

// GET /api/otp/check/:phone
router.get("/check/:phone", async (req: Request, res: Response) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const registered = await RegisteredPhone.findOne({ phone });
    res.json({ registered: !!registered, name: registered?.name || "" });
  } catch {
    res.status(500).json({ error: "Error al verificar" });
  }
});

// GET /api/otp/registered
router.get("/registered", async (_req: Request, res: Response) => {
  try {
    const phones = await RegisteredPhone.find().sort({ createdAt: -1 });
    res.json({ phones });
  } catch {
    res.status(500).json({ error: "Error al obtener números" });
  }
});

// GET /api/otp/migrate — crea Users desde RegisteredPhones existentes
router.get("/migrate", async (_req, res) => {
  try {
    const phones = await RegisteredPhone.find();
    let created = 0;
    for (const p of phones) {
      await User.findOneAndUpdate(
        { phone: p.phone },
        { phone: p.phone, name: p.name || p.phone },
        { upsert: true, new: true }
      );
      created++;
    }
    res.json({ message: `Migrados ${created} usuarios` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/otp/fix-index — eliminar índice problemático
router.get("/fix-index", async (_req, res) => {
  try {
    await mongoose.connection.collection("users").dropIndex("firebaseUid_1");
    res.json({ message: "Índice eliminado" });
  } catch (err: any) {
    res.json({
      message: "Índice no existía o ya fue eliminado",
      detail: err.message,
    });
  }
});

export default router;
