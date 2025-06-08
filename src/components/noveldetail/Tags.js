// Tags.js
import React, { memo } from 'react';
import { Typography, Box, Chip, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const TagsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const TagsHeader = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const TagsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

const TagChip = styled(Chip)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.2s',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: 'translateY(-2px)',
    boxShadow: '0 3px 5px rgba(0, 0, 0, 0.2)',
  },
}));

const Tags = memo(({ tags, handleTagClick }) => {
  const theme = useTheme();
  
  const getRandomColor = (index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      '#4caf50', // green
      '#ff9800', // orange
      '#9c27b0', // purple
      '#00acc1', // cyan
      '#5c6bc0', // indigo
      '#8d6e63', // brown
    ];
    return colors[index % colors.length];
  };
  
  return (
    <TagsContainer>
      <TagsHeader variant="body2">
        <LocalOfferIcon fontSize="small" sx={{ mr: 0.75 }} />
        タグ
      </TagsHeader>
      
      <TagsWrapper>
        {tags && tags.length > 0 ? (
          tags.map((tag, index) => (
            <TagChip
              key={index}
              label={tag}
              variant="outlined"
              onClick={() => handleTagClick(tag)}
              sx={{ 
                borderColor: getRandomColor(index),
                color: getRandomColor(index),
                '&:hover': {
                  backgroundColor: getRandomColor(index),
                  borderColor: getRandomColor(index),
                }
              }}
            />
          ))
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
            タグはありません
          </Typography>
        )}
      </TagsWrapper>
    </TagsContainer>
  );
});

export default Tags;
