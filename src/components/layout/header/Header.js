import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Badge, 
  Box, 
  useScrollTrigger,
  Container,
  Slide,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import Logo from './Logo';
import AuthButtons from './AuthButtons';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotificationMenu from './NotificationMenu';
import RankingButton from './RankingButton'; // 新しいRankingButtonコンポーネントのインポート

// Hide AppBar on scroll down
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = React.memo(({ auth, handleLogout, user }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // ユーザー情報の状態をチェック
  useEffect(() => {
    // auth=trueだけどユーザー情報がない場合にローディング表示
    if (auth && (!user || !user.icon)) {
      setUserLoading(true);
    } else {
      setUserLoading(false);
    }
  }, [auth, user]);
  
  // Add elevation to AppBar after scrolling
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setElevated(isScrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const drawerItems = [
    { text: 'ホーム', icon: <HomeIcon />, link: '/' },
    { text: '探索', icon: <ExploreIcon />, link: '/explore' },
    { text: '人気作品', icon: <WhatshotIcon />, link: '/trending' },
    { text: 'コンテスト', icon: <EmojiEventsIcon />, link: '/contests' },
    { text: 'お気に入り', icon: <BookmarkIcon />, link: '/favorites' },
    { text: 'ヘルプ', icon: <HelpOutlineIcon />, link: '/help' },
  ];

  return (
    <>
      <HideOnScroll>
        <AppBar 
          position="fixed" 
          elevation={elevated ? 4 : 0}
          sx={{ 
            background: elevated 
              ? 'linear-gradient(90deg, rgba(28,55,99,1) 0%, rgba(54,94,168,1) 100%)' 
              : 'linear-gradient(90deg, rgba(25,55,102,0.95) 0%, rgba(54,94,168,0.95) 100%)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            borderBottom: elevated ? 'none' : '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ 
              py: 0.5, 
              justifyContent: 'space-between',
              '&.MuiToolbar-root': {
                minHeight: elevated ? 64 : 70,
                transition: 'min-height 0.3s ease'
              }
            }}>
              {isMobile && (
                <IconButton 
                  edge="start" 
                  color="inherit" 
                  aria-label="menu"
                  onClick={toggleDrawer}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexShrink: 0,
                mr: isMobile ? 1 : 3
              }}>
                <Logo />
              </Box>
              
              {!isMobile && <SearchBar />}
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    marginRight: 1,
                    position: 'relative',
                    '&::after': auth ? {
                      content: '""',
                      position: 'absolute',
                      width: 6,
                      height: 6,
                      backgroundColor: '#ff5722',
                      borderRadius: '50%',
                      top: 14,
                      right: 14,
                    } : {}
                  }}
                >
                  {auth && <NotificationMenu />}
                </IconButton>
                <RankingButton isMobile={isMobile} />

                {userLoading ? (
                  <CircularProgress color="inherit" size={24} sx={{ mr: 2 }} />
                ) : (
                  <AuthButtons user={user} auth={auth} handleLogout={handleLogout} />
                )}
              </Box>
            </Toolbar>
            
            {isMobile && (
              <Box sx={{ px: 2, pb: 2 }}>
                <SearchBar />
              </Box>
            )}
          </Container>
        </AppBar>
      </HideOnScroll>
      
      {/* Mobile navigation drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 280,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("/paper-texture.png")',
            backgroundBlendMode: 'overlay',
          }
        }}
      >
        <Box sx={{ py: 2, px: 1, display: 'flex', justifyContent: 'center' }}>
          <Logo />
        </Box>
        
        <Divider />
        
        <List>
          {drawerItems.map((item, index) => (
            <ListItem 
              button 
              component={Link} 
              to={item.link} 
              key={item.text}
              onClick={toggleDrawer}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(25,118,210,0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ p: 2 }}>
          {userLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <AuthButtons user={user} auth={auth} handleLogout={handleLogout} vertical />
          )}
        </Box>
      </Drawer>
      
      {/* Add spacing below the AppBar to prevent content from hiding underneath */}
      <Toolbar sx={{ mb: 2 }} />
      {isMobile && <Toolbar sx={{ mb: 1 }} />}
    </>
  );
});

export default Header;