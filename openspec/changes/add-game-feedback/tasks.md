# Tasks

## 1. Core: partida completada

- [ ] 1.1 Crear `src/core/board/solved.ts` con `isSolved(board)` (D1): `true` si las 81 celdas tienen valor y `getConflicts(board)` está vacío. Verificar con `src/core/board/solved.test.ts` (Vitest) los escenarios de "Consulta de tablero completado correctamente" de sudoku-board:
  - planteamiento de referencia del solver más su solución en las celdas editables → `true`;
  - tras borrar una celda editable → `false`;
  - tras colocar un 5 en (0,2) → `false`;
  - tablero vacío → `false`;
  - el tablero no cambia tras la consulta (comparación profunda antes y después).

## 2. Temporizador: lógica pura

- [ ] 2.1 Crear `src/ui/timer.ts` con `formatElapsed(ms)` (D4). Verificar con `src/ui/timer.test.ts`: 0 → "00:00", 75 000 → "01:15", 59 900 → "00:59", 3 599 000 → "59:59", 3 725 000 → "1:02:05", 36 000 000 → "10:00:00".
- [ ] 2.2 Añadir a `src/ui/timer.ts` `createGameTimer(now)` con `pause`, `resume`, `stop`, `elapsedMs` e `isStopped` (D4). Verificar en `src/ui/timer.test.ts` con un reloj falso:
  - avanza con el reloj;
  - pausado no avanza (40 s, pausa, +30 s → 40 s);
  - conserva la fracción al pausar (40 700 ms, pausa y reanuda → 40 700 ms);
  - `stop()` congela el valor y un `resume()` posterior no lo reanuda;
  - pausar o reanudar dos veces seguidas no altera el valor.

## 3. Marcas de error

- [ ] 3.1 En `renderGameScreen` (`src/ui/boardView.ts`), poner `data-conflict="true"` en las celdas de `getConflicts(state.board)`, añadir a `src/ui/styles.css` la regla de D3 y actualizar el comentario de los colores reservados de la paleta (ya no "no se usan todavía": el error se usa en las marcas y el éxito en el mensaje). Verificar en el nuevo `e2e/gameFeedback.spec.ts` los escenarios de "Marca de error en las casillas en conflicto": fila entre dos números del jugador, columna con una casilla fija, cuadro 3x3, solo (0,0) y (0,4) marcadas entre las 81, número sin conflicto sin marca, y grosor 700 (fija) y 400 (jugador) conservados con la marca. La marca se comprueba como color computado igual a `--color-error` y `text-decoration-line` que incluye `underline`.
- [ ] 3.2 Verificar en `e2e/gameFeedback.spec.ts` los escenarios de "Actualización inmediata de las marcas de error": desaparece al borrar, desaparece al reemplazar, la casilla en varios conflictos ((0,0), (0,4), (4,0)) y la casilla seleccionada en conflicto (marca más contorno y brillo de acento).
- [ ] 3.3 Verificar en Playwright los escenarios de visual-style que afectan a las marcas:
  - en `e2e/cellStates.spec.ts`: "Número en error en el color de error" (fija y del jugador, seleccionada y sin seleccionar), "El número recupera su color al resolverse el conflicto" y "Una celda en error se distingue sin depender del color";
  - en `e2e/contrast.spec.ts`: "Número en error legible" y "Número en error legible dentro de la casilla seleccionada".
- [ ] 3.4 En `src/ui/palette.test.ts`, añadir que `--color-error` da ≥ 4,5:1 sobre `--color-surface` y sobre `--color-surface-selected` (riesgo de D7). Verificar con `npm test`.

## 4. Partida completada y bloqueo

- [ ] 4.1 Hacer que `handleDigit` y `handleErase` (`src/ui/boardView.ts`) devuelvan el mismo tablero si `isSolved(board)`, y que `shouldConfirmNewGame` (`src/ui/navigation.ts`) devuelva `false` en ese caso (D2). Verificar con Vitest, en `boardView.test.ts` y `navigation.test.ts`, que con un tablero resuelto ambas funciones devuelven el mismo objeto, y que `shouldConfirmNewGame` da `false` aunque haya números del jugador. Verificar también que los tests existentes siguen pasando.
- [ ] 4.2 Mostrar en `renderGameScreen` el mensaje de D6 (`data-testid="game-complete"`, dos líneas, colores y fondo de D6) cuando `isSolved(state.board)`. El tiempo se toma de `ctx.elapsedMs()`: `GameScreenContext` gana ese campo ya en esta tarea, y `app.ts` pasa `elapsedMs: () => 0` provisional hasta la 5.1, para que el proyecto compile entre grupos. Añadir sus estilos a `styles.css`. Verificar en `e2e/gameFeedback.spec.ts`:
  - "El último número correcto completa la partida";
  - "Tablero lleno con conflictos no se considera completado" (sin mensaje y con marcas);
  - "Corregir un conflicto con el tablero lleno completa la partida";
  - "Partida sin completar no muestra el mensaje".
- [ ] 4.3 Verificar en `e2e/gameFeedback.spec.ts` los escenarios de "Tablero bloqueado tras completar la partida", y en `e2e/numberInput.spec.ts` y `e2e/newGame.spec.ts` los escenarios nuevos de game-ui:
  - una casilla con 4 sigue con 4 tras pulsar la tecla 7 y el botón 7;
  - borrar con Backspace, Delete y el botón no cambia nada;
  - la selección con clic y con flechas sigue funcionando;
  - "Escribir o borrar con la partida completada no cambia nada";
  - "Nueva partida con la partida completada vuelve directamente": no aparece el diálogo de confirmación.

## 5. Temporizador en la pantalla de juego

- [ ] 5.1 Añadir `now` y `visibility` a `AppDeps` con sus valores por defecto, y la gestión del temporizador en `mount` (`src/ui/app.ts`) según D5. Esto incluye: crearlo al entrar en la pantalla de juego (pausado si la página está oculta), pausar y reanudar con `visibilitychange`, pararlo cuando `isSolved`, un intervalo de 250 ms que actualiza solo `[data-testid="timer"]`, y la limpieza al salir. Pasar `elapsedMs` a `renderGameScreen` y dibujar el temporizador encima del tablero con los estilos de D6. Verificar que `npm run build` pasa y que los tests e2e existentes siguen pasando.
- [ ] 5.2 Verificar en `e2e/gameFeedback.spec.ts`, con el patrón de reloj de D7 (`install` antes de `goto`, `pauseAt` antes de resolver el planteamiento y avance solo con `runFor`/`fastForward`), los escenarios de "Temporizador de la partida":
  - empieza en 00:00;
  - 75 s → 01:15;
  - 3725 s → 1:02:05;
  - de 00:10 se escribe y se borra un 3, +5 s → 00:15.

  Los formatos límite (59,9 s, 3599 s, 36000 s) ya los cubre 2.1.
- [ ] 5.3 Verificar en `e2e/gameFeedback.spec.ts`, con el mismo patrón de reloj de D7, los escenarios de "Pausa del temporizador con la página no visible", simulando la visibilidad con `page.evaluate`: redefinir `document.visibilityState` y lanzar `visibilitychange` en `document`.
  - el tiempo oculto no cuenta (00:40 → oculta 30 s → 00:40);
  - el tablero mostrado con la página oculta y visible 20 s después → 00:00;
  - perder el foco sin ocultarse (evento `blur` en `window`, 30 s) → 01:10;
  - ocultar la página con la partida completada no cambia el tiempo.
- [ ] 5.4 Verificar en `e2e/gameFeedback.spec.ts`, con el mismo patrón de reloj de D7:
  - "El temporizador se detiene al completar": completar en 12:34, +10 s, el temporizador sigue en 12:34 y el mensaje dice "Tiempo: 12:34";
  - "El mensaje muestra el tiempo final concreto": "¡Sudoku resuelto!" y "Tiempo: 03:07" en dos líneas;
  - "Una partida nueva empieza a cero", sin mensaje;
  - "Cancelar el abandono no reinicia el temporizador": de 03:00, se cancela el diálogo y el temporizador marca ≥ 03:00.
- [ ] 5.5 Verificar en `e2e/contrast.spec.ts` los escenarios "Temporizador legible" y "Mensaje de partida completada legible" (≥ 4,5:1 sobre un fondo sólido).

## 6. Adaptación de tests existentes y pantallas de móvil

- [ ] 6.1 Adaptar en `e2e/contrast.spec.ts` el test de colores reservados a la nueva regla de "Paleta con acento y colores reservados":
  - sin conflictos ni partida completada, ningún elemento usa error ni éxito en ninguna pantalla;
  - con casillas en conflicto, el error solo aparece en el `color` de esas celdas;
  - con la partida completada, el éxito solo aparece en el `color` del contenedor `[data-testid="game-complete"]` y de sus `<p>`, que lo heredan.

  Verificar con `npm run test:e2e -- contrast`.
- [ ] 6.2 Revisar los tests e2e existentes que escriben números (`numberInput`, `cellStates`, `newGame`, `integration`, `motion`, `contrast`, `buttons`, etc.) por si crean conflictos sin querer y ahora comprueban un color que ha cambiado. Si alguno falla con un ejemplo de la spec, no cambiar el test sin consultar. Verificar que toda la suite e2e pasa.
- [ ] 6.3 Ampliar `e2e/responsive.spec.ts` a 360x640 con `isMobile`:
  - el temporizador, el tablero y el panel caben sin desplazamiento horizontal ni vertical;
  - con la partida completada, el mensaje, el temporizador, el tablero y el panel caben sin desplazamiento;
  - "Nueva partida" sigue siendo alcanzable.

## 7. Integración

- [ ] 7.1 Ejecutar `npm test`, `npm run test:e2e` y `npm run build`, y verificar que todo pasa sin avisos de TypeScript.
- [ ] 7.2 Jugar una partida de principio a fin con un planteamiento casi resuelto (test de `e2e/integration.spec.ts`): crear un conflicto, ver la marca, corregirlo, completar, ver el mensaje con el tiempo y el temporizador parado, comprobar que no se puede escribir, y usar "Nueva partida" sin diálogo hasta llegar a un temporizador a 00:00.
