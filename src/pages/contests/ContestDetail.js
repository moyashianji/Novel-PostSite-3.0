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

const ContestDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState(null);
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedWorkForCancellation, setSelectedWorkForCancellation] = useState(null);
  const [judgeDetails, setJudgeDetails] = useState({});
  const [creatorInfo, setCreatorInfo] = useState(null);
  const [sortOrder, setSortOrder] = useState('latest');
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`/api/contests/${id}`);
        if (response.ok) {
          const data = await response.json();
          setContest(data);
          fetchJudgesInfo(data.judges);
          fetchCreatorInfo(data.creator);
        } else {
          console.error('Failed to fetch contest details');
        }
      } catch (error) {
        console.error('Error fetching contest details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [id]);

  const fetchWorks = async () => {
    try {
      const response = await fetch(`/api/users/me/works`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setWorks(data);
        setFilteredWorks(data);
      } else {
        console.error('Failed to fetch works');
      }
    } catch (error) {
      console.error('Error fetching works:', error);
    }
  };

  const handleOpenModal = async () => {
    await fetchWorks();
    setModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSearchQuery('');
    setFilteredWorks(works);
  }, [works]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredWorks(works);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      setFilteredWorks(
        works.filter((work) => work.title.toLowerCase().includes(lowerCaseQuery))
      );
    }
  }, [works]);

  const isWorkAlreadyApplied = useCallback((workId) =>
    contest?.entries?.some((entry) => entry.postId._id === workId), [contest]);

  const handleSubmitEntry = useCallback(async (workId) => {
    try {
      const response = await fetch(`/api/contests/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selectedPostId: workId }),
      });

      if (response.ok) {
        const contestResponse = await fetch(`/api/contests/${id}`);
        if (contestResponse.ok) {
          const updatedContest = await contestResponse.json();
          setContest(updatedContest);
          // 成功通知
          alert('応募が完了しました！');
        }
        setModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || '応募に失敗しました。');
      }
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('応募に失敗しました。');
    }
  }, [id]);

  const handleCancelEntry = useCallback((workId) => {
    setSelectedWorkForCancellation(workId);
    setConfirmationOpen(true);
  }, []);

  const confirmCancelEntry = useCallback(async () => {
    try {
      const response = await fetch(`/api/contests/${id}/entry/${selectedWorkForCancellation}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('応募を取り消しました。');
        const contestResponse = await fetch(`/api/contests/${id}`);
        if (contestResponse.ok) {
          const updatedContest = await contestResponse.json();
          setContest(updatedContest);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || '応募取り消しに失敗しました。');
      }
    } catch (error) {
      console.error('Error cancelling entry:', error);
      alert('応募取り消しに失敗しました。');
    } finally {
      setConfirmationOpen(false);
    }
  }, [id, selectedWorkForCancellation]);

  const fetchJudgesInfo = async (judgeIds) => {
    if (!judgeIds || judgeIds.length === 0) return;

    const judgeData = {};
    await Promise.all(
      judgeIds.map(async (judgeId) => {
        try {
          const res = await fetch(`/api/users/${judgeId.name}`);
          if (res.ok) {
            const userData = await res.json();
            judgeData[judgeId] = {
              name: userData.nickname,
              avatar: userData.icon,
            };
          }
        } catch (error) {
          console.error(`Error fetching judge info for ID ${judgeId}:`, error);
        }
      })
    );

    setJudgeDetails(judgeData);
  };

  const fetchCreatorInfo = async (creatorId) => {
    if (!creatorId) return;
    try {
      const res = await fetch(`/api/users/${creatorId}`);
      if (!res.ok) throw new Error('主催者情報の取得に失敗しました');
      const data = await res.json();
      setCreatorInfo(data);
    } catch (error) {
      console.error('Error fetching creator info:', error);
    }
  };

  const sortedEntries = useMemo(() => {
    if (!contest || !contest.entries) return [];
    const sorted = [...contest.entries];

    switch (sortOrder) {
      case 'latest':
        return sorted.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate));
      case 'mostViewed':
        return sorted.sort((a, b) => b.postId.viewCount - a.postId.viewCount);
      case 'mostLiked':
        return sorted.sort((a, b) => b.postId.likes - a.postId.likes);
      default:
        return sorted;
    }
  }, [contest, sortOrder]);

  const handleTagClick = useCallback((tag) => {
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}`);
  }, [navigate]);

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

  const formatDate = useCallback((date) => {
    if (!date) return '未設定';

    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) {
      return date;
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }, []);

  const fixImagePaths = useCallback((html) => {
    return html.replace(/<img src="\/uploads\/(.*?)"/g, `<img src="http://localhost:5000/uploads/$1"`);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const isContestActive = useMemo(() => {
    if (!contest) return false;
    return contest.status === '募集中';
  }, [contest]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <LoadingSkeleton />
      </Container>
    );
  }
  
  if (!contest) return (
    <Container maxWidth="lg" sx={{ py: 5, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 2 }}>
        <Typography variant="h4" color="error" gutterBottom>
          コンテストが見つかりませんでした
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          お探しのコンテストは削除されたか、URLが間違っている可能性があります。
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/contests')}
          startIcon={<ArrowForwardIcon />}
        >
          コンテスト一覧に戻る
        </Button>
      </Paper>
    </Container>
  );

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
            creatorInfo={creatorInfo}
            contest={contest}
            getStatusChip={getStatusChip}
            handleOpenModal={handleOpenModal}
            isContestActive={isContestActive}
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
                  badgeContent={contest.entries.length} 
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { fontWeight: 'bold' } }}
                >
                  <EmojiEventsIcon />
                </Badge>
              } 
              iconPosition="start" 
              label="応募作品" 
            />
            {contest.enableJudges && contest.judges.length > 0 && (
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
            <ScheduleInfo contest={contest} formatDate={formatDate} />
          </Box>

          <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
            <EntryConditions
              contest={contest}
              renderStatusChip={renderStatusChip}
              handleTagClick={handleTagClick}
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

          {contest.enableJudges && contest.judges.length > 0 && (
            <Box sx={{ display: tabValue === 3 ? 'block' : 'none' }}>
              <JudgesInfo contest={contest} />
            </Box>
          )}
        </Grid>
      </Grid>

      {/* モーダル類 */}
      <ApplyModal
        modalOpen={modalOpen}
        handleCloseModal={handleCloseModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        filteredWorks={filteredWorks}
        isWorkAlreadyApplied={isWorkAlreadyApplied}
        handleSubmitEntry={handleSubmitEntry}
        handleCancelEntry={handleCancelEntry}
      />

      <ConfirmationDialog
        confirmationOpen={confirmationOpen}
        setConfirmationOpen={setConfirmationOpen}
        confirmCancelEntry={confirmCancelEntry}
      />

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

// ローディングスケルトン
const LoadingSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} md={9}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
      </Grid>
    </Grid>
  </Box>
);

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
const Sidebar = React.memo(({ creatorInfo, contest, getStatusChip, handleOpenModal, isContestActive }) => (
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
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 1 }}>主催者情報を取得中...</Typography>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            color="primary" 
            sx={{ mb: 1 }}
          >
            {contest.entries.length}
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
            応募する
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
                    {new Date(contest.applicationStartDate).toLocaleDateString()} 〜 {new Date(contest.applicationEndDate).toLocaleDateString()}
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
                    {new Date(contest.resultAnnouncementDate).toLocaleDateString()}
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
  <Paper
    elevation={3}
    sx={{
      borderRadius: 3,
      overflow: 'hidden',
      mb: 4
    }}
  >
    <Box sx={{ bgcolor: 'primary.main', p: 2, color: 'white' }}>
      <Typography variant="h6" fontWeight="bold">
        <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        コンテスト概要
      </Typography>
    </Box>
    
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {contest.shortDescription}
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Box 
        className="contest-description"
        sx={{ 
          typography: 'body1',
          lineHeight: 1.7,
          '& > *:first-of-type': { mt: 0 }
        }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fixImagePaths(contest.description)) }}
      />
      
      {isContestActive && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={handleOpenModal}
            startIcon={<AddIcon />}
            sx={{ 
              py: 1.5, 
              px: 4, 
              borderRadius: 2,
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            }}
          >
            応募する
          </Button>
        </Box>
      )}
    </Box>
  </Paper>
));

// 開催スケジュール情報
const ScheduleInfo = React.memo(({ contest, formatDate }) => (
  <Paper
    elevation={3}
    sx={{
      borderRadius: 3,
      overflow: 'hidden',
      mb: 4
    }}
  >
    <Box sx={{ bgcolor: 'secondary.main', p: 2, color: 'white' }}>
      <Typography variant="h6" fontWeight="bold">
        <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        開催スケジュール
      </Typography>
    </Box>
    
    <Box sx={{ p: 0 }}>
      <List disablePadding>
        <ListItem sx={{ py: 2, px: 3 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" fontWeight="medium">
                応募期間
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography 
                variant="body1" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'primary.main',
                  fontWeight: 'medium', 
                }}
              >
                <AccessTimeIcon sx={{ mr: 1, fontSize: '1rem' }} />
                {formatDate(contest.applicationStartDate)} 〜 {formatDate(contest.applicationEndDate)}
              </Typography>
            </Grid>
          </Grid>
        </ListItem>
        
        <Divider />
        
        <ListItem sx={{ py: 2, px: 3 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" fontWeight="medium">
                審査期間
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography 
                variant="body1" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'secondary.main',
                  fontWeight: 'medium',
                }}
              >
                <MilitaryTechIcon sx={{ mr: 1, fontSize: '1rem' }} />
                {formatDate(contest.reviewStartDate)} 〜 {formatDate(contest.reviewEndDate)}
              </Typography>
            </Grid>
          </Grid>
        </ListItem>
        
        <Divider />
        
        <ListItem sx={{ py: 2, px: 3, bgcolor: alpha('#f5f5f5', 0.5) }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" fontWeight="medium">
                結果発表日
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography 
                variant="body1" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'error.main',
                  fontWeight: 'bold',
                }}
              >
                <EmojiEventsIcon sx={{ mr: 1, fontSize: '1rem' }} />
                {formatDate(contest.resultAnnouncementDate)}
              </Typography>
            </Grid>
          </Grid>
        </ListItem>
      </List>
    </Box>
  </Paper>
));

// 応募条件
const EntryConditions = React.memo(({ contest, renderStatusChip, handleTagClick }) => (
  <Paper
    elevation={3}
    sx={{
      borderRadius: 3,
      overflow: 'hidden',
      mb: 4
    }}
  >
    <Box sx={{ bgcolor: 'info.main', p: 2, color: 'white' }}>
      <Typography variant="h6" fontWeight="bold">
        <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        応募条件
      </Typography>
    </Box>
    
    <Alert severity="info" sx={{ m: 3, borderRadius: 2 }}>
      詳しい条件はコンテスト概要を必ずご確認ください。応募条件に合わない作品は審査対象外となる場合があります。
    </Alert>
    
    <Box sx={{ p: 0 }}>
      <List disablePadding>
        <ListItem sx={{ py: 2, px: 3, bgcolor: alpha('#f5f5f5', 0.3) }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                応募可能な作品のステータス
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Chip
                icon={contest.allowFinishedWorks ? <CheckCircleIcon /> : <InfoIcon />}
                label={contest.allowFinishedWorks ? '完結済作品のみ応募可能' : '未完結作品も応募可能'}
                color={contest.allowFinishedWorks ? 'success' : 'warning'}
                sx={{ fontWeight: 'bold' }}
              />
            </Grid>
          </Grid>
        </ListItem>
        
        <Divider />
        
        <ListItem sx={{ py: 2, px: 3 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                コンテスト開催前の作品
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderStatusChip(contest.allowPreStartDate)}
            </Grid>
          </Grid>
        </ListItem>
        
        <Divider />
        
        <ListItem sx={{ py: 2, px: 3, bgcolor: alpha('#f5f5f5', 0.3) }}>
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
        
        <ListItem sx={{ py: 2, px: 3, bgcolor: alpha('#f5f5f5', 0.3) }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                ジャンル制限
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {contest.restrictGenres && contest.genres.length > 0 ? (
                  contest.genres.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      onClick={() => handleTagClick(tag)}
                      sx={{ fontWeight: 'medium' }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">制限なし</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </ListItem>
        
        <Divider />
        
        <ListItem sx={{ py: 2, px: 3 }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                AI使用制限
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {contest.restrictAI && contest.aiTags.length > 0 ? (
                  contest.aiTags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      onClick={() => handleTagClick(tag)}
                      color="secondary"
                      sx={{ fontWeight: 'medium' }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">制限なし</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </ListItem>
        
        <Divider />
        
        <ListItem sx={{ py: 2, px: 3, bgcolor: alpha('#f5f5f5', 0.3) }}>
          <Grid container alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" fontWeight="medium">
                文字数制限
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {contest.minWordCount}
                </Typography>
                <Typography variant="body1" sx={{ mx: 1 }}>
                  ～
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {contest.maxWordCount > 0 ? contest.maxWordCount : '制限なし'}
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
    </Box>
  </Paper>
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
          {contest.judges.map((judge) => (
            <Grid item xs={12} sm={6} md={4} key={judge.userId._id}>
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
                  <RouterLink to={`/user/${judge.userId._id}`} style={{ textDecoration: 'none' }}>
                    <Avatar
                      src={judge.userId.icon}
                      alt={judge.userId.nickname}
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
                    {judge.userId.nickname || '不明なユーザー'}
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
          label={`${contest.entries.length}作品`} 
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
        
        {contest.entries.length > 0 ? (
          <Grid container spacing={3}>
            {sortedEntries.map((entry) => (
              <Grid item xs={12} sm={6} key={entry.postId._id}>
                <Fade in={true} timeout={500}>
                  <Box>
                    <PostCard post={entry.postId} />
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

// 応募モーダル
const ApplyModal = React.memo(({
  modalOpen,
  handleCloseModal,
  searchQuery,
  setSearchQuery,
  handleSearch,
  filteredWorks,
  isWorkAlreadyApplied,
  handleSubmitEntry,
  handleCancelEntry,
}) => (
  <Modal 
    open={modalOpen} 
    onClose={handleCloseModal}
    closeAfterTransition
    BackdropComponent={Backdrop}
    BackdropProps={{
      timeout: 500,
    }}
  >
    <Fade in={modalOpen}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 500 },
        maxWidth: '100%',
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 3,
        overflow: 'hidden',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{ bgcolor: 'primary.main', p: 2, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">応募する作品を選択</Typography>
          <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            placeholder="作品名を検索"
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Box>
        
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          {filteredWorks.length > 0 ? (
            <List disablePadding>
              {filteredWorks.map((work) => {
                const isApplied = isWorkAlreadyApplied(work._id);
                return (
                  <Paper
                    key={work._id}
                    elevation={1}
                    sx={{ 
                      mb: 2, 
                      borderRadius: 2,
                      border: isApplied ? '2px solid' : '1px solid',
                      borderColor: isApplied ? 'primary.main' : 'divider',
                      overflow: 'hidden',
                    }}
                  >
                    <ListItem
                      sx={{ 
                        px: 2, 
                        py: 1.5,
                        bgcolor: isApplied ? alpha('#1976d2', 0.05) : 'transparent',
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {work.title}
                          </Typography>
                          {isApplied && (
                            <Chip 
                              size="small" 
                              label="応募済み" 
                              color="primary" 
                              icon={<CheckCircleIcon />}
                              sx={{ fontWeight: 'bold' }}
                            />
                          )}
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 1.5,
                          }}
                        >
                          {work.description || '説明なし'}
                        </Typography>
                        
                        {isApplied ? (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancelEntry(work._id)}
                            startIcon={<CancelIcon />}
                            fullWidth
                            sx={{ borderRadius: 2 }}
                          >
                            応募取り消し
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleSubmitEntry(work._id)}
                            startIcon={<AddIcon />}
                            fullWidth
                            sx={{ borderRadius: 2 }}
                          >
                            この作品で応募する
                          </Button>
                        )}
                      </Box>
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                投稿作品が見つかりません
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                新しい作品を投稿してからコンテストに応募してください
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Fade>
  </Modal>
));

// 確認ダイアログ
const ConfirmationDialog = React.memo(({
  confirmationOpen,
  setConfirmationOpen,
  confirmCancelEntry,
}) => (
  <Dialog
    open={confirmationOpen}
    onClose={() => setConfirmationOpen(false)}
    PaperProps={{
      sx: {
        borderRadius: 3,
        overflow: 'hidden',
      }
    }}
  >
    <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <InfoIcon sx={{ mr: 1 }} />
        応募取り消しの確認
      </Box>
    </DialogTitle>
    <DialogContent sx={{ mt: 2 }}>
      <DialogContentText>
        本当にこの作品の応募を取り消してもよろしいですか？
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button 
        onClick={() => setConfirmationOpen(false)} 
        color="inherit"
        variant="outlined"
        sx={{ borderRadius: 2 }}
      >
        キャンセル
      </Button>
      <Button 
        onClick={confirmCancelEntry} 
        color="error" 
        variant="contained"
        autoFocus
        startIcon={<CancelIcon />}
        sx={{ borderRadius: 2 }}
      >
        応募を取り消す
      </Button>
    </DialogActions>
  </Dialog>
));

export default ContestDetail;