// src/components/trending/TrendingPostList.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import PostCard from '../post/PostCard';

// スタイル付きコンポーネント
const RankBadge = styled(Box)(({ theme, rank }) => {
  const getColorByRank = () => {
    switch (rank) {
      case 1: return { bg: 'linear-gradient(45deg, #FFD700, #FFA000)', color: '#7D2C00' };
      case 2: return { bg: 'linear-gradient(45deg, #E0E0E0, #BDBDBD)', color: '#424242' };
      case 3: return { bg: 'linear-gradient(45deg, #CD7F32, #A1672A)', color: '#5D3200' };
      default: return { bg: theme.palette.background.paper, color: theme.palette.text.primary };
    }
  };
  
  const { bg, color } = getColorByRank();
  
  return {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    color: color,
    fontWeight: 'bold',
    fontSize: rank <= 3 ? '1.25rem' : '1rem',
    boxShadow: rank <= 3 ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
  };
});

const TrendingInfoCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const ScoreChip = styled(Chip)(({ theme }) => ({
  borderRadius: '4px',
  height: '36px',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  '& .MuiChip-icon': {
    color: 'inherit',
  }
}));

const TrendingPostListItem = ({ post, rank, period }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (!post || !post.post) return null;
  
  const {
    score,
    uniqueUserCount,
    accelerationData
  } = post;
  
  const postData = post.post;
  
  const getPeriodLabel = () => {
    switch (period) {
      case 'day': return '24時間';
      case 'week': return '週間';
      case 'month': return '月間';
      case 'year': return '年間';
      default: return '24時間';
    }
  };
  
  const calcAcceleration = () => {
    if (!accelerationData?.previous || accelerationData.previous === 0) return 0;
    const acceleration = ((accelerationData.current - accelerationData.previous) / accelerationData.previous) * 100;
    return Math.round(acceleration);
  };
  
  const acceleration = calcAcceleration();
  
  return (
    <Box sx={{ mb: 3 }}>
      <TrendingInfoCard>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RankBadge rank={rank}>
              {rank <= 3 ? (
                <EmojiEventsIcon fontSize="small" />
              ) : (
                rank
              )}
            </RankBadge>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="急上昇スコア" placement="top">
                <ScoreChip
                  icon={<AssessmentIcon />}
                  label={`${score} pts`}
                  size="small"
                />
              </Tooltip>
              
              <Tooltip title={`${getPeriodLabel()}間の順位`}>
                <Chip
                  icon={<TrendingUpIcon />}
                  label={`#${rank}`}
                  size="small"
                  color="primary"
                  variant={rank <= 3 ? "filled" : "outlined"}
                />
              </Tooltip>
              

              {acceleration !== 0 && (
                <Tooltip title={`閲覧加速度 ${acceleration > 0 ? '+' : ''}${acceleration}%`}>
                  <Chip
                    icon={<SpeedIcon fontSize="small" />}
                    label={`${acceleration > 0 ? '+' : ''}${acceleration}%`}
                    size="small"
                    color={acceleration > 0 ? "success" : "default"}
                    variant="outlined"
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardContent>
      </TrendingInfoCard>
      
      {/* 作品カードを表示 */}
      <PostCard post={postData} />
    </Box>
  );
};

// メインのリストコンポーネント
const TrendingPostList = ({ trendingPosts, period }) => {
  if (!trendingPosts || trendingPosts.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          ランキングデータがありません
        </Typography>
        <Typography variant="body2" color="text.secondary">
          しばらく経ってからもう一度確認してください。
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {trendingPosts.map((post) => (
        <TrendingPostListItem
          key={post.postId}
          post={post}
          rank={post.rank}
          period={period}
        />
      ))}
    </Box>
  );
};

export default TrendingPostList;