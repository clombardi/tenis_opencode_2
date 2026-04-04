### **Consigna de Trabajo Práctico: Proyecto "AceManager"**

#### **1\. La Problemática: El Caos de la Competición**

La federación regional de tenis ha detectado que la gestión de sus torneos es ineficiente. Actualmente, los organizadores sufren para coordinar cuadros de eliminación, los jugadores no tienen claridad sobre cómo sus victorias afectan su posición global, y la carga de resultados en papel genera errores en las estadísticas históricas.

El desafío es desarrollar **AceManager**, una plataforma que no solo registre datos, sino que actúe como el "árbitro central" y "estratega" de la competición.

#### **2\. Ejes del Desafío Técnico**

**A. El Motor de Cuadros y Eliminación (El Grafo de Competición)** El sistema debe ser capaz de organizar torneos de diversas magnitudes.

* *Problema a resolver:* El sistema debe gestionar la arquitectura de un torneo de eliminación directa. ¿Cómo se garantiza que los cruces se generen de forma justa? ¿Cómo maneja el sistema un torneo si el número de inscriptos no es una potencia exacta de dos?  
* *Restricción de diseño:* No se trata solo de nombres; el motor debe controlar el flujo de avance. Un jugador no puede estar en la semifinal si no ganó sus cuartos. El sistema debe ser el guardián de la integridad del cuadro.

**B. El Intérprete de Reglas de Juego (State Machine)** El tenis tiene una lógica de puntuación única (sets, games, tie-breaks).

* *Problema a resolver:* El sistema debe procesar el resultado de un partido y determinar el ganador basándose en las reglas oficiales (mejor de tres, diferencia de dos, etc.). Debe contemplar casos excepcionales: ¿qué sucede con los puntos y el avance si un jugador se retira por lesión (*retired*) o no se presenta (*walkover*)? El estado del partido debe ser inalterable una vez finalizado.

**C. El Ecosistema de Ranking Dinámico (ATP Style)** La plataforma debe gestionar el prestigio de los jugadores a lo largo del tiempo.

* *Problema a resolver:* No todos los torneos valen lo mismo. Deben diseñar un modelo donde la "categoría" del torneo dicte la recompensa. Lo más complejo: el ranking es un organismo vivo. ¿Cómo se recalculan las posiciones globales cada vez que termina un torneo de "Grand Slam" frente a uno de menor categoría? ¿Cómo se reflejan estos puntos en las estadísticas históricas del jugador?

**D. Diversidad de Identidades y Modalidades** El tenis se juega solo, en parejas o en equipos mixtos.

* *Problema a resolver:* El sistema debe validar la elegibilidad. ¿Cómo evitamos que un jugador masculino se inscriba en un torneo femenino? ¿Cómo modelamos un "equipo" de dobles mixtos para que el sistema entienda que está compuesto por un hombre y una mujer, y que ambos sumen puntos individualmente a sus respectivos rankings?

#### **3\. Gobernanza y Transparencia**

Debe existir una clara separación entre quienes **dictan las reglas** (Administradores: crean torneos, validan resultados, moderan el ranking) y quienes **compiten** (Jugadores: gestionan su carrera, se inscriben, consultan su progreso).

---

### **Lo que esperamos de los equipos (Criterios de Evaluación)**

En lugar de evaluar "si el sistema funciona", evaluaremos la **calidad de la solución propuesta**:

1. **Defensa del Modelo de Dominio:** En la primera entrega, no queremos ver código, queremos ver el **Diagrama de Entidad-Relación y el Modelo de Objetos**. Deberán explicar cómo resolvieron la relación entre Jugadores, Parejas de Dobles y su participación en diferentes instancias del cuadro.  
2. **Manejo de Estados:** Deberán justificar cómo implementaron el ciclo de vida de un torneo (desde "Inscripción Abierta" hasta "Finalizado") para que los datos sean íntegros y no se puedan modificar resultados de partidos pasados.  
3. **Algoritmos de Ranking:** Deberán documentar el proceso lógico (o pseudocódigo) mediante el cual un jugador escala posiciones. Queremos ver cómo manejan la concurrencia: ¿qué pasa si dos torneos terminan el mismo día?  
4. **Justificación de la IA:** Si se utilizó IA para generar módulos (por ejemplo, el generador de cuadros), el equipo debe presentar un informe de **Code Review** sobre lo que la IA generó, explicando por qué esa lógica es correcta o qué correcciones tuvieron que hacerle para adaptarla a las reglas del tenis.

