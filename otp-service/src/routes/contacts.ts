import { Router, Request, Response } from "express";
import User from "../models/User";

const router = Router();

// POST /api/contacts — agregar contacto (usado por el cliente)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { phone: contactPhone } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });

    const token = authHeader.replace("Bearer ", "");
    const newLocal = "jsonwebtoken";
    const jwt = await import(newLocal);
    const decoded: any = jwt.default.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );
    const myPhone = decoded.phone;

    if (!contactPhone)
      return res.status(400).json({ error: "Número requerido" });
    if (myPhone === contactPhone)
      return res.status(400).json({ error: "No puedes agregarte a ti mismo" });

    const me = await User.findOne({ phone: myPhone });
    if (!me) return res.status(404).json({ error: "Usuario no encontrado" });

    const contact = await User.findOne({ phone: contactPhone });
    if (!contact)
      return res
        .status(404)
        .json({ error: "Ese número no está registrado en NextTalk" });

    const alreadyAdded = me.contacts.some(
      (id) => id.toString() === contact._id.toString()
    );
    if (alreadyAdded)
      return res.status(400).json({ error: "Ya es tu contacto" });

    me.contacts.push(contact._id as any);
    await me.save();

    // Buscar o crear chat entre los dos
    const Chat = (await import("../models/Chat")).default;
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
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Error al agregar contacto" });
  }
});

// GET /api/contacts/:phone — listar contactos
router.get("/:phone", async (req: Request, res: Response) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const user = await User.findOne({ phone }).populate(
      "contacts",
      "_id phone name avatar online lastSeen status"
    );
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ contacts: user.contacts });
  } catch {
    res.status(500).json({ error: "Error al obtener contactos" });
  }
});

// POST /api/contacts/:phone/add — agregar contacto por número
router.post("/:phone/add", async (req: Request, res: Response) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const { contactPhone } = req.body;
    if (!contactPhone)
      return res.status(400).json({ error: "Número requerido" });
    if (phone === contactPhone)
      return res.status(400).json({ error: "No puedes agregarte a ti mismo" });

    const me = await User.findOne({ phone });
    if (!me) return res.status(404).json({ error: "Usuario no encontrado" });

    const contact = await User.findOne({ phone: contactPhone });
    if (!contact)
      return res
        .status(404)
        .json({ error: "Ese número no está registrado en NextTalk" });

    const alreadyAdded = me.contacts.some(
      (id) => id.toString() === contact._id.toString()
    );
    if (alreadyAdded)
      return res.status(400).json({ error: "Ya es tu contacto" });

    me.contacts.push(contact._id as any);
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
  } catch {
    res.status(500).json({ error: "Error al agregar contacto" });
  }
});

// DELETE /api/contacts/:phone/remove/:contactId
router.delete(
  "/:phone/remove/:contactId",
  async (req: Request, res: Response) => {
    try {
      const phone = decodeURIComponent(req.params.phone);
      const me = await User.findOne({ phone });
      if (!me) return res.status(404).json({ error: "Usuario no encontrado" });
      me.contacts = me.contacts.filter(
        (id) => id.toString() !== req.params.contactId
      ) as any;
      await me.save();
      res.json({ message: "Contacto eliminado" });
    } catch {
      res.status(500).json({ error: "Error al eliminar contacto" });
    }
  }
);

export default router;
