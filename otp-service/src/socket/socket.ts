import { Server, Socket } from "socket.io";
import User from "../models/User";

export const setupSocket = (io: Server) => {
  const onlineUsers = new Map<string, string>(); // phone -> socketId

  io.on("connection", (socket: Socket) => {
    // Usuario conectado: registrar presencia y unirse a sala personal
    socket.on("user_connected", async (phone: string) => {
      onlineUsers.set(phone, socket.id);

      // Sala personal: permite enviar notificaciones dirigidas a este usuario
      // (ej: "te agregaron a un grupo nuevo")
      socket.join(`user_${phone}`);

      await User.findOneAndUpdate(
        { phone },
        { online: true, lastSeen: new Date() }
      );
      socket.broadcast.emit("user_online", { phone });
    });

    // Unirse a sala de chat (para recibir mensajes en tiempo real)
    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
    });

    socket.on("leave_chat", (chatId: string) => {
      socket.leave(chatId);
    });

    // Indicador de escritura
    socket.on(
      "typing",
      ({ chatId, phone }: { chatId: string; phone: string }) => {
        socket.to(chatId).emit("user_typing", { chatId, phone });
      }
    );

    socket.on(
      "stop_typing",
      ({ chatId, phone }: { chatId: string; phone: string }) => {
        socket.to(chatId).emit("user_stop_typing", { chatId, phone });
      }
    );

    // Confirmación de entrega
    socket.on(
      "message_delivered",
      ({ messageId, chatId }: { messageId: string; chatId: string }) => {
        io.to(chatId).emit("message_delivered", { messageId });
      }
    );

    // Desconexión
    socket.on("disconnect", async () => {
      let disconnectedPhone: string | null = null;
      for (const [phone, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          disconnectedPhone = phone;
          onlineUsers.delete(phone);
          break;
        }
      }
      if (disconnectedPhone) {
        await User.findOneAndUpdate(
          { phone: disconnectedPhone },
          { online: false, lastSeen: new Date() }
        );
        socket.broadcast.emit("user_offline", {
          phone: disconnectedPhone,
          lastSeen: new Date(),
        });
      }
    });
  });
};