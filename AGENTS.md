# Directrices para Asistentes y Agentes de IA (AGENTS.md)
# Proyecto: Libertad Extension (Focus_extension)

Este documento establece las reglas obligatorias que cualquier agente de Inteligencia Artificial debe acatar al trabajar, auditar o modificar este repositorio. Siguen vigentes hasta que el usuario las actualice explícitamente.

---

## 🛡️ 1. Protocolo de Auditoría (Modo Solo Lectura Obligatorio)

Cuando el usuario solicite **"auditar"**, **"revisar"**, **"analizar"**, **"diagnosticar"** o **"evaluar"**:
1. **Prohibido editar archivos**: No utilices ninguna herramienta de escritura, edición o reemplazo de archivos durante una solicitud de auditoría.
2. **Entregar informe previo**: Entrega un informe claro que describa:
   - Diagnóstico del estado actual y hallazgos.
   - Puntos de acoplamiento o riesgos detectados.
   - Plan de acción propuesto sin aplicar cambios.
3. **Esperar confirmación**: No apliques ninguna solución en código hasta que el usuario apruebe explícitamente el plan de acción.

---

## 🎯 2. Principio de Aislamiento de Módulo (Ámbito Quirúrgico)

Para evitar romper componentes no relacionados:
1. **Límite estricto de edición**:
   - Si la tarea concierne a un módulo específico (ej. dislikes, sponsors, untranslate, shorts, subscriptions, styles, zen), **modifica exclusivamente el archivo de dicho módulo** (`src/modules/<modulo>.js`).
2. **Archivos protegidos (requieren orden explícita)**:
   - Orquestador y UI: `content.js`, `popup.js`, `popup.html`, `constants.js`.
   - No los modifiques salvo que el usuario lo haya ordenado de forma explícita para esa tarea.
3. **Infraestructura compartida (requiere consulta previa)**:
   - `src/core/utils.js`, `src/core/cache.js`, `src/injected/agent.js`, `background.js`, `i18n.js`, `manifest.json`, `theme-init.js`, `welcome.html`, `welcome.js`, `welcome.css`.
   - Si el fix parece requerir uno de estos archivos, **detente y pregunta primero**, explicando por qué el módulo solo no alcanza.
4. **Fixes que cruzan varios archivos**:
   - Si la solución necesita más de un módulo, o un módulo más infraestructura compartida, **presenta el plan y espera confirmación** antes de editar. No hagas cambios parciales "para ver si funciona".
5. **Archivos que nunca se editan a mano**:
   - `node_modules/`, `package-lock.json` (solo vía `npm`) y `libertad-extension.zip` (solo vía `npm run pack` si el usuario lo pide).
6. **Respeto por el trabajo existente**:
   - No borres ni sobrescribas archivos, ramas o cambios sin relación con la tarea. Si encontrás cambios que no hiciste, tratalos como trabajo del usuario e investigá antes de tocarlos.

---

## 📦 3. Arquitectura de "Cajas Negras" (Contrato de Módulos)

1. **Estado Encapsulado**:
   - Cada módulo debe gestionar sus propias variables de estado, temporizadores (`setTimeout`/`setInterval`), referencias a nodos del DOM y cachés dentro de su propia clausura/alcance local.
   - **Prohibido exponer estado interno** en `window` o `globalThis.Libertad` (ej. variables como `lastDislikeBtn` o banderas internas no deben ser globales).
2. **Contrato de Ciclo de Vida**:
   - Los módulos se comunican con el orquestador mediante el contrato estándar de ciclo de vida (`init`, `onNavigate`, `onSettingsChange`, `onDomMutation`, `destroy`).
   - `init(settings, ctx)` puede recibir un contexto de hidratación (`ctx.hydrated`): el bootstrap en `document_start` llega como `{ hydrated: false }` (solo trabajo reversible/anti-FOUC) y, tras consultar `chrome.storage`, el orquestador re-invoca `init` con `{ hydrated: true }`. Las acciones irreversibles (redirecciones, peticiones a APIs externas, cambios de estado del reproductor) deben esperar a esa segunda invocación.
   - Los módulos no deben llamarse directamente entre sí ni alterar variables de otros módulos.
   - `destroy()` debe limpiar todo lo que creó el módulo: listeners, `setTimeout`/`setInterval`, observers y nodos inyectados. Un módulo desactivado no debe seguir ejecutando trabajo.

---

## ✅ 4. Verificación y Control de Calidad Obligatorios

Antes de reportar cualquier tarea o cambio como completado:
1. **Suite de Paridad**: Ejecuta siempre el comando de pruebas:
   ```bash
   npm test
   ```
   Todas las pruebas deben pasar (0 failures).
2. **Linter y Formato**: Después de las pruebas, asegúrate de que el código cumpla con Biome:
   ```bash
   npm run check
   ```
   Si hay errores de formato, aplicalos con `npm run check:fix` solo sobre los archivos que tocaste.
3. **No logs de depuración**: Prohibido dejar `console.log()` en código de producción (`src/`, `content.js`, `background.js`, `popup.js`, `welcome.js`, `theme-init.js`). En `test/` y scripts de tooling están permitidos.
4. **No sabotear la verificación**: No modifiques `test/parity-check.js` ni reduzcas aserciones para que las pruebas pasen. Si una prueba falla, corregí el código. Si creés que la prueba está mal, preguntá antes.
5. **Fallos ajenos**: si `npm test` falla por algo que no causó tu cambio, informalo y no lo "arregles" fuera del alcance sin permiso.

---

## 🔒 5. Git, Dependencias y Artefactos

1. **Sin acciones de git sin permiso**: No ejecutes `git commit`, `git push`, `git tag`, `git checkout`, `git reset` ni crees o elimines ramas salvo que el usuario lo pida explícitamente.
2. **Sin cambios de dependencias sin permiso**: No agregues, quites ni actualices paquetes. No edites `package.json` ni `package-lock.json` salvo orden explícita.
3. **Sin artefactos nuevos**: No regeneres `libertad-extension.zip` ni ejecutes `npm run pack` salvo que se solicite.
4. **Reporte final**: al terminar, indica archivos modificados, resultado de `npm test` y `npm run check`, y cualquier riesgo o pendiente.

---

## 📌 6. Resumen de Flujo para la IA

```
[Solicitud del Usuario]
       │
       ├── ¿Auditoría/Diagnóstico? ──> SÓLO LECTURA + INFORME + ESPERAR CONFIRMACIÓN
       │
       └── ¿Implementación/Fix?
             ├── Un solo módulo ─────────────> EDITAR SÓLO ESE ARCHIVO
             ├── Varios archivos, archivo protegido
             │   o infraestructura compartida ─> PLAN + ESPERAR CONFIRMACIÓN
             └── Al terminar ─────────────────> `npm test` + `npm run check`
                                                  └── REPORTAR ARCHIVOS, RESULTADOS Y RIESGOS
```
