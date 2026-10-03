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
- Ciclo de cada cambio: /opsx:propose → agente spec-reviewer → el usuario
    responde las decisiones → corregir artefactos → /opsx:apply → agente
    test-writer → agente code-reviewer → /opsx:archive → Confluence.
- No ejecutes /opsx:apply hasta que el spec-reviewer dé "Lista para
  implementar" y el usuario lo confirme.