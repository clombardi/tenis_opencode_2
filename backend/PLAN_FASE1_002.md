# Plan de Implementación - Fase 1: Torneos e Inscripciones

## Alcance de la Fase

Esta primera fase se enfoca en los dos primeros ejes del desafío técnico:
- **A. Motor de Cuadros y Eliminación**
- **D. Diversidad de Identidades y Modalidades**

**Excluido:** Sistema de autenticación, usuarios, ranking, scoring de partidos, modificación del cuadro (futura fase).

---

## Diseño de Base de Datos

### Entidades Principales

```prisma
// Categoría del torneo (determina puntuación en ranking futuro)
model TournamentCategory {
  id          String   @id @default(uuid())
  name        String   // "Grand Slam", "Masters 1000", "ATP 250", etc.
  code        String   @unique // "GS", "M1000", "ATP250"
  pointsWinner    Int    // puntos para el ganador (ej: 2000)
  pointsFinalist Int    // puntos para el finalista (ej: 1000)
  tier        Int      // nivel (1=GS, 2=Masters, 3=ATP, etc.)
  
  tournaments Tournament[]
}

// Género del torneo
enum GenderCategory {
  MASCULINE
  FEMININE
  MIXED
}

// Modalidad de juego
enum TournamentMode {
  SINGLES      // Individual
  DOUBLES      // Pareja (HH o MM)
  MIXED_DOBLES // Pareja mixta (HM)
}

// Estado del torneo
enum TournamentStatus {
  DRAFT         // Creado, sin acción
  REGISTRATION  // Inscripciones abiertas
  ORGANIZING    // Inscripciones cerradas, organizando cuadro (futuro: modificaciones)
  IN_PROGRESS   // Tournament activo (cuadro generado)
  COMPLETED     // Finalizado
  CANCELLED     // Cancelado
}

// Tournament principal
model Tournament {
  id              String   @id @default(uuid())
  name            String
  categoryId      String
  category        TournamentCategory @relation(fields: [categoryId], references: [id])
  genderCategory  GenderCategory
  mode            TournamentMode
  drawSize        Int      // 4, 8, 16, 32, 64, 128
  
  startDate       DateTime
  endDate         DateTime
  
  status          TournamentStatus @default(DRAFT)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  rounds          TournamentRound[]
  registrations   Registration[]
}

// Ronda del cuadro (R16, Cuartos, Semifinal, Final)
model TournamentRound {
  id              String   @id @default(uuid())
  tournamentId    String
  tournament      Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  roundNumber     Int      // 1=primera ronda, 2=segunda, etc.
  roundType       String   // "R16", "QF", "SF", "F"
  
  matches         Match[]
  
  @@unique([tournamentId, roundNumber])
}

// Estado del partido
enum MatchStatus {
  SCHEDULED  // Pendiente (tiene jugadores asignados)
  IN_PROGRESS // En juego
  COMPLETED  // Finalizado normalmente
  RETIRED    // Abandono por lesión
  WALKOVER   // No se presentó
}

// Rol de un jugador en un partido
enum PlayerMatchRole {
  PLAYER1      // Lado 1 del partido
  PLAYER2      // Lado 2 del partido
  PARTNER1     // Compañero del jugador 1 (en doubles)
  PARTNER2     // Compañero del jugador 2 (en doubles)
}

// Participación de un jugador en un partido (tabla N-M con rol)
model PlayerInMatch {
  id        String   @id @default(uuid())
  matchId   String
  match     Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  playerId  String
  player    Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  role      PlayerMatchRole
  
  @@unique([matchId, playerId])
}

// Un partido del cuadro
model Match {
  id              String   @id @default(uuid())
  roundId         String
  round           TournamentRound @relation(fields: [roundId], references: [id], onDelete: Cascade)
  
  winnerId        String?  // nullable hasta que termine
  status          MatchStatus @default(SCHEDULED)
  
  // Score estructurado (se define después según reglas de puntuación)
  // Por ahora: scoreJSON string para flexibilidad
  score           String?  // {"sets": [{"p1": 6, "p2": 4}, ...]}
  
  startTime       DateTime?
  endTime         DateTime?
  
  // Siguiente match (para avance automático)
  nextMatchId     String?  // El winner avanza a este match
  nextMatchSlot   Int?     // 1 o 2 (en qué posición del siguiente match)
  
  // Relaciones N-M con rol
  participants    PlayerInMatch[]
}

// Género del jugador
enum PlayerGender {
  MALE
  FEMALE
}

// Rol de inscripción
enum RegistrationRole {
  PLAYER     // Inscripción individual (singles)
  PARTNER    // Inscripción como compañero de otro (doubles)
}

// Participación de un jugador en una inscripción (tabla N-M)
model PlayerInRegistration {
  id             String   @id @default(uuid())
  registrationId String
  registration   Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  playerId       String
  player         Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  role           RegistrationRole
  
  @@unique([registrationId, playerId])
}

// Jugador (se crea manualmente o por seed, sin auth en esta fase)
model Player {
  id              String   @id @default(uuid())
  firstName       String
  lastName        String
  email           String   @unique
  gender          PlayerGender
  
  country         String?
  birthDate       DateTime?
  
  registrations   PlayerInRegistration[]
  matches        PlayerInMatch[]
}

// Inscripción de un jugador(s) a un torneo
model Registration {
  id              String   @id @default(uuid())
  tournamentId    String
  tournament      Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  
  registeredAt    DateTime @default(now())
  
  participants    PlayerInRegistration[]
  
  @@unique([tournamentId]) // una inscripción por torneo (se gestionan los participantes)
}
```

### Diagrama de Relaciones

```
┌─────────────────────────────┐
│  TournamentCategory        │
├─────────────────────────────┤
│ id                         │
│ name                       │
│ code                       │
│ pointsWinner/pointsFinalist │
└──────────────┬──────────────┘
               │
               │ 1:N
               ▼
┌──────────────────────────────────────────┐
│            Tournament                    │
├──────────────────────────────────────────┤
│ id                                       │
│ name                                     │
│ categoryId (FK)                         │
│ genderCategory (M/F/MIXED)              │
│ mode (S/D/X)                            │
│ drawSize                                 │
│ status (DRAFT/REG/ORG/IN_PROG/COMPLETED)│
│ startDate, endDate                      │
└───────────────┬────────────────┬─────────┘
                │                │
                │ 1:N            │ 1:N
                ▼                ▼
    ┌───────────────────┐  ┌───────────────────┐
    │ Registration       │  │ TournamentRound  │
    ├───────────────────┤  ├───────────────────┤
    │ tournamentId (FK) │  │ tournamentId (FK) │
    └─────────┬─────────┘  │ roundNumber       │
              │            │ roundType         │
              │ 1:N        └─────────┬─────────┘
              ▼                      │ 1:N
    ┌─────────────────────┐           ▼
    │ PlayerInRegistration│   ┌───────────────┐
    ├─────────────────────┤   │    Match      │
    │ registrationId (FK)│   ├───────────────┤
    │ playerId (FK)       │   │ roundId (FK)  │
    │ role (PLAYER/PARTNER)│  │ winnerId      │
    └─────────┬─────────┘   │ status, score  │
              │             │ nextMatchId    │
              │ 1:N         └───────┬─────────┘
              ▼                     │ 1:N
    ┌─────────────────────┐         ▼
    │      Player         │  ┌───────────────┐
    ├─────────────────────┤  │ PlayerInMatch │
    │ id                  │  ├───────────────┤
    │ firstName, lastName │  │ matchId (FK)  │
    │ email (unique)      │  │ playerId (FK) │
    │ gender (M/F)        │  │ role (P1/P2/   │
    │ country, birthDate  │  │   PARTNER1/2) │
    └─────────────────────┘  └───────────────┘
```

---

## Etapas de Implementación - Fase 1

### ETAPA 1.1: Configuración Inicial (1 día)

**Objetivo:** Scaffold del proyecto NestJS + Prisma.

#### Tasks
1. Inicializar proyecto NestJS con TypeScript
2. Configurar Prisma con PostgreSQL
3. Crear schema.prisma con entidades definidas
4. Ejecutar migrations
5. Crear estructura de módulos NestJS

#### Criterio de Verificación
- `npm run start` levanta el servidor
- `npx prisma db push` crea las tablas
- Entidades accesibles desde código

---

### ETAPA 1.2: Gestión de Jugadores (1 día)

**Objetivo:** CRUD de jugadores para poder tener datos de prueba.

#### Endpoints
- `POST /players` - Crear jugador
- `GET /players` - Listar jugadores (con filtros)
- `GET /players/:id` - Ver detalle
- `PUT /players/:id` - Actualizar
- `DELETE /players/:id` - Eliminar (si no tiene registros)

#### seed-data endpoint (solo dev)
- `POST /seed/players` - Crear N jugadores de prueba

#### Criterio de Verificación
- Crear 16 jugadores de prueba (8M, 8F)
- Validar que no se duplica email
- No eliminar jugador con inscripciones

---

### ETAPA 1.3: Gestión de Categorías (0.5 día)

**Objetivo:** Catálogo de categorías de torneos.

#### Endpoints
- `GET /categories` - Listar categorías
- `POST /categories` - Crear categoría (Admin - por ahora abierto)
- `GET /categories/:id` - Ver detalle

#### Datos iniciales (seed)
Crear categorías por defecto:
- Grand Slam (GS): 2000/1000
- Masters 1000 (M1000): 1000/600
- ATP 500 (ATP500): 500/300
- ATP 250 (ATP250): 250/150
- Challenger (CH): 100/50

#### Criterio de Verificación
- GET /categories retorna todas las categorías
- Cada categoría tiene puntos definidos

---

### ETAPA 1.4: Gestión de Torneos - CRUD y Estados (2 días)

**Objetivo:** Crear, listar y modificar tournaments con su ciclo de vida.

#### Máquina de Estados
```
DRAFT → REGISTRATION → ORGANIZING → IN_PROGRESS → COMPLETED
                ↑               ↑
                └── (puede ir a CANCELLED desde DRAFT, REGISTRATION u ORGANIZING)
```

#### Endpoints
- `POST /tournaments` - Crear torneo (estado DRAFT)
- `GET /tournaments` - Listar con filtros (status, género, modo, categoría)
- `GET /tournaments/:id` - Ver detalle
- `PATCH /tournaments/:id` - Actualizar (solo DRAFT)
- `PATCH /tournaments/:id/close-registration` - Cerrar inscripciones (REGISTRATION → ORGANIZING)
- `PATCH /tournaments/:id/start` - Iniciar tournament (ORGANIZING → IN_PROGRESS)
- `PATCH /tournaments/:id/status` - Cambiar estado (general, incluye CANCELLED)

#### Validaciones
- Fechas coherentes (startDate < endDate)
- Solo transiciones válidas:
  - DRAFT → REGISTRATION
  - REGISTRATION → ORGANIZING (cerrar inscripciones)
  - ORGANIZING → IN_PROGRESS (iniciar)
  - DRAFT/REGISTRATION/ORGANIZING → CANCELLED
  - IN_PROGRESS → COMPLETED
- No modificar si está IN_PROGRESS o COMPLETED
- drawSize debe ser potencia de 2 (4, 8, 16, 32, 64, 128)

#### Criterio de Verificación
```bash
# Crear torneo (DRAFT)
curl -X POST /tournaments -d '{...}'

# Verificar estado inicial
GET /tournaments/1 -> status: "DRAFT"

# Cambiar a REGISTRATION
curl -X PATCH /tournaments/1/status -d '{"status":"REGISTRATION"}'

# Cerrar inscripciones (pasa a ORGANIZING)
curl -X PATCH /tournaments/1/close-registration

# Iniciar tournament (pasa a IN_PROGRESS)
curl -X PATCH /tournaments/1/start

# Finalizar (pasa a COMPLETED)
curl -X PATCH /tournaments/1/status -d '{"status":"COMPLETED"}'

# Intentar modificar COMPLETED -> ERROR

# Intentar generar draw en REGISTRATION -> ERROR (debe estar en ORGANIZING)
```

---

### ETAPA 1.5: Inscripciones a Torneos (2 días)

**Objetivo:** Jugadores pueden inscribirse a tournaments en REGISTRATION.

#### Lógica de Validación

```
SINGLES:
- Tournament gender: MASCULINE → solo PlayerGender.MALE
- Tournament gender: FEMININE → solo PlayerGender.FEMALE

DOUBLES:
- Tournament gender: MASCULINE → ambos jugadores MALE
- Tournament gender: FEMININE → ambos jugadores FEMALE

MIXED_DOBLES:
- Tournament gender: MIXED → uno MALE, uno FEMALE
```

#### Endpoints
- `POST /tournaments/:id/register` - Inscribirse (singles)
- `POST /tournaments/:id/register-doubles` - Inscribirse en pareja
- `GET /tournaments/:id/registrations` - Ver inscriptos
- `DELETE /registrations/:id` - Cancelar inscripción (solo antes de IN_PROGRESS)
- `GET /players/:id/registrations` - Ver inscripciones de un jugador

#### Validaciones
- Solo en estado REGISTRATION
- No duplicar inscripción (mismo jugador mismo torneo)
- Para doubles: el partner no puede tener otra inscripción a ese torneo
- Validar género según reglas above

#### Criterio de Verificación
```bash
# Crear tournament MASCULINO SINGLES
# Intentar inscribir mujer -> 400
# Intentar inscribir hombre -> 201

# Crear tournament MIXED MIXED_DOBLES
# Inscribir pareja HH -> 400
# Inscribir pareja MM -> 400
# Inscribir pareja HM -> 201

# Intentar inscribirse después de close-registration -> 400
```

---

### ETAPA 1.5b: Testing e Integración - Primeros Módulos (1 día)

**Objetivo:** Verificar que las etapas 1.1 a 1.5 funcionan correctamente.

#### Tests de Integración
```bash
# 1. Seed de jugadores
POST /seed/players (8M, 8F)

# 2. Crear tournament
POST /tournaments { genderCategory: MASCULINE, mode: SINGLES, drawSize: 4 }

# 3. Listar tournaments
GET /tournaments

# 4. Ver detalle de tournament
GET /tournaments/1

# 5. Cambiar a REGISTRATION
PATCH /tournaments/1/status -d '{"status":"REGISTRATION"}'

# 6. Inscribir 4 jugadores
POST /tournaments/1/register { playerId: "uuid-m-1" }
POST /tournaments/1/register { playerId: "uuid-m-2" }
POST /tournaments/1/register { playerId: "uuid-m-3" }
POST /tournaments/1/register { playerId: "uuid-m-4" }

# 7. Ver inscriptos
GET /tournaments/1/registrations

# 8. Validaciones de género
# - Intentar mujer en masculino -> 400
# - Intentar segundo registro mismo jugador -> 400
```

#### Tests Unitarios
- Validador de elegibilidad (género + modalidad)
- Transiciones de estado de tournament
- CRUD de players, categories, tournaments

#### Criterio de Verificación
- Todos los tests pasan
- Flujo completo ejecutable sin errores

---

### ETAPA 1.6: Motor de Cuadros - Generación Automática (2 días)

**Objetivo:** Generar estructura de eliminación directa basado en inscriptos.

#### Requisito
- Solo se puede generar el cuadro si el tournament está en estado **ORGANIZING**

#### Algoritmo

```
Input: tournamentId con N inscriptos
Output: estructura Round → Match

PASOS:
1. Validar N >= 2 y N <= drawSize
2. Calcular nextPowerOf2(N) = pp
3. Calcular byes = pp - N
4. Ordenar inscriptos (por seed o aleatorio)
   - Los primeros byes reciben bye automático
5. Generar matches de primera ronda:
   - Para cada par: create Match
6. Generar rondas siguientes (vacías, esperando resultados)
7. Vincular: Match.nextMatchId → sig/match, Match.nextMatchSlot → 1|2

Ejemplo 6 jugadores:
- pp = 8, byes = 2
- Jugadores 1-2 reciben bye (avanzan automáticamente)
- Jugadores 3-6 emparejados: (3vs6), (4vs5)
- Ronda 1: 2 matches
- Ronda 2: 4 matches (2 con byes, 2 con winners)
- SF: 2 matches
- Final: 1 match
```

#### Endpoints
- `POST /tournaments/:id/generate-draw` - Generar cuadro (solo ORGANIZING)
- `GET /tournaments/:id/draw` - Ver cuadro completo
- `GET /tournaments/:id/rounds` - Ver rondas

#### Validaciones
- Solo si status = ORGANIZING (no REGISTRATION ni IN_PROGRESS)
- Solo si hay >= 2 inscriptos
- Solo si inscriptos <= drawSize
- Solo si no hay cuadro ya generado

#### Criterio de Verificación
```bash
# Tournament en REGISTRATION, intentar generar draw -> 400
# Error: "El cuadro solo puede generarse cuando el torneo está en estado ORGANIZING"

# Cerrar inscripciones (pasa a ORGANIZING)
PATCH /tournaments/1/close-registration

# Ahora sí se puede generar
POST /tournaments/1/generate-draw

# Verificar estructura:
# - 3 rondas (QF, SF, F) para drawSize=4
# - 2 matches en primera ronda
# - Cada match tiene player1 y player2 (PlayerInMatch)

# Tournament con 6 inscriptos en ORGANIZING
POST /tournaments/2/generate-draw
# Verificar: 2 byes, 2 matches en primera ronda
```

---

### ETAPA 1.7: Avance de Jugadores (1 día)

**Objetivo:** Cuando un partido termina, el winner avanza automáticamente al siguiente match.

#### Lógica
```
Cuando Match.status = COMPLETED:
1. Obtener winnerId
2. Obtener nextMatchId y nextMatchSlot
3. Crear/actualizar PlayerInMatch para el winner en el siguiente match
4. Si el match siguiente tiene ambos jugadores → puede iniciar
```

#### Endpoints adicionales
- `GET /matches/:id` - Ver partido (incluye participantes con roles)
- `PATCH /matches/:id/set-winner` - Definir winner y avanzar (endpoint simple para testing)
- `GET /matches/:id/next` - Ver siguiente partido del winner

#### Criterio de Verificación
```bash
# Dado un tournament con 4 jugadores, draw generado
# Match 1: Player A vs Player B
# Match 2: Player C vs Player D
# Match 3 (SF): winner1 vs winner2

# Definir winner del match 1
PATCH /matches/1/set-winner -d '{"winnerId":"uuid-a"}'

# Verificar match 3 tiene player1 = A (PlayerInMatch con role PLAYER1)

# Definir winner del match 2
PATCH /matches/2/set-winner -d '{"winnerId":"uuid-c"}'

# Verificar match 3 tiene player2 = C
# Verificar match 3 ahora tiene ambos participantes -> status SCHEDULED
```

---

### ETAPA 1.8: Testing e Integración - Fase Completa (1 día)

**Objetivo:** Verificar el flujo completo de la fase.

#### Flujo de Prueba Completo
```bash
# 1. Crear jugadores (seed)
POST /seed/players (8M, 8F)

# 2. Crear tournament
POST /tournaments { genderCategory: MASCULINE, mode: SINGLES, drawSize: 4 }

# 3. Inscribir 4 jugadores
POST /tournaments/1/register { playerId: "uuid-m-1" }
POST /tournaments/1/register { playerId: "uuid-m-2" }
POST /tournaments/1/register { playerId: "uuid-m-3" }
POST /tournaments/1/register { playerId: "uuid-m-4" }

# 4. Cambiar a REGISTRATION
PATCH /tournaments/1/status -d '{"status":"REGISTRATION"}'

# 5. Cerrar inscripciones (pasa a ORGANIZING)
PATCH /tournaments/1/close-registration

# 6. Generar draw
POST /tournaments/1/generate-draw

# 7. Verificar estructura
GET /tournaments/1/draw

# 8. Completar partidos y verificar avance
PATCH /matches/[id1]/set-winner -d '{"winnerId":"..."}'
PATCH /matches/[id2]/set-winner -d '{"winnerId":"..."}'

# 9. Iniciar tournament (pasa a IN_PROGRESS)
PATCH /tournaments/1/start

# 10. Finalizar tournament
PATCH /tournaments/1/status -d '{"status":"COMPLETED"}'
```

#### Tests Unitarios
- Validador de elegibilidad (género + modalidad)
- Algoritmo de generación de cuadro
- Avance de winner a siguiente match
- Transiciones de estado de tournament (incluyendo ORGANIZING)

#### Criterio de Verificación
- Todos los tests pasan
- Flujo completo ejecutable desde cero hasta tournament completado

---

## Resumen de Endpoints

| Módulo | Método | Endpoint | Descripción |
|--------|--------|----------|-------------|
| **Players** | POST | /players | Crear jugador |
| | GET | /players | Listar |
| | GET | /players/:id | Ver detalle |
| | POST | /seed/players | Seed (dev) |
| **Categories** | GET | /categories | Listar |
| **Tournaments** | POST | /tournaments | Crear |
| | GET | /tournaments | Listar |
| | GET | /tournaments/:id | Ver detalle |
| | PATCH | /tournaments/:id/close-registration | Cerrar → ORGANIZING |
| | PATCH | /tournaments/:id/start | Iniciar → IN_PROGRESS |
| | PATCH | /tournaments/:id/status | Cambiar estado (general) |
| **Registrations** | POST | /tournaments/:id/register | Inscribirse singles |
| | POST | /tournaments/:id/register-doubles | Inscribirse doubles |
| | GET | /tournaments/:id/registrations | Ver inscriptos |
| | DELETE | /registrations/:id | Cancelar |
| **Draw** | POST | /tournaments/:id/generate-draw | Generar cuadro (ORGANIZING) |
| | GET | /tournaments/:id/draw | Ver cuadro |
| | GET | /tournaments/:id/rounds | Ver rondas |
| **Matches** | GET | /matches/:id | Ver partido |
| | PATCH | /matches/:id/set-winner | Definir winner y avanzar |
| | GET | /matches/:id/next | Ver siguiente partido |

---

## Transiciones de Estado - Tournament

| Desde | Hacia | Endpoint | Condiciones |
|-------|-------|----------|--------------|
| DRAFT | REGISTRATION | PATCH /status | Ninguna (por ahora) |
| REGISTRATION | ORGANIZING | PATCH /close-registration | >= 2 inscriptos |
| ORGANIZING | IN_PROGRESS | PATCH /start | Cuadro generado |
| IN_PROGRESS | COMPLETED | PATCH /status | Todos los partidos completados |
| DRAFT/REGISTRATION/ORGANIZING | CANCELLED | PATCH /status | Ninguna (por ahora) |

---

## Pendientes para Fases Futuras

- **Autenticación:** JWT, roles (Admin/Player)
- **Match Scoring:** State machine de partido, puntuación tenis
- **Ranking:** Cálculo ATP, WebSocket
- **Modificación del cuadro:** Cambiar horarios, modificar partidos (en ORGANIZING)
- **Seed de Players:** Por ahora manual, luego integrado con auth

---

## Dependencies

```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/common": "^10.0.0",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1"
}
```