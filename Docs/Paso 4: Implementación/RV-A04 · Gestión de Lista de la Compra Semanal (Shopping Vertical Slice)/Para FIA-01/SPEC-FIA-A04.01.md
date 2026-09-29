# SPEC-FIA-A04.01 · MÓDULO BACKEND SHOPPING Y ASIGNACIÓN GRUPAL

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)  
**Hito de Rebanada:** PRIMERA UNIDAD DE RV-A04 (DOMINIO, REPOSITORIO, SERVICIO Y ENDPOINTS CRUD CON ASIGNACIÓN GRUPAL)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A04.01 · Módulo Backend Shopping y Asignación Grupal  
**PVF de Cierre:** Cimiento transaccional de PVF-A04.01 y PVF-A07.05  
**VF:** VF-A04.01 y VF-A07.05  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A03.05.md APROBADO (Commits: `84691de`, `c1b231a`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar la capa de backend y dominio del módulo `shopping` en `src/shopping/*` para Antigravity CLI. Esta unidad inaugura la Rebanada Vertical RV-A04 y abarca:
1. La entidad de dominio `ShoppingItem` con sus invariantes tipográficas (Decisión 2B: nombre 1..120 caracteres), valores de cantidad (> 0), unidad (default `'ud'`), estado `comprado` (default `false`) y bloqueo de fechas pasadas (Decisión 1A).
2. El repositorio en memoria `InMemoryShoppingRepository` con aislamiento estricto multi-tenant por `userId`.
3. El servicio de negocio `ShoppingService` con operaciones CRUD completas, alternancia de estado comprado (`toggleBoughtStatus`) y el método transaccional de asignación grupal **`bulkSchedule`** para programar masivamente todos los productos pendientes de compra en una fecha dada.
4. El controlador REST desacoplado `ShoppingController` exponiendo los endpoints `/shopping` y `POST /shopping/schedule-all`.

## 2. Objetivo
Construir y verificar exhaustivamente con TDD en Vitest:
1. Entidad `ShoppingItem` en `src/shopping/entities/shopping-item.entity.ts` con errores de dominio tipados (`InvalidShoppingItemNameError`, `InvalidShoppingQuantityError`, `InvalidScheduleDateError`, `ShoppingItemNotFoundError`).
2. DTOs en `src/shopping/dto/`: `CreateShoppingItemDto`, `UpdateShoppingItemDto`, `BulkScheduleShoppingDto`.
3. Repositorio `InMemoryShoppingRepository` en `src/shopping/repositories/shopping.repository.ts` implementando `IShoppingRepository`.
4. Servicio `ShoppingService` en `src/shopping/services/shopping.service.ts` con validaciones de frontera, aislamiento de datos por usuario y lógica de asignación en bloque de productos pendientes.
5. Controlador `ShoppingController` en `src/shopping/controllers/shopping.controller.ts` mapeando las operaciones REST con códigos HTTP canónicos (201 Created, 200 OK, 204 No Content, 400 Bad Request, 401 Unauthorized, 404 Not Found).
6. 100% de los tests del proyecto en verde (mínimo 115 tests totales pasando en Vitest).

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A03.05_AS_BUILT.md`, `repo_state.json` y el árbol físico de `Centra-T`)*
- **Archivos Existentes:**
  - Capa de Tareas (RV-A03 100% cerrada y sellada): `src/tasks/*`, `src/hub/*` (49 tests pasando).
  - Capa de Autenticación, Usuarios, Workspace y Shell: `src/authentication/*`, `src/users/*`, `src/workspace/*`, `src/App.*` (54 tests pasando).
- **Estado de Tests Actual:** 103/103 tests pasando en verde a través de 15 archivos de prueba en Vitest.
- **Riesgos Iniciales:** El nuevo módulo `src/shopping/` debe nacer completamente autocontenido según el Documento 05 (Module Map), sin dependencias cruzadas indebidas con `src/tasks/` ni fuga de datos entre tenants.

## 4. Estado Objetivo
El repositorio debe contar con el módulo `src/shopping/` completamente operativo con sus entidades, DTOs, repositorios, servicios, controladores y suites de pruebas en Vitest.
- **Restricciones negativas explícitas:**
  - Prohibido mezclar productos de compra entre distintos usuarios (`userId` estricto en cada consulta).
  - Prohibido admitir nombres de producto en blanco o con más de 120 caracteres (violación de Decisión 2B).
  - Prohibido permitir cantidades menores o iguales a cero.
  - Prohibido programar compras en fechas pasadas anteriores al día actual (violación de Decisión 1A).
  - Prohibido degradar cualquiera de los 103 tests existentes.

## 5. Contratos Afectados
- **5.1 Contrato de Entidad (`ShoppingItem`):**
  ```typescript
  export interface ShoppingItem {
    id: string;
    userId: string;
    modulo: 'shopping';
    nombre: string;
    cantidad: number;
    unidad: string;
    comprado: boolean;
    fechaProgramada: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }
  ```
- **5.2 Contratos DTO:**
  ```typescript
  export interface CreateShoppingItemDto {
    nombre: string;
    cantidad?: number;
    unidad?: string;
    fechaProgramada?: Date | string | null;
  }

  export interface UpdateShoppingItemDto {
    nombre?: string;
    cantidad?: number;
    unidad?: string;
    comprado?: boolean;
    fechaProgramada?: Date | string | null;
  }

  export interface BulkScheduleShoppingDto {
    fechaProgramada: Date | string;
  }
  ```
- **5.3 Contrato Físico / Module Map:** Directorio `src/shopping/*`.

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/shopping/entities/shopping-item.entity.ts`: Modelo de dominio, constantes de límites y excepciones de negocio.
- `src/shopping/dto/create-shopping-item.dto.ts`: DTO de alta de producto.
- `src/shopping/dto/update-shopping-item.dto.ts`: DTO de modificación.
- `src/shopping/dto/bulk-schedule-shopping.dto.ts`: DTO de programación masiva.
- `src/shopping/repositories/shopping.repository.ts`: Interfaz y repositorio en memoria multi-tenant.
- `src/shopping/services/shopping.service.ts`: Lógica de negocio, validaciones y bulk-schedule.
- `src/shopping/controllers/shopping.controller.ts`: Endpoints REST desacoplados.
- `src/shopping/services/shopping.service.test.ts`: Pruebas de servicio e invariantes.
- `src/shopping/controllers/shopping.controller.test.ts`: Pruebas de endpoints REST.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- Ninguno (la capa de frontend para shopping se implementará a partir de `FIA-A04.02`).

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- Todos los archivos de `src/tasks/*`, `src/hub/*`, `src/workspace/*`, `src/authentication/*`, `src/users/*` y `src/App.*` (103 tests intactos).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/cleaning/*` (pertenece a RV-A05).
- Archivos de interfaz de tareas y autenticación.

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_CORE.docx` (Decisión 1A y 2B), `03_CENTRA_T_DOMAIN_MODEL.docx`, `05_CENTRA_T_MODULE_MAP.docx`, `Centra-T Pseudocódigo (unificado).odt` (Proceso 6.2), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A03.05_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** TypeScript 5.x, Vitest 3.x, `crypto.randomUUID()`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A03.05`. Desbloquea `FIA-A04.02`.

## 8. Restricciones
- Aislamiento multi-tenant por `userId` en todas las consultas del repositorio.
- Límite tipográfico: 1..120 caracteres en `nombre`.
- Validación de fecha: jamás programar en fechas anteriores al día actual (`00:00:00.000`).
- La cantidad debe ser > 0 (por defecto 1).
- `modulo` debe ser inmutablemente `'shopping'`.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:** Escribir en `src/shopping/services/shopping.service.test.ts` y `src/shopping/controllers/shopping.controller.test.ts` las pruebas:
  1. Creación de producto con valores por defecto.
  2. Validación de nombre (1..120 chars - Decisión 2B).
  3. Rechazo de cantidades inválidas (<= 0 o NaN).
  4. Rechazo de fechas pasadas (Decisión 1A).
  5. Aislamiento absoluto por `userId` entre tenants.
  6. Alternancia de estado comprado (`toggleBoughtStatus`).
  7. Eliminación y actualización de productos.
  8. Asignación masiva en bloque (`bulkSchedule`) a todos los productos pendientes.
  9. Mapeo y respuestas HTTP del controlador REST.
  Verificar que los tests fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que los fallos corresponden a la ausencia del módulo `src/shopping/`.
- **Paso 3 — Implementar Entidad y DTOs:** Crear `shopping-item.entity.ts` y los DTOs (`create`, `update`, `bulk-schedule`).
- **Paso 4 — Implementar Repositorio:** Crear `shopping.repository.ts` con aislamiento por `userId`.
- **Paso 5 — Implementar Servicio y Controlador:** Crear `shopping.service.ts` y `shopping.controller.ts` (`GREEN`).
- **Paso 6 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 103 tests previos más los 12 nuevos tests de shopping (mínimo 115 tests totales en verde).
- **Paso 7 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 8 — Estado Documental y Detener:** Preparar los deltas de los 3 JSONs de estado, emitir `IMPLEMENTATION_REPORT_FIA-A04.01.md`, `TEST_REPORT_FIA-A04.01.md`, redactar la propuesta formal de `LOCK-FIA-A04.01.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### 10.1 Estructura canónica de `src/shopping/entities/shopping-item.entity.ts`:
```typescript
export interface ShoppingItem {
  id: string;
  userId: string;
  modulo: 'shopping';
  nombre: string;
  cantidad: number;
  unidad: string;
  comprado: boolean;
  fechaProgramada: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const SHOPPING_LIMITS = {
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 120, // Decisión 2B
  MIN_QUANTITY: 0.001,
  DEFAULT_QUANTITY: 1,
  DEFAULT_UNIT: 'ud',
} as const;

export class InvalidShoppingItemNameError extends Error {
  readonly statusCode = 400;
  constructor(message = 'El nombre del producto debe tener entre 1 y 120 caracteres') {
    super(message);
    this.name = 'InvalidShoppingItemNameError';
  }
}

export class InvalidShoppingQuantityError extends Error {
  readonly statusCode = 400;
  constructor(message = 'La cantidad debe ser un número estrictamente mayor que cero') {
    super(message);
    this.name = 'InvalidShoppingQuantityError';
  }
}

export class InvalidScheduleDateError extends Error {
  readonly statusCode = 400;
  constructor(message = 'No se puede programar en una fecha pasada anterior al día actual') {
    super(message);
    this.name = 'InvalidScheduleDateError';
  }
}

export class ShoppingItemNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = 'Producto de compra no encontrado') {
    super(message);
    this.name = 'ShoppingItemNotFoundError';
  }
}
```

### 10.2 DTOs de `src/shopping/dto/`:
`src/shopping/dto/create-shopping-item.dto.ts`:
```typescript
export interface CreateShoppingItemDto {
  nombre: string;
  cantidad?: number;
  unidad?: string;
  fechaProgramada?: Date | string | null;
}
```

`src/shopping/dto/update-shopping-item.dto.ts`:
```typescript
export interface UpdateShoppingItemDto {
  nombre?: string;
  cantidad?: number;
  unidad?: string;
  comprado?: boolean;
  fechaProgramada?: Date | string | null;
}
```

`src/shopping/dto/bulk-schedule-shopping.dto.ts`:
```typescript
export interface BulkScheduleShoppingDto {
  fechaProgramada: Date | string;
}
```

### 10.3 Repositorio en `src/shopping/repositories/shopping.repository.ts`:
```typescript
import { ShoppingItem } from '../entities/shopping-item.entity';

export interface IShoppingRepository {
  save(item: ShoppingItem): Promise<ShoppingItem>;
  findAllByUser(userId: string): Promise<ShoppingItem[]>;
  findById(userId: string, id: string): Promise<ShoppingItem | null>;
  delete(userId: string, id: string): Promise<void>;
  bulkSchedulePending(userId: string, fechaProgramada: Date): Promise<ShoppingItem[]>;
  clear(): void;
}

export class InMemoryShoppingRepository implements IShoppingRepository {
  private static store: Map<string, ShoppingItem> = new Map();

  async save(item: ShoppingItem): Promise<ShoppingItem> {
    InMemoryShoppingRepository.store.set(item.id, { ...item });
    return { ...item };
  }

  async findAllByUser(userId: string): Promise<ShoppingItem[]> {
    const list: ShoppingItem[] = [];
    for (const item of InMemoryShoppingRepository.store.values()) {
      if (item.userId === userId) {
        list.push({ ...item });
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(userId: string, id: string): Promise<ShoppingItem | null> {
    const item = InMemoryShoppingRepository.store.get(id);
    if (!item || item.userId !== userId) {
      return null;
    }
    return { ...item };
  }

  async delete(userId: string, id: string): Promise<void> {
    const item = InMemoryShoppingRepository.store.get(id);
    if (item && item.userId === userId) {
      InMemoryShoppingRepository.store.delete(id);
    }
  }

  async bulkSchedulePending(userId: string, fechaProgramada: Date): Promise<ShoppingItem[]> {
    const updatedItems: ShoppingItem[] = [];
    for (const [id, item] of InMemoryShoppingRepository.store.entries()) {
      if (item.userId === userId && !item.comprado) {
        const updated: ShoppingItem = {
          ...item,
          fechaProgramada: new Date(fechaProgramada),
          updatedAt: new Date(),
        };
        InMemoryShoppingRepository.store.set(id, updated);
        updatedItems.push({ ...updated });
      }
    }
    return updatedItems;
  }

  clear(): void {
    InMemoryShoppingRepository.store.clear();
  }
}
```

### 10.4 Servicio en `src/shopping/services/shopping.service.ts`:
```typescript
import {
  ShoppingItem,
  SHOPPING_LIMITS,
  InvalidShoppingItemNameError,
  InvalidShoppingQuantityError,
  InvalidScheduleDateError,
  ShoppingItemNotFoundError,
} from '../entities/shopping-item.entity';
import { CreateShoppingItemDto } from '../dto/create-shopping-item.dto';
import { UpdateShoppingItemDto } from '../dto/update-shopping-item.dto';
import { BulkScheduleShoppingDto } from '../dto/bulk-schedule-shopping.dto';
import { IShoppingRepository, InMemoryShoppingRepository } from '../repositories/shopping.repository';

export class ShoppingService {
  constructor(private shoppingRepository: IShoppingRepository = new InMemoryShoppingRepository()) {}

  static validateName(nombre: string): string {
    const trimmed = nombre ? nombre.trim() : '';
    if (
      trimmed.length < SHOPPING_LIMITS.MIN_NAME_LENGTH ||
      trimmed.length > SHOPPING_LIMITS.MAX_NAME_LENGTH
    ) {
      throw new InvalidShoppingItemNameError();
    }
    return trimmed;
  }

  static validateQuantity(cantidad?: number): number {
    if (cantidad === undefined || cantidad === null) {
      return SHOPPING_LIMITS.DEFAULT_QUANTITY;
    }
    if (typeof cantidad !== 'number' || isNaN(cantidad) || cantidad <= 0) {
      throw new InvalidShoppingQuantityError();
    }
    return cantidad;
  }

  static validateScheduleDate(dateInput?: Date | string | null): Date | null {
    if (!dateInput) return null;
    const targetDate = new Date(dateInput);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Formato de fecha inválido');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const compareDate = new Date(targetDate);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() < todayStart.getTime()) {
      throw new InvalidScheduleDateError();
    }
    return targetDate;
  }

  async createItem(userId: string, dto: CreateShoppingItemDto): Promise<ShoppingItem> {
    if (!userId || !userId.trim()) {
      throw new Error('El userId es obligatorio para aislar el ítem de compra');
    }

    const validName = ShoppingService.validateName(dto.nombre);
    const validQty = ShoppingService.validateQuantity(dto.cantidad);
    const validDate = ShoppingService.validateScheduleDate(dto.fechaProgramada);

    const now = new Date();
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      userId: userId.trim(),
      modulo: 'shopping',
      nombre: validName,
      cantidad: validQty,
      unidad: (dto.unidad && dto.unidad.trim()) || SHOPPING_LIMITS.DEFAULT_UNIT,
      comprado: false,
      fechaProgramada: validDate,
      createdAt: now,
      updatedAt: now,
    };

    return this.shoppingRepository.save(newItem);
  }

  async findAllByUser(userId: string): Promise<ShoppingItem[]> {
    if (!userId) return [];
    return this.shoppingRepository.findAllByUser(userId.trim());
  }

  async findById(userId: string, id: string): Promise<ShoppingItem> {
    const item = await this.shoppingRepository.findById(userId.trim(), id);
    if (!item) {
      throw new ShoppingItemNotFoundError();
    }
    return item;
  }

  async updateItem(userId: string, id: string, dto: UpdateShoppingItemDto): Promise<ShoppingItem> {
    const existing = await this.findById(userId, id);

    let updatedName = existing.nombre;
    if (dto.nombre !== undefined) {
      updatedName = ShoppingService.validateName(dto.nombre);
    }

    let updatedQty = existing.cantidad;
    if (dto.cantidad !== undefined) {
      updatedQty = ShoppingService.validateQuantity(dto.cantidad);
    }

    let updatedDate = existing.fechaProgramada;
    if (dto.fechaProgramada !== undefined) {
      updatedDate = ShoppingService.validateScheduleDate(dto.fechaProgramada);
    }

    const updatedItem: ShoppingItem = {
      ...existing,
      nombre: updatedName,
      cantidad: updatedQty,
      unidad: dto.unidad !== undefined ? dto.unidad.trim() : existing.unidad,
      comprado: dto.comprado !== undefined ? dto.comprado : existing.comprado,
      fechaProgramada: updatedDate,
      updatedAt: new Date(),
    };

    return this.shoppingRepository.save(updatedItem);
  }

  async toggleBoughtStatus(userId: string, id: string): Promise<ShoppingItem> {
    const existing = await this.findById(userId, id);

    const toggledItem: ShoppingItem = {
      ...existing,
      comprado: !existing.comprado,
      updatedAt: new Date(),
    };

    return this.shoppingRepository.save(toggledItem);
  }

  async deleteItem(userId: string, id: string): Promise<void> {
    const existing = await this.findById(userId, id);
    await this.shoppingRepository.delete(userId.trim(), existing.id);
  }

  async bulkSchedule(
    userId: string,
    dto: BulkScheduleShoppingDto
  ): Promise<{ scheduledCount: number; items: ShoppingItem[] }> {
    if (!userId || !userId.trim()) {
      throw new Error('El userId es obligatorio para la asignación en bloque');
    }

    if (!dto.fechaProgramada) {
      throw new Error('La fechaProgramada es obligatoria para la asignación masiva');
    }

    const validDate = ShoppingService.validateScheduleDate(dto.fechaProgramada);
    if (!validDate) {
      throw new InvalidScheduleDateError();
    }

    const updatedItems = await this.shoppingRepository.bulkSchedulePending(
      userId.trim(),
      validDate
    );

    return {
      scheduledCount: updatedItems.length,
      items: updatedItems,
    };
  }
}
```

### 10.5 Controlador en `src/shopping/controllers/shopping.controller.ts`:
```typescript
import { ShoppingService } from '../services/shopping.service';
import { CreateShoppingItemDto } from '../dto/create-shopping-item.dto';
import { UpdateShoppingItemDto } from '../dto/update-shopping-item.dto';
import { BulkScheduleShoppingDto } from '../dto/bulk-schedule-shopping.dto';

export interface HttpRequest {
  user?: { id: string };
  params?: Record<string, string>;
  body?: any;
}

export interface HttpResponse {
  statusCode: number;
  body: any;
}

export class ShoppingController {
  constructor(private shoppingService: ShoppingService = new ShoppingService()) {}

  async create(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    try {
      const item = await this.shoppingService.createItem(userId, req.body as CreateShoppingItemDto);
      return { statusCode: 201, body: item };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 400,
        body: { message: err.message },
      };
    }
  }

  async findAll(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    const items = await this.shoppingService.findAllByUser(userId);
    return { statusCode: 200, body: items };
  }

  async findOne(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    const id = req.params?.id;
    if (!id) {
      return { statusCode: 400, body: { message: 'ID obligatorio' } };
    }

    try {
      const item = await this.shoppingService.findById(userId, id);
      return { statusCode: 200, body: item };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 404,
        body: { message: err.message },
      };
    }
  }

  async update(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    const id = req.params?.id;
    if (!id) {
      return { statusCode: 400, body: { message: 'ID obligatorio' } };
    }

    try {
      const updated = await this.shoppingService.updateItem(
        userId,
        id,
        req.body as UpdateShoppingItemDto
      );
      return { statusCode: 200, body: updated };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 400,
        body: { message: err.message },
      };
    }
  }

  async toggle(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    const id = req.params?.id;
    if (!id) {
      return { statusCode: 400, body: { message: 'ID obligatorio' } };
    }

    try {
      const toggled = await this.shoppingService.toggleBoughtStatus(userId, id);
      return { statusCode: 200, body: toggled };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 404,
        body: { message: err.message },
      };
    }
  }

  async remove(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    const id = req.params?.id;
    if (!id) {
      return { statusCode: 400, body: { message: 'ID obligatorio' } };
    }

    try {
      await this.shoppingService.deleteItem(userId, id);
      return { statusCode: 204, body: null };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 404,
        body: { message: err.message },
      };
    }
  }

  async bulkSchedule(req: HttpRequest): Promise<HttpResponse> {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, body: { message: 'No autorizado' } };
    }

    try {
      const result = await this.shoppingService.bulkSchedule(
        userId,
        req.body as BulkScheduleShoppingDto
      );
      return { statusCode: 200, body: result };
    } catch (err: any) {
      return {
        statusCode: err.statusCode || 400,
        body: { message: err.message },
      };
    }
  }
}
```

### 10.6 Batería de pruebas en `src/shopping/services/shopping.service.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ShoppingService } from './shopping.service';
import { InMemoryShoppingRepository } from '../repositories/shopping.repository';
import {
  InvalidShoppingItemNameError,
  InvalidShoppingQuantityError,
  InvalidScheduleDateError,
  ShoppingItemNotFoundError,
} from '../entities/shopping-item.entity';

describe('ShoppingService (Dominio Shopping y Bulk Schedule)', () => {
  let repository: InMemoryShoppingRepository;
  let service: ShoppingService;
  const userId = 'usr-demo-elena-001';
  const otherUserId = 'usr-other-002';

  beforeEach(() => {
    repository = new InMemoryShoppingRepository();
    repository.clear();
    service = new ShoppingService(repository);
  });

  it('debe crear un ítem de compra con valores por defecto (cantidad: 1, unidad: ud, comprado: false)', async () => {
    const item = await service.createItem(userId, { nombre: 'Leche entera' });

    expect(item.id).toBeDefined();
    expect(item.userId).toBe(userId);
    expect(item.modulo).toBe('shopping');
    expect(item.nombre).toBe('Leche entera');
    expect(item.cantidad).toBe(1);
    expect(item.unidad).toBe('ud');
    expect(item.comprado).toBe(false);
    expect(item.fechaProgramada).toBeNull();
  });

  it('debe rechazar nombres vacíos o que excedan 120 caracteres (Decisión 2B)', async () => {
    await expect(service.createItem(userId, { nombre: '' })).rejects.toThrow(
      InvalidShoppingItemNameError
    );
    await expect(service.createItem(userId, { nombre: '   ' })).rejects.toThrow(
      InvalidShoppingItemNameError
    );
    await expect(service.createItem(userId, { nombre: 'A'.repeat(121) })).rejects.toThrow(
      InvalidShoppingItemNameError
    );
  });

  it('debe rechazar cantidades menores o iguales a cero', async () => {
    await expect(service.createItem(userId, { nombre: 'Manzanas', cantidad: 0 })).rejects.toThrow(
      InvalidShoppingQuantityError
    );
    await expect(service.createItem(userId, { nombre: 'Manzanas', cantidad: -3 })).rejects.toThrow(
      InvalidShoppingQuantityError
    );
  });

  it('debe rechazar fechas pasadas anteriores al día actual (Decisión 1A)', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);

    await expect(
      service.createItem(userId, { nombre: 'Pan de molde', fechaProgramada: pastDate })
    ).rejects.toThrow(InvalidScheduleDateError);
  });

  it('debe aislar estrictamente los productos por userId', async () => {
    await service.createItem(userId, { nombre: 'Huevos ecológicos' });
    await service.createItem(otherUserId, { nombre: 'Café tostado' });

    const elenaItems = await service.findAllByUser(userId);
    expect(elenaItems).toHaveLength(1);
    expect(elenaItems[0].nombre).toBe('Huevos ecológicos');

    const otherItems = await service.findAllByUser(otherUserId);
    expect(otherItems).toHaveLength(1);
    expect(otherItems[0].nombre).toBe('Café tostado');
  });

  it('debe conmutar el estado comprado mediante toggleBoughtStatus', async () => {
    const item = await service.createItem(userId, { nombre: 'Arroz redondo' });
    expect(item.comprado).toBe(false);

    const toggled = await service.toggleBoughtStatus(userId, item.id);
    expect(toggled.comprado).toBe(true);

    const toggledAgain = await service.toggleBoughtStatus(userId, item.id);
    expect(toggledAgain.comprado).toBe(false);
  });

  it('debe lanzar ShoppingItemNotFoundError al intentar buscar o mutar un ítem inexistente', async () => {
    await expect(service.findById(userId, 'non-existent-id')).rejects.toThrow(
      ShoppingItemNotFoundError
    );
    await expect(service.deleteItem(userId, 'non-existent-id')).rejects.toThrow(
      ShoppingItemNotFoundError
    );
  });

  it('ASIGNACIÓN GRUPAL BULK-SCHEDULE: debe programar en bloque todos los productos pendientes (comprado: false)', async () => {
    // 2 pendientes
    const item1 = await service.createItem(userId, { nombre: 'Detergente ropa' });
    const item2 = await service.createItem(userId, { nombre: 'Suavizante' });
    // 1 ya comprado
    const item3 = await service.createItem(userId, { nombre: 'Esponjas' });
    await service.toggleBoughtStatus(userId, item3.id);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const result = await service.bulkSchedule(userId, { fechaProgramada: futureDate });

    expect(result.scheduledCount).toBe(2);
    expect(result.items).toHaveLength(2);

    const allElenaItems = await service.findAllByUser(userId);
    const updated1 = allElenaItems.find((i) => i.id === item1.id);
    const updated2 = allElenaItems.find((i) => i.id === item2.id);
    const untouched3 = allElenaItems.find((i) => i.id === item3.id);

    expect(updated1?.fechaProgramada).toBeDefined();
    expect(updated2?.fechaProgramada).toBeDefined();
    expect(untouched3?.fechaProgramada).toBeNull(); // No se modifica si ya estaba comprado
  });
});
```

### 10.7 Batería de pruebas en `src/shopping/controllers/shopping.controller.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from '../services/shopping.service';
import { InMemoryShoppingRepository } from '../repositories/shopping.repository';

describe('ShoppingController (Endpoints REST de Shopping)', () => {
  let controller: ShoppingController;
  let service: ShoppingService;
  let repo: InMemoryShoppingRepository;
  const userId = 'usr-demo-elena-001';

  beforeEach(() => {
    repo = new InMemoryShoppingRepository();
    repo.clear();
    service = new ShoppingService(repo);
    controller = new ShoppingController(service);
  });

  it('POST /shopping debe responder 201 Created al crear un ítem válido', async () => {
    const res = await controller.create({
      user: { id: userId },
      body: { nombre: 'Aceite de oliva virgen extra', cantidad: 1, unidad: 'l' },
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.nombre).toBe('Aceite de oliva virgen extra');
    expect(res.body.modulo).toBe('shopping');
  });

  it('GET /shopping debe responder 200 OK con la lista de productos del usuario', async () => {
    await service.createItem(userId, { nombre: 'Plátanos' });
    await service.createItem(userId, { nombre: 'Fresas' });

    const res = await controller.findAll({ user: { id: userId } });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('PATCH /shopping/:id/toggle debe conmutar el estado y responder 200 OK', async () => {
    const item = await service.createItem(userId, { nombre: 'Yogures naturales' });

    const res = await controller.toggle({
      user: { id: userId },
      params: { id: item.id },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.comprado).toBe(true);
  });

  it('POST /shopping/schedule-all debe responder 200 OK con los productos programados masivamente', async () => {
    await service.createItem(userId, { nombre: 'Pimientos verdes' });
    await service.createItem(userId, { nombre: 'Cebollas' });

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const res = await controller.bulkSchedule({
      user: { id: userId },
      body: { fechaProgramada: targetDate },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.scheduledCount).toBe(2);
  });
});
```

## 11. Verificación y Evidencia
- Ejecutar la suite completa con Vitest:
  ```bash
  npm test -- --run
  ```
- **Evidencia requerida:** Mínimo 115 tests pasando al 100% en verde a través de 17 suites de prueba sin regresión en ninguna suite previa de Auth, Tasks o Workspace.

## 12. Matriz de Trazabilidad
| Requerimiento Indexado | Archivo de Especificación | Componente / Código | Test de Verificación |
| :--- | :--- | :--- | :--- |
| **PVF-A04.01 / VF-A04.01** | `SPEC-FIA-A04.01.md` (Sec. 10.1, 10.4) | `ShoppingItem`, `ShoppingService.createItem` | `shopping.service.test.ts` (Tests 1, 2, 5) |
| **Decisión 2B (120 chars)** | `SPEC-FIA-A04.01.md` (Sec. 10.1) | `SHOPPING_LIMITS.MAX_NAME_LENGTH` | `shopping.service.test.ts` (Test 2) |
| **Decisión 1A (Fechas pasadas)** | `SPEC-FIA-A04.01.md` (Sec. 10.4) | `validateScheduleDate` | `shopping.service.test.ts` (Test 4) |
| **PVF-A07.05 (Bulk Schedule)** | `SPEC-FIA-A04.01.md` (Sec. 10.4, 10.5) | `bulkSchedule`, `bulkSchedulePending` | `shopping.service.test.ts` (Test 8), `shopping.controller.test.ts` (Test 4) |

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)",
  "completed_fias": ["FIA-A01.01", "FIA-A01.02", "FIA-A01.03", "FIA-A02.01", "FIA-A02.02", "FIA-A02.03", "FIA-A02.04", "FIA-A02.05", "FIA-A03.01", "FIA-A03.02", "FIA-A03.03", "FIA-A03.04", "FIA-A03.05", "FIA-A04.01"],
  "latest_locked_fia": "FIA-A04.01",
  "architectural_decisions_applied": [
    "Aislamiento absoluto de tenant por userId en todas las consultas y mutaciones de shopping",
    "Decisión 2B innegociable: corte estricto en 120 caracteres de nombre de producto",
    "Decisión 1A: Bloqueo estricto de fechas pasadas en asignaciones temporales de compra",
    "Endpoint transaccional POST /shopping/schedule-all para compra en bloque (base de VV-006)",
    "Rebanada Vertical RV-A03 cerrada con éxito; apertura formal de RV-A04"
  ],
  "unlocked_next": "FIA-A04.02 (Acordeón Compra con Telemetría e Input Rápido en Hub)"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/shopping/entities/shopping-item.entity.ts",
    "src/shopping/dto/create-shopping-item.dto.ts",
    "src/shopping/dto/update-shopping-item.dto.ts",
    "src/shopping/dto/bulk-schedule-shopping.dto.ts",
    "src/shopping/repositories/shopping.repository.ts",
    "src/shopping/services/shopping.service.ts",
    "src/shopping/controllers/shopping.controller.ts",
    "src/shopping/services/shopping.service.test.ts",
    "src/shopping/controllers/shopping.controller.test.ts"
  ],
  "files_modified": [],
  "quality_gates_passed": ["QG-01", "QG-02", "QG-03", "QG-04", "QG-05"]
}
```

## 15. Actualización ui_state_accumulated.json
```json
{
  "mounted_components": [
    "App",
    "WorkspaceLayout",
    "HubContainer",
    "TasksAccordion",
    "TaskCard",
    "TaskActionMenu",
    "TaskCreationWizard",
    "TopNavbar",
    "RegisterTab",
    "LoginPage"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px, logout reactivo)",
    "hub": "HubContainer (w=380px/colapsado) -> aloja TasksAccordion",
    "workbench": "flex 1",
    "auth_surface": "LoginPage (card 440px centrada, tabs conmutables, inputs empáticos)"
  },
  "observable_states": {
    "hub": "reactivo_toggle_con_acordeon_tareas_y_wizard",
    "shopping_backend": "crud_tenant_isolated_decision_1a_2b_bulk_schedule_active",
    "tasks_backend": "crud_tenant_isolated_decision_2b_active",
    "vertical_slice_rv_a03": "completed_100_percent_closed",
    "vertical_slice_rv_a04": "backend_foundation_active"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. Las entidades, DTOs, repositorios, servicio y controlador de `shopping` están implementados cumpliendo las invariantes de negocio (Decisión 1A, Decisión 2B y multi-tenant).
2. El método `bulkSchedule` programa masivamente todos los productos pendientes de compra.
3. El 100% de los tests del proyecto (mínimo 115 tests) pasan en verde con Vitest a través de 17 suites de prueba.
4. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A04.01.md`, `TEST_REPORT_FIA-A04.01.md` y la propuesta formal de `LOCK-FIA-A04.01.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A04.01`. Prohibido implementar componentes de interfaz de Shopping en esta sesión (reservados a `FIA-A04.02` y `FIA-A04.03`).
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir las clases de producción.
- **Validaciones Innegociables:** Asegúrate de verificar las excepciones tipadas para nombres vacíos (2B), cantidades `<= 0` y fechas pasadas (1A).
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A04.01.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
