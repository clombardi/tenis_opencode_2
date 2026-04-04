# AGENTS.md - Configuración del Proyecto

## Estructura del Proyecto

Trabajamos con dos proyectos separados:

- **Backend**: `/backend` - API REST con NestJS
- **Frontend**: `/frontend` - Interfaz de usuario (pendiente de definir)

## Tecnologías - Backend

- **Framework**: NestJS con TypeScript
- **ORM**: Prisma
- **Base de datos**: PostgreSQL
- **Validación**: class-validator, class-transformer

## Modelo de Datos

El modelo de datos está definido en `backend/PLAN_FASE1.md`.

### Entidades Principales

```
TournamentCategory
├── id, name, code, pointsWinner, pointsFinalist, tier

Tournament (enum: GenderCategory, TournamentMode, TournamentStatus)
├── id, name, categoryId, genderCategory, mode, drawSize, startDate, endDate, status

TournamentRound
├── id, tournamentId, roundNumber, roundType

Match (enum: MatchStatus, PlayerMatchRole)
├── id, roundId, winnerId, status, score, nextMatchId, nextMatchSlot

Player (enum: PlayerGender)
├── id, firstName, lastName, email, gender, country, birthDate

Registration (enum: RegistrationRole)
├── id, tournamentId, registeredAt

PlayerInMatch
├── id, matchId, playerId, role

PlayerInRegistration
├── id, registrationId, playerId, role
```

### Relación entre entidades

```
TournamentCategory 1:N Tournament
Tournament 1:N TournamentRound
Tournament 1:N Registration
TournamentRound 1:N Match
Match N:N Player (via PlayerInMatch)
Registration N:N Player (via PlayerInRegistration)
```

### Estados del Tournament

```
DRAFT → REGISTRATION → ORGANIZING → IN_PROGRESS → COMPLETED
                ↑               ↑
                └── CANCELLED (desde DRAFT, REGISTRATION u ORGANIZING)
```

### Modalidades

- **SINGLES**: Individual
- **DOUBLES**: Pareja (HH o MM)
- **MIXED_DOBLES**: Pareja mixta (HM)
