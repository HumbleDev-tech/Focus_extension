# Directrices para Asistentes y Agentes de IA (AGENTS.md)
# Proyecto: Libertad Extension (Focus_extension)

Este documento establece las reglas obligatorias e inmutables que cualquier agente de Inteligencia Artificial debe acatar al trabajar, auditar o modificar este repositorio.

---

## 🛡️ 1. Protocolo de Auditoría (Modo Solo Lectura Obligatorio)

Cuando el usuario solicite **"auditar"**, **"revisar"**, **"analizar"**, **"diagnosticar"** o **"evaluar"**:
1. **Prohibido editar archivos**: No utilices herramientas de escritura o reemplazo (`write_to_file`, `replace_file_content`, `multi_replace_file_content`) durante una solicitud de auditoría.
2. **Entregar informe previo**: Entrega un informe claro que describa:
   - Diagnóstico del estado actual y hallazgos.
   - Puntos de acoplamiento o riesgos detectados.
   - Plan de acción propuesto sin aplicar cambios.
3. **Esperar confirmación**: No apliques ninguna solución en código hasta que el usuario apruebe explícitamente el plan de acción.

---

## 🎯 2. Principio de Aislamiento de Módulo (Ámbito Quirúrgico)

Para evitar romper componentes no relacionados:
1. **Límite estricto de edición**:
   - Si la tarea concierne a un módulo específico (ej. dislikes, sponsors, untranslate, shorts, subscriptions, styles), **modifica exclusivamente el archivo de dicho módulo** (`src/modules/<modulo>.js`).
   - **Archivos protegidos**: No modifiques [content.js](file:///home/humble/Focus_extension/content.js), [popup.js](file:///home/humble/Focus_extension/popup.js), [popup.html](file:///home/humble/Focus_extension/popup.html) ni [constants.js](file:///home/humble/Focus_extension/constants.js) a menos que el usuario lo haya ordenado explícitamente.
2. **Regla de consulta previa**:
   - Si consideras que para resolver un problema en un módulo es indispensable alterar el orquestador (`content.js`) o una constante global, **detente y pregunta primero al usuario** antes de editar.

---

## 📦 3. Arquitectura de "Cajas Negras" (Contrato de Módulos)

1. **Estado Encapsulado**:
   - Cada módulo debe gestionar sus propias variables de estado, temporizadores (`setTimeout`/`setInterval`), referencias a nodos del DOM y cachés dentro de su propia clausura/alcance local.
   - **Prohibido exponer estado interno** en `window` o `globalThis.Libertad` (ej. variables como `lastDislikeBtn` o banderas internas no deben ser globales).
2. **Contrato de Ciclo de Vida**:
   - Los módulos se comunican con el orquestador mediante el contrato estándar de ciclo de vida (`init`, `onNavigate`, `onSettingsChange`, `onDomMutation`, `destroy`).
   - Los módulos no deben llamarse directamente entre sí ni alterar variables de otros módulos.

---

## ✅ 4. Verificación y Control de Calidad Obligatorios

Antes de reportar cualquier tarea o cambio como completado:
1. **Suite de Paridad**: Ejecuta siempre el comando de pruebas:
   ```bash
   npm test
   ```
   Todas las pruebas deben pasar (0 failures).
2. **Linter y Formato**: Asegúrate de que el código cumpla con los estándares de Biome:
   ```bash
   npm run lint
   ```
3. **No logs de depuración**: Prohibido dejar sentencias `console.log()` en código de producción.

---

## 📌 5. Resumen de Flujo para la IA

```
[Solicitud del Usuario]
       │
       ├── ¿Es Auditoría/Diagnóstico? ──> SÓLO LECTURA + INFORME + ESPERAR CONFIRMACIÓN
       │
       └── ¿Es Implementación/Fix? ──> EDITAR ÚNICAMENTE EL ARCHIVO DEL MÓDULO CORRESPONDIENTE
                                             │
                                             └── EJECUTAR `npm test` Y `npm run lint`
                                                   │
                                                   └── REPORTAR RESULTADO CON LINKS CLICKABLES
```
