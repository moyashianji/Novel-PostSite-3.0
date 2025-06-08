import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Box,
  Paper,
  Skeleton,
  Tooltip,
  IconButton,
  Badge,
  Chip,
  Fade,
  Divider,
  Stack,
  Link as MuiLink,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { alpha } from '@mui/material/styles';

// Custom styled components
const RankBadge = styled(Box)(({ theme, rank }) => {
  // Default styling
  let styling = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    minWidth: 32,
    minHeight: 32,
    maxWidth: 32,
    maxHeight: 32,
    flexShrink: 0,
    flexGrow: 0,
    borderRadius: '50%',
    fontWeight: 'bold',
    fontSize: '1rem',
    color: theme.palette.getContrastText(theme.palette.grey[300]),
    backgroundColor: theme.palette.grey[300],
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginRight: theme.spacing(2),
    transition: 'all 0.2s ease-in-out',
  };

  // Styling for top 3 ranks
  if (rank === 1) {
    // Gold medal
    styling = {
      ...styling,
      width: 40,
      height: 40,
      fontSize: '1.2rem',
      color: '#7d5b00',
      background: 'linear-gradient(45deg, #ffd700 30%, #ffec83 90%)',
      boxShadow: '0 3px 8px rgba(218, 165, 32, 0.4)',
      border: '2px solid #fff'
    };
  } else if (rank === 2) {
    // Silver medal
    styling = {
      ...styling,
      width: 36,
      height: 36,
      fontSize: '1.1rem',
      color: '#707070',
      background: 'linear-gradient(45deg, #c0c0c0 30%, #e6e6e6 90%)',
      boxShadow: '0 3px 6px rgba(192, 192, 192, 0.4)',
      border: '2px solid #fff'
    };
  } else if (rank === 3) {
    // Bronze medal
    styling = {
      ...styling,
      width: 34,
      height: 34,
      fontSize: '1.05rem',
      color: '#824a01',
      background: 'linear-gradient(45deg, #cd7f32 30%, #e6bb95 90%)',
      boxShadow: '0 3px 6px rgba(205, 127, 50, 0.4)',
      border: '2px solid #fff'
    };
  }

  return styling;
});

// ListItem wrapper with enhanced styling
const RankingItem = styled(ListItem)(({ theme, rank }) => ({
  padding: theme.spacing(1.5, 1),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  margin: '2px 0',
  overflow: 'hidden',
  '&::before': rank <= 3 ? {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '4px',
    backgroundColor:
      rank === 1 ? '#ffd700' :
        rank === 2 ? '#c0c0c0' :
          rank === 3 ? '#cd7f32' : 'transparent',
  } : {},
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-2px)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },
}));

const ViewCountChip = styled(Chip)(({ theme, rank }) => ({
  height: 24,
  backgroundColor:
    rank === 1 ? alpha('#ffd700', 0.1) :
      rank === 2 ? alpha('#c0c0c0', 0.1) :
        rank === 3 ? alpha('#cd7f32', 0.1) :
          alpha(theme.palette.primary.main, 0.1),
  color:
    rank === 1 ? '#7d5b00' :
      rank === 2 ? '#707070' :
        rank === 3 ? '#824a01' :
          theme.palette.primary.main,
  '& .MuiChip-icon': {
    color: 'inherit',
    fontSize: '0.875rem',
  },
}));

// Memoized author component
const AuthorInfo = React.memo(({ author }) => {
  if (!author) return null;
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mt: 0.5, 
        mb: 0.5,
        fontSize: '0.8rem'
      }}
    >
      <Avatar 
        src={author.icon} 
        alt={author.nickname} 
        sx={{ 
          width: 20, 
          height: 20, 
          mr: 0.75,
          border: '1px solid #f0f0f0'
        }} 
      />
      <Typography 
        variant="caption" 
        color="text.secondary"
        component={Link}
        to={`/user/${author._id}`}
        sx={{ 
          textDecoration: 'none',
          color: 'text.secondary',
          '&:hover': {
            textDecoration: 'underline',
            color: 'primary.main'
          }
        }}
      >
        {author.nickname}
      </Typography>
    </Box>
  );
});

AuthorInfo.displayName = 'AuthorInfo';

const PVRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(false);

      try {
        // populateオプションを追加してauthorを含めるようにリクエスト
        const response = await fetch(`/api/posts/ranking?populate=author`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setRanking(data);
        } else {
          console.error('Unexpected data format:', data);
          setRanking([]);
          setError(true);
        }
      } catch (error) {
        console.error('Error fetching ranking:', error);
        setRanking([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [API_URL]);

  // Helper function to format large numbers
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Display the appropriate content based on state
  const renderContent = () => {
    if (loading) {
      return <RankingSkeleton />;
    }

    if (error) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="error">
            ランキングデータの取得に失敗しました。
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            再読み込み
          </Button>
        </Box>
      );
    }

    if (ranking.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <EqualizerIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="textSecondary">
            まだランキングデータがありません。
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <List disablePadding>
          {ranking.slice(0, showAll ? 30 : 10).map((post, index) => (
            <React.Fragment key={post._id}>
              <Fade in={true} style={{ transitionDelay: `${index * 30}ms` }}>
                <RankingItem
                  component={Link}
                  to={`/novel/${post._id}`}
                  rank={index + 1}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    <RankBadge rank={index + 1}>
                      {index + 1}
                    </RankBadge>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: index < 3 ? 700 : 400,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                        }}
                      >
                        {post.title}
                      </Typography>
                      
                      {/* Add author information here - directly use post.author */}
                      <AuthorInfo author={post.author} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <ViewCountChip
                          icon={<VisibilityIcon />}
                          label={formatViewCount(post.viewCounter)}
                          size="small"
                          rank={index + 1}
                        />
                      </Box>
                    </Box>
                  </Box>
                </RankingItem>
              </Fade>
              {index < ranking.slice(0, showAll ? 30 : 10).length - 1 && (
                <Divider sx={{ my: 0.5, opacity: 0.6 }} />
              )}
            </React.Fragment>
          ))}
        </List>

        {ranking.length > 10 && (
          <Button
            variant="text"
            fullWidth
            onClick={() => setShowAll(!showAll)}
            startIcon={showAll ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            sx={{
              mt: 2,
              py: 1,
              borderRadius: 2,
              fontWeight: 'medium'
            }}
          >
            {showAll ? '閉じる' : 'もっと表示'}
          </Button>
        )}
      </>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: '#ff6d00',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EqualizerIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            PVランキング
          </Typography>
        </Box>
        <Tooltip title="ページビュー数に基づくランキング">
          <Box
            sx={{
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
              px: 1,
              py: 0.5,
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            閲覧数
          </Box>
        </Tooltip>
      </Box>

      <Box sx={{ p: 2 }}>
        {renderContent()}
      </Box>
    </Paper>
  );
};

// Skeleton loader for the ranking
const RankingSkeleton = () => (
  <Box>
    {[...Array(5)].map((_, index) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
        <Box sx={{ width: '100%' }}>
          <Skeleton variant="text" height={24} width="80%" />
          <Skeleton variant="text" height={16} width="30%" /> {/* Author skeleton */}
          <Skeleton variant="text" height={20} width="40%" />
        </Box>
      </Box>
    ))}
  </Box>
);

export default PVRanking;