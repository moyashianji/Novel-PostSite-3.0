import React, { useRef } from 'react';
import { Box, Typography, Chip, IconButton, useTheme } from '@mui/material';
import { 
  SmartToy as SmartToyIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useScrollButtons } from '../hooks/useScrollButtons';

const AiToolCloud = ({ 
  aiToolCounts, 
  onAiToolClick, 
  tab 
}) => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);
  
  const {
    showLeftScroll,
    showRightScroll,
    handleScroll
  } = useScrollButtons(scrollContainerRef);
  
  // 作品タブ以外またはAIツールが無い場合は表示しない
  if (tab !== 'posts' || aiToolCounts.length === 0) return null;
  
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
          <SmartToyIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
          <Typography variant="subtitle1" fontWeight="500">
            AIツール
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
            backgroundColor: theme.palette.secondary.light,
            borderRadius: 3,
          }
        }}
      >
        {aiToolCounts.map(({ tool, count }) => (
          <Chip
            key={tool}
            label={`${tool} (${count})`}
            color="secondary"
            variant="outlined"
            onClick={() => onAiToolClick(tool)}
            icon={<SmartToyIcon style={{ fontSize: '14px' }} />}
            sx={{ 
              flexShrink: 0,
              height: 32,
              '&:hover': {
                backgroundColor: 'secondary.light',
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

export default AiToolCloud;