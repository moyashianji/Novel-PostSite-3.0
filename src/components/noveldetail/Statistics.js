// Statistics.js
import React, { memo, useMemo } from 'react';
import { Typography, Box, Tooltip, useTheme } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
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
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.7)
    : alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(8px)',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.9)
      : alpha(theme.palette.background.paper, 0.95),
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 20px rgba(0, 0, 0, 0.4)'
      : '0 6px 20px rgba(0, 0, 0, 0.15)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const StatIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(0.75),
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const StatText = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
  lineHeight: 1.2,
}));

const StatHighlight = styled('span')(({ theme }) => ({
  fontWeight: 700,
  transition: 'color 0.2s ease',
}));

// テーマに応じた統計カラーの取得関数
const getStatColors = (theme) => {
  const isDark = theme.palette.mode === 'dark';
  
  return {
    view: {
      color: theme.palette.primary.main,
      icon: theme.palette.primary.main,
    },
    good: {
      color: isDark ? '#ff6b6b' : '#f44336',
      icon: isDark ? '#ff6b6b' : '#f44336',
    },
    bookshelf: {
      color: isDark ? '#51cf66' : '#4caf50',
      icon: isDark ? '#51cf66' : '#4caf50',
    },
    points: {
      color: isDark ? '#ffd43b' : '#ff9800',
      icon: isDark ? '#ffd43b' : '#ff9800',
    },
    date: {
      color: theme.palette.secondary.main,
      icon: theme.palette.secondary.main,
    },
  };
};

// メモ化された統計アイテムコンポーネント
const StatisticItem = memo(({ 
  icon: IconComponent, 
  value, 
  label, 
  tooltip, 
  colorType,
  theme 
}) => {
  const colors = useMemo(() => getStatColors(theme), [theme]);
  const currentColors = colors[colorType] || colors.view;
  
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <StatItem>
        <StatIcon>
          <IconComponent 
            fontSize="small" 
            sx={{ 
              color: currentColors.icon,
              filter: theme.palette.mode === 'dark' 
                ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.1))'
                : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
            }} 
          />
        </StatIcon>
        <StatText>
          <StatHighlight sx={{ color: currentColors.color }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </StatHighlight>
          {label && ` ${label}`}
        </StatText>
      </StatItem>
    </Tooltip>
  );
});

const Statistics = memo(({ viewCount, goodCount, bookshelfCount, postDate }) => {
  const theme = useTheme();
  
  // 総合ポイントの計算をメモ化
  const totalPoints = useMemo(() => {
    return ((goodCount || 0) * 2) + ((bookshelfCount || 0) * 2);
  }, [goodCount, bookshelfCount]);
  
  // 統計データをメモ化
  const statisticsData = useMemo(() => [
    {
      icon: VisibilityIcon,
      value: viewCount || 0,
      label: '閲覧',
      tooltip: '閲覧数',
      colorType: 'view',
    },
    {
      icon: ThumbUpIcon,
      value: goodCount || 0,
      label: 'いいね',
      tooltip: 'いいね数',
      colorType: 'good',
    },
    {
      icon: LibraryBooksIcon,
      value: bookshelfCount || 0,
      label: '本棚',
      tooltip: '本棚に追加された数',
      colorType: 'bookshelf',
    },
    {
      icon: StarIcon,
      value: totalPoints,
      label: 'pt',
      tooltip: '総合評価ポイント（いいね×2 + 本棚×2）',
      colorType: 'points',
    },
    {
      icon: TodayIcon,
      value: postDate,
      label: '',
      tooltip: '投稿日',
      colorType: 'date',
    },
  ], [viewCount, goodCount, bookshelfCount, totalPoints, postDate]);
  
  return (
    <StatsContainer>
      {statisticsData.map((stat, index) => (
        <StatisticItem
          key={`stat-${index}`}
          icon={stat.icon}
          value={stat.value}
          label={stat.label}
          tooltip={stat.tooltip}
          colorType={stat.colorType}
          theme={theme}
        />
      ))}
    </StatsContainer>
  );
});

Statistics.displayName = 'Statistics';
StatisticItem.displayName = 'StatisticItem';

export default Statistics;