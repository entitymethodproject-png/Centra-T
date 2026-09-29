# IMPLEMENTATION REPORT · FIA-A04.02

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A04.02 · Acordeón de Lista de la Compra en Hub con Telemetría e Input Rápido
- **Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)
- **Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A04 (INTEGRACIÓN EN HUB, TELEMETRÍA REACTIVA Y ENTRADA RÁPIDA INLINE)
- **SPEC de Referencia:** SPEC-FIA-A04.02.md
- **Estado:** COMPLETADO CON ÉXITO (100% OPERATIVO, 128/128 TESTS EN VERDE TRAS AJUSTE POST-IMPLEMENTACIÓN)
- **Commits Git de Cierre:** `c0a80bf` (Base) y `ec453de` (Ajuste de selector a paso entero de 1 en 1)

---

## 1. Resumen de Implementación

Se ha implementado en su totalidad la interfaz de usuario reactiva para la lista de la compra semanal dentro del Hub lateral de Centra-T, satisfaciendo estrictamente los requerimientos **PVF-A04.01**, **PVF-A04.02**, **VF-A04.01** y **VF-A04.02** bajo el Método zug:

1. **Componente de Entrada Rápida Inline (`src/shopping/components/QuickItemInput.tsx`):**
   - Formulario integrado en una sola fila compacta: input de nombre de producto, selector numérico de cantidad por unidades enteras (`min={1}`, `step={1}`, valor por defecto `1`), selector de unidad (`'ud'`, `'kg'`, `'g'`, `'l'`, `'pack'`) y botón de envío (`+`).
   - **Retención de Foco Continuo:** Tras enviar un producto presionando `Enter`, los campos se limpian/restablecen inmediatamente y el cursor retiene incondicionalmente el foco en el campo de texto mediante `inputRef.current?.focus()`, habilitando el ingreso ininterrumpido en ráfaga.
   - **Blindaje Decisión 2B:** Atributo nativo `maxLength={120}` y recorte estricto impidiendo la entrada de nombres superiores a 120 caracteres.
   - **Manejo Resiliente de Estado:** Soporte para vaciado de buffer (`cantidad: number | ''`) evitando que la pulsación de *Backspace* genere parpadeos o inserte forzosamente el valor 1. Normalización segura en submit (`Math.max(1, cantidad)`).
   - **Protección Antirebotes:** Prevención de envíos concurrentes mediante `isSubmitting` y bloqueo de strings vacíos o compuestos exclusivamente por espacios en blanco.

2. **Estilos de Entrada Rápida (`src/shopping/components/QuickItemInput.module.css`):**
   - Diseño oscuro empático (`#0b0f17`, borde `#233144`), estados `:focus-within` en azul (`#3b82f6`) y botón de adición reactivo.

3. **Componente de Acordeón en Hub (`src/hub/components/ShoppingAccordion.tsx`):**
   - **Cabecera con Telemetría en Tiempo Real:** Muestra el formato unificado `Compra Semanal (${comprados}/${total})` calculando dinámicamente el ratio de ítems adquiridos sobre el total.
   - **Badge de Pendientes:** Insignia contextual `${pendientes} pendientes` destacada en ámbar (`#f59e0b`), visible exclusivamente cuando existen productos pendientes (`pendientes > 0`).
   - **Conmutación Accesible:** Plegado y desplegado de cuerpo accesible por clic, teclado (`Enter`, espacio) y sincronización ARIA (`aria-expanded`, `role="button"`).
   - **Matriz de Estados Visuales:**
     - *Skeleton Screen:* Indicador de carga no intrusivo con 3 líneas parpadeantes (`isLoading=true`) sin modales bloqueantes.
     - *Empty State:* Diseño sobrio con borde punteado (`#233144`) e icono cuando la lista no tiene productos.
     - *Estado Poblado:* Lista reactiva con checkbox de compra (`aria-label` accesible), tachado visual (`line-through`) y badge de cantidad/unidad.
     - *Manejo de Errores:* Alerta contextual con botón [Reintentar].

4. **Estilos de Acordeón (`src/hub/components/ShoppingAccordion.module.css`):**
   - Contenedor con `overflow: visible` para permitir menús contextuales futuros sin clipping visual (resolución definitiva de incidencias previas).
   - Transiciones suaves de chevron (`transform: rotate(90deg)`), tipografía optimizada y badges estilizados.

5. **Montaje e Integración en el Hub (`src/App.tsx`):**
   - Incorporación de `<ShoppingAccordion />` dentro de `<HubContainer>` en `hubSlot`, conviviendo armónicamente con `<TasksAccordion />`.

---

## 2. Archivos Físicos Creados y Modificados

### Archivos Creados:
- `src/shopping/components/QuickItemInput.tsx`
- `src/shopping/components/QuickItemInput.module.css`
- `src/shopping/components/QuickItemInput.test.tsx` (6 tests unitarios)
- `src/hub/components/ShoppingAccordion.tsx`
- `src/hub/components/ShoppingAccordion.module.css`
- `src/hub/components/ShoppingAccordion.test.tsx` (7 tests unitarios y de integración)

### Archivos Modificados:
- `src/App.tsx`: Inyección de `ShoppingAccordion` en `HubContainer`.

---

## 3. Auditoría de Drift y Cumplimiento Metodológico

- **Drift Detectado:** 0 (Adherencia matemática absoluta a `SPEC-FIA-A04.02.md`).
- **Regresiones en el Proyecto:** 0 (Todos los tests anteriores de Auth, Workspace, Tasks y Shopping Backend pasaron sin incidencias).
- **Decisión 2B Respetada:** Longitud de nombre acotada a 120 caracteres en `QuickItemInput`.
- **Experiencia de Usuario (UX) Ininterrumpida:** Retención de foco comprobada en test específico y selector de cantidad que opera en unidades enteras (`step="1"` y `min="1"`).
- **Coexistencia en Hub:** Ambos acordeones (`TasksAccordion` y `ShoppingAccordion`) comparten el contenedor de 380px sin solapamientos ni desbordamientos.

---

## 4. Estado de los Quality Gates

- **QG-01 · Typecheck:** PASSED (0 errores con `tsc --noEmit`).
- **QG-02 · Linting:** PASSED (0 warnings).
- **QG-03 · Tests Suite:** PASSED (**128/128 tests pasando al 100% en verde** en Vitest a través de 19 suites de prueba).
- **QG-04 · Telemetría y Controles:** PASSED (Verificado en tests con cambios de ratio `(1/3)` a `(2/3)` y conteo de pendientes, más ajuste de paso de cantidad en unidades enteras).
- **QG-05 · Accesibilidad WCAG AA:** PASSED (Controles con semántica ARIA, roles estándar y soporte de teclado).
