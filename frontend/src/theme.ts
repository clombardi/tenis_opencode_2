import { createTheme } from '@mui/material/styles';
import { indigo, blue } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: indigo[500],
      light: indigo[100],
      dark: indigo[700],
      contrastText: '#fff',
    },
    secondary: {
      main: blue[700],
      light: blue[50],
      dark: blue[800],
      contrastText: '#fff',
    },
    background: {
      default: blue[50],
      paper: '#FAFBFF',
    },
    text: {
      primary: indigo[900],
      secondary: blue[800],
    },
  },
  typography: {
    fontFamily: 'Barlow, Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;