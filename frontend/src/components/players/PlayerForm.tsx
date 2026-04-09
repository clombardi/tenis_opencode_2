import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, FormControl, InputLabel, Select, Box
} from '@mui/material';
import { blue, indigo } from '@mui/material/colors';
import { playersApi, type Player, type CreatePlayerDto } from '../../services/api';
import { usePlayerValidation } from './usePlayerValidation';

interface PlayerFormProps {
  open: boolean;
  onClose: () => void;
  player: Player | null;
  onSave: () => void;
}

export default function PlayerForm({ open, onClose, player, onSave }: PlayerFormProps) {
  const [formData, setFormData] = useState<CreatePlayerDto>({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'MALE',
    documento: '',
    mano: undefined,
    country: '',
    birthDate: '',
  });
  const [saving, setSaving] = useState(false);
  const { validateField, validateAll, errorTextToShow, shouldDisableSave, reset } = usePlayerValidation();

  useEffect(() => {
    if (open) {
      reset();
      if (player) {
        setFormData({
          firstName: player.firstName,
          lastName: player.lastName,
          email: player.email,
          gender: player.gender,
          documento: player.documento || '',
          mano: player.mano,
          country: player.country || '',
          birthDate: player.birthDate ? player.birthDate.split('T')[0] : '',
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          gender: 'MALE',
          documento: '',
          mano: undefined,
          country: '',
          birthDate: '',
        });
      }
    }
  }, [player, open, reset]);

  const handleChange = (field: keyof CreatePlayerDto, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, String(value));
  };

  const handleSubmit = async () => {
    if (!validateAll(formData)) {
      return;
    }

    try {
      setSaving(true);
      const data: Record<string, unknown> = { ...formData };
      if (formData.birthDate) {
        data.birthDate = formData.birthDate + 'T00:00:00.000Z';
      }
      if (!data.documento) delete data.documento;
      if (!data.mano) delete data.mano;
      if (!data.country) delete data.country;

      if (player) {
        await playersApi.update(player.id, data);
      } else {
        await playersApi.create(data as unknown as CreatePlayerDto);
      }
      onSave();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: indigo[500], color: '#fff' }}>
        {player ? 'Editar Jugador' : 'Nuevo Jugador'}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Nombre"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              fullWidth
              required
              error={!!errorTextToShow('firstName')}
              helperText={errorTextToShow('firstName')}
            />
            <TextField
              label="Apellido"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              fullWidth
              required
              error={!!errorTextToShow('lastName')}
              helperText={errorTextToShow('lastName')}
            />
          </Box>

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            fullWidth
            required
            disabled={!!player}
            error={!!errorTextToShow('email')}
            helperText={errorTextToShow('email')}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Documento"
              value={formData.documento}
              onChange={(e) => handleChange('documento', e.target.value)}
              fullWidth
              error={!!errorTextToShow('documento')}
              helperText={errorTextToShow('documento')}
            />
            <FormControl fullWidth>
              <InputLabel>Mano</InputLabel>
              <Select
                value={formData.mano || ''}
                label="Mano"
                onChange={(e) => handleChange('mano', e.target.value || undefined)}
              >
                <MenuItem value="">Sin especificar</MenuItem>
                <MenuItem value="DIESTRO">Diestro</MenuItem>
                <MenuItem value="ZURDO">Zurdo</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Género</InputLabel>
              <Select
                value={formData.gender}
                label="Género"
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <MenuItem value="MALE">Masculino</MenuItem>
                <MenuItem value="FEMALE">Femenino</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Nacionalidad"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              fullWidth
            />
          </Box>

          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errorTextToShow('birthDate')}
            helperText={errorTextToShow('birthDate')}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: blue[800] }}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ bgcolor: indigo[500], '&:hover': { bgcolor: indigo[700] } }}
          disabled={saving || shouldDisableSave()}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
