// src/components/total/TotalPostList.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Tooltip,
  useTheme,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  EmojiEvents as EmojiEventsIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Comment as CommentIcon,
  Bookmark as BookmarkIcon,
  ThumbUp as ThumbUpIcon,
  Stars as StarsIcon
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

const TotalInfoCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(to right, #fcfcfc, #f0f8ff)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const ScoreChip = styled(Chip)(({ theme }) => ({
  borderRadius: '4px',
  height: '36px',
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.secondary.contrastText,
  fontWeight: 'bold',
  '& .MuiChip-icon': {
    color: 'inherit',
  }
}));

const MetricChip = styled(Chip)(({ theme, color = 'primary' }) => ({
  borderRadius: '4px',
  height: '32px',
  marginRight: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  '& .MuiChip-icon': {
    fontSize: '0.875rem',
  }
}));

const TotalPostListItem = ({ post, rank }) => {
  const theme = useTheme();
  
  if (!post || !post.post) return null;
  
  const {
    score,
    metrics
  } = post;
  
  const postData = post.post;
  if (postData) {
    postData.rankingScore = score;
  }
  return (
    <Box sx={{ mb: 3 }}>
      <TotalInfoCard>
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
              <Tooltip title="人気スコア" placement="top">
                <ScoreChip
                  icon={<StarsIcon />}
                  label={`${score.toFixed(2)} pts`}
                  size="small"
                />
              </Tooltip>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 1 }}>
                {metrics?.commentScore > 0 && (
                  <Tooltip title={`コメント評価: ${Math.round(metrics.commentScore)}ポイント`}>
                    <MetricChip
                      icon={<CommentIcon fontSize="small" />}
                      label={Math.round(metrics.commentScore)}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
                
                {metrics?.bookmarkScore > 0 && (
                  <Tooltip title={`本棚評価: ${Math.round(metrics.bookmarkScore)}ポイント`}>
                    <MetricChip
                      icon={<BookmarkIcon fontSize="small" />}
                      label={Math.round(metrics.bookmarkScore)}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
                
                {metrics?.likeScore > 0 && (
                  <Tooltip title={`いいね評価: ${Math.round(metrics.likeScore)}ポイント`}>
                    <MetricChip
                      icon={<ThumbUpIcon fontSize="small" />}
                      label={Math.round(metrics.likeScore)}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
                
                {metrics?.uniqueUsersCount > 0 && (
                  <Tooltip title={`ユニークユーザー数: ${metrics.uniqueUsersCount}人`}>
                    <MetricChip
                      icon={<PeopleIcon fontSize="small" />}
                      label={metrics.uniqueUsersCount}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </TotalInfoCard>
      
      {/* 作品カードを表示 */}
      <PostCard post={postData} />
    </Box>
  );
};

// メインのリストコンポーネント
const TotalPostList = ({ totalPosts }) => {
  if (!totalPosts || totalPosts.length === 0) {
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
      {totalPosts.map((post, index) => (
        <TotalPostListItem
          key={post.post?._id || index}
          post={post}
          rank={post.rank}
        />
      ))}
    </Box>
  );
};

export default TotalPostList;