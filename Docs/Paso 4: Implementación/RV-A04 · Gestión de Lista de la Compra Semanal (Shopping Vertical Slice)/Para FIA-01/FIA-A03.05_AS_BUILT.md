# CENTRA-T · FIA-A03.05 · MENÚ CONTEXTUAL Y DIÁLOGO PREVENTIVO DE ELIMINACIÓN (AS-BUILT)
**Rebanada Vertical:** RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK · CIERRE TOTAL Y SELLADO DEFINITIVO DE LA REBANADA RV-A03  
**Evidencia de Cierre:** LOCK-FIA-A03.05.md APROBADO (Commits: `84691de`, `c1b231a`)  

---

### 1. Identificación
- **FIA:** `FIA-A03.05`
- **Rebanada Vertical:** `RV-A03 · Gestión de Tareas Generales (Tasks Vertical Slice)`
- **Unidad Implementada:** `TaskActionMenu con Menú Contextual y Modal Preventivo de Eliminación`
- **Hito de Rebanada:** `Quinta y Última Unidad de RV-A03 (Cierre Total y Sellado Definitivo de la Rebanada Vertical 3)`
- **PVF Satisfecha:** `PVF-A03.05 · Edición Contextual y Eliminación con Diálogo Preventivo`
- **VF Asociada:** `VF-A03.05 · Edición y Eliminación con Diálogo Preventivo`
- **Commits de Cierre (Git):** `84691de` (Base), `c1b231a` (Ajustes de autoajuste y desbordamiento visible)
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A03.05.md Aprobado (103/103 tests en verde a través de 15 suites, 9 tests específicos dedicados a TaskActionMenu y modal preventivo)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Actúa como el LOCK formal vinculante para el cierre de RV-A03 y la apertura de RV-A04.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A03.05.md` y `FIA-A03.05.md`, en cumplimiento estricto del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura de `SUITE_ARQUITECTURA_CORE.docx`, `07_CENTRA_T_UI_SPECS_FEATURES.docx` (Features 05 y 09) y `Centra-T Pseudocódigo (unificado).odt` (Procesos 4.3 y 4.4).

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A03.04` (Commit `479fb77`), con 94 tests en verde, tarjeta `TaskCard` con mutación optimista y blindaje del caso forense VV-005.
- **Archivos Base:** Módulos `src/tasks/*`, `src/hub/*`, `src/workspace/*`, `src/authentication/*` y `src/users/*`.

### 4. Objetivo Implementado
1. Materialización del componente `TaskActionMenu` en `src/tasks/components/TaskActionMenu.tsx` con estilos encapsulados en `TaskActionMenu.module.css`.
2. Botón disparador `•••` accesible con atributos WCAG AA (`aria-haspopup="menu"`, `aria-expanded`).
3. Menú contextual flotante accesible (`role="menu"`, `role="menuitem"`) con cierre automático al hacer clic fuera del menú o presionar la tecla `Escape`.
4. Edición contextual de prioridad (`alta`, `media`, `baja`) interactiva y persistida en el backend mediante `tasksService.updateTask`.
5. **Diálogo Modal Preventivo de Confirmación Destructiva:**
   - Intercepción obligatoria de la eliminación: ninguna tarea se borra directamente al pulsar un botón.
   - **Foco seguro predeterminado en `[Cancelar]`**, impidiendo la eliminación por pulsación involuntaria de la tecla `Enter`.
   - Cancelación inofensiva: pulsar `[Cancelar]`, `Escape` o el fondo oscuro cierra el diálogo sin emitir ninguna llamada DELETE ni alterar el estado.
   - Confirmación destructiva: pulsar `[Eliminar Definitivamente]` ejecuta `tasksService.deleteTask`, cierra el modal, retira la tarjeta del Hub y actualiza el contador `Tareas (N)`.
6. Ajuste post-implementación senior (`c1b231a`): erradicación del recorte de menú mediante `overflow: visible` en el contenedor del acordeón y apilamiento `:focus-within { z-index: 20; }` en las tarjetas.

### 5. Alcance Final
- Creación de `src/tasks/components/TaskActionMenu.tsx`.
- Creación de `src/tasks/components/TaskActionMenu.module.css`.
- Creación de `src/tasks/components/TaskActionMenu.test.tsx` (9 tests de unidad, integración y modal preventivo).
- Modificación de `src/tasks/components/TaskCard.tsx` (integración con `TaskActionMenu` y propagación de `onTaskDeleted`).
- Modificación de `src/hub/components/TasksAccordion.tsx` y `TasksAccordion.module.css` (manejo de eliminación reactiva y desbordamiento visible).
- Emisión de `REPORTE_AJUSTES_POST_IMPLEMENTACION_SENIOR.md`.
- Suite global completa: 103/103 tests pasando al 100% en verde con Vitest a través de 15 suites.
- Actualización de los 3 archivos JSON de gobernanza en `Para FIA-01/De FIA-05/`.

### 6. Dependencias Reales
- **Dependencias de Producción:** `react` (^19.0.0), `react-dom` (^19.0.0), `bcryptjs` (^3.0.3).
- **Dependencias de Desarrollo:** `@types/react` (^19.0.0), `@types/react-dom` (^19.0.0), `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.2.7), `@testing-library/react` (^16.3.2), `@testing-library/user-event` (^14.6.1), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato de Componente de Menú (`TaskActionMenuProps`):**
  ```typescript
  export interface TaskActionMenuProps {
    task: TaskItem;
    userId?: string;
    tasksService?: TasksService;
    onTaskUpdated?: (updatedTask: TaskItem) => void;
    onTaskDeleted?: (taskId: string) => void;
  }
  ```
- **Contrato de Tarjeta de Tarea (`TaskCardProps`):** Actualizado con `onTaskDeleted?: (taskId: string) => void`.
- **Contrato de Acordeón en Hub (`TasksAccordionProps`):** Preservado al 100%.

### 8. Restricciones Finales
- Intercepción modal preventiva obligatoria antes de cualquier emisión DELETE.
- Foco predeterminado en `[Cancelar]` en el modal preventivo.
- Cero peticiones de red o mutaciones ante cancelación o tecla `Escape`.
- Accesibilidad WCAG AA en menú contextual y diálogo de confirmación.

### 9. Diseño Técnico Final
- Menú contextual posicionado absolutamente con autoajuste inteligente.
- Diálogo modal con overlay oscuro (`backdrop-filter: blur(4px)`) y z-index 1000.
- Reactividad bidireccional y actualización síncrona de listas en el Hub.

### 10. Flujo Operativo Final
1. El usuario pulsa `•••` en la tarjeta -> se despliega el menú contextual.
2. Si pulsa `Cambiar prioridad` -> actualiza la prioridad con `tasksService.updateTask` y notifica a `onTaskUpdated`.
3. Si pulsa `Eliminar tarea` -> se intercepta y despliega el diálogo modal con foco en `[Cancelar]`.
4. Si pulsa `[Cancelar]` o `Escape` -> el modal se cierra sin emitir DELETE ni mutar el estado.
5. Si pulsa `[Eliminar Definitivamente]` -> se invoca `tasksService.deleteTask`, se retira la tarjeta del Hub y se actualiza el contador dinámico `Tareas (N)`.

### 11. Casos Válidos Finales
- **Validado 1:** Renderizado accesible del disparador `(...)` con `aria-haspopup="menu"`.
- **Validado 2:** Apertura del menú contextual al hacer clic en el disparador.
- **Validado 3:** Cierre automático del menú al hacer clic fuera del mismo.
- **Validado 4:** Modificación de prioridad de la tarea e invocación reactiva de `onTaskUpdated`.
- **Validado 5:** Eliminación exitosa confirmada: invoca `deleteTask` y retira la tarjeta con `onTaskDeleted`.

### 12. Casos Inválidos Finales
- **Validado 1:** Cierre del menú contextual al presionar la tecla `Escape`.
- **Validado 2:** Intercepción obligatoria: pulsar Eliminar abre el modal preventivo con foco seguro en `[Cancelar]`.
- **Validado 3:** Cancelación inofensiva: pulsar `[Cancelar]` cierra el modal sin emitir DELETE ni mutar estado.
- **Validado 4:** Cancelación con tecla `Escape` en el modal preventivo sin emitir DELETE.

### 13. Tests Requeridos Finales
Suite global de 103 tests validada al 100% en verde:
- `TaskActionMenu.test.tsx` (9 tests de menú contextual y diálogo preventivo)
- `TaskCard.test.tsx` (7 tests intactos, caso VV-005)
- `TaskCreationWizard.test.tsx` (10 tests intactos, caso VV-004)
- `TasksAccordion.test.tsx` (7 tests intactos)
- `HubContainer.test.tsx` (4 tests intactos)
- `tasks.service.test.ts` (9 tests intactos)
- `tasks.controller.test.ts` (3 tests intactos)
- Suites previas de auth, users, workspace y App (54 tests intactos).

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript con `tsc --noEmit`).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (103/103 tests pasando al 100% en verde en Vitest).
- `QG-04 · Blindaje Preventivo de Eliminación:` Superado y certificado por tests automatizados.
- `QG-05 · Accesibilidad WCAG AA:` Superado (marcado semántico de menú y diálogo modal con foco seguro).

### 15. Archivos Reales Afectados
```
Creados:
- src/tasks/components/TaskActionMenu.tsx
- src/tasks/components/TaskActionMenu.module.css
- src/tasks/components/TaskActionMenu.test.tsx

Modificados:
- src/tasks/components/TaskCard.tsx
- src/hub/components/TasksAccordion.tsx
- src/hub/components/TasksAccordion.module.css
```

### 16. Diferencias Respecto a la FIA Original
Se ajustó `TasksAccordion.module.css` (`overflow: visible`) y el apilamiento de tarjetas para evitar el recorte del menú flotante en acordeones con pocas tareas, según consta en `REPORTE_AJUSTES_POST_IMPLEMENTACION_SENIOR.md`.

### 17. Drift Integrado
Cero drift arquitectónico.

### 18. Decisiones de Cambio (CHG) Integradas
- `CHG-A03.05-01`: Desbordamiento visible y z-index dinámico para menús contextuales en el Hub.

### 19. Definition of Done AS-BUILT (CIERRE TOTAL DE RV-A03)
Se certifica que la unidad `FIA-A03.05` y la **totalidad de la Rebanada Vertical RV-A03 (Gestión de Tareas Generales)** han completado satisfactoriamente su ciclo operativo bajo el Método zug, cumpliendo al 100% los 5 PVFs indexados con 103/103 tests en verde. Queda formalmente sellada con **LOCK APROBADO**, autorizando formalmente la transición y apertura de **`RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)`**, iniciando por **`FIA-A04.01 · Módulo Backend Shopping y Asignación Grupal`**.
