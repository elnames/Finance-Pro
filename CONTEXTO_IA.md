# Contexto del Proyecto: Finance Pro 🚀

Este archivo sirve como guía para cualquier modelo de IA que trabaje en este repositorio.

## 📌 Resumen General
**Finance Pro** es una plataforma de gestión financiera personal "Sober Dark". Permite a los usuarios rastrear activos, cuentas, transacciones y presupuestos mensuales con una interfaz premium y minimalista.

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 14/15 (App Router), React, Tailwind CSS, Framer Motion, Lucide React (Iconos), Recharts.
- **Backend**: NestJS (TypeScript), Passport JWT, Bcrypt.
- **Base de Datos**: Microsoft SQL Server (MSSQL), Prisma ORM.

## 🏗️ Arquitectura y GitHub
El proyecto se encuentra en GitHub: `https://github.com/elnames/Finance-Pro.git`.

Estructura:
- `/frontend`: Aplicación cliente en Next.js (Puerto 3010).
- `/backend`: API RESTful basada en NestJS (Puerto 3011).
- `/assets`: Contiene ilustraciones 3D representativas.
- `/skills`: Lógica y estándares para la IA.

## 📂 Archivos y Carpetas Clave
- `frontend/src/app/dashboard/layout.tsx`: Controla la persistencia del perfil y el layout fijo.
- `frontend/src/app/dashboard/budgets/page.tsx`: Gestión de metas mensuales.
- `backend/src/budgets/`: Lógica de presupuestos.
- `skills/`: Contiene guías de estilo y comportamiento.

## 🎨 Reglas de Oro (UI & UX & DB)
1. **Layout Fijo**: El DashboardLayout **DEBE** ser `h-screen overflow-hidden`.
2. **Sidebar**: Usa `flex-shrink-0` y visibilidad por CSS (`opacity`) para el User Dock.
3. **Múltiples Rutas de Cascada (SQL Server)**: Evita configurar `onDelete: Cascade` en múltiples relaciones que converjan al mismo modelo (ej. User -> Category -> Budget y User -> Budget). Usa `onDelete: NoAction` en una de las rutas para evitar errores P1012 en Prisma.
4. **Commits y Comunicación**: Usa la skill `humanizer` y escribe siempre en español natural.

---
*Este documento es auto-mantenido para asegurar que cualquier agente de IA opere con el máximo contexto posible.*
