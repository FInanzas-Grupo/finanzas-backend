import { calcularSimulacion } from "./finance.js";

const resultado = calcularSimulacion({
  moneda: "PEN",
  precioVehiculo: 85000,
  cuotaInicial: 17000,
  tipoTasa: "efectiva",
  tasaAnual: 18,
  plazoMeses: 36,
  tipoGracia: "parcial",
  mesesGracia: 2,
  porcentajeBalon: 50,
  seguroMensual: 80,
  comisionMensual: 10,
  gastosMensuales: 5,
  fechaInicio: "2026-06-21"
});

console.log(resultado.indicadores);
console.table(resultado.cronograma.slice(0, 5));
