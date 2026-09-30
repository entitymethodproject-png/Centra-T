# Centra-T · Gestor Doméstico Integral y Planificador Temporal

> **Aplicación web full-stack desarrollada bajo metodología AI-Native, Clean Architecture y TDD estricto.**  
> Monorepo desacoplado con **Next.js 14+** (Frontend), **NestJS 10.x** (Backend MVC) y persistencia relacional en **PostgreSQL 16**.

---

## 1. Arranque Rápido y Experiencia de Desarrollo (DX)

El monorepo cuenta con automatización completa del entorno local para garantizar un arranque sin fricción en un único comando.

### Requisitos Previos
* **Node.js** >= 18.x
* **Docker** y **Docker Compose** (en ejecución para la persistencia PostgreSQL)

### Puesta en Marcha (Out-of-the-Box)
```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd Centra-T

# 2. Instalar dependencias
npm install

# 3. Arrancar en desarrollo (Auto-recupera Docker PostgreSQL, compila y levanta Frontend + Backend)
npm run dev
```

* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend REST API:** [http://localhost:3001](http://localhost:3001)

### Credenciales de Usuario Demo (Precargado)
La base de datos se inicializa automáticamente con un usuario de prueba para evaluación inmediata:
* **Email:** `elena@centrat.local`
* **Contraseña:** `Password123!`

*(Opcionalmente, es posible registrar cualquier usuario nuevo mediante la pestaña "Crear Cuenta", el cual nacerá con su espacio de datos 100% aislado).*

---

## 2. Batería de Pruebas y Certificación de Calidad

El proyecto cuenta con un blindaje del 100% en sus suites de pruebas automatizadas:

```bash
# Ejecutar suite completa de pruebas unitarias y de integración (323 tests)
npm test

# Ejecutar pruebas forenses End-to-End con Playwright
npx playwright test

# Verificación estricta de tipos TypeScript
npm run typecheck
```

* **Tests Unitarios e Integración (Vitest):** **323/323 pasados (100%)** cubriendo controladores, servicios, repositorios, hooks y componentes de interfaz.
* **Tests End-to-End (Playwright):** **9/9 suites forenses pasadas** (`VV-001` a `VV-009`), verificando flujos de autenticación, aislamiento multi-tenant, optimismo visual, drag & drop y degradación offline.
* **Análisis Estático:** 0 errores TypeScript (`strict: true`).

---

## 3. Arquitectura del Sistema y Topología

```
Centra-T/
├── backend/                   # API REST NestJS 10.x (Patrón MVC Modular)
│   └── src/
│       ├── authentication/    # Registro, login, emisión y revocación de sesión
│       ├── users/             # Gestión de entidades y perfiles de usuario
│       ├── tasks/             # Módulo de tareas generales del hogar
│       ├── shopping/          # Módulo de compra semanal y bulk scheduling
│       ├── cleaning/          # Módulo de planificación de limpieza
│       └── items/             # Abstracción de dominio y persistencia polimórfica
├── frontend/                  # Next.js 14+ / React 18/19
│   └── src/
│       ├── workspace/         # Layout principal, telemetría y banner offline
│       ├── hub/               # Centro unificado de acordeones colapsables
│       ├── items/             # Componentes transversales de gestión de ítems
│       ├── calendar-sync/     # Calendario mensual interactivo con Drag & Drop
│       └── authentication/    # Vistas de acceso, guardas de sesión y DTOs
└── e2e/                       # Batería de validación forense automatizada (Playwright)
```

---

## 4. Registros de Decisiones de Arquitectura y Dominio (ADRs)

Para garantizar la máxima mantenibilidad y fidelidad a los requisitos de negocio, se adoptaron las siguientes decisiones de diseño:

### ADR-01 · Arquitectura Híbrida: Monolito Modular con MVC y Capas Limpias
* **Contexto:** Necesidad de estructurar el backend garantizando desacoplamiento por contexto de negocio sin dispersión prematura en microservicios.
* **Decisión:** Implementar un **Monolito Modular** en NestJS organizado en 5 módulos verticales (`authentication`, `users`, `tasks`, `shopping`, `cleaning`). Cada módulo aplica internamente el patrón **MVC**:
  * **Model (M):** Entidades de dominio TypeORM (`ItemEntity`, `UserEntity`).
  * **Controller (C):** Controladores REST tipados que validan la frontera de entrada mediante DTOs.
  * **View (V):** Contratos JSON tipados consumidos por el cliente Next.js.
  * **Capas Internas:** Los controladores delegan exclusivamente en servicios de aplicación, protegiendo la lógica de negocio del acceso directo a la infraestructura.

### ADR-02 · Fidelidad al Lenguaje Ubicuo (DDD) y Persistencia Polimórfica
* **Contexto:** Tareas, Compra Semanal y Limpieza comparten operaciones CRUD fundamentales pero operan bajo semánticas de dominio distintas (`comprado` vs `completado`).
* **Decisión:** 
  * En **persistencia**, se implementó una única tabla relacional polimórfica (`items`) discriminada por `modulo: 'tasks' | 'shopping' | 'cleaning'`, optimizando índices y erradicando código duplicado.
  * En **dominio y presentación**, se mantuvo la separación estricta del vocabulario de negocio: los productos de compra se marcan como *comprados/pendientes* y exponen endpoints dedicados, mientras que tareas y limpieza se gestionan como *completadas/pendientes*.

### ADR-03 · Proyección Espacial Temporal (El Calendario como Vista de Dominio)
* **Contexto:** Requisito de programar y consultar ítems por fecha en la gestión doméstica.
* **Decisión:** El Calendario mensual interactivo no se modeló como un subsistema de eventos independiente, sino como una **proyección visual reactiva** del atributo `fechaProgramada` del ítem. La interacción Drag & Drop permite agendar ítems directamente en la casilla del día mediante una mutación optimista inmediata.

### ADR-04 · Resiliencia de Red y los 5 Estados Contractuales de la UI
* **Contexto:** Obligatoriedad de contemplar estados *Loading*, *Empty*, *Error*, *Success* y *Offline*.
* **Decisión:** 
  * Se descartó el uso de etiquetas permanentes tipo "Online" en la barra de navegación para evitar ruido cognitivo y antipatrones de diseño.
  * El estado Offline se implementó mediante **resiliencia activa**: el hook `useNetworkStatus` monitoriza la red; ante desconexión, despliega un `OfflineBanner` accesible (`role="status"`, `aria-live="polite"`) y conmuta la UI a **modo preventivo de solo lectura**, deshabilitando mutaciones para proteger la integridad de los datos. Validado de extremo a extremo en el test E2E `[VV-008]`.

### ADR-05 · Perímetro de Seguridad (SSDLC & OWASP) y Principio YAGNI
* **Contexto:** Aplicación estricta de seguridad sin inventar dependencias innecesarias.
* **Decisión:**
  * **Criptografía Robusta:** Hashing de contraseñas mediante **Bcrypt (coste = 12 salt rounds)**.
  * **Aislamiento Multi-Tenant:** Segregación absoluta de datos mediante cláusulas forzadas por `userId` en todas las consultas de base de datos.
  * **Sanitización de Frontera:** DTOs con validación estricta y respuestas neutras de autenticación para mitigar ataques de enumeración y fuerza bruta.
  * **Criterio de Mínima Dependencia (YAGNI):** Se evitó deliberadamente el acoplamiento de servicios externos de terceros (SMTP o SMS para 2FA) para preservar la autonomía completa de ejecución en local.

---

## 5. Gobernanza Documental y Trazabilidad del Ciclo de Vida

El repositorio preserva la trazabilidad histórica de desarrollo de acuerdo con las directrices de ingeniería del software:

1. **Especificación y Diseño Teórico (Pre-implementación):**  
   Ubicada en `Docs/Paso 2: Agente analista` y `Docs/Paso 3: Agente Documentador`. Contiene los contratos conceptuales, el diagnóstico formal de ambigüedades y la arquitectura previa al código.
2. **Construcción Táctica AS-BUILT por Unidades Funcionales:**  
   Ubicada en `Docs/Paso 4: Implementación/`. Contiene la descomposición en Rebanadas Verticales (`RV-A01` a `RV-A08`), con cada `SPEC` técnica, sus tests asociados y su correspondiente certificación `AS_BUILT.md` y `LOCK`.
3. **Consolidación Arquitectónica y Cierre de Producción:**  
   Ubicada en `Docs/Correcciones Post Implementación/INFORME_TECNICO_ARQUITECTURA_Y_REFACTORS.md` y `CERTIFICADO_CIERRE_TOTAL_CENTRA-T.md`. Resume la realidad final de producción, la paridad con TypeORM/Docker y la resolución de interfaces.

---

## 6. Caso de Estudio: Gobernanza y Análisis de Drift en Pipeline AI-Native

Este proyecto se utilizó como banco de pruebas para someter a estrés un **Pipeline de Desarrollo AI-Native**. Con el objetivo de evaluar la autonomía determinista de agentes implementadores en sesiones desatendidas y medir su tasa de desviación (*architectural drift*), se ejecutaron dos puntos de control formales (*checkpoints*):

* **Punto de Control Intermedio (Drift de Modelo de Datos):** Se detectó una tendencia inicial del agente a duplicar estructuras de datos paralelas por módulo. La intervención arquitectónica aplicó un refactor hacia el modelo polimórfico unificado (`ItemEntity`), reduciendo la complejidad del esquema relacional.
* **Punto de Control Final (Convergencia de Infraestructura y UI):** Se auditó la paridad entre las vistas observadas en el navegador y los contratos del backend, resolviendo el desacoplamiento de menús contextuales mediante portales (`createPortal`) y blindando la base de datos PostgreSQL con Docker.

### Conclusión Metodológica y Evolución del Pipeline
La evidencia empírica de este ciclo valida la incorporación formal de una nueva compuerta de control para futuras versiones del pipeline: **El Agente Auditor de SPECs (Gatekeeper)**. Dicho rol actúa como filtro de validación formal entre la documentación de diseño y las órdenes técnicas de ejecución, garantizando paridad estricta y previniendo el *drift* antes de iniciar el ciclo TDD.
