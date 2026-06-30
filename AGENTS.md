# finanzas-backend — Guía para Agentes de Código

API REST del simulador de crédito vehicular **Compra Inteligente**.

---

## Stack

- Node.js 18+ (ES Modules, `"type": "module"`)
- Express 4
- Sequelize 6 ORM + PostgreSQL
- JWT + bcryptjs

## Estructura de archivos

```
src/
├── server.js                  # Entry point: sync DB + inicia HTTP
├── app.js                     # Express app: middleware, rutas, 404
├── seed.js                    # Seed: admin + datos de ejemplo
├── config/
│   ├── db.js                  # Conexión Sequelize (DATABASE_URL)
│   └── env.js                 # dotenv: PORT, JWT_SECRET, CORS_ORIGIN, DATABASE_URL
├── middleware/
│   └── auth.js                # authRequired: extrae Bearer token, verifica JWT, adjunta req.user
├── models/
│   └── index.js               # 5 modelos + asociaciones
├── routes/
│   ├── auth.routes.js         # POST /register, POST /login, GET /me
│   ├── clientes.routes.js     # CRUD /api/clientes
│   ├── vehiculos.routes.js    # CRUD /api/vehiculos
│   └── simulaciones.routes.js # GET list, GET :id, POST crear
└── utils/
    └── finance.js             # Motor de cálculo financiero (247 líneas, sin dependencias)
```

## Variables de entorno (`.env`)

```
DATABASE_URL=postgresql://user:pass@host:5432/finanzas
JWT_SECRET=clave-secreta
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

## Modelos (Sequelize) — `src/models/index.js`

### Usuario
| Campo | Tipo |
|---|---|
| id | INTEGER PK auto |
| nombre | STRING NOT NULL |
| email | STRING NOT NULL UNIQUE |
| passwordHash | STRING NOT NULL |
| rol | STRING default "asesor" |
| estado | BOOLEAN default true |

### Cliente
| Campo | Tipo |
|---|---|
| id | INTEGER PK auto |
| dni | STRING NOT NULL |
| nombres | STRING NOT NULL |
| apellidos | STRING NOT NULL |
| correo | STRING |
| celular | STRING |
| direccion | STRING |
| ingresoMensual | FLOAT default 0 |
| tipoTrabajador | STRING default "dependiente" |
| usuarioId | INTEGER FK → Usuario |

### Vehiculo
| Campo | Tipo |
|---|---|
| id | INTEGER PK auto |
| clienteId | INTEGER FK → Cliente |
| marca | STRING NOT NULL |
| modelo | STRING NOT NULL |
| anio | INTEGER |
| tipo | STRING default "auto" |
| moneda | STRING default "PEN" |
| precio | FLOAT NOT NULL |

### Simulacion
| Campo | Tipo |
|---|---|
| id | INTEGER PK auto |
| clienteId | INTEGER FK → Cliente |
| vehiculoId | INTEGER FK → Vehiculo |
| moneda | STRING NOT NULL |
| precioVehiculo | FLOAT NOT NULL |
| cuotaInicial | FLOAT NOT NULL |
| montoFinanciado | FLOAT NOT NULL |
| tipoTasa | STRING NOT NULL ("efectiva" / "nominal") |
| tasaAnual | FLOAT NOT NULL |
| capitalizacion | INTEGER default 12 |
| tea | FLOAT NOT NULL |
| tem | FLOAT NOT NULL |
| plazoMeses | INTEGER NOT NULL |
| tipoGracia | STRING default "ninguna" |
| mesesGracia | INTEGER default 0 |
| cuotaBalon | FLOAT NOT NULL |
| porcentajeBalon | FLOAT default 0 |
| seguroMensual | FLOAT default 0 |
| comisionMensual | FLOAT default 0 |
| gastosMensuales | FLOAT default 0 |
| resumen | JSON NOT NULL (contiene indicadores) |

### CronogramaPago
| Campo | Tipo |
|---|---|
| id | INTEGER PK auto |
| simulacionId | INTEGER FK → Simulacion |
| numeroCuota | INTEGER NOT NULL |
| fechaPago | STRING NOT NULL (YYYY-MM-DD) |
| tipo | STRING default "ordinaria" |
| saldoInicial | FLOAT NOT NULL |
| interes | FLOAT NOT NULL |
| amortizacion | FLOAT NOT NULL |
| cuota | FLOAT NOT NULL |
| cuotaBalon | FLOAT default 0 |
| seguro | FLOAT default 0 |
| comision | FLOAT default 0 |
| gastos | FLOAT default 0 |
| flujoTotal | FLOAT NOT NULL |
| saldoFinal | FLOAT NOT NULL |

### Asociaciones

```
Usuario.hasMany(Cliente)         → Cliente.belongsTo(Usuario)
Cliente.hasMany(Vehiculo)        → Vehiculo.belongsTo(Cliente)
Cliente.hasMany(Simulacion)      → Simulacion.belongsTo(Cliente)
Vehiculo.hasMany(Simulacion)     → Simulacion.belongsTo(Vehiculo)
Simulacion.hasMany(CronogramaPago) → CronogramaPago.belongsTo(Simulacion)
```

## API endpoints

| Método | Ruta | Auth | Controlador | Descripción |
|---|---|---|---|---|
| GET | `/api/health` | No | inline | Health check |
| POST | `/api/auth/register` | No | `auth.routes.js` | Crear usuario (nombre, email, password) |
| POST | `/api/auth/login` | No | `auth.routes.js` | Login → { token, user } |
| GET | `/api/auth/me` | Sí | `auth.routes.js` | Perfil del usuario autenticado |
| GET | `/api/clientes` | Sí | `clientes.routes.js` | Lista clientes del usuario (desc) |
| POST | `/api/clientes` | Sí | `clientes.routes.js` | Crear cliente |
| PUT | `/api/clientes/:id` | Sí | `clientes.routes.js` | Actualizar cliente (verifica pertenencia) |
| DELETE | `/api/clientes/:id` | Sí | `clientes.routes.js` | Borrar cliente |
| GET | `/api/vehiculos` | Sí | `vehiculos.routes.js` | Lista vehículos del usuario (join con Cliente) |
| POST | `/api/vehiculos` | Sí | `vehiculos.routes.js` | Crear vehículo (vinculado a un cliente) |
| PUT | `/api/vehiculos/:id` | Sí | `vehiculos.routes.js` | Actualizar vehículo |
| DELETE | `/api/vehiculos/:id` | Sí | `vehiculos.routes.js` | Borrar vehículo |
| GET | `/api/simulaciones` | Sí | `simulaciones.routes.js` | Lista simulaciones (con Cliente, Vehiculo) |
| GET | `/api/simulaciones/:id` | Sí | `simulaciones.routes.js` | Simulación + Cliente + Vehiculo + CronogramaPagos |
| POST | `/api/simulaciones` | Sí | `simulaciones.routes.js` | Ejecutar simulación |

### POST /api/simulaciones — payload

```json
{
  "clienteId": 1,
  "vehiculoId": 1,
  "moneda": "PEN",
  "precioVehiculo": 50000,
  "cuotaInicial": 10000,
  "tipoTasa": "efectiva",
  "tasaAnual": 18,
  "capitalizacion": 12,
  "plazoMeses": 36,
  "tipoGracia": "ninguna",
  "mesesGracia": 0,
  "porcentajeBalon": 50,
  "cuotaBalon": "",
  "seguroMensual": 0,
  "comisionMensual": 0,
  "gastosMensuales": 0,
  "fechaInicio": "2026-01-01"
}
```

### POST /api/simulaciones — respuesta

```json
{
  "id": 1,
  "clienteId": 1,
  "vehiculoId": 1,
  "resumen": {
    "cuotaOrdinaria": 1234.56,
    "van": 0.00,
    "tirMensual": 0.014,
    "tirAnual": 0.1956,
    "tcea": 0.1956,
    "totalIntereses": 5000.00,
    "totalPagado": 45000.00,
    "costoTotalCredito": 5000.00
  },
  "CronogramaPagos": [
    {
      "numeroCuota": 1,
      "fechaPago": "2026-01-31",
      "tipo": "ordinaria",
      "saldoInicial": 40000.00,
      "interes": 552.44,
      "amortizacion": 682.12,
      "cuota": 1234.56,
      "cuotaBalon": 0,
      "flujoTotal": 1234.56,
      "saldoFinal": 39317.88
    }
  ]
}
```

## Motor financiero — `src/utils/finance.js`

Todas las funciones son **puras** (sin efectos secundarios ni dependencias externas).

### Funciones exportadas

| Función | Propósito |
|---|---|
| `round2(value)` | Redondea a 2 decimales |
| `toDecimal(percent)` | Convierte porcentaje a decimal (ej: 18 → 0.18) |
| `convertAnnualRateToTEA({ tipoTasa, tasaAnual, capitalizacion })` | Convierte tasa nominal o efectiva a TEA |
| `teaToTem(tea)` | Convierte TEA → TEM (raíz 12) |
| `cuotaFrancesaConBalon({ principal, tem, cuotas, cuotaBalon })` | Calcula cuota fija del método francés con balón |
| `npv(rate, cashflows)` | Valor actual neto |
| `irr(cashflows)` | TIR por bisección (200 iteraciones) |
| `addMonths30Days(dateString, months)` | Suma meses de 30 días a una fecha |
| `calcularSimulacion(input)` | **Orquestador principal** — devuelve `{ parametros, cronograma, indicadores, flujosDeudor }` |

### Flujo de `calcularSimulacion`

1. Validar inputs (precio > 0, cuotaInicial < precio, plazo > 0, mesesGracia < plazo, balón ≤ montoFinanciado)
2. Calcular `montoFinanciado = precio - cuotaInicial`
3. Convertir tasa anual a TEA → TEM
4. Construir cronograma:
   - Período de gracia (si aplica): total (interés se capitaliza) o parcial (solo paga interés)
   - Período ordinario: cuotas fijas con amortización progresiva
   - Última cuota: incluye cuota balón si existe
5. Calcular indicadores: VAN (tasa = TEM), TIR mensual (bisección), TIR anual (TIRm → anual), TCEA (= TIR anual)
6. Retornar `{ parametros, cronograma, indicadores, flujosDeudor }`

### Convención de tipos de cuota en cronograma

| tipo | Significado |
|---|---|
| `"gracia-total"` | Período de gracia total (interés se capitaliza, no se paga) |
| `"gracia-parcial"` | Período de gracia parcial (solo se paga interés) |
| `"ordinaria"` | Cuota ordinaria del método francés |
| `"ordinaria+balon"` | Última cuota con balón incluido |

## Middleware de autenticación — `src/middleware/auth.js`

- Espera header `Authorization: Bearer <token>`
- Verifica JWT con `env.jwtSecret`
- Busca usuario por `payload.id`
- Adjunta `req.user` al request
- Retorna 401 si: no hay token, token inválido, token expirado, usuario deshabilitado

## Scripts NPM

```bash
npm run dev     # nodemon src/server.js
npm start       # node src/server.js
npm run seed    # node src/seed.js (crea tablas + admin + datos demo)
```

## Seed por defecto

```
Admin: admin@finances.com / 123456
Cliente demo: Juan Pérez, DNI 12345678
Vehículo demo: Toyota Yaris 2024, PEN 50000
```

## Despliegue (Render)

El archivo `render.yaml` configura:
- **Type:** Web Service
- **Build:** `npm install`
- **Start:** `npm start`
- **Env:** `DATABASE_URL` (PostgreSQL free-tier automático), `JWT_SECRET` auto-generado, `CORS_ORIGIN` apuntando al frontend
