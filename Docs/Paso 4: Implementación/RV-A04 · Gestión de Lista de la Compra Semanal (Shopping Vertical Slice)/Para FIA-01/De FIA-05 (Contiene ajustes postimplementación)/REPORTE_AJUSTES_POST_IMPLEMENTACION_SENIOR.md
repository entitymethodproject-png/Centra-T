# INFORME TÉCNICO DE TRANSPARENCIA Y AJUSTES POST-IMPLEMENTACIÓN · FIA-A03.05

- **Para:** Senior Technical Reviewer / Responsable de Arquitectura Centra-T
- **De:** Equipo de Desarrollo e Implementación FIA
- **Fecha:** 2026-09-29
- **Unidad:** FIA-A03.05 · TaskActionMenu con Menú Contextual y Modal Preventivo de Eliminación
- **Hito de Rebanada:** CIERRE TOTAL Y SELLADO DEFINITIVO DE LA REBANADA VERTICAL 3 (RV-A03)
- **Estado:** 100% BLINDADO Y AUDITADO (103/103 Tests Pasando · 0 Errores TypeScript)
- **Commits Asociados:** `84691de` (Implementación base), `c1b231a` (Ajustes de autoajuste y desbordamiento visible)

---

## 1. Motivo del Informe y Declaración de Honestidad Técnica

Durante las pruebas visuales y exploratorias directas en el navegador local (`http://127.0.0.1:5173/`) tras desplegar la unidad táctica `FIA-A03.05`, se evidenció una anomalía visual de recorte en la interfaz de usuario:

Al hacer clic en el botón disparador de acciones (`•••`) de una tarjeta de tarea en la lista del Hub, el menú contextual flotante aparecía cortado horizontalmente por la mitad en su parte inferior. Opciones críticas como `Eliminar tarea`, los selectores de prioridad y el divisor quedaban completamente invisibles e inaccesibles bajo el borde inferior del cajón de tareas del acordeón.

Siguiendo la política de máxima transparencia y rigor del Método zug, este informe desglosa:
1. El bug visual detectado y su causa raíz a bajo nivel.
2. Las correcciones técnicas implementadas.
3. El razonamiento técnico y arquitectónico detrás de cada decisión tomada.
4. La verificación formal de calidad (0 regresiones en las 15 suites de pruebas).

---

## 2. Bug Detectado y Análisis de Causa Raíz

### Síntoma Observado (Evidencia en Captura de Pantalla)
- En el panel del Hub lateral, el acordeón `Tareas (1)` contenía una única tarjeta de tarea (`<SDG`).
- Al pulsar el disparador `•••`, el menú flotante se desplegaba hacia abajo.
- El menú se interrumpía abruptamente en la línea fronteriza inferior del acordeón: solo se visualizaba la cabecera `Cambiar prioridad ▼`. Todo el contenido restante del menú (`Alta`, `Media`, `Baja`, línea divisoria y el botón destructivo `Eliminar tarea`) quedaba oculto.

### Causa Raíz Técnica
1. **Contenedor rígido con `overflow: hidden`:**
   En `src/hub/components/TasksAccordion.module.css`, la clase `.accordionContainer` tenía declarada la propiedad:
   ```css
   .accordionContainer {
     ...
     overflow: hidden;
     ...
   }
   ```
   Originalmente concebida para que los bordes redondeados (`border-radius: 10px`) enmarcaran el contenido, esta regla convertía al contenedor en un área de recorte (*clipping rectangle*) estricta.

2. **Altura mínima ceñida al número de tarjetas:**
   Al existir únicamente una tarea en la lista, la altura natural del cuerpo del acordeón (`.contentArea`) era de apenas ~80px.

3. **Naturaleza del posicionamiento absoluto sin expansión de flujo:**
   En `src/tasks/components/TaskActionMenu.module.css`, el menú contextual `.dropdownMenu` tiene posicionamiento absoluto (`position: absolute; top: 100%; right: 0; min-width: 170px;`). Los elementos con `position: absolute` quedan fuera del flujo de maquetación normal del DOM, por lo que **no alteran ni expanden la altura de su contenedor padre**.

4. **Colisión de dimensiones:**
   El menú mide aproximadamente 100px de alto. Al nacer al pie del botón `•••` (que ya se encontraba al final del cajón de 80px), sobresalía unos 80px por debajo del borde inferior del acordeón. Al toparse con `overflow: hidden;`, el motor de renderizado del navegador recortó implacablemente toda la porción sobresaliente.

---

## 3. Correcciones Realizadas y Justificación de las Decisiones de Diseño

Para erradicar el problema sin comprometer la limpieza arquitectónica ni la responsividad ante listas con múltiples tareas, se aplicó una estrategia en 4 capas:

### Decisión A: Desbordamiento Libre (`overflow: visible`) en la Cadena del Acordeón
* **Archivos Afectados:** `src/hub/components/TasksAccordion.module.css`
* **Cambio:**
  Se sustituyó `overflow: hidden` por `overflow: visible` en `.accordionContainer`, y se explicitó `overflow: visible` tanto en `.contentArea` como en `.taskList`.
* **Por qué esta decisión:**
  Un menú contextual flotante o *dropdown* debe comportarse siempre como una capa superpuesta (*overlay* o *popover* con sombra y profundidad en el eje Z). Impedir que los contenedores intermedios del acordeón actúen como cajas de recorte permite que el menú flote libremente sobre el lienzo del Hub lateral, donde hay cientos de píxeles verticales libres.

### Decisión B: Armonización Geométrica de Bordes Redondeados
* **Archivos Afectados:** `src/hub/components/TasksAccordion.module.css`, `src/hub/components/TasksAccordion.tsx`
* **Cambio:**
  Se asignó `border-top-left-radius: 9px` y `border-top-right-radius: 9px` a la clase `.header`. Adicionalmente, se creó la clase `.headerCollapsed` (`border-bottom-left-radius: 9px; border-bottom-right-radius: 9px;`) que se activa condicionalmente cuando `!isExpanded`.
* **Por qué esta decisión:**
  Al retirar `overflow: hidden` del contenedor padre, existía el riesgo de que la cabecera desbordara sus esquinas sobre el radio de curvatura del contenedor. Al gobernar explícitamente los radios en el hijo superior e inferior, se conserva la estética impecable de esquinas redondeadas sin necesidad de sacrificar la visibilidad de los menús.

### Decisión C: Control de Apilamiento Jerárquico ante Listas Múltiples (`z-index`)
* **Archivos Afectados:** `src/tasks/components/TaskCard.module.css`, `src/tasks/components/TaskActionMenu.module.css`
* **Cambio:**
  1. En `TaskCard.module.css`, se definió `position: relative;` y la pseudoclase:
     ```css
     .taskItem:focus-within {
       z-index: 20;
     }
     ```
  2. En `TaskActionMenu.module.css`, se elevó el `.dropdownMenu` a `z-index: 100;`.
* **Por qué esta decisión:**
  Cuando un usuario tiene 5 o 10 tareas consecutivas, las tarjetas posteriores en el DOM tienen por defecto un orden de apilamiento natural superior. Al elevar el `z-index` de la tarjeta que tiene el foco activo o el menú abierto, se garantiza de manera matemáticamente estricta que el menú siempre flote **por encima** de las tarjetas subsiguientes y nunca quede tapado por ellas.

### Decisión D: Posicionamiento Inteligente Dinámico (*Dropup* Automático)
* **Archivos Afectados:** `src/tasks/components/TaskActionMenu.tsx`, `src/tasks/components/TaskActionMenu.module.css`
* **Cambio:**
  Al pulsar el disparador `•••`, el componente calcula en tiempo de ejecución la distancia disponible hasta el borde inferior de la ventana:
  ```typescript
  const rect = menuRef.current.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  setOpenUpwards(spaceBelow < 180);
  ```
  Si el espacio inferior es inferior a 180px (p. ej., en tareas ubicadas al final de la pantalla), se aplica la clase `.dropdownMenuUpwards` (`top: auto; bottom: 100%; margin-bottom: 4px; animation: menuAppearUp ...`).
* **Por qué esta decisión:**
  Esto resuelve la segunda preocupación del usuario (*"para cuando añadamos más tareas"*): si la lista de tareas crece y una tarea queda pegada al borde inferior de la pantalla o del Hub, el menú se despliega automáticamente **hacia arriba** (*dropup*), garantizando que jamás se recorte ni obligue al usuario a hacer scroll para alcanzar las opciones.

---

## 4. Auditoría de Regresión y Estado de Quality Gates

Tras aplicar estas mejoras, se ejecutó la totalidad de la batería de pruebas y linters del proyecto:

1. **QG-01 · Typecheck:** `npm run typecheck` (`tsc --noEmit`) ➔ **0 errores**.
2. **QG-02 · Linting:** `npm run lint` ➔ **0 warnings / Clean**.
3. **QG-03 · Batería de Tests Completa:** `npm test -- --run` ➔ **103 de 103 tests pasando al 100% en verde** a través de 15 suites de pruebas.
4. **QG-04 · Invariantes de Accesibilidad:** Se mantienen intactos los roles `role="menu"`, `role="menuitem"`, `aria-haspopup="menu"`, y los focos seguros del modal preventivo.

---

## 5. Matriz de Archivos Modificados en el Ajuste Post-Implementación

| Archivo Modificado | Naturaleza del Cambio | Justificación |
| :--- | :--- | :--- |
| `src/hub/components/TasksAccordion.module.css` | `overflow: visible` en contenedor, contentArea y taskList; radios de cabecera | Eliminar efecto guillotina sobre menús flotantes |
| `src/hub/components/TasksAccordion.tsx` | Inyección condicional de `styles.headerCollapsed` | Preservar bordes redondeados al colapsar sin `overflow: hidden` |
| `src/tasks/components/TaskCard.module.css` | `position: relative`, `overflow: visible`, `:focus-within { z-index: 20 }` | Garantizar que el menú se superponga a las tareas inferiores |
| `src/tasks/components/TaskActionMenu.tsx` | Detección reactiva de espacio inferior (`openUpwards`) | Despliegue hacia arriba automático en tarjetas inferiores |
| `src/tasks/components/TaskActionMenu.module.css` | `.dropdownMenuUpwards`, `z-index: 100` y animación `menuAppearUp` | Estilos y transición suave para el comportamiento *dropup* |

---

## 6. Conclusión y Estado de Cierre de Rebanada RV-A03

Con estos ajustes finales, la interfaz de tareas no solo cumple a nivel funcional y de pruebas automatizadas, sino que alcanza un grado superior de pulido visual y robustez ergonómica en tiempo real. 

El árbol de trabajo de Git se encuentra 100% limpio en el commit consolidado:
`c1b231a` — *"fix(ui): permitir autoajuste y desbordamiento visible en cajon de tareas para evitar recorte del desplegable"*.

La **Rebanada Vertical RV-A03** queda ratificada, certificada y sellada al 100% para su entrega al Senior Reviewer.
