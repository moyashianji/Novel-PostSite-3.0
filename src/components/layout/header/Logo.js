import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

const Logo = React.memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginRight: 2,
        position: 'relative',
        '&:hover': {
          '& .logo-shine': {
            transform: 'translateX(40px)',
            transition: 'transform 0.8s ease-in-out',
          }
        }
      }}
    >
      {/* Logo Container with Hover Effects */}
      <Box
        component={Link}
        to="/"
        sx={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          padding: '4px 6px',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          }
        }}
      >
        {/* Shine effect overlay */}
        <Box 
          className="logo-shine"
          sx={{
            position: 'absolute',
            top: '-30%',
            left: '-100px',
            width: '40px',
            height: '200%',
            background: `linear-gradient(to right, 
              ${alpha(theme.palette.common.white, 0)} 0%, 
              ${alpha(theme.palette.common.white, 0.4)} 50%, 
              ${alpha(theme.palette.common.white, 0)} 100%
            )`,
            transform: 'translateX(-40px)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        
        {/* Logo Image with enhanced styling */}
        <Box 
          sx={{
            height: isMobile ? '36px' : '44px',
            width: isMobile ? '36px' : '44px',
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
            border: `2px solid ${alpha(theme.palette.common.white, 0.8)}`,
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
        >
          <img
            src="./logo.png"
            alt="すみわけ Logo"
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>
        
        {/* Text Content with improved typography */}
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: isMobile ? '22px' : '30px',
              fontWeight: 'bold',
              lineHeight: 1.1,
              margin: 0,
              padding: 0,
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'white',
              textShadow: `1px 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
              letterSpacing: '1px',
            }}
          >
            すみわけ
          </Typography>
          
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: "'Noto Sans JP', 'Roboto', sans-serif",
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 500,
              color: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.common.white, 0.7) 
                : alpha(theme.palette.common.white, 0.6),
              lineHeight: 1.2,
              margin: 0,
              marginTop: '-2px',
              letterSpacing: '0.5px',
            }}
          >
            AI小説投稿サイト
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

export default Logo;