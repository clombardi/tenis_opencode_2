# Plan: Menú de acciones en tabla de torneos

## Objetivo
Reemplazar los botones "Editar" e "Inscripciones" por un menú de tres puntos verticales con acciones contextuales según el estado del torneo.

## Archivo a modificar
`frontend/src/components/tournaments/TournamentManagement.tsx`

## Cambios requeridos

### 1. Agregar imports necesarios
```typescript
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import BlockIcon from '@mui/icons-material/Block';
import GroupsIcon from '@mui/icons-material/Groups';
```

### 2. Agregar estado para el menú
```typescript
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tournament: Tournament) => {
  setAnchorEl(event.currentTarget);
  setSelectedTournament(tournament);
};

const handleMenuClose = () => {
  setAnchorEl(null);
  setSelectedTournament(null);
};
```

### 3. Reemplazar botones por menú
- Línea 294-321: reemplazar el Box con los dos botones por un IconButton que abre el menú

### 4. Agregar opciones del menú según estado
- **DRAFT**: "Editar" (EditIcon), "Abrir inscripción" (HowToRegIcon)
- **REGISTRATION**: "Manejar inscripciones" (GroupsIcon), "Cerrar inscripciones" (BlockIcon)

### 5. Handler para acciones
```typescript
const handleMenuAction = (action: string) => {
  handleMenuClose();
  if (!selectedTournament) return;
  
  switch (action) {
    case 'edit':
      handleEdit(selectedTournament);
      break;
    case 'openRegistration':
      console.log('Abrir inscripción', selectedTournament.id);
      break;
    case 'manageRegistrations':
      handleRegistrations(selectedTournament);
      break;
    case 'closeRegistration':
      console.log('Cerrar inscripciones', selectedTournament.id);
      break;
  }
};
```

## Validaciones
- Ejecutar lint/typecheck del frontend
- Verificar que el menú se abra al hacer click en los tres puntos
- Verificar que las opciones sean correctas según el estado