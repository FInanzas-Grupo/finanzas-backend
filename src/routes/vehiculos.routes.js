import { Router } from "express";
import { Cliente, Vehiculo } from "../models/index.js";
import { authRequired } from "../middleware/auth.js";

export const vehiculosRouter = Router();
vehiculosRouter.use(authRequired);

vehiculosRouter.get("/", async (req, res) => {
  const vehiculos = await Vehiculo.findAll({
    include: [{ model: Cliente, where: { usuarioId: req.user.id } }],
    order: [["id", "DESC"]]
  });
  res.json(vehiculos);
});

vehiculosRouter.post("/", async (req, res) => {
  try {
    const cliente = await Cliente.findOne({ where: { id: req.body.clienteId, usuarioId: req.user.id } });
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });

    const vehiculo = await Vehiculo.create(req.body);
    res.status(201).json(vehiculo);
  } catch (error) {
    res.status(400).json({ message: "No se pudo registrar el vehículo", error: error.message });
  }
});

vehiculosRouter.put("/:id", async (req, res) => {
  const vehiculo = await Vehiculo.findByPk(req.params.id, { include: [Cliente] });
  if (!vehiculo || vehiculo.Cliente.usuarioId !== req.user.id) {
    return res.status(404).json({ message: "Vehículo no encontrado" });
  }
  await vehiculo.update(req.body);
  res.json(vehiculo);
});

vehiculosRouter.delete("/:id", async (req, res) => {
  const vehiculo = await Vehiculo.findByPk(req.params.id, { include: [Cliente] });
  if (!vehiculo || vehiculo.Cliente.usuarioId !== req.user.id) {
    return res.status(404).json({ message: "Vehículo no encontrado" });
  }
  await vehiculo.destroy();
  res.json({ message: "Vehículo eliminado" });
});
