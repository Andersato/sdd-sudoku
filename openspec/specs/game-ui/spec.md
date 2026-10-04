# game-ui Specification

## Purpose

Da al jugador una interfaz web para empezar una partida de sudoku eligiendo su dificultad, ver el tablero generado y jugarlo seleccionando celdas y escribiendo o borrando números.

## Requirements

### Requirement: Selección de dificultad en la pantalla inicial
El sistema SHALL mostrar, al cargar la aplicación, una pantalla inicial con las tres opciones de dificultad ("fácil", "medio", "difícil"), y SHALL, al elegir una, generar un planteamiento nuevo para esa dificultad y pasar a la pantalla de juego con ese planteamiento.

#### Scenario: Elegir una dificultad genera una partida nueva
- **WHEN** el jugador elige el nivel "fácil" en la pantalla inicial
- **THEN** el sistema genera un planteamiento de dificultad "fácil" y muestra la pantalla de juego con ese planteamiento

#### Scenario: Las tres dificultades están disponibles al cargar la aplicación
- **WHEN** se carga la aplicación por primera vez
- **THEN** la pantalla inicial muestra las tres opciones "fácil", "medio" y "difícil", todas seleccionables

### Requirement: Aviso de generación en curso
El sistema SHALL mostrar un aviso de que el planteamiento se está generando mientras dura esa generación, y SHALL ignorar cualquier elección de dificultad que se haga mientras la generación esté en curso, incluida una nueva elección del mismo nivel que se está generando, hasta que esa generación termine (con éxito o con error).

#### Scenario: Aviso visible durante la generación
- **WHEN** el jugador elige un nivel de dificultad y la generación del planteamiento todavía no ha terminado
- **THEN** el sistema muestra un aviso de que se está generando el sudoku

#### Scenario: Elegir otra dificultad mientras se genera no tiene efecto
- **WHEN** el jugador elige un nivel de dificultad y, antes de que termine la generación, intenta elegir un nivel distinto
- **THEN** el sistema no inicia una segunda generación ni cambia la dificultad elegida originalmente

#### Scenario: Elegir de nuevo el mismo nivel mientras se genera no tiene efecto
- **WHEN** el jugador elige un nivel de dificultad y, antes de que termine la generación, vuelve a elegir ese mismo nivel
- **THEN** el sistema no inicia una segunda generación

### Requirement: Error de generación con opción de reintentar o elegir otra dificultad
El sistema SHALL, cuando la generación del planteamiento termina en error, mostrar un mensaje comprensible del problema junto con una opción para volver a intentar la generación con la misma dificultad, sin necesidad de recargar la página; SHALL además dejar seleccionables, en esa misma pantalla de error, los otros dos niveles de dificultad, igual que en la pantalla inicial.

#### Scenario: La generación falla y se ofrece reintentar
- **WHEN** la generación del planteamiento para la dificultad elegida termina en error
- **THEN** el sistema muestra un mensaje comprensible del error y una opción para reintentar la generación con esa misma dificultad

#### Scenario: Reintentar tras un error relanza la generación
- **WHEN** el jugador usa la opción de reintentar tras un error de generación
- **THEN** el sistema inicia una nueva generación para la misma dificultad y vuelve a mostrar el aviso de generación en curso

#### Scenario: Elegir otra dificultad desde la pantalla de error inicia una generación nueva
- **WHEN** la generación para una dificultad termina en error y el jugador elige, desde esa pantalla de error, un nivel de dificultad distinto
- **THEN** el sistema inicia una generación nueva para la dificultad recién elegida y muestra el aviso de generación en curso

### Requirement: El tablero distingue celdas fijas de celdas editables
El sistema SHALL mostrar el tablero de 9x9 del planteamiento generado de forma que cada celda fija sea visualmente distinguible de cada celda editable.

#### Scenario: Celdas fijas y editables se ven distintas
- **WHEN** se muestra la pantalla de juego con un planteamiento generado
- **THEN** cada celda fija del planteamiento se muestra con una apariencia distinta a la de las celdas editables

### Requirement: Separación visual de los cuadros de 3x3
El sistema SHALL mostrar el tablero de forma que la separación entre dos cuadros de 3x3 adyacentes sea visualmente más marcada que la separación entre dos celdas dentro del mismo cuadro.

#### Scenario: Separación vertical entre cuadros más marcada que dentro de un cuadro
- **WHEN** se muestra el tablero
- **THEN** el borde entre dos celdas de columnas pertenecientes a cuadros de 3x3 distintos es más grueso que el borde entre dos celdas de columnas del mismo cuadro

#### Scenario: Separación horizontal entre cuadros más marcada que dentro de un cuadro
- **WHEN** se muestra el tablero
- **THEN** el borde entre dos celdas de filas pertenecientes a cuadros de 3x3 distintos es más grueso que el borde entre dos celdas de filas del mismo cuadro

### Requirement: Selección de celda por clic
El sistema SHALL permitir seleccionar, haciendo clic, cualquier celda del tablero (fija o editable), resaltándola como seleccionada; solo puede haber una celda seleccionada a la vez.

#### Scenario: Seleccionar una celda editable
- **WHEN** el jugador hace clic en una celda editable
- **THEN** esa celda queda resaltada como la celda seleccionada

#### Scenario: Seleccionar una celda fija
- **WHEN** el jugador hace clic en una celda fija
- **THEN** esa celda queda resaltada como la celda seleccionada

#### Scenario: Seleccionar otra celda reemplaza la selección anterior
- **WHEN** el jugador, con una celda ya seleccionada, hace clic en otra celda distinta
- **THEN** la celda anterior deja de estar resaltada y la nueva celda queda resaltada como seleccionada

### Requirement: Selección de celda con las flechas del teclado
El sistema SHALL permitir mover la celda seleccionada con las flechas del teclado (arriba, abajo, izquierda, derecha) a la celda adyacente correspondiente dentro del tablero, tanto si la celda de destino es fija como si es editable. Cuando no haya ninguna celda seleccionada, SHALL seleccionar la celda de la esquina superior izquierda del tablero al pulsar cualquier flecha.

#### Scenario: Mover la selección a una celda editable adyacente
- **WHEN** hay una celda seleccionada y el jugador pulsa una flecha del teclado hacia una celda adyacente editable dentro del tablero
- **THEN** la selección se mueve a esa celda adyacente

#### Scenario: Mover la selección a una celda fija adyacente
- **WHEN** hay una celda seleccionada y el jugador pulsa una flecha del teclado hacia una celda adyacente fija dentro del tablero
- **THEN** la selección se mueve a esa celda fija adyacente

#### Scenario: Una flecha hacia fuera del tablero no mueve la selección
- **WHEN** la celda seleccionada está en el borde del tablero y el jugador pulsa la flecha que apunta fuera del tablero
- **THEN** la selección permanece en la misma celda

#### Scenario: Una flecha sin ninguna celda seleccionada selecciona la esquina superior izquierda
- **WHEN** no hay ninguna celda seleccionada y el jugador pulsa cualquier flecha del teclado
- **THEN** la celda de la esquina superior izquierda del tablero (fila 0, columna 0) queda seleccionada

### Requirement: Escribir un número en la celda editable seleccionada
El sistema SHALL, con una celda editable seleccionada, permitir escribir un número del 1 al 9 en esa celda tanto con el teclado físico como con un panel de números en pantalla, con el mismo resultado en ambos casos.

#### Scenario: Escribir un número con el teclado físico
- **WHEN** hay una celda editable seleccionada y el jugador pulsa una tecla numérica del 1 al 9
- **THEN** esa celda pasa a mostrar ese número

#### Scenario: Escribir un número con el panel en pantalla
- **WHEN** hay una celda editable seleccionada y el jugador pulsa el botón de un número del 1 al 9 en el panel de números
- **THEN** esa celda pasa a mostrar ese número, igual que si se hubiera escrito con el teclado físico

#### Scenario: Escribir un número reemplaza el valor anterior de la celda
- **WHEN** hay una celda editable seleccionada que ya tiene un número, y el jugador escribe un número distinto
- **THEN** la celda pasa a mostrar el número nuevo en lugar del anterior

### Requirement: Borrar el valor de la celda editable seleccionada
El sistema SHALL, con una celda editable seleccionada que tiene un número, permitir borrar ese número tanto con las teclas Backspace o Delete del teclado físico como con un botón de borrar en el panel de números, con el mismo resultado en ambos casos.

#### Scenario: Borrar con el teclado físico
- **WHEN** hay una celda editable seleccionada con un número y el jugador pulsa Backspace o Delete
- **THEN** esa celda queda vacía

#### Scenario: Borrar con el botón del panel
- **WHEN** hay una celda editable seleccionada con un número y el jugador pulsa el botón de borrar del panel de números
- **THEN** esa celda queda vacía, igual que si se hubiera borrado con el teclado físico

### Requirement: Entradas sin efecto sobre el tablero
El sistema SHALL ignorar, sin modificar el tablero ni mostrar ningún mensaje de error, cualquier intento de escribir o borrar un número cuando no sea aplicable: una tecla que no sea un número del 1-9 ni Backspace/Delete ni una flecha, un número o un borrado sin ninguna celda seleccionada, o un número o un borrado con una celda fija seleccionada.

#### Scenario: Tecla no válida no cambia nada
- **WHEN** el jugador pulsa una tecla que no es un número del 1 al 9, ni Backspace, ni Delete, ni una flecha (por ejemplo, una letra o un símbolo)
- **THEN** el tablero no cambia y no se muestra ningún mensaje de error

#### Scenario: Escribir un número sin ninguna celda seleccionada no cambia nada
- **WHEN** no hay ninguna celda seleccionada y el jugador pulsa una tecla numérica del 1 al 9 o el botón de un número en el panel
- **THEN** el tablero no cambia y no se muestra ningún mensaje de error

#### Scenario: Escribir un número con una celda fija seleccionada no cambia nada
- **WHEN** hay una celda fija seleccionada y el jugador pulsa una tecla numérica del 1 al 9 o el botón de un número en el panel
- **THEN** el valor de esa celda fija no cambia y no se muestra ningún mensaje de error

#### Scenario: Borrar con una celda fija seleccionada no cambia nada
- **WHEN** hay una celda fija seleccionada y el jugador pulsa Backspace, Delete o el botón de borrar del panel
- **THEN** el valor de esa celda fija no cambia y no se muestra ningún mensaje de error

#### Scenario: Borrar sin ninguna celda seleccionada no cambia nada
- **WHEN** no hay ninguna celda seleccionada y el jugador pulsa Backspace, Delete o el botón de borrar del panel
- **THEN** el tablero no cambia y no se muestra ningún mensaje de error

### Requirement: Empezar una nueva partida
El sistema SHALL mostrar, durante la pantalla de juego, un control para empezar una nueva partida que vuelve a la pantalla inicial de selección de dificultad; SHALL pedir confirmación antes de abandonar la partida en curso si, en el momento de usar ese control, hay algún número puesto por el jugador en alguna celda editable del tablero, y SHALL volver directamente a la pantalla inicial sin pedir confirmación si no hay ninguno en ese momento (incluido el caso de haber escrito y borrado números antes, sin dejar ninguno puesto).

#### Scenario: Nueva partida sin números puestos vuelve directamente
- **WHEN** el jugador usa el control de nueva partida y, en ese momento, ninguna celda editable tiene un número puesto por el jugador
- **THEN** el sistema vuelve a la pantalla inicial de selección de dificultad sin pedir confirmación

#### Scenario: Escribir y borrar todos los números no pide confirmación
- **WHEN** el jugador escribió números en una o más celdas editables, los borró todos, y después usa el control de nueva partida
- **THEN** el sistema vuelve a la pantalla inicial de selección de dificultad sin pedir confirmación

#### Scenario: Nueva partida con algún número puesto pide confirmación
- **WHEN** el jugador usa el control de nueva partida y, en ese momento, al menos una celda editable tiene un número puesto por el jugador
- **THEN** el sistema pide confirmación antes de volver a la pantalla inicial

#### Scenario: Confirmar el abandono vuelve a la pantalla inicial
- **WHEN** el jugador confirma que quiere abandonar la partida en curso
- **THEN** el sistema vuelve a la pantalla inicial de selección de dificultad

#### Scenario: Cancelar el abandono mantiene la partida en curso
- **WHEN** el jugador, tras pedírsele confirmación, decide no abandonar la partida
- **THEN** el sistema permanece en la pantalla de juego con el tablero y los números tal como estaban

### Requirement: Uso en pantallas de móvil sin desplazamiento horizontal
El sistema SHALL mostrar el tablero y el panel de números de forma que puedan usarse completamente en un ancho de pantalla de 360 píxeles sin que aparezca desplazamiento horizontal.

#### Scenario: Sin desplazamiento horizontal a 360 píxeles de ancho
- **WHEN** la pantalla de juego se muestra en una ventana de 360 píxeles de ancho
- **THEN** el tablero y el panel de números son completamente visibles y usables sin que la página necesite desplazamiento horizontal

### Requirement: Disposición ordenada del panel de números
El sistema SHALL mostrar los botones del panel de números (del 1 al 9, y el de borrar) distribuidos en filas completas, sin dejar ningún botón suelto en una fila con menos botones que las demás mientras el ancho disponible permita colocarlos todos en el mismo número de filas completas.

#### Scenario: El panel de números no deja botones sueltos
- **WHEN** se muestra el panel de números en la pantalla de juego
- **THEN** los diez botones (1-9 y borrar) se distribuyen en filas completas del mismo tamaño, sin ninguna fila con menos botones que las demás
