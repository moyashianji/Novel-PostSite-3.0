import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  Skeleton,
  alpha,
  useTheme,
  Divider,
  Grid
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import ContestCard from '../contest/ContestCard';

const UpcomingContestsCard = ({ contests, handleViewContest, loading, navigate }) => {
  const theme = useTheme();
  const upcomingContests = contests
    .filter(contest => contest.status === '開催予定')
    .sort((a, b) => new Date(a.applicationStartDate) - new Date(b.applicationStartDate))
    .slice(0, 3);

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[8],
          transform: 'translateY(-2px)'
        },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}
    >
      <Box
        sx={{
          py: 2,
          px: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 装飾用の背景要素（複数のバブル） */}
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: i * 10 - 20,
              right: i * 30 - 20,
              width: 80 - i * 10,
              height: 80 - i * 10,
              borderRadius: '50%',
              background: alpha('#fff', 0.07 + i * 0.03),
              zIndex: 0
            }}
          />
        ))}

        <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <EmojiEventsIcon
            sx={{
              mr: 1.5,
              fontSize: 30,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { opacity: 0.9, transform: 'scale(1)' },
                '50%': { opacity: 1, transform: 'scale(1.05)' },
                '100%': { opacity: 0.9, transform: 'scale(1)' }
              }
            }}
          />
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            開催予定のコンテスト
          </Typography>
        </Box>
      </Box>

      <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
        {loading ? (
          <Stack divider={<Divider />}>
            {[1, 2, 3].map((_, idx) => (
              <Box key={idx} sx={{ p: 3 }}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="text" width="80%" height={28} />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="90%" />
              </Box>
            ))}
          </Stack>
        ) : (
          upcomingContests.length > 0 ? (
            <Stack spacing={0} divider={<Divider />}>
              {upcomingContests.map((contest) => (
                <Box key={contest._id} sx={{ p: 3 }}>
                  <ContestCard
                    contest={contest}
                    onViewDetails={() => handleViewContest(contest._id)}
                    buttonText="詳細を見る"
                    compact={true}
                  />
                </Box>
              ))}
              
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  background: alpha(theme.palette.background.default, 0.5)
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/contests')}
                  sx={{
                    borderRadius: 6,
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.2,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }
                  }}
                >
                  すべてのコンテストを見る
                </Button>
              </Box>
            </Stack>
          ) : (
            <Box sx={{
              p: 4,
              textAlign: 'center',
              background: alpha(theme.palette.background.default, 0.5),
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`
            }}>
              <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
                現在開催予定のコンテストはありません。
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                size="medium"
                sx={{ mt: 2, borderRadius: 6, px: 3 }}
                onClick={() => navigate('/contests')}
              >
                すべてのコンテストを見る
              </Button>
            </Box>
          )
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(UpcomingContestsCard);