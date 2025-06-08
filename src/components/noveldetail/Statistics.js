// Statistics.js
import React, { memo } from 'react';
import { Typography, Box, Tooltip, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import StarIcon from '@mui/icons-material/Star';
import TodayIcon from '@mui/icons-material/Today';

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 20,
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: 'translateY(-2px)',
  },
}));

const StatIcon = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(0.75),
  color: color || theme.palette.primary.main,
}));

const StatText = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
}));

const StatHighlight = styled('span')(({ theme, color }) => ({
  fontWeight: 700,
  color: color || theme.palette.primary.main,
}));

const Statistics = memo(({ viewCount, goodCount, bookshelfCount, postDate }) => {
  const totalPoints = ((goodCount || 0) * 2) + ((bookshelfCount || 0) * 2);
  
  return (
    <StatsContainer>
      <Tooltip title="閲覧数" arrow>
        <StatItem>
          <StatIcon>
            <VisibilityIcon fontSize="small" />
          </StatIcon>
          <StatText>
            <StatHighlight>{viewCount.toLocaleString()}</StatHighlight> 閲覧
          </StatText>
        </StatItem>
      </Tooltip>
      
      <Tooltip title="いいね数" arrow>
        <StatItem>
          <StatIcon color="#f44336">
            <ThumbUpIcon fontSize="small" />
          </StatIcon>
          <StatText>
            <StatHighlight color="#f44336">{(goodCount || 0).toLocaleString()}</StatHighlight> いいね
          </StatText>
        </StatItem>
      </Tooltip>
      
      <Tooltip title="本棚に追加された数" arrow>
        <StatItem>
          <StatIcon color="#4caf50">
            <LibraryBooksIcon fontSize="small" />
          </StatIcon>
          <StatText>
            <StatHighlight color="#4caf50">{(bookshelfCount || 0).toLocaleString()}</StatHighlight> 本棚
          </StatText>
        </StatItem>
      </Tooltip>
      
      <Tooltip title="総合評価ポイント" arrow>
        <StatItem>
          <StatIcon color="#ff9800">
            <StarIcon fontSize="small" />
          </StatIcon>
          <StatText>
            <StatHighlight color="#ff9800">{totalPoints.toLocaleString()}</StatHighlight> pt
          </StatText>
        </StatItem>
      </Tooltip>
      
      <Tooltip title="投稿日" arrow>
        <StatItem>
          <StatIcon color="#9c27b0">
            <TodayIcon fontSize="small" />
          </StatIcon>
          <StatText>
            {postDate}
          </StatText>
        </StatItem>
      </Tooltip>
    </StatsContainer>
  );
});

export default Statistics;
