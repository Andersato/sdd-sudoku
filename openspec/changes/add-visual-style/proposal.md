# Proposal

## Why

La interfaz actual solo usa los estilos mínimos del navegador (fondo blanco, botones por defecto, un azul claro para la selección). Funciona, pero tiene un aspecto pobre y poco cuidado. Queremos un estilo visual propio, oscuro, moderno y legible antes de añadir funcionalidades que dependen de él, como los avisos de error y de partida resuelta. Esas funcionalidades necesitan colores reservados en la paleta.

## What Changes

- Tema oscuro fijo en toda la aplicación (pantalla inicial y pantalla de juego): fondo gris azulado muy oscuro (no negro puro), sin opción de tema claro.
- Paleta con un único color de acento vivo, que se usa en la casilla seleccionada, en los números del jugador y en los botones principales (dificultades, números del panel y "Reintentar"). Los números fijos se muestran en blanco.
- "Borrar" y "Nueva partida" llevan un estilo secundario, más discreto y sin color de acento.
- Colores reservados en la paleta para "error" y "éxito". Este cambio no los usa en pantalla; los usará un cambio posterior.
- Contraste de nivel WCAG AA: al menos 4,5:1 para el texto y al menos 3:1 para los indicadores visuales no textuales (contorno de la casilla seleccionada y bordes de los botones).
- Las celdas fijas, las editables vacías, los números del jugador y la casilla seleccionada se distinguen sin depender solo del color, por ejemplo mediante el grosor de letra, el fondo o un contorno.
- Esquinas redondeadas, sombras suaves y un ligero brillo alrededor de la casilla seleccionada.
- Los botones responden de forma visible al pasar el ratón por encima, al pulsarlos y al recibir el foco del teclado. Los botones desactivados se ven claramente desactivados.
- Animaciones sutiles (transiciones de selección y de botones) que se desactivan cuando el sistema pide reducir el movimiento.
- Tipografía del sistema, sin fuentes externas ni dependencias nuevas.
- Se mantiene el uso a 360 píxeles de ancho sin desplazamiento horizontal, también en la pantalla inicial.

### Fuera del alcance

- Mostrar errores de jugada (números repetidos) o el aviso de sudoku resuelto. Solo se reservan sus colores.
- Tema claro o selector de tema.
- Marcar como activa una dificultad u otro botón de forma persistente. "Activo" se refiere solo al estilo de los botones principales y a su aspecto mientras se pulsan.
- Cambios de comportamiento en la interacción: selección, escritura, borrado, nueva partida y generación siguen exactamente igual.
- Resaltar la fila, la columna, el cuadro o los números iguales a los de la casilla seleccionada.
- Sustituir el diálogo nativo de confirmación de "Nueva partida" por uno propio. El diálogo nativo no se puede estilizar y se queda como está.
- Iconos, logotipo e ilustraciones.

## Capabilities

### New Capabilities
- `visual-style`: estilo visual de la aplicación. Cubre el tema oscuro, la paleta (con acento y colores reservados de error y éxito), el contraste mínimo, la diferenciación de estados de celda sin depender solo del color, la jerarquía y la respuesta visual de los botones, las animaciones y su desactivación con movimiento reducido, y la tipografía del sistema.

### Modified Capabilities
- `game-ui`: el requisito "El tablero distingue celdas fijas de celdas editables" se endurece para que la diferencia no dependa solo del color y para que también se distingan las celdas editables con número del jugador. El requisito "Uso en pantallas de móvil sin desplazamiento horizontal" se amplía a la pantalla inicial y al botón "Nueva partida".

## Impact

- Código: `src/ui/styles.css` (rediseño completo) y pequeños ajustes de marcado en `src/ui/boardView.ts`, `src/ui/numberPanel.ts` y `src/ui/startScreen.ts` (atributos para distinguir las celdas con número del jugador y los botones principales de los secundarios). `index.html` necesita la etiqueta `meta viewport` para que el diseño a 360 píxeles funcione en móviles reales. Ahora no la tiene.
- Lógica del juego (`src/core/`): sin cambios.
- Tests: nuevos tests funcionales (Playwright) de contraste, estados visuales, movimiento reducido y ancho de 360 píxeles. Los tests existentes deben seguir pasando. Los tests de 360 píxeles usan la emulación de dispositivo móvil de Playwright (`isMobile`) para detectar si falta la etiqueta `meta viewport`. Todo texto tiene un fondo sólido detrás para que los tests de contraste sean fiables.
- Dependencias: ninguna nueva.
