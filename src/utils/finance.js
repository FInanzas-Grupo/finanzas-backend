export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function toDecimal(percent) {
  return Number(percent) / 100;
}

export function convertAnnualRateToTEA({ tipoTasa, tasaAnual, capitalizacion = 12 }) {
  const r = toDecimal(tasaAnual);

  if (tipoTasa === "efectiva") {
    return r;
  }

  if (tipoTasa === "nominal") {
    const m = Number(capitalizacion || 12);
    if (m <= 0) throw new Error("La capitalización debe ser mayor a cero");
    return Math.pow(1 + r / m, m) - 1;
  }

  throw new Error("Tipo de tasa no reconocido. Use 'efectiva' o 'nominal'.");
}

export function teaToTem(tea) {
  // Meses ordinarios de 30 días y año comercial de 360 días: 30/360 = 1/12
  return Math.pow(1 + Number(tea), 1 / 12) - 1;
}

export function cuotaFrancesaConBalon({ principal, tem, cuotas, cuotaBalon }) {
  if (cuotas <= 0) throw new Error("El plazo de cuotas debe ser mayor a cero");
  if (tem === 0) return (principal - cuotaBalon) / cuotas;

  const vN = Math.pow(1 + tem, -cuotas);
  const factorAnualidad = (1 - vN) / tem;
  const cuota = (principal - cuotaBalon * vN) / factorAnualidad;

  if (!Number.isFinite(cuota) || cuota < 0) {
    throw new Error("La cuota calculada no es válida. Revise cuota balón, tasa y plazo.");
  }

  return cuota;
}

export function npv(rate, cashflows) {
  return cashflows.reduce((acc, cf, index) => acc + cf / Math.pow(1 + rate, index), 0);
}

export function irr(cashflows) {
  // Búsqueda por bisección. Suficiente para un MVP académico.
  let low = -0.9999;
  let high = 10;
  let mid = 0;

  const npvLow = npv(low, cashflows);
  const npvHigh = npv(high, cashflows);

  if (Math.sign(npvLow) === Math.sign(npvHigh)) {
    return null;
  }

  for (let i = 0; i < 200; i++) {
    mid = (low + high) / 2;
    const value = npv(mid, cashflows);

    if (Math.abs(value) < 1e-7) return mid;

    if (Math.sign(value) === Math.sign(npv(low, cashflows))) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return mid;
}

export function addMonths30Days(dateString, months) {
  const date = new Date(dateString || new Date().toISOString().slice(0, 10));
  date.setDate(date.getDate() + months * 30);
  return date.toISOString().slice(0, 10);
}

export function calcularSimulacion(input) {
  const precioVehiculo = Number(input.precioVehiculo);
  const cuotaInicial = Number(input.cuotaInicial || 0);
  const plazoMeses = Number(input.plazoMeses);
  const mesesGracia = Number(input.mesesGracia || 0);
  const seguroMensual = Number(input.seguroMensual || 0);
  const comisionMensual = Number(input.comisionMensual || 0);
  const gastosMensuales = Number(input.gastosMensuales || 0);
  const porcentajeBalon = Number(input.porcentajeBalon || 0);
  const cuotaBalon = input.cuotaBalon !== undefined && input.cuotaBalon !== ""
    ? Number(input.cuotaBalon)
    : precioVehiculo * porcentajeBalon / 100;

  if (precioVehiculo <= 0) throw new Error("El precio del vehículo debe ser mayor a cero");
  if (cuotaInicial < 0 || cuotaInicial >= precioVehiculo) throw new Error("La cuota inicial debe ser menor al precio del vehículo");
  if (plazoMeses <= 0) throw new Error("El plazo debe ser mayor a cero");
  if (mesesGracia < 0 || mesesGracia >= plazoMeses) throw new Error("Los meses de gracia deben ser menores al plazo total");
  if (cuotaBalon < 0) throw new Error("La cuota balón no puede ser negativa");

  const montoFinanciado = precioVehiculo - cuotaInicial;
  if (cuotaBalon > montoFinanciado) throw new Error("La cuota balón no puede superar el monto financiado");

  const tea = convertAnnualRateToTEA({
    tipoTasa: input.tipoTasa,
    tasaAnual: Number(input.tasaAnual),
    capitalizacion: Number(input.capitalizacion || 12)
  });
  const tem = teaToTem(tea);

  const tipoGracia = input.tipoGracia || "ninguna";
  const fechaInicio = input.fechaInicio || new Date().toISOString().slice(0, 10);
  const cronograma = [];
  const flujosDeudor = [montoFinanciado];

  let saldo = montoFinanciado;

  for (let m = 1; m <= mesesGracia; m++) {
    const interes = saldo * tem;
    let cuota = 0;
    let amortizacion = 0;
    let saldoFinal = saldo;
    let tipo = "gracia-parcial";

    if (tipoGracia === "total") {
      saldoFinal = saldo + interes;
      tipo = "gracia-total";
    } else if (tipoGracia === "parcial") {
      cuota = interes;
      saldoFinal = saldo;
    }

    const flujoTotal = cuota + seguroMensual + comisionMensual + gastosMensuales;
    flujosDeudor.push(-round2(flujoTotal));

    cronograma.push({
      numeroCuota: m,
      fechaPago: addMonths30Days(fechaInicio, m),
      tipo,
      saldoInicial: round2(saldo),
      interes: round2(interes),
      amortizacion: round2(amortizacion),
      cuota: round2(cuota),
      cuotaBalon: 0,
      seguro: round2(seguroMensual),
      comision: round2(comisionMensual),
      gastos: round2(gastosMensuales),
      flujoTotal: round2(flujoTotal),
      saldoFinal: round2(saldoFinal)
    });

    saldo = saldoFinal;
  }

  const cuotasRestantes = plazoMeses - mesesGracia;
  const cuotaOrdinaria = cuotaFrancesaConBalon({
    principal: saldo,
    tem,
    cuotas: cuotasRestantes,
    cuotaBalon
  });

  for (let k = 1; k <= cuotasRestantes; k++) {
    const numeroCuota = mesesGracia + k;
    const interes = saldo * tem;
    let amortizacion = cuotaOrdinaria - interes;
    let balonPeriodo = 0;
    let saldoFinal = saldo - amortizacion;

    if (k === cuotasRestantes) {
      balonPeriodo = cuotaBalon;
      amortizacion += balonPeriodo;
      saldoFinal = 0;
    }

    const flujoTotal = cuotaOrdinaria + balonPeriodo + seguroMensual + comisionMensual + gastosMensuales;
    flujosDeudor.push(-round2(flujoTotal));

    cronograma.push({
      numeroCuota,
      fechaPago: addMonths30Days(fechaInicio, numeroCuota),
      tipo: k === cuotasRestantes ? "ordinaria+balon" : "ordinaria",
      saldoInicial: round2(saldo),
      interes: round2(interes),
      amortizacion: round2(amortizacion),
      cuota: round2(cuotaOrdinaria),
      cuotaBalon: round2(balonPeriodo),
      seguro: round2(seguroMensual),
      comision: round2(comisionMensual),
      gastos: round2(gastosMensuales),
      flujoTotal: round2(flujoTotal),
      saldoFinal: round2(saldoFinal)
    });

    saldo = saldo - (cuotaOrdinaria - interes);
  }

  const tirMensual = irr(flujosDeudor);
  const tirAnual = tirMensual === null ? null : Math.pow(1 + tirMensual, 12) - 1;
  const tcea = tirAnual;
  const van = npv(tem, flujosDeudor);

  const totalIntereses = cronograma.reduce((acc, row) => acc + row.interes, 0);
  const totalSeguros = cronograma.reduce((acc, row) => acc + row.seguro, 0);
  const totalComisiones = cronograma.reduce((acc, row) => acc + row.comision, 0);
  const totalGastos = cronograma.reduce((acc, row) => acc + row.gastos, 0);
  const totalPagado = cronograma.reduce((acc, row) => acc + row.flujoTotal, 0);

  return {
    parametros: {
      moneda: input.moneda,
      precioVehiculo: round2(precioVehiculo),
      cuotaInicial: round2(cuotaInicial),
      montoFinanciado: round2(montoFinanciado),
      tipoTasa: input.tipoTasa,
      tasaAnual: Number(input.tasaAnual),
      capitalizacion: Number(input.capitalizacion || 12),
      tea,
      tem,
      plazoMeses,
      tipoGracia,
      mesesGracia,
      cuotaBalon: round2(cuotaBalon),
      porcentajeBalon: round2(cuotaBalon / precioVehiculo * 100),
      seguroMensual: round2(seguroMensual),
      comisionMensual: round2(comisionMensual),
      gastosMensuales: round2(gastosMensuales)
    },
    cronograma,
    indicadores: {
      cuotaOrdinaria: round2(cuotaOrdinaria),
      van: round2(van),
      tirMensual: tirMensual === null ? null : tirMensual,
      tirAnual: tirAnual === null ? null : tirAnual,
      tcea: tcea === null ? null : tcea,
      totalIntereses: round2(totalIntereses),
      totalSeguros: round2(totalSeguros),
      totalComisiones: round2(totalComisiones),
      totalGastos: round2(totalGastos),
      totalPagado: round2(totalPagado),
      costoTotalCredito: round2(totalPagado - montoFinanciado)
    },
    flujosDeudor
  };
}
