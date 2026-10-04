# Proposal

## Why

La interfaz actual solo usa los estilos mínimos del navegador (fondo blanco, botones por defecto, un azul claro para la selección). Funciona, pero tiene un aspecto pobre y poco cuidado. Queremos un estilo visual propio, oscuro, moderno y legible antes de añadir funcionalidades que dependen de él, como los avisos de error y de partida resuelta. Esas funcionalidades necesitan colores reservados en la paleta.

## What Changes

- Tema oscuro fijo en toda la aplicación (pantalla inicial, generación, error y juego): fondo gris azulado muy oscuro (no negro puro), sin opción de tema claro.
- Paleta con nombre para cada color y un único color de acento. El acento se usa en la casilla seleccionada, en los números del jugador y en los botones principales (dificultades, números del panel y "Reintentar"). Los números fijos se muestran en blanco.
- "Borrar" y "Nueva partida" llevan un estilo secundario sin color de acento en ningún estado. Los botones desactivados tampoco usan el acento.
- Colores reservados en la paleta para "error" y "éxito". Este cambio no los usa en ningún sitio, tampoco en el mensaje de error de generación; los usará un cambio posterior.
- Contraste de nivel WCAG AA: al menos 4,5:1 para el texto (3:1 en botones desactivados) y al menos 3:1 para los indicadores no textuales: contorno de la casilla seleccionada, indicadores de foco y límites de los botones.
- La casilla seleccionada se marca con un contorno sólido de acento más un brillo decorativo. Las celdas no reaccionan al pasar el ratón.
- El número fijo se muestra en negrita (grosor 700) y el del jugador en grosor normal (400). Así se distinguen sin depender solo del color.
- El tablero muestra un indicador de foco propio cuando se llega a él con el teclado.
- Esquinas redondeadas y sombras suaves en el tablero y los botones.
- Los botones responden de forma visible al pasar el ratón por encima, al pulsarlos y al recibir el foco del teclado, y vuelven a su aspecto anterior al terminar.
- Animaciones sutiles solo en los botones. La selección de celdas cambia sin animación. Todas las transiciones se desactivan cuando el sistema pide reducir el movimiento.
- Tipografía del sistema, sin fuentes externas ni dependencias nuevas.
- Uso completo en un móvil de referencia de 360x640 píxeles sin desplazamiento horizontal, también en la pantalla inicial, la de generación y la de error.

### Fuera del alcance

- Mostrar errores de jugada (números repetidos) o el aviso de sudoku resuelto. Solo se reservan sus colores.
- Tema claro o selector de tema.
- Marcar como activa una dificultad u otro botón de forma persistente. "Activo" se refiere solo al estilo de los botones principales y a su aspecto mientras se pulsan.
- Animar el cambio de casilla seleccionada. Exigiría cambiar cómo se dibuja el tablero, que ahora se reconstruye en cada acción.
- Efectos en las celdas al pasar el ratón.
- Aspecto específico al tocar en pantallas táctiles, más allá del que el navegador aplique por su cuenta.
- Cambios de comportamiento en la interacción: selección, escritura, borrado, nueva partida y generación siguen exactamente igual.
- Resaltar la fila, la columna, el cuadro o los números iguales a los de la casilla seleccionada.
- Sustituir el diálogo nativo de confirmación de "Nueva partida" por uno propio. El diálogo nativo no se puede estilizar y se queda como está.
- Iconos, logotipo e ilustraciones.

## Capabilities

### New Capabilities
- `visual-style`: estilo visual de la aplicación. Cubre el tema oscuro, la paleta (con acento y colores reservados de error y éxito), el contraste mínimo, el indicador de la casilla seleccionada, la jerarquía y la respuesta visual de los botones, el foco del tablero, la forma y la profundidad, las animaciones y su desactivación con movimiento reducido, y la tipografía del sistema.

### Modified Capabilities
- `game-ui`: el requisito "El tablero distingue celdas fijas de celdas editables" exige ahora una diferencia que no sea solo de color (grosor 700 frente a 400, también con la celda seleccionada). El requisito "Uso en pantallas de móvil sin desplazamiento horizontal" fija la pantalla de referencia en 360x640 píxeles y se amplía a todas las pantallas y al botón "Nueva partida".

## Impact

- Código: `src/ui/styles.css` (rediseño completo) y pequeños ajustes de marcado en `src/ui/numberPanel.ts`, `src/ui/startScreen.ts` y `src/ui/boardView.ts` para distinguir los botones principales de los secundarios. `index.html` necesita la etiqueta `meta viewport` para que el diseño a 360 píxeles funcione en móviles reales. Ahora no la tiene.
- Lógica del juego (`src/core/`): sin cambios.
- Tests: nuevos tests funcionales (Playwright) de contraste, estados visuales, foco, movimiento reducido y 360x640 píxeles, y tests unitarios del cálculo de contraste. Los tests de 360 píxeles usan la emulación de dispositivo móvil de Playwright (`isMobile`) para detectar si falta la etiqueta `meta viewport`. Todo texto tiene un fondo sólido detrás para que los tests de contraste sean fiables. Los tests existentes deben seguir pasando.
- Dependencias: ninguna nueva.
