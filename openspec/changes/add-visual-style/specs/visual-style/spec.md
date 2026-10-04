# Spec Delta

## Purpose

Define el aspecto visual de la aplicación: un tema oscuro fijo con una paleta común, contraste legible, estados de celda y de botón reconocibles sin depender solo del color, y animaciones sutiles que respetan la preferencia de movimiento reducido.

## ADDED Requirements

### Requirement: Tema oscuro fijo
El sistema SHALL mostrar todas sus pantallas (inicial, generación en curso, error de generación y juego) con un fondo gris azulado muy oscuro que no sea negro puro, independientemente de la preferencia de tema claro u oscuro del sistema operativo.

#### Scenario: Fondo oscuro en la pantalla inicial
- **WHEN** se carga la aplicación
- **THEN** el fondo de la página es un color oscuro con un componente azul mayor que el rojo y que no es negro puro (#000000)

#### Scenario: Fondo oscuro en la pantalla de juego
- **WHEN** se muestra la pantalla de juego
- **THEN** el fondo de la página es el mismo color oscuro que en la pantalla inicial

#### Scenario: El tema no cambia con la preferencia clara del sistema
- **WHEN** se carga la aplicación con el sistema operativo configurado con preferencia de tema claro
- **THEN** la aplicación se muestra con el mismo fondo oscuro que con preferencia de tema oscuro

### Requirement: Paleta con acento y colores reservados
El sistema SHALL definir una paleta única con un color de fondo, un color de texto principal (blanco), un color de acento vivo, un color de error y un color de éxito. El color de error y el de éxito SHALL ser distintos entre sí, distintos del acento y SHALL cumplir al menos 4,5:1 de contraste sobre el fondo, aunque ninguna pantalla los use todavía.

#### Scenario: Los colores reservados están definidos y son distintos
- **WHEN** se inspecciona la paleta definida por la aplicación
- **THEN** existen un color de error y un color de éxito, distintos entre sí y distintos del color de acento

#### Scenario: Los colores reservados son legibles sobre el fondo
- **WHEN** se calcula el contraste del color de error y del color de éxito sobre el color de fondo
- **THEN** ambos contrastes son de al menos 4,5:1

#### Scenario: Los colores reservados no aparecen todavía en pantalla
- **WHEN** se recorren la pantalla inicial, la de generación en curso, la de error de generación y la de juego
- **THEN** ningún elemento visible usa el color de éxito, y el color de error no se usa en el tablero ni en el panel de números

### Requirement: Contraste mínimo del texto
El sistema SHALL mostrar todo el texto visible (números del tablero, botones, títulos, avisos y mensajes de error) con un contraste de al menos 4,5:1 respecto a su fondo inmediato, en cualquier estado del elemento salvo el de botón desactivado.

#### Scenario: Número fijo legible
- **WHEN** se muestra una celda fija sin seleccionar
- **THEN** el contraste entre el color de su número y el fondo de la celda es de al menos 4,5:1

#### Scenario: Número del jugador legible
- **WHEN** se muestra una celda editable con un número puesto por el jugador, sin seleccionar
- **THEN** el contraste entre el color de su número y el fondo de la celda es de al menos 4,5:1

#### Scenario: Número del jugador legible dentro de la casilla seleccionada
- **WHEN** la celda seleccionada es una celda editable con un número puesto por el jugador
- **THEN** el contraste entre el color de su número y el fondo de la celda seleccionada es de al menos 4,5:1

#### Scenario: Número fijo legible dentro de la casilla seleccionada
- **WHEN** la celda seleccionada es una celda fija
- **THEN** el contraste entre el color de su número y el fondo de la celda seleccionada es de al menos 4,5:1

#### Scenario: Texto de los botones legible en reposo, al pasar el ratón y al pulsar
- **WHEN** se muestra cualquier botón habilitado (dificultades, números del panel, "Borrar", "Nueva partida", "Reintentar") en reposo, con el ratón encima o mientras se pulsa
- **THEN** el contraste entre el texto del botón y su fondo es de al menos 4,5:1 en cada uno de esos estados

#### Scenario: Mensaje de error de generación legible
- **WHEN** se muestra el mensaje de error de generación
- **THEN** el contraste entre el texto del mensaje y su fondo es de al menos 4,5:1

### Requirement: Contraste mínimo de los indicadores no textuales
El sistema SHALL mostrar el indicador de la casilla seleccionada, el indicador de foco del teclado y el borde o el fondo que delimita cada botón habilitado con un contraste de al menos 3:1 respecto a los colores adyacentes.

#### Scenario: Indicador de selección visible
- **WHEN** hay una celda seleccionada
- **THEN** el contorno que la marca tiene un contraste de al menos 3:1 respecto al fondo de las celdas no seleccionadas que la rodean

#### Scenario: Límite del botón visible
- **WHEN** se muestra un botón habilitado
- **THEN** su borde o su fondo tiene un contraste de al menos 3:1 respecto al fondo sobre el que está colocado

### Requirement: Estados de celda distinguibles sin depender solo del color
El sistema SHALL mostrar las celdas fijas, las editables vacías, las editables con número del jugador y la celda seleccionada de forma que cada estado se distinga de los demás por al menos una diferencia que no sea de color: grosor de letra, presencia de contorno o brillo, o contenido.

#### Scenario: Celda seleccionada frente a no seleccionada
- **WHEN** hay una celda seleccionada
- **THEN** la celda seleccionada muestra un contorno o un brillo que ninguna celda no seleccionada tiene

#### Scenario: Cada estado difiere de los demás en una propiedad medible que no es el color
- **WHEN** el tablero muestra a la vez una celda fija sin seleccionar, una editable vacía sin seleccionar, una editable con número del jugador sin seleccionar y una celda seleccionada
- **THEN** para cada pareja de esos cuatro estados se cumple al menos una de estas diferencias: distinto grosor de letra del número, presencia de contorno o brillo en una y no en la otra, o distinto contenido (una vacía y la otra con número)

### Requirement: Uso del color de acento
El sistema SHALL usar el color de acento en el indicador de la casilla seleccionada, en los números puestos por el jugador y en los botones principales (dificultades, números del panel y "Reintentar"), y SHALL mostrar los números fijos en blanco.

#### Scenario: Número del jugador en color de acento
- **WHEN** el jugador escribe un número en una celda editable
- **THEN** ese número se muestra con el color de acento

#### Scenario: Número fijo en blanco
- **WHEN** se muestra una celda fija
- **THEN** su número se muestra en blanco

#### Scenario: Casilla seleccionada con acento
- **WHEN** hay una celda seleccionada
- **THEN** su contorno o su brillo usa el color de acento

### Requirement: Jerarquía de botones principales y secundarios
El sistema SHALL mostrar los botones principales (dificultades, números del panel y "Reintentar") con el color de acento, y los botones secundarios ("Borrar" y "Nueva partida") con un estilo más discreto que no use el color de acento en reposo.

#### Scenario: Botón principal con acento
- **WHEN** se muestra un botón de dificultad, un botón de número del panel o el botón "Reintentar"
- **THEN** su fondo o su borde usa el color de acento

#### Scenario: Botón secundario sin acento
- **WHEN** se muestra el botón "Borrar" o el botón "Nueva partida" en reposo
- **THEN** ni su fondo, ni su borde, ni su texto usan el color de acento

### Requirement: Respuesta visual de los botones
El sistema SHALL cambiar visiblemente el aspecto de cada botón habilitado al pasar el ratón por encima, al pulsarlo y al recibir el foco del teclado, y SHALL mostrar los botones desactivados con un aspecto distinto que no reaccione al ratón.

#### Scenario: Cambio al pasar el ratón
- **WHEN** el jugador pasa el ratón por encima de un botón habilitado
- **THEN** el aspecto del botón (fondo, borde, sombra o brillo) cambia respecto a su estado de reposo

#### Scenario: Cambio al pulsar
- **WHEN** el jugador mantiene pulsado un botón habilitado
- **THEN** el aspecto del botón cambia respecto a su estado con el ratón encima

#### Scenario: Foco del teclado visible
- **WHEN** un botón recibe el foco mediante la tecla Tab
- **THEN** el botón muestra un indicador de foco visible que no tiene en reposo

#### Scenario: Botón desactivado
- **WHEN** los botones de dificultad están desactivados porque hay una generación en curso
- **THEN** se muestran con un aspecto distinto del de reposo habilitado, y pasar el ratón por encima no cambia su aspecto

### Requirement: Forma y profundidad
El sistema SHALL mostrar el tablero, los botones y la casilla seleccionada con esquinas redondeadas y sombras suaves, sin que el redondeo de las celdas interiores impida ver la separación entre cuadros de 3x3.

#### Scenario: Esquinas redondeadas
- **WHEN** se muestra la pantalla de juego
- **THEN** el contorno exterior del tablero y los botones tienen esquinas redondeadas

#### Scenario: La casilla seleccionada tiene brillo
- **WHEN** hay una celda seleccionada
- **THEN** la celda seleccionada muestra un brillo o una sombra de color de acento a su alrededor

#### Scenario: El redondeo no borra la separación entre cuadros de 3x3
- **WHEN** se muestra el tablero con el redondeo aplicado
- **THEN** el borde entre dos celdas de cuadros de 3x3 distintos sigue siendo más grueso que el borde entre dos celdas del mismo cuadro, tanto en horizontal como en vertical

### Requirement: Animaciones sutiles
El sistema SHALL animar los cambios de aspecto de la casilla seleccionada y de los botones con transiciones de 250 milisegundos como máximo, que no retrasen ni bloqueen la respuesta a las acciones del jugador.

#### Scenario: Transición en los botones
- **WHEN** el jugador pasa el ratón por encima de un botón habilitado, sin preferencia de movimiento reducido
- **THEN** el cambio de aspecto se produce con una transición de duración mayor que 0 y de 250 milisegundos como máximo

#### Scenario: Las animaciones no retrasan la jugada
- **WHEN** el jugador escribe un número en la celda seleccionada mientras hay una transición en curso
- **THEN** el número aparece en la celda sin esperar a que termine la transición

### Requirement: Movimiento reducido
El sistema SHALL desactivar todas las animaciones y transiciones cuando el sistema operativo indique preferencia por reducir el movimiento, sin perder ninguna de las diferencias visuales entre estados.

#### Scenario: Sin transiciones con movimiento reducido
- **WHEN** se carga la aplicación con la preferencia de reducir movimiento activada y el jugador pasa el ratón por un botón o cambia la celda seleccionada
- **THEN** el cambio de aspecto es inmediato, sin transición ni animación

#### Scenario: Los estados siguen distinguiéndose con movimiento reducido
- **WHEN** se carga la aplicación con la preferencia de reducir movimiento activada
- **THEN** la celda seleccionada sigue mostrando su contorno o brillo y los botones siguen cambiando de aspecto al pasar el ratón y al pulsarlos

### Requirement: Tipografía del sistema
El sistema SHALL usar exclusivamente las fuentes instaladas en el sistema operativo del jugador, sin descargar fuentes externas.

#### Scenario: No se descargan fuentes
- **WHEN** se carga la aplicación y se juega una partida
- **THEN** la página no realiza ninguna petición de archivos de fuente
