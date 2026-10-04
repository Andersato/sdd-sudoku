# Design

## Context

No existe código de interfaz todavía: `src/main.ts` está vacío y no hay `src/ui/`. El proyecto no tiene ningún framework de UI (`package.json` solo trae Vite/Vitest/TypeScript) ni Playwright instalado. La lógica que esta pantalla consume ya existe y está archivada: `createEmptyBoard`/`createBoardFromPuzzle`/`place`/`clear` en `src/core/board/`, y `generatePuzzle({ difficulty, seed })` en `src/core/generator/`, donde `difficulty` es `Difficulty = "easy" | "medium" | "hard"`. `generatePuzzle` es **síncrona**: no devuelve una promesa, y puede tardar hasta 2 segundos en el peor caso de las semillas de referencia. Ver `proposal.md` para el porqué y el alcance; ver `specs/game-ui/spec.md` para los requisitos.

## Goals / Non-Goals

**Goals:**
- Una arquitectura simple sin framework (TypeScript + DOM), coherente con el resto del proyecto y sin añadir dependencias de UI.
- Poder mostrar el aviso "Generando..." antes de que la llamada (síncrona y potencialmente lenta) al generador bloquee el hilo principal.
- Poder provocar de forma determinista, en un test Playwright, tanto el estado "Generando..." como el estado de error de generación, sin depender de que el generador real tarde o falle por azar.
- Separar la lógica de interacción (qué celda queda seleccionada, si hace falta confirmar "Nueva partida") en funciones puras testeables con Vitest, dejando el DOM como una capa fina alrededor.
- Que los tests (Vitest y Playwright) puedan identificar cada casilla y su estado mediante atributos estables, sin depender de clases CSS ni de estilos visuales.

**Non-Goals:**
- Usar un Web Worker para que la generación no bloquee nunca el hilo principal; se acepta un bloqueo breve (ver Riesgos).
- Cualquier diseño visual detallado (colores, tipografía) más allá de lo que exige la spec (distinguir fijas/editables, caber en 360px).
- Accesibilidad más allá de la navegación con teclado ya exigida por la spec y de los atributos ARIA usados como ganchos de test (sin lectores de pantalla completos, etc.).
- Persistir el estado de la partida entre recargas (fuera de alcance según `proposal.md`).

## Decisions

### Sin framework: TypeScript + DOM con un único estado mutable y renderizado completo
La UI se organiza como un pequeño "controlador" con un objeto de estado (`AppState`) y funciones de renderizado que reconstruyen el DOM relevante cada vez que el estado cambia (no hay virtual DOM ni reconciliación: el tablero es pequeño — 81 celdas — así que volver a pintar la pantalla activa en cada cambio es barato y mucho más simple que gestionar actualizaciones parciales a mano).

Alternativa considerada: introducir una librería de UI (React, Preact, lit-html...). Se descarta porque `CLAUDE.md` exige no añadir dependencias nuevas sin consultar, y la complejidad de esta pantalla no lo justifica.

### Dos pantallas controladas por un estado de aplicación con máquina de estados explícita
`AppState` es una unión discriminada con un campo `screen`:
- `{ screen: "start"; status: "idle" }`
- `{ screen: "start"; status: "generating"; difficulty }`
- `{ screen: "start"; status: "error"; difficulty; message }`
- `{ screen: "game"; board: Board; puzzleDifficulty: Difficulty; selected: Coord | null }`

`board` es siempre un `Board` (de `src/core/board/types.ts`, el mismo tipo que usan `place`/`clear`), nunca el array crudo que devuelve el generador.

Las transiciones relevantes:
- `idle`/`error` + elegir dificultad → `generating`
- `generating` + elegir cualquier dificultad (incluida la misma) → sin efecto (se ignora mientras `status === "generating"`)
- `generating` + generación con éxito (planteamiento crudo `(number | null)[][]`) → se convierte con `createBoardFromPuzzle(puzzle)` (de `src/core/board/create.ts`) para obtener el `Board` con cada celda marcada `fixed`, y solo entonces se entra en `screen: "game"` con ese `Board`. Esta conversión ocurre en el mismo punto donde se recibe el resultado de `generatePuzzleAsync` (no dentro de `generatePuzzleAsync` ni del generador), para mantener `src/core/generator/` ajeno a `src/core/board/`.
- `generating` + generación con error → `error` (con mensaje y la dificultad que falló, para el reintento)
- `error` + "reintentar" → `generating` con la misma dificultad; `error` + elegir otra dificultad → `generating` con la nueva
- `game` + "Nueva partida" sin números del jugador en el tablero → `idle` directamente
- `game` + "Nueva partida" con algún número del jugador → confirmación nativa (`window.confirm`); si se acepta, → `idle`; si se cancela, el estado no cambia

Alternativa considerada: modelar el estado de carga/error con banderas sueltas (`isLoading`, `error`) en vez de una unión discriminada. Se descarta porque permite estados imposibles (p. ej. `isLoading && error` a la vez) que esta spec explícitamente prohíbe (ignorar nuevas elecciones mientras se genera).

### La UI usa el tipo `Difficulty` del generador directamente; `src/ui/difficulty.ts` solo aporta las etiquetas visibles
Siguiendo la norma de `CLAUDE.md` de código en inglés, la UI no define un tipo de dificultad propio: usa `Difficulty` (`"easy" | "medium" | "hard"`) importado de `src/core/generator/` en todo su estado y lógica. `src/ui/difficulty.ts` define únicamente el mapeo a etiquetas visibles en español:

```ts
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};
```

Así no hace falta ningún paso de traducción antes de llamar a `generatePuzzle`, y solo hay un lugar (este módulo) que conoce las etiquetas en español.

### La llamada al generador se envuelve para diferir su ejecución y para ser sustituible en tests
Para que el aviso "Generando..." llegue a pintarse antes de que la llamada síncrona y potencialmente lenta a `generatePuzzle` bloquee el hilo, la UI nunca llama a `generatePuzzle` directamente desde el manejador de clic. En su lugar usa una función inyectada con esta forma:

```ts
type GeneratePuzzleAsync = (options: GeneratorOptions) => Promise<(number | null)[][]>;
```

(`(number | null)[][]` es el tipo real que devuelve `generatePuzzle`; no existe ningún tipo `Puzzle` en `src/core/`. La conversión a `Board` — con la marca `fixed` por celda — ocurre después, con `createBoardFromPuzzle`, como se describe en la decisión anterior.)

La implementación por defecto (`src/ui/generatePuzzleAsync.ts`) envuelve la función real y espera a que el navegador haya tenido oportunidad de pintar el aviso "Generando..." antes de ejecutar la llamada bloqueante:

```ts
function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function defaultGeneratePuzzleAsync(options: GeneratorOptions): Promise<(number | null)[][]> {
  await waitForNextPaint();
  return generatePuzzle(options);
}
```

Un único `requestAnimationFrame` se ejecuta *antes* de que el navegador pinte el frame actual, así que no basta para garantizar que "Generando..." ya es visible. Encadenar dos `requestAnimationFrame` asegura que el primer callback corre ya después de un pintado, y es en el segundo callback (tras ese pintado) donde se continúa con la generación real. `setTimeout(0)` no ofrece esta garantía: el navegador puede ejecutar el timeout sin haber pintado ningún frame de por medio, especialmente si la pestaña no está en primer plano o el motor decide posponer el repintado.

El controlador de la app recibe esta función como una dependencia (`AppDeps.generatePuzzleAsync`), con el valor por defecto de producción, pero sustituible. Para los tests Playwright, `src/main.ts` comprueba, antes de montar la app, si existe `window.__sudokuTestGeneratePuzzle__` (una función que el test instala con `page.addInitScript` antes de navegar) y, si existe, la usa en lugar de la real:

```ts
const generatePuzzleAsync = window.__sudokuTestGeneratePuzzle__ ?? defaultGeneratePuzzleAsync;
```

Esto permite que un test controle exactamente cuánto tarda la generación (para comprobar el aviso "Generando...") o que falle (para comprobar la pantalla de error), sin depender de la aleatoriedad o del tiempo real del generador. No se oculta tras una variable de entorno de build porque esta aplicación no tiene secretos ni autenticación que proteger: es un seam de pruebas explícito y documentado, no una puerta trasera de producción con riesgo real.

Alternativa considerada: mockear el módulo `src/core/generator` a nivel de bundle para los tests end-to-end. Se descarta porque Playwright ejecuta la app ya compilada en un navegador real; sustituir un módulo ES importado estáticamente requeriría una build de test distinta (más infraestructura) en vez de un simple hook de `window` previo a la navegación.

### Navegación con flechas y escritura/borrado como funciones puras, separadas del DOM
La lógica de "a qué celda me muevo" y "qué pasa al pulsar esta tecla" vive en funciones puras testeables con Vitest, sin tocar el DOM:

- `nextSelection(current: Coord | null, key: ArrowKey): Coord` — con `current = null` devuelve siempre `{ row: 0, col: 0 }`; con `current` no `null`, devuelve la celda adyacente en esa dirección, o la misma celda si está en el borde.
- `shouldConfirmNewGame(board: Board): boolean` — recorre el tablero y devuelve `true` si alguna celda no fija tiene un valor no nulo en ese momento (no guarda historial: es una función del estado actual del tablero, tal como pide la spec).

Una única capa delgada en `src/ui/boardView.ts` traduce eventos DOM (`keydown`, `click`) a llamadas a estas funciones puras y a `place`/`clear` de `src/core/board/mutate.ts`, y vuelve a renderizar.

Alternativa considerada: resolver la navegación y la confirmación directamente dentro de los manejadores de eventos DOM. Se descarta porque mezclar la lógica con el DOM obliga a testear todo con Playwright (más lento, menos preciso para casos límite como "flecha en el borde") en vez de con Vitest.

### El contenedor del tablero recibe el foco del teclado al entrar en la pantalla de juego
El contenedor del tablero (el elemento con `role="grid"`) lleva `tabindex="0"` y recibe `.focus()` justo después de montarse al entrar en `screen: "game"`. El manejador de `keydown` (flechas, 1-9, Backspace, Delete) se adjunta a ese contenedor, no a `document` ni a cada celda por separado. Así:
- El jugador puede navegar con las flechas y escribir con el teclado físico nada más empezar la partida, sin necesidad de hacer clic antes en ninguna celda (necesario para el escenario de la spec "sin ninguna celda seleccionada, una flecha selecciona la esquina superior izquierda").
- En Playwright, `page.keyboard.press(...)` despacha al elemento con foco; los tests que teclean sin clic previo dependen de que ese `.focus()` automático haya ocurrido al montar la pantalla de juego.

El manejador llama a `event.preventDefault()` para las cuatro flechas (evita que la página haga scroll) y para Backspace/Delete (evita que el navegador interprete Backspace como "atrás" cuando el foco no está en un campo de texto). No se llama a `preventDefault()` para ninguna otra tecla, de modo que el resto del comportamiento nativo del navegador (recarga, atajos, etc.) no se ve afectado.

Alternativa considerada: adjuntar el listener a `document` y comprobar en cada pulsación si la pantalla activa es `game`. Se descarta porque mezclaría la gestión del foco entre pantallas y complicaría quitar el listener al volver a `idle`; un listener propio del contenedor del tablero se añade y se quita junto con su ciclo de vida.

### Entrada dual (teclado y panel) comparte un único manejador
Tanto las teclas numéricas/Backspace/Delete como los botones del panel de números llaman a las mismas dos funciones (`handleDigit(value)` y `handleErase()`), que a su vez comprueban "¿hay celda seleccionada? ¿es editable?" antes de llamar a `place`/`clear`; si no se cumplen las condiciones, no hacen nada (sin mostrar error), igual que una tecla no reconocida simplemente no se despacha a ningún manejador.

### Confirmación de "Nueva partida" con `window.confirm()` nativo
Al pulsar "Nueva partida", la capa de DOM llama a `shouldConfirmNewGame(board)` (función pura, ver más abajo): si devuelve `false`, se despacha la transición a `idle` directamente; si devuelve `true`, se llama de forma síncrona a `window.confirm(mensaje)` con el texto fijo:

> "Hay una partida en curso. Si empiezas una nueva, perderás lo que has escrito. ¿Quieres continuar?"

Si el jugador acepta, se despacha la transición a `idle`; si cancela, no se despacha nada y el estado no cambia. No existe una función pura `requestNewGame` ni un estado intermedio "pendiente de confirmación" en `AppState`: la decisión de mostrar o no el diálogo, y la llamada al diálogo en sí, viven enteramente en la capa de DOM del botón "Nueva partida" (`src/ui/boardView.ts` o un módulo equivalente), apoyándose solo en `shouldConfirmNewGame` y en la transición `confirmNewGame`/`idle` ya existente.

Se usa el diálogo nativo del navegador en vez de construir un modal propio porque es síncrono, no requiere maquetación ni estilos, y Playwright puede interceptarlo y responder (aceptar/cancelar) de forma determinista con `page.on("dialog", ...)`.

Alternativa considerada: un modal propio en HTML/CSS. Se descarta por ahora para mantener el alcance pequeño; si en el futuro se quiere una confirmación con estilo propio, es un cambio de UI aislado.

### Identificación de casillas para los tests: ARIA + atributos de datos, no clases CSS
El tablero se marca con `role="grid"` y cada casilla con `role="gridcell"`, para que la estructura sea identificable independientemente de cómo se vea. Cada celda lleva además:
- `data-row` y `data-col` (0-8): su posición, estable y legible por los tests sin depender del orden del DOM.
- `data-fixed="true"|"false"`: si es una celda fija del planteamiento o editable por el jugador.
- `aria-selected="true"` únicamente en la celda actualmente seleccionada (las demás celdas no llevan el atributo, o lo llevan como `"false"`).

Un test Playwright localiza una celda con un selector como `[role="gridcell"][data-row="0"][data-col="0"]`, y comprueba la selección con `[aria-selected="true"]`, sin depender de ninguna clase CSS (que queda libre para cambiar el aspecto visual sin romper tests). Las clases CSS siguen existiendo para el estilo (distinguir fija/editable, resaltar selección), pero ningún test se apoya en su nombre.

### Responsive a 360px con CSS Grid y unidades relativas, sin JavaScript
El tablero se dimensiona con `aspect-ratio: 1` y un ancho basado en `min(92vw, 420px)` (o equivalente), con `CSS Grid` de 9x9 fracciones iguales; el panel de números usa `flex-wrap` para no desbordar. No hace falta JavaScript para el layout: es puro CSS, verificado con el test Playwright a 360px de ancho que ya pide la spec.

## Risks / Trade-offs

- [Riesgo] `generatePuzzle` sigue siendo síncrona y bloquea el hilo principal durante la generación real (hasta ~2s en el peor caso), incluso con el doble `requestAnimationFrame` previo → Mitigación: la espera a dos frames solo garantiza que "Generando..." ya se pintó *antes* de bloquear, no que la página siga respondiendo *durante* el bloqueo; se acepta como no-goal (ver Non-Goals) porque un Web Worker añade complejidad fuera de alcance, y el presupuesto de rendimiento del generador (<2s en las semillas de referencia) ya limita cuánto puede durar.
- [Riesgo] Si la pestaña pasa a segundo plano justo después de pedir la generación, los navegadores suelen pausar `requestAnimationFrame` hasta que la pestaña vuelve a estar visible, por lo que la generación (y la transición a la pantalla de juego o de error) queda pospuesta hasta ese momento → Mitigación: aceptado; es el comportamiento esperable de cualquier animación o tarea basada en `requestAnimationFrame`, y no deja al jugador en un estado inconsistente, solo en pausa.
- [Riesgo] Los tests Playwright que usan `window.__sudokuTestGeneratePuzzle__` con una generación simulada (una promesa que se resuelve/rechaza tras un `setTimeout` controlado) **no** detectan una regresión en la espera de pintado real: la función simulada no bloquea el hilo principal como lo haría `generatePuzzle`, así que un cambio que rompiera el doble `requestAnimationFrame` (por ejemplo, volviendo a un único `setTimeout(0)`) podría seguir pasando esos tests aunque en producción el aviso "Generando..." no llegara a pintarse a tiempo con el generador real → Mitigación: aceptado como limitación conocida; si se quisiera cubrir esto, haría falta un test adicional que use el `generatePuzzleAsync` por defecto (sin simular) y mida que el DOM se actualiza antes de que la llamada bloqueante termine, lo cual queda fuera de este cambio.
- [Riesgo] El hook `window.__sudokuTestGeneratePuzzle__` es un seam de pruebas visible en el bundle de producción → Mitigación: no hay datos sensibles ni autenticación en esta app; el hook no tiene efecto salvo que algo externo lo asigne antes de que `main.ts` se ejecute, lo que en producción nunca ocurre.
- [Riesgo] Repintar toda la pantalla activa en cada cambio de estado podría notarse si el árbol DOM creciera mucho → Mitigación: el tablero tiene un tamaño fijo y pequeño (81 celdas); no se espera ningún problema de rendimiento perceptible.
- [Riesgo] `window.confirm()` bloquea el hilo y no se puede estilizar → Mitigación: aceptado explícitamente (ver Decisión); la spec no exige una apariencia concreta para la confirmación.

## Migration Plan

Cambio aditivo sin datos que migrar: no hay almacenamiento persistente hoy. Pasos de despliegue:
1. Añadir Playwright (`@playwright/test`) como dependencia de desarrollo y su configuración (`playwright.config.ts`), con un script `test:e2e` separado de `test` (Vitest).
2. Implementar `src/ui/` y conectar `src/main.ts` para montar la app en `#app` (ya presente en `index.html`).
3. Si algo falla en producción, revertir el commit es suficiente: no hay esquema de datos ni migraciones que deshacer.
