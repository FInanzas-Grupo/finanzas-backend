import { Router } from "express";
import { Cliente, Vehiculo, Simulacion, CronogramaPago } from "../models/index.js";
import { authRequired } from "../middleware/auth.js";
import { calcularSimulacion } from "../utils/finance.js";

export const simulacionesRouter = Router();
simulacionesRouter.use(authRequired);

simulacionesRouter.get("/", async (req, res) => {
  const simulaciones = await Simulacion.findAll({
    include: [
      { model: Cliente, where: { usuarioId: req.user.id } },
      { model: Vehiculo }
    ],
    order: [["id", "DESC"]]
  });
  res.json(simulaciones);
});

simulacionesRouter.get("/:id", async (req, res) => {
  const simulacion = await Simulacion.findByPk(req.params.id, {
    include: [Cliente, Vehiculo, CronogramaPago]
  });

  if (!simulacion || simulacion.Cliente.usuarioId !== req.user.id) {
    return res.status(404).json({ message: "Simulación no encontrada" });
  }

  res.json(simulacion);
});

simulacionesRouter.post("/", async (req, res) => {
  try {
    const cliente = await Cliente.findOne({ where: { id: req.body.clienteId, usuarioId: req.user.id } });
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });

    const vehiculo = await Vehiculo.findOne({ where: { id: req.body.vehiculoId, clienteId: cliente.id } });
    if (!vehiculo) return res.status(404).json({ message: "Vehículo no encontrado" });

    const resultado = calcularSimulacion({
      ...req.body,
      precioVehiculo: req.body.precioVehiculo || vehiculo.precio,
      moneda: req.body.moneda || vehiculo.moneda
    });

    const sim = await Simulacion.create({
      clienteId: cliente.id,
      vehiculoId: vehiculo.id,
      moneda: resultado.parametros.moneda,
      precioVehiculo: resultado.parametros.precioVehiculo,
      cuotaInicial: resultado.parametros.cuotaInicial,
      montoFinanciado: resultado.parametros.montoFinanciado,
      tipoTasa: resultado.parametros.tipoTasa,
      tasaAnual: resultado.parametros.tasaAnual,
      capitalizacion: resultado.parametros.capitalizacion,
      tea: resultado.parametros.tea,
      tem: resultado.parametros.tem,
      plazoMeses: resultado.parametros.plazoMeses,
      tipoGracia: resultado.parametros.tipoGracia,
      mesesGracia: resultado.parametros.mesesGracia,
      cuotaBalon: resultado.parametros.cuotaBalon,
      porcentajeBalon: resultado.parametros.porcentajeBalon,
      seguroMensual: resultado.parametros.seguroMensual,
      comisionMensual: resultado.parametros.comisionMensual,
      gastosMensuales: resultado.parametros.gastosMensuales,
      resumen: resultado.indicadores
    });

    const rows = resultado.cronograma.map(row => ({ ...row, simulacionId: sim.id }));
    await CronogramaPago.bulkCreate(rows);

    const created = await Simulacion.findByPk(sim.id, { include: [Cliente, Vehiculo, CronogramaPago] });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: "No se pudo calcular la simulación", error: error.message });
  }
});
