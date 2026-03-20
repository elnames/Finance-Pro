---
name: ui-standards
version: 1.0.0
description: |
  Guía oficial de estándares de diseño y layout para Finance Pro. 
  Asegura que la interfaz mantenga su estabilidad ("Indestructible Sidebar")
  y su estética "Sober Dark".
---

# Finance Pro UI Standards

Este documento define las reglas críticas para mantener el look & feel premium y la estabilidad del dashboard.

## 📐 Reglas de Layout (Dashboard)

### 1. El Viewport es Sagrado (`h-screen`)
El contenedor raíz del dashboard **SIEMPRE** debe usar la clase `h-screen overflow-hidden` de Tailwind.
- **Por qué**: Si usas `min-h-screen`, las páginas con mucho contenido (como el Resumen con sus gráficos) harán que toda la página crezca hacia abajo, desplazando el sidebar y el User Dock ("Javier") fuera de la vista del usuario.
- **Corrección**: Mantener `h-screen` asegura que el sidebar sea fijo y solo el área de contenido (`main`) tenga su propio scroll interno.

### 2. Estabilidad del Sidebar (`flex-shrink-0`)
El componente `aside` y el botón del `User Dock` deben tener la clase `flex-shrink-0`.
- **Por qué**: Evita que el contenido principal (gráficos grandes o tablas) compriman el sidebar hacia la izquierda, deformando el nombre del usuario o los iconos.

### 3. Visibilidad del User Dock
Nunca uses renderizado condicional de React (`{isOpen && ...}`) para el contenido del User Dock si quieres evitar parpadeos (flickering).
- **Herramienta**: Usa transiciones CSS de opacidad (`opacity-0` vs `opacity-100`) y ancho (`max-w-0` vs `max-w-full`). Esto mantiene los elementos en el DOM y hace que la transición sea instantánea y robusta.

### 4. Presupuestos y Visualización de Datos
- **Barras de Progreso**: Usa el componente `GoalProgress` con efecto `glass` y gradientes suaves. 
- **Estados de Alerta**: Si el gasto supera el presupuesto, la barra **DEBE** cambiar a `bg-rose-500` para impacto visual inmediato.
- **Gráficos (Recharts)**: Usa `LinearGradient` en las áreas de los gráficos para mantener la estética "Sober Dark" (de `primary/20` a `transparent`).
- **Exportación**: Los botones de acción secundaria (ej. "Exportar CSV") deben usar la clase `glass` con un borde sutil para que no compitan visualmente con el botón de "Nueva Transacción".

---

## 🎨 Sistema de Diseño (Sober Dark)

### Paleta de Colores
- **Fondo Principal**: `#0a0a0a` o `bg-zinc-950`.
- **Bordes Nav**: `border-white/5` o `border-zinc-800/50`.
- **Primary**: El color de acento (ej. `text-primary`, `bg-primary`) debe usarse con moderación para resaltar acciones clave.

### Tipografía
- **Brand**: Fuente gruesa (`font-black`), tracking apretado (`tracking-tighter`) y en cursiva (`italic`) para un look deportivo/premium.

---

## 📱 Responsividad
- El Sidebar de escritorio se oculta en `lg:hidden`.
- El Header móvil debe ser `sticky top-0` y tener un efecto de desenfoque (`backdrop-blur-xl`) para mantener el estilo "Glassmorphism" sutil.

---
*Cualquier cambio en el layout principal debe ser validado contra estas reglas.*
