// ProfileInfo.jsx - ProfileHeaderを使用した最適化バージョン
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Tabs,
  Tab,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress
} from '@mui/material';
import EditProfile from './EditProfile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TagIcon from '@mui/icons-material/Tag';
import CommentIcon from '@mui/icons-material/Comment';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListIcon from '@mui/icons-material/FilterList';

import ProfileHeader from '../user/ProfileHeader';

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
          });
      }
    }
  };

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

  // ProfileHeaderに渡す統計データ
  const workStats = useMemo(() => ({
    total: userStats?.postCount || 0,
    series: userStats?.seriesCount || 0,
    totalViews: userStats?.totalViews || 0
  }), [userStats]);

  // ProfileHeaderのハンドラー関数（プレースホルダー）
  const handleFollowToggle = () => {
    // フォロー機能のハンドリング（実装が必要）
    console.log('フォロー機能が呼ばれました');
  };

  const handleAuthorTagClick = (author) => {
    // 作家タグクリック時の処理（実装が必要）
    console.log('作家タグがクリックされました:', author);
  };

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
    <Box sx={{ width: '100%', mb: 4 }}>
      {/* ProfileHeaderコンポーネントを使用 */}
      <Box sx={{ position: 'relative' }}>
        <ProfileHeader
          user={user}
          workStats={workStats}
          followerCount={user.followers?.length || 0}
          isFollowing={false} // 実際の値を設定する必要があります
          onFollowToggle={handleFollowToggle}
          onAuthorTagClick={handleAuthorTagClick}
        />
        
        {/* 編集ボタンをヘッダーの上に重ねて配置 */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            zIndex: 10 
          }}
        >
          <EditProfile user={user} onProfileUpdate={onProfileUpdate} />
        </Box>
      </Box>

      {/* 統計・活動・タグセクション */}
      <Card
        elevation={3}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          mt: 2
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box px={4} pt={4}>
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
        </CardContent>
      </Card>
    </Box>
  );
});

ProfileInfo.displayName = 'ProfileInfo';

export default ProfileInfo;