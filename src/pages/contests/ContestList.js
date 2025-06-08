import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Tab, 
  Container,
  Divider,
  CircularProgress,
  Paper,
  Fade,
  useTheme
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { 
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import ContestCard from '../../components/contest/ContestCard';

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [tabValue, setTabValue] = useState('募集中');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null); // ログインユーザーのID
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/contests');
        const data = await response.json();
        setContests(data);

        // ログインユーザー情報の取得 (別APIエンドポイントで取得するものとする)
        try {
          const userResponse = await fetch('/api/auth/check-auth');
          const userData = await userResponse.json();
          if (userData && userData.user) {
            setCurrentUserId(userData.user._id);
          }
        } catch (e) {
          console.log('User not logged in or error fetching user data');
        }
      } catch (error) {
        console.error('Error fetching contests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewContest = (contestId) => {
    navigate(`/contests/${contestId}`);
  };

  const filteredContests = contests.filter(contest => contest.status === tabValue);

  // タブのカラースキーマを取得する関数
  const getTabColorScheme = (status) => {
    switch (status) {
      case '募集中':
        return {
          bgcolor: theme.palette.success.main,
          lightBg: theme.palette.success.light,
          icon: <TrophyIcon />
        };
      case '開催予定':
        return {
          bgcolor: theme.palette.info.main,
          lightBg: theme.palette.info.light,
          icon: <ScheduleIcon />
        };
      case '募集一時停止中':
        return {
          bgcolor: theme.palette.warning.main,
          lightBg: theme.palette.warning.light,
          icon: <InfoIcon />
        };
      case '募集終了':
        return {
          bgcolor: theme.palette.grey[600],
          lightBg: theme.palette.grey[200],
          icon: <TimeIcon />
        };
      default:
        return {
          bgcolor: theme.palette.primary.main,
          lightBg: theme.palette.primary.light,
          icon: <TrophyIcon />
        };
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* ヘッダー */}
      <Box
        sx={{
          mb: 5,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 800,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            pb: 1
          }}
        >
          コンテスト一覧
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
        >
          あなたの創作作品を披露するチャンス！様々なジャンルのコンテストに参加しよう
        </Typography>
        <Divider sx={{ mb: 4 }} />
      </Box>

      {/* タブ */}
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <TabList 
            onChange={handleTabChange} 
            variant="fullWidth" 
            aria-label="contest status tabs"
            sx={{ 
              '& .MuiTabs-indicator': { 
                height: 3,
                borderRadius: '3px 3px 0 0' 
              },
              '& .MuiTab-root': { 
                fontWeight: 'bold',
                fontSize: '1rem',
                minHeight: 64
              }
            }}
          >
            {['募集中', '開催予定', '募集一時停止中', '募集終了'].map((status) => {
              const { icon } = getTabColorScheme(status);
              return (
                <Tab 
                  key={status}
                  label={status} 
                  value={status} 
                  icon={icon} 
                  iconPosition="start"
                />
              );
            })}
          </TabList>
        </Box>

        {['募集中', '開催予定', '募集一時停止中', '募集終了'].map((status) => (
          <TabPanel key={status} value={status} sx={{ px: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={60} />
              </Box>
            ) : filteredContests.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  textAlign: 'center',
                  bgcolor: 'rgba(0,0,0,0.02)',
                  borderRadius: 4,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {status}のコンテストはありません
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  また後でチェックしてください。新しいコンテストは随時追加されます。
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredContests.map((contest) => (
                  <Grid item xs={12} sm={6} md={4} key={contest._id}>
                    <Fade in={true} timeout={500}>
                      <Box>
                        <ContestCard
                          contest={contest}
                          currentUserId={currentUserId}
                          onViewDetails={handleViewContest}
                          buttonText="詳細を見る"
                          compact={false}
                        />
                      </Box>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        ))}
      </TabContext>
    </Container>
  );
};

export default ContestList;