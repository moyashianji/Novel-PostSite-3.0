// BookmarkIndicator.js
import React, { memo } from 'react';
import { Typography, Box, Paper, Fade, useTheme } from '@mui/material';
import BookmarkButton from './BookmarkButton';
import { styled } from '@mui/material/styles';

const InstructionBox = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 88, // Fab button height + some spacing
  right: 24,
  padding: theme.spacing(2),
  borderRadius: 12,
  maxWidth: 240,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 6px 20px rgba(0, 0, 0, 0.4)'
    : '0 6px 20px rgba(0, 0, 0, 0.15)',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(30, 30, 30, 0.95)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  zIndex: 1050,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${theme.palette.divider}`,
}));

const BookmarkIndicator = memo(({ isBookmarkMode, handleBookmarkClick }) => {
  const theme = useTheme();
  
  return (
    <>
      <BookmarkButton onClick={handleBookmarkClick} />
      
      <Fade in={isBookmarkMode}>
        <InstructionBox>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              textAlign: 'center',
              color: 'text.primary',
            }}
          >
            しおりを設定したい段落をクリックしてください
          </Typography>
        </InstructionBox>
      </Fade>
    </>
  );
});

export default BookmarkIndicator;