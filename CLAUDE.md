# SDD Sudoku

Juego de sudoku web creado para aprender Spec-Driven Development con OpenSpec.

## Stack
- TypeScript + Vite, sin backend.
- Vitest para tests unitarios, Playwright para tests funcionales.
- Lógica del juego en src/core/ (sin dependencias de la UI). Interfaz en src/ui/.
- Código y nombres en inglés; specs y documentación en español.

## Flujo de trabajo (SDD con OpenSpec)
- No implementes nada que no esté en una spec o en un cambio de openspec/changes/.
- Ciclo de cada cambio:
  1. /opsx:propose genera SOLO proposal.md y las specs. Detente ahí.
  2. Lanza el agente spec-reviewer sobre proposal y specs.
  3. El usuario responde las decisiones y se corrigen los artefactos.
  4. Solo cuando el usuario confirme la spec, genera design.md y tasks.md.
  5. Lanza de nuevo el spec-reviewer para comprobar la coherencia de todo.
  6. /opsx:apply → agente test-writer → agente code-reviewer →
     /opsx:archive → /publish-doc.
- No generes design.md ni tasks.md sin que el usuario haya confirmado la spec.
- No ejecutes /opsx:apply hasta que el spec-reviewer dé "Lista para
  implementar" y el usuario lo confirme.
- No ejecutes /opsx:archive hasta que el code-reviewer dé "Listo para archivar".
- Si algo de la spec es ambiguo, pregunta en vez de suponer.
- Si un test falla con un ejemplo de la spec, no modifiques el test:
  averigua si el error está en el código o en la spec y pregúntame.


## Normas
- No hagas commits ni push; los hago yo.
- No refactorices código fuera del alcance de la tarea sin preguntarme.
- No añadas dependencias nuevas sin consultarme.

## Documentación en Confluence
- Espacio: "SDD Sudoku" (key: SS).
- Público: cualquier persona, aunque no sea del equipo ni programe.
  Escribe en español claro, sin jerga; si un término técnico es
  inevitable, añádelo al Glosario.
- Estructura del espacio:
  - Visión del proyecto: qué es, estado actual y próximos pasos.
  - Glosario.
  - Funcionalidades: una página por cada spec de openspec/specs/.
  - Decisiones: decisiones de design.md explicadas en lenguaje llano.
  - Changelog.
- Cada página de funcionalidad sigue esta plantilla:
  1. En pocas palabras (2-3 frases).
  2. Cómo funciona, con ejemplos concretos.
  3. Reglas de juego decididas.
  4. Qué no hace todavía.
  5. Especificación técnica completa, en un bloque desplegable al final.
- Tras cada /opsx:archive: actualiza la funcionalidad afectada, añade
  sus decisiones a "Decisiones", añade una entrada al Changelog
  ("qué cambia para el jugador", en lenguaje llano) y actualiza el
  estado en "Visión del proyecto".
- Las specs del repo son la fuente de verdad; Confluence es solo un reflejo.