import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { clientesRouter } from "./routes/clientes.routes.js";
import { vehiculosRouter } from "./routes/vehiculos.routes.js";
import { simulacionesRouter } from "./routes/simulaciones.routes.js";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "FINANCES Server" });
});

app.use("/api/auth", authRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/vehiculos", vehiculosRouter);
app.use("/api/simulaciones", simulacionesRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});
