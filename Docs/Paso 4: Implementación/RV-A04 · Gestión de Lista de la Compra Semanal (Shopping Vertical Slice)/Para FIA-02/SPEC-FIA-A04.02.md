# SPEC-FIA-A04.02 · ACORDEÓN DE COMPRA CON TELEMETRÍA E INPUT RÁPIDO

**Proyecto:** Centra-T (Gestor Doméstico Integral y Planificador Temporal)  
**Rebanada Vertical:** RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)  
**Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A04 (SUPERFICIE DE COMPRA EN HUB CON TELEMETRÍA E INPUT RÁPIDO)  
**Modo:** SPEC EJECUTABLE  
**FIA Fuente:** FIA-A04.02 · Acordeón de Lista de la Compra en Hub con Telemetría e Input Rápido  
**PVF de Cierre:**  
- PVF-A04.01 · Acordeón de Compra con Telemetría Comprados / Totales  
- PVF-A04.02 · Adición Rápida Inline de Ítem de Compra  
**VF:**  
- VF-A04.01 · Estructura de Acordeón y Telemetría de Compra  
- VF-A04.02 · Adición Rápida Inline de Ítems de Compra  
**Estado de Entrada:** FIA aprobada · Pendiente de implementación y LOCK  
**LOCK Previo Requerido:** LOCK-FIA-A04.01.md APROBADO (Commit: `104022b`)  
**Regla de Continuidad:** NO LOCK → NO NEXT  

---

## 1. Identificación
Compilar la especificación técnica ejecutable para materializar el componente `ShoppingAccordion` en `src/hub/components/ShoppingAccordion.tsx` (con sus estilos encapsulados en `ShoppingAccordion.module.css` y tests en `ShoppingAccordion.test.tsx`) y el componente atómico `QuickItemInput` en `src/shopping/components/QuickItemInput.tsx` (con sus estilos y tests respectivos), e integrarlos en el espacio de trabajo de `src/App.tsx` para Antigravity CLI. Esta unidad abarca:
1. La cabecera reactiva con ratio de telemetría en tiempo real `Compra Semanal (${comprados}/${total})` y badge destacado con el conteo de ítems pendientes.
2. La matriz de estados visuales del acordeón (Loading con Skeleton Screen de 3 líneas, Empty State sobrio con borde discontinuo y Populated List con checkboxes, nombres y cantidades).
3. El control de **adición rápida inline (`QuickItemInput`)** en el pie del acordeón, que permite capturar ítems secuencialmente mediante la tecla `Enter`, incorporándolos en < 100ms y **conservando ininterrumpidamente el foco del teclado** para entrada en ráfaga sin fricción.

## 2. Objetivo
Construir y certificar exhaustivamente mediante TDD con `@testing-library/react` y Vitest:
1. Componente `QuickItemInput` en `src/shopping/components/QuickItemInput.tsx` con input de nombre (máx 120 caracteres - Decisión 2B), selector de cantidad (> 0) y unidad (`'ud'`, `'kg'`, `'g'`, `'l'`, `'pack'`).
2. Adición continua sin fricción: presionar la tecla `Enter` valida el texto, invoca `onAddItem`, limpia el campo de nombre y retiene automáticamente el foco en el input (`inputRef.current?.focus()`).
3. Componente `ShoppingAccordion` en `src/hub/components/ShoppingAccordion.tsx` con soporte para expansión y colapso accesible (`aria-expanded`).
4. Telemetría reactiva en cabecera:
   - Contador de progreso: `Compra Semanal (${comprados}/${total})`.
   - Badge numérico destacado de pendientes: `${pendientes} pendientes` cuando `pendientes > 0`.
   - Indicador de agarrador (drag handle preparatorio para RV-A07).
5. Conmutación reactiva de estado comprado con actualización inmediata de contadores.
6. Montaje conjunto de `TasksAccordion` y `ShoppingAccordion` en el `HubContainer` de `src/App.tsx`.
7. 100% de los tests del proyecto en verde (mínimo 126-128 tests totales pasando en Vitest).

## 3. Estado Actual del Repositorio
*(Basado estrictamente en `FIA-A04.01_AS_BUILT.md`, `repo_state.json` y el árbol físico de `Centra-T`)*
- **Archivos Existentes:**
  - Capa Backend Shopping: `src/shopping/entities/*`, `src/shopping/dto/*`, `src/shopping/repositories/*`, `src/shopping/services/*`, `src/shopping/controllers/*` (12 tests pasando al 100%).
  - Capa de Tareas (RV-A03 cerrada): `src/tasks/*`, `src/hub/components/TasksAccordion.*` (49 tests pasando).
  - Capa de Autenticación, Usuarios, Workspace y Shell: `src/authentication/*`, `src/users/*`, `src/workspace/*`, `src/App.*` (54 tests pasando).
- **Estado de Tests Actual:** 115/115 tests pasando en verde a través de 17 archivos de prueba en Vitest.
- **Riesgos Iniciales:** El nuevo acordeón de compras no debe desbordar horizontalmente el ancho de `HubContainer` (w=380px) ni generar interferencias de scroll con el acordeón de tareas.

## 4. Estado Objetivo
El repositorio debe contar con `QuickItemInput.*` en `src/shopping/components/` y `ShoppingAccordion.*` en `src/hub/components/`, montado en `src/App.tsx`.
- **Restricciones negativas explícitas:**
  - Prohibido el uso de spinners globales de bloqueo (violación de la regla de Skeleton Screens).
  - Prohibido perder el foco del teclado al presionar Enter en el input rápido.
  - Prohibido admitir nombres de producto vacíos o con más de 120 caracteres.
  - Prohibido degradar cualquiera de los 115 tests existentes.

## 5. Contratos Afectados
- **5.1 Contrato de Componente (`ShoppingAccordionProps`):**
  ```typescript
  export interface ShoppingAccordionProps {
    items?: ShoppingItem[];
    shoppingService?: ShoppingService;
    userId?: string;
    initialExpanded?: boolean;
    isLoading?: boolean;
    error?: string | null;
    onToggleExpand?: (expanded: boolean) => void;
    onItemCreated?: (item: ShoppingItem) => void;
    onItemToggle?: (itemId: string) => void;
    onRetry?: () => void;
  }
  ```
- **5.2 Contrato de Entrada Rápida (`QuickItemInputProps`):**
  ```typescript
  export interface QuickItemInputProps {
    onAddItem: (dto: { nombre: string; cantidad: number; unidad: string }) => Promise<void> | void;
    disabled?: boolean;
    autoFocus?: boolean;
  }
  ```
- **5.3 Contrato Físico / Module Map:** Directorio `src/hub/components/*` y `src/shopping/components/*`.
- **5.4 Contrato de Accesibilidad:** `role="button"`, `aria-expanded`, `<ul role="list">`, etiquetas `aria-label` en inputs y checkboxes.

## 6. Archivos Afectados (Clasificación Física Obligatoria)

### 6.1 Crear (Archivos nuevos a materializar)
- `src/shopping/components/QuickItemInput.tsx`: Componente de formulario inline para adición continua.
- `src/shopping/components/QuickItemInput.module.css`: Estilos compactos para inputs en línea.
- `src/shopping/components/QuickItemInput.test.tsx`: Batería de 5 tests unitarios.
- `src/hub/components/ShoppingAccordion.tsx`: Acordeón colapsable con telemetría y lista de compra.
- `src/hub/components/ShoppingAccordion.module.css`: Estilos visuales con badges de telemetría y lista.
- `src/hub/components/ShoppingAccordion.test.tsx`: Batería de 7 tests de integración.

### 6.2 Modificar (Archivos existentes del repo a alterar)
- `src/App.tsx`: Montar `<ShoppingAccordion />` dentro de `<HubContainer>` junto a `<TasksAccordion />`.

### 6.3 Preservar (Archivos existentes que NO deben romperse)
- Toda la capa backend de shopping (`src/shopping/services/*`, etc., 12 tests intactos).
- Toda la superficie de tareas (`src/tasks/*`, `src/hub/components/TasksAccordion.*`, 49 tests intactos).
- Autenticación, Usuarios, Workspace y Shell (54 tests intactos).

### 6.4 Prohibido Tocar (Fronteras infranqueables de esta FIA)
- `src/cleaning/*` (pertenece a RV-A05).
- Drag & Drop interactivo hacia casillas del calendario (reservado a RV-A07).

## 7. Dependencias
- **Documentales:** `SUITE_ARQUITECTURA_UI.docx`, `09_CENTRA_T_VISUAL_STATES.docx`, `Centra-T Pseudocódigo (unificado).odt` (Módulo 3), `CENTRA-T_INDICE_PVF_VF.docx`, `CENTRA-T_INDICE_RV_FIA.docx`, `FIA-A04.01_AS_BUILT.md`.
- **Tecnológicas Autorizadas:** React 19, TypeScript 5.x, CSS Modules, Vitest, `@testing-library/react`, `@testing-library/user-event`.
- **Dependencia Secuencial:** Requiere LOCK de `FIA-A04.01`. Desbloquea `FIA-A04.03`.

## 8. Restricciones
- Formato estricto de telemetría: `Compra Semanal (${comprados}/${total})`.
- Badge destacado de pendientes visible cuando `pendientes > 0`.
- El input rápido debe vaciarse y conservar el cursor/foco tras presionar Enter.
- Skeleton Screen local sin bloqueo modal de pantalla.

## 9. Plan de Implementación (Secuencia en 8 Pasos Ejecutables TDD)
- **Paso 1 — Preparar Tests:** Escribir en `src/shopping/components/QuickItemInput.test.tsx` (5 tests) y `src/hub/components/ShoppingAccordion.test.tsx` (7 tests). Verificar que fallan (`RED`).
- **Paso 2 — Validar Estado Actual:** Comprobar que los fallos responden a la ausencia de los componentes.
- **Paso 3 — Implementar QuickItemInput:** Crear `QuickItemInput.tsx` y `QuickItemInput.module.css` garantizando la retención de foco (`GREEN`).
- **Paso 4 — Implementar ShoppingAccordion:** Crear `ShoppingAccordion.tsx` y `ShoppingAccordion.module.css` con telemetría reactiva y estados visuales (`GREEN`).
- **Paso 5 — Montar en App:** Integrar `ShoppingAccordion` en `src/App.tsx`.
- **Paso 6 — Ejecutar Tests:** Correr `npm run test` asegurando que pasan los 115 tests previos más los 12 nuevos tests (mínimo 127 tests totales en verde).
- **Paso 7 — Ejecutar Quality Gates:** Ejecutar `npm run typecheck` y `npm run lint`.
- **Paso 8 — Generar Reportes y Detener:** Preparar los deltas de los 3 JSONs de estado, emitir `IMPLEMENTATION_REPORT_FIA-A04.02.md`, `TEST_REPORT_FIA-A04.02.md`, redactar la propuesta formal de `LOCK-FIA-A04.02.md` y detener la sesión (**STOP**).

## 10. Cambios Requeridos

### 10.1 Estructura canónica de `src/shopping/components/QuickItemInput.tsx`:
```tsx
import React, { useState, useRef } from 'react';
import styles from './QuickItemInput.module.css';

export interface QuickItemInputProps {
  onAddItem: (dto: { nombre: string; cantidad: number; unidad: string }) => Promise<void> | void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const QuickItemInput: React.FC<QuickItemInputProps> = ({
  onAddItem,
  disabled = false,
  autoFocus = false,
}) => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [unidad, setUnidad] = useState('ud');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      await onAddItem({
        nombre: trimmed,
        cantidad: cantidad > 0 ? cantidad : 1,
        unidad: unidad.trim() || 'ud',
      });
      setNombre('');
      setCantidad(1);
      setUnidad('ud');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <form className={styles.quickInputForm} onSubmit={handleSubmit} data-testid="quick-item-form">
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Añadir producto... (Enter)"
          maxLength={120}
          disabled={disabled || isSubmitting}
          autoFocus={autoFocus}
          className={styles.nameInput}
          aria-label="Nombre del producto"
        />

        <div className={styles.metaInputs}>
          <input
            type="number"
            value={cantidad}
            min={0.1}
            step={0.1}
            onChange={(e) => setCantidad(parseFloat(e.target.value) || 1)}
            disabled={disabled || isSubmitting}
            className={styles.quantityInput}
            aria-label="Cantidad"
          />

          <select
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            disabled={disabled || isSubmitting}
            className={styles.unitSelect}
            aria-label="Unidad"
          >
            <option value="ud">ud</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="l">l</option>
            <option value="pack">pack</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={disabled || isSubmitting || !nombre.trim()}
          className={styles.addButton}
          aria-label="Añadir ítem a la lista de compra"
        >
          +
        </button>
      </div>
    </form>
  );
};
```

### 10.2 Estilos de `src/shopping/components/QuickItemInput.module.css`:
```css
.quickInputForm {
  width: 100%;
}

.inputRow {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0b0f17;
  border: 1px solid #233144;
  border-radius: 8px;
  padding: 4px 6px;
  transition: border-color 0.15s;
}

.inputRow:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.nameInput {
  flex: 1;
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 13px;
  padding: 6px 8px;
  outline: none;
  min-width: 0;
}

.nameInput::placeholder {
  color: #64748b;
}

.metaInputs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.quantityInput {
  width: 48px;
  background: #131b26;
  border: 1px solid #233144;
  border-radius: 4px;
  color: #cbd5e1;
  font-size: 12px;
  padding: 4px;
  text-align: center;
  outline: none;
}

.unitSelect {
  background: #131b26;
  border: 1px solid #233144;
  border-radius: 4px;
  color: #cbd5e1;
  font-size: 11px;
  padding: 4px 6px;
  outline: none;
  cursor: pointer;
}

.addButton {
  background: #3b82f6;
  border: none;
  color: #ffffff;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.15s;
  flex-shrink: 0;
}

.addButton:hover:not(:disabled) {
  background: #2563eb;
}

.addButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

### 10.3 Batería de pruebas en `src/shopping/components/QuickItemInput.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickItemInput } from './QuickItemInput';

describe('QuickItemInput Component (Input Rápido Inline)', () => {
  it('debe renderizar los campos de nombre, cantidad y selector de unidad', () => {
    render(<QuickItemInput onAddItem={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: /nombre del producto/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /cantidad/i })).toHaveValue(1);
    expect(screen.getByRole('combobox', { name: /unidad/i })).toHaveValue('ud');
    expect(screen.getByRole('button', { name: /añadir ítem/i })).toBeInTheDocument();
  });

  it('debe invocar onAddItem al presionar Enter con nombre válido', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();

    render(<QuickItemInput onAddItem={handleAdd} />);

    const input = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(input, 'Café molido{Enter}');

    expect(handleAdd).toHaveBeenCalledWith({
      nombre: 'Café molido',
      cantidad: 1,
      unidad: 'ud',
    });
  });

  it('debe limpiar el campo de nombre tras la adición exitosa', async () => {
    const user = userEvent.setup();
    render(<QuickItemInput onAddItem={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(input, 'Yogur natural{Enter}');

    expect(input).toHaveValue('');
  });

  it('RETENCIÓN DE FOCO CONTINUO: el input conserva el foco tras pulsar Enter para ingreso en ráfaga', async () => {
    const user = userEvent.setup();
    render(<QuickItemInput onAddItem={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(input, 'Manzanas Golden{Enter}');

    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it('debe bloquear el envío ante nombre vacío o compuesto exclusivamente por espacios', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();

    render(<QuickItemInput onAddItem={handleAdd} />);

    const input = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(input, '    {Enter}');

    expect(handleAdd).not.toHaveBeenCalled();
  });
});
```

### 10.4 Estructura canónica de `src/hub/components/ShoppingAccordion.tsx`:
```tsx
import React, { useState, useEffect } from 'react';
import styles from './ShoppingAccordion.module.css';
import { ShoppingItem } from '../../shopping/entities/shopping-item.entity';
import { ShoppingService } from '../../shopping/services/shopping.service';
import { QuickItemInput } from '../../shopping/components/QuickItemInput';

export interface ShoppingAccordionProps {
  items?: ShoppingItem[];
  shoppingService?: ShoppingService;
  userId?: string;
  initialExpanded?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onToggleExpand?: (expanded: boolean) => void;
  onItemCreated?: (item: ShoppingItem) => void;
  onItemToggle?: (itemId: string) => void;
  onRetry?: () => void;
}

export const ShoppingAccordion: React.FC<ShoppingAccordionProps> = ({
  items: propItems,
  shoppingService,
  userId = 'usr-demo-elena-001',
  initialExpanded = true,
  isLoading: propLoading = false,
  error: propError = null,
  onToggleExpand,
  onItemCreated,
  onItemToggle,
  onRetry,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [items, setItems] = useState<ShoppingItem[]>(propItems || []);
  const [isLoading, setIsLoading] = useState(propLoading);
  const [error, setError] = useState<string | null>(propError);

  useEffect(() => {
    if (propItems !== undefined) {
      setItems(propItems);
    }
  }, [propItems]);

  useEffect(() => {
    setIsLoading(propLoading);
  }, [propLoading]);

  useEffect(() => {
    setError(propError);
  }, [propError]);

  useEffect(() => {
    if (shoppingService && userId && propItems === undefined) {
      setIsLoading(true);
      setError(null);
      shoppingService
        .findAllByUser(userId)
        .then((data) => setItems(data))
        .catch(() => setError('Error al cargar la lista de compra'))
        .finally(() => setIsLoading(false));
    }
  }, [shoppingService, userId, propItems]);

  const total = items.length;
  const comprados = items.filter((i) => i.comprado).length;
  const pendientes = total - comprados;

  const handleHeaderClick = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (onToggleExpand) {
      onToggleExpand(next);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (onItemToggle) {
      onItemToggle(itemId);
    }

    if (shoppingService && userId) {
      try {
        const updated = await shoppingService.toggleBoughtStatus(userId, itemId);
        setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
      } catch {
        // En caso de fallo se preserva el estado
      }
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, comprado: !item.comprado } : item
        )
      );
    }
  };

  const handleQuickAdd = async (dto: { nombre: string; cantidad: number; unidad: string }) => {
    if (shoppingService && userId) {
      try {
        const newItem = await shoppingService.createItem(userId, dto);
        setItems((prev) => [...prev, newItem]);
        if (onItemCreated) onItemCreated(newItem);
      } catch {
        setError('Error al añadir producto');
      }
    } else {
      const mockItem: ShoppingItem = {
        id: crypto.randomUUID(),
        userId,
        modulo: 'shopping',
        nombre: dto.nombre,
        cantidad: dto.cantidad,
        unidad: dto.unidad,
        comprado: false,
        fechaProgramada: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setItems((prev) => [...prev, mockItem]);
      if (onItemCreated) onItemCreated(mockItem);
    }
  };

  return (
    <div className={styles.accordionContainer} data-testid="shopping-accordion">
      {/* Cabecera con Telemetría */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        className={styles.header}
        onClick={handleHeaderClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHeaderClick();
          }
        }}
        data-testid="shopping-accordion-header"
      >
        <div className={styles.titleSection}>
          <span
            className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          >
            ▶
          </span>
          <h3 className={styles.title}>
            Compra Semanal ({comprados}/{total})
          </h3>
        </div>

        <div className={styles.headerRight}>
          {pendientes > 0 && (
            <span className={styles.pendingBadge} data-testid="shopping-pending-badge">
              {pendientes} pendientes
            </span>
          )}
          <span
            className={styles.dragHandleIcon}
            title="Arrastrar lista de compra al calendario"
            aria-label="Arrastrar compra completa"
          >
            ⋮⋮
          </span>
        </div>
      </div>

      {/* Cuerpo del Acordeón */}
      {isExpanded && (
        <div className={styles.contentArea}>
          {/* Skeleton Screen */}
          {isLoading && (
            <div className={styles.skeletonContainer} data-testid="shopping-skeleton">
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
            </div>
          )}

          {/* Estado de Error */}
          {!isLoading && error && (
            <div role="alert" className={styles.errorContainer} data-testid="shopping-error-state">
              <span className={styles.errorMessage}>{error}</span>
              {onRetry && (
                <button type="button" onClick={onRetry} className={styles.retryButton}>
                  Reintentar
                </button>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && items.length === 0 && (
            <div className={styles.emptyContainer} data-testid="shopping-empty-state">
              <div className={styles.emptyIcon} aria-hidden="true">
                🛒
              </div>
              <p className={styles.emptyTitle}>No hay productos en la lista de compra</p>
              <p className={styles.emptySubtitle}>Añade productos abajo para organizar tu compra</p>
            </div>
          )}

          {/* Populated List */}
          {!isLoading && !error && items.length > 0 && (
            <ul className={styles.shoppingList} role="list" data-testid="shopping-populated-list">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`${styles.shoppingItem} ${item.comprado ? styles.completed : ''}`}
                  data-testid={`shopping-item-${item.id}`}
                >
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={item.comprado}
                      onChange={() => handleToggleItem(item.id)}
                      className={styles.checkbox}
                      aria-label={`Comprar producto ${item.nombre}`}
                    />
                  </label>

                  <span
                    className={`${styles.itemName} ${item.comprado ? styles.nameCompleted : ''}`}
                  >
                    {item.nombre}
                  </span>

                  <span className={styles.quantityBadge}>
                    {item.cantidad} {item.unidad}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Input Rápido Inline en el pie */}
          <div className={styles.footerInputContainer}>
            <QuickItemInput onAddItem={handleQuickAdd} disabled={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
};
```

### 10.5 Estilos de `src/hub/components/ShoppingAccordion.module.css`:
```css
.accordionContainer {
  background: #131b26;
  border: 1px solid #233144;
  border-radius: 10px;
  margin-bottom: 16px;
  overflow: visible;
  transition: border-color 0.2s;
}

.accordionContainer:hover {
  border-color: #2d3f56;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  background: transparent;
}

.titleSection {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chevron {
  font-size: 11px;
  color: #64748b;
  display: inline-block;
  transition: transform 0.2s ease;
}

.chevronOpen {
  transform: rotate(90deg);
}

.title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}

.headerRight {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pendingBadge {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.dragHandleIcon {
  color: #64748b;
  font-size: 14px;
  cursor: grab;
  padding: 2px 4px;
}

.contentArea {
  padding: 0 16px 14px;
  border-top: 1px solid #1a2432;
}

.skeletonContainer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
}

.skeletonItem {
  height: 38px;
  background: #1a2432;
  border-radius: 6px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.5;
  }
}

.emptyContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  margin: 12px 0;
  border: 1px dashed #233144;
  border-radius: 8px;
  text-align: center;
}

.emptyIcon {
  font-size: 24px;
  margin-bottom: 6px;
}

.emptyTitle {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  margin: 0 0 4px;
}

.emptySubtitle {
  font-size: 11px;
  color: #64748b;
  margin: 0;
}

.shoppingList {
  list-style: none;
  padding: 0;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shoppingItem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: #0b0f17;
  border: 1px solid #1e293b;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.shoppingItem:hover {
  border-color: #334155;
}

.checkboxLabel {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: #10b981;
  cursor: pointer;
}

.itemName {
  flex: 1;
  font-size: 13px;
  color: #f8fafc;
  word-break: break-word;
}

.nameCompleted {
  text-decoration: line-through;
  color: #64748b;
}

.completed {
  opacity: 0.7;
}

.quantityBadge {
  font-size: 11px;
  color: #94a3b8;
  background: #1e293b;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.footerInputContainer {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #1a2432;
}

.errorContainer {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 6px;
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.errorMessage {
  font-size: 12px;
  color: #ef4444;
}

.retryButton {
  background: #1e293b;
  border: 1px solid #334155;
  color: #f8fafc;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
```

### 10.6 Batería de pruebas en `src/hub/components/ShoppingAccordion.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingAccordion } from './ShoppingAccordion';
import { ShoppingItem } from '../../shopping/entities/shopping-item.entity';

describe('ShoppingAccordion Component (Telemetría e Integración en Hub)', () => {
  const mockItems: ShoppingItem[] = [
    {
      id: 'shop-1',
      userId: 'usr-demo-elena-001',
      modulo: 'shopping',
      nombre: 'Leche desnatada',
      cantidad: 2,
      unidad: 'l',
      comprado: true,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'shop-2',
      userId: 'usr-demo-elena-001',
      modulo: 'shopping',
      nombre: 'Arroz basmati',
      cantidad: 1,
      unidad: 'kg',
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'shop-3',
      userId: 'usr-demo-elena-001',
      modulo: 'shopping',
      nombre: 'Pechuga de pollo',
      cantidad: 500,
      unidad: 'g',
      comprado: false,
      fechaProgramada: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('debe renderizar la cabecera con ratio exacto de telemetría (1/3) y badge de 2 pendientes', () => {
    render(<ShoppingAccordion items={mockItems} />);

    expect(screen.getByRole('button', { name: /compra semanal \(1\/3\)/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByTestId('shopping-pending-badge')).toHaveTextContent('2 pendientes');
  });

  it('debe colapsar y expandir el acordeón al hacer clic en la cabecera', async () => {
    const user = userEvent.setup();
    const handleExpand = vi.fn();

    render(<ShoppingAccordion items={mockItems} onToggleExpand={handleExpand} />);

    const header = screen.getByRole('button', { name: /compra semanal \(1\/3\)/i });
    expect(screen.getByTestId('shopping-populated-list')).toBeInTheDocument();

    // Colapsar
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('shopping-populated-list')).not.toBeInTheDocument();
    expect(handleExpand).toHaveBeenCalledWith(false);

    // Expandir
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('shopping-populated-list')).toBeInTheDocument();
  });

  it('debe renderizar el Skeleton Screen de 3 líneas cuando isLoading=true', () => {
    render(<ShoppingAccordion isLoading={true} />);
    expect(screen.getByTestId('shopping-skeleton')).toBeInTheDocument();
  });

  it('debe renderizar Empty State sobrio cuando no hay productos (items=[])', () => {
    render(<ShoppingAccordion items={[]} />);
    expect(screen.getByTestId('shopping-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no hay productos en la lista de compra/i)).toBeInTheDocument();
  });

  it('debe renderizar lista de productos con checkboxes, nombres y cantidades', () => {
    render(<ShoppingAccordion items={mockItems} />);

    expect(screen.getByText('Leche desnatada')).toBeInTheDocument();
    expect(screen.getByText('2 l')).toBeInTheDocument();

    expect(screen.getByText('Arroz basmati')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked(); // Leche comprada
    expect(checkboxes[1]).not.toBeChecked(); // Arroz pendiente
  });

  it('debe actualizar la telemetría dinámicamente al alternar un checkbox', async () => {
    const user = userEvent.setup();
    render(<ShoppingAccordion items={mockItems} />);

    const header = screen.getByRole('button', { name: /compra semanal \(1\/3\)/i });
    expect(header).toBeInTheDocument();

    // Marcar arroz como comprado
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    // Ratio pasa a 2/3 y pendientes pasa a 1
    expect(screen.getByRole('button', { name: /compra semanal \(2\/3\)/i })).toBeInTheDocument();
    expect(screen.getByTestId('shopping-pending-badge')).toHaveTextContent('1 pendientes');
  });

  it('debe incorporar de inmediato un producto tecleado en QuickItemInput e incrementar el contador total', async () => {
    const user = userEvent.setup();
    render(<ShoppingAccordion items={mockItems} />);

    const quickInput = screen.getByRole('textbox', { name: /nombre del producto/i });
    await user.type(quickInput, 'Aceite de girasol{Enter}');

    expect(screen.getByText('Aceite de girasol')).toBeInTheDocument();
    // Ahora total es 4, comprados 1 -> (1/4)
    expect(screen.getByRole('button', { name: /compra semanal \(1\/4\)/i })).toBeInTheDocument();
  });
});
```

### 10.7 Modificación canónica de `src/App.tsx`:
```tsx
import React, { useState } from 'react';
import { WorkspaceLayout } from './workspace/components/WorkspaceLayout';
import { LoginPage } from './authentication/views/LoginPage';
import { TopNavbar } from './workspace/components/TopNavbar';
import { HubContainer } from './hub/components/HubContainer';
import { TasksAccordion } from './hub/components/TasksAccordion';
import { ShoppingAccordion } from './hub/components/ShoppingAccordion';

export interface AppProps {
  initialAuthenticated?: boolean;
}

export const App: React.FC<AppProps> = ({ initialAuthenticated = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (initialAuthenticated) return true;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem('centrat_auth') === 'true';
    }
    return false;
  });

  const handleLoginSuccess = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('centrat_auth', 'true');
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem('centrat_auth');
    }
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onNavigateToWorkspace={handleLoginSuccess}
        onSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <WorkspaceLayout
      navbarSlot={
        <TopNavbar
          user={{ name: 'Usuario Centra-T' }}
          onLogout={handleLogout}
        />
      }
      hubSlot={
        <HubContainer>
          <TasksAccordion />
          <ShoppingAccordion />
        </HubContainer>
      }
    />
  );
};
```

## 11. Verificación y Evidencia
- Ejecutar la suite completa:
  ```bash
  npm test -- --run
  ```
- **Evidencia requerida:** Mínimo 127 tests pasando al 100% en verde a través de 19 archivos de prueba sin ninguna regresión en Auth, Tasks, Workspace ni Shopping Backend.

## 12. Matriz de Trazabilidad
| Requerimiento Indexado | Archivo de Especificación | Componente / Código | Test de Verificación |
| :--- | :--- | :--- | :--- |
| **PVF-A04.01 / VF-A04.01** | `SPEC-FIA-A04.02.md` (Sec. 10.4) | `ShoppingAccordion.tsx` (Telemetría X/Y) | `ShoppingAccordion.test.tsx` (Tests 1, 6) |
| **PVF-A04.02 / VF-A04.02** | `SPEC-FIA-A04.02.md` (Sec. 10.1) | `QuickItemInput.tsx` (Enter y Foco) | `QuickItemInput.test.tsx` (Tests 2, 4) |
| **Frontera Decisión 2B** | `SPEC-FIA-A04.02.md` (Sec. 10.1) | `maxLength={120}` | `QuickItemInput.test.tsx` (Test 1) |
| **Montaje en Workspace** | `SPEC-FIA-A04.02.md` (Sec. 10.7) | `App.tsx` (`<ShoppingAccordion />`) | `App.test.tsx` (9 tests intactos) |

## 13. Actualización context_accumulated.json
```json
{
  "active_slice": "RV-A04 · Gestión de Lista de la Compra Semanal (Shopping Vertical Slice)",
  "completed_fias": ["FIA-A01.01", "FIA-A01.02", "FIA-A01.03", "FIA-A02.01", "FIA-A02.02", "FIA-A02.03", "FIA-A02.04", "FIA-A02.05", "FIA-A03.01", "FIA-A03.02", "FIA-A03.03", "FIA-A03.04", "FIA-A03.05", "FIA-A04.01", "FIA-A04.02"],
  "latest_locked_fia": "FIA-A04.02",
  "architectural_decisions_applied": [
    "Aislamiento absoluto de tenant por userId en todas las consultas y mutaciones de shopping",
    "Decisión 2B innegociable: corte estricto en 120 caracteres de nombre de producto",
    "Telemetría en tiempo real: formato Compra Semanal (X/Y) y badge dinámico de pendientes",
    "Adición ágil continua: input rápido inline con retención automática de foco tras Enter",
    "Montaje dual en Hub: TasksAccordion y ShoppingAccordion conviven armónicamente en el panel lateral"
  ],
  "unlocked_next": "FIA-A04.03 (Modo Compra Activa y Sección Secundaria Colapsable 'Comprados')"
}
```

## 14. Actualización repo_state.json
```json
{
  "files_created": [
    "src/shopping/components/QuickItemInput.tsx",
    "src/shopping/components/QuickItemInput.module.css",
    "src/shopping/components/QuickItemInput.test.tsx",
    "src/hub/components/ShoppingAccordion.tsx",
    "src/hub/components/ShoppingAccordion.module.css",
    "src/hub/components/ShoppingAccordion.test.tsx"
  ],
  "files_modified": [
    "src/App.tsx"
  ],
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
    "ShoppingAccordion",
    "QuickItemInput",
    "TopNavbar",
    "RegisterTab",
    "LoginPage"
  ],
  "viewport_topology": {
    "root": "100vw x 100vh, padding 16px, background #0B0F17",
    "navbar": "TopNavbar (h=64px, logout reactivo)",
    "hub": "HubContainer (w=380px/colapsado) -> aloja TasksAccordion y ShoppingAccordion",
    "shopping_accordion": "ShoppingAccordion (telemetría reactiva X/Y, badge de pendientes, lista y QuickItemInput inline)",
    "workbench": "flex 1",
    "auth_surface": "LoginPage (card 440px centrada, tabs conmutables, inputs empáticos)"
  },
  "observable_states": {
    "hub": "reactivo_dual_acordeon_tasks_y_shopping",
    "shopping_accordion": "telemetria_activa_con_input_rapido_continuo",
    "shopping_backend": "crud_tenant_isolated_decision_1a_2b_bulk_schedule_active",
    "tasks_backend": "crud_tenant_isolated_decision_2b_active"
  }
}
```

## 16. Definition of Done (DoD)
La ejecución de esta SPEC se considera completada si y solo si:
1. `QuickItemInput` y `ShoppingAccordion` están implementados respetando la accesibilidad WCAG AA, la telemetría dinámica `(X/Y)` y la retención de foco en el input rápido.
2. `ShoppingAccordion` está montado en `HubContainer` dentro de `src/App.tsx` conviviendo limpiamente con `TasksAccordion`.
3. El 100% de los tests del proyecto (mínimo 127 tests) pasan en verde con Vitest a través de 19 suites de prueba.
4. Los 3 JSONs de estado quedan actualizados en la raíz del proyecto.
5. Se emiten el `IMPLEMENTATION_REPORT_FIA-A04.02.md`, `TEST_REPORT_FIA-A04.02.md` y la propuesta formal de `LOCK-FIA-A04.02.md`.

## 17. Instrucciones para Antigravity CLI (Mandatos para el Implementador)
- **Regla de Unidad Única:** Trabaja única y exclusivamente en `FIA-A04.02`. Prohibido implementar el modo compra activa con separación de sección 'Comprados' en esta sesión (reservado a `FIA-A04.03`).
- **TDD Estricto:** Ejecuta el Paso 1 antes de escribir los componentes de producción.
- **Retención de Foco Ininterrumpida:** Asegúrate de verificar mediante tests que el foco del cursor permanezca en `QuickItemInput` tras pulsar `Enter`.
- **Parada Obligatoria:** Tras verificar los tests en verde, actualizar los 3 JSONs y generar los reportes y el `LOCK-FIA-A04.02.md`, DETÉN LA EJECUCIÓN INMEDIATAMENTE (**STOP**) y devuelve el control al usuario.
