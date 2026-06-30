import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/index.js";
import { env } from "../config/env.js";
import { authRequired } from "../middleware/auth.js";

export const authRouter = Router();

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: "8h" });
}

authRouter.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Nombre, email y password son obligatorios" });
    }

    const exists = await Usuario.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: "El correo ya está registrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Usuario.create({ nombre, email, passwordHash });
    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
    });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Usuario.findOne({ where: { email } });

    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
});

authRouter.get("/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});
