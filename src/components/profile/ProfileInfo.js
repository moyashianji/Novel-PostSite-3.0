// ProfileInfo.jsx - 最適化バージョン
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  Tooltip,
  Tabs,
  Tab,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  CircularProgress
} from '@mui/material';
import EditProfile from './EditProfile';
import TwitterIcon from '@mui/icons-material/Twitter';
import PixivIcon from '@mui/icons-material/Pix';
import LinkIcon from '@mui/icons-material/Link';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TagIcon from '@mui/icons-material/Tag';
import CommentIcon from '@mui/icons-material/Comment';
import UpdateIcon from '@mui/icons-material/Update';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import WarningIcon from '@mui/icons-material/Warning';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExternalLinkConfirmation from '../common/ExternalLinkConfirmation';
import AutorenewIcon from '@mui/icons-material/Autorenew';

// TabPanel component - メモ化済み
const TabPanel = React.memo(({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

const ProfileInfo = React.memo(({ user, onProfileUpdate }) => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, url: '' });

  // キャッシュのタイムスタンプと期限を管理するためのステート
  const [cacheTimestamp, setCacheTimestamp] = useState(null);
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5分間のキャッシュ期限
  // データ取得 - タブに応じて必要なデータのみ取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user._id) return;
      // ローカルストレージからキャッシュデータを取得
      const cachedStatsKey = `user_stats_${user._id}`;
      const cachedActivityKey = `user_activity_${user._id}`;
      const cachedStatsJSON = localStorage.getItem(cachedStatsKey);
      const cachedActivityJSON = localStorage.getItem(cachedActivityKey);
      const cachedTimestamp = localStorage.getItem(`${cachedStatsKey}_timestamp`);

      // 有効なキャッシュがある場合はそれを使用
      const now = Date.now();
      if (cachedTimestamp && (now - parseInt(cachedTimestamp) < CACHE_EXPIRY)) {
        if (cachedStatsJSON) {
          setUserStats(JSON.parse(cachedStatsJSON));
        }

        // タブが活動タブの場合のみ活動データを取得
        if (tabValue === 1 && cachedActivityJSON) {
          setRecentActivity(JSON.parse(cachedActivityJSON));
        }

        setCacheTimestamp(parseInt(cachedTimestamp));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 統計情報の取得
        const statsResponse = await fetch(`/api/users/${user._id}/stats`);
        if (!statsResponse.ok) {
          throw new Error('統計情報の取得に失敗しました');
        }
        const statsData = await statsResponse.json();
        setUserStats(statsData);
        localStorage.setItem(cachedStatsKey, JSON.stringify(statsData));

        // タブが活動タブの場合のみ活動データを取得
        if (tabValue === 1) {
          const activityResponse = await fetch(`/api/users/${user._id}/activity`);
          if (!activityResponse.ok) {
            throw new Error('活動情報の取得に失敗しました');
          }
          const activityData = await activityResponse.json();
          setRecentActivity(activityData);
        }
      } catch (err) {
        console.error('ユーザーデータ取得エラー:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, tabValue]);
  const handleExternalLinkClick = (e, url) => {
    e.preventDefault();
    setConfirmDialog({ open: true, url });
  };
  // タブ変更ハンドラ - キャッシュを考慮
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    // 活動タブに切り替わった場合でキャッシュがない場合のみデータ取得
    if (newValue === 1 && recentActivity.length === 0) {
      // キャッシュチェックと取得ロジック
      const cachedActivityKey = `user_activity_${user._id}`;
      const cachedActivityJSON = localStorage.getItem(cachedActivityKey);

      if (cachedActivityJSON) {
        setRecentActivity(JSON.parse(cachedActivityJSON));
      } else {
        // キャッシュがない場合はAPI取得
        // ここではsetIsLoading(true)はスキップして活動データのみ取得
        fetch(`/api/users/${user._id}/activity`)
          .then(res => {
            if (!res.ok) throw new Error('活動情報の取得に失敗しました');
            return res.json();
          })
          .then(data => {
            setRecentActivity(data);
            localStorage.setItem(cachedActivityKey, JSON.stringify(data));
          })
          .catch(err => {
            console.error('活動データ取得エラー:', err);
            // エラーはセットしないで既存の表示を維持
          });
      }
    }
  };

  // 文字列が非空かチェック
  const hasContent = (str) => str && str.trim().length > 0;

  // キャッシュバスター付きアバターURL
  const avatarUrl = useMemo(() => {
    if (!user || !user.icon) return null;
    return `${user.icon}?${new Date().getTime()}`;
  }, [user]);

  // ソーシャルリンク数
  const socialLinksCount = useMemo(() => {
    if (!user) return 0;
    return [user.xLink, user.pixivLink, user.otherLink].filter(hasContent).length;
  }, [user]);

  // 日付フォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  };

  // 活動データをフォーマット
  const formattedActivity = useMemo(() => {
    if (!recentActivity || recentActivity.length === 0) {
      return [];
    }

    return recentActivity.map(activity => ({
      type: activity.type || 'post',
      title: activity.title || (activity.post?.title || '無題'),
      postTitle: activity.postTitle || (activity.post?.title || '無題'),
      date: activity.date || activity.createdAt,
      views: activity.views || activity.post?.viewCounter || 0
    })).slice(0, 5); // 最新5件に制限
  }, [recentActivity]);

  // ローディング表示
  if (isLoading) {
    return (
      <Card
        elevation={3}
        sx={{
          width: '100%',
          mb: 4,
          borderRadius: 4,
          overflow: 'visible',
          position: 'relative',
          minHeight: 400,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress />
      </Card>
    );
  }

  // エラー表示
  if (error && !userStats) {
    return (
      <Card
        elevation={3}
        sx={{
          width: '100%',
          mb: 4,
          borderRadius: 4,
          p: 3
        }}
      >
        <Typography color="error">データの読み込みに失敗しました: {error}</Typography>
      </Card>
    );
  }

  // ユーザーデータがない場合
  if (!user) {
    return (
      <Card
        elevation={3}
        sx={{
          width: '100%',
          mb: 4,
          borderRadius: 4,
          p: 3
        }}
      >
        <Typography>ユーザー情報が見つかりません</Typography>
      </Card>
    );
  }

  return (
    <Card
      elevation={3}
      sx={{
        width: '100%',
        mb: 4,
        borderRadius: 4,
        overflow: 'visible',
        position: 'relative',
      }}
    >
      {/* Header Section with Cover Image */}
      <Box
        sx={{
          height: 150,
          width: '100%',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements in the cover */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          }}
        />
      </Box>

      <CardContent sx={{ p: 0, position: 'relative' }}>
        <Box px={4} pb={3} pt={0} position="relative">
          {/* Avatar that overlaps the cover */}
          <Avatar
            src={avatarUrl}
            alt={user.nickname}
            sx={{
              width: 130,
              height: 130,
              border: '5px solid white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              position: 'relative',
              top: -65,
              mb: -4,
            }}
          />

          {/* Badge indicators for user profile */}
          <Box position="absolute" top={-35} left={150}>
            <Stack direction="row" spacing={1}>
              {userStats?.aiUsagePercent > 50 && (
                <Tooltip title="AIを活用している作家">
                  <Chip
                    icon={<SmartToyIcon />}
                    label="AI創作"
                    size="small"
                    sx={{ bgcolor: 'rgba(25, 118, 210, 0.8)', color: 'white' }}
                  />
                </Tooltip>
              )}

              {userStats?.originalContentPercent > 50 && (
                <Tooltip title="オリジナル作品が多い">
                  <Chip
                    icon={<LocalLibraryIcon />}
                    label="オリジナル"
                    size="small"
                    sx={{ bgcolor: 'rgba(46, 125, 50, 0.8)', color: 'white' }}
                  />
                </Tooltip>
              )}

            </Stack>
          </Box>

          {/* Edit button positioned on the top right */}
          <Box position="absolute" top={-45} right={24}>
            <EditProfile user={user} onProfileUpdate={onProfileUpdate} />
          </Box>

          {/* User basic info */}
          <Box mt={2}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {user.nickname}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip
                icon={<PeopleAltIcon />}
                label={`フォロワー ${user.followers?.length || 0}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  '& .MuiChip-icon': { color: 'primary.main' }
                }}
              />

              <Chip
                icon={<AutoStoriesIcon />}
                label={`作品数 ${userStats?.postCount || 0}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  '& .MuiChip-icon': { color: 'primary.main' }
                }}
              />

              <Chip
                icon={<FilterListIcon />}
                label={`シリーズ ${userStats?.seriesCount || 0}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  '& .MuiChip-icon': { color: 'primary.main' }
                }}
              />

              
            </Stack>

            {hasContent(user.description) && (
              <Paper elevation={0} sx={{ p: 2, mt: 3, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {user.description}
                </Typography>
              </Paper>
            )}

            {/* Social links - only show if at least one link exists */}
            {socialLinksCount > 0 && (
              <Box display="flex" justifyContent="flex-start" mt={3}>
                {user.xLink && (
                  <Tooltip title="X (Twitter)">
                    <IconButton
                      onClick={(e) => handleExternalLinkClick(e, user.xLink)}

                      sx={{
                        color: '#1DA1F2',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        mr: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          color: '#0d8ddb',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <TwitterIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {user.pixivLink && (
                  <Tooltip title="Pixiv">
                    <IconButton
                      onClick={(e) => handleExternalLinkClick(e, user.pixivLink)}

                      sx={{
                        color: '#0096fa',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        mr: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          color: '#007bb5',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <PixivIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {user.otherLink && (
                  <Tooltip title={user.otherLink}>
                    <IconButton
                      onClick={(e) => handleExternalLinkClick(e, user.otherLink)}

                      sx={{
                        color: '#444',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          color: '#000',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}

            <ExternalLinkConfirmation
              open={confirmDialog.open}
              handleClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
              url={confirmDialog.url}
            />
          </Box>
          <Box mt={4}>
  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
    好きな作家
  </Typography>
  {user.favoriteAuthors && user.favoriteAuthors.length > 0 ? (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {user.favoriteAuthors.map((author, index) => (
        <Chip
          key={index}
          icon={<LocalLibraryIcon />}
          label={author}
          sx={{
            py: 2,
            bgcolor: 'rgba(25, 118, 210, 0.08)',
            border: '1px solid rgba(25, 118, 210, 0.2)',
            '&:hover': {
              bgcolor: 'rgba(25, 118, 210, 0.12)',
            }
          }}
        />
      ))}
    </Box>
  ) : (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 2, 
        bgcolor: 'rgba(0,0,0,0.02)', 
        textAlign: 'center' 
      }}
    >
      <Typography color="textSecondary">
        好きな作家は設定されていません
      </Typography>
    </Paper>
  )}
</Box>
          {/* Stats & Activity section */}
          <Box mt={4}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontSize: '0.9rem',
                  minHeight: '48px'
                },
                '& .Mui-selected': {
                  fontWeight: 'bold'
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab icon={<VisibilityIcon fontSize="small" />} iconPosition="start" label="統計" />
              <Tab icon={<UpdateIcon fontSize="small" />} iconPosition="start" label="活動" />
              <Tab icon={<TagIcon fontSize="small" />} iconPosition="start" label="タグ" />
            </Tabs>

            <Divider />

            {/* Stats Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(176,196,222,0.2) 0%, rgba(220,237,255,0.2) 100%)',
                      border: '1px solid rgba(176,196,222,0.3)'
                    }}
                  >
                    <VisibilityIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0 }}>
                      {(userStats?.totalViews || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      総閲覧数
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(255,192,203,0.2) 0%, rgba(255,228,225,0.2) 100%)',
                      border: '1px solid rgba(255,192,203,0.3)'
                    }}
                  >
                    <FavoriteIcon sx={{ fontSize: 40, color: '#e91e63', opacity: 0.8, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0 }}>
                      {(userStats?.totalLikes || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      総いいね数
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(255,222,173,0.2) 0%, rgba(255,239,213,0.2) 100%)',
                      border: '1px solid rgba(255,222,173,0.3)'
                    }}
                  >
                    <BookmarkIcon sx={{ fontSize: 40, color: '#ff9800', opacity: 0.8, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0 }}>
                      {(userStats?.totalBookmarks || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      本棚追加数
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(144,238,144,0.2) 0%, rgba(240,255,240,0.2) 100%)',
                      border: '1px solid rgba(144,238,144,0.3)'
                    }}
                  >
                    <CommentIcon sx={{ fontSize: 40, color: '#4caf50', opacity: 0.8, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0 }}>
                      {(userStats?.commentCount || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      総コメント数
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>


            </TabPanel>

            {/* Activity Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                最近の活動
              </Typography>
              {formattedActivity.length > 0 ? (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <List disablePadding>
                    {formattedActivity.map((activity, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem sx={{ px: 3, py: 2 }}>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: activity.type === 'post' ? 'primary.main' : 'secondary.main',
                              }}
                            >
                              {activity.type === 'post' ? <AutoStoriesIcon /> : <CommentIcon />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2">
                                {activity.type === 'post'
                                  ? `「${activity.title}」を公開しました`
                                  : `「${activity.postTitle}」にコメントしました`}
                              </Typography>
                            }
                            secondary={
                              <Box mt={0.5}>
                                <Typography variant="body2" color="textSecondary" component="span">
                                  {formatDate(activity.date)}
                                </Typography>
                                {activity.type === 'post' && activity.views && (
                                  <Chip
                                    icon={<VisibilityIcon style={{ fontSize: 14 }} />}
                                    label={`${activity.views} 閲覧`}
                                    size="small"
                                    sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    textAlign: 'center'
                  }}
                >
                  <Typography color="textSecondary">
                    最近の活動はありません
                  </Typography>
                </Paper>
              )}
            </TabPanel>

            {/* Tags Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                よく使うタグ
              </Typography>
              {userStats?.topTags && userStats.topTags.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {userStats.topTags.map((tag, index) => (
                    <Chip
                      key={index}
                      icon={<TagIcon />}
                      label={`${tag.name} (${tag.count})`}
                      sx={{
                        py: 2.5,
                        fontWeight: 5 - index > 0 ? 'bold' : 'normal',
                        fontSize: `${Math.max(0.9, 1.1 - index * 0.05)}rem`,
                        bgcolor: index === 0
                          ? 'rgba(25, 118, 210, 0.1)'
                          : index === 1
                            ? 'rgba(25, 118, 210, 0.05)'
                            : 'rgba(0, 0, 0, 0.02)',
                        border: index === 0
                          ? '1px solid rgba(25, 118, 210, 0.2)'
                          : '1px solid rgba(0, 0, 0, 0.08)'
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    textAlign: 'center'
                  }}
                >
                  <Typography color="textSecondary">
                    タグ情報がありません
                  </Typography>
                </Paper>
              )}
            </TabPanel>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

ProfileInfo.displayName = 'ProfileInfo';

export default ProfileInfo;