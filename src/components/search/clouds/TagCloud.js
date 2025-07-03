import React, { useRef } from 'react';
import { Box, Typography, Chip, IconButton, useTheme } from '@mui/material';
import { 
  LocalOffer as LocalOfferIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useScrollButtons } from '../hooks/useScrollButtons';

const TagCloud = ({ 
  tagCounts, 
  onTagClick, 
  tab 
}) => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);
  
  const {
    showLeftScroll,
    showRightScroll,
    handleScroll
  } = useScrollButtons(scrollContainerRef);
  
  // ユーザータブまたはタグが無い場合は表示しない
  if (tab === 'users' || tagCounts.length === 0) return null;
  
  return (
    <Box sx={{ position: 'relative', my: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1.5,
        justifyContent: 'space-between',
        pl: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalOfferIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="500">
            タグクラウド
          </Typography>
          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
            （クリックで検索）
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex' }}>
          {showLeftScroll && (
            <IconButton size="small" onClick={() => handleScroll('left')}>
              <NavigateBeforeIcon />
            </IconButton>
          )}
          {showRightScroll && (
            <IconButton size="small" onClick={() => handleScroll('right')}>
              <NavigateNextIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      
      <Box 
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          pb: 1,
          px: 1,
          gap: 1,
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.light,
            borderRadius: 3,
          }
        }}
      >
        {tagCounts.map(({ tag, count }) => (
          <Chip
            key={tag}
            label={`${tag} (${count})`}
            color="primary"
            variant="outlined"
            onClick={() => onTagClick(tag)}
            sx={{ 
              flexShrink: 0,
              height: 32,
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
                boxShadow: 1
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TagCloud;