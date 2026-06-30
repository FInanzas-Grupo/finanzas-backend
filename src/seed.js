import bcrypt from "bcryptjs";
import { sequelize } from "./config/db.js";
import { Usuario, Cliente, Vehiculo } from "./models/index.js";

async function seed() {
  await sequelize.sync({ alter: true });

  const passwordHash = await bcrypt.hash("123456", 10);
  const user = await Usuario.create({
    nombre: "Administrador FINANCES",
    email: "admin@finances.com",
    passwordHash,
    rol: "admin"
  });

  const cliente = await Cliente.create({
    usuarioId: user.id,
    dni: "71234567",
    nombres: "Carlos",
    apellidos: "Ramírez Torres",
    correo: "carlos@example.com",
    celular: "999888777",
    direccion: "Lima, Perú",
    ingresoMensual: 4500,
    tipoTrabajador: "dependiente"
  });

  await Vehiculo.create({
    clienteId: cliente.id,
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2024,
    tipo: "sedán",
    moneda: "PEN",
    precio: 85000
  });

  console.log("Seed completado");
  console.log("Usuario: admin@finances.com");
  console.log("Clave: 123456");
  await sequelize.close();
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
