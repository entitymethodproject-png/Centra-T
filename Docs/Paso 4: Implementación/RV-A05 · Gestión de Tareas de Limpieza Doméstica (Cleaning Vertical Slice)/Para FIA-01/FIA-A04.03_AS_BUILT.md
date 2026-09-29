# CENTRA-T · FIA-A04.03 · MÓDULO DE COMPRA HOMOGÉNEO (AS-BUILT)
**Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK · RV-A04 100% HOMOGÉNEA  
**Evidencia de Cierre:** LOCK-FIA-A04.03.md APROBADO  

---

### 1. Identificación
- **FIA:** `FIA-A04.03`
- **Rebanada Vertical:** `RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)`
- **Unidad Implementada:** `Módulo de Compra Homogéneo (Modelo Universal de Tareas)`
- **PVF Satisfecha:** `PVF-A04.03 · Lista de Compra Homogénea con Tarjetas y Menú Contextual`
- **VF Interna:** `VF-A04.03 · Homogeneización de Ítems de Compra`
- **Fecha de Cierre:** 2026-09-29

### 2. Objetivo Implementado
Se ha materializado y consolidado la arquitectura del módulo de lista de compra (`src/shopping/*`) bajo el **Modelo Universal de Tareas**, unificado con `tasks` y `cleaning`:
1. **Entidad Universal (`ShoppingItem`):**
   - Atributos requeridos: `id` (UUID), `userId` (inmutable, multi-tenant), `modulo: 'shopping'`, `titulo` (1..120 chars - Decisión 2B), `descripcion` (0..1000 chars), `prioridad` (`'alta' | 'media' | 'baja'`), `completado` (boolean), `fechaProgramada` (Date | null), `createdAt` y `updatedAt`.
   - Compatibilidad hacia atrás: aliases `nombre` (apuntando a `titulo`) y `comprado` (apuntando a `completado`).
   - Eliminados campos de cantidad y unidad (detalles como marcas o unidades se indican libremente en `descripcion`).
2. **Tarjeta de Compra Homogénea (`ShoppingCard`):**
   - Checkbox accesible con mutación optimista inmediata.
   - Título con tachado visual en estado completado.
   - Badge semántico de prioridad (`ALTA`, `MEDIA`, `BAJA`).
   - Menú contextual de 3 puntos (`ShoppingActionMenu`).
3. **Menú Contextual de 3 Puntos (`ShoppingActionMenu`):**
   - Disparador accesible `•••`.
   - Submenú para cambio dinámico de prioridad en tiempo real.
   - Opción de eliminación con diálogo modal preventivo con foco seguro en `[Cancelar]`.
4. **Wizard de Creación en 3 Pasos (`ShoppingCreationWizard`):**
   - Paso 1: Nombre/título del producto (1..120 chars).
   - Paso 2: Detalles y notas (opcional, 0..1000 chars).
   - Paso 3: Selección de prioridad (`Alta`, `Media`, `Baja`).
   - Rollback a cero ante cancelación o tecla `Escape`.
5. **Acordeón Limpio (`ShoppingAccordion`):**
   - Cabecera homogénea: Chevron `▶`, título `Compra (${items.length})` y botón cuadrado compacto `+` (26x26px).
   - Eliminados inputs rápidos inline inferiores y badges redundantes de pendientes.

### 3. Alcance Final de Archivos
- `src/shopping/entities/shopping-item.entity.ts`
- `src/shopping/dto/create-shopping-item.dto.ts`
- `src/shopping/dto/update-shopping-item.dto.ts`
- `src/shopping/services/shopping.service.ts` y `shopping.service.test.ts`
- `src/shopping/controllers/shopping.controller.ts` y `shopping.controller.test.ts`
- `src/shopping/components/ShoppingCard.tsx`, `ShoppingCard.module.css` y `ShoppingCard.test.tsx`
- `src/shopping/components/ShoppingActionMenu.tsx`, `ShoppingActionMenu.module.css` y `ShoppingActionMenu.test.tsx`
- `src/shopping/components/ShoppingCreationWizard.tsx`, `ShoppingCreationWizard.module.css` y `ShoppingCreationWizard.test.tsx`
- `src/hub/components/ShoppingAccordion.tsx`, `ShoppingAccordion.module.css` y `ShoppingAccordion.test.tsx`
