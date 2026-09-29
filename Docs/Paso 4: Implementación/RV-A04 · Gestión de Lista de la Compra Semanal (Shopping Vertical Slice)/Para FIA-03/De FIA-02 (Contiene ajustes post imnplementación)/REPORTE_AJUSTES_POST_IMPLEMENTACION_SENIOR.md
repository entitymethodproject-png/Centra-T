# INFORME TÉCNICO DE TRANSPARENCIA Y AJUSTES POST-IMPLEMENTACIÓN · FIA-A04.02

- **Para:** Senior Technical Reviewer / Responsable de Arquitectura Centra-T
- **De:** Equipo de Desarrollo e Implementación FIA
- **Fecha:** 2026-09-29
- **Unidad:** FIA-A04.02 · Acordeón de Lista de la Compra en Hub con Telemetría e Input Rápido
- **Hito de Rebanada:** SEGUNDA UNIDAD DE RV-A04 (INTEGRACIÓN EN HUB, TELEMETRÍA REACTIVA Y ENTRADA RÁPIDA INLINE)
- **Estado:** 100% BLINDADO Y AUDITADO (128/128 Tests Pasando · 0 Errores TypeScript)
- **Commits Asociados:** `c0a80bf` (Implementación base), `ec453de` (Ajuste de selector de cantidad a paso entero de 1 en 1)

---

## 1. Motivo del Informe y Declaración de Honestidad Técnica

Durante las pruebas funcionales interactivas en el navegador local (`http://127.0.0.1:5173/`) tras desplegar la unidad táctica `FIA-A04.02`, se detectó una fricción ergonómica en el componente de adición rápida inline (`QuickItemInput`):

Los controles de incremento/decremento nativos (las flechas del campo numérico o *spinbutton*) operaban con precisión decimal de décimas (`0.1`, `0.2`, `0.3`...), provocando que al hacer clic sobre la flecha superior partiendo del valor por defecto `1`, la cantidad avanzara a `1.1`, `1.2`, en lugar de evolucionar naturalmente en unidades enteras (`1`, `2`, `3`, `4`...).

Siguiendo el principio de rigor y transparencia absoluta del Método zug, se elabora el presente informe técnico detallando:
1. El comportamiento anómalo detectado y su causa raíz.
2. Las correcciones técnicas implementadas en código y tests.
3. La justificación de las decisiones de diseño adoptadas.
4. Las métricas de verificación formal (128/128 tests en verde).

---

## 2. Bug / Fricción Detectada y Análisis de Causa Raíz

### Síntoma Observado
- En el pie del acordeón `Compra Semanal`, el formulario `QuickItemInput` presentaba un selector numérico con valor inicial `1`.
- Al pulsar la flechita superior del campo de cantidad, el valor mutaba a `1.1` (o al pulsar la flecha inferior disminuía a `0.9`).
- Para la gestión de compras domésticas frecuentes (piezas de fruta, latas, briks, paquetes), este comportamiento exigía teclear manualmente el número entero o pulsar 10 veces la flecha para avanzar una sola unidad, degradando la velocidad del flujo de entrada ágil en ráfaga.

### Causa Raíz Técnica
En `src/shopping/components/QuickItemInput.tsx`, la etiqueta `<input type="number" ... />` había sido parametrizada inicialmente con:
```tsx
<input
  type="number"
  value={cantidad}
  min={0.1}
  step={0.1}
  onChange={(e) => setCantidad(parseFloat(e.target.value) || 1)}
  ...
/>
```
La especificación de `step={0.1}` y `min={0.1}` instruía al motor de renderizado del navegador a incrementar o decrementar el valor en fracciones de décimas cada vez que el usuario accionaba los controles de flecha del *spinbutton*.

---

## 3. Correcciones Realizadas y Justificación de las Decisiones de Diseño

### Decisión A: Configuración de Atributos Nativos de Paso Entero (`step="1"`, `min="1"`)
* **Archivos Afectados:** `src/shopping/components/QuickItemInput.tsx`
* **Cambio:**
  Se actualizaron los atributos del input a `step={1}` y `min={1}`.
* **Por qué esta decisión:**
  Los atributos HTML estándar `step="1"` y `min="1"` le indican directamente al navegador y a las tecnologías de asistencia (lectores de pantalla) que la granularidad de cambio del control numérico es de 1 unidad entera, impidiendo además valores nulos o negativos al operar con las flechas.

### Decisión B: Control de Estado Resiliente ante Vaciado de Buffer (`number | ''`)
* **Archivos Afectados:** `src/shopping/components/QuickItemInput.tsx`
* **Cambio:**
  Se tipó el estado local como `cantidad: number | ''` y se implementó un manejador explícito:
  ```typescript
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setCantidad('');
      return;
    }
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setCantidad(Math.max(1, parsed));
    }
  };
  ```
* **Por qué esta decisión:**
  Si un input numérico controlado usa `parseInt(e.target.value) || 1`, cuando el usuario selecciona el campo y presiona *Backspace* para escribir un nuevo número (ej. `5`), el evento `onChange` recibe `""`, que se convertía forzosamente en `1` impidiendo borrar el campo limpiamente. Al permitir transitoriamente `''` mientras el usuario teclea, se consigue una experiencia de escritura perfectamente fluida sin parpadeos ni bloqueos.

### Decisión C: Normalización Defensiva en el Submit
* **Archivos Afectados:** `src/shopping/components/QuickItemInput.tsx`
* **Cambio:**
  En el manejador `handleSubmit`:
  ```typescript
  const finalCantidad = typeof cantidad === 'number' && cantidad >= 1 ? cantidad : 1;
  ```
* **Por qué esta decisión:**
  Si el usuario borró el campo de cantidad y pulsó directamente `Enter` en el campo del nombre, el sistema recurre de manera segura al valor por defecto canónico de `1 ud`, garantizando que jamás se persista un ítem sin cantidad válida.

### Decisión D: Actualización y Ampliación de la Batería de Tests Unitarios
* **Archivos Afectados:** `src/shopping/components/QuickItemInput.test.tsx`
* **Cambio:**
  1. En el Test 1, se añadieron aserciones explícitas para verificar la presencia de `step="1"` y `min="1"`.
  2. Se incorporó un sexto test específico: `debe permitir ajustar la cantidad en unidades enteras (paso de 1) y enviar la cantidad modificada`, comprobando que al escribir o incrementar a `4`, el evento `onAddItem` recibe `{ cantidad: 4, ... }`.
* **Por qué esta decisión:**
  Garantiza mediante pruebas automatizadas que futuras refactorizaciones no reintroduzcan pasos decimales ni alteren el comportamiento de unidades enteras.

---

## 4. Auditoría de Drift y Métricas de Calidad

- **Drift Detectado:** 0 (El cambio respeta íntegramente la arquitectura de shopping y la Decisión 2B).
- **Archivos Modificados:** 2 (`QuickItemInput.tsx`, `QuickItemInput.test.tsx`).
- **Regresiones Detectadas:** 0 (Las 19 suites de prueba del sistema pasaron al 100%).
- **Quality Gates:**
  - `QG-01 · Typecheck:` 0 errores (`tsc --noEmit`).
  - `QG-02 · Linting:` 0 warnings.
  - `QG-03 · Batería de Tests:` **128 / 128 tests pasados al 100% en verde**.
  - `QG-04 · Ergonomía y Step:` Certificado en Vitest con paso entero de 1 en 1.
  - `QG-05 · Accesibilidad:` WCAG AA verificado.
