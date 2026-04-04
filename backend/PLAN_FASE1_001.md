# Plan de Implementación - Fase 1: Torneos e Inscripciones

## Alcance de la Fase

Esta primera fase se enfoca en los dos primeros ejes del desafío técnico:
- **A. Motor de Cuadros y Eliminación**
- **D. Diversidad de Identidades y Modalidades**

**Excluido:** Sistema de autenticación, usuarios, ranking, scoring de partidos.

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
  IN_PROGRESS   // Torneo activo (cuadro generado)
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

// Un partido del cuadro
model Match {
  id              String   @id @default(uuid())
  roundId         String
  round           TournamentRound @relation(fields: [roundId], references: [id], onDelete: Cascade)
  
  player1Id       String?  // UUID del jugador (nullable para byes)
  player2Id       String?
  
  // Para doubles, store ambos jugadores de cada lado
  player1PartnerId String?
  player2PartnerId String?
  
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
}

// Género del jugador
enum PlayerGender {
  MALE
  FEMALE
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
  
  // Rankings se calculan en fase posterior
  // rankingPoints   Int      @default(0)
  // rankingPosition Int?
  
  registrations   Registration[]   // inscripciones a torneos
  matchesAsPlayer1 Match[] @relation("PlayerAsPlayer1")
  matchesAsPlayer2 Match[] @relation("PlayerAsPlayer2")
  // También para partners
  matchesAsPartner1 Match[] @relation("PlayerAsPartner1")
  matchesAsPartner2 Match[] @relation("PlayerAsPartner2")
}

// Inscripción de un jugador a un torneo
model Registration {
  id              String   @id @default(uuid())
  tournamentId    String
  tournament      Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  playerId        String
  player          Player @relation(fields: [playerId], references: [id], onDelete: Cascade)
  
  // Para doubles: referencia al otro jugador de la pareja
  partnerId       String?
  partner         Player? @relation("DoublesPartner", fields: [partnerId], references: [id])
  
  // Relation inversa para partner
  pairedWith      Registration? @relation("DoublesPartner", references: [partnerId], fields: [id], map: "registration_partner")
  
  registeredAt    DateTime @default(now())
  
  @@unique([tournamentId, playerId]) // un jugador una inscripción
  @@unique([tournamentId, partnerId]) // una pareja una inscripción
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
│ status (DRAFT/REG/IN_PROG/COMPLETED)    │
│ startDate, endDate                      │
└───────────────┬────────────────┬─────────┘
                │                │
                │ 1:N            │ 1:N
                ▼                ▼
    ┌───────────────────┐  ┌───────────────────┐
    │ Registration       │  │ TournamentRound  │
    ├───────────────────┤  ├───────────────────┤
    │ tournamentId (FK) │  │ tournamentId (FK) │
    │ playerId (FK)      │  │ roundNumber       │
    │ partnerId (FK?)   │  │ roundType         │
    └───────────────────┘  └─────────┬─────────┘
                                     │ 1:N
                                     ▼
    ┌─────────────────────────────────────────┐
    │                Match                    │
    ├─────────────────────────────────────────┤
    │ roundId (FK)                           │
    │ player1Id, player2Id (FK?)            │
    │ player1PartnerId, player2PartnerId     │
    │ winnerId (FK?)                         │
    │ status, score                          │
    │ nextMatchId, nextMatchSlot             │
    └─────────────────────────────────────────┘

    ┌─────────────────────────────────────────┐
    │                Player                  │
    ├─────────────────────────────────────────┤
    │ id                                     │
    │ firstName, lastName                    │
    │ email (unique)                         │
    │ gender (M/F)                           │
    │ country, birthDate                     │
    └─────────────────────────────────────────┘
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
DRAFT → REGISTRATION → IN_PROGRESS → COMPLETED
                      ↑
                      └── (puede ir a CANCELLED desde DRAFT o REGISTRATION)
```

#### Endpoints
- `POST /tournaments` - Crear torneo (estado DRAFT)
- `GET /tournaments` - Listar con filtros (status, género, modo, categoría)
- `GET /tournaments/:id` - Ver detalle
- `PATCH /tournaments/:id` - Actualizar (solo DRAFT)
- `PATCH /tournaments/:id/status` - Cambiar estado

#### Validaciones
- Fechas coherentes (startDate < endDate)
- Solo transiciones válidas (no DRAFT → COMPLETED)
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

# Cambiar a IN_PROGRESS
curl -X PATCH /tournaments/1/status -d '{"status":"IN_PROGRESS"}'

# Cambiar a COMPLETED
curl -X PATCH /tournaments/1/status -d '{"status":"COMPLETED"}'

# Intentar modificar COMPLETED -> ERROR
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
- Validar género según reglasabove

#### Criterio de Verificación
```bash
# Crear tournament MASCULINO SINGLES
# Intentar inscribir mujer -> 400
# Intentar inscribir hombre -> 201

# Crear tournament MIXED MIXED_DOBLES
# Inscribir pareja HH -> 400
# Inscribir pareja MM -> 400
# Inscribir pareja HM -> 201
```

---

### ETAPA 1.6: Motor de Cuadros - Generación Automática (2 días)

**Objetivo:** Generar estructura de eliminación directa basado en inscriptos.

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
- `POST /tournaments/:id/generate-draw` - Generar cuadro
- `GET /tournaments/:id/draw` - Ver cuadro completo
- `GET /tournaments/:id/rounds` - Ver rondas

#### Validaciones
- Solo Admin (por ahora abierto)
- Solo si status = REGISTRATION
- Solo si hay >= 2 inscriptos
- Solo si inscriptos <= drawSize
- Solo si no hay cuadro ya generado

#### Criterio de Verificación
```bash
# Tournament con 8 inscriptos
POST /tournaments/1/generate-draw

# Verificar estructura:
# - 3 rondas (R16, SF, F) o (QF, SF, F) según drawSize
# - 4 matches en primera ronda
# - Cada match tiene player1 y player2

# Tournament con 6 inscriptos
POST /tournaments/2/generate-draw

# Verificar: 2 byes, 2 matches en primera ronda
# Los players 1-2 avanzan automáticamente a SF
```

---

### ETAPA 1.7: Avance de Jugadores (1 día)

**Objetivo:** Cuando un partido termina, el winner avanza automáticamente al siguiente match.

#### Lógica
```
 Cuando Match.status = COMPLETED:
 1. Obtener winnerId
 2. Obtener nextMatchId y nextMatchSlot
 3. Asignar winner al slot correspondiente (player1 o player2)
 4. Si el match siguiente tiene ambos jugadores → puede iniciar
```

#### Endpoints adicionales
- `GET /matches/:id` - Ver partido
- `GET /matches/:id/next` - Ver siguiente partido del winner

#### Criterio de Verificación
```bash
# Dado un tournament con 4 jugadores, draw generado
# Match 1: Player A vs Player B
# Match 2: Player C vs Player D
# Match 3 (SF): winner1 vs winner2

# Completar match 1 con winner = A
# Verificar match 3 tiene player1 = A

# Completar match 2 con winner = C
# Verificar match 3 tiene player2 = C
```

---

### ETAPA 1.8: Testing e Integración (1 día)

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
PATCH /tournaments/1/status { status: "REGISTRATION" }

# 5. Generar draw
POST /tournaments/1/generate-draw

# 6. Verificar estructura
GET /tournaments/1/draw

# 7. Completar partidos y verificar avance
# (pendiente scoring, por ahora solo avanzar winner manualmente o endpoint)
```

#### Tests Unitarios
- Validador de elegibilidad (género + modalidad)
- Algoritmo de generación de cuadro
- Avance de winner a siguiente match

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
| | PATCH | /tournaments/:id/status | Cambiar estado |
| **Registrations** | POST | /tournaments/:id/register | Inscribirse singles |
| | POST | /tournaments/:id/register-doubles | Inscribirse doubles |
| | GET | /tournaments/:id/registrations | Ver inscriptos |
| | DELETE | /registrations/:id | Cancelar |
| **Draw** | POST | /tournaments/:id/generate-draw | Generar cuadro |
| | GET | /tournaments/:id/draw | Ver cuadro |
| | GET | /tournaments/:id/rounds | Ver rondas |

---

## Pendientes para Fases Futuras

- **Autenticación:** JWT, roles (Admin/Player)
- **Match Scoring:** State machine de partido, puntuación tenis
- **Ranking:** Cálculo ATP, WebSocket
- **Seed de Players:** Por ahora manual, luego integrado con auth

---

##Dependencies

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