# Finance Pro — Backend

API REST construida con NestJS. Puerto por defecto: `3011`.

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | — | Registro |
| POST | `/auth/login` | — | Login, retorna JWT |
| GET | `/users/profile` | JWT | Perfil del usuario |
| PATCH | `/users/profile` | JWT | Actualizar nombre/email |
| PATCH | `/users/password` | JWT | Cambiar contraseña |
| DELETE | `/users/account` | JWT | Eliminar cuenta |
| GET/POST | `/accounts` | JWT | Cuentas |
| GET/POST | `/transactions` | JWT | Transacciones |
| GET/POST | `/categories` | JWT | Categorías |
| GET/POST | `/budgets` | JWT | Presupuestos |
| GET/POST | `/recurring-expenses` | JWT | Gastos recurrentes |
| POST | `/payments/checkout` | JWT | Iniciar pago Transbank |
| GET | `/payments/history` | JWT | Historial de pagos |
| POST | `/payments/transbank/commit` | — | Callback Transbank (interno) |
| GET | `/admin/users` | ADMIN | Listar usuarios |
| PATCH | `/admin/users/:id/plan` | ADMIN | Cambiar plan |
| DELETE | `/admin/users/:id` | ADMIN | Eliminar usuario |

## Variables de entorno

```env
DATABASE_URL=sqlserver://host:port;database=db;user=u;password=p;trustServerCertificate=true
JWT_SECRET=min-32-chars-secret
FRONTEND_URL=https://finance.nmsdev.tech
BACKEND_URL=https://finance.nmsdev.tech/api
NODE_ENV=production
TRANSBANK_COMMERCE_CODE=   # vacío = modo integración/sandbox
TRANSBANK_API_KEY=
TRANSBANK_AMOUNT_PREMIUM=9000
TRANSBANK_AMOUNT_ELITE=19000
```

## Comandos

```bash
npm install
npx prisma migrate deploy   # aplicar migraciones
npm run start:dev            # desarrollo
npm run build && npm run start:prod  # producción
```

## Bootstrap admin (producción)

```bash
docker exec -it finance_backend node fix-admin-plan.js admin@email.com
```
