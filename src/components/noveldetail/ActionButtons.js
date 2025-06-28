// ActionButtons.js
import React, { memo } from 'react';
import { Button, Box, Typography, useTheme } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { styled } from '@mui/material/styles';

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: '180px',
  flex: '1',
  borderRadius: 12,
  padding: '10px 16px',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 15px rgba(0, 0, 0, 0.4)'
      : '0 6px 15px rgba(0, 0, 0, 0.1)',
  },
}));

const ActionIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1.5),
}));

const ActionText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem',
}));

const ActionButtons = memo(({ hasLiked, isInBookshelf, handleGoodClick, handleBookshelfClick }) => {
  const theme = useTheme();
  
  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{
        marginY: 5,
        gap: 3,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        bottom: theme.spacing(3),
        zIndex: 10,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(30, 30, 30, 0.9)'
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius * 2,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 24px rgba(0, 0, 0, 0.4)'
          : '0 8px 24px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <ActionButton
        variant={hasLiked ? "contained" : "outlined"}
        color={hasLiked ? 'secondary' : 'primary'}
        onClick={handleGoodClick}
        sx={{
          marginBottom: { xs: 0, md: 0 },
        }}
      >
        <ActionIcon>
          {hasLiked ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
        </ActionIcon>
        <ActionText>
          {hasLiked ? 'いいねを解除' : 'いいね！'}
        </ActionText>
      </ActionButton>
      
      <ActionButton
        variant={isInBookshelf ? "contained" : "outlined"}
        color={isInBookshelf ? 'secondary' : 'primary'}
        onClick={handleBookshelfClick}
      >
        <ActionIcon>
          {isInBookshelf ? <LibraryAddCheckIcon /> : <LibraryBooksIcon />}
        </ActionIcon>
        <ActionText>
          {isInBookshelf ? '本棚から削除' : '本棚に追加'}
        </ActionText>
      </ActionButton>
    </Box>
  );
});

export default ActionButtons;