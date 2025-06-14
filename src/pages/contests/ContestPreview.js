import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import DOMPurify from 'dompurify';
import PostCard from '../../components/post/PostCard';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Modal,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Avatar,
  Divider,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Container,
  Stack,
  Backdrop,
  Fade,
  useTheme,
  Tabs,
  Tab,
  Tooltip,
  Badge,
  alpha,
  Alert,
  styled,
  Skeleton,
} from '@mui/material';
import {
  Close as CloseIcon,
  EditCalendar as EditCalendarIcon,
  MilitaryTech as MilitaryTechIcon,
  Done as DoneIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  Search as SearchIcon,
  FiberNew as NewIcon, 
  Stars as StarsIcon,
  Info as InfoIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  ThumbUp as ThumbUpIcon,
  Share as ShareIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  VerifiedUser as VerifiedUserIcon,
  EmojiEvents as EmojiEventsIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { ja } from 'date-fns/locale';

// スタイル付きコンポーネント
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const StickyContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 80,
  marginBottom: theme.spacing(3),
}));

const GradientOverlayBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '50%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
    pointerEvents: 'none',
  },
}));

// ヘッダーバナー
const HeaderBanner = ({ headerImage, title, status, getStatusChip }) => (
  <Box sx={{ position: 'relative', mb: 4, borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
    <Box sx={{ position: 'relative' }}>
      <img
        src={headerImage}
        alt={title}
        style={{ 
          width: '100%', 
          height: '300px', 
          objectFit: 'cover', 
          display: 'block',
        }}
      />
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))', 
        p: 3,
        pt: 6,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {title}
          </Typography>
          <Box>
            {getStatusChip(status)}
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

// サイドバー
const Sidebar = React.memo(({ creatorInfo, contest, getStatusChip, handleOpenModal, isContestActive, formatDate }) => (
  <StickyContainer>
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ bgcolor: 'primary.main', p: 2, color: 'white', textAlign: 'center' }}>
        <Typography variant="h6" fontWeight="bold">主催者</Typography>
      </Box>
      
      <Box sx={{ p: 3 }}>
        {creatorInfo ? (
          <Stack alignItems="center" spacing={2}>
            <RouterLink to={`/user/${creatorInfo._id}`} style={{ textDecoration: 'none' }}>
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: 'success.main',
                      borderRadius: '50%',
                      border: '2px solid white',
                    }}
                  />
                }
              >
                <Avatar 
                  src={creatorInfo.icon} 
                  alt={creatorInfo.nickname} 
                  sx={{ 
                    width: 100, 
                    height: 100,
                    border: '3px solid white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }} 
                />
              </StyledBadge>
            </RouterLink>
            <Typography variant="h6" fontWeight="bold" align="center">
              {creatorInfo.nickname}
            </Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={2}>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: 'success.main',
                    borderRadius: '50%',
                    border: '2px solid white',
                  }}
                />
              }
            >
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100,
                  border: '3px solid white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }} 
              />
            </StyledBadge>
            <Typography variant="h6" fontWeight="bold" align="center">
              プレビューユーザー
            </Typography>
          </Stack>
        )}

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            color="primary" 
            sx={{ mb: 1 }}
          >
            {contest.entries ? contest.entries.length : 0}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            応募作品数
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            {getStatusChip(contest.status)}
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            fullWidth
            onClick={handleOpenModal}
            disabled={!isContestActive}
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            }}
          >
            応募する（プレビュー）
          </Button>
          
          {!isContestActive && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              現在、このコンテストは応募を受け付けていません
            </Typography>
          )}
        </Box>
        
        {/* コンテスト情報 */}
        <Box sx={{ mt: 3 }}>
          <List disablePadding>
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemText 
                primary={
                  <Typography variant="body2" color="text.secondary">
                    応募期間
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" fontWeight="medium" sx={{ mt: 0.5 }}>
                    {formatDate(contest.applicationStartDate)} 〜 {formatDate(contest.applicationEndDate)}
                  </Typography>
                }
                disableTypography
              />
            </ListItem>
            
            <Divider />
            
            <ListItem sx={{ px: 0, py: 1.5 }}>
              <ListItemText 
                primary={
                  <Typography variant="body2" color="text.secondary">
                    結果発表
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" fontWeight="medium" sx={{ mt: 0.5 }}>
                    {formatDate(contest.resultAnnouncementDate)}
                  </Typography>
                }
                disableTypography
              />
            </ListItem>
            
            {contest.minEntries > 0 && (
              <>
                <Divider />
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        開催最低応募数
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" fontWeight="medium" sx={{ mt: 0.5 }}>
                        {contest.minEntries}作品
                      </Typography>
                    }
                    disableTypography
                  />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Box>
    </Paper>
    
    {/* シェアボタン */}
    <Paper 
      elevation={2} 
      sx={{ 
        borderRadius: 3, 
        mt: 3, 
        p: 2,
        display: 'flex',
        justifyContent: 'center',
        gap: 2
      }}
    >
      <Tooltip title="シェア">
        <IconButton 
          color="primary" 
          sx={{ 
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          <ShareIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="フラグを立てる">
        <IconButton 
          color="error" 
          sx={{ 
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          <FlagIcon />
        </IconButton>
      </Tooltip>
    </Paper>
  </StickyContainer>
));

// コンテスト概要
const ContestOverview = React.memo(({ contest, fixImagePaths, handleOpenModal, isContestActive }) => (
  <Box mb={4}>
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ bgcolor: 'primary.main', p: 2, color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          コンテスト概要
        </Typography>
      </Box>
      
      <Box sx={{ p: 4 }}>
        <div
          className="contest-description"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(fixImagePaths(contest.description)),
          }}
        />
        
        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            size="large"
            startIcon={<EmojiEventsIcon />}
            disabled={!isContestActive}
            onClick={handleOpenModal}
            sx={{
              px: 6,
              py: 2,
              borderRadius: 3,
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            応募する（プレビュー）
          </Button>
        </Box>
      </Box>
    </Paper>
  </Box>
));

// 応募条件
const EntryConditions = React.memo(({ contest, renderStatusChip, handleTagClick }) => (
  <Box mb={4}>
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ bgcolor: 'warning.main', p: 2, color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          応募条件
        </Typography>
      </Box>
      
      <List sx={{ py: 0 }}>
        <ListItem sx={{ py: 2, px: 3 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                完結済み作品
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderStatusChip(contest.allowFinishedWorks)}
            </Grid>
          </Grid>
        </ListItem>
        
        <Divider />
        <ListItem sx={{ py: 2, px: 3 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                応募開始前投稿作品
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderStatusChip(contest.allowPreStartDate)}
            </Grid>
          </Grid>
        </ListItem>
        
        <Divider />
        <ListItem sx={{ py: 2, px: 3 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                R18作品
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderStatusChip(contest.allowR18)}
            </Grid>
          </Grid>
        </ListItem>
        
        <Divider />
        <ListItem sx={{ py: 2, px: 3 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                シリーズ作品
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderStatusChip(contest.allowSeries)}
            </Grid>
          </Grid>
        </ListItem>
        
        <Divider />
        <ListItem sx={{ py: 2, px: 3 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                文字数制限
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {contest.minWordCount || 0} - {contest.maxWordCount || '制限なし'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  文字
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </ListItem>
        
        {contest.minEntries > 0 && (
          <>
            <Divider />
            <ListItem sx={{ py: 2, px: 3 }}>
              <Grid container alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    開催最低応募数
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {contest.minEntries}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      作品
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </ListItem>
          </>
        )}
      </List>
    </Paper>
  </Box>
));

// 審査員情報
const JudgesInfo = React.memo(({ contest }) => (
  <Box mb={4}>
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ bgcolor: 'success.main', p: 2, color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          <VerifiedUserIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          審査員
        </Typography>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {contest.judges.map((judge, index) => (
            <Grid item xs={12} sm={6} md={4} key={judge.userId?._id || index}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 3,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <RouterLink to={`/user/${judge.userId?._id}`} style={{ textDecoration: 'none' }}>
                    <Avatar
                      src={judge.userId?.icon}
                      alt={judge.userId?.nickname || '審査員'}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        margin: '0 auto', 
                        mb: 2,
                        border: '3px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                  </RouterLink>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {judge.userId?.nickname || '不明なユーザー'}
                  </Typography>
                  <Chip 
                    icon={<VerifiedUserIcon />} 
                    label="審査員" 
                    color="success" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  </Box>
));

// 応募作品一覧
const EntriesList = React.memo(({
  contest,
  sortedEntries,
  sortOrder,
  setSortOrder,
}) => (
  <Box mb={4}>
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{ 
          bgcolor: 'warning.main', 
          p: 2, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEventsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            応募作品一覧
          </Typography>
        </Box>
        <Chip 
          label={`${contest.entries ? contest.entries.length : 0}作品`} 
          color="default"
          sx={{ 
            fontWeight: 'bold', 
            bgcolor: 'white',
            color: 'warning.main'
          }} 
        />
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            応募作品を表示しています
          </Typography>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>表示順</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="表示順"
            >
              <MenuItem value="latest">最新順</MenuItem>
              <MenuItem value="oldest">古い順</MenuItem>
              <MenuItem value="mostViewed">閲覧数が多い順</MenuItem>
              <MenuItem value="mostLiked">いいね数が多い順</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {contest.entries && contest.entries.length > 0 ? (
          <Grid container spacing={3}>
            {sortedEntries.map((entry, index) => (
              <Grid item xs={12} sm={6} key={entry.postId ? entry.postId._id : index}>
                <Fade in={true} timeout={500}>
                  <Box>
                    {entry.postId ? (
                      <PostCard post={entry.postId} />
                    ) : (
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 3, 
                          borderRadius: 2,
                          height: '100%',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          }
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {entry.post ? entry.post.title : "応募作品"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          プレビューモード
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 5,
              textAlign: 'center',
              bgcolor: 'rgba(0,0,0,0.02)',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              まだ応募作品がありません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              あなたが最初の応募者になりませんか？
            </Typography>
          </Paper>
        )}
      </Box>
    </Paper>
  </Box>
));

const ContestPreview = () => {
  const [contest, setContest] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [sortOrder, setSortOrder] = useState('latest');
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // sessionStorageからデータを取得
    const storedData = sessionStorage.getItem('contestPreviewData');
    if (storedData) {
      setContest(JSON.parse(storedData));
    }
  }, []);

  const getStatusChip = useCallback((status) => {
    switch (status) {
      case '開催予定':
        return (
          <Chip 
            icon={<EventIcon />} 
            label="開催予定" 
            color="info" 
            sx={{ fontWeight: 'bold', fontSize: '0.9rem', px: 1 }}
          />
        );
      case '募集中':
        return (
          <Chip 
            icon={<AddIcon />} 
            label="募集中" 
            color="success" 
            sx={{ fontWeight: 'bold', fontSize: '0.9rem', px: 1 }}
          />
        );
      case '募集終了':
        return (
          <Chip 
            icon={<DoneIcon />} 
            label="募集終了" 
            color="error" 
            sx={{ fontWeight: 'bold', fontSize: '0.9rem', px: 1 }}
          />
        );
      case '募集一時停止中':
        return (
          <Chip 
            icon={<InfoIcon />} 
            label="募集一時停止中" 
            color="warning" 
            sx={{ fontWeight: 'bold', fontSize: '0.9rem', px: 1 }}
          />
        );
      default:
        return (
          <Chip 
            icon={<InfoIcon />} 
            label="不明" 
            color="default" 
            sx={{ fontWeight: 'bold', fontSize: '0.9rem', px: 1 }}
          />
        );
    }
  }, []);

  const renderStatusChip = useCallback((status) => (
    <Chip
      icon={status ? <CheckCircleIcon /> : <CancelIcon />}
      label={status ? '可' : '不可'}
      color={status ? 'success' : 'error'}
      sx={{ fontWeight: 'bold', marginLeft: 1 }}
    />
  ), []);

  const fixImagePaths = useCallback((html) => {
    return html.replace(/<img src="\/uploads\/(.*?)"/g, `<img src="http://localhost:5000/uploads/$1"`);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '未設定';
    
    try {
      // 日付として解析できるか確認
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // 無効な日付の場合はそのまま文字列を返す
        return dateString;
      }
      
      return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch (error) {
      console.error('Date format error:', error);
      // エラーが発生した場合はそのまま文字列を返す
      return dateString || '未設定';
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenModal = () => {
    // プレビューモードでは何もしない
    alert('これはプレビューモードです');
  };

  const isContestActive = useMemo(() => {
    if (!contest) return false;
    return contest.status === '募集中';
  }, [contest]);

  const sortedEntries = useMemo(() => {
    if (!contest || !contest.entries) return [];
    
    const entries = [...contest.entries];
    
    switch (sortOrder) {
      case 'oldest':
        return entries.reverse();
      case 'popular':
        return entries.sort((a, b) => (b.post?.views || 0) - (a.post?.views || 0));
      case 'latest':
      default:
        return entries;
    }
  }, [contest, sortOrder]);

  if (!contest) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6">プレビューするコンテスト情報がありません。</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ヘッダーバナー */}
      {contest.headerImage && (
        <HeaderBanner 
          headerImage={contest.headerImage} 
          title={contest.title} 
          status={contest.status} 
          getStatusChip={getStatusChip} 
        />
      )}

      <Grid container spacing={3}>
        {/* サイドバー */}
        <Grid item xs={12} md={3}>
          <Sidebar
            creatorInfo={contest.creator}
            contest={contest}
            getStatusChip={getStatusChip}
            handleOpenModal={handleOpenModal}
            isContestActive={isContestActive}
            formatDate={formatDate}
          />
        </Grid>

        {/* メインコンテンツ */}
        <Grid item xs={12} md={9}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              mb: 3,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: '1rem',
                py: 2,
              }
            }}
          >
            <Tab icon={<DescriptionIcon />} iconPosition="start" label="概要" />
            <Tab icon={<InfoIcon />} iconPosition="start" label="応募条件" />
            <Tab 
              icon={
                <Badge 
                  badgeContent={contest.entries ? contest.entries.length : 0} 
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}
                >
                  <EmojiEventsIcon />
                </Badge>
              } 
              iconPosition="start" 
              label="応募作品" 
            />
            {contest.enableJudges && contest.judges && contest.judges.length > 0 && (
              <Tab icon={<VerifiedUserIcon />} iconPosition="start" label="審査員" />
            )}
          </Tabs>

          {/* タブコンテンツ */}
          <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
            <ContestOverview
              contest={contest}
              fixImagePaths={fixImagePaths}
              handleOpenModal={handleOpenModal}
              isContestActive={isContestActive}
            />
          </Box>

          <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
            <EntryConditions
              contest={contest}
              renderStatusChip={renderStatusChip}
              handleTagClick={() => {}} // プレビューモードではダミー関数
            />
          </Box>

          <Box sx={{ display: tabValue === 2 ? 'block' : 'none' }}>
            <EntriesList
              contest={contest}
              sortedEntries={sortedEntries}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          </Box>

          {contest.enableJudges && contest.judges && contest.judges.length > 0 && (
            <Box sx={{ display: tabValue === 3 ? 'block' : 'none' }}>
              <JudgesInfo contest={contest} />
            </Box>
          )}
        </Grid>
      </Grid>

      {/* 閉じるボタン */}
      <Box textAlign="center" mt={4}>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={() => window.close()}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 'bold',
          }}
        >
          <CloseIcon sx={{ mr: 1 }} />
          閉じる
        </Button>
      </Box>

      {/* スタイル */}
      <style>
        {`
          .contest-description img {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
            margin: 10px auto !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
          }
          
          .contest-description a {
            color: ${theme.palette.primary.main} !important;
            text-decoration: none !important;
            font-weight: bold !important;
          }
          
          .contest-description a:hover {
            text-decoration: underline !important;
          }
          
          .contest-description h1, 
          .contest-description h2, 
          .contest-description h3 {
            margin-top: 24px !important;
            margin-bottom: 16px !important;
            font-weight: bold !important;
            line-height: 1.3 !important;
          }
          
          .contest-description p {
            margin-bottom: 16px !important;
            line-height: 1.6 !important;
          }
          
          .contest-description blockquote {
            border-left: 4px solid ${theme.palette.primary.main} !important;
            padding-left: 16px !important;
            margin-left: 0 !important;
            color: ${theme.palette.text.secondary} !important;
            font-style: italic !important;
          }
        `}
      </style>
    </Container>
  );
};

export default ContestPreview;