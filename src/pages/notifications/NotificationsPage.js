// NotificationsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Grid,
  CircularProgress,
  IconButton,
  Breadcrumbs,
  useTheme,
  Chip,
  alpha,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar,
  Pagination,
  ListItemText,
  Button
} from '@mui/material';
import { 
  Article as ArticleIcon,
  People as PeopleIcon, 
  Campaign as CampaignIcon,
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon,
  Home as HomeIcon,
  Circle as CircleIcon,
  FilterList as FilterListIcon,
  Delete as DeleteIcon,
  MarkChatRead as MarkChatReadIcon,
  MoreVert as MoreVertIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
} from '@mui/icons-material';
import ListIcon from '@mui/icons-material/List';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow, format } from 'date-fns';
import { ja } from 'date-fns/locale';

// スタイル付きコンポーネント
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
}));

const NotificationCard = styled(Paper)(({ theme, read }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: read ? '0 1px 3px rgba(0,0,0,0.05)' : '0 2px 5px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  borderLeft: read ? 'none' : `4px solid ${theme.palette.primary.main}`,
  backgroundColor: read ? alpha(theme.palette.background.paper, 0.7) : alpha(theme.palette.primary.light, 0.05),
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const NotificationTitle = styled(Typography)(({ theme, read }) => ({
  fontWeight: read ? 'normal' : 'medium',
  marginBottom: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
}));

const NotificationAvatar = styled('div')(({ theme, notificationType }) => {
  const colors = {
    post: theme.palette.info.main,
    follow: theme.palette.success.main,
    system: theme.palette.warning.main,
    comment: theme.palette.secondary.main,
    like: theme.palette.error.main,
    default: theme.palette.primary.main,
  };
  
  return {
    backgroundColor: colors[notificationType] || colors.default,
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  };
});

const FilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(2),
  },
}));

const NoNotificationsBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px dashed ${alpha(theme.palette.divider, 0.6)}`,
}));

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& a': {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.text.primary,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const NotificationTypeChip = styled(Chip)(({ theme, notificationType }) => {
  const colors = {
    post: theme.palette.info.main,
    follow: theme.palette.success.main,
    system: theme.palette.warning.main,
    comment: theme.palette.secondary.main,
    like: theme.palette.error.main,
    default: theme.palette.primary.main,
  };
  
  return {
    height: 20,
    fontSize: '0.7rem',
    backgroundColor: alpha(colors[notificationType] || colors.default, 0.1),
    color: colors[notificationType] || colors.default,
    marginBottom: theme.spacing(1),
  };
});

const TimeStamp = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  marginTop: theme.spacing(1),
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
}));

// 通知アイコンを取得する関数
const getNotificationIcon = (type) => {
  switch (type) {
    case 'post':
      return <ArticleIcon fontSize="large" />;
    case 'follow':
      return <PeopleIcon fontSize="large" />;
    case 'system':
      return <CampaignIcon fontSize="large" />;
    case 'comment':
      return <CommentIcon fontSize="large" />;
    case 'like':
      return <ThumbUpIcon fontSize="large" />;
    default:
      return <NotificationsIcon fontSize="large" />;
  }
};

// 通知タイプの日本語表示
const getNotificationTypeLabel = (type) => {
  switch (type) {
    case 'post':
      return '投稿';
    case 'follow':
      return 'フォロー';
    case 'system':
      return 'お知らせ';
    case 'comment':
      return 'コメント';
    case 'like':
      return 'いいね';
    default:
      return 'その他';
  }
};

// 日付フォーマット
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 24時間以内なら「○時間前」のように表示
    if (now - date < 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true, locale: ja });
    }
    // 昨日なら「昨日 15:30」のように表示
    else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return `昨日 ${format(date, 'HH:mm', { locale: ja })}`;
    }
    // 今年なら「3月15日 15:30」のように表示
    else if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'M月d日 HH:mm', { locale: ja });
    }
    // それ以前なら「2022年3月15日」のように表示
    else {
      return format(date, 'yyyy年M月d日', { locale: ja });
    }
  } catch (e) {
    return '不明な日時';
  }
};

// メインコンポーネント
const NotificationsPage = React.memo(() => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    fetchNotifications,
    deleteNotification,
    currentPage,
    totalPages,
    hasMore 
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState(0); // 0: すべて, 1: 未読, 2: お知らせ
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  
  const navigate = useNavigate();
  const theme = useTheme();
  
  // タブごとの通知タイプ
  const getNotificationTypeForTab = (tabIndex) => {
    switch (tabIndex) {
      case 0: return 'all';      // すべて
      case 1: return 'unread';   // 未読
      case 2: return 'system';   // お知らせ
      default: return 'all';
    }
  };
  
  // この効果を確認
  useEffect(() => {
    console.log(`コンポーネントがマウントされました - 初期化`);
    // 初期化処理
    return () => {
      console.log(`コンポーネントがアンマウントされました - クリーンアップ`);
    };
  }, []);

  // ここで同期の問題が発生している可能性があるため、この効果を削除
  // useEffect(() => {
  //   // コンテキストの currentPage が変更されたときに、ローカルの page 状態を更新
  //   if (currentPage !== page) {
  //     console.log(`コンテキストのページが変更されました: ${currentPage} (ローカル: ${page})`);
  //     setPage(currentPage);
  //   }
  // }, [currentPage, page]);
  
  // 初回のみ実行される初期ロード
  useEffect(() => {
    // ページ状態とタブ状態の初期化を確認
    console.log(`初期化: タブ=${activeTab}, ページ=${page}, コンテキストページ=${currentPage}`);
    
    // 必要な場合のみ通知を取得（既にデータがある場合はスキップ）
    if (notifications.length === 0 && !loading) {
      const type = getNotificationTypeForTab(activeTab);
      console.log(`初期ロードでの通知取得: タブ=${activeTab}, ページ=${page}, タイプ=${type}`);
      fetchNotifications(page, perPage, type);
    }
  }, []); // 初回のみ実行

  // タブ切り替え処理
  const handleTabChange = (event, newValue) => {
    // 現在のタブと同じなら何もしない
    if (newValue === activeTab) return;
    
    console.log(`タブ切り替え: ${activeTab} -> ${newValue}`);
    setActiveTab(newValue);
    
    // タブ切り替え時にページを1に戻す
    setPage(1);
    
    // 選択されたタブに基づいて通知を再取得
    const type = getNotificationTypeForTab(newValue);
    console.log(`タブ切り替えによる通知取得: ページ=1, タイプ=${type}`);
    fetchNotifications(1, perPage, type);
  };

  // 通知をクリックしたときの処理
  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read) {
      const idToUse = notification._id || notification.id; // _idとidの両方をサポート
      markAsRead(idToUse);
    }
    
    // 通知タイプに応じてナビゲーション
    switch (notification.type) {
      case 'post':
        navigate(`/novel/${notification.data.postId}`);
        break;
      case 'follow':
        navigate(`/user/${notification.data.userId}`);
        break;
      case 'system':
        // システム通知の場合はお知らせの詳細ページなどへ
        if (notification.data && notification.data.announcementId) {
          navigate(`/announcements/${notification.data.announcementId}`);
        } else if (notification.data && notification.data.contestId) {
          navigate(`/contests/${notification.data.contestId}`);
        }
        break;
      case 'comment':
        navigate(`/novel/${notification.data.postId}#comment-${notification.data.commentId}`);
        break;
      case 'like':
        navigate(`/novel/${notification.data.postId}`);
        break;
      default:
        // その他の通知
        break;
    }
  }, [markAsRead, navigate]);

  // 通知メニューを開く
  const handleOpenMenu = useCallback((event, notification) => {
    event.stopPropagation();
    setSelectedNotification(notification);
    setMenuAnchorEl(event.currentTarget);
  }, []);

  // 通知メニューを閉じる
  const handleCloseMenu = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  // 通知を削除する
  const handleDeleteNotification = useCallback(() => {
    handleCloseMenu();
    if (!selectedNotification) return;

    const idToUse = selectedNotification._id || selectedNotification.id;
    deleteNotification(idToUse)
      .then(() => {
        // 削除成功メッセージを表示
        setSnackbar({
          open: true,
          message: '通知を削除しました',
          severity: 'success',
        });
      })
      .catch(error => {
        console.error('通知の削除エラー:', error);
        setSnackbar({
          open: true,
          message: '通知の削除に失敗しました',
          severity: 'error',
        });
      });
  }, [selectedNotification, handleCloseMenu, deleteNotification]);

  // スナックバーを閉じる
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // 「すべて既読」ボタンのクリックハンドラ
  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
    setSnackbar({
      open: true,
      message: 'すべての通知を既読にしました',
      severity: 'success',
    });
  }, [markAllAsRead]);

  // ページ変更ハンドラ
  const handlePageChange = useCallback((event, value) => {
    // 現在と同じページが選択された場合は何もしない
    if (value === page) {
      console.log(`同じページが選択されました: ${value}`);
      return;
    }
    
    // ローカルの状態を更新
    console.log(`ページ変更: ${page} -> ${value}`);
    setPage(value);
    
    // 選択されたページで通知を再取得
    const type = getNotificationTypeForTab(activeTab);
    console.log(`ページ変更時の通知取得: ページ=${value}、タイプ=${type}`);
    fetchNotifications(value, perPage, type);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchNotifications, activeTab, perPage, page]);

  return (
    <PageContainer maxWidth="md">
      <StyledBreadcrumbs aria-label="breadcrumb">
        <Link to="/">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          ホーム
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsIcon sx={{ mr: 0.5 }} fontSize="small" />
          通知
        </Typography>
      </StyledBreadcrumbs>

      <FilterBar>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
            通知一覧
          </Typography>
          {unreadCount > 0 && (
            <Chip
              icon={<NotificationsActiveIcon />}
              label={`未読 ${unreadCount}件`}
              color="primary"
              size="small"
              sx={{ fontWeight: 'medium' }}
            />
          )}
        </Box>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<MarkChatReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            sx={{ mr: 1 }}
            size="small"
          >
            すべて既読
          </Button>
          <Tooltip title="表示オプション">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </FilterBar>

      <Paper elevation={0} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="notification tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="すべて" />
          <Tab label={`未読 ${unreadCount > 0 ? `(${unreadCount})` : ''}`} />
          <Tab label="お知らせ" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <NoNotificationsBox>
          <NotificationsOffIcon sx={{ fontSize: 56, color: alpha(theme.palette.text.secondary, 0.4), mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {activeTab === 1 ? '未読の通知はありません' : 
             activeTab === 2 ? 'お知らせはありません' : '通知はありません'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 1
              ? 'すべての通知が既読になっています'
              : activeTab === 2
                ? '運営からのお知らせやキャンペーン情報がここに表示されます'
                : 'フォローしているユーザーの投稿や、あなたの作品に関する通知がここに表示されます'}
          </Typography>
        </NoNotificationsBox>
      ) : (
        <>
          <Box>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification._id || notification.id}
                read={notification.read}
                onClick={() => handleNotificationClick(notification)}
                sx={{ cursor: 'pointer' }}
              >
                <Grid container spacing={2}>
                  <Grid item>
                    <NotificationAvatar notificationType={notification.type}>
                      {getNotificationIcon(notification.type)}
                    </NotificationAvatar>
                  </Grid>
                  <Grid item xs>
                    <Box sx={{ position: 'relative', pr: 4 }}>
                      {!notification.read && (
                        <CircleIcon
                          sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            fontSize: 10,
                            color: 'primary.main',
                          }}
                        />
                      )}
                      <NotificationTitle variant="subtitle1" read={notification.read}>
                        {notification.title}
                      </NotificationTitle>
                      <NotificationTypeChip
                        label={getNotificationTypeLabel(notification.type)}
                        size="small"
                        notificationType={notification.type}
                      />
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {notification.message}
                      </Typography>
                      <TimeStamp>
                        <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </TimeStamp>
                    </Box>
                  </Grid>
                </Grid>

                <ActionButtons>
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, notification)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </ActionButtons>
              </NotificationCard>
            ))}
          </Box>

          {/* ページネーション - サーバーサイドページネーションを使用 */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page} // ローカルのページ状態を使用
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* 通知操作メニュー */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem
            onClick={() => {
              markAsRead(selectedNotification._id || selectedNotification.id);
              handleCloseMenu();
              setSnackbar({
                open: true,
                message: '通知を既読にしました',
                severity: 'success',
              });
            }}
          >
            <ListIcon>
              <MarkChatReadIcon fontSize="small" />
            </ListIcon>
            <ListItemText primary="既読にする" />
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteNotification}>
          <ListIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListIcon>
          <ListItemText primary="削除" />
        </MenuItem>
      </Menu>

      {/* 操作結果のスナックバー通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
});

NotificationsPage.displayName = 'NotificationsPage';

export default NotificationsPage;