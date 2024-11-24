import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

interface BannerProps {
    imageUrl: string;
    title: string;
    link?: string;
}

const BannerWrapper = styled(Paper)(({ theme }: { theme: Theme }) => ({
    position: 'relative',
    height: '400px',
    overflow: 'hidden',
    borderRadius: '16px',
    marginBottom: theme.spacing(4),
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
    },
}));

const BannerImage = styled('img')({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
});

const BannerContent = styled(Box)(({ theme }: { theme: Theme }) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(3),
    zIndex: 1,
    color: '#fff',
}));

const titleStyles: SxProps<Theme> = {
    color: '#fff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    fontFamily: 'Pyidaungsu, Myanmar3, sans-serif',
};

const Banner = ({ imageUrl, title, link }: BannerProps): React.ReactElement => {
    const content = (
        <BannerWrapper elevation={3}>
            <BannerImage src={imageUrl} alt={title} />
            <BannerContent>
                <Typography variant="h1" sx={titleStyles}>
                    {title}
                </Typography>
            </BannerContent>
        </BannerWrapper>
    );

    return link ? (
        <a href={link} style={{ textDecoration: 'none' }}>
            {content}
        </a>
    ) : content;
};

export default Banner;