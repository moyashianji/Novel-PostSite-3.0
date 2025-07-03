import React, { useRef } from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import { 
  EmojiEvents as EmojiEventsIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useScrollButtons } from '../hooks/useScrollButtons';
import { useContestTooltip } from '../hooks/useContestTooltip';
import ContestTooltip from './ContestTooltip';

const ContestTagCloud = ({ 
  contestTagCounts, 
  onContestTagClick, 
  tab 
}) => {
  const scrollContainerRef = useRef(null);
  
  const {
    showLeftScroll,
    showRightScroll,
    handleScroll
  } = useScrollButtons(scrollContainerRef);
  
  const {
    contestInfo,
    hoveredContestTag,
    anchorEl,
    handleContestTagMouseEnter,
    handleContestTagMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave
  } = useContestTooltip();
  
  // ユーザータブ、シリーズタブ、またはコンテストタグが無い場合は表示しない
  if (tab === 'users' || tab === 'series' || contestTagCounts.length === 0) return null;
  
  const handleTooltipClose = () => {
    // ツールチップを閉じる処理はフック内で管理
  };
  
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
          <EmojiEventsIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="500">
            コンテストタグクラウド
          </Typography>
          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
            （ホバーでコンテスト情報、クリックで検索）
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
          flexWrap: 'nowrap',
          overflowX: 'auto',
          gap: 1,
          pb: 1,
          px: 1,
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 3,
          },
        }}
      >
        {contestTagCounts.map(({ tag, count }) => (
          <Chip
            key={tag}
            label={`${tag} (${count})`}
            variant="outlined"
            color="primary"
            clickable
            onClick={() => onContestTagClick(tag)}
            onMouseEnter={(e) => handleContestTagMouseEnter(e, tag)}
            onMouseLeave={handleContestTagMouseLeave}
            sx={{
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              fontSize: '0.8rem',
              height: 32,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
                transform: 'translateY(-1px)',
                boxShadow: 2,
              },
            }}
          />
        ))}
      </Box>

      <ContestTooltip
        hoveredContestTag={hoveredContestTag}
        anchorEl={anchorEl}
        contestInfo={contestInfo}
        onTooltipMouseEnter={handleTooltipMouseEnter}
        onTooltipMouseLeave={handleTooltipMouseLeave}
        onClose={handleTooltipClose}
      />
    </Box>
  );
};

export default ContestTagCloud;