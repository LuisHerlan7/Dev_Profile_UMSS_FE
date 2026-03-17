# Frontend - Plataforma de Servicios

Aplicación frontend construida con **React + TypeScript** para una plataforma tipo **LinkedIn + GitHub + Marketplace/Freelancer**, enfocada en perfiles profesionales, portafolios, proyectos, publicación/consumo de servicios y descubrimiento de talento.

---

## Descripción

Este proyecto es una aplicación web que combina:

- **Networking profesional** (estilo LinkedIn)
- **Portafolio y proyectos** (estilo GitHub)
- **Marketplace de servicios** (estilo Freelancer)

La base técnica está diseñada con:

- **Arquitectura basada en features (feature-first)**: el código se organiza por módulos de negocio.
- **React + TypeScript**: UI declarativa con tipado fuerte para mantener consistencia y escalabilidad.

---

## Instalación

### Requisitos

- **Node.js** (recomendado: LTS)
- **npm**

### Instalar dependencias

```bash
npm install
```

---

## Ejecución en desarrollo

```bash
npm run start
```

Aplicación disponible en:

- `http://localhost:4200`

---

## Build (producción)

```bash
npm run build
```

---

## Estructura del proyecto

La aplicación se organiza con una arquitectura feature-first y capas claras. Estructura general:

```text
src/
  app/
  assets/
  features/
  services/
  shared/
  pages/
  styles/
```

---

## Explicación de carpetas

- **`src/app/`**: configuración global de la aplicación.
  - Router (configuración y composición de rutas)
  - Store (estado global, si aplica)
  - Providers (contextos globales: theme, auth, i18n, etc.)

- **`src/features/`**: módulos del negocio (feature modules).
  - Ejemplos: `auth`, `profile`, `projects`, `marketplace`

- **`src/services/`**: acceso a APIs y comunicación externa.
  - **Único lugar** donde se realizan llamadas HTTP.
  - Módulos por dominio/servicio para mantener trazabilidad y orden.

- **`src/shared/`**: recursos reutilizables y transversales.
  - Componentes genéricos, hooks compartidos, utilidades, types globales, constantes.

- **`src/pages/`**: páginas globales (nivel “screen”) fuera de un feature.
  - Úsala para vistas **transversales** o de **composición** que no pertenecen claramente a un módulo de negocio.
  - Ejemplos típicos: `Home`, `Landing`, `NotFound`, `Legal`, páginas que “orquestan” varios features.
  - Regla práctica: si la página es “del negocio” de un módulo, va en `src/features/<feature>/pages/`.

- **`src/assets/`**: recursos estáticos (imágenes, íconos, fuentes, etc.).

- **`src/styles/`**: estilos globales (tokens, resets, temas, variables).

---

## Detalle interno de `features/`

Cada feature sigue una estructura consistente para mantener escalabilidad:

```text
features/<feature>/
  components/
  hooks/
  pages/
  types/
```

- **`components/`**: componentes propios del feature (UI específica).
- **`hooks/`**: hooks del feature (lógica reutilizable dentro del módulo).
- **`pages/`**: páginas/vistas del feature (rutas del módulo).
  - Aquí viven las páginas que **sí pertenecen** al feature.
  - Ejemplos: `src/features/auth/pages/LoginPage.tsx`, `src/features/dashboard/pages/DashboardPage.tsx`.
- **`types/`**: tipos/interfaces del dominio del feature.

---

## Backend

La integración con backend considera:

- **Autenticación con JWT** usando header **Bearer**:
  - `Authorization: Bearer <token>`
- **Base URL**: configurada como placeholder (debe definirse por entorno).
  - Ejemplo (placeholder): `https://api.example.com`

> Importante: toda comunicación HTTP debe implementarse exclusivamente dentro de `src/services/`.

---

## Reglas del proyecto

Reglas clave para mantener el orden y la calidad:

- **No hacer llamadas HTTP en componentes o páginas**.
- **No usar endpoints fuera de `src/services/`**.
- **Separación por features**: el código de negocio vive en `src/features/<feature>/`.
- **Tipado fuerte con TypeScript**:
  - Evitar `any`.
  - Preferir tipos explícitos en contratos (requests/responses) y modelos del dominio.

---

## Branching

Estrategia de ramas:

- **Rama principal de desarrollo**: `dev`
- **PRs**: siempre hacia `dev`
- **Releases**: se publican hacia `main`

Referencia:

- `docs/branching.md`

---

## Convención de commits

Se recomienda convención tipo Conventional Commits (prefijos):

- **`feat`**: nueva funcionalidad
- **`fix`**: corrección de bug
- **`chore`**: tareas de mantenimiento (deps, scripts, etc.)
- **`refactor`**: refactor sin cambiar comportamiento
- **`docs`**: documentación
- **`test`**: pruebas
- **`style`**: formato (sin cambios lógicos)

---

## Filosofía de arquitectura

Principios guía del proyecto:

- **Modularidad**: cada feature encapsula su lógica y UI.
- **Escalabilidad**: estructura consistente para crecer sin degradar mantenibilidad.
- **Separación de responsabilidades**:
  - UI (components/pages) vs lógica (hooks) vs integración (services) vs shared.

---

## Plataforma (visión del sistema)

Este frontend implementa una plataforma integral tipo:

- **LinkedIn** (perfil profesional, networking y reputación)
- **GitHub** (proyectos, portfolio y evidencia técnica)
- **Freelancer/Marketplace** (publicación y contratación de servicios)

