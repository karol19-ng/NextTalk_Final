import { Router, Request, Response } from "express";
import Status from "../models/Status";
import User from "../models/User";

const router = Router();

// GET /api/status/:phone — estados de contactos
router.get("/:phone", async (req: Request, res: Response) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const me = await User.findOne({ phone }).populate("contacts");
    if (!me) return res.status(404).json({ error: "Usuario no encontrado" });

    const contactIds = (me.contacts as any[]).map((c: any) => c._id);
    const statuses = await Status.find({
      user: { $in: [...contactIds, me._id] },
      expiresAt: { $gt: new Date() },
    }).populate("user", "_id phone name avatar").sort({ createdAt: -1 });

    const grouped: Record<string, any> = {};
    statuses.forEach((s) => {
      const uid = (s.user as any)._id.toString();
      if (!grouped[uid]) grouped[uid] = { user: s.user, statuses: [] };
      grouped[uid].statuses.push(s);
    });

    res.json({ statuses: Object.values(grouped) });
  } catch { res.status(500).json({ error: "Error al obtener estados" }); }
});

// POST /api/status — publicar estado
router.post("/", async (req: Request, res: Response) => {
  try {
    const { phone, type, content, caption, bgColor } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const status = await Status.create({ user: user._id, type, content, caption, bgColor, expiresAt });
    await status.populate("user", "_id phone name avatar");
    res.status(201).json({ status });
  } catch { res.status(500).json({ error: "Error al publicar estado" }); }
});

// PUT /api/status/:statusId/view
router.put("/:statusId/view", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    await Status.findByIdAndUpdate(req.params.statusId, { $addToSet: { viewedBy: user._id } });
    res.json({ message: "Visto" });
  } catch { res.status(500).json({ error: "Error" }); }
});

// DELETE /api/status/:statusId
router.delete("/:statusId", async (req: Request, res: Response) => {
  try {
    await Status.findByIdAndDelete(req.params.statusId);
    res.json({ message: "Estado eliminado" });
  } catch { res.status(500).json({ error: "Error" }); }
});

export default router;