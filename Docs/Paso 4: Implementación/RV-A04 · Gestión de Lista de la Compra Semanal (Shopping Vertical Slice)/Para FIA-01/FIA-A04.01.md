# CENTRA-T · FIA-A04.01 · MÓDULO BACKEND SHOPPING Y ASIGNACIÓN GRUPAL
**Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)  
**Estado:** DERIVADA · PENDIENTE DE SPEC, IMPLEMENTACIÓN Y LOCK  
**Hito de Rebanada:** PRIMERA UNIDAD DE RV-A04 (DOMINIO, REPOSITORIO, SERVICIO Y ENDPOINTS CRUD CON BULK SCHEDULE)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

### 1. Identificación
- **FIA:** `FIA-A04.01`
- **Rebanada Vertical:** `RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)`
- **Unidad Prevista:** `Módulo Backend Shopping y Asignación Grupal (Bulk Schedule)`
- **PVF de Cierre Cubierta:** Cimiento transaccional de `PVF-A04.01 · Acordeón de Compra con Telemetría Comprados / Totales` y `PVF-A07.05 · Asignación Masiva de Lista de Compra al Calendario (VV-006)`
- **VF Interna de Derivación:** Cimiento de `VF-A04.01 · Estructura de Acordeón y Telemetría de Compra` y `VF-A07.05 · Asignación Masiva de Compra Semanal al Calendario (VV-006)`
- **Objetivo Indexado:** `Implementar modelo ShoppingItem (cantidad, unidad, comprado), endpoints CRUD y endpoint transaccional POST /shopping/schedule-all para compra en bloque.`
- **Validación Indexada:** `src/shopping/services/shopping.service.ts` y `src/shopping/controllers/shopping.controller.ts`
- **Evidencia de Cierre Indexada:** `Tests unitarios de servicio validando persistencia, alternancia de estado comprado y actualización atómica en bloque.`
- **LOCK Previo Requerido:** `LOCK-FIA-A03.05.md APROBADO (Commits: 84691de, c1b231a)`
- **Estado Documental:** `FIA inicial derivada. No es SPEC, implementación, reporte ni LOCK.`

### 2. Objetivo
Construir y verificar exhaustivamente con TDD en Vitest el motor de dominio y la API backend del módulo `shopping` (`src/shopping/*`), estableciendo las estructuras de datos, repositorios, reglas de negocio y controladores REST necesarios para soportar la lista de la compra semanal y la programación transaccional en bloque:
1. **Entidad de Dominio `ShoppingItem`:**
   - Atributos requeridos: `id` (UUID), `userId` (inmutable, aislamiento multitenant), `modulo: 'shopping'` (inmutable), `nombre` (string 1..120 chars - Decisión 2B), `cantidad` (número positivo > 0, default 1), `unidad` (string opcional/abierto, ej. `'ud'`, `'kg'`, `'l'`, default `'ud'`), `comprado` (booleano, default false), `fechaProgramada` (Date o null, default null), `createdAt` y `updatedAt`.
   - Reglas de frontera y validaciones:
     - `nombre`: Recorte con `.trim()`, longitud obligatoria entre 1 y 120 caracteres (Decisión 2B).
     - `cantidad`: Debe ser un número estrictamente mayor que cero.
     - `fechaProgramada`: Si se especifica, no puede ser una fecha pasada anterior al día actual (Decisión 1A).
2. **Capa de Persistencia (`ShoppingRepository`):**
   - Interfaz `IShoppingRepository` e implementación `InMemoryShoppingRepository`.
   - Aislamiento estricto por `userId` en todas las consultas: `save`, `findAllByUser`, `findById`, `delete` y `bulkSchedulePending`.
3. **Capa de Servicio de Negocio (`ShoppingService`):**
   - `createItem(userId, dto)`: Valida e inserta un nuevo ítem de compra.
   - `findAllByUser(userId)`: Recupera los ítems del usuario autenticado.
   - `findById(userId, id)`: Recupera un ítem garantizando la pertenencia al `userId` (lanza 404 si no existe o pertenece a otro usuario).
   - `updateItem(userId, id, dto)`: Actualización parcial validando invariantes.
   - `toggleBoughtStatus(userId, id)`: Alterna el estado `comprado` (`true` <-> `false`).
   - `deleteItem(userId, id)`: Eliminación de ítem.
   - **`bulkSchedule(userId, dto)`:** Asigna de forma atómica y transaccional una `fechaProgramada` (validada no en el pasado) a **todos los productos de compra pendientes (`comprado === false`)** del usuario, retornando el número de productos afectados y la lista actualizada.
4. **Capa de Controlador HTTP (`ShoppingController`):**
   - Endpoints REST desacoplados para `/shopping` (CRUD) y `POST /shopping/schedule-all` (o `/bulk-schedule`).
5. 100% de los tests del proyecto en verde (mínimo 115 tests globales pasando en Vitest).

### 3. Alcance
- **IN-SCOPE (Obligatorio en esta FIA):**
  - Creación de `src/shopping/entities/shopping-item.entity.ts`.
  - Creación de `src/shopping/dto/create-shopping-item.dto.ts`, `update-shopping-item.dto.ts` y `bulk-schedule-shopping.dto.ts`.
  - Creación de `src/shopping/repositories/shopping.repository.ts`.
  - Creación de `src/shopping/services/shopping.service.ts`.
  - Creación de `src/shopping/controllers/shopping.controller.ts`.
  - Creación de `src/shopping/services/shopping.service.test.ts` y `src/shopping/controllers/shopping.controller.test.ts`.
  - Verificación del 100% de la suite global en verde en Vitest (mínimo 115 tests pasando).
- **OUT-OF-SCOPE (Prohibición explícita):**
  - Componente de interfaz `ShoppingAccordion.tsx` (pertenece a `FIA-A04.02`).
  - Modo compra activa y sección 'Comprados' en UI (`ShoppingItemList.tsx` pertenece a `FIA-A04.03`).
  - Lógica de arrastre Drag & Drop entre Hub y casillas del calendario (`RV-A07`).
  - Módulo de limpieza (`RV-A05`).

### 4. Dependencias
- **Documentales:**
  - `SUITE_ARQUITECTURA_CORE.docx` (Decisión 1A: Bloqueo de fechas pasadas; Decisión 2B: Límites tipográficos 120 caracteres; Invariantes del Agregado DomesticItem).
  - `03_CENTRA_T_DOMAIN_MODEL.docx` (Definición de ShoppingItem, bulk-schedule y eventos).
  - `05_CENTRA_T_MODULE_MAP.docx` (Módulo `src/shopping/*`, arquitectura hexagonal y aislamiento de dependencias).
  - `Centra-T Pseudocódigo (unificado).odt` (Proceso 6.2: `Arrastre_Masivo_Compra_Semanal`).
  - `CENTRA-T_INDICE_PVF_VF.docx` (Filas PVF-A04.01 y PVF-A07.05).
  - `CENTRA-T_INDICE_RV_FIA.docx` (Fila FIA-A04.01).
  - `FIA-A03.05_AS_BUILT.md` (Cierre total de RV-A03 consolidado).
  - `ZUG_KNOWLEDGE_BASE.md`.
- **Tecnológicas Autorizadas:** TypeScript 5.x, Vitest 3.x, `crypto.randomUUID()`.
- **Dependencia Secuencial (NO LOCK → NO NEXT):**
  - *Previa:* Requiere LOCK formal de `FIA-A03.05` (Aprobado en commits `84691de`, `c1b231a`).
  - *Posterior:* Desbloquea `FIA-A04.02 · Acordeón Compra con Telemetría e Input Rápido`.

### 5. Contratos Afectados
- **Entidad `ShoppingItem`:**
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
- **DTOs:**
  ```typescript
  export interface CreateShoppingItemDto {
    nombre: string;
    cantidad?: number;
    unidad?: string;
    fechaProgramada?: Date | null;
  }

  export interface UpdateShoppingItemDto {
    nombre?: string;
    cantidad?: number;
    unidad?: string;
    comprado?: boolean;
    fechaProgramada?: Date | null;
  }

  export interface BulkScheduleShoppingDto {
    fechaProgramada: Date | string;
  }
  ```
- **Contrato Físico / Module Map:** Directorio `src/shopping/*`.

### 6. Restricciones
- **Aislamiento Multi-Tenant:** Toda consulta y mutación debe filtrar estrictamente por `userId`.
- **Decisión 2B:** El `nombre` del producto admite entre 1 y 120 caracteres tras aplicar `.trim()`.
- **Decisión 1A:** `fechaProgramada` jamás puede situarse en una fecha pasada anterior al inicio del día actual (`00:00:00.000`).
- **Invariante de Módulo:** El atributo `modulo` es inmutable y siempre vale `'shopping'`.

### 7. Diseño Técnico
- **Entrada / Punto de Acceso:** `src/shopping/controllers/shopping.controller.ts` y `src/shopping/services/shopping.service.ts`.
- **Estructura Interna:** Capa de dominio pura sin acoplamiento a React ni a frameworks de UI.
- **Asignación en Bloque (`bulkSchedule`):** Identifica todos los ítems de compra del usuario con `comprado === false`, actualiza su `fechaProgramada` en memoria y persiste los cambios de forma coherente.
- **Fronteras Físicas Autorizadas:** Directorio `src/shopping/*`.

### 8. Flujo Operativo
1. Un cliente envía `POST /shopping` con `{ nombre: 'Leche entera', cantidad: 2, unidad: 'l' }`.
2. `ShoppingService` valida los límites y guarda el ítem con `comprado = false` y `fechaProgramada = null`.
3. Un cliente envía `PATCH /shopping/:id/toggle` para alternar su estado comprado.
4. Un cliente envía `POST /shopping/schedule-all` con `{ fechaProgramada: '2026-10-05' }`.
5. El servicio valida que la fecha no sea pasada, filtra los productos pendientes del usuario, asigna la fecha a todos ellos y devuelve el resumen.

### 9. Casos Válidos (Happy Path & Escenarios Permitidos)
- **Caso 1 (Creación exitosa):** Producto con nombre de 1 a 120 caracteres, cantidad positiva y unidad válida.
- **Caso 2 (Consulta multi-tenant):** `findAllByUser` retorna únicamente los productos del `userId` solicitado.
- **Caso 3 (Alternancia de comprado):** `toggleBoughtStatus` conmuta `comprado` de `false` a `true` y viceversa.
- **Caso 4 (Bulk Schedule masivo):** `bulkSchedule` asigna la fecha a todos los productos pendientes (`comprado: false`) sin alterar los productos ya comprados.

### 10. Casos Inválidos (Manejo de Excepciones y Rechazos)
- **Caso Inválido 1 (Nombre vacío o > 120 caracteres):** Lanza `InvalidShoppingItemNameError` (HTTP 400).
- **Caso Inválido 2 (Cantidad menor o igual a cero):** Lanza `InvalidShoppingQuantityError` (HTTP 400).
- **Caso Inválido 3 (Fecha programada en el pasado - Decisión 1A):** Lanza `InvalidScheduleDateError` (HTTP 400).
- **Caso Inválido 4 (Ítem no encontrado o de otro tenant):** Lanza `ShoppingItemNotFoundError` (HTTP 404).

### 11. Tests Requeridos
- **Tests Unitarios de Servicio (`shopping.service.test.ts`):**
  1. Creación exitosa de producto con valores por defecto (`cantidad: 1`, `unidad: 'ud'`, `comprado: false`).
  2. Validación estricta de nombre (1..120 chars - Decisión 2B).
  3. Rechazo de cantidades inválidas (<= 0 o NaN).
  4. Rechazo de fechas pasadas (Decisión 1A).
  5. Aislamiento absoluto por `userId` entre diferentes usuarios.
  6. Alternancia de estado comprado (`toggleBoughtStatus`).
  7. Eliminación y actualización de productos.
  8. **Bulk Schedule Transaccional:** Asignación masiva a todos los productos pendientes de compra.
- **Tests de Controlador (`shopping.controller.test.ts`):**
  1. Mapeo de rutas REST (`POST`, `GET`, `PUT`, `PATCH /toggle`, `DELETE`).
  2. Endpoint `POST /shopping/schedule-all` y propagación de errores HTTP.
- **Evidencia Exigida:** Suite completa en verde con Vitest (mínimo 115 tests globales pasando).

### 12. Quality Gates (QG-FIA-A04.01)
- `QG-FIA-A04.01-01 · Compilación y Tipado:` Typecheck estricto sin errores TypeScript (`tsc --noEmit`).
- `QG-FIA-A04.01-02 · Tests Suite:` 100% de tests en verde en todo el proyecto (mínimo 115 tests pasando).
- `QG-FIA-A04.01-03 · Validación Invariantes:` Pruebas unitarias de límites tipográficos 2B, cantidades y fechas pasadas 1A en verde.
- `QG-FIA-A04.01-04 · Asignación Grupal Operativa:` Test de `bulkSchedule` validado al 100%.
- `QG-FIA-A04.01-05 · Cero Regresiones:` Los 103 tests previos continúan en verde sin alteraciones.

### 13. Definition of Done (DoD)
Una FIA se considera completada y lista para LOCK si y solo si:
1. Las entidades, DTOs, repositorios, servicio y controlador de `shopping` están implementados en `src/shopping/*`.
2. Las pruebas unitarias de servicio y controlador pasan al 100% en verde con Vitest.
3. El 100% de los tests del proyecto (mínimo 115 tests) pasan en verde.
4. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A04.01.md`, `TEST_REPORT_FIA-A04.01.md` y la propuesta formal de `LOCK-FIA-A04.01.md`.
