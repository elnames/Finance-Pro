# Finance Pro

Plataforma de gestión financiera personal con planes de suscripción, pagos integrados y panel de administración.

**[finance.nmsdev.tech](https://finance.nmsdev.tech)**

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15, Tailwind CSS, Framer Motion, Recharts |
| Backend | NestJS, Passport JWT, TypeScript |
| Base de datos | SQL Server, Prisma ORM |
| Pagos | Transbank Webpay Plus |
| Infraestructura | Docker, Nginx Proxy Manager |

---

## Funcionalidades

- Autenticación JWT con roles `USER` / `ADMIN` y planes `FREE` / `PREMIUM` / `ELITE` / `ADMIN`
- Cuentas, transacciones, categorías y presupuestos mensuales con filtros y paginación
- Gastos recurrentes con programación automática (scheduler)
- Pagos con Transbank Webpay Plus — upgrade de plan en tiempo real
- Panel de administración — gestión de usuarios y planes
- Configuración completa — perfil, seguridad, notificaciones, apariencia, región, facturación
- Límites por plan — FREE: 2 cuentas / 10 categorías / 50 tx · PREMIUM: 5/25/500 · ELITE: ilimitado
- Modo demo disponible desde el login

---

## Estructura

```
Finance/
├── backend/           # NestJS API (puerto 3011)
├── frontend/          # Next.js App (puerto 3010)
└── docker-compose.yml
```

---

## Desarrollo local

### Backend
```bash
cd backend
cp .env.example .env   # completar DATABASE_URL y JWT_SECRET
npm install
npx prisma migrate deploy
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
# crear .env.local con NEXT_PUBLIC_API_URL=http://localhost:3011
npm run dev
```

---

## Deploy con Docker

```bash
cp backend/.env.example backend/.env  # configurar vars
docker compose up -d --build
```

Variables requeridas en `backend/.env`:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión SQL Server |
| `JWT_SECRET` | Secreto mínimo 32 chars |
| `FRONTEND_URL` | URL pública del frontend |
| `BACKEND_URL` | URL pública del backend + `/api` |
| `TRANSBANK_COMMERCE_CODE` | Dejar vacío para modo integración/test |
| `TRANSBANK_API_KEY` | Dejar vacío para modo integración/test |

---

## Tarjetas de prueba Transbank (integración)

| Campo | Valor |
|---|---|
| Número | `4051 8856 0044 6623` |
| CVV | `123` · RUT: `11.111.111-1` · Contraseña: `123` |
