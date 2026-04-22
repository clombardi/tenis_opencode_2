import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { blue, indigo, green, amber, red, teal, purple, pink, orange, grey } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import GroupsIcon from '@mui/icons-material/Groups';
import BlockIcon from '@mui/icons-material/Block';
import { tournamentsApi, type Tournament } from '../../services/api';

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const { data } = await tournamentsApi.getAll();
      setTournaments(data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryColors = (gender: string) => {
    switch (gender) {
      case 'MASCULINE':
        return { bg: blue[50], icon: indigo[700] };
      case 'FEMININE':
        return { bg: pink[50], icon: pink[700] };
      case 'MIXED':
        return { bg: purple[50], icon: purple[700] };
      default:
        return { bg: blue[50], icon: indigo[700] };
    }
  };

  const getModeBadgeColors = (mode: string) => {
    switch (mode) {
      case 'SINGLES':
        return { bg: blue[100], color: blue[800] };
      case 'DOUBLES':
        return { bg: orange[100], color: orange[700] };
      case 'MIXED_DOBLES':
        return { bg: pink[100], color: pink[700] };
      default:
        return { bg: blue[100], color: blue[800] };
    }
  };

  const getGenderBadgeColors = (gender: string) => {
    switch (gender) {
      case 'MASCULINE':
        return { bg: blue[50], color: indigo[900], label: 'Masc.' };
      case 'FEMININE':
        return { bg: pink[50], color: pink[700], label: 'Fem.' };
      case 'MIXED':
        return { bg: purple[50], color: purple[700], label: 'Mixto' };
      default:
        return { bg: blue[50], color: indigo[900], label: gender };
    }
  };

  const getStatusBadgeColors = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { bg: grey[200], color: grey[700], dot: grey[500], label: 'Borrador' };
      case 'REGISTRATION':
        return { bg: blue[100], color: blue[800], dot: blue[500], label: 'Inscripción' };
      case 'ORGANIZING':
        return { bg: amber[100], color: amber[800], dot: amber[800], label: 'Organizando' };
      case 'IN_PROGRESS':
        return { bg: green[100], color: green[700], dot: green[700], label: 'En Curso' };
      case 'COMPLETED':
        return { bg: teal[100], color: teal[700], dot: teal[700], label: 'Completado' };
      case 'CANCELLED':
        return { bg: red[100], color: red[700], dot: red[700], label: 'Cancelado' };
      default:
        return { bg: grey[200], color: grey[700], dot: grey[500], label: status };
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'SINGLES':
        return 'Singles';
      case 'DOUBLES':
        return 'Dobles';
      case 'MIXED_DOBLES':
        return 'Dobles Mixtos';
      default:
        return mode;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR');
  };

  const handleNew = () => {
    console.log('Nuevo torneo');
  };

  const handleEdit = (tournament: Tournament) => {
    console.log('Editar', tournament.id);
  };

  const handleRegistrations = (tournament: Tournament) => {
    console.log('Inscripciones', tournament.id);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tournament: Tournament) => {
    setAnchorEl(event.currentTarget);
    setSelectedTournament(tournament);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTournament(null);
  };

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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, p: 2.5, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: 'Barlow Condensed', fontSize: 22, fontWeight: 600, color: indigo[900], letterSpacing: 0.3 }}>
            Torneos
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
            Gestión de torneos del sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNew}
          sx={{ bgcolor: indigo[500], '&:hover': { bgcolor: indigo[700] }, fontSize: 12, fontWeight: 500 }}
        >
          Nuevo Torneo
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: `0.5px solid ${blue[200]}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: `0.5px solid ${blue[200]}` }}>
          <TextField
            size="small"
            placeholder="Buscar torneo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: 260,
              '& .MuiOutlinedInput-root': {
                bgcolor: grey[100],
                '& fieldset': { borderColor: grey[300] },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: grey[500], fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ ml: 'auto' }}>
            <Chip
              label={`${filteredTournaments.length} torneos`}
              sx={{ bgcolor: blue[50], color: blue[800], borderColor: blue[200] }}
            />
          </Box>
        </Box>

        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: indigo[500] }}>
              <TableCell sx={{ color: blue[100], width: '20%' }}>Nombre</TableCell>
              <TableCell sx={{ color: blue[100], width: '12%' }}>Fecha Inicio</TableCell>
              <TableCell sx={{ color: blue[100], width: '12%' }}>Fecha Fin</TableCell>
              <TableCell sx={{ color: blue[100], width: '10%' }}>Modalidad</TableCell>
              <TableCell sx={{ color: blue[100], width: '9%' }}>Género</TableCell>
              <TableCell sx={{ color: blue[100], width: '8%' }}>Cuadro</TableCell>
              <TableCell sx={{ color: blue[100], width: '12%' }}>Estado</TableCell>
              <TableCell sx={{ color: blue[100], width: '17%' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTournaments.map((tournament) => {
              const categoryColors = getCategoryColors(tournament.genderCategory);
              const modeBadge = getModeBadgeColors(tournament.mode);
              const genderBadge = getGenderBadgeColors(tournament.genderCategory);
              const statusBadge = getStatusBadgeColors(tournament.status);

              return (
                <TableRow
                  key={tournament.id}
                  sx={{
                    borderBottom: `0.5px solid ${grey[200]}`,
                    '&:hover': { bgcolor: blue[50] },
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 36, height: 36, borderRadius: 1,
                          bgcolor: categoryColors.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <EmojiEventsIcon sx={{ fontSize: 20, color: categoryColors.icon }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: indigo[800], fontSize: 13 }}>
                          {tournament.name}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: grey[500], mt: 0.25 }}>
                          {tournament.category.name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: grey[700] }}>
                    {formatDate(tournament.startDate)}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: grey[700] }}>
                    {formatDate(tournament.endDate)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getModeLabel(tournament.mode)}
                      size="small"
                      sx={{
                        bgcolor: modeBadge.bg,
                        color: modeBadge.color,
                        fontSize: 10, fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={genderBadge.label}
                      size="small"
                      sx={{
                        bgcolor: genderBadge.bg,
                        color: genderBadge.color,
                        fontSize: 10, fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: grey[100], border: `1px solid ${grey[300]}`,
                        borderRadius: 1, px: 1.25, py: 0.25,
                        fontFamily: 'Barlow Condensed', fontSize: 14, fontWeight: 700,
                        color: indigo[900], minWidth: 36,
                      }}
                    >
                      {tournament.drawSize}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.75,
                        px: 1.25, py: 0.5, borderRadius: 3,
                        bgcolor: statusBadge.bg, color: statusBadge.color,
                        fontSize: 11, fontWeight: 600,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6, height: 6, borderRadius: '50%',
                          bgcolor: statusBadge.dot,
                        }}
                      />
                      {statusBadge.label}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, tournament)}
                      sx={{ color: grey[600] }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedTournament?.id === tournament.id}
                      onClose={handleMenuClose}
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      {tournament.status === 'DRAFT' && (
                        <>
                          <MenuItem onClick={() => handleMenuAction('edit')}>
                            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Editar</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => handleMenuAction('openRegistration')}>
                            <ListItemIcon><HowToRegIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Abrir inscripción</ListItemText>
                          </MenuItem>
                        </>
                      )}
                      {tournament.status === 'REGISTRATION' && (
                        <>
                          <MenuItem onClick={() => handleMenuAction('manageRegistrations')}>
                            <ListItemIcon><GroupsIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Manejar inscripciones</ListItemText>
                          </MenuItem>
                          <MenuItem onClick={() => handleMenuAction('closeRegistration')}>
                            <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Cerrar inscripciones</ListItemText>
                          </MenuItem>
                        </>
                      )}
                    </Menu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}