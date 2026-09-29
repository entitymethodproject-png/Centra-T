# CENTRA-T · FIA-A05.01 · MÓDULO BACKEND CLEANING HOMOGÉNEO (AS-BUILT)
**Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK  
**Evidencia de Cierre:** LOCK-FIA-A05.01.md APROBADO  

---

### 1. Identificación
- **FIA:** `FIA-A05.01`
- **Rebanada Vertical:** `RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)`
- **Unidad Implementada:** `Módulo Backend Cleaning Homogéneo`
- **PVF Satisfecha:** Cimiento transaccional de `PVF-A05.01`, `PVF-A05.02` y `PVF-A05.03`
- **VF Interna:** `VF-A05.01 · Dominio y Servicios de Limpieza`
- **Fecha de Cierre:** 2026-09-29

### 2. Objetivo Implementado
Se ha materializado y verificado la arquitectura completa del motor de dominio y la API backend para el módulo de limpieza doméstica (`src/cleaning/*`), alineada estrictamente al **Modelo Universal de Tareas**:
1. **Entidad de Dominio Canónica (`CleaningItem`):**
   - Atributos universales: `id` (UUID), `userId` (inmutable, multi-tenant), `modulo: 'cleaning'` (inmutable), `titulo` (1..120 chars - Decisión 2B), `descripcion` (0..1000 chars), `prioridad` (`'alta' | 'media' | 'baja'`), `completado` (boolean, default false), `fechaProgramada` (Date | null), `createdAt` y `updatedAt`.
2. **Prioridades y Validaciones:**
   - Prioridades semánticas (`alta`, `media`, `baja`) con valor por defecto `media`.
   - Validación de longitud de título (1..120 chars) y descripción (0..1000 chars).
3. **Capa de Persistencia Multi-Tenant (`CleaningRepository`):**
   - Interfaz `ICleaningRepository` e implementación `InMemoryCleaningRepository` con aislamiento incondicional por `userId`.
4. **Capa de Servicio de Negocio (`CleaningService`):**
   - Métodos CRUD completos, alternancia atómica con `toggleTaskStatus`, eliminación con `deleteItem` y control estricto de accesos.
5. **Controlador HTTP REST (`CleaningController`):**
   - Endpoints `/cleaning`, `/cleaning/:id` y `/cleaning/:id/complete` desacoplados con contratos canónicos `HttpRequest` / `HttpResponse`.

### 3. Alcance Final
- **Elementos Materializados (IN-SCOPE):**
  - `src/cleaning/entities/cleaning-item.entity.ts`
  - `src/cleaning/dto/create-cleaning-item.dto.ts`
  - `src/cleaning/dto/update-cleaning-item.dto.ts`
  - `src/cleaning/repositories/cleaning.repository.ts`
  - `src/cleaning/services/cleaning.service.ts`
  - `src/cleaning/services/cleaning.service.test.ts` (9 tests unitarios)
  - `src/cleaning/controllers/cleaning.controller.ts`
  - `src/cleaning/controllers/cleaning.controller.test.ts` (4 tests unitarios)

### 4. Contratos Finales
```typescript
export type CleaningPriority = 'alta' | 'media' | 'baja';

export interface CleaningItem {
  id: string;
  userId: string;
  modulo: 'cleaning';
  titulo: string;
  descripcion: string;
  prioridad: CleaningPriority;
  completado: boolean;
  fechaProgramada: Date | null;
  createdAt: Date;
  updatedAt: Date;
  nombre?: string;
}
```
