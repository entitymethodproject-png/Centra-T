# SPEC-FIA-A05.01 · MÓDULO BACKEND CLEANING HOMOGÉNEO (MODELO UNIVERSAL)

**Proyecto:** Centra-T  
**Rebanada Vertical:** RV-A05 · Gestión de Tareas de Limpieza Doméstica (Cleaning Vertical Slice)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A05.01 · Módulo Backend Cleaning Homogéneo  
**PVF de Cierre:** PVF-A05.01, PVF-A05.02 y PVF-A05.03 (Cimiento de Dominio Universal)  
**VF:** VF-A05.01 · Dominio y Servicios de Limpieza  
**Estado de Entrada:** FIA aprobada · Homogeneización Universal  
**Hito de Rebanada:** PRIMERA UNIDAD DE RV-A05 (ENTIDAD UNIVERSAL, DTOs, REPOSITORIO, SERVICIO CON PRIORIDADES Y CONTROLADOR REST)  
**LOCK Previo Requerido:** LOCK-FIA-A04.03.md APROBADO  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
El propósito formal de esta especificación técnica ejecutable es definir los cimientos del módulo de limpieza doméstica (`src/cleaning/*`), bajo el **Modelo de Dominio Universal** unificado con `tasks` y `shopping`.
Todas las tareas en Centra-T comparten la misma estructura canónica: título (1..120 caracteres - Decisión 2B), descripción opcional (0..1000 caracteres), nivel de prioridad (`alta`, `media`, `baja`) y estado completado.
Cualquier detalle específico de la tarea de limpieza se documenta libremente dentro del campo `descripcion` (sin campos fragmentados ni restrictivos como zonas o frecuencias forzadas, y sin campos de fecha en creación, ya que la asignación temporal se realiza de forma unificada mediante el Calendario).

---

## 2. Objetivo
Construir y verificar exhaustivamente con TDD en Vitest el motor backend de `cleaning`:
1. **Entidad `CleaningItem`:** Atributos universales `id`, `userId`, `modulo: 'cleaning'`, `titulo` (1..120 chars), `descripcion` (0..1000 chars), `prioridad: CleaningPriority` ('alta' | 'media' | 'baja'), `completado: boolean`, `fechaProgramada: Date | null`, `createdAt: Date` y `updatedAt: Date`.
2. **Niveles de Prioridad:** Gestión unificada de prioridad (`alta`, `media`, `baja`), con valor por defecto `media`.
3. **Alternancia Atómica de Estado:** Método `toggleTaskStatus(userId, id)` y mutación idempotente `updateItem`.
4. **Capa de Repositorio y Servicio:** Aislamiento multi-tenant inquebrantable por `userId`, borrado seguro `deleteItem(userId, id)` y manejo tipado de errores (400, 404).
5. **Controlador HTTP:** Endpoints REST desacoplados para `/cleaning` (GET, POST, GET :id, PATCH :id, DELETE :id).
6. **Batería de Pruebas:** Tests de servicio y controlador pasando al 100% en verde.

---

## 3. Contratos de Dominio y DTO
### 3.1 Contrato de Dominio
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
  nombre?: string; // Alias compatible
}

export const CLEANING_LIMITS = {
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 120, // Decisión 2B
  MAX_DESCRIPTION_LENGTH: 1000,
  VALID_PRIORITIES: ['alta', 'media', 'baja'] as const,
} as const;
```

### 3.2 Contratos DTO
- `CreateCleaningItemDto`: `{ titulo?: string; descripcion?: string; prioridad?: CleaningPriority; fechaProgramada?: Date | string | null; nombre?: string }`
- `UpdateCleaningItemDto`: `{ titulo?: string; descripcion?: string; prioridad?: CleaningPriority; completado?: boolean; fechaProgramada?: Date | string | null; nombre?: string }`

### 3.3 Contrato de Persistencia `ICleaningRepository`
```typescript
export interface ICleaningRepository {
  save(item: CleaningItem): Promise<CleaningItem>;
  findAllByUser(userId: string): Promise<CleaningItem[]>;
  findById(userId: string, id: string): Promise<CleaningItem | null>;
  delete(userId: string, id: string): Promise<boolean>;
}
```

---

## 4. Archivos Afectados
- `src/cleaning/entities/cleaning-item.entity.ts`
- `src/cleaning/dto/create-cleaning-item.dto.ts`
- `src/cleaning/dto/update-cleaning-item.dto.ts`
- `src/cleaning/repositories/cleaning.repository.ts`
- `src/cleaning/services/cleaning.service.ts`
- `src/cleaning/services/cleaning.service.test.ts` (9 tests unitarios)
- `src/cleaning/controllers/cleaning.controller.ts`
- `src/cleaning/controllers/cleaning.controller.test.ts` (4 tests unitarios)

---

## 5. Reglas de Validación
1. Título obligatorio de 1 a 120 caracteres tras `.trim()`. Lanza `InvalidCleaningTitleError` (400) si es vacío o supera 120 caracteres.
2. Descripción opcional de 0 a 1000 caracteres. Lanza `InvalidCleaningDescriptionError` (400) si supera 1000 caracteres.
3. Prioridad validada estrictamente (`'alta' | 'media' | 'baja'`), por defecto `'media'`. Lanza `InvalidCleaningPriorityError` (400) si no es válida.
4. Consulta y mutaciones aisladas por `userId`. Lanza `CleaningItemNotFoundError` (404) si el ítem no existe o pertenece a otro usuario.
