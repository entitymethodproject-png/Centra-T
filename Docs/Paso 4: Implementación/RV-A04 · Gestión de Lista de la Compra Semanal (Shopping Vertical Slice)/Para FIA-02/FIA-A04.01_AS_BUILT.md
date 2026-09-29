# CENTRA-T · FIA-A04.01 · MÓDULO BACKEND SHOPPING Y ASIGNACIÓN GRUPAL (AS-BUILT)
**Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)  
**Estado:** AS-BUILT CONSOLIDADO · CERRADO MEDIANTE LOCK · CIMIENTO DE DOMINIO Y ENDPOINTS CERTIFICADO  
**Evidencia de Cierre:** LOCK-FIA-A04.01.md APROBADO (Commit: `104022b`)  

---

### 1. Identificación
- **FIA:** `FIA-A04.01`
- **Rebanada Vertical:** `RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)`
- **Unidad Implementada:** `Módulo Backend Shopping y Asignación Grupal (Bulk Schedule)`
- **Hito de Rebanada:** `Primera Unidad de RV-A04 (Dominio, Repositorio, Servicio y Endpoints CRUD con Asignación Grupal)`
- **PVF Satisfecha:** Cimiento transaccional de `PVF-A04.01 · Acordeón de Compra con Telemetría Comprados / Totales` y `PVF-A07.05 · Asignación Masiva de Lista de Compra al Calendario (VV-006)`
- **VF Asociada:** `VF-A04.01 · Estructura de Acordeón y Telemetría de Compra` y `VF-A07.05 · Asignación Masiva de Compra Semanal al Calendario (VV-006)`
- **Commit de Cierre (Git):** `104022b`
- **Fecha de Cierre:** `2026-09-29`
- **LOCK Oficial:** `LOCK-FIA-A04.01.md Aprobado (115/115 tests en verde a través de 17 suites, 12 tests específicos en shopping.service y shopping.controller)`
- **Estado Documental:** `AS-BUILT oficial consolidado. Actúa como el LOCK formal vinculante para habilitar FIA-A04.02.`

### 2. Origen Documental
Derivada directamente de la `SPEC-FIA-A04.01.md` y `FIA-A04.01.md`, en cumplimiento estricto del `CENTRA-T_INDICE_RV_FIA.docx` y `CENTRA-T_INDICE_PVF_VF.docx`, guiada por la arquitectura de `SUITE_ARQUITECTURA_CORE.docx` (Decisión 1A: Bloqueo de fechas pasadas; Decisión 2B: Límites tipográficos 120 caracteres), `03_CENTRA_T_DOMAIN_MODEL.docx`, `05_CENTRA_T_MODULE_MAP.docx` y `Centra-T Pseudocódigo (unificado).odt` (Proceso 6.2: `Arrastre_Masivo_Compra_Semanal`).

### 3. Estado AS-BUILT Usado
- **Repositorio Base:** Repositorio en `/home/hnoloh/Escritorio/Centra-T` en estado `LOCK-FIA-A03.05` (Commits `84691de`, `c1b231a`), con 103 tests en verde y la Rebanada Vertical RV-A03 100% completada y sellada.
- **Archivos Base:** Módulos `src/tasks/*`, `src/hub/*`, `src/workspace/*`, `src/authentication/*` y `src/users/*`.

### 4. Objetivo Implementado
1. Materialización del modelo de dominio `ShoppingItem` en `src/shopping/entities/shopping-item.entity.ts`:
   - Atributos obligatorios: `id` (UUID), `userId` (inmutable, multi-tenant), `modulo: 'shopping'` (inmutable), `nombre` (string 1..120 chars - Decisión 2B), `cantidad` (número positivo > 0, default 1), `unidad` (string, default `'ud'`), `comprado` (booleano, default false), `fechaProgramada` (Date o null, default null), `createdAt` y `updatedAt`.
   - Excepciones tipadas de dominio: `InvalidShoppingItemNameError`, `InvalidShoppingQuantityError`, `InvalidScheduleDateError`, `ShoppingItemNotFoundError`.
2. Definición de contratos DTO en `src/shopping/dto/`:
   - `CreateShoppingItemDto`: Contrato de alta con validación de nombre, cantidad y unidad.
   - `UpdateShoppingItemDto`: Contrato de actualización parcial.
   - `BulkScheduleShoppingDto`: Contrato para la asignación masiva de fecha.
3. Capa de persistencia en `src/shopping/repositories/shopping.repository.ts`:
   - Interfaz `IShoppingRepository` e implementación `InMemoryShoppingRepository` con aislamiento estricto por `userId`.
4. Capa de lógica de negocio en `src/shopping/services/shopping.service.ts`:
   - Validaciones estáticas de frontera: `validateName` (1..120 chars), `validateQuantity` (> 0), `validateScheduleDate` (bloqueo de fechas pasadas anteriores al día actual a medianoche - Decisión 1A).
   - Métodos CRUD completos: `createItem`, `findAllByUser`, `findById`, `updateItem`, `toggleBoughtStatus`, `deleteItem`.
   - **Método transaccional `bulkSchedule(userId, dto)`:** Asigna atómicamente la fecha programada a todos los productos pendientes de compra (`comprado === false`), preservando los productos ya comprados y devolviendo el resumen de programados.
5. Controlador HTTP desacoplado en `src/shopping/controllers/shopping.controller.ts`:
   - Mapeo REST de operaciones: `POST /shopping` (201), `GET /shopping` (200), `GET /shopping/:id` (200), `PUT /shopping/:id` (200), `PATCH /shopping/:id/toggle` (200), `DELETE /shopping/:id` (204), `POST /shopping/schedule-all` (200).

### 5. Alcance Final
- Creación de `src/shopping/entities/shopping-item.entity.ts`.
- Creación de `src/shopping/dto/create-shopping-item.dto.ts`.
- Creación de `src/shopping/dto/update-shopping-item.dto.ts`.
- Creación de `src/shopping/dto/bulk-schedule-shopping.dto.ts`.
- Creación de `src/shopping/repositories/shopping.repository.ts`.
- Creación de `src/shopping/services/shopping.service.ts`.
- Creación de `src/shopping/controllers/shopping.controller.ts`.
- Creación de `src/shopping/services/shopping.service.test.ts` (8 tests).
- Creación de `src/shopping/controllers/shopping.controller.test.ts` (4 tests).
- Suite global completa: 115/115 tests pasando al 100% en verde con Vitest a través de 17 suites.
- Actualización de los 3 archivos JSON de gobernanza en `Para FIA-02/De FIA-01/`.

### 6. Dependencias Reales
- **Dependencias de Producción:** `react` (^19.0.0), `react-dom` (^19.0.0), `bcryptjs` (^3.0.3).
- **Dependencias de Desarrollo:** `@types/react` (^19.0.0), `@types/react-dom` (^19.0.0), `typescript` (~5.7.0), `vite` (^6.0.0), `vitest` (^3.2.7), `@testing-library/react` (^16.3.2), `@testing-library/user-event` (^14.6.1), `@testing-library/jest-dom` (^6.0.0), `jsdom`.

### 7. Contratos Finales Afectados
- **Contrato de Entidad `ShoppingItem`:**
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
- **Contratos DTO y Repositorio:** `CreateShoppingItemDto`, `UpdateShoppingItemDto`, `BulkScheduleShoppingDto`, `IShoppingRepository`.

### 8. Restricciones Finales
- Aislamiento multi-tenant incondicional: consultas filtradas por `userId`.
- Decisión 2B: Nombre de producto restringido estrictamente entre 1 y 120 caracteres tras `.trim()`.
- Decisión 1A: Bloqueo tajante de fechas pasadas en la asignación temporal.
- Cantidad positiva (`cantidad > 0`).

### 9. Diseño Técnico Final
- Módulo hexagonal puro en `src/shopping/*` desacoplado de la interfaz de usuario.
- Persistencia reactiva en memoria con reseteo hermético entre tests.
- Transaccionalidad atómica en la asignación grupal de compras.

### 10. Flujo Operativo Final
1. Cliente invoca `createItem` -> valida nombre (1..120 chars) y cantidad (> 0) -> almacena con `comprado = false`.
2. Cliente consulta `findAllByUser` -> devuelve productos aislados del tenant en orden cronológico.
3. Cliente invoca `toggleBoughtStatus` -> conmuta el booleano `comprado`.
4. Cliente invoca `bulkSchedule` con fecha futura -> programa todos los productos no comprados sin tocar los comprados.

### 11. Casos Válidos Finales
- **Validado 1:** Creación exitosa de producto con valores por defecto (`cantidad: 1`, `unidad: 'ud'`, `comprado: false`).
- **Validado 2:** Aislamiento multi-tenant por `userId` comprobado entre diferentes usuarios.
- **Validado 3:** Conmutación de estado comprado con `toggleBoughtStatus`.
- **Validado 4:** Asignación masiva en bloque (`bulkSchedule`) a todos los productos pendientes.
- **Validado 5:** Mapeo de respuestas 201, 200 y 204 en el controlador REST.

### 12. Casos Inválidos Finales
- **Validado 1:** Rechazo de nombres vacíos o > 120 caracteres con `InvalidShoppingItemNameError`.
- **Validado 2:** Rechazo de cantidades `<= 0` o NaN con `InvalidShoppingQuantityError`.
- **Validado 3:** Rechazo de fechas pasadas anteriores al día actual con `InvalidScheduleDateError`.
- **Validado 4:** Rechazo ante ítems inexistentes o de otro tenant con `ShoppingItemNotFoundError` (404).

### 13. Tests Requeridos Finales
Suite global de 115 tests validada al 100% en verde:
- `shopping.service.test.ts` (8 tests de dominio, validaciones y bulk-schedule)
- `shopping.controller.test.ts` (4 tests de endpoints REST)
- 103 tests previos preservados sin regresiones.

### 14. Quality Gates Finales
- `QG-01 · Typecheck:` Superado (0 errores TypeScript con `tsc --noEmit`).
- `QG-02 · Linting:` Superado (0 warnings).
- `QG-03 · Tests Suite:` Superado (115/115 tests pasando al 100% en verde en Vitest).
- `QG-04 · Validación Decisión 1A y 2B:` Superado y certificado por tests automatizados.
- `QG-05 · Aislamiento Multi-Tenant:` Superado y certificado.

### 15. Archivos Reales Afectados
```
Creados:
- src/shopping/entities/shopping-item.entity.ts
- src/shopping/dto/create-shopping-item.dto.ts
- src/shopping/dto/update-shopping-item.dto.ts
- src/shopping/dto/bulk-schedule-shopping.dto.ts
- src/shopping/repositories/shopping.repository.ts
- src/shopping/services/shopping.service.ts
- src/shopping/controllers/shopping.controller.ts
- src/shopping/services/shopping.service.test.ts
- src/shopping/controllers/shopping.controller.test.ts
```

### 16. Diferencias Respecto a la FIA Original
Ninguna desviación. Implementación exacta conforme a especificación.

### 17. Drift Integrado
Cero drift arquitectónico.

### 18. Decisiones de Cambio (CHG) Integradas
Ninguna alteración respecto a la especificación técnica.

### 19. Definition of Done AS-BUILT
Se certifica que la unidad `FIA-A04.01` ha completado satisfactoriamente su ciclo operativo bajo el Método zug, superando todos los Quality Gates con 115/115 tests en verde y estableciendo la base de dominio y endpoints de la compra semanal. Queda formalmente sellada con **LOCK APROBADO**, autorizando el desbloqueo y redacción de la siguiente unidad táctica: **`FIA-A04.02 · Acordeón de Lista de la Compra en Hub con Telemetría e Input Rápido`**.
