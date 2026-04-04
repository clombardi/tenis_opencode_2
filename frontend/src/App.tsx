import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';

import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <AppBar position="static" sx={{ bgcolor: blue[700] }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AceManager
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>
          AceManager - Gestión de jugadores
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
