# game-feedback Specification

## Purpose

Informa al jugador del estado de su partida en curso: marca las casillas con números repetidos, detecta y anuncia cuándo ha completado el sudoku correctamente, y muestra cuánto tiempo lleva jugando.

## Requirements

### Requirement: Marca de error en las casillas en conflicto
El sistema SHALL marcar como error, en la pantalla de juego, cada casilla cuyo número se repite en otra casilla de su misma fila, columna o cuadro 3x3, tanto si es una casilla del jugador como si es fija. La marca SHALL consistir en mostrar su número en el color de error y subrayado. Ninguna casilla que no esté en conflicto SHALL mostrar esa marca.

#### Scenario: Dos números del jugador repetidos en una fila
- **WHEN** el jugador escribe el mismo número en dos casillas editables de la misma fila
- **THEN** las dos casillas muestran su número en el color de error y subrayado

#### Scenario: Número del jugador repetido con una casilla fija
- **WHEN** el jugador escribe en una casilla editable el mismo número que tiene una casilla fija de su misma columna
- **THEN** tanto la casilla del jugador como la casilla fija muestran su número en el color de error y subrayado

#### Scenario: Número del jugador repetido en su cuadro 3x3
- **WHEN** el jugador escribe en una casilla editable el mismo número que tiene otra casilla de su mismo cuadro 3x3, situada en otra fila y otra columna
- **THEN** las dos casillas muestran su número en el color de error y subrayado

#### Scenario: Las casillas sin conflicto no se marcan
- **WHEN** el único conflicto del tablero es un 5 en la casilla (0,0) y otro 5 en la casilla (0,4)
- **THEN** solo esas dos casillas muestran su número en el color de error y subrayado; ninguna de las otras 79 muestra el color de error ni subrayado

#### Scenario: Un número sin conflicto no se marca
- **WHEN** el jugador escribe en una casilla editable un número que no se repite en su fila, columna ni cuadro 3x3
- **THEN** esa casilla no muestra la marca de error, aunque ese número no sea el de la solución

#### Scenario: La casilla fija marcada conserva su grosor
- **WHEN** una casilla fija está marcada como error
- **THEN** su número sigue mostrándose con grosor de letra 700

#### Scenario: La casilla del jugador marcada conserva su grosor
- **WHEN** una casilla con número del jugador está marcada como error
- **THEN** su número sigue mostrándose con grosor de letra 400

### Requirement: Actualización inmediata de las marcas de error
El sistema SHALL actualizar las marcas de error justo después de cada cambio del tablero (escribir, reemplazar o borrar un número), de modo que en todo momento estén marcadas exactamente las casillas en conflicto.

#### Scenario: La marca desaparece al borrar uno de los números repetidos
- **WHEN** dos casillas están marcadas como error por repetir número entre sí y el jugador borra el número de una de ellas
- **THEN** ninguna de las dos casillas muestra ya la marca de error

#### Scenario: La marca desaparece al reemplazar el número repetido
- **WHEN** dos casillas están marcadas como error por repetir número entre sí y el jugador escribe en una de ellas un número que no se repite en su fila, columna ni cuadro 3x3
- **THEN** ninguna de las dos casillas muestra ya la marca de error

#### Scenario: Una casilla en varios conflictos sigue marcada mientras quede alguno
- **WHEN** el 5 de la casilla (0,0) se repite con un 5 en (0,4) (misma fila) y con un 5 en (4,0) (misma columna), y el jugador borra el 5 de (0,4)
- **THEN** (0,0) y (4,0) siguen marcadas como error y (0,4) queda vacía y sin marca

#### Scenario: Casilla seleccionada en conflicto
- **WHEN** la casilla seleccionada está en conflicto
- **THEN** muestra a la vez la marca de error (número en el color de error y subrayado) y el indicador de casilla seleccionada

### Requirement: Detección y aviso de partida completada
El sistema SHALL considerar completada la partida en cuanto las 81 casillas tienen número y no hay ningún conflicto en el tablero, y SHALL mostrar entonces, en la pantalla de juego, un mensaje en el color de éxito con dos líneas: "¡Sudoku resuelto!" y, debajo, "Tiempo: " seguido del tiempo final en el mismo formato que el temporizador (por ejemplo, "Tiempo: 12:34").

#### Scenario: El último número correcto completa la partida
- **WHEN** solo queda una casilla vacía, no hay conflictos, y el jugador escribe en ella el número que no provoca ningún conflicto
- **THEN** el sistema muestra el mensaje "¡Sudoku resuelto!" con el tiempo final, en el color de éxito

#### Scenario: El mensaje muestra el tiempo final concreto
- **WHEN** el jugador completa la partida con el temporizador marcando 03:07
- **THEN** el mensaje muestra la línea "¡Sudoku resuelto!" y, debajo, la línea "Tiempo: 03:07"

#### Scenario: Tablero lleno con conflictos no se considera completado
- **WHEN** el jugador escribe un número en la última casilla vacía y ese número provoca un conflicto
- **THEN** el sistema no muestra el mensaje de partida completada, marca las casillas en conflicto como error y el temporizador sigue contando

#### Scenario: Corregir un conflicto con el tablero lleno completa la partida
- **WHEN** las 81 casillas tienen número, hay un conflicto, y el jugador reemplaza uno de los números en conflicto por el que no provoca ningún conflicto
- **THEN** el sistema muestra el mensaje "¡Sudoku resuelto!" con el tiempo final

#### Scenario: Partida sin completar no muestra el mensaje
- **WHEN** queda al menos una casilla vacía en el tablero
- **THEN** el sistema no muestra el mensaje de partida completada

### Requirement: Tablero bloqueado tras completar la partida
El sistema SHALL ignorar, sin modificar el tablero ni mostrar ningún mensaje de error, cualquier intento de escribir o borrar un número una vez completada la partida, ya sea con el teclado físico o con el panel de números. La selección de casillas con clic o flechas SHALL seguir funcionando.

#### Scenario: Escribir tras completar no cambia nada
- **WHEN** la partida está completada, la casilla editable seleccionada contiene un 4 y el jugador pulsa la tecla 7 o el botón 7 del panel
- **THEN** la casilla sigue mostrando 4 y el mensaje de partida completada sigue visible

#### Scenario: Borrar tras completar no cambia nada
- **WHEN** la partida está completada, hay una casilla editable seleccionada y el jugador pulsa Backspace, Delete o el botón de borrar del panel
- **THEN** el valor de esa casilla no cambia y el mensaje de partida completada sigue visible

#### Scenario: La selección sigue funcionando tras completar
- **WHEN** la partida está completada y el jugador hace clic en una casilla o pulsa una flecha
- **THEN** la selección cambia igual que durante la partida

### Requirement: Temporizador de la partida
El sistema SHALL mostrar en la pantalla de juego un temporizador, solo con el tiempo de juego transcurrido y sin etiqueta, que empieza en 00:00 al mostrarse el tablero y avanza cada segundo. El formato SHALL ser MM:SS (minutos y segundos con dos cifras) por debajo de una hora y H:MM:SS a partir de una hora, contando solo segundos completos.

#### Scenario: El temporizador empieza a cero
- **WHEN** se muestra la pantalla de juego con un planteamiento recién generado
- **THEN** el temporizador muestra 00:00

#### Scenario: Formato por debajo de una hora
- **WHEN** han transcurrido 75 segundos de juego
- **THEN** el temporizador muestra 01:15

#### Scenario: Solo cuentan los segundos completos
- **WHEN** han transcurrido 59,9 segundos de juego
- **THEN** el temporizador muestra 00:59

#### Scenario: Justo antes de una hora
- **WHEN** han transcurrido 3599 segundos de juego
- **THEN** el temporizador muestra 59:59

#### Scenario: Formato a partir de una hora
- **WHEN** han transcurrido 3725 segundos de juego
- **THEN** el temporizador muestra 1:02:05

#### Scenario: Formato a partir de diez horas
- **WHEN** han transcurrido 36000 segundos de juego
- **THEN** el temporizador muestra 10:00:00

#### Scenario: El temporizador sigue contando con la partida sin completar
- **WHEN** el temporizador marca 00:10, el jugador escribe un 3 en una casilla editable, lo borra y pasan 5 segundos más
- **THEN** el temporizador marca 00:15

### Requirement: Pausa del temporizador con la página no visible
El sistema SHALL detener el temporizador mientras la página no está visible para el jugador (por ejemplo, en otra pestaña o con la ventana minimizada) y SHALL reanudarlo desde el mismo valor cuando vuelve a estar visible, sin contar el tiempo que estuvo oculta.

#### Scenario: El tiempo oculto no cuenta
- **WHEN** el temporizador marca 00:40, la página deja de estar visible durante 30 segundos y vuelve a estar visible
- **THEN** el temporizador sigue marcando 00:40 al volver y continúa avanzando desde ahí

#### Scenario: Tablero mostrado con la página oculta
- **WHEN** el tablero se muestra mientras la página no está visible (por ejemplo, la generación termina con el jugador en otra pestaña) y la página pasa a ser visible 20 segundos después
- **THEN** en ese momento el temporizador marca 00:00 y empieza a avanzar desde ahí

#### Scenario: Perder el foco sin ocultarse no pausa el temporizador
- **WHEN** el temporizador marca 00:40 y la ventana pierde el foco durante 30 segundos pero la página sigue visible
- **THEN** el temporizador marca 01:10, porque ha seguido contando

#### Scenario: Ocultar la página con la partida completada no cambia nada
- **WHEN** la partida está completada y la página deja de estar visible y vuelve a estarlo
- **THEN** el temporizador y el mensaje de partida completada muestran el mismo tiempo final que antes

### Requirement: Detención del temporizador al completar la partida
El sistema SHALL detener el temporizador en el momento en que la partida queda completada, y SHALL mostrar a partir de entonces ese mismo tiempo final, tanto en el temporizador como en el mensaje de partida completada.

#### Scenario: El temporizador se detiene al completar
- **WHEN** el jugador completa la partida con el temporizador marcando 12:34 y pasan después 10 segundos
- **THEN** el temporizador sigue marcando 12:34 y el mensaje de partida completada muestra "Tiempo: 12:34"

### Requirement: Reinicio del temporizador en cada partida
El sistema SHALL empezar el temporizador desde 00:00 en cada partida nueva y SHALL mantenerlo sin reiniciar cuando el jugador cancela el abandono de la partida en curso.

#### Scenario: Una partida nueva empieza a cero
- **WHEN** el jugador vuelve a la pantalla inicial con "Nueva partida" y elige una dificultad
- **THEN** al mostrarse el tablero nuevo el temporizador marca 00:00 y no se muestra el mensaje de partida completada

#### Scenario: Cancelar el abandono no reinicia el temporizador
- **WHEN** el temporizador marca 03:00, el jugador usa "Nueva partida", se le pide confirmación y cancela
- **THEN** el temporizador sigue avanzando desde al menos 03:00, sin volver a 00:00
