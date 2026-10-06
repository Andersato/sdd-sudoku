# Design

## Context

El motivo y el alcance están en proposal.md; los requisitos, en las specs del cambio. Del código actual importa esto:

- `src/core/board/conflicts.ts` ya tiene `getConflicts(board)`, que devuelve todas las celdas en conflicto (incluidas las fijas). Cubre la detección de errores y la mitad de la detección de partida completada.
- `src/ui/app.ts` guarda un único `AppState` en un cierre y, en cada `dispatch`, vuelve a dibujar la pantalla entera: `renderGameScreen` (`src/ui/boardView.ts`) vacía el contenedor y reconstruye el tablero, el panel y "Nueva partida", y devuelve el foco al tablero.
- La lógica de entrada está en funciones puras probadas con Vitest sin DOM: `handleDigit` y `handleErase` (`boardView.ts`) y `shouldConfirmNewGame` (`navigation.ts`).
- La paleta (`src/ui/styles.css`) ya define `--color-error: #f87171` y `--color-success: #4ade80`. El error da 5,29:1 sobre `--color-surface` y 4,52:1 sobre `--color-surface-selected`; el éxito, 8,40:1 sobre `--color-surface`.
- El CSS ya usa `[role="status"]` para el aviso "Generando...", y los tests e2e lo buscan por ese rol.
- Los tests e2e dan el planteamiento a la aplicación con `installPuzzleHook`/`gotoGameScreen` (`e2e/helpers.ts`), así que se puede empezar una partida casi resuelta.
- `e2e/contrast.spec.ts` tiene el test "los colores reservados no aparecen en ninguna pantalla", que esta spec cambia.

## Goals / Non-Goals

**Goals:**
- Que la regla de "partida completada" viva en `src/core/` y se pruebe sin interfaz.
- Un temporizador que se pueda probar sin esperar tiempo real, tanto en Vitest como en Playwright.
- Que el temporizador no se reinicie ni se desincronice con los repintados completos de la pantalla de juego.
- No cambiar la forma de dibujar la pantalla (sigue reconstruyéndose en cada acción).

**Non-Goals:**
- Dibujar solo las partes que cambian del tablero.
- Guardar el tiempo o el estado entre recargas.
- Animar la aparición del mensaje o de las marcas.

## Decisions

### D1. Consulta `isSolved(board)` en el core

Nuevo archivo `src/core/board/solved.ts` con `isSolved(board): boolean`: devuelve `true` si las 81 celdas tienen valor y `getConflicts(board)` está vacío. No modifica el tablero.

- *Alternativa descartada:* comparar con la solución del solver. Es más caro, depende de otra capacidad y, con solución única, da el mismo resultado.

### D2. "Completada" se deduce del tablero, no se guarda en el estado

No se añade ningún campo a `AppState`. Cualquier parte que necesite saber si la partida está completada llama a `isSolved(state.board)`:
- `handleDigit` y `handleErase` devuelven el mismo tablero si `isSolved(board)`. Así el bloqueo vale igual para el teclado y para el panel, y `applyDigit`/`applyErase` no hacen `dispatch` porque el tablero no cambia.
- `shouldConfirmNewGame(board)` devuelve `false` si `isSolved(board)`.
- `renderGameScreen` muestra el mensaje si `isSolved(state.board)`.
- La selección (clic y flechas) no pasa por esas funciones y sigue funcionando.

- *Alternativa descartada:* un campo `completed` en el estado de juego. Duplica información que ya está en el tablero y podría quedar desincronizado.

### D3. Marcas de error con un atributo y CSS

`renderGameScreen` calcula `getConflicts(state.board)` una vez por repintado y pone `data-conflict="true"` en esas celdas. En `styles.css`, después de la regla de las celdas fijas:

```css
[role="gridcell"][data-conflict="true"] {
  color: var(--color-error);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
```

- No se toca `font-weight`, así que el grosor 700/400 se conserva.
- La regla de la celda seleccionada no cambia `color`, así que una celda seleccionada en conflicto muestra la marca y el contorno de selección a la vez.
- El subrayado no declara color: hereda `currentColor`, que es el color de error del propio número. Esto cumple "el color de error solo en el texto de los números en error".
- Como se recalcula en cada repintado a partir del tablero, las marcas aparecen y desaparecen al momento sin lógica adicional.

### D4. Temporizador: lógica pura en `src/ui/timer.ts`

Dos piezas sin DOM, probadas con Vitest:

- `formatElapsed(ms): string`. Usa `Math.floor(ms / 1000)` segundos completos y da `MM:SS` por debajo de 3600 s y `H:MM:SS` a partir de ahí (horas sin relleno, así que 10 horas dan "10:00:00").
- `createGameTimer(now: () => number)`. Devuelve un objeto con `pause()`, `resume()`, `stop()`, `elapsedMs()` e `isStopped()`. Guarda los milisegundos acumulados y el instante en que empezó el tramo actual. Al pausar suma el tramo con su fracción de segundo, así que 40,7 s pausados siguen siendo 40,7 s al reanudar. `stop()` es definitivo: después, `resume()` no hace nada.

Va en `src/ui/` y no en `src/core/` porque no es una regla del sudoku, sino de la sesión de juego. No es una dependencia nueva.

- *Alternativa descartada:* contar ticks de `setInterval`. Se desvía con el tiempo y los navegadores lo ralentizan en pestañas ocultas.

### D5. El temporizador vive en `mount`, fuera del `AppState`

`AppDeps` añade dos dependencias opcionales con valores por defecto:
- `now: () => number`, por defecto `() => performance.now()`.
- `visibility: { isHidden(): boolean; subscribe(cb: () => void): () => void }`. `subscribe` llama a `cb` cada vez que cambia la visibilidad y devuelve la función que cancela la suscripción; `cb` no recibe argumentos y consulta `isHidden()`. La versión por defecto usa `document.visibilityState === "hidden"` (no `document.hidden`, porque es `visibilityState` lo que redefine la simulación de D7) y el evento `visibilitychange` de `document`.

En `mount`:
- **Al entrar en la pantalla de juego** (en `dispatch`, cuando el estado anterior no era de juego y el nuevo sí): se crea un temporizador nuevo, que empieza a cero (si la página está oculta, empieza pausado). Se suscribe a la visibilidad: con la página oculta llama a `pause()` y al volver a ser visible llama a `resume()`. Se arranca un `setInterval` de 250 ms que solo cambia el texto del elemento del temporizador, sin repintar la pantalla. En cada tic busca ese elemento con `container.querySelector('[data-testid="timer"]')`, sin guardar ninguna referencia: cada repintado crea un elemento nuevo, y una referencia guardada dejaría el temporizador congelado tras el primer clic. Si no lo encuentra, no hace nada.
- **En cada `dispatch` en la pantalla de juego:** si `isSolved(next.board)`, se llama a `stop()` antes de repintar, de modo que el mensaje y el temporizador muestran el mismo tiempo.
- **Al salir de la pantalla de juego:** se cancela el intervalo y la suscripción a la visibilidad.

`renderGameScreen` recibe en `GameScreenContext` una función `elapsedMs()` y escribe `formatElapsed(elapsedMs())` al dibujar. Así el repintado no reinicia el temporizador ni lo hace saltar. Solo se escucha `visibilitychange`, no `blur`/`focus`, así que perder el foco con la página visible no pausa el temporizador.

Cancelar el diálogo de "Nueva partida" no hace `dispatch`, así que el temporizador no se toca. El diálogo nativo bloquea los scripts, pero como el tiempo se mide con el reloj y no con ticks, ese tiempo cuenta, tal y como pide la spec.

- *Alternativa descartada:* guardar el tiempo en `AppState`. Habría que hacer `dispatch` cada segundo, lo que reconstruiría el tablero y robaría el foco.

### D6. Disposición en la pantalla de juego

Orden de arriba abajo: temporizador, tablero, mensaje de partida completada (solo si hay), panel de números y "Nueva partida".

- **Temporizador:** `<div data-testid="timer">`, centrado, `font-size: 1.125rem` (18 px), `line-height: 1.5` (27 px), `margin: 0 0 0.5rem`, `tabular-nums` (no baila al cambiar de cifra), en `--color-text` sobre el fondo de la página.
- **Mensaje:** `<div data-testid="game-complete" aria-live="polite">` con dos `<p>`: "¡Sudoku resuelto!" y "Tiempo: MM:SS".
  - Estilos: `width: min(100%, 420px)`, `margin: 0.5rem auto 0`, `padding: 0.5rem 1rem`, borde de 1 px `--color-border`, `border-radius: 10px`, fondo sólido `--color-surface`, texto centrado en `--color-success`, `line-height: 1.5`. Los `<p>` llevan `margin: 0`. El color de éxito no se usa en el borde.
  - No usa `role="status"`, para no heredar los estilos ni chocar con los selectores del aviso de generación.
  - *Limitación de `aria-live`:* como la pantalla se reconstruye entera en cada `dispatch`, el mensaje se inserta ya con su texto dentro de una región viva recién creada, y los lectores de pantalla no suelen anunciar esas regiones. `aria-live` se deja porque no hace daño, pero no garantiza el anuncio. La spec no pide anunciar el mensaje; hacerlo bien exigiría una región viva persistente fuera de la pantalla que se repinta, y queda fuera de este cambio.
- **Altura a 360x640** (ancho útil 360 − 2 × 16 = 328 px), con la partida completada:

  | Elemento | Alto |
  |---|---|
  | Relleno superior de la pantalla | 16 |
  | Temporizador (27) + margen inferior (8) | 35 |
  | Tablero (cuadrado de 328) | 328 |
  | Margen superior del mensaje | 8 |
  | Mensaje: 2 líneas × 24 + relleno 16 + borde 2 | 66 |
  | Margen superior del panel (no se colapsa con el del mensaje, que es 0) | 16 |
  | Panel: 2 filas × 44 + hueco 8 | 96 |
  | **Total hasta el final del panel** | **565** |

  Quedan unos 75 px libres en 640. "Nueva partida" va debajo y puede requerir desplazamiento, como permite la spec. Sin el mensaje, el total es 491 px.

### D7. Estrategia de pruebas

- **Vitest:**
  - `isSolved`, con los escenarios de sudoku-board.
  - `formatElapsed` y `createGameTimer`, con un reloj falso.
  - `handleDigit`, `handleErase` y `shouldConfirmNewGame` con un tablero resuelto.
  - En `palette.test.ts`, la comprobación de que el color de error da ≥ 4,5:1 sobre `--color-surface` y `--color-surface-selected`.
- **Playwright:**
  - Nuevo `e2e/gameFeedback.spec.ts`. La partida casi resuelta se prepara con `gotoGameScreen`, dando la solución de referencia del solver con una o dos celdas vacías.
  - El tiempo se controla con `page.clock` (Playwright ≥ 1.45; el proyecto usa 1.63), que simula `performance.now`, `Date` y los temporizadores de la página. Para que los tiempos exactos no dependan de lo que tardan los clics, todos los tests del temporizador siguen este patrón:
    1. `page.clock.install()` antes de `page.goto`.
    2. `page.clock.pauseAt(...)` antes de resolver el planteamiento, de modo que el tablero aparece con el reloj parado.
    3. El tiempo avanza solo con `page.clock.runFor(ms)` (que también dispara el intervalo de 250 ms) o `fastForward`, nunca esperando tiempo real.

    Las aserciones `expect` de Playwright reintentan con temporizadores de Node, así que el reloj simulado de la página no les afecta.
  - La visibilidad se simula redefiniendo `document.visibilityState` y lanzando `visibilitychange` con `page.evaluate`.
- **Integración del temporizador en `mount`:** solo se prueba con Playwright. Vitest se ejecuta sin DOM y añadir jsdom sería una dependencia nueva. La lógica pura del temporizador sí tiene tests unitarios (D4).
- **Tests existentes:** se adapta el test de colores reservados de `e2e/contrast.spec.ts` y se añaden los de 360x640 con temporizador y mensaje en `e2e/responsive.spec.ts`.

## Risks / Trade-offs

- [El error da 4,52:1 sobre la celda seleccionada, muy cerca del mínimo] → Un test de `palette.test.ts` falla si alguien cambia el fondo de selección o el color de error y baja de 4,5:1.
- [El intervalo de 250 ms puede mostrar un segundo nuevo con hasta 250 ms de retraso] → No es perceptible y la spec no fija esa precisión. El tiempo final se calcula con el reloj, no con el intervalo.
- [El mensaje desplaza hacia abajo el panel al aparecer] → Es aceptable: tras completar, el panel no tiene efecto. La altura calculada (D6) sigue cabiendo en 640 px y la verifica un test.
- [`performance.now()` y `page.clock`] → Playwright falsea `performance.now`, `Date` y los temporizadores. Si algún navegador no los falseara, los tests del temporizador fallarían de forma clara, no en silencio.
- [Un planteamiento ya completo al empezar] → El generador nunca lo produce. Si llegara, `isSolved` sería cierto desde el inicio: el temporizador se pararía en 00:00 y saldría el mensaje. Es coherente con la spec.
