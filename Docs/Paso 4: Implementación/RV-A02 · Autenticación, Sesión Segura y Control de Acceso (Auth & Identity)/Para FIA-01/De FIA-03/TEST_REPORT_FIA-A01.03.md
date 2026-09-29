# TEST REPORT · FIA-A01.03

- **Fecha:** 2026-09-29
- **Unidad:** FIA-A01.03 · TopNavbar con Perfil y Telemetría de Red
- **Runner / Framework:** Vitest 3.0.7
- **Comando Ejecutado:** npm run test

## 1. Resumen de Ejecución
- **Total de Tests:** 14
- **Pasados:** 14
- **Fallados:** 0
- **Saltados / Ignorados:** 0

## 2. Cobertura Obtenida
- **Capa de Dominio / Core:** N/A (componentes UI presentacionales)
- **Capa de Aplicación / Casos de Uso:** N/A
- **Integración / Adaptadores / UI:** 100% (renderizado de marca y perfil, píldora de red online inicial, conmutación dinámica online/offline ante eventos de ventana, callback de logout, cleanup de event listeners y suites de regresión de WorkspaceLayout y HubContainer)

## 3. Trazas Relevantes
```text
 ✓ src/workspace/components/WorkspaceLayout.test.tsx (4 tests) 157ms
   ✓ PVF-A01.01 · WorkspaceLayout (Shell Base y Topología Espacial de 2 Columnas) > debe renderizar sin errores los placeholders por defecto
   ✓ PVF-A01.01 · WorkspaceLayout (Shell Base y Topología Espacial de 2 Columnas) > debe contener los roles semánticos banner, complementary y main con accesibilidad
   ✓ PVF-A01.01 · WorkspaceLayout (Shell Base y Topología Espacial de 2 Columnas) > debe permitir la inyección de nodos en los slots navbarSlot, hubSlot y workbenchSlot
   ✓ PVF-A01.01 · WorkspaceLayout (Shell Base y Topología Espacial de 2 Columnas) > debe poseer estructura de contención perimetral (workspaceShell)
 ✓ src/workspace/components/TopNavbar.test.tsx (6 tests) 238ms
   ✓ PVF-A01.03 · TopNavbar (Barra de Navegación Superior y Telemetría Visual) > debe renderizar la marca "Centra-T", el avatar y el nombre de usuario por defecto
   ✓ PVF-A01.03 · TopNavbar (Barra de Navegación Superior y Telemetría Visual) > debe renderizar datos personalizados de usuario si se proporcionan
   ✓ PVF-A01.03 · TopNavbar (Barra de Navegación Superior y Telemetría Visual) > debe mostrar la píldora de red inicialmente en estado Online
   ✓ PVF-A01.03 · TopNavbar (Barra de Navegación Superior y Telemetría Visual) > debe conmutar dinámicamente el badge de Online a Offline y viceversa ante eventos del navegador
   ✓ PVF-A01.03 · TopNavbar (Barra de Navegación Superior y Telemetría Visual) > debe disparar el callback onLogout al pulsar el botón de cerrar sesión
   ✓ PVF-A01.03 · TopNavbar (Barra de Navegación Superior y Telemetría Visual) > debe limpiar los event listeners al desmontar el componente para evitar fugas de memoria
 ✓ src/hub/components/HubContainer.test.tsx (4 tests) 268ms
   ✓ PVF-A01.02 · HubContainer (Mecanismo Colapsable Reactivo del Hub) > debe renderizar el Hub en estado expandido por defecto con sus hijos
   ✓ PVF-A01.02 · HubContainer (Mecanismo Colapsable Reactivo del Hub) > debe colapsar el Hub al hacer clic en el botón toggle y actualizar aria-expanded
   ✓ PVF-A01.02 · HubContainer (Mecanismo Colapsable Reactivo del Hub) > debe re-expandir el Hub al volver a hacer clic en el botón toggle
   ✓ PVF-A01.02 · HubContainer (Mecanismo Colapsable Reactivo del Hub) > debe respetar la prop initialCollapsed si se pasa como true

 Test Files  3 passed (3)
      Tests  14 passed (14)
```
