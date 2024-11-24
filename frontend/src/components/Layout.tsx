import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }: { theme: Theme }) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
    boxShadow: '0 3px 5px 2px rgba(184, 134, 11, .3)',
}));

const PageWrapper = styled(Box)(({ theme }: { theme: Theme }) => ({
    minHeight: '100vh',
    background: theme.palette.background.default,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("/images/bagan-pattern.png")',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px',
        opacity: 0.1,
        zIndex: -1,
    }
}));

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <Box>
            <StyledAppBar position="sticky">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontFamily: 'Pyidaungsu, Myanmar3, sans-serif',
                            fontWeight: 'bold'
                        }}
                    >
                        SevenK
                    </Typography>
                </Toolbar>
            </StyledAppBar>
            <PageWrapper>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {children}
                </Container>
            </PageWrapper>
        </Box>
    );
};

export default Layout; 