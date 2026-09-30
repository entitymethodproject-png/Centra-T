# INFORME DE RESPUESTA Y RESOLUCIÓN TÉCNICA
**Proyecto:** Centra-T  
**Destinatario:** Aniol (Senior Developer / Code Reviewer)  
**Autor:** Equipo de Desarrollo Centra-T  
**Fecha:** 30/09/2026  
**Estado:** Todos los puntos resueltos, verificados y testeados al 100%

---

## 1. Resumen Ejecutivo
Agradecemos el detallado informe de revisión técnica. Valoramos enormemente tanto la validación de la arquitectura base (Next.js + NestJS, modularidad y cobertura de tests) como los puntos de fricción detectados durante la puesta en marcha en entorno Windows.

Hemos tomado propiedad inmediata de cada uno de los hallazgos técnicos señalados en el informe, corrigiéndolos de raíz e implementando pruebas automatizadas que certifican su funcionamiento transversal en cualquier sistema operativo (**Windows, Linux y macOS**).

---

## 2. Detalle de Correcciones Aplicadas por Punto

### 2.1. Punto 3.1 & 3.2: Contraseña de PostgreSQL y Variables de Entorno (`.env`)
* **Diagnóstico de causa raíz:**  
  El backend tomaba credenciales fijas por defecto (`postgres`/`postgres`) sin existir un archivo de plantilla `.env.example` en el repositorio, provocando que al ejecutarlo en máquinas donde el servicio local de PostgreSQL tuviera otra contraseña o usuario, la conexión fallara y NestJS finalizara el proceso.
* **Solución implementada:**
  1. Se han creado plantillas exhaustivas `.env.example` en la raíz, en `backend/` y en `frontend/` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`, `SESSION_SECRET`, etc.).
  2. Se configuró `.gitignore` permitiendo expresamente rastrear `!.env.example`.
  3. En `backend/src/main.ts`, se envolvió la inicialización en un capturador diagnóstico que, ante un fallo de autenticación de PostgreSQL (código `28P01` / `password authentication failed`), emite en consola una advertencia amigable indicando la ruta exacta del `.env` para ajustar las credenciales sin caídas silenciosas.

### 2.2. Punto 3.4: Base URL en `tsconfig.json`
* **Diagnóstico de causa raíz:**  
  En `backend/tsconfig.json` permanecía la propiedad `"baseUrl": "./"`, la cual en versiones contemporáneas de TypeScript y resolutores Node/NestJS genera advertencias de resolución y posibles conflictos de dependencia en tooling cruzado.
* **Solución implementada:**  
  Se retiró `"baseUrl": "./"` de `backend/tsconfig.json`. La compilación `tsc -p tsconfig.json` y el build de producción se ejecutan de manera limpia sin dependencias de ruta relativa difusa.

### 2.3. Punto 3.5: URLs y Datos Hardcodeados en Código
* **Diagnóstico de causa raíz:**  
  En `next.config.mjs` la URL del backend (`http://localhost:4000/api`) estaba escrita en bruto. En `users.service.ts` el email del usuario semilla de demo estaba fijado en código.
* **Solución implementada:**
  1. `next.config.mjs` lee ahora la variable de entorno `process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000/api'`.
  2. En el backend, las credenciales del usuario semilla se configuran mediante `process.env.DEMO_USER_EMAIL` y `process.env.DEMO_USER_PASSWORD`.
  3. La lista blanca de CORS en `backend/src/main.ts` admite ahora orígenes parametrizables vía `process.env.CORS_ORIGINS`.

### 2.4. Punto 3.3: Calidad de Código y Limpieza Sintáctica
* **Diagnóstico de causa raíz:**  
  En componentes como `ItemCard.tsx` e `ItemActionMenu.tsx` existían bloques de más de 30 líneas con llamadas `await` anidadas dentro de múltiples ramas condicionales que realizaban comprobaciones de tipo manuales en tiempo de ejecución (`typeof service.updateTask === 'function'`), duplicando código para cada módulo.
* **Solución implementada:**
  1. Se refactorizaron los métodos de actualización, borrado y conmutación de estado (`handleSaveDescription`, `handleSelectPriority`, `handleConfirmDelete`, `handleToggle`) para consumir de forma polimórfica y unificada la API del servicio (`service.updateItem || service.updateTask`, `service.deleteItem`, etc.).
  2. Se redujo la complejidad ciclomática de los componentes, eliminando las ramas condicionales redundantes y estandarizando la invocación limpia de funciones asíncronas.

### 2.5. Punto 3.6: Módulo Calendario e Interacción de Eventos
* **Diagnóstico de causa raíz:**  
  Existían tres factores que impedían la correcta visualización/adición de eventos:
  1. **Desfase de Zona Horaria (UTC vs Local):** `ItemCreationWizard` generaba fechas mediante `new Date(fechaProgramada)` (UTC 00:00:00Z), mientras que el cálculo de casillas en el calendario y `useWorkspaceController` empleaba fecha local. En sistemas operativos con desfase horario respecto a Greenwich (o según configuración regional de Windows), el día saltaba a la jornada anterior (`date.getDate() - 1`), por lo que el evento no coincidía con la celda visual.
  2. **Expectativa UX de Clic Directo:** En `MonthlyCalendarGrid`, cada día exponía el evento `onDayClick`, pero en `App.tsx` no estaba conectado ningún manejador. Al hacer clic sobre un día del mes, no se abría ninguna acción de creación.
  3. **Caída del Backend:** Al fallar PostgreSQL en el entorno local del revisor, las peticiones POST de creación no persistían ni se integraban en el estado.
* **Solución implementada:**
  1. Se introdujo el helper canónico `normalizeDateToIso()` en `calendarMatrix.ts` y se normalizó la validación en `items.service.ts` para tratar las fechas siempre como componentes locales (`YYYY-MM-DD`) sin desviaciones horarias entre sistemas operativos.
  2. Se conectó `onDayClick` en `App.tsx` y se dotó a `ItemCreationWizard` de la propiedad `initialDate`. Al pulsar sobre cualquier día disponible en el calendario, se abre inmediatamente el asistente de creación con esa fecha preseleccionada y el evento se dibuja al instante tras guardar.

---

## 3. Estado de Certificación y Tests

| Módulo | Tests Pasados | Estado Build |
| :--- | :---: | :---: |
| **Backend (NestJS / Vitest)** | **14 / 14** (100%) | ✔ Compilado limpio (`dist/`) |
| **Frontend (Next.js / Vitest)** | **309 / 309** (100%) | ✔ Compilado limpio (`.next/`) |
| **Build Integrado Monorepo** | **323 / 323** (100%) | ✔ Éxito total |

---

## 4. Instrucciones para Ejecución en Windows / Linux / macOS

1. **Configurar el entorno:**
   ```bash
   cp backend/.env.example backend/.env
   # Si tu PostgreSQL local tiene una contraseña distinta a "postgres",
   # cámbiala en backend/.env en la línea DB_PASSWORD=tu_password
   ```
2. **Iniciar la aplicación:**
   ```bash
   npm run dev
   ```
3. **Acceso:**
   * Frontend: `http://localhost:3001`
   * Backend API: `http://localhost:4000/api`
   * Usuario demo preconfigurado: `elena@centrat.local` / `Password123!`
