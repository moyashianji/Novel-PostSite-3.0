// NotificationMenu.js
import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  alpha,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Article as ArticleIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  Circle as CircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  MarkChatRead as MarkChatReadIcon,
  AccessTime as AccessTimeIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  NotificationsNone as NotificationsNoneIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

// スタイル付きコンポーネント
const NotificationMenuPaper = styled(Paper)(({ theme }) => ({
  maxWidth: 380,
  width: '100vw',
  maxHeight: '80vh',
  overflow: 'hidden',
  borderRadius: 12,
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
}));

const NotificationItem = styled(ListItem)(({ theme, read }) => ({
  padding: theme.spacing(1.5, 2.5),
  backgroundColor: read ? 'transparent' : alpha(theme.palette.primary.light, 0.05),
  borderLeft: read ? 'none' : `3px solid ${theme.palette.primary.main}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.08),
    transform: 'translateY(-1px)',
  },
}));

const TimeChip = styled(Box)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  display: 'flex',
  alignItems: 'center',
  marginTop: 4,
}));

const NotificationAvatar = styled(Avatar)(({ theme, notificationType }) => {
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
    width: 40,
    height: 40,
    boxShadow: read => read ? 'none' : `0 2px 8px ${alpha(colors[notificationType] || colors.default, 0.4)}`,
  };
});

const EmptyState = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  height: 200,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTab-root': {
    minHeight: 48,
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 20,
  boxShadow: 'none',
  padding: '4px 12px',
  '&:hover': {
    boxShadow: 'none',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 2.5),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.5),
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
  overflow: 'auto',
  maxHeight: 400,
  scrollbarWidth: 'thin',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.divider, 0.2),
    borderRadius: 3,
  },
}));

// 通知タイプに基づいてアイコンを返す関数
const getNotificationIcon = (type) => {
  switch (type) {
    case 'post':
      return <ArticleIcon />;
    case 'follow':
      return <PeopleIcon />;
    case 'system':
      return <CampaignIcon />;
    case 'comment':
      return <CommentIcon />;
    case 'like':
      return <ThumbUpIcon />;
    default:
      return <NotificationsIcon />;
  }
};

// タイムスタンプを整形する関数
const formatTimeAgo = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ja });
  } catch (e) {
    return '不明な日時';
  }
};

const NotificationMenu = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: すべて, 1: 未読, 2: お知らせ
  const hasInitialFetchedRef = useRef(false);
  const menuOpenedRef = useRef(false);
  
  // コンポーネントがマウントされたとき、または通知数が変わったときに一度だけ実行
  useEffect(() => {
    // まだ初回フェッチが行われていなければ実行
    if (!hasInitialFetchedRef.current) {
      hasInitialFetchedRef.current = true;
      fetchNotifications();
    }
  }, [fetchNotifications]);
  
  const handleClick = (event) => {
    // メニューが既に開いている場合は閉じるだけ
    if (anchorEl) {
      setAnchorEl(null);
      menuOpenedRef.current = false;
      return;
    }
    
    // メニューを開く
    setAnchorEl(event.currentTarget);
    
    // メニューが開かれた直後に1回だけ通知を取得
    if (!menuOpenedRef.current) {
      menuOpenedRef.current = true;
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    menuOpenedRef.current = false;
  };

  const handleReadNotification = async (notification) => {
    // クリックしただけで既読にする
    if (!notification.read) {
      const idToUse = notification._id || notification.id;
      await markAsRead(idToUse);
      
      // 既に通知を既読としてUIに反映させる（フェッチ待ちではなく）
      notification.read = true;
    }
    
    handleClose();
    
    // 通知タイプに応じてナビゲーション
    switch (notification.type) {
      case 'post':
        navigate(`/novel/${notification.data.postId}`);
        break;
      case 'follow':
        navigate(`/user/${notification.data.userId}`);
        break;
      case 'system':
        // システム通知の場合はお知らせページなどへ
        if (notification.data && notification.data.announcementId) {
          navigate(`/announcements/${notification.data.announcementId}`);
        } else if (notification.data && notification.data.contestId) {
          navigate(`/contests/${notification.data.contestId}`);
        } else {
          navigate('/announcements');
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
  };

  // タブ選択時の処理
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // すべて既読にするハンドラ
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // タブに応じて通知をフィルタリング
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 0) return true; // すべて
    if (activeTab === 1) return !notification.read; // 未読のみ
    if (activeTab === 2) return notification.type === 'system'; // お知らせのみ
    return true;
  });

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="通知">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-controls={open ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            overlap="circular"
            sx={{ 
              '& .MuiBadge-badge': { 
                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)' },
                  '70%': { boxShadow: '0 0 0 6px rgba(244, 67, 54, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' }
                }
              }
            }}
          >
            {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()} // クリックが親要素に伝播しないようにする
        PaperProps={{
          component: NotificationMenuPaper,
          elevation: 0,
          sx: {
            overflow: 'visible',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              boxShadow: '-3px -3px 5px rgba(0,0,0,0.02)'
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        keepMounted
      >
        <HeaderBox>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 1, fontSize: 20 }} />
            通知
            {unreadCount > 0 && (
              <Box 
                component="span" 
                sx={{ 
                  ml: 1, 
                  px: 1.2, 
                  py: 0.2, 
                  bgcolor: 'error.main', 
                  color: 'white', 
                  borderRadius: 10, 
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {unreadCount}
              </Box>
            )}
          </Typography>
          <ActionButton
            size="small"
            startIcon={<MarkChatReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            variant="outlined"
            color="primary"
          >
            すべて既読
          </ActionButton>
        </HeaderBox>
        
        <StyledTabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="すべて" />
          <Tab label={`未読 ${unreadCount > 0 ? `(${unreadCount})` : ''}`} />
          <Tab label="お知らせ" />
        </StyledTabs>

        <ScrollableContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress size={30} color="primary" />
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState>
              <NotificationsNoneIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2, color: alpha('#000', 0.3) }} />
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                {activeTab === 1 ? '未読の通知はありません' : 
                 activeTab === 2 ? 'お知らせはありません' : '通知はありません'}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {activeTab === 1
                  ? 'すべての通知が既読になっています'
                  : activeTab === 2
                    ? 'システムからのお知らせがここに表示されます'
                    : 'フォローしているユーザーの投稿や、あなたの作品に関する通知がここに表示されます'}
              </Typography>
            </EmptyState>
          ) : (
            <List disablePadding>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification._id || notification.id || index}>
                  <NotificationItem
                    onClick={() => handleReadNotification(notification)}
                    read={notification.read}
                    alignItems="flex-start"
                  >
                    <ListItemAvatar>
                      <NotificationAvatar notificationType={notification.type} read={notification.read}>
                        {getNotificationIcon(notification.type)}
                      </NotificationAvatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ pr: 2, position: 'relative' }}>
                          <Typography 
                            variant="body2" 
                            component="span" 
                            fontWeight={notification.read ? 'normal' : 600}
                            sx={{ lineHeight: 1.4 }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <CircleIcon
                              sx={{
                                fontSize: 8,
                                color: 'primary.main',
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 0.5,
                              opacity: notification.read ? 0.8 : 1,
                              fontSize: '0.85rem',
                              lineHeight: 1.4
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <TimeChip>
                            <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                            {formatTimeAgo(notification.createdAt)}
                          </TimeChip>
                        </>
                      }
                    />
                  </NotificationItem>
                  {index < filteredNotifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </ScrollableContent>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider', 
            bgcolor: alpha('#f5f5f5', 0.3)
          }}
        >
          <ActionButton
            color="primary"
            variant="contained"
            onClick={() => {
              handleClose();
              navigate('/notifications');
            }}
            sx={{ minWidth: 180 }}
          >
            すべての通知を見る
          </ActionButton>
        </Box>
      </Menu>
    </>
  );
};

export default React.memo(NotificationMenu);