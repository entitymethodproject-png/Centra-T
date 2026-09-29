# CENTRA-T · FIA-A01.01 · SHELL Y LAYOUT BASE DEL WORKSPACE (2 COL)
**Rebanada Vertical:** RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A01.01`
- **Rebanada Vertical:** `RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)`
- **Unidad Prevista:** `Shell y Layout Base del Workspace (2 Col)`
- **PVF de Cierre Cubierta:** `PVF-A01.01 · Renderizado del Shell Base y Layout de 2 Columnas`
- **VF Interna de Derivación:** `VF-A01.01 · Shell y Topología Espacial del Workspace`
- **Objetivo Indexado:** `Implementar layout responsive general: TopNavbar superior fijo (h=64px), contenedor Hub lateral (w=380px) y área de trabajo para Calendario Mensual a pantalla completa.`
- **Validación Indexada:** `src/workspace/components/WorkspaceLayout.tsx`
- **Evidencia de Cierre Indexada:** `Prueba de renderizado RTL y viewport 1920x1080 / 1366x768 validando presencia de roles semánticos (banner, complementary, main) y CLS=0.`
- **LOCK Previo Requerido:** `No aplica: primera FIA de la secuencia (unidad inaugural)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Materializar única y exclusivamente la topología espacial raíz del Workspace de Centra-T mediante un layout bidimensional a pantalla completa (100vw x 100vh) compuesto por la barra de navegación superior fija (TopNavbar, h=64px) y la división en dos columnas principales: panel lateral de control (Hub, w=380px) y mesa de trabajo interactiva (Workbench / Calendario, flex: 1), garantizando roles semánticos HTML5 accesibles, ausencia total de scroll en el body y cero saltos de maquetación (CLS = 0) sin adelantar interactividad ni lógica de negocio de unidades posteriores.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación del contenedor raíz `WorkspaceLayout` fijado a los límites del viewport (100vw x 100vh, `overflow: hidden`).
  - Renderizado del área de barra superior fija (`h=64px`, rol semántico `banner`).
  - Renderizado de la columna lateral izquierda `Hub` (`w=380px`, fondo semántico `#131B26`, bordes `#233144`, rol semántico `complementary`).
  - Renderizado del área principal de trabajo `Workbench` (`flex: 1`, rol semántico `main`).
  - Aplicación de tokens visuales canónicos de color, padding exterior (16px) y gap horizontal (16px a 20px) definidos en la `SUITE_ARQUITECTURA_UI.docx`.
  - Batería de pruebas unitarias y de integración que certifiquen presencia de roles semánticos y estabilidad del layout en resoluciones estándar (1920x1080 y 1366x768).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Lógica o botón de colapso reactivo del Hub (pertenece a `FIA-A01.02`).
  - Telemetría de red, avatar o datos de sesión en la barra superior (pertenecen a `FIA-A01.03`).
  - Renderizado o lógica de acordeones internos del Hub (pertenecen a `RV-A03`, `RV-A04`, `RV-A05`).
  - Renderizado o lógica de la cuadrícula interactiva mensual del Calendario (pertenece a `RV-A06`).
  - Conexión con endpoints de backend, autenticación o persistencia relacional.

### 4. Dependencias
- **Documentales:** 
  - `SUITE_ARQUITECTURA_CORE.docx` (Docs 01 a 05: Documento Maestro, SPECs Globales, Module Map).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: UI Specs Core, Style Guide, Visual QA).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: Fila PVF-A01.01 / VF-A01.01).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A01.01).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** React 19 / Next.js 14+ (App Router), TypeScript 5.x, CSS Modules / Tailwind CSS (según tokens declarados), React Testing Library, Vitest / Jest.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* No aplica (Unidad Inaugural).
  - *Posterior:* La unidad `FIA-A01.02` (Mecanismo Colapsable Reactivo del Hub) no podrá iniciarse hasta el cierre formal y obtención de `LOCK-FIA-A01.01.md`.

### 5. Contratos Afectados
- **Contrato Funcional:** La vista base debe cargar en el viewport sin generar barras de scroll parásitas en la ventana global y exponer los 3 contenedores semánticos requeridos por el árbol de accesibilidad.
- **Contrato Físico / Module Map:** Ubicación estricta en el subsistema de presentación `src/workspace/components/WorkspaceLayout.tsx` (y sus estilos/tests asociados).
- **Contrato de Aislamiento:** Prohibido inyectar lógica de negocio, stores globales no asignados o peticiones de red. La capa visual actúa como contenedor aséptico puro.

### 6. Restricciones
- Prohibido modificar o crear carpetas cajón de sastre (`utils/`, `shared/`, `helpers/`).
- Prohibido introducir scroll global en el elemento `body` o `html`.
- Prohibido hardcodear estilos en línea fuera de los tokens semánticos definidos en el Style Guide (`#0B0F17` para base, `#131B26` para Hub, `#233144` para bordes).
- Prohibido adelantar maquetación de acordeones, botones de colapso o celdas de calendario en esta unidad.

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/workspace/components/WorkspaceLayout.tsx`.
- **Estructura Interna:**
  - Componente contenedor `WorkspaceLayout` que recibe slots/children para `navbar`, `hub` y `workbench`.
  - Subcomponentes placeholders limpios o áreas demarcadas por roles ARIA:
    - `<header role="banner" className="workspace-navbar">`
    - `<aside role="complementary" aria-label="Hub lateral" className="workspace-hub">`
    - `<main role="main" aria-label="Área de trabajo" className="workspace-workbench">`
- **Manejo de Errores y Tipado:** Props tipadas estrictamente mediante interfaces TypeScript (`WorkspaceLayoutProps`) con validación de nodos React requeridos/opcionales.
- **Fronteras Físicas Autorizadas:** 
  - `src/workspace/components/WorkspaceLayout.tsx`
  - `src/workspace/components/WorkspaceLayout.module.css` (o archivo de estilos correspondiente)
  - `src/workspace/components/WorkspaceLayout.test.tsx`

### 8. Flujo Operativo
1. El navegador carga la aplicación y monta el contenedor raíz `WorkspaceLayout`.
2. Se fija el shell visual a `100vw x 100vh` con fondo base `#0B0F17` y padding perimetral de 16px.
3. Se renderiza en la parte superior el Navbar fijo de altura 64px.
4. Inmediatamente debajo se distribuye el espacio horizontal restante mediante flex/grid: la columna izquierda reserva 380px para el Hub y el espacio restante se asigna al Workbench.
5. El sistema queda en estado estable (Idle) listo para recibir los subcomponentes de las siguientes FIAs, con CLS = 0 verificado.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Renderizado en pantalla completa 1920x1080):** 
  - *Condición inicial:* Viewport configurado a 1920x1080.
  - *Acción:* Montar `WorkspaceLayout`.
  - *Comportamiento esperado:* Se encuentran presentes en el DOM los elementos con roles `banner`, `complementary` y `main`. El Hub mantiene su ancho asignado de 380px y el Workbench ocupa el resto del ancho sin scrollbar en body.
- **Caso 2 (Renderizado en laptop 1366x768):**
  - *Condición inicial:* Viewport configurado a 1366x768.
  - *Acción:* Montar `WorkspaceLayout`.
  - *Comportamiento esperado:* La estructura bidimensional se mantiene íntegra, sin desbordamiento horizontal ni solapamiento de elementos (CLS = 0).

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Viewport extremadamente reducido o sin soporte de CSS Grid/Flex):**
  - *Comportamiento esperado:* El layout preserva contención perimetral mediante `overflow: hidden` o scroll interno acotado sin romper el documento base.
- **Causas de Rechazo Automático:**
  - Presencia de barra de scroll horizontal en la ventana (`document.body.scrollWidth > window.innerWidth`).
  - Ausencia de alguno de los tres roles semánticos esenciales (`banner`, `complementary`, `main`).
  - Solapamiento visual entre Hub y Workbench.
  - Parpadeo de maquetación o CLS > 0 en pruebas automatizadas.

### 11. Tests Requeridos
- **Tests Unitarios:**
  - Renderizado sin errores de `WorkspaceLayout` con slots vacíos o por defecto.
  - Verificación de tipos e interfaces TypeScript sin `any`.
- **Tests de Integración (Testing Library):**
  - Consulta y aserción de existencia de `screen.getByRole('banner')`, `screen.getByRole('complementary')` y `screen.getByRole('main')`.
  - Comprobación de aplicación de clases CSS o estilos que fijen las dimensiones mínimas de contención.
- **Tests Visuales / Layout:**
  - Verificación de que no existen desbordamientos de caja en viewports de 1920x1080 y 1366x768.
- **Evidencia Exigida:** Suite de tests ejecutada en verde (100% pass) con reporte emitido por el runner (Vitest/Jest).

### 12. Quality Gates (QG-FIA-A01.01)
- `QG-FIA-A01.01-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript (`npm run typecheck` o equivalente).
- `QG-FIA-A01.01-02 · Tests:` 100% de tests unitarios y de integración de `WorkspaceLayout` en verde.
- `QG-FIA-A01.01-03 · Anti-Scope Creep:` Verificación de que no se ha implementado código de colapso, botones no asignados ni peticiones HTTP.
- `QG-FIA-A01.01-04 · Verificación Funcional:` Presencia verificable de roles semánticos y layout de 2 columnas estable conforme a `VF-A01.01`.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. El código mínimo necesario de `WorkspaceLayout` está implementado y satisface el objetivo indexado.
2. Los 4 Quality Gates están superados con evidencia técnica reproducible.
3. No existe violación de contratos del Module Map ni dependencias no autorizadas.
4. Se emiten el `IMPLEMENTATION_REPORT_FIA-A01.01.md`, `TEST_REPORT_FIA-A01.01.md` y la propuesta formal de `LOCK-FIA-A01.01.md`.
