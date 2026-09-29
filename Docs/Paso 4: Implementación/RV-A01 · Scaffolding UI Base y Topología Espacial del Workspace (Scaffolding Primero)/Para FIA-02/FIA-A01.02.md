# CENTRA-T · FIA-A01.02 · MECANISMO COLAPSABLE REACTIVO DEL HUB
**Rebanada Vertical:** RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A01.02`
- **Rebanada Vertical:** `RV-A01 · Scaffolding UI Base y Topología Espacial del Workspace (Scaffolding Primero)`
- **Unidad Prevista:** `Mecanismo Colapsable Reactivo del Hub`
- **PVF de Cierre Cubierta:** `PVF-A01.02 · Colapso y Expansión Reactiva del Hub Lateral`
- **VF Interna de Derivación:** `VF-A01.02 · Comportamiento Colapsable del Hub Lateral`
- **Objetivo Indexado:** `Implementar hook de estado visual y botón toggle con transición CSS (<=200ms) que colapsa el Hub a 0px y expande el área de trabajo al 100% conservando estado interno.`
- **Validación Indexada:** `src/hub/components/HubContainer.tsx`
- **Evidencia de Cierre Indexada:** `Clic en toggle conmuta ancho de paneles sin recarga ni parpadeo visual; estado de apertura persistido reactivamente.`
- **LOCK Previo Requerido:** `LOCK-FIA-A01.01.md APROBADO (Commit: 0d2c2a8)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Implementar la reactividad de colapso y expansión del panel lateral Hub (conmutando entre su ancho nominal de 380px y 0px) y la adaptación automática del Workbench (que pasa a ocupar el 100% del área horizontal disponible), controlado mediante un botón toggle accesible con transición CSS suave ($\le 200$ms) y preservación incondicional del estado interno de los componentes hijos montados en el Hub.

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación del componente contenedor `HubContainer` en `src/hub/components/HubContainer.tsx`.
  - Integración del botón accesible de alternancia (toggle) con atributos ARIA dinámicos (`aria-expanded`, `aria-label`).
  - Animación/transición CSS no bloqueante con duración estricta $\le 200$ms (`transition: width 200ms ease, margin 200ms ease`).
  - Adaptación reactiva del `WorkspaceLayout` para reflejar el estado colapsado del Hub y permitir al Workbench expandirse al 100% del lienzo.
  - Preservación del DOM y estado en memoria de los hijos del Hub durante el colapso (sin desmontar componentes).
  - Batería de pruebas unitarias y de integración que validen el clic en el toggle, la actualización de atributos ARIA y la permanencia de los elementos hijos.
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Implementación de avatar, perfil de usuario o indicador de conectividad de red en TopNavbar (pertenecen a `FIA-A01.03`).
  - Acordeones internos de listas de tareas, compra o limpieza (pertenecen a `RV-A03`, `RV-A04`, `RV-A05`).
  - Renderizado o lógica de calendario interactivo mensual (pertenece a `RV-A06`).
  - Persistencia en servidor, cookies o endpoints HTTP.

### 4. Dependencias
- **Documentales:** 
  - `SUITE_ARQUITECTURA_CORE.docx` (Docs 01 a 05).
  - `SUITE_ARQUITECTURA_UI.docx` (Docs 06 a 10: Topología UI, Tiempos de Interacción < 16ms, CLS = 0).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Doc 11: Fila PVF-A01.02 / VF-A01.02).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Doc 12: Fila FIA-A01.02).
  - `FIA-A01.01_AS_BUILT.md` (Estado previo bloqueado y certificado).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A01.01` (Aprobado en commit `0d2c2a8`).
  - *Posterior:* La unidad `FIA-A01.03` (TopNavbar con Perfil y Telemetría de Red) no podrá iniciarse hasta el cierre y LOCK de esta FIA.

### 5. Contratos Afectados
- **Contrato Funcional:** La acción de pulsar el control de toggle conmuta el ancho del panel Hub entre 380px y 0px en un tiempo máximo de 200ms sin recargar la página ni mutar destructivamente el DOM.
- **Contrato Físico / Module Map:** Ubicación en `src/hub/components/HubContainer.tsx` (y sus estilos/tests) con posible conexión a `src/workspace/components/WorkspaceLayout.tsx`.
- **Contrato de Aislamiento:** El estado de colapso pertenece exclusivamente al Nivel 2 de arquitectura de UI (Global/Local Client State efímero). Prohibido acoplar con llamadas de backend o bases de datos.

### 6. Restricciones
- Prohibido desmontar (`unmount`) el contenido interno del Hub cuando esté colapsado; los elementos deben permanecer en el DOM para salvaguardar su estado reactivo.
- Prohibido usar transiciones CSS con duración superior a 200ms.
- Prohibido introducir librerías externas de animación pesadas (utilizar CSS nativo / CSS Modules).
- Prohibido romper el contrato de roles semánticos establecido en `FIA-A01.01`.

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/hub/components/HubContainer.tsx`.
- **Estructura Interna:**
  - Componente `HubContainer` con estado reactivo de apertura/colapso (`isCollapsed`).
  - Botón toggle integrado:
    `<button type="button" aria-expanded={!isCollapsed} aria-label={isCollapsed ? "Expandir panel lateral" : "Colapsar panel lateral"} onClick={toggleHub}>`
  - Contenedor con clase CSS condicional para aplicar ancho 380px o 0px con `overflow: hidden` durante el colapso.
- **Manejo de Errores y Tipado:** Props tipadas estrictamente (`HubContainerProps`) permitiendo inyección de `children` y callbacks opcionales `onToggle`.
- **Fronteras Físicas Autorizadas:**
  - `src/hub/components/HubContainer.tsx`
  - `src/hub/components/HubContainer.module.css`
  - `src/hub/components/HubContainer.test.tsx`
  - `src/workspace/components/WorkspaceLayout.tsx` (modificación menor para admitir el nuevo comportamiento dinámico o slot integrado)
  - `src/workspace/components/WorkspaceLayout.module.css` (ajuste de transición de columnas si aplica)

### 8. Flujo Operativo
1. El usuario carga el Workspace con el Hub en estado visible (ancho 380px) y el botón toggle mostrando `aria-expanded="true"`.
2. El usuario hace clic en el botón de colapso.
3. Se actualiza el estado interno a `isCollapsed = true`.
4. El contenedor del Hub reduce su ancho a 0px mediante transición CSS fluida ($\le 200$ms) mientras el Workbench expande su área para cubrir el 100% del ancho restante.
5. El botón de toggle actualiza su estado a `aria-expanded="false"` y cambia su etiqueta accesible a "Expandir panel lateral".
6. El usuario vuelve a hacer clic en el botón de toggle: el Hub recupera sus 380px de forma fluida, encontrando todo su contenido interno en el mismo estado en que se dejó.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Colapso del Hub):**
  - *Condición inicial:* Hub expandido (`aria-expanded="true"`).
  - *Acción:* Clic en botón toggle.
  - *Comportamiento esperado:* Se aplica clase de colapso, el ancho pasa a 0px en $\le 200$ms, el Workbench se expande y `aria-expanded` pasa a `"false"`.
- **Caso 2 (Re-expansión del Hub y conservación de estado):**
  - *Condición inicial:* Hub colapsado (`aria-expanded="false"`) con componentes hijos montados.
  - *Acción:* Clic en botón toggle.
  - *Comportamiento esperado:* El Hub vuelve a mostrar sus 380px sin saltos de maquetación y los componentes hijos siguen montados e intactos.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Pulsaciones rápidas consecutivas / doble clic):**
  - *Comportamiento esperado:* La transición CSS responde de forma determinista sin saltos de layout ni congelación de la interfaz.
- **Causas de Rechazo Automático:**
  - Desmontaje del árbol de componentes hijos al colapsar el Hub.
  - Duración de la animación superior a 200ms.
  - Pérdida de accesibilidad en el botón de alternancia (ausencia de `aria-expanded` o `aria-label`).
  - Cumulative Layout Shift (CLS) parásito o desbordamiento fuera del viewport.

### 11. Tests Requeridos
- **Tests Unitarios:**
  - Renderizado inicial de `HubContainer` con sus hijos en estado expandido por defecto.
  - Presencia del botón toggle con `aria-expanded="true"`.
- **Tests de Integración (Testing Library):**
  - Disparo de clic en el botón toggle y verificación de cambio a `aria-expanded="false"`.
  - Comprobación de que los elementos hijos dentro del Hub siguen existiendo en el documento tras el colapso (`toBeInTheDocument()`).
  - Verificación de aplicación de clases CSS de transición y estado colapsado.
- **Evidencia Exigida:** Suite de tests ejecutada en verde (100% pass) con reporte emitido por Vitest.

### 12. Quality Gates (QG-FIA-A01.02)
- `QG-FIA-A01.02-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript.
- `QG-FIA-A01.02-02 · Tests:` 100% de tests unitarios y de integración en verde.
- `QG-FIA-A01.02-03 · Anti-Scope Creep:` Cero código de telemetría de red, avatares o acordeones de listas.
- `QG-FIA-A01.02-04 · Verificación Funcional:` Conmutación reactiva demostrada con preservación de estado conforme a `VF-A01.02`.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. `HubContainer` y su mecanismo toggle están implementados y satisfacen el objetivo indexado.
2. Los 4 Quality Gates están superados con evidencia técnica.
3. El contenido del Hub preserva su integridad física en memoria tras el colapso.
4. Se emiten el `IMPLEMENTATION_REPORT_FIA-A01.02.md`, `TEST_REPORT_FIA-A01.02.md` y la propuesta formal de `LOCK-FIA-A01.02.md`.
