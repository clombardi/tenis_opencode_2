import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { indigo } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';

import PlayerTable from './PlayerTable';
import PlayerForm from './PlayerForm';
import { type Player } from '../../services/api';

export default function PlayerManagement() {
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
    <Box sx={{ flex: 1, p: 2.5, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: 'Barlow Condensed', fontSize: 22, fontWeight: 600, color: indigo[900], letterSpacing: 0.3 }}>
            Jugadores
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
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

      <PlayerForm
        open={openForm}
        onClose={handleClose}
        player={editingPlayer}
        onSave={handleSave}
      />
    </Box>
  );
}
