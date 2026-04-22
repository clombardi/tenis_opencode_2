import { Box, Typography } from '@mui/material';

export default function Dashboard() {
  return (
    <Box sx={{ p: 3, minHeight: '100%', flex: 1 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Panel General
      </Typography>
      <Typography color="text.secondary">
        Dashboard en construcción...
      </Typography>
    </Box>
  );
}