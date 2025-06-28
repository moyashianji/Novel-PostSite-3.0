import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Container, Skeleton,
  Alert, Paper, Grid, Chip, Divider,
  Breadcrumbs, Button, Avatar, Card,
  IconButton, Tooltip, useTheme
} from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import BookIcon from '@mui/icons-material/Book';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import WarningIcon from '@mui/icons-material/Warning';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarIcon from '@mui/icons-material/Star';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../context/AuthContext';

// テーマ対応のスタイル付きコンポーネント
const SeriesInfoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 16px 40px rgba(0, 0, 0, 0.5)'
    : '0 16px 40px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(5),
  background: 'transparent',
  position: 'relative',
  transition: 'all 0.3s ease-in-out',
  border: 'none',
}));

const HeaderBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '220px',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 50%, ${theme.palette.primary.main} 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.light} 100%)`,
  zIndex: 0,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(45deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))'
      : 'linear-gradient(45deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.9))',
  }
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(4),
  paddingTop: theme.spacing(8),
  background: theme.palette.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.2)'
    : 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
}));

const AuthorCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 40px rgba(0, 0, 0, 0.4)'
      : '0 12px 40px rgba(0, 0, 0, 0.15)',
  }
}));

const SeriesDescriptionCard = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 40px rgba(0, 0, 0, 0.4)'
      : '0 12px 40px rgba(0, 0, 0, 0.15)',
  }
}));

const StatsCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.2)',
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 40px rgba(0, 0, 0, 0.4)'
      : '0 12px 40px rgba(0, 0, 0, 0.15)',
  }
}));

const StatsItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(248, 250, 252, 0.8)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(248, 250, 252, 1)',
    transform: 'translateX(4px)',
  },
  '&:last-child': {
    marginBottom: 0,
  }
}));

const StatIcon = styled(Box)(({ theme, color }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  color: 'white',
  boxShadow: `0 4px 12px ${color}40`,
}));

const FollowButton = styled(Button)(({ theme, isfollowing }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 3),
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: isfollowing === 'true' 
    ? `0 4px 12px ${theme.palette.primary.main}40`
    : theme.palette.mode === 'dark'
      ? '0 4px 12px rgba(255, 255, 255, 0.1)'
      : '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: isfollowing === 'true' 
      ? `0 6px 16px ${theme.palette.primary.main}60`
      : theme.palette.mode === 'dark'
        ? '0 6px 16px rgba(255, 255, 255, 0.15)'
        : '0 6px 16px rgba(0, 0, 0, 0.15)',
  }
}));

const WorksSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  color: theme.palette.text.primary,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: 0,
    width: '60px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  }
}));

const EpisodeNumber = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: -8,
  top: 16,
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  zIndex: 10,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 8px rgba(0,0,0,0.5)'
    : '0 4px 8px rgba(0,0,0,0.2)',
}));

const WorksInSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  
  const [works, setWorks] = useState([]);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/series/${id}/works`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.series && Array.isArray(data.works)) {
          setSeries(data.series);
          setWorks(data.works);
          
          // フォロー状態を確認
          if (isAuthenticated) {
            checkFollowStatus();
          }
        } else if (Array.isArray(data)) {
          setWorks(data);
          try {
            const seriesResponse = await fetch(`/api/series/${id}`);
            if (seriesResponse.ok) {
              const seriesData = await seriesResponse.json();
              setSeries(seriesData);
            }
          } catch (seriesError) {
            console.error('Error fetching series info:', seriesError);
          }
        } else {
          throw new Error('Unexpected API response format');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  const checkFollowStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`/api/series/${id}/is-following`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setFollowLoading(true);
    try {
      const response = await fetch(`/api/series/${id}/follow`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // ソート済みの作品リスト
  const sortedWorks = works && works.length ? 
    [...works].sort((a, b) => a.episodeNumber - b.episodeNumber)
    : [];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={220} sx={{ mb: 4, borderRadius: 3 }} />
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          エラーが発生しました: {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderRadius: 2 }}>
          戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* パンくずリスト */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 4 }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', color: theme.palette.text.primary, textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          ホーム
        </Link>
        <Link to="/search?type=series" style={{ display: 'flex', alignItems: 'center', color: theme.palette.text.primary, textDecoration: 'none' }}>
          <BookIcon sx={{ mr: 0.5 }} fontSize="small" />
          シリーズ一覧
        </Link>
        <Typography color="text.primary">
          {series?.title || 'シリーズ詳細'}
        </Typography>
      </Breadcrumbs>
      
      {/* シリーズ情報カード */}
      {series && (
        <SeriesInfoCard elevation={0}>
          <HeaderBackground />
          <ContentWrapper>
            {/* タイトルエリア */}
            <Box sx={{ 
              textAlign: 'center',
              mb: 4
            }}>
              <Typography variant="h2" sx={{
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                fontSize: { xs: '2rem', md: '3rem' },
                mb: 2
              }}>
                {series.title}
              </Typography>
              {series.isAdultContent && (
                <Chip
                  icon={<WarningIcon />}
                  label="R18"
                  color="error"
                  size="medium"
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    height: 36
                  }}
                />
              )}
            </Box>

            {/* シリーズフォローボタンエリア */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 4,
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Paper sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(0, 0, 0, 0.5)'
                  : '0 12px 40px rgba(0, 0, 0, 0.2)',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {isAuthenticated ? (
                  <FollowButton
                    variant={isFollowing ? "contained" : "outlined"}
                    isfollowing={isFollowing.toString()}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    startIcon={isFollowing ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    size="large"
                    sx={{ 
                      minWidth: 220,
                      fontSize: '1.1rem',
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: isFollowing 
                        ? `0 6px 20px ${theme.palette.primary.main}60`
                        : theme.palette.mode === 'dark'
                          ? '0 6px 20px rgba(255, 255, 255, 0.1)'
                          : '0 6px 20px rgba(0, 0, 0, 0.15)',
                      background: isFollowing 
                        ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                        : theme.palette.mode === 'dark'
                          ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                          : 'linear-gradient(45deg, #ffffff, #f5f5f5)',
                      color: isFollowing 
                        ? theme.palette.primary.contrastText 
                        : theme.palette.primary.main,
                      border: isFollowing 
                        ? 'none' 
                        : `2px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isFollowing 
                          ? `0 8px 25px ${theme.palette.primary.main}80`
                          : theme.palette.mode === 'dark'
                            ? '0 8px 25px rgba(255, 255, 255, 0.2)'
                            : '0 8px 25px rgba(0, 0, 0, 0.2)',
                        background: isFollowing 
                          ? `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                          : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        color: theme.palette.primary.contrastText
                      }
                    }}
                  >
                    {followLoading ? '処理中...' : isFollowing ? 'シリーズをフォロー中' : 'このシリーズをフォロー'}
                  </FollowButton>
                ) : (
                  <Tooltip title="ログインが必要です">
                    <span>
                      <FollowButton
                        variant="outlined"
                        isfollowing="false"
                        disabled
                        startIcon={<BookmarkBorderIcon />}
                        size="large"
                        sx={{ 
                          minWidth: 220,
                          fontSize: '1.1rem',
                          py: 1.5,
                          fontWeight: 'bold',
                          opacity: 0.7,
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(255, 255, 255, 0.8)',
                          border: `2px solid ${theme.palette.primary.main}50`,
                          color: `${theme.palette.primary.main}70`
                        }}
                      >
                        このシリーズをフォロー
                      </FollowButton>
                    </span>
                  </Tooltip>
                )}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(248, 250, 252, 0.9)',
                  border: `1px solid ${theme.palette.divider}`
                }}>
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight="medium" color="text.primary">
                    {followerCount.toLocaleString()}人がフォロー中
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* 主要コンテンツ */}
            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                {/* 作者情報カード */}
                <AuthorCard>
                  {series.author && (
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Avatar
                        src={series.author.icon}
                        alt={series.author.nickname}
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          mr: 3,
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 4px 12px rgba(0,0,0,0.5)'
                            : '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        <PersonIcon fontSize="large" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }} color="text.primary">
                          {series.author.nickname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          この作品の作者
                        </Typography>
                      </Box>
                      <Button
                        variant="text"
                        onClick={() => navigate(`/user/${series.author._id}`)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 'medium'
                        }}
                      >
                        作者ページへ
                      </Button>
                    </Box>
                  )}
                </AuthorCard>

                {/* シリーズ説明 */}
                <SeriesDescriptionCard>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'primary.main'
                  }}>
                    <BookIcon sx={{ mr: 1 }} />
                    あらすじ
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    mb: 3, 
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    color: 'text.primary'
                  }}>
                    {series.description}
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'secondary.main'
                  }}>
                    <LocalOfferIcon sx={{ mr: 1 }} />
                    タグ
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {series.tags?.map((tag, i) => (
                      <Chip
                        key={i}
                        label={tag}
                        size="medium"
                        sx={{ 
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          backgroundColor: theme.palette.mode === 'dark'
                            ? `${theme.palette.primary.main}20`
                            : 'transparent',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: theme.palette.mode === 'dark'
                              ? '0 4px 8px rgba(0,0,0,0.3)'
                              : '0 4px 8px rgba(0,0,0,0.15)'
                          }
                        }}
                        color="primary"
                        variant="outlined"
                        onClick={() => navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=series`)}
                      />
                    ))}
                  </Box>
                </SeriesDescriptionCard>
              </Grid>

              {/* 統計情報 */}
              <Grid item xs={12} lg={4}>
                <StatsCard>
                  <Typography variant="h5" sx={{
                    fontWeight: 'bold',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.primary'
                  }}>
                    <BookIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                    シリーズ統計
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  <StatsItem>
                    <StatIcon color="#4caf50">
                      <BookIcon fontSize="small" />
                    </StatIcon>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {sortedWorks.length}話
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総エピソード数
                      </Typography>
                    </Box>
                  </StatsItem>

                  <StatsItem>
                    <StatIcon color="#9c27b0">
                      <BookmarkIcon fontSize="small" />
                    </StatIcon>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {followerCount.toLocaleString()}人
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        フォロワー
                      </Typography>
                    </Box>
                  </StatsItem>

                  <StatsItem>
                    <StatIcon color="#f44336">
                      <ThumbUpIcon fontSize="small" />
                    </StatIcon>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {sortedWorks.reduce((sum, work) => sum + (work.goodCounter || 0), 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        いいね累計
                      </Typography>
                    </Box>
                  </StatsItem>

                  <StatsItem>
                    <StatIcon color="#2196f3">
                      <VisibilityIcon fontSize="small" />
                    </StatIcon>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {sortedWorks.reduce((sum, work) => sum + (work.viewCounter || 0), 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        閲覧累計
                      </Typography>
                    </Box>
                  </StatsItem>
                </StatsCard>
              </Grid>
            </Grid>
          </ContentWrapper>
        </SeriesInfoCard>
      )}

      {/* 作品一覧セクション */}
      <WorksSection>
        <SectionTitle variant="h4">
          <BookIcon sx={{ mr: 2, color: 'primary.main' }} />
          作品一覧（{sortedWorks.length}話）
        </SectionTitle>

        {sortedWorks.length > 0 ? (
          <Grid container spacing={3}>
            {sortedWorks.map((work) => (
              <Grid item xs={12} key={work._id}>
                <Box sx={{ position: 'relative' }}>
                  <EpisodeNumber>
                    {work.episodeNumber || '?'}
                  </EpisodeNumber>
                  <Box sx={{ pl: 2 }}>
                    <PostCard post={work} />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            py: 8, 
            textAlign: 'center',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(248, 250, 252, 0.8)',
            borderRadius: 3,
            border: `2px dashed ${theme.palette.divider}`
          }}>
            <BookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              まだ作品が投稿されていません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              このシリーズの最初の作品をお待ちください。
            </Typography>
          </Box>
        )}
      </WorksSection>
    </Container>
  );
};

export default WorksInSeries;