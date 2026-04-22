import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import { BrowserRouter, Routes, Route, NavLink, Outlet } from 'react-router-dom';

import theme from './theme';
import PlayerManagement from './components/players/PlayerManagement';
import TournamentManagement from './components/tournaments/TournamentManagement';
import Dashboard from './components/dashboard/Dashboard';

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      style={{ textDecoration: 'none' }}
    >
      {({ isActive }) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.75,
            px: 1,
            color: isActive ? '#fff' : blue[100],
            bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            borderLeft: isActive ? '3px solid' : '3px solid transparent',
            borderColor: isActive ? blue[200] : 'transparent',
            fontSize: 13,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          {children}
        </Box>
      )}
    </NavLink>
  );
}

function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: blue[50] }}>
      <AppBar position="static" sx={{ bgcolor: blue[700] }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28, height: 28, borderRadius: '50%',
                bgcolor: blue[300], display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: 10, color: '#fff' }}>🎾</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontFamily: 'Barlow Condensed', letterSpacing: 0.5 }}>
              AceManager
            </Typography>
            <Typography sx={{ fontSize: 12, color: blue[200], ml: 0.5 }}>
              · Gestión de torneos de tenis
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 12, color: blue[200] }}>Admin</Typography>
            <Box
              sx={{
                width: 30, height: 30, borderRadius: '50%',
                bgcolor: blue[700], border: `1.5px solid ${blue[300]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color: '#fff',
              }}
            >
              AD
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)' }}>
          <Box sx={{ width: 200, bgcolor: blue[600], p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 9, fontWeight: 600, color: blue[200], letterSpacing: 1.2, textTransform: 'uppercase', mb: 1 }}>
                Principal
              </Typography>
              <MenuLink to="/">
                <Box sx={{ width: 16, height: 16 }}>📊</Box>
                Panel general
              </MenuLink>
              <MenuLink to="/tournaments">
                <Box sx={{ width: 16, height: 16 }}>🏆</Box>
                Torneos
              </MenuLink>
              <Typography sx={{ fontSize: 9, fontWeight: 600, color: blue[200], letterSpacing: 1.2, textTransform: 'uppercase', mt: 2, mb: 1 }}>
                Gestión
              </Typography>
              <MenuLink to="/players">
                <Box sx={{ width: 16, height: 16 }}>👤</Box>
                Jugadores
              </MenuLink>
              <MenuLink to="/registrations">
                <Box sx={{ width: 16, height: 16 }}>📝</Box>
                Inscripciones
              </MenuLink>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </Box>
        </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tournaments" element={<TournamentManagement />} />
            <Route path="players" element={<PlayerManagement />} />
            <Route path="registrations" element={<Box sx={{ p: 3 }}><Typography>Inscripciones - en construcción</Typography></Box>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;