# Proposal

## Why

Ahora mismo el jugador puede rellenar el tablero, pero el juego no le dice nada: no ve cuándo repite un número, no sabe si ha terminado bien y no tiene idea del tiempo que lleva. El tablero ya sabe calcular los conflictos y la paleta ya tiene reservados los colores de error y de éxito, así que es el momento de usarlos para que el jugador sepa cómo va su partida.

## What Changes

- **Marcas de error**: toda casilla cuyo número se repite en su fila, columna o cuadro 3x3 se marca como error, sea del jugador o fija. La marca es el número en el color de error y subrayado, para no depender solo del color. Las marcas se actualizan en cuanto cambia el tablero: aparecen al crear el conflicto y desaparecen al resolverlo.
- **Partida completada**: cuando las 81 casillas tienen número y no hay ningún conflicto, el juego lo detecta y muestra un mensaje de éxito en el color de éxito, en dos líneas: "¡Sudoku resuelto!" y "Tiempo: 12:34". Como los planteamientos generados tienen solución única, un tablero lleno y sin conflictos es exactamente esa solución.
- **Tablero bloqueado tras completar**: con la partida completada ya no se puede escribir ni borrar. "Nueva partida" vuelve a la pantalla inicial sin pedir confirmación.
- **Temporizador**: se muestra en la pantalla de juego, sin etiqueta, desde que aparece el tablero, empezando en 00:00, con formato MM:SS (H:MM:SS a partir de una hora). Se pausa mientras la página no está visible (otra pestaña, ventana minimizada) y se reanuda al volver; perder el foco sin que la página se oculte no lo pausa. Se detiene al completar la partida y se reinicia en cada partida nueva.
- **Paleta**: los colores de error y éxito dejan de estar "sin usar". El de error solo se usa en las marcas de error y el de éxito solo en el mensaje de partida completada.

### Fuera del alcance

- Comparar con la solución: un número que no se repite pero no es el correcto no se marca como error. Solo se detectan repeticiones.
- Contador de errores, límite de errores o penalizaciones de tiempo.
- Botón para pausar o reanudar el temporizador a mano.
- Guardar la partida o el tiempo al recargar la página; récords o mejores tiempos.
- Pistas, notas o candidatos en las casillas.
- Resaltar la fila, columna o cuadro donde está la repetición; solo se marcan las casillas implicadas.
- Animaciones o sonidos de celebración al completar. La regla de animaciones de visual-style (solo en botones) no cambia.
- Desactivar visualmente el panel de números tras completar; los botones siguen visibles, pero no tienen efecto.

## Capabilities

### New Capabilities
- `game-feedback`: información al jugador sobre el estado de su partida en curso: marcas de error en las casillas en conflicto, detección y aviso de partida completada con bloqueo del tablero, y temporizador de juego.

### Modified Capabilities
- `sudoku-board`: nuevo requisito para consultar si el tablero está completado correctamente (81 casillas con número y sin conflictos).
- `game-ui`: "Escribir un número en la celda editable seleccionada" y "Borrar el valor de la celda editable seleccionada" solo se aplican mientras la partida no esté completada; "Entradas sin efecto sobre el tablero" incluye escribir o borrar con la partida completada; "Empezar una nueva partida" no pide confirmación si la partida está completada; "Uso en pantallas de móvil sin desplazamiento horizontal" incluye el temporizador y el mensaje de partida completada.
- `visual-style`: "Paleta con acento y colores reservados" pasa de "no usarse todavía" a un uso restringido; "Colores de los números del tablero" añade la excepción de los números en error; "Estados de celda distinguibles sin depender solo del color" añade el estado de error; "Contraste mínimo del texto" incluye los números en error, el temporizador y el mensaje de partida completada.

## Impact

- Código del core (`src/core/board/`): nueva consulta de tablero completado, apoyada en la consulta de conflictos que ya existe (`getConflicts`).
- Código de la UI (`src/ui/`): `boardView.ts` (marcas de error, dibujo del temporizador y del mensaje de éxito, bloqueo de entrada), nuevo `timer.ts` (cuenta y formato del tiempo), `app.ts` (vida del temporizador: arranque, pausa, parada), `styles.css` (estilos de error, éxito y temporizador) y `navigation.ts` (confirmación de nueva partida). `state.ts` no cambia: la partida completada se deduce del tablero y el tiempo vive fuera del estado.
- El temporizador necesita un reloj y un aviso de visibilidad de la página inyectables para poder probarlo sin esperar tiempo real.
- Riesgo: añadir el temporizador y el mensaje encima o debajo del tablero puede romper la regla de 360x640 sin desplazamiento vertical; se resolverá en el diseño.
- Tests: unitarios de la consulta de completado y del formato del tiempo; funcionales de marcas de error, partida completada, bloqueo, temporizador (con reloj simulado) y contraste. Los tests existentes de visual-style que comprueban que los colores reservados no se usan deben adaptarse a la nueva regla, y hay que revisar los tests e2e existentes que escriben números por si alguno crea un conflicto sin querer.
- Dependencias: ninguna nueva.
- Pendiente para design.md: cómo sobrevive el temporizador a los repintados (la pantalla de juego se reconstruye en cada acción), si se conserva la fracción de segundo al pausar, el color del subrayado de error, cómo cambia la decisión de pedir confirmación en "Nueva partida" y cómo se representa la partida completada en el estado de la aplicación.
