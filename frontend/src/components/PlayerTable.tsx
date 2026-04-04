import { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Box, Typography, TextField, InputAdornment,
  Button, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { blue, indigo, green, orange } from '@mui/material/colors';
import { playersApi, type Player } from '../services/api';

interface PlayerTableProps {
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
  refreshKey: number;
}

export default function PlayerTable({ onEdit, onDelete: _onDelete, refreshKey }: PlayerTableProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('');

  useEffect(() => {
    loadPlayers();
  }, [refreshKey, genderFilter]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (genderFilter) params.gender = genderFilter;
      const { data } = await playersApi.getAll(params);
      setPlayers(data);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar jugador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 260,
            '& .MuiOutlinedInput-root': {
              bgcolor: blue[50],
              '& fieldset': { borderColor: blue[200] },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography sx={{ color: blue[400], fontSize: 18 }}>🔍</Typography>
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Género</InputLabel>
          <Select
            value={genderFilter}
            label="Género"
            onChange={(e) => setGenderFilter(e.target.value)}
            sx={{ bgcolor: blue[50], '& fieldset': { borderColor: blue[200] } }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="MALE">Masculino</MenuItem>
            <MenuItem value="FEMALE">Femenino</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ ml: 'auto' }}>
          <Chip label={`${filteredPlayers.length} jugadores`} sx={{ bgcolor: blue[50], color: blue[800], borderColor: blue[200] }} />
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: `0.5px solid ${blue[200]}` }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: indigo[500] }}>
              <TableCell sx={{ color: blue[100], width: '18%' }}>Nombre y apellido</TableCell>
              <TableCell sx={{ color: blue[100], width: '11%' }}>Documento</TableCell>
              <TableCell sx={{ color: blue[100], width: '10%' }}>Fecha nac.</TableCell>
              <TableCell sx={{ color: blue[100], width: '10%' }}>Nacionalidad</TableCell>
              <TableCell sx={{ color: blue[100], width: '9%' }}>Mano</TableCell>
              <TableCell sx={{ color: blue[100], width: '8%' }}>Género</TableCell>
              <TableCell sx={{ color: blue[100], width: '8%' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPlayers.map((player) => (
              <TableRow
                key={player.id}
                sx={{
                  borderBottom: `0.5px solid ${blue[100]}`,
                  '&:hover': { bgcolor: blue[50] },
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 28, height: 28, borderRadius: '50%',
                        bgcolor: indigo[500], display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 10, fontWeight: 600,
                      }}
                    >
                      {getInitials(player.firstName, player.lastName)}
                    </Box>
                    <Typography sx={{ fontWeight: 500, color: indigo[900], fontSize: 12 }}>
                      {player.firstName} {player.lastName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: indigo[900], fontSize: 12 }}>{player.documento || '-'}</TableCell>
                <TableCell sx={{ color: indigo[900], fontSize: 12 }}>{formatDate(player.birthDate)}</TableCell>
                <TableCell sx={{ fontSize: 14 }}>{player.country || '-'}</TableCell>
                <TableCell>
                  {player.mano ? (
                    <Chip
                      label={player.mano === 'DIESTRO' ? 'Diestro' : 'Zurdo'}
                      size="small"
                      sx={{
                        bgcolor: player.mano === 'DIESTRO' ? green[50] : orange[50],
                        color: player.mano === 'DIESTRO' ? green[800] : orange[800],
                        fontSize: 10,
                      }}
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={player.gender === 'MALE' ? 'Masc.' : 'Fem.'}
                    size="small"
                    sx={{
                      bgcolor: player.gender === 'MALE' ? blue[100] : '#FCE4EC',
                      color: player.gender === 'MALE' ? indigo[900] : '#880E4F',
                      fontSize: 10,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => onEdit(player)}
                    sx={{
                      fontSize: 10,
                      color: blue[800],
                      border: `0.5px solid ${blue[200]}`,
                      '&:hover': { bgcolor: blue[100] },
                    }}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, px: 1 }}>
        <Typography variant="body2" sx={{ color: blue[800], fontSize: 11 }}>
          Mostrando {filteredPlayers.length} de {players.length} jugadores
        </Typography>
      </Box>
    </Box>
  );
}