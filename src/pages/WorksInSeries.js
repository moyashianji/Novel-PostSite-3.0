import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Container, Skeleton,
  Alert, Paper, Grid, Chip, Divider,
  Breadcrumbs, Button, Avatar, Card,
  IconButton, Tooltip
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
import PostCard from '../components/post/PostCard';
import { useAuth } from '../context/AuthContext';

// スタイル付きコンポーネント
const SeriesInfoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  marginBottom: theme.spacing(4),
  background: 'transparent',
  position: 'relative',
}));

const HeaderBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '180px',
  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  zIndex: 0,
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(3),
  paddingTop: theme.spacing(12),
}));

const AuthorCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

const StatsCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  height: '100%',
}));

const StatsItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius / 2,
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
}));

const StatIcon = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: color || theme.palette.primary.light,
  color: theme.palette.common.white,
  marginRight: theme.spacing(1.5),
}));

const EpisodeNumber = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: -16,
  top: 16,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  zIndex: 1
}));

const FollowButton = styled(Button)(({ theme, isfollowing }) => ({
  borderRadius: 50,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  fontWeight: 'bold',
  textTransform: 'none',
  minWidth: 140,
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  backgroundColor: isfollowing === 'true' ? theme.palette.primary.main : theme.palette.background.paper,
  color: isfollowing === 'true' ? 'white' : theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}`,
  '&:hover': {
    boxShadow: '0 4px 12px rgba(30, 68, 157, 0.3)',
    transform: 'translateY(-2px)',
    backgroundColor: isfollowing === 'true' ? theme.palette.primary.dark : theme.palette.primary.light,
    color: 'white',
  },
}));

const WorksInSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  // 作品をエピソード番号で並べ替え
  const sortedWorks = works && works.length
    ? [...works].sort((a, b) => a.episodeNumber - b.episodeNumber)
    : [];

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 4, borderRadius: 2 }} />
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 1 }} />
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          エラーが発生しました: {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* パンくずリスト */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          ホーム
        </Link>
        <Link to="/search?type=series" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
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
            {/* タイトルと警告ラベル */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{
                fontWeight: 'bold',
                mr: 2,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {series.title}
              </Typography>
              {series.isAdultContent && (
                <Chip
                  icon={<WarningIcon />}
                  label="R18"
                  color="error"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>

            {/* 主要コンテンツ */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
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
                          mr: 2,
                          border: '3px solid white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Link to={`/user/${series.author._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                            {series.author.nickname || '不明な作者'}
                          </Typography>
                        </Link>
                        {series.createdAt && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(series.createdAt).toLocaleDateString('ja-JP')}に投稿
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      {/* フォローボタン */}
                      <Box sx={{ ml: 2 }}>
                        {isAuthenticated ? (
                          <FollowButton
                            variant={isFollowing ? "contained" : "outlined"}
                            isfollowing={isFollowing.toString()}
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                            startIcon={isFollowing ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                          >
                            {followLoading ? '処理中...' : isFollowing ? 'フォロー中' : 'フォローする'}
                          </FollowButton>
                        ) : (
                          <Tooltip title="ログインが必要です">
                            <span>
                              <FollowButton
                                variant="outlined"
                                isfollowing="false"
                                disabled
                                startIcon={<BookmarkBorderIcon />}
                              >
                                フォローする
                              </FollowButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  )}
                </AuthorCard>

                {/* シリーズ説明 */}
                <Box sx={{
                  mt: 2,
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                    {series.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
                    {series.tags?.map((tag, i) => (
                      <Chip
                        key={i}
                        label={tag}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                        color="primary"
                        variant="outlined"
                        onClick={() => navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=series`)}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* 統計情報 */}
              <Grid item xs={12} md={4}>
                <StatsCard>
                  <Typography variant="h6" sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <BookIcon sx={{ mr: 1 }} />
                    シリーズ情報
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <StatsItem>
                    <StatIcon color="#4caf50">
                      <BookIcon fontSize="small" />
                    </StatIcon>
                    <Typography variant="body1" fontWeight="medium">
                      全{works.length}話
                    </Typography>
                  </StatsItem>

                  <StatsItem>
                    <StatIcon color="#9c27b0">
                      <BookmarkIcon fontSize="small" />
                    </StatIcon>
                    <Typography variant="body1" fontWeight="medium">
                      フォロワー {followerCount}人
                    </Typography>
                  </StatsItem>

                  <StatsItem>
                    <StatIcon color="#f44336">
                      <ThumbUpIcon fontSize="small" />
                    </StatIcon>
                    <Typography variant="body1" fontWeight="medium">
                      いいね 累計{works.reduce((sum, work) => sum + (work.goodCounter || 0), 0)}
                    </Typography>
                  </StatsItem>

                  <StatsItem>
                    <StatIcon color="#2196f3">
                      <VisibilityIcon fontSize="small" />
                    </StatIcon>
                    <Typography variant="body1" fontWeight="medium">
                      閲覧 累計{works.reduce((sum, work) => sum + (work.viewCounter || 0), 0)}
                    </Typography>
                  </StatsItem>
                </StatsCard>
              </Grid>
            </Grid>
          </ContentWrapper>
        </SeriesInfoCard>
      )}

      {/* 作品一覧 */}
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <BookIcon sx={{ mr: 1 }} />
          作品一覧（{works.length}話）
        </Typography>

        {works.length > 0 ? (
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
          <Alert severity="info">
            このシリーズにはまだ作品がありません。
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default WorksInSeries;