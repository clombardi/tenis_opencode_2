import { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { blue, indigo } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';

import theme from './theme';
import PlayerTable from './components/PlayerTable';
import PlayerForm from './components/PlayerForm';
import { type Player } from './services/api';

function App() {
  const [openForm, setOpenForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNew = () => {
    setEditingPlayer(null);
    setOpenForm(true);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setOpenForm(true);
  };

  const handleSave = () => {
    setRefreshKey(k => k + 1);
  };

  const handleClose = () => {
    setOpenForm(false);
    setEditingPlayer(null);
  };

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

          <Box sx={{ flex: 1, p: 2.5, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography sx={{ fontFamily: 'Barlow Condensed', fontSize: 22, fontWeight: 600, color: indigo[900], letterSpacing: 0.3 }}>
                  Jugadores
                </Typography>
                <Typography sx={{ fontSize: 12, color: blue[800], mt: 0.25 }}>
                  Gestión de jugadores registrados en el sistema
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNew}
                sx={{ bgcolor: indigo[500], '&:hover': { bgcolor: indigo[700] }, fontSize: 12, fontWeight: 500 }}
              >
                Nuevo jugador
              </Button>
            </Box>

            <PlayerTable
              onEdit={handleEdit}
              onDelete={() => {}}
              refreshKey={refreshKey}
            />
          </Box>
        </Box>
      </Box>

      <PlayerForm
        open={openForm}
        onClose={handleClose}
        player={editingPlayer}
        onSave={handleSave}
      />
    </ThemeProvider>
  );
}

export default App;