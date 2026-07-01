import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Usuario = sequelize.define("Usuario", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.STRING, defaultValue: "asesor" },
  estado: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export const Cliente = sequelize.define("Cliente", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dni: { type: DataTypes.STRING, allowNull: false },
  nombres: { type: DataTypes.STRING, allowNull: false },
  apellidos: { type: DataTypes.STRING, allowNull: false },
  correo: { type: DataTypes.STRING },
  celular: { type: DataTypes.STRING },
  direccion: { type: DataTypes.STRING },
  ingresoMensual: { type: DataTypes.FLOAT, defaultValue: 0 },
  tipoTrabajador: { type: DataTypes.STRING, defaultValue: "dependiente" },
  usuarioId: { type: DataTypes.INTEGER, allowNull: false }
});

export const Vehiculo = sequelize.define("Vehiculo", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  clienteId: { type: DataTypes.INTEGER, allowNull: false },
  marca: { type: DataTypes.STRING, allowNull: false },
  modelo: { type: DataTypes.STRING, allowNull: false },
  anio: { type: DataTypes.INTEGER },
  tipo: { type: DataTypes.STRING, defaultValue: "auto" },
  moneda: { type: DataTypes.STRING, defaultValue: "PEN" },
  precio: { type: DataTypes.FLOAT, allowNull: false }
});

export const Simulacion = sequelize.define("Simulacion", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  clienteId: { type: DataTypes.INTEGER, allowNull: false },
  vehiculoId: { type: DataTypes.INTEGER, allowNull: false },
  moneda: { type: DataTypes.STRING, allowNull: false },
  precioVehiculo: { type: DataTypes.FLOAT, allowNull: false },
  cuotaInicial: { type: DataTypes.FLOAT, allowNull: false },
  montoFinanciado: { type: DataTypes.FLOAT, allowNull: false },
  tipoTasa: { type: DataTypes.STRING, allowNull: false },
  tasaAnual: { type: DataTypes.FLOAT, allowNull: false },
  capitalizacion: { type: DataTypes.INTEGER, defaultValue: 12 },
  tea: { type: DataTypes.FLOAT, allowNull: false },
  tem: { type: DataTypes.FLOAT, allowNull: false },
  plazoMeses: { type: DataTypes.INTEGER, allowNull: false },
  tipoGracia: { type: DataTypes.STRING, defaultValue: "ninguna" },
  mesesGracia: { type: DataTypes.INTEGER, defaultValue: 0 },
  cuotaBalon: { type: DataTypes.FLOAT, allowNull: false },
  porcentajeBalon: { type: DataTypes.FLOAT, defaultValue: 0 },
  seguroMensual: { type: DataTypes.FLOAT, defaultValue: 0 },
  comisionMensual: { type: DataTypes.FLOAT, defaultValue: 0 },
  gastosMensuales: { type: DataTypes.FLOAT, defaultValue: 0 },
  resumen: { type: DataTypes.JSON, allowNull: false },
  flujosDeudor: { type: DataTypes.JSON, allowNull: true },
  tirPasos: { type: DataTypes.JSON, allowNull: true }
});

export const CronogramaPago = sequelize.define("CronogramaPago", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  simulacionId: { type: DataTypes.INTEGER, allowNull: false },
  numeroCuota: { type: DataTypes.INTEGER, allowNull: false },
  fechaPago: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.STRING, defaultValue: "ordinaria" },
  saldoInicial: { type: DataTypes.FLOAT, allowNull: false },
  interes: { type: DataTypes.FLOAT, allowNull: false },
  amortizacion: { type: DataTypes.FLOAT, allowNull: false },
  cuota: { type: DataTypes.FLOAT, allowNull: false },
  cuotaBalon: { type: DataTypes.FLOAT, defaultValue: 0 },
  seguro: { type: DataTypes.FLOAT, defaultValue: 0 },
  comision: { type: DataTypes.FLOAT, defaultValue: 0 },
  gastos: { type: DataTypes.FLOAT, defaultValue: 0 },
  flujoTotal: { type: DataTypes.FLOAT, allowNull: false },
  saldoFinal: { type: DataTypes.FLOAT, allowNull: false }
});

Usuario.hasMany(Cliente, { foreignKey: "usuarioId" });
Cliente.belongsTo(Usuario, { foreignKey: "usuarioId" });
Cliente.hasMany(Vehiculo, { foreignKey: "clienteId" });
Vehiculo.belongsTo(Cliente, { foreignKey: "clienteId" });
Cliente.hasMany(Simulacion, { foreignKey: "clienteId" });
Vehiculo.hasMany(Simulacion, { foreignKey: "vehiculoId" });
Simulacion.belongsTo(Cliente, { foreignKey: "clienteId" });
Simulacion.belongsTo(Vehiculo, { foreignKey: "vehiculoId" });
Simulacion.hasMany(CronogramaPago, { foreignKey: "simulacionId" });
CronogramaPago.belongsTo(Simulacion, { foreignKey: "simulacionId" });
