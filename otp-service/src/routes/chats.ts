import { Router, Request, Response } from "express";
import Chat from "../models/Chat";
import User from "../models/User";
import Message from "../models/Message";
import { io } from "../index";

const router = Router();

// ⚠️ IMPORTANTE: la ruta /group debe ir ANTES de /:chatId
// Si va después, Express interpreta "group" como un chatId y falla silenciosamente.

// POST /api/chats/group — crear grupo
router.post("/group", async (req: Request, res: Response) => {
  try {
    const { myPhone, participantPhones, groupName, groupAvatar } = req.body;
    const me = await User.findOne({ phone: myPhone });
    if (!me) return res.status(404).json({ error: "Usuario no encontrado" });

    const participants = await User.find({ phone: { $in: participantPhones } });
    if (participants.length === 0)
      return res.status(400).json({ error: "No se encontraron participantes" });

    const allIds = [me._id, ...participants.map((p) => p._id)];

    const chat = await Chat.create({
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
    allPhones.forEach((phone: string) => {
      io.to(`user_${phone}`).emit("new_group", { chat });
    });

    res.status(201).json({ chat });
  } catch (err) {
    console.error("Error al crear grupo:", err);
    res.status(500).json({ error: "Error al crear grupo" });
  }
});

// GET /api/chats/:phone — listar chats del usuario
router.get("/:phone", async (req: Request, res: Response) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const me = await User.findOne({ phone });
    if (!me) return res.status(404).json({ error: "Usuario no encontrado" });

    const chats = await Chat.find({ participants: me._id })
      .populate("participants", "_id phone name avatar online lastSeen")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name phone" },
      })
      .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch {
    res.status(500).json({ error: "Error al obtener chats" });
  }
});

// POST /api/chats — crear o abrir chat 1 a 1
router.post("/", async (req: Request, res: Response) => {
  try {
    const { myPhone, participantPhone } = req.body;
    const me = await User.findOne({ phone: myPhone });
    const participant = await User.findOne({ phone: participantPhone });
    if (!me || !participant)
      return res.status(404).json({ error: "Usuario no encontrado" });

    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [me._id, participant._id], $size: 2 },
    }).populate("participants", "_id phone name avatar online lastSeen");

    if (!chat) {
      chat = await Chat.create({
        participants: [me._id, participant._id],
        isGroup: false,
      });
      await chat.populate(
        "participants",
        "_id phone name avatar online lastSeen"
      );
    }

    res.json({ chat });
  } catch {
    res.status(500).json({ error: "Error al crear chat" });
  }
});

// DELETE /api/chats/:chatId
router.delete("/:chatId", async (req: Request, res: Response) => {
  try {
    await Chat.findByIdAndDelete(req.params.chatId);
    await Message.deleteMany({ chat: req.params.chatId });
    res.json({ message: "Chat eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar chat" });
  }
});

export default router;