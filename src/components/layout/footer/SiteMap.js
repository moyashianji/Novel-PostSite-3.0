import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Link, 
  Breadcrumbs, 
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { 
  Home as HomeIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
  HowToReg as HowToRegIcon,
  LockReset as LockResetIcon,
  Person as PersonIcon,
  Create as CreateIcon,
  MenuBook as MenuBookIcon,
  Edit as EditIcon,
  Collections as CollectionsIcon,
  Analytics as AnalyticsIcon,
  EmojiEvents as EmojiEventsIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  AppRegistration as AppRegistrationIcon
} from '@mui/icons-material';

// Styled components
const SitemapSection = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const SectionHeader = styled(Box)(({ theme, color = 'primary.main' }) => ({
  backgroundColor: theme.palette[color.split('.')[0]][color.split('.')[1] || 'main'],
  color: theme.palette.getContrastText(theme.palette[color.split('.')[0]][color.split('.')[1] || 'main']),
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
}));

const SectionIcon = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    fontSize: 28,
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  transition: 'all 0.2s ease',
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(5px)',
  },
}));

const SiteLink = styled(RouterLink)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}));

// Sitemap data structure
const sitemapData = [
  {
    title: 'メインページ',
    icon: <HomeIcon />,
    color: 'primary.main',
    items: [
      { name: 'ホーム', path: '/', icon: <HomeIcon /> },
      { name: '検索', path: '/search', icon: <SearchIcon /> },
    ]
  },
  {
    title: 'ユーザーアカウント',
    icon: <AccountCircleIcon />,
    color: 'secondary.main',
    items: [
      { name: 'ログイン', path: '/login', icon: <LoginIcon /> },
      { name: '新規登録', path: '/register', icon: <HowToRegIcon /> },
      { name: 'サインアップ', path: '/signup', icon: <AppRegistrationIcon /> },
      { name: 'パスワードを忘れた', path: '/forgot-password', icon: <LockResetIcon /> },
      { name: 'パスワードリセット', path: '/reset-password', icon: <LockResetIcon /> },
    ]
  },
  {
    title: 'ユーザープロフィール',
    icon: <PersonIcon />,
    color: 'info.main',
    items: [
      { name: 'マイページ', path: '/mypage', icon: <PersonIcon /> },
      { name: 'ユーザーページ', path: '/user/:id', icon: <AccountCircleIcon />, dynamic: true },
    ]
  },
  {
    title: '作品関連',
    icon: <MenuBookIcon />,
    color: 'success.main',
    items: [
      { name: '作品投稿', path: '/new-post', icon: <CreateIcon /> },
      { name: '作品詳細', path: '/novel/:id', icon: <MenuBookIcon />, dynamic: true },
      { name: '作品編集', path: '/mypage/novel/:id/edit', icon: <EditIcon />, dynamic: true },
      { name: 'シリーズ編集', path: '/mypage/series/:id/edit', icon: <CollectionsIcon />, dynamic: true },
      { name: 'シリーズ内作品', path: '/series/:id/works', icon: <MenuBookIcon />, dynamic: true },
      { name: '分析ページ', path: '/analytics/:id', icon: <AnalyticsIcon />, dynamic: true },
    ]
  },
  {
    title: 'コンテスト関連',
    icon: <EmojiEventsIcon />,
    color: 'warning.main',
    items: [
      { name: 'コンテスト一覧', path: '/contests', icon: <EmojiEventsIcon /> },
      { name: 'コンテスト詳細', path: '/contests/:id', icon: <VisibilityIcon />, dynamic: true },
      { name: 'コンテスト参加', path: '/contests/:id/enter', icon: <HowToRegIcon />, dynamic: true },
      { name: 'コンテスト作成', path: '/contests/create', icon: <AddIcon /> },
      { name: 'コンテストプレビュー', path: '/contest-preview', icon: <VisibilityIcon /> },
      { name: 'コンテスト編集', path: '/contest-edit/:id', icon: <EditIcon />, dynamic: true },
    ]
  },
];

const Sitemap = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Page Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          サイトマップ
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          A7Studio の全ページをカテゴリごとに整理してご案内します
        </Typography>
        <Breadcrumbs aria-label="breadcrumb" sx={{ display: 'flex', justifyContent: 'center' }}>
          <Link component={RouterLink} to="/" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            ホーム
          </Link>
          <Typography color="text.primary">サイトマップ</Typography>
        </Breadcrumbs>
      </Box>
      
      {/* Sitemap Sections */}
      <Grid container spacing={4}>
        {sitemapData.map((section, index) => (
          <Grid item xs={12} md={6} key={index}>
            <SitemapSection elevation={3}>
              <SectionHeader color={section.color}>
                <SectionIcon>{section.icon}</SectionIcon>
                <Typography variant="h6" fontWeight="bold">
                  {section.title}
                </Typography>
              </SectionHeader>
              
              <CardContent sx={{ p: 2 }}>
                <List disablePadding>
                  {section.items.map((item, idx) => (
                    <StyledListItem disablePadding key={idx}>
                      {item.dynamic ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {item.name}
                                <Chip 
                                  size="small" 
                                  label="動的ページ" 
                                  sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                                  color="info"
                                />
                              </Box>
                            }
                            secondary={item.path}
                          />
                        </Box>
                      ) : (
                        <SiteLink to={item.path}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText primary={item.name} />
                        </SiteLink>
                      )}
                    </StyledListItem>
                  ))}
                </List>
              </CardContent>
            </SitemapSection>
          </Grid>
        ))}
      </Grid>
      
      {/* Additional links or notes */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mt: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          注意事項
        </Typography>
        <Typography variant="body2" color="text.secondary">
          「動的ページ」とマークされたページはURLに ID などのパラメータを含み、実際のコンテンツはデータベースから動的に生成されます。
          例えば、<code>/novel/:id</code> のURLでは、<code>:id</code> の部分に実際の小説IDが入ります。
        </Typography>
      </Paper>
    </Container>
  );
};

export default Sitemap;