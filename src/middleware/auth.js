import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Usuario } from "../models/index.js";

export async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Token no enviado" });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await Usuario.findByPk(payload.id, {
      attributes: ["id", "nombre", "email", "rol", "estado"]
    });

    if (!user || !user.estado) {
      return res.status(401).json({ message: "Usuario no autorizado" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}
