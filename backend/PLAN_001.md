# Plan de Implementación - Backend AceManager

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|----------------|
| **Runtime** | Node.js 20.x | LTS, mejor rendimiento |
| **Lenguaje** | TypeScript 5.x | Tipado estático, mantenimiento |
| **Framework** | NestJS | Modularidad, inyección dependencias, documentación |
| **Base de Datos** | PostgreSQL | Relational, soporte JSONB, ideal para grafos de eliminación |
| **ORM** | Prisma | Type-safety, migrations, DX |
| **Autenticación** | JWT + Passport | Estándar industry |
| **WebSocket** | Socket.io | Tiempo real para ranking vivo |
| **Validadores** | Zod | Schema validation |
| **Testing** | Jest + Supertest | Cobertura |

---

## Etapas de Implementación

### ETAPA 1: Fundamentos y Modelado de Datos (Semana 1-2)

**Objetivo:** Establecer la arquitectura base y el modelo de dominio.

#### 1.1 Estructura del Proyecto
- Configuración inicial NestJS + TypeScript
- Estructura de carpetas (modules, common, config)
- Configuración de variables de entorno
- Configuración de Prisma + PostgreSQL

#### 1.2 Modelo de Dominio - ER Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     User        │       │   Player        │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──1:1──│ id (PK)         │
│ email           │       │ userId (FK)     │
│ password        │       │ gender          │
│ role            │       │ birthDate       │
│ createdAt       │       │ country         │
└─────────────────┘       └────────┬────────┘
                                   │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
        ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
        │  Tournament   │ │   Match       │ │  Tournament   │
        │   Category    │ │   Category    │ │   Registration│
        ├───────────────┤ ├───────────────┤ ├───────────────┤
        │ id            │ │ id            │ │ id            │
        │ name          │ │ name          │ │ tournamentId  │
        │ points        │ │ points        │ │ playerId      │
        └───────────────┘ └───────────────┘ └───────────────┘
                │                 │                 │
                ▼                 ▼                 ▼
        ┌─────────────────────────────────────────────────────────┐
        │                    Tournament                            │
        ├─────────────────────────────────────────────────────────┤
        │ id            │ name          │ status (enum)           │
        │ categoryId    │ drawSize      │ startDate               │
        │ genderCategory│ mode (S/D/X) │ endDate                 │
        └─────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
        ┌─────────────────────────────────────────────────────────┐
        │                   TournamentRound                       │
        ├─────────────────────────────────────────────────────────┤
        │ id │ tournamentId │ roundNumber │ roundType (QF/SF/F)  │
        └─────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
        ┌─────────────────────────────────────────────────────────┐
        │                      Match                              │
        ├─────────────────────────────────────────────────────────┤
        │ id │ roundId │ player1Id │ player2Id │ status           │
        │ winnerId │ score │ startTime │ endTime                 │
        └─────────────────────────────────────────────────────────┘

        ┌─────────────────────────────────────────────────────────┐
        │                   PlayerRanking                        │
        ├─────────────────────────────────────────────────────────┤
        │ id │ playerId │ tournamentId │ points │ position        │
        │ calculatedAt                                            │
        └─────────────────────────────────────────────────────────┘
```

#### 1.3 Entregables
- [ ] Diagrama ER completo con relaciones
- [ ] Interfaces TypeScript de todas las entidades
- [ ] Repositorios base con Prisma
- [ ] Migrations de base de datos

---

### ETAPA 2: Autenticación y Autorización (Semana 2-3)

**Objetivo:** Sistema de governance (Admin vs Player).

#### 2.1 Módulos
- **AuthModule:** Login, registro, JWT generation
- **UsersModule:** CRUD de usuarios (Admin only)
- **Guards:** Role-based access control
- **Strategies:** JWT strategy, Local strategy

#### 2.2 Flujo de Usuarios
```
┌──────────────┐     ┌──────────────┐
│   ADMIN      │     │   PLAYER     │
├──────────────┤     ├──────────────┤
│ Create       │     │ Register     │
│ tournaments  │     │ to tournament│
│ Validate     │     │ View own     │
│ results      │     │ matches      │
│ Moderation   │     │ View ranking │
└──────────────┘     └──────────────┘
```

#### 2.3 Endpoints
- `POST /auth/register` - Registro jugador
- `POST /auth/login` - Login
- `GET /users/me` - Perfil actual
- `PATCH /users/:id/role` - Asignar rol (Admin)

#### 2.4 Entregables
- [ ] Sistema auth completo con JWT
- [ ] Guards de roles (Admin/Player)
- [ ] Endpoints de gestión de usuarios
- [ ] Tests de autenticación

---

### ETAPA 3: Gestión de Torneos (Semana 3-4)

**Objetivo:** CRUD completo de torneos con ciclos de vida.

#### 3.1 Máquina de Estados - Tournament Lifecycle

```
                    ┌─────────────────┐
                    │   DRAFT         │
                    │  (creado)       │
                    └────────┬────────┘
                             │ publish
                             ▼
                    ┌─────────────────┐
                    │ REGISTRATION    │◄────────────┐
                    │  (abierta)      │             │
                    └────────┬────────┘             │ close
                             │ generateDraw          │ registration
                             ▼                       │
                    ┌─────────────────┐             │
                    │   IN_PROGRESS   │─────────────┘
                    │  (activo)       │
                    └────────┬────────┘
                             │ complete
                             ▼
                    ┌─────────────────┐
                    │   COMPLETED      │
                    │  (finalizado)    │
                    └─────────────────┘
```

#### 3.2 Tipos de Torneo
- **Singles** (individual)
- **Doubles** (pareja varón-varón o mujer-mujer)
- **Mixed Doubles** (varón-mujer)

#### 3.3 Endpoints
- `POST /tournaments` - Crear torneo (Admin)
- `GET /tournaments` - Listar con filtros
- `GET /tournaments/:id` - Detalle con cuadro
- `PATCH /tournaments/:id/status` - Cambiar estado
- `DELETE /tournaments/:id` - Cancelar (Draft only)

#### 3.4 Validaciones
- Solo Admin puede crear/modificar
- Fechas coherentes (start > end)
- No modificarsi está en progreso/completado

#### 3.5 Entregables
- [ ] CRUD completo de torneos
- [ ] State machine implementada
- [ ] Validaciones de integridad
- [ ] Tests de ciclo de vida

---

### ETAPA 4: Motor de Cuadros - Eliminación Directa (Semana 4-5)

**Objetivo:** Generación automática de cuadros justos.

#### 4.1 Algoritmo de Generación

```
Input: jugadores inscriptos N
Output: estructura de árbol binario

PASOS:
1. Calcular siguiente potencia de 2 (nextPowerOf2)
2. Calcular byes = nextPowerOf2 - N
3. Asignar byes a cabezas de serie (top seeds)
4. Emparejar restantes con seeding aleatorio
5. Generar estructura Round → Match

Casos especiales:
- N < 2: Error, mínimo 2 jugadores
- N > nextPowerOf2: entrar en siguiente ronda
```

#### 4.2 Tipos de Cuadro
```
Draw Size: 4, 8, 16, 32, 64, 128

Ejemplo 16 jugadores:
R16 (16 matches) → QF (8 matches) → SF (4) → F (2) → Winner
```

#### 4.3 Lógica de Avance
- Ganador Match → siguiente ronda
- No hayempate (definido por sets o tie-break)
- Bye automático → avanza al siguiente

#### 4.4 Endpoints
- `POST /tournaments/:id/generate-draw` - Generar cuadro (Admin)
- `GET /tournaments/:id/draw` - Ver cuadro actual
- `GET /matches/:id` - Detalle de partido

#### 4.5 Entregables
- [ ] Algoritmo de generación de cuadro
- [ ] Manejo de byes y seeding
- [ ] Estructura de árbol binario
- [ ] Tests del motor

---

### ETAPA 5: Sistema de Match - State Machine (Semana 5-6)

**Objetivo:** Procesar resultados según reglas oficiales de tênis.

#### 5.1 Máquina de Estados del Partido

```
SCHEDULED → IN_PROGRESS → COMPLETED
                │              │
                │              │ + ABANDONED (retired)
                │              │ + WALKOVER (no show)
                └──────────────┘
```

#### 5.2 Reglas de Puntuación Tenis

```
Formatos:
- Best of 3 (standard): Gana 2 de 3 sets
- Best of 5 (Grand Slam): Gana 3 de 5 sets

Game (15-30-40-AD):
- 4 puntos gana game
- 40-40 = Deuce → ventaja → game

Set:
- 6 games + diferencia de 2
- 6-6 → Tie-break (7 puntos, diferencia 2)

Match:
- Gana según mejor de X sets
```

#### 5.3 Casos Especiales
- **RETIRED:** Jugador abandona. Si empezó, el otro gana. Si no started → Walkover.
- **WALKOVER:** No se presentó. Rival avanza automáticamente.
- **COMPLETED:** Estado final inmutable.

#### 5.4 Endpoints
- `POST /matches/:id/start` - Iniciar partido
- `POST /matches/:id/score` - Registrar puntuación
- `POST /matches/:id/complete` - Finalizar (Admin)
- `POST /matches/:id/retired` - Abandono
- `POST /matches/:id/walkover` - No presentación

#### 5.5 Validaciones
- Solo Admin o ambos jugadores pueden reportar
- No modificar resultados de COMPLETED
- Secuencia lógica de puntuación

#### 5.6 Entregables
- [ ] State machine de partido
- [ ] Parser de puntuación tenis
- [ ] Casos especiales (retired/walkover)
- [ ] Tests de scoring

---

### ETAPA 6: Sistema de Ranking (Semana 6-7)

**Objetivo:** Ranking dinámico estilo ATP.

#### 6.1 Modelo de Puntuación

```
Categoría de Torneo → Puntos:
- Grand Slam: 2000/1000 (W/F)
- Masters 1000: 1000/600
- ATP 500: 500/300
- ATP 250: 250/150
- Challenger: 100/50

Sistema de cálculo:
- Mejor X torneos del último año
- X = 18 (ATP standard)
- Solo cuenta mejor resultado por torneo
```

#### 6.2 Recálculo de Ranking

```
Trigger: Tournament.COMPLETED

Proceso:
1. Obtener todos los resultados del torneo
2. Para cada jugador:
   a. Obtener categoría del torneo
   b. Agregar puntos según posición
   c. Recalcular total con top 18
   d. Actualizar posición
3. Persistir PlayerRanking history
4. Broadcast via WebSocket
```

#### 6.3 Concurrencia
- Transaction para consistencia
- Lock en tabla rankings durante recalculo
- Queue para múltiples torneos mismo día

#### 6.4 Endpoints
- `GET /rankings` - Ranking global
- `GET /rankings/:playerId` - Histórico de un jugador
- `GET /rankings/tournaments/:id/impact` - Preview impacto

#### 6.5 WebSocket Events
- `ranking:updated` - Broadcasting en tiempo real

#### 6.6 Entregables
- [ ] Algoritmo de cálculo ATP-style
- [ ] Sistema de categorías
- [ ] Historial histórico por jugador
- [ ] WebSocket para ranking vivo
- [ ] Tests de concurrencia

---

### ETAPA 7: Gestión de Inscripciones y Modalidades (Semana 7-8)

**Objetivo:** Validación de elegibilidad y gestión de doubles/mixed.

#### 7.1 Tipos de Modalidad

```
SINGLES:
- Masculino: solo hombres
- Femenino: solo mujeres

DOUBLES:
- Masculino: 2 hombres
- Femenino: 2 mujeres

MIXED DOUBLES:
- 1 hombre + 1 mujer
```

#### 7.2 Validaciones de Elegibilidad
```
Inscripción a torneo:
- Verificar género del jugador vs categoría
- Para doubles: ambos cumplen requisito
- Para mixed: composición varón-mujer
- Verificar no estar inscripciones duplicadas
```

#### 7.3 Lógica de Puntuación Dobles
```
Para ranking individual:
- Puntos de doubles cuentan para ranking propio
- Ambos jugadores reciben mismos puntos
- Se aplica a ranking masculino/femenino según corresponda
```

#### 7.4 Endpoints
- `POST /tournaments/:id/register` - Inscribirse
- `GET /tournaments/:id/registrations` - Ver inscriptos
- `DELETE /registrations/:id` - Cancelar inscripción
- `POST /tournaments/:id/register-pair` - Inscripción doubles

#### 7.5 Entregables
- [ ] Validador de elegibilidad
- [ ] Gestión de parejas
- [ ] Puntuación doble → ranking individual
- [ ] Tests de modalidad

---

### ETAPA 8: API REST Completa y Documentación (Semana 8-9)

**Objetivo:** Consolidar todos los módulos y documentar.

#### 8.1 Endpoints Consolidados
- Colección completa de endpoints
- Pagination, filtros, sorting
- Manejo de errores centralizado

#### 8.2 Documentación
- Swagger/OpenAPI
- Diagrama de arquitectura
- README con guías de setup

#### 8.3 Entregables
- [ ] API REST completa
- [ ] Documentación Swagger
- [ ] Tests de integración
- [ ] README técnico

---

### ETAPA 9: Optimización y Deploy (Semana 9-10)

**Objetivo:** Preparar para producción.

#### 9.1 Configuraciones
- Environment variables
- Logging (winston/pino)
- Health checks
- Rate limiting

#### 9.2 Optimizaciones
- Índices en BD (playerId, tournamentId, ranking)
- Caching ranking (Redis) - opcional
- Pagination optimizado

#### 9.3 Entregables
- [ ] Configuración producción
- [ ] Scripts de deployment
- [ ] Monitoreo y logging
- [ ] Tests e2e finales

---

## Resumen de Endpoints por Módulo

| Módulo | Endpoints |
|--------|-----------|
| **Auth** | register, login, profile |
| **Users** | list, update, role management |
| **Tournaments** | CRUD, generate-draw, change-status |
| **Matches** | start, score, complete, retired, walkover |
| **Registrations** | register, list, cancel |
| **Rankings** | global, by-player, impact-preview |

---

## Dependencias Principales

```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/common": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/websockets": "^10.0.0",
  "@nestjs/platform-socket.io": "^10.0.0",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.0",
  "passport-local": "^1.0.0",
  "zod": "^3.22.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "bcrypt": "^5.1.0",
  "socket.io": "^4.6.0",
  "jest": "^29.0.0",
  "@types/jest": "^29.0.0"
}
```

---

## Consideraciones de Calidad

1. **Type-safety total** - Todos los inputs validados con Zod/class-validator
2. **Errores significativos** - Custom exceptions con mensajes claros
3. **Testing** - Mínimo 80% coverage en lógica de negocio
4. **Documentación** - OpenAPI actualizado con cada endpoint
5. **Inmutabilidad** - Estados finales (COMPLETED) no modificables