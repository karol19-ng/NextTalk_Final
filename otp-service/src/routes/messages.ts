import { Router, Request, Response } from "express";
import Message from "../models/Message";
import Chat from "../models/Chat";
import User from "../models/User";
import { io } from "../index";

const router = Router();

// GET /api/messages/:chatId
router.get("/:chatId", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({
      chat: req.params.chatId,
      deleted: false,
    })
      .populate("sender", "_id phone name avatar")
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    res.json({ messages: messages.reverse() });
  } catch {
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

// POST /api/messages — enviar mensaje
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      chatId,
      senderPhone,
      content,
      type = "text",
      mediaUrl,
      fileName,
      fileSize,
      duration,
    } = req.body;
    const sender = await User.findOne({ phone: senderPhone });
    if (!sender)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const message = await Message.create({
      chat: chatId,
      sender: sender._id,
      type,
      content,
      mediaUrl,
      fileName,
      fileSize,
      duration,
      status: "sent",
    });
    await message.populate("sender", "_id phone name avatar");
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    // Emitir en tiempo real
    io.to(chatId).emit("new_message", message);

    res.status(201).json({ message });
  } catch {
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
});

// PUT /api/messages/:messageId/read
router.put("/:messageId/read", async (req: Request, res: Response) => {
  try {
    const { readerPhone } = req.body;
    const reader = await User.findOne({ phone: readerPhone });
    if (!reader)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { $addToSet: { readBy: reader._id }, status: "read" },
      { new: true }
    );
    if (!message)
      return res.status(404).json({ error: "Mensaje no encontrado" });

    io.to(message.chat.toString()).emit("message_read", {
      messageId: message._id,
      readerId: reader._id,
    });
    res.json({ message });
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

// PUT /api/messages/:messageId/edit
router.put("/:messageId/edit", async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { content, edited: true },
      { new: true }
    ).populate("sender", "_id phone name avatar");

    if (!message)
      return res.status(404).json({ error: "Mensaje no encontrado" });
    io.to(message.chat.toString()).emit("message_edited", message);
    res.json({ message });
  } catch {
    res.status(500).json({ error: "Error al editar" });
  }
});

// DELETE /api/messages/:messageId
router.delete("/:messageId", async (req: Request, res: Response) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { deleted: true, content: "Mensaje eliminado" },
      { new: true }
    );
    if (!message)
      return res.status(404).json({ error: "Mensaje no encontrado" });
    io.to(message.chat.toString()).emit("message_deleted", {
      messageId: message._id,
    });
    res.json({ message: "Mensaje eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

export default router;
