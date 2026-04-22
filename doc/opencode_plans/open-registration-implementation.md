# Plan: Implementar openRegistration

## Objetivo
Implementar la acción "Abrir inscripción" en el menú de acciones del torneo, que llama al endpoint PATCH /tournaments/:id/open-registration.

## Backend

### 1.1 Controller - tournaments.controller.ts
Agregar endpoint después de close-registration:
```typescript
@Patch(':id/open-registration')
openRegistration(@Param('id', ParseUUIDPipe) id: string) {
  return this.tournamentsService.openRegistration(id);
}
```

### 1.2 Service - tournaments.service.ts
Agregar método después de closeRegistration:
```typescript
async openRegistration(id: string) {
  const tournament = await this.findOne(id);

  if (tournament.status !== TournamentStatus.DRAFT) {
    throw new ForbiddenException('Can only open registration when status is DRAFT');
  }

  return this.prisma.tournament.update({
    where: { id },
    data: { status: TournamentStatus.REGISTRATION },
  });
}
```

## Frontend

### 2.1 API - services/api.ts
Agregar método en tournamentsApi:
```typescript
openRegistration: (id: string) => 
  axios.patch(`${BASE_URL}/tournaments/${id}/open-registration`),
```

### 2.2 TournamentManagement.tsx
En handleMenuAction, case 'openRegistration':
```typescript
case 'openRegistration':
  await tournamentsApi.openRegistration(tournament.id);
  loadTournaments();
  break;
```

## Verificaciones
- TypeScript compila sin errores
- Probar el flujo completo