import React, { useCallback, useState } from 'react';
import {
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
  IconButton,
  Badge,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Create as CreateIcon,
  AccountCircle as AccountCircleIcon,
  Bookmark as BookmarkIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  HelpOutline as HelpOutlineIcon,
  Notifications as NotificationsIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

// Styled components for the buttons
const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  paddingLeft: theme.spacing(2.5),
  paddingRight: theme.spacing(2.5),
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: 'none',
  whiteSpace: 'nowrap',
  minWidth: 'auto',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-1px)',
  },
  transition: 'all 0.2s',
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  textTransform: 'none',
  borderColor: 'rgba(255, 255, 255, 0.7)',
  whiteSpace: 'nowrap',

  minWidth: 'auto',
  '&:hover': {
    borderColor: 'rgba(255, 255, 255, 1)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  cursor: 'pointer',
  border: '2px solid white',
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    transform: 'scale(1.05)',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: 4,
  margin: '2px 8px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const AuthButtons = React.memo(({ user, auth, handleLogout, vertical = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const onLogout = useCallback(async () => {
    setAnchorEl(null);
    await handleLogout();
    navigate('/login');
  }, [handleLogout, navigate]);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path, state = null) => {
    handleClose();
    if (state) {
      navigate(path, { state });
    } else {
      navigate(path);
    }
  };


  // For vertical layout (used in mobile drawer)
  if (vertical) {
    return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {auth ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
              <UserAvatar src={user?.icon} alt={user?.nickname} />
              <Box sx={{ ml: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user?.nickname}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role}
                </Typography>
              </Box>
            </Box>

            <PrimaryButton
              variant="contained"
              color="primary"
              startIcon={<CreateIcon />}
              fullWidth
              component={Link}
              to="/new-post"
            >
              小説を投稿する
            </PrimaryButton>

            <PrimaryButton
              variant="outlined"
              color="primary"
              startIcon={<AccountCircleIcon />}
              fullWidth
              component={Link}
              to="/mypage"
            >
              マイページ
            </PrimaryButton>

            <Divider sx={{ my: 1 }} />

            <PrimaryButton
              variant="outlined"
              color="error"
              startIcon={<ExitToAppIcon />}
              fullWidth
              onClick={onLogout}
            >
              ログアウト
            </PrimaryButton>
          </>
        ) : (
          <>
            <PrimaryButton
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              fullWidth
              component={Link}
              to="/login"
            >
              ログイン
            </PrimaryButton>

            <PrimaryButton
              variant="outlined"
              color="primary"
              startIcon={<PersonAddIcon />}
              fullWidth
              component={Link}
              to="/register"
            >
              新規登録
            </PrimaryButton>
          </>
        )}
      </Box>
    );
  }

  // Default horizontal layout for header
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
<PrimaryButton
  variant="contained"
  color="secondary"
  startIcon={<CreateIcon />}
  component={Link}
  to="/new-post"
  sx={{ 
    display: { xs: 'none', sm: 'flex' },
    mr: 1.5, // 余白を調整
    minWidth: 140, // 「小説投稿」が確実に横書きになる十分な幅を確保
    width: 'auto',
    whiteSpace: 'nowrap', // テキストの改行を防ぐ
    overflow: 'visible', // テキストの表示を確実にする
    textOverflow: 'clip', // 省略記号を表示しない
    flexDirection: 'row', // 横方向の配置を強制
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // ボタン自体が縮まないようにする
    backgroundColor: '#ff5722',
    '&:hover': {
      backgroundColor: '#f4511e',
    },
    '& .MuiButton-label': {
      whiteSpace: 'nowrap',
      overflow: 'visible',
    },
    '& .MuiButton-startIcon': {
      flexShrink: 0, // アイコンのサイズを固定
    }
  }}
>
        小説投稿
      </PrimaryButton>

      {auth ? (
        <>
          <Tooltip title="アカウント設定">
            <IconButton onClick={handleProfileClick} sx={{ p: 0.5 }}>
              <UserAvatar src={user?.icon} alt={user?.nickname} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                mt: 1.5,
                width: 220,
                borderRadius: 2,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
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
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.nickname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>

            <Divider />

            <StyledMenuItem onClick={() => handleMenuItemClick('/mypage')}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              マイページ
            </StyledMenuItem>

            <StyledMenuItem onClick={() => handleMenuItemClick('/mypage', { activeTab: 'bookshelf' })}>
              <ListItemIcon>
                <BookmarkIcon fontSize="small" />
              </ListItemIcon>
              本棚
            </StyledMenuItem>


            <StyledMenuItem onClick={() => handleMenuItemClick('/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              設定
            </StyledMenuItem>

            <StyledMenuItem onClick={() => handleMenuItemClick('/help')}>
              <ListItemIcon>
                <HelpOutlineIcon fontSize="small" />
              </ListItemIcon>
              ヘルプ
            </StyledMenuItem>

            <Divider />

            <StyledMenuItem onClick={onLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" color="error" />
              </ListItemIcon>
              <Typography color="error">ログアウト</Typography>
            </StyledMenuItem>
          </Menu>
        </>
      ) : (
        <>
          <SecondaryButton
            variant="outlined"
            color="inherit"
            startIcon={<LoginIcon />}
            component={Link}
            to="/login"
            sx={{ mr: { xs: 1, sm: 2 } }}
          >
            ログイン
          </SecondaryButton>

          <PrimaryButton
            variant="contained"
            color="secondary"
            startIcon={<PersonAddIcon />}
            component={Link}
            to="/register"
            sx={{
              backgroundColor: '#ff5722',
              '&:hover': {
                backgroundColor: '#f4511e',
              }
            }}
          >
            新規登録
          </PrimaryButton>
        </>
      )}
    </Box>
  );
});

export default AuthButtons;