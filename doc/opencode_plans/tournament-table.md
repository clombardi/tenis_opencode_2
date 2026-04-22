# Plan: Tabla de Torneos en TournamentManagement

## Objetivo
Reemplazar el placeholder actual en `frontend/src/components/tournaments/TournamentManagement.tsx` por una tabla completa de torneos con búsqueda FE, según el diseño del mockup `doc/mockups/tennis-torneos.html`.

## Archivos a modificar/crear

### 1. `frontend/src/services/api.ts` - Agregar tipos y API para torneos

**Agregar tipo Tournament:**
```typescript
export interface Tournament {
  id: string;
  name: string;
  categoryId: string;
  category: { name: string; code: string };
  genderCategory: 'MASCULINE' | 'FEMININE' | 'MIXED';
  mode: 'SINGLES' | 'DOUBLES' | 'MIXED_DOBLES';
  drawSize: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'REGISTRATION' | 'ORGANIZING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}
```

**Agregar tournamentsApi:**
```typescript
export const tournamentsApi = {
  getAll: (params?: { status?: string; genderCategory?: string; mode?: string }) =>
    api.get<Tournament[]>('/tournaments', { params }),
  getById: (id: string) => api.get<Tournament>(`/tournaments/${id}`),
  create: (data: CreateTournamentDto) => api.post<Tournament>('/tournaments', data),
  update: (id: string, data: UpdateTournamentDto) => api.put<Tournament>(`/tournaments/${id}`, data),
  delete: (id: string) => api.delete(`/tournaments/${id}`),
};
```

### 2. `frontend/src/components/tournaments/TournamentManagement.tsx` - Reemplazar contenido

Reemplazar todo el componente con la implementación completa de la tabla:

**Imports necesarios:**
```typescript
import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TableFooter, IconButton
} from '@mui/material';
import { blue, indigo, green, amber, red, teal, purple, pink, orange } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { tournamentsApi, type Tournament } from '../../services/api';
```

**Estado local:**
- `tournaments`: Tournament[] - lista de torneos cargados del API
- `loading`: boolean - estado de carga
- `search`: string - texto de búsqueda FE

**Funciones necesarias:**
- `loadTournaments()` - carga datos del API
- `filteredTournaments` - filtra por búsqueda en `name` (FE)
- `getCategoryColor(gender)` - retorna color de fondo según género:
  - MASCULINE → blue[50] (#E3F2FD)
  - FEMININE → pink[50] (#FCE4EC)
  - MIXED → purple[50] (#E1BEE7)
- `getCategoryIconColor(gender)` - retorna color del ícono según género:
  - MASCULINE → indigo[700]
  - FEMININE → pink[700]
  - MIXED → purple[700]

**Componentes UI:**

1. **Header**: Título + botón "Nuevo Torneo"
2. **Stats strip** (optativo, ver si se incluye o no)
3. **Toolbar**: 
   - Search box con SearchIcon, input "Buscar torneo..."
   - NO incluye filtros (como indica el usuario)
   - Contador de torneos a la derecha
4. **Tabla** con columnas:
   - Nombre (con ícono according al género + nombre + categoría)
   - Fecha Inicio
   - Fecha Fin
   - Modalidad (badge: singles/doubles/mixdobles)
   - Género (badge: masc/fem/mixed)
   - Cuadro (draw pill)
   - Estado (status badge según estado)
   - Acciones (2 botones: "Editar" + "Inscripciones")

**Badges y estados** (según mockup):
```
Modalidad:
- SINGLES    → bgcolor: blue[100], color: blue[800]
- DOUBLES   → bgcolor: orange[100], color: orange[700]
- MIXED_DOBLES → bgcolor: pink[100], color: pink[700]

Género:
- MASCULINE → bgcolor: blue[50], color: indigo[900]
- FEMININE  → bgcolor: pink[50], color: pink[700]
- MIXED    → bgcolor: purple[50], color: purple[700]

Estado:
- DRAFT         → bgcolor: grey[200], color: grey[700], dot: grey[500]
- REGISTRATION → bgcolor: blue[100], color: blue[800], dot: blue[500]
- ORGANIZING   → bgcolor: amber[100], color: amber[800], dot: amber[800]
- IN_PROGRESS  → bgcolor: green[100], color: green[700], dot: green[700]
- COMPLETED   → bgcolor: teal[100], color: teal[700], dot: teal[700]
- CANCELLED  → bgcolor: red[100], color: red[700], dot: red[700]
```

**Botones de acción** (en última columna):
- "Editar": Same styling que PlayerTable (líneas 168-179 de PlayerTable.tsx)
  - small size, fontSize: 10, color: blue[800], border: 0.5px solid blue[200]
- "Inscripciones": Similar a "Editar" pero con otro color/symbol

**Formateo de fechas:**
- `date.toLocaleDateString('es-AR')` → "dd / mm / yyyy"

## Detalles de implementación

### Colores de las copas (ícono de torneo)
Según el mockup (líneas 545, 569, 593, etc.), el ícono de la copa tiene:
- Background: según género (blue[50], pink[50], purple[50])
- Icon color: según género (blue[700], pink[700], purple[700])

### Estructura de celda "Nombre"
```
[Icono 36x36 con color según género] [Nombre (tournament-name)] [Categoría (tournament-category)]
```

### Draw Size pill
```
draw-pill style:
- bgcolor: grey[100]
- border: 1px solid grey[300]
- borderRadius: 6px
- padding: 2px 10px
- fontFamily: Barlow Condensed, fontSize: 16, fontWeight: 700
```

## Pasos de implementación

1. Agregar tipos Tournament y tournamentsApi en `api.ts`
2. Reemplazar completamente `TournamentManagement.tsx` con:
   a. Imports
   b. Interfaces/funciones auxiliares
   c. Estado y efectos
   d. Render de header, toolbar, tabla, footer
3. **No implementar comportamiento** de los botones (por ahora)

## Notas
- La búsqueda es FE (filter en memoria sobre `name`)
- Los 3 filtros de estado/género/modalidad del mockup NO se incluyen
- Los botones "Editar" e "Inscripciones" son visuales nomás
- Pagination no incluida por ahora (si el backend no soporta paginación)