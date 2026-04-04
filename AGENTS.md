# AGENTS.md

## Procedimientos

Toda tarea que agregue, modifique o elimine endpoints que publica el backend debe mantener actualizado el archivo `ENDPOINTS.md`, describiendo todos los endpoints agrupados por entidad.

## Generacion de archivos para Insomnia

Al generar archivos JSON de colecciones de Insomnia, usar formato v4 con la siguiente estructura:

```json
{
  "_type": "export",
  "__export_format": 4,
  "__export_date": "YYYY-MM-DDTHH:MM:SS.000Z",
  "__export_source": "insomnia.desktop.app:v11.2.0",
  "resources": [
    {
      "_id": "wrk_xxx",
      "name": "Workspace Name",
      "_type": "workspace",
      "parentId": null,
      "metaSortKey": 1,
      "scope": "collection"
    },
    {
      "_id": "env_xxx",
      "name": "Base Environment",
      "data": { "BASE_URL": "http://localhost:3000" },
      "isPrivate": false,
      "_type": "environment",
      "parentId": "wrk_xxx",
      "metaSortKey": 1
    },
    {
      "_id": "fld_xxx",
      "name": "Folder Name",
      "parentId": "wrk_xxx",
      "_type": "request_group",
      "metaSortKey": 1
    },
    {
      "_id": "req_xxx",
      "name": "Request Name",
      "parentId": "fld_xxx",
      "method": "GET|POST|PUT|DELETE|PATCH",
      "url": "{{BASE_URL}}/endpoint",
      "body": { "mimeType": "application/json", "text": "{}" },
      "headers": [{ "name": "Content-Type", "value": "application/json" }],
      "authentication": {},
      "_type": "request",
      "metaSortKey": 1
    }
  ]
}
```

Puntos clave:
- Usar `__export_format: 4`
- Folder: `_type: "request_group"` (no "folder")
- Requests: incluir `body` (incluso vacío `{}`), `headers` como array, `metaSortKey`
- Incluir `parentId`, `metaSortKey` en todos los recursos
- Workspace: incluir `scope: "collection"`

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

## Reglas de manejo de datos y modelos

### Fechas
- Todas las fechas deben manejarse a las 00:00:00 GMT
- Al recibir fechas en endpoints, si no están a las 00:00:00 GMT, se deben ajustar a esa hora

## Reglas de codificación

### Colores
- Usar siempre las constantes de Material UI (ej. `indigo[500]`, `blue[700]`, `red[600]`)
- No usar valores RGB hexadecimales ni otros formatos de color
