"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const https_1 = __importDefault(require("https"));
const router = (0, express_1.Router)();
// POST /api/ai/chat — proxy hacia Anthropic para evitar CORS en el frontend
// El frontend NUNCA debe llamar a api.anthropic.com directamente.
// Esta ruta hace la llamada desde el servidor (sin restricciones CORS).
router.post("/chat", async (req, res) => {
    try {
        const { messages, system } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "messages requerido" });
        }
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return res
                .status(500)
                .json({ error: "ANTHROPIC_API_KEY no configurada en el servidor" });
        }
        const payload = JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: system ||
                "Eres un asistente de seguridad y privacidad para SecureChat, una app de mensajería cifrada. " +
                    "Ayudas a los usuarios con dudas sobre privacidad, seguridad, cifrado, ajustes de la app y buenas prácticas digitales. " +
                    "Responde de forma clara, concisa y amigable en español. " +
                    "Nunca compartas información personal de usuarios. " +
                    "Si te preguntan algo fuera de tu rol, redirige gentilmente al tema de seguridad/privacidad.",
            messages,
        });
        // Llamada al API de Anthropic desde el servidor Node (sin CORS)
        const data = await new Promise((resolve, reject) => {
            const options = {
                hostname: "api.anthropic.com",
                path: "/v1/messages",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "Content-Length": Buffer.byteLength(payload),
                },
            };
            const httpReq = https_1.default.request(options, (httpRes) => {
                let body = "";
                httpRes.on("data", (chunk) => (body += chunk));
                httpRes.on("end", () => {
                    try {
                        resolve({ status: httpRes.statusCode, body: JSON.parse(body) });
                    }
                    catch {
                        reject(new Error("Respuesta inválida de Anthropic"));
                    }
                });
            });
            httpReq.on("error", reject);
            httpReq.write(payload);
            httpReq.end();
        });
        if (data.status !== 200) {
            const errMsg = data.body?.error?.message ?? `Error Anthropic: ${data.status}`;
            return res.status(data.status ?? 500).json({ error: errMsg });
        }
        res.json(data.body);
    }
    catch (err) {
        console.error("Error proxy IA:", err);
        res.status(500).json({ error: err.message ?? "Error interno del servidor" });
    }
});
exports.default = router;
