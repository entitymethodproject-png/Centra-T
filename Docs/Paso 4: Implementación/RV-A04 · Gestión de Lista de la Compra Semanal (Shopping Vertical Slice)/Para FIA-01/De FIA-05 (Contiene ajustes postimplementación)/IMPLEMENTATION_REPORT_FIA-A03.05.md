# IMPLEMENTATION REPORT · FIA-A03.05 (CON AJUSTES POST-IMPLEMENTACIÓN)

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A03.05 · TaskActionMenu con Menú Contextual y Modal Preventivo de Eliminación
- **Hito de Rebanada:** QUINTA Y ÚLTIMA UNIDAD DE RV-A03 (CIERRE TOTAL Y SELLADO DE LA REBANADA VERTICAL 3)
- **SPEC de Referencia:** SPEC-FIA-A03.05.md
- **Estado:** COMPLETADO CON ÉXITO (REBANADA RV-A03 COMPLETADA AL 100% Y AUDITADA EN NAVEGADOR)
- **Commits Git:** `84691de` (Implementación base), `c1b231a` (Ajustes de autoajuste y desbordamiento visible)

---

## 1. Resumen de Implementación

Se ha implementado el componente atómico y flotante `TaskActionMenu` junto con el **diálogo modal preventivo de eliminación**, integrándolo plenamente en `TaskCard` y conectando la reactividad en `TasksAccordion`, completando el 100% de la funcionalidad de la Rebanada Vertical 3 (**RV-A03 · Gestión de Tareas Generales**):

1. **Componente `TaskActionMenu` (`src/tasks/components/TaskActionMenu.tsx`):**
   - Disparador accesible `•••` con soporte WCAG AA completo (`aria-haspopup="menu"`, `aria-expanded`, `aria-label="Acciones de tarea"`).
   - Menú contextual flotante (`role="menu"`, `z-index: 100`) con animación de aparición suave (`menuAppear`).
   - Cierre automático al hacer clic fuera del menú mediante listener global `mousedown`.
   - Cierre automático al pulsar la tecla `Escape`.
   - Submenú de cambio de prioridad (`alta`, `media`, `baja`) con indicadores visuales de color, persistencia reactiva vía `tasksService.updateTask` e invocación de `onTaskUpdated`.
   - **Posicionamiento Inteligente (Dropup Automático):** Detección dinámica de espacio inferior (`spaceBelow < 180px`) para desplegarse hacia arriba (`.dropdownMenuUpwards`), evitando recortes cuando se ubica en las tareas inferiores de la lista.

2. **Diálogo Modal Preventivo de Confirmación Destructiva:**
   - Intercepción obligatoria: pulsar `Eliminar tarea` nunca elimina directamente, sino que abre el diálogo modal preventivo (`role="dialog"`, `aria-modal="true"`).
   - **Foco Seguro en Cancelar:** Al abrirse el modal, se posiciona automáticamente el foco en el botón `[Cancelar]` (`cancelButtonRef.current?.focus()`), impidiendo eliminaciones accidentales si el usuario presiona Enter.
   - **Cancelación Inofensiva:** Pulsar `[Cancelar]`, hacer clic en el backdrop oscuro o pulsar la tecla `Escape` cierra el diálogo sin emitir ninguna llamada DELETE al servidor y sin mutar el estado.
   - **Confirmación Segura:** Pulsar `[Eliminar Definitivamente]` ejecuta `tasksService.deleteTask(userId, task.id)`, deshabilita los controles durante la operación (`isDeleting`), cierra el modal y propaga la eliminación mediante `onTaskDeleted(task.id)`.

3. **Integración en `TaskCard.tsx`:**
   - Montaje del componente `TaskActionMenu` en la fila principal de la tarjeta (`taskMain`).
   - Aceptación y propagación de las propiedades `onTaskUpdated` y `onTaskDeleted`.
   - Estilizado con `position: relative; overflow: visible;` y elevación de apilamiento en `.taskItem:focus-within { z-index: 20; }` para asegurar que el menú siempre flote por encima de las tarjetas inferiores.

4. **Reactividad Integral en el Hub (`TasksAccordion.tsx`):**
   - Conexión del callback `onTaskDeleted = (deletedId) => setTasks(prev => prev.filter(t => t.id !== deletedId))`.
   - Retirada instantánea de la tarjeta eliminada en la lista del Hub.
   - Recálculo reactivo automático del contador en la cabecera del acordeón (`Tareas (N)`).
   - Configuración de `overflow: visible` en contenedor, área de contenido y lista para garantizar el autoajuste y desbordamiento flotante sin recortes.

---

## 2. Archivos Físicos Afectados

- **Creados:**
  - `src/tasks/components/TaskActionMenu.tsx`
  - `src/tasks/components/TaskActionMenu.module.css`
  - `src/tasks/components/TaskActionMenu.test.tsx` (9 tests exhaustivos)
- **Modificados (Incluyendo Ajustes Post-Implementación):**
  - `src/tasks/components/TaskCard.tsx` (integración de `TaskActionMenu` y propagación de `onTaskDeleted`)
  - `src/tasks/components/TaskCard.module.css` (`position: relative`, `overflow: visible`, `z-index: 20` en `:focus-within`)
  - `src/hub/components/TasksAccordion.tsx` (manejador reactivo `handleTaskDeleted`, clase `headerCollapsed`)
  - `src/hub/components/TasksAccordion.module.css` (`overflow: visible`, bordes armonizados)
  - `src/tasks/components/TaskActionMenu.tsx` (cálculo de espacio y dropup)
  - `src/tasks/components/TaskActionMenu.module.css` (`.dropdownMenuUpwards`, `z-index: 100`)
- **Preservados (Comprobados sin regresiones):**
  - Capa de Wizard de Creación (`src/tasks/components/TaskCreationWizard.*`, 10 tests intactos).
  - Capa de Tarjeta con Mutación Optimista (`src/tasks/components/TaskCard.test.tsx`, 7 tests intactos).
  - Capa de Hub y Acordeón (`src/hub/components/TasksAccordion.test.tsx`, `src/hub/components/HubContainer.*`, 11 tests intactos).
  - Capa de Dominio y Endpoints (`src/tasks/entities/*`, `src/tasks/services/*`, `src/tasks/controllers/*`, 12 tests intactos).
  - Capa de Autenticación, Usuarios, Workspace y Shell (`src/authentication/*`, `src/users/*`, `src/workspace/*`, `src/App.*`, 54 tests intactos).

---

## 3. Ajustes Post-Implementación de UI (Bug de Recorte Resuelto)

Durante la inspección visual en navegador, se observó que al tener una única tarea, el acordeón se ajustaba a ~80px de alto y, al poseer `overflow: hidden;`, recortaba el menú desplegable en su borde inferior.

* **Solución aplicada:**
  1. Sustitución de `overflow: hidden` por `overflow: visible` en `.accordionContainer`, `.contentArea` y `.taskList`.
  2. Implementación de *dropup* automático (`openUpwards`) para tareas cercanas al borde inferior de la pantalla.
  3. Elevación de `z-index: 20` en `:focus-within` para evitar solapamientos al acumular múltiples tareas.
  4. Informe monográfico detallado en `REPORTE_AJUSTES_POST_IMPLEMENTACION_SENIOR.md`.

---

## 4. Estado de los Quality Gates

- **QG-01 · Typecheck:** PASSED (0 errores en TypeScript estricto con `tsc --noEmit`).
- **QG-02 · Linting:** PASSED (0 warnings).
- **QG-03 · Tests Suite:** PASSED (**103/103 tests pasando al 100% en verde** en la suite global de Vitest a través de 15 suites de pruebas).
- **QG-04 · Blindaje Preventivo:** PASSED (Tests específicos verificando foco en Cancelar, neutralidad ante Escape y ejecución DELETE únicamente tras confirmación).
- **QG-05 · Accesibilidad WCAG AA:** PASSED (`role="menu"`, `role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded`, modal con `role="dialog"` y `aria-modal="true"`).
