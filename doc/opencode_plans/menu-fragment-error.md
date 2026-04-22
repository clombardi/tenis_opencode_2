# Análisis: Error MUI Menu con Fragment

## Ubicación del error
`frontend/src/components/tournaments/TournamentManagement.tsx`, líneas 346-369

## Causa
El uso de Fragment (`<>...</>`) como hijos directos del componente `Menu`:

```tsx
{tournament.status === 'DRAFT' && (
  <>
    <MenuItem>...</MenuItem>
    <MenuItem>...</MenuItem>
  </>
)}
{tournament.status === 'REGISTRATION' && (
  <>
    <MenuItem>...</MenuItem>
    <MenuItem>...</MenuItem>
  </>
)}
```

MUI v7 no permite Fragment como hijo directo de Menu.

## Solución
Calcular los items del menú antes del render y pasarlos como array:

```tsx
const getMenuItems = (status: string) => {
  if (status === 'DRAFT') {
    return [
      { label: 'Editar', icon: <EditIcon />, action: 'edit' },
      { label: 'Abrir inscripción', icon: <HowToRegIcon />, action: 'openRegistration' },
    ];
  }
  if (status === 'REGISTRATION') {
    return [
      { label: 'Manejar inscripciones', icon: <GroupsIcon />, action: 'manageRegistrations' },
      { label: 'Cerrar inscripciones', icon: <BlockIcon />, action: 'closeRegistration' },
    ];
  }
  return [];
};

const menuItems = getMenuItems(tournament.status);

// En el render:
<Menu>
  {menuItems.map((item) => (
    <MenuItem key={item.action} onClick={() => handleMenuAction(item.action)}>
      <ListItemIcon>{item.icon}</ListItemIcon>
      <ListItemText>{item.label}</ListItemText>
    </MenuItem>
  ))}
</Menu>
```