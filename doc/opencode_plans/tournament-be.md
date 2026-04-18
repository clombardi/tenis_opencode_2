# Plan: Torneos (Tournament) - Backend

## Objetivo
CRUD completo de Tournament con máquina de estados según etapa 1.4 de PLAN_FASE1.md.

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /tournaments | Crear torneo (estado DRAFT) |
| GET | /tournaments | Listar con filtros (status, genderCategory, mode, categoryId) |
| GET | /tournaments/:id | Ver detalle |
| PATCH | /tournaments/:id | Actualizar (solo si status = DRAFT) |
| DELETE | /tournaments/:id | Eliminar (solo si status = DRAFT) |
| PATCH | /tournaments/:id/close-registration | Cerrar inscripciones (REGISTRATION → ORGANIZING) |
| PATCH | /tournaments/:id/start | Iniciar tournament (ORGANIZING → IN_PROGRESS) |
| PATCH | /tournaments/:id/status | Cambiar estado (general, incluye CANCELLED) |

## Transiciones de Estado (validadas)

```
DRAFT → REGISTRATION
REGISTRATION → ORGANIZING (close-registration)
ORGANIZING → IN_PROGRESS (start)
DRAFT/REGISTRATION/ORGANIZING → CANCELLED
IN_PROGRESS → COMPLETED
```

## Validaciones

- **CREATE**: startDate < endDate, drawSize es potencia de 2 (4, 8, 16, 32, 64, 128), categoryId existe
- **UPDATE**: solo si status = DRAFT
- **DELETE**: solo si status = DRAFT
- **close-registration**: solo si status = REGISTRATION
- **start**: solo si status = ORGANIZING
- **status general**: solo transiciones válidas

## DTOs

### CreateTournamentDto
```typescript
{
  name: string
  categoryId: string
  genderCategory: 'MASCULINE' | 'FEMININE' | 'MIXED'
  mode: 'SINGLES' | 'DOUBLES' | 'MIXED_DOBLES'
  drawSize: number (4, 8, 16, 32, 64, 128)
  startDate: string (ISO 8601)
  endDate: string (ISO 8601)
}
```

### UpdateTournamentDto
Igual que CreateTournamentDto.

### TournamentQueryDto
```typescript
{
  status?: TournamentStatus
  genderCategory?: GenderCategory
  mode?: TournamentMode
  categoryId?: string
}
```

### UpdateStatusDto
```typescript
{
  status: TournamentStatus
}
```

## Archivos a crear

```
backend/src/tournaments/
├── tournaments.module.ts
├── tournaments.controller.ts
├── tournaments.service.ts
└── dto/
    ├── tournament.dto.ts
    └── update-status.dto.ts
```

## Servicio - Métodos

### TournamentsService
- `create(dto)` - Crear con status=DRAFT, validaciones de fechas y drawSize
- `findAll(query)` - Listar con filtros
- `findOne(id)` - Ver detalle (incluir category)
- `update(id, dto)` - Solo si DRAFT
- `remove(id)` - Solo si DRAFT
- `closeRegistration(id)` - REGISTRATION → ORGANIZING
- `start(id)` - ORGANIZING → IN_PROGRESS
- `updateStatus(id, status)` - Cambio de estado con validación de transiciones

## Actualización de archivos

- `backend/src/app.module.ts` - Importar TournamentsModule
- `ENDPOINTS.md` - Agregar endpoints

## Notas
- Usar `parseAndNormalizeDate` de common/date.utils para fechas
- Fechas a medianoche GMT (00:00:00)
- Include de category en findOne para respuesta completa
- No eliminar tournaments con rounds o registrations (por ahora no aplica por validación DRAFT)