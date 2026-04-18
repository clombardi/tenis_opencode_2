# ENDPOINTS.md

## Players

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /players | Crear jugador |
| GET | /players | Listar jugadores (con filtros: gender, country) |
| GET | /players/:id | Ver detalle de jugador |
| PUT | /players/:id | Actualizar jugador |
| DELETE | /players/:id | Eliminar jugador (solo si no tiene inscripciones) |
| POST | /seed/players?count=32&category=normal | Seed de jugadores (32 por defecto, category: senior/normal/infantiles) - solo desarrollo |

## TournamentCategory

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /categories | Listar categorías (ordenadas por tier) |
| POST | /seed/categories | Seed de categorías iniciales - solo desarrollo |

## Tournament

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /tournaments | Crear torneo (estado DRAFT) |
| GET | /tournaments | Listar con filtros (status, genderCategory, mode, categoryId) |
| GET | /tournaments/:id | Ver detalle |
| PATCH | /tournaments/:id | Actualizar (solo si DRAFT) |
| DELETE | /tournaments/:id | Eliminar (solo si DRAFT) |
| PATCH | /tournaments/:id/close-registration | Cerrar inscripciones (REGISTRATION → ORGANIZING) |
| PATCH | /tournaments/:id/start | Iniciar tournament (ORGANIZING → IN_PROGRESS) |
| PATCH | /tournaments/:id/status | Cambiar estado |