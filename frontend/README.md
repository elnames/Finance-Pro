# Finance Pro — Frontend

Aplicación Next.js 15 (App Router). Puerto por defecto: `3010`.

**[finance.nmsdev.tech](https://finance.nmsdev.tech)**

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Landing con pricing |
| `/login` | Login y registro |
| `/dashboard` | Panel principal con resumen |
| `/dashboard/accounts` | Cuentas bancarias |
| `/dashboard/transactions` | Movimientos con filtros |
| `/dashboard/budgets` | Presupuestos mensuales |
| `/dashboard/categories` | Categorías de gasto/ingreso |
| `/dashboard/recurring` | Gastos recurrentes |
| `/dashboard/settings` | Configuración de cuenta |
| `/dashboard/admin` | Panel admin (plan ADMIN) |
| `/payment/success` | Confirmación de pago exitoso |
| `/payment/cancel` | Pago cancelado o rechazado |

## Variables de entorno

```env
NEXT_PUBLIC_API_URL=https://finance.nmsdev.tech/api
```

## Comandos

```bash
npm install
npm run dev      # http://localhost:3010
npm run build
npm run start
```
