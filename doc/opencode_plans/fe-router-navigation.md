# Plan: Navegación con React Router 7 - Frontend

## Objetivo
Implementar navegación SPA usando React Router 7, donde el menú lateral controle qué componente se renderiza en el área principal.

## Estructura Actual

- Menú hardcoded en `App.tsx`
- `PlayerManagement` siempre renderizado

## Estructura Objetivo

- Routes configuradas con React Router 7
- Navegación basada en URL
- Menú con Links activos

## Rutas a Implementar

| Path | Componente | Descripción |
|------|-----------|-------------|
| Route index | Dashboard (pendiente) | Panel general (cuando URL = `/`) |
| `/tournaments` | TournamentManagement | Gestión de torneos |
| `/players` | PlayerManagement | Gestión de jugadores |
| `/registrations` | (pendiente) | Inscripciones |

**Nota:** Las rutas usarán `<Outlet />` en el layout padre para renderizar el contenido.

## Archivos a Modificar

### frontend/src/App.tsx
- Configurar `BrowserRouter`
- Agregar `<Routes>` y `<Route>`
- Reemplazar menú hardcoded por componentes con `NavLink`
- Agregar estado para opción activa (opcional, si se quiere gestión manual)

### frontend/src/main.tsx
- Envolver app en `BrowserRouter` (si no se hace en App.tsx)

## Componentes a Crear

### frontend/src/components/dashboard/Dashboard.tsx
- Esqueleto básico (placeholder) para el panel general

### frontend/src/components/tournaments/TournamentManagement.tsx
- Esqueleto básico (placeholder) para verificar navegación

## Menú -Items Actuales ( hardcoded)

```
Principal
├── Panel general (/) - pendiente
├── Torneos (/tournaments) - nuevo componente
Gestión
├── Jugadores (/players) - existente
├── Inscripciones (/registrations) - pendiente
```

## Implementación Paso a Paso

1. Crear `Dashboard` placeholder en `frontend/src/components/dashboard/`
2. Crear `TournamentManagement` placeholder en `frontend/src/components/tournaments/`
3. Configurar Router en `App.tsx`:
   - Importar `BrowserRouter`, `Routes`, `Route`, `NavLink`, `Outlet`
   - Crear componente Layout con menú + `<Outlet />`
   - Configurar rutas con Layout como padre (usar Route index para Dashboard en `/`)
4. Actualizar ENDPOINTS.md (o crear)

## Notas

- React Router 7 usa la misma API que react-router-dom v6+
- Los Links del menú deben usar el componente `NavLink` para estilos activos automáticos
- El componente `TournamentManagement` puede reusear estructura similar a `PlayerManagement`

## Validaciones Post-Implementación

- Al acceder a `/` sin path adicional muestra Dashboard (Route index)
- Click en "Panel general" navega a `/` y muestra Dashboard
- Click en "Torneos" navega a `/tournaments` y muestra TournamentManagement
- Click en "Jugadores" navega a `/players` y muestra PlayerManagement
- La URL cambia correctamente
- Back/Forward del browser funcionan