# SPEC-FIA-A04.03 · MODO COMPRA ACTIVA Y SECCIÓN SECUNDARIA COLAPSABLE 'COMPRADOS'

**Proyecto:** Centra-T  
**Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A04.03 · Modo Compra Activa y Sección Secundaria Colapsable 'Comprados'  
**PVF de Cierre:** PVF-A04.03 · Modo Compra Activa y Separación de Ítems Comprados  
**VF:** VF-A04.03 · Separación Automática de Ítems Comprados  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**Hito de Rebanada:** TERCERA Y ÚLTIMA UNIDAD DE RV-A04 (CIERRE COMPLETO Y SELLADO DEL VERTICAL SLICE DE COMPRA)  
**LOCK Previo Requerido:** LOCK-FIA-A04.02.md APROBADO (Commits: `c0a80bf`, `ec453de`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
El propósito innegociable de esta especificación técnica ejecutable es guiar al Implementador (Antigravity CLI) en la construcción, prueba e integración del componente **`ShoppingItemList`** (`src/shopping/components/ShoppingItemList.tsx`), sus estilos desacoplados (`ShoppingItemList.module.css`), su suite de pruebas unitarias (`ShoppingItemList.test.tsx`) y su conexión con `ShoppingAccordion.tsx`.

Esta unidad materializa el **Modo Compra Activa**:
- Separa visual y estructuralmente los productos de la lista de la compra en dos zonas diferenciadas:
  1. **Lista Principal Activa (Pendientes):** Agrupa los productos aún no comprados (`comprado === false`). Es la vista prioritaria y despejada que el usuario consulta en el supermercado.
  2. **Subsección Secundaria Colapsable al Pie ('Comprados'):** Agrupa los productos ya adquiridos (`comprado === true`) bajo una barra colapsable con indicador dinámico `Comprados (${comprados.length})`, chevron animado y diseño visual atenuado con tachado (`line-through`).
- **Traslado Automático Inmediato:** Al marcar un ítem en pendientes, este se desplaza automáticamente y sin recarga de pantalla (< 16ms) a la subsección inferior de 'Comprados', retirándolo de la vista de pendientes para evitar distracciones en tienda física.
- **Reversibilidad:** Al desmarcar un ítem en 'Comprados', este regresa instantáneamente a la lista de pendientes.
- **Ocultamiento Condicional:** Si ningún ítem está comprado (`comprados.length === 0`), la subsección 'Comprados' permanece oculta para no recargar la interfaz.
- **Cierre de RV-A04:** Es la tercera y última unidad de RV-A04. Su superación sella al 100% la Rebanada Vertical de Compra Semanal.

---

## 2. Objetivo
Materializar en el código de Centra-T la interacción del Modo Compra Activa mediante:
1. `ShoppingItemList.tsx`: Componente modular que recibe la lista de productos y callbacks de mutación, particionando en memoria `pendingItems` y `boughtItems`.
2. `ShoppingItemList.module.css`: Diseño oscuro coherente (`#0B0F17`, bordes `#233144`, texto atenuado `#64748b`, tachado sutil).
3. `ShoppingAccordion.tsx`: Refactorización limpia delegando la lista poblada en `<ShoppingItemList items={items} onToggleItem={handleToggleItem} />`.
4. Suite de pruebas completa: 6 nuevos tests en `ShoppingItemList.test.tsx`, preservación de `ShoppingAccordion.test.tsx` y verificación de mínimo **134 tests globales en verde** a través de 20 suites.

---

## 3. Estado Actual del Repositorio
*(Basado estrictamente en el estado certificado de `LOCK-FIA-A04.02.md` y commits `c0a80bf` y `ec453de`)*
- **Archivos de Shopping Existentes:**
  - `src/shopping/entities/shopping-item.entity.ts`
  - `src/shopping/dto/create-shopping-item.dto.ts`, `update-shopping-item.dto.ts`, `bulk-schedule-shopping.dto.ts`
  - `src/shopping/repositories/shopping.repository.ts`
  - `src/shopping/services/shopping.service.ts` y `.test.ts` (8 tests)
  - `src/shopping/controllers/shopping.controller.ts` y `.test.ts` (4 tests)
  - `src/shopping/components/QuickItemInput.tsx`, `.module.css` y `.test.tsx` (6 tests)
  - `src/hub/components/ShoppingAccordion.tsx`, `.module.css` y `.test.tsx` (7 tests)
- **Estado de la Suite:** 128 tests pasando al 100% en verde en 19 suites (`npm run test`).
- **Riesgos Iniciales:** Al delegar la lista de productos en `ShoppingItemList`, se debe asegurar que `data-testid="shopping-populated-list"` se mantenga presente y que las aserciones de `ShoppingAccordion.test.tsx` se conserven o adapten semánticamente para evitar regresiones.

---

## 4. Estado Objetivo
Tras la ejecución de esta SPEC:
1. El archivo `src/shopping/components/ShoppingItemList.tsx` existirá y exportará `ShoppingItemList` y su interfaz `ShoppingItemListProps`.
2. Si existen productos pendientes y comprados, se observarán dos listas separadas: pendientes arriba y `Comprados (X)` en una subsección colapsable al pie.
3. Si todos los ítems están pendientes, la sección de comprados no se mostrará.
4. Si todos los ítems están comprados, la zona de pendientes mostrará un aviso sobrio de confirmación: `✓ ¡Todos los productos han sido comprados!`.
5. Al hacer clic en el botón de la cabecera de `Comprados (X)`, la lista de comprados se replegará o desplegará conmutando `aria-expanded`.
6. Al conmutar cualquier checkbox, el ítem se transferirá reactivamente entre secciones y la cabecera padre actualizará su telemetría `Compra Semanal (X/Y)`.
7. La suite global de Vitest registrará mínimo **134 tests pasando al 100% en verde** en 20 suites de prueba.
8. La Rebanada Vertical **RV-A04** quedará formalmente sellada y concluida.

---

## 5. Contratos Afectados
### 5.1 Contrato de Entrada / Componente
```typescript
export interface ShoppingItemListProps {
  items: ShoppingItem[];
  onToggleItem: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
  defaultCollapsedBought?: boolean;
}
```

### 5.2 Contrato de Interfaz Visual (HTML/CSS)
- Contenedor raíz: `data-testid="shopping-populated-list"`
- Lista de pendientes: `<ul className={styles.itemList} role="list" aria-label="Productos pendientes">`
- Fila de ítem pendiente: `data-testid="shopping-item-${item.id}"`
- Banner de lista completada: `data-testid="shopping-all-bought-notice"`
- Subsección de comprados: `data-testid="shopping-bought-section"`
- Botón conmutador de comprados: `data-testid="shopping-bought-toggle"` con `role="button"` (o `<button>`) y `aria-expanded`
- Lista de comprados: `<ul className={styles.boughtList} role="list" aria-label="Productos comprados" data-testid="shopping-bought-list">`
- Fila de ítem comprado: `data-testid="shopping-item-${item.id}"` con clase de tachado y tipografía `#64748b`

### 5.3 Contrato de Aislamiento
- `ShoppingItemList` no realiza peticiones HTTP directas ni invoca repositorios; se comunica con el contenedor padre exclusivamente vía callbacks (`onToggleItem`).

### 5.4 Contrato de Dominio
- Respeta la entidad `ShoppingItem` (`src/shopping/entities/shopping-item.entity.ts`).

---

## 6. Archivos Afectados (Clasificación Física Obligatoria)
### 6.1 Crear
- `src/shopping/components/ShoppingItemList.tsx`: Componente de lista con Modo Compra Activa.
- `src/shopping/components/ShoppingItemList.module.css`: Estilos visuales del listado y subsección colapsable.
- `src/shopping/components/ShoppingItemList.test.tsx`: Batería unitaria exhaustiva (6 tests).

### 6.2 Modificar
- `src/hub/components/ShoppingAccordion.tsx`: Integrar `ShoppingItemList` en lugar de la lista directa en línea.
- `src/hub/components/ShoppingAccordion.test.tsx`: Ajustar o enriquecer aserciones para validar la coexistencia armónica de telemetría y subsecciones.

### 6.3 Preservar
- `src/shopping/components/QuickItemInput.tsx` y `.module.css` (intactos).
- `src/shopping/services/shopping.service.ts` y `shopping.controller.ts` (intactos).
- Toda la suite previa de `Tasks`, `Auth`, `Users` y `Workspace` (128 tests).

### 6.4 Prohibido Tocar
- `src/tasks/*`
- `src/authentication/*`
- `src/users/*`
- Lógica de arrastre de calendario (`RV-A07`).
- Módulo de limpieza (`RV-A05`).

---

## 7. Dependencias
- **Documentales:** `CENTRA-T_INDICE_RV_FIA.docx`, `CENTRA-T_INDICE_PVF_VF.docx`, `SUITE_ARQUITECTURA_UI.docx`.
- **Tecnológicas:** React 19, TypeScript 5.7, Vitest 3.2.7, `@testing-library/react`.
- **Secuencial:** Requiere LOCK de `FIA-A04.02`. Al finalizar esta unidad se cierra definitivamente `RV-A04` y se desbloquea `RV-A05`.

---

## 8. Restricciones
- Decisión 2B: Nombre de producto máximo 120 caracteres.
- Transición fluida y sin recargas: cero refrescos de ventana ni saltos bruscos de scroll.
- Accesibilidad WCAG AA: contraste mínimo 4.5:1, soporte de teclado (`Enter`/`Space`) en botón de despliegue, atributos `aria-expanded` y etiquetas `aria-label` descriptivas.
- No instalar dependencias de terceros no autorizadas.

---

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables)

### Paso 1 — Preparar Tests (`RED`)
Crear el archivo `src/shopping/components/ShoppingItemList.test.tsx` con los 6 casos de prueba unitarios especificados en la sección 11. Ejecutar `npm run test` y verificar que falla (`RED`) por ausencia del componente.

### Paso 2 — Validar Estado Actual
Verificar que los fallos corresponden exclusivamente a la falta del módulo `ShoppingItemList` y que los 128 tests restantes del proyecto siguen pasando sin fallos colaterales.

### Paso 3 — Implementar `ShoppingItemList.tsx` y `ShoppingItemList.module.css`
Escribir el componente `ShoppingItemList.tsx` y su hoja de estilos `ShoppingItemList.module.css` satisfaciendo la separación en dos listas, la subsección colapsable con chevron y los checkboxes accesibles.

### Paso 4 — Integrar en `ShoppingAccordion.tsx`
Actualizar `ShoppingAccordion.tsx` para importar y renderizar `<ShoppingItemList items={items} onToggleItem={handleToggleItem} />`.

### Paso 5 — Ejecutar Tests (`GREEN`)
Ejecutar `npm run test`. Validar que los 6 nuevos tests pasan y que los tests existentes de `ShoppingAccordion.test.tsx` continúan pasando en verde (total: 134 tests en verde).

### Paso 6 — Ejecutar Quality Gates
Ejecutar `npm run typecheck` y `npm run lint`. Confirmar 0 errores de tipos y 0 warnings.

### Paso 7 — Actualizar Archivos de Estado
Generar `context_accumulated.json`, `repo_state.json` y `ui_state_accumulated.json` con los deltas de las secciones 13, 14 y 15.

### Paso 8 — Generar Reportes, LOCK y Detener
Emitir `IMPLEMENTATION_REPORT_FIA-A04.03.md`, `TEST_REPORT_FIA-A04.03.md`, redactar la propuesta de `LOCK-FIA-A04.03.md` certificando el cierre de **RV-A04**, y detener la ejecución.

---

## 10. Cambios Requeridos (Código Fuente Exacto)

### 10.1 Componente `src/shopping/components/ShoppingItemList.tsx`
```tsx
import React, { useState } from 'react';
import styles from './ShoppingItemList.module.css';
import { ShoppingItem } from '../entities/shopping-item.entity';

export interface ShoppingItemListProps {
  items: ShoppingItem[];
  onToggleItem: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
  defaultCollapsedBought?: boolean;
}

export const ShoppingItemList: React.FC<ShoppingItemListProps> = ({
  items,
  onToggleItem,
  defaultCollapsedBought = false,
}) => {
  const [isBoughtCollapsed, setIsBoughtCollapsed] = useState(defaultCollapsedBought);

  const pendingItems = items.filter((item) => !item.comprado);
  const boughtItems = items.filter((item) => item.comprado);

  return (
    <div className={styles.container} data-testid="shopping-populated-list">
      {/* 1. Lista de Productos Pendientes (Modo Compra Activa) */}
      {pendingItems.length > 0 ? (
        <ul className={styles.itemList} role="list" aria-label="Productos pendientes">
          {pendingItems.map((item) => (
            <li
              key={item.id}
              className={styles.itemRow}
              data-testid={`shopping-item-${item.id}`}
            >
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => onToggleItem(item.id)}
                  className={styles.checkbox}
                  aria-label={`Comprar producto ${item.nombre}`}
                />
              </label>

              <span className={styles.itemName}>{item.nombre}</span>

              <span className={styles.quantityBadge}>
                {item.cantidad} {item.unidad}
              </span>
            </li>
          ))}
        </ul>
      ) : boughtItems.length > 0 ? (
        <div className={styles.allBoughtNotice} data-testid="shopping-all-bought-notice">
          <span className={styles.allBoughtIcon} aria-hidden="true">✓</span>
          <span className={styles.allBoughtText}>¡Todos los productos han sido comprados!</span>
        </div>
      ) : null}

      {/* 2. Sección Secundaria Colapsable de Comprados */}
      {boughtItems.length > 0 && (
        <div className={styles.boughtSection} data-testid="shopping-bought-section">
          <button
            type="button"
            className={styles.boughtHeader}
            onClick={() => setIsBoughtCollapsed(!isBoughtCollapsed)}
            aria-expanded={!isBoughtCollapsed}
            data-testid="shopping-bought-toggle"
          >
            <div className={styles.boughtHeaderLeft}>
              <span
                className={`${styles.boughtChevron} ${!isBoughtCollapsed ? styles.boughtChevronOpen : ''}`}
                aria-hidden="true"
              >
                ▶
              </span>
              <span className={styles.boughtTitle}>
                Comprados ({boughtItems.length})
              </span>
            </div>
            <span className={styles.boughtBadge}>
              {boughtItems.length} {boughtItems.length === 1 ? 'adquirido' : 'adquiridos'}
            </span>
          </button>

          {!isBoughtCollapsed && (
            <ul
              className={styles.boughtList}
              role="list"
              aria-label="Productos comprados"
              data-testid="shopping-bought-list"
            >
              {boughtItems.map((item) => (
                <li
                  key={item.id}
                  className={`${styles.itemRow} ${styles.boughtRow}`}
                  data-testid={`shopping-item-${item.id}`}
                >
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => onToggleItem(item.id)}
                      className={styles.checkbox}
                      aria-label={`Desmarcar producto ${item.nombre}`}
                    />
                  </label>

                  <span className={`${styles.itemName} ${styles.boughtName}`}>
                    {item.nombre}
                  </span>

                  <span className={`${styles.quantityBadge} ${styles.boughtQuantityBadge}`}>
                    {item.cantidad} {item.unidad}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
```

### 10.2 Estilos `src/shopping/components/ShoppingItemList.module.css`
```css
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.itemList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.itemRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #131b26;
  border: 1px solid #233144;
  border-radius: 8px;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.itemRow:hover {
  background: #182232;
  border-color: #3b82f6;
}

.checkboxLabel {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.itemName {
  flex: 1;
  font-size: 13px;
  color: #e2e8f0;
  font-weight: 500;
  word-break: break-word;
}

.quantityBadge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-radius: 12px;
  white-space: nowrap;
}

/* Estado de lista completada */
.allBoughtNotice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px dashed rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
  font-size: 12px;
  font-weight: 500;
}

.allBoughtIcon {
  font-weight: bold;
}

/* Sección Secundaria de Comprados */
.boughtSection {
  margin-top: 4px;
  border-top: 1px solid #1e293b;
  padding-top: 8px;
}

.boughtHeader {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  padding: 6px 4px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.boughtHeader:hover {
  background: rgba(255, 255, 255, 0.04);
}

.boughtHeaderLeft {
  display: flex;
  align-items: center;
  gap: 8px;
}

.boughtChevron {
  font-size: 10px;
  color: #64748b;
  display: inline-block;
  transition: transform 0.2s ease;
}

.boughtChevronOpen {
  transform: rotate(90deg);
}

.boughtTitle {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.boughtBadge {
  font-size: 11px;
  color: #475569;
}

.boughtList {
  list-style: none;
  margin: 6px 0 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.boughtRow {
  background: rgba(19, 27, 38, 0.5);
  border-color: #1a2432;
  opacity: 0.75;
}

.boughtRow:hover {
  background: #131b26;
  border-color: #233144;
  opacity: 0.95;
}

.boughtName {
  color: #64748b;
  text-decoration: line-through;
}

.boughtQuantityBadge {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
}
```

### 10.3 Integración en `src/hub/components/ShoppingAccordion.tsx`
Sustituir la lista directa por `ShoppingItemList`:
```tsx
// 1. Añadir import
import { ShoppingItemList } from '../../shopping/components/ShoppingItemList';

// 2. En el JSX dentro de {isExpanded && ( ... )}, sustituir el bloque {/* Populated List */} por:
          {/* Populated List delegada en ShoppingItemList (Modo Compra Activa) */}
          {!isLoading && !error && items.length > 0 && (
            <ShoppingItemList
              items={items}
              onToggleItem={handleToggleItem}
            />
          )}
```

### 10.4 Ajuste Semántico en `src/hub/components/ShoppingAccordion.test.tsx`
Para soportar la separación de secciones en `ShoppingAccordion.test.tsx` sin asunciones frágiles de orden de índice de checkboxes:
```tsx
  it('debe renderizar lista de productos con checkboxes, nombres y cantidades', () => {
    render(<ShoppingAccordion items={mockItems} />);

    expect(screen.getByText('Leche desnatada')).toBeInTheDocument();
    expect(screen.getByText('2 l')).toBeInTheDocument();

    expect(screen.getByText('Arroz basmati')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();

    const lecheCheckbox = screen.getByRole('checkbox', { name: /desmarcar producto leche desnatada/i });
    const arrozCheckbox = screen.getByRole('checkbox', { name: /comprar producto arroz basmati/i });

    expect(lecheCheckbox).toBeChecked(); // Leche comprada
    expect(arrozCheckbox).not.toBeChecked(); // Arroz pendiente
  });

  it('debe actualizar la telemetría dinámicamente al alternar un checkbox', async () => {
    const user = userEvent.setup();
    render(<ShoppingAccordion items={mockItems} />);

    const header = screen.getByRole('button', { name: /compra semanal \(1\/3\)/i });
    expect(header).toBeInTheDocument();

    // Marcar arroz como comprado mediante su etiqueta accesible
    const arrozCheckbox = screen.getByRole('checkbox', { name: /comprar producto arroz basmati/i });
    await user.click(arrozCheckbox);

    // Ratio pasa a 2/3 y pendientes pasa a 1
    expect(screen.getByRole('button', { name: /compra semanal \(2\/3\)/i })).toBeInTheDocument();
    expect(screen.getByTestId('shopping-pending-badge')).toHaveTextContent('1 pendientes');
  });
```

---

## 11. Tests Requeridos (`src/shopping/components/ShoppingItemList.test.tsx`)

Crear `src/shopping/components/ShoppingItemList.test.tsx` con exactamente estos 6 tests unitarios:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingItemList } from './ShoppingItemList';
import { ShoppingItem } from '../entities/shopping-item.entity';

describe('ShoppingItemList Component (Modo Compra Activa y Sección Comprados)', () => {
  const mockItems: ShoppingItem[] = [
    {
      id: 'item-1',
      userId: 'usr-1',
      modulo: 'shopping',
      nombre: 'Leche de avena',
      cantidad: 2,
      unidad: 'l',
      comprado: true,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'item-2',
      userId: 'usr-1',
      modulo: 'shopping',
      nombre: 'Arroz integral',
      cantidad: 1,
      unidad: 'kg',
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'item-3',
      userId: 'usr-1',
      modulo: 'shopping',
      nombre: 'Huevos ecológicos',
      cantidad: 12,
      unidad: 'ud',
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('1. debe separar productos pendientes de la sección secundaria Comprados (1)', () => {
    render(<ShoppingItemList items={mockItems} onToggleItem={vi.fn()} />);

    // Pendientes presentes en la lista principal
    expect(screen.getByText('Arroz integral')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();
    expect(screen.getByText('Huevos ecológicos')).toBeInTheDocument();
    expect(screen.getByText('12 ud')).toBeInTheDocument();

    // Comprados presentes bajo la cabecera secundaria
    expect(screen.getByTestId('shopping-bought-section')).toBeInTheDocument();
    expect(screen.getByText(/comprados \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText('Leche de avena')).toBeInTheDocument();
  });

  it('2. debe invocar onToggleItem con el id del producto al marcar un pendiente como comprado', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<ShoppingItemList items={mockItems} onToggleItem={handleToggle} />);

    const arrozCheckbox = screen.getByRole('checkbox', { name: /comprar producto arroz integral/i });
    expect(arrozCheckbox).not.toBeChecked();

    await user.click(arrozCheckbox);
    expect(handleToggle).toHaveBeenCalledWith('item-2');
  });

  it('3. debe invocar onToggleItem al desmarcar un producto en la sección de Comprados', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<ShoppingItemList items={mockItems} onToggleItem={handleToggle} />);

    const lecheCheckbox = screen.getByRole('checkbox', { name: /desmarcar producto leche de avena/i });
    expect(lecheCheckbox).toBeChecked();

    await user.click(lecheCheckbox);
    expect(handleToggle).toHaveBeenCalledWith('item-1');
  });

  it('4. debe colapsar y expandir la lista de Comprados al pulsar su botón de cabecera', async () => {
    const user = userEvent.setup();

    render(<ShoppingItemList items={mockItems} onToggleItem={vi.fn()} />);

    const toggleBtn = screen.getByTestId('shopping-bought-toggle');
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('shopping-bought-list')).toBeInTheDocument();

    // Colapsar
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('shopping-bought-list')).not.toBeInTheDocument();

    // Expandir
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('shopping-bought-list')).toBeInTheDocument();
  });

  it('5. no debe renderizar la sección de Comprados si ningún producto ha sido comprado', () => {
    const pendingOnlyItems = mockItems.filter((i) => !i.comprado);
    render(<ShoppingItemList items={pendingOnlyItems} onToggleItem={vi.fn()} />);

    expect(screen.queryByTestId('shopping-bought-section')).not.toBeInTheDocument();
    expect(screen.getByText('Arroz integral')).toBeInTheDocument();
  });

  it('6. debe mostrar aviso de felicitación cuando todos los productos han sido comprados', () => {
    const allBoughtItems = mockItems.map((i) => ({ ...i, comprado: true }));
    render(<ShoppingItemList items={allBoughtItems} onToggleItem={vi.fn()} />);

    expect(screen.getByTestId('shopping-all-bought-notice')).toBeInTheDocument();
    expect(screen.getByText(/¡todos los productos han sido comprados!/i)).toBeInTheDocument();
    expect(screen.getByText(/comprados \(3\)/i)).toBeInTheDocument();
  });
});
```

---

## 12. Quality Gates
- `QG-01 · Typecheck:` `npm run typecheck` (`tsc --noEmit`) -> 0 errores.
- `QG-02 · Linting:` `npm run lint` -> 0 warnings.
- `QG-03 · Tests Suite:` `npm run test` -> Mínimo **134 tests pasando al 100% en verde** a través de 20 suites.
- `QG-04 · Separación Reactiva y Ergonomía:` Comprobación de que el traslado a 'Comprados' no genera recarga de página.
- `QG-05 · Retrocompatibilidad de Hub:` `ShoppingAccordion.test.tsx` permanece 100% en verde con integración de `ShoppingItemList`.

---

## 13. Actualización `context_accumulated.json`
```json
{
  "active_slice": "RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)",
  "completed_fias": [
    "FIA-A01.01",
    "FIA-A01.02",
    "FIA-A01.03",
    "FIA-A02.01",
    "FIA-A02.02",
    "FIA-A02.03",
    "FIA-A02.04",
    "FIA-A02.05",
    "FIA-A03.01",
    "FIA-A03.02",
    "FIA-A03.03",
    "FIA-A03.04",
    "FIA-A03.05",
    "FIA-A04.01",
    "FIA-A04.02",
    "FIA-A04.03"
  ],
  "latest_locked_fia": "FIA-A04.03",
  "architectural_decisions_applied": [
    "Aislamiento absoluto de tenant por userId en todas las consultas y mutaciones de shopping",
    "Decisión 2B innegociable: corte estricto en 120 caracteres de nombre de producto",
    "Telemetría en tiempo real: formato Compra Semanal (X/Y) y badge dinámico de pendientes",
    "Adición ágil continua: input rápido inline con retención automática de foco tras Enter",
    "Modo Compra Activa: separación de pendientes y subsección colapsable 'Comprados' al pie sin recarga de pantalla",
    "RV-A04 100% COMPLETADA Y CERRADA: Vertical Slice de Compra sellada y lista para arrastre masivo en RV-A07"
  ],
  "unlocked_next": "RV-A05 · Gestión de Limpieza (Cleaning Vertical Slice) -> FIA-A05.01"
}
```

---

## 14. Actualización `repo_state.json`
```json
{
  "files_created": [
    "src/shopping/components/ShoppingItemList.tsx",
    "src/shopping/components/ShoppingItemList.module.css",
    "src/shopping/components/ShoppingItemList.test.tsx"
  ],
  "files_modified": [
    "src/hub/components/ShoppingAccordion.tsx",
    "src/hub/components/ShoppingAccordion.test.tsx"
  ],
  "quality_gates_passed": ["QG-01", "QG-02", "QG-03", "QG-04", "QG-05"]
}
```

---

## 15. Actualización `ui_state_accumulated.json`
```json
{
  "mounted_components": [
    "App",
    "WorkspaceLayout",
    "HubContainer",
    "TasksAccordion",
    "ShoppingAccordion",
    "ShoppingItemList",
    "QuickItemInput",
    "TopNavbar",
    "RegisterTab",
    "LoginPage"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px, logout reactivo)",
    "hub": "HubContainer (w=380px/colapsado) -> aloja TasksAccordion y ShoppingAccordion",
    "shopping_accordion": "ShoppingAccordion con ShoppingItemList (Modo Compra Activa + subsección Comprados) y QuickItemInput inline",
    "workbench": "flex 1",
    "auth_surface": "LoginPage (card 440px centrada, tabs conmutables, inputs empáticos)"
  },
  "observable_states": {
    "hub": "reactivo_dual_acordeon_tasks_y_shopping",
    "shopping_accordion": "modo_compra_activa_con_seccion_colapsable_comprados",
    "shopping_backend": "crud_tenant_isolated_decision_1a_2b_bulk_schedule_active",
    "tasks_backend": "crud_tenant_isolated_decision_2b_active"
  }
}
```

---

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `src/shopping/components/ShoppingItemList.tsx`, `.module.css` y `.test.tsx` están creados y probados.
2. `ShoppingAccordion.tsx` delega limpiamente en `ShoppingItemList`.
3. Los 134 tests (128 previos + 6 nuevos) pasan al 100% en verde en Vitest.
4. Los 5 Quality Gates pasan limpiamente sin advertencias.
5. Se emiten `IMPLEMENTATION_REPORT_FIA-A04.03.md`, `TEST_REPORT_FIA-A04.03.md` y `LOCK-FIA-A04.03.md`.
6. Se certifica el **CIERRE TOTAL Y SELLADO DE LA REBANADA VERTICAL RV-A04**.

---

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A04.03`. Esta es la última FIA de RV-A04; una vez completada y emitido el LOCK, detén la sesión sin avanzar a RV-A05.
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir código de producción. Verifica el estado `RED` y luego implementa hasta alcanzar `GREEN`.
- **Preservación Innegociable:** No rompas ninguna funcionalidad ni test previo de `TasksAccordion`, `QuickItemInput` ni servicios backend.
- **Parada Obligatoria:** Tras superar los 5 Quality Gates y generar los reportes y `LOCK-FIA-A04.03.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE y devuelve el control al usuario.
