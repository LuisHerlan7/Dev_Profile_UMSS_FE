# Dev Profile UMSS — Frontend

INTRODUCCIÓN

Dev Profile UMSS es la interfaz de presentación del sistema de portafolios profesionales desarrollado por K'awi Soft S.R.L. Esta aplicación SPA (React + TypeScript) permite a los usuarios generar, editar y publicar portafolios digitales interactivos, gestionar visibilidad de secciones, y exportar portafolios a PDF usando capacidades nativas del navegador (jsPDF + html2canvas).

OBJETIVO

Ofrecer una experiencia de usuario responsiva e internacionalizada que permita la creación rápida y confiable de documentos portafolio listos para postulación profesional.

ALCANCE

El frontend contiene la capa visual, componentes reutilizables, servicios para comunicación con la API y utilidades de internacionalización (i18n). Depende de un backend REST (este repositorio paralelo) para persistencia y autenticación.

# Frontend - Plataforma de Servicios

Aplicación frontend construida con **React + TypeScript** para "DEV PROFILE UMSS una plataforma enfocada en perfiles profesionales, portafolios, proyectos, publicación/consumo de servicios y descubrimiento de talento.

---

## Descripción

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

### Configurar entorno local

Crear un archivo `.env` en la raíz del proyecto frontend con la siguiente configuración mínima:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Esto permite que el frontend se comunique con el backend local.

---

## Ejecución en desarrollo

```bash
npm run start -- --host 127.0.0.1 --port 4200
```

Aplicación disponible en:

- `http://127.0.0.1:4200`

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

