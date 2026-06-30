# Finanzas Backend

API REST del simulador de crédito vehicular **Compra Inteligente**.

**Repositorio:** https://github.com/FInanzas-Grupo/finanzas-backend

## Stack

- Node.js + Express 4
- Sequelize 6 ORM
- PostgreSQL
- JWT + bcryptjs

## Requisitos

- Node.js 18+
- PostgreSQL

## Variables de entorno

Copiar `.env.example` a `.env` y configurar:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URI de conexión a PostgreSQL |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `CORS_ORIGIN` | Origen permitido para CORS (frontend) |
| `PORT` | Puerto del servidor (default: 3000) |

## Instalación

```bash
npm install
npm run seed    # Crea tablas y datos iniciales
npm run dev     # Desarrollo con nodemon
npm start       # Producción
```

## Seed

Crea un usuario administrador por defecto:

- **Email:** admin@finances.com
- **Clave:** 123456

## API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/login` | No | Iniciar sesión |
| POST | `/api/auth/register` | No | Registrar usuario |
| GET | `/api/auth/me` | Sí | Perfil del usuario |
| GET/POST/PUT/DELETE | `/api/clientes` | Sí | CRUD clientes |
| GET/POST/PUT/DELETE | `/api/vehiculos` | Sí | CRUD vehículos |
| GET/POST | `/api/simulaciones` | Sí | Simulaciones |

## Deploy en Render

El archivo `render.yaml` permite deploy automatizado. Conectar el repo en Render Dashboard usando **Blueprint**.
