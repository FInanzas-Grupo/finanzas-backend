import { Router } from "express";
import { Cliente } from "../models/index.js";
import { authRequired } from "../middleware/auth.js";

export const clientesRouter = Router();
clientesRouter.use(authRequired);

clientesRouter.get("/", async (req, res) => {
  const clientes = await Cliente.findAll({ where: { usuarioId: req.user.id }, order: [["id", "DESC"]] });
  res.json(clientes);
});

clientesRouter.post("/", async (req, res) => {
  try {
    const cliente = await Cliente.create({ ...req.body, usuarioId: req.user.id });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ message: "No se pudo registrar el cliente", error: error.message });
  }
});

clientesRouter.put("/:id", async (req, res) => {
  const cliente = await Cliente.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });
  if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
  await cliente.update(req.body);
  res.json(cliente);
});

clientesRouter.delete("/:id", async (req, res) => {
  const cliente = await Cliente.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });
  if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
  await cliente.destroy();
  res.json({ message: "Cliente eliminado" });
});
