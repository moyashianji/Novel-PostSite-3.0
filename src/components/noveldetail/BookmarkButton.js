
// BookmarkButton.js
import React from 'react';
import { Fab, Tooltip, useTheme } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { styled } from '@mui/material/styles';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.05)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.25)',
  },
  zIndex: 1100,
}));

const BookmarkButton = ({ onClick }) => {
  const theme = useTheme();
  
  return (
    <Tooltip title="しおりを挟む" arrow placement="left">
      <StyledFab
        color="secondary"
        aria-label="bookmark"
        onClick={onClick}
        size="large"
      >
        <BookmarkIcon />
      </StyledFab>
    </Tooltip>
  );
};

export default BookmarkButton;
