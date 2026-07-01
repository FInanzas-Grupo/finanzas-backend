import { app } from "./app.js";
import { sequelize } from "./config/db.js";
import { env } from "./config/env.js";
import "./models/index.js";

async function bootstrap() {
  await sequelize.sync({ alter: true });
  app.listen(env.port, () => {
    console.log(`FINANCES Server listo en http://localhost:${env.port}/api`);
  });
}

bootstrap().catch(error => {
  console.error("Error al iniciar servidor:", error);
  process.exit(1);
});
