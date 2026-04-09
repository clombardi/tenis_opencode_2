import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';

import theme from './theme';
import PlayerManagement from './components/players/PlayerManagement';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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

        <Box sx={{ display: 'flex', flex: 1 }}>
          <Box sx={{ width: 200, bgcolor: blue[600], p: 2 }}>
            <Typography sx={{ fontSize: 9, fontWeight: 600, color: blue[200], letterSpacing: 1.2, textTransform: 'uppercase', mb: 1 }}>
              Principal
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 1, color: blue[100], fontSize: 13, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
              <Box sx={{ width: 16, height: 16 }}>📊</Box>
              Panel general
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 1, color: blue[100], fontSize: 13, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
              <Box sx={{ width: 16, height: 16 }}>🏆</Box>
              Torneos
            </Box>
            <Typography sx={{ fontSize: 9, fontWeight: 600, color: blue[200], letterSpacing: 1.2, textTransform: 'uppercase', mt: 2, mb: 1 }}>
              Gestión
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 1, bgcolor: 'rgba(255,255,255,0.15)', borderLeft: '3px solid', borderColor: blue[200], color: '#fff', fontSize: 13, cursor: 'pointer' }}>
              <Box sx={{ width: 16, height: 16 }}>👤</Box>
              Jugadores
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 1, color: blue[100], fontSize: 13, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
              <Box sx={{ width: 16, height: 16 }}>📝</Box>
              Inscripciones
            </Box>
          </Box>

          <PlayerManagement />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
