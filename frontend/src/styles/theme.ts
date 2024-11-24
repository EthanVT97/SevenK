import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
    palette: {
        primary: {
            main: '#B8860B', // Myanmar gold
            light: '#DAA520',
            dark: '#8B6914',
        },
        secondary: {
            main: '#8B4513', // Bagan temple brown
            light: '#A0522D',
            dark: '#6B3E0F',
        },
        background: {
            default: '#FFF8DC', // Cream color for background
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: [
            'Pyidaungsu',
            'Myanmar3',
            'Padauk',
            'Arial',
            'sans-serif'
        ].join(','),
        h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
            color: '#8B4513',
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 500,
            color: '#8B4513',
        },
        body1: {
            fontSize: '1rem',
            color: '#333333',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontSize: '1rem',
                    padding: '8px 24px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
                },
            },
        },
    },
};

export const theme = createTheme(themeOptions); 