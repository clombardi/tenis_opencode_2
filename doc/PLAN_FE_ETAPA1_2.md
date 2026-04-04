# Plan de Implementación - FE Etapa 1.2: Gestión de Jugadores

## Extensión del modelo de datos

### Campos agregados

Se agregan al modelo `Player` dos campos que existían en el mockup pero no en el modelo original:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| documento | String? | Número de documento del jugador |
| mano | Hand? | Mano hábil (DIESTRO o ZURDO) |

### Enum Hand

```prisma
enum Hand {
  DIESTRO
  ZURDO
}
```

---

## Backend - Cambios requeridos

### 1. schema.prisma
- Agregar enum `Hand`
- Agregar campo `documento` (String, opcional)
- Agregar campo `mano` (Hand, opcional)

### 2. DTOs
- `CreatePlayerDto`: agregar `documento?`, `mano?`
- `UpdatePlayerDto`: agregar `documento?`, `mano?`

### 3. Seed
- Generar `documento` aleatorio para cada jugador (formato: XX-XXXXXXXX)
- Asignar `mano` aleatoria (DIESTRO o ZURDO) a cada jugador

---

## Frontend - Implementación

### Tecnologías

- **Framework**: React 19
- **UI**: Material UI 7
- **Palette**: Material Design 2014 (usar constantes de MUI, ej. indigo[500], blue[700])
- **HTTP**: Axios

### Estructura del proyecto

```
frontend/
├── src/
│   ├── components/
│   │   ├── PlayerTable.tsx
│   │   ├── PlayerForm.tsx
│   │   └── ...
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── player.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

### Funcionalidades

1. **Listar jugadores**: GET /players con filtros por género
2. **Crear jugador**: POST /players con formulario
3. **Editar jugador**: PUT /players/:id
4. **Eliminar jugador**: DELETE /players/:id
5. **Seed de desarrollo**: POST /seed/players

### Diseño

Adaptación del mockup `doc/mockups/player-table.html`:

| Columna | Campo BE | Notas |
|---------|----------|-------|
| Nombre y apellido | firstName + lastName | Combinar en una columna |
| Documento | documento | Nuevo campo |
| Fecha nac. | birthDate | Formato DD/MM/YYYY |
| Nacionalidad | country | Mostrar país |
| Mano | mano | Badge: Diestro/Zurdo |
| Género | gender | Badge: Masc./Fem. |
| Acciones | - | Editar / Eliminar |

**Nota**: Las columnas "Ranking" del mockup no se implementan (fuera del alcance).

### Colores MUI a utilizar

Basados en el mockup (Material Design 2014):

- Primary: `indigo[500]` (#3F51B5)
- Primary dark: `indigo[700]` (#303F9F)
- Primary light: `indigo[100]` (#C5CAE9)
- Secondary: `blue[700]` (#1976D2)
- Background: `blue[50]` (#E3F2FD)
- Text primary: `indigo[900]` (#1A237E)
- Text secondary: `blue[800]` (#1565C0)

---

## Archivos a crear/modificar

### Backend

- `backend/prisma/schema.prisma`
- `backend/src/players/dto/player.dto.ts`
- `backend/src/players/players.service.ts`
- `backend/src/players/players.controller.ts`
- `backend/ENDPOINTS.md`

### Frontend (nuevo)

- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `frontend/index.html`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/types/player.ts`
- `frontend/src/services/api.ts`
- `frontend/src/components/PlayerTable.tsx`
- `frontend/src/components/PlayerForm.tsx`
- `frontend/src/theme.ts`
- `doc/insomnia/etapa_1.2_v2.json`

---

## Orden de implementación sugerido

1. Backend: schema.prisma + DTOs + Seed
2. Frontend: setup proyecto + theme + API service
3. Frontend: PlayerTable component
4. Frontend: PlayerForm component (create/edit)
5. Frontend: Integración completa
6. Insomnia: actualizar colección
