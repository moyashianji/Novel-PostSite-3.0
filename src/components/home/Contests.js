import React, { useRef, useEffect } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Chip, 
  Button,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  Whatshot as WhatshotIcon,
  EmojiEvents as EmojiEventsIcon,
  ArrowForward as ArrowForwardIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import ContestsSkeleton from './Skeletons/ContestsSkeleton';
import ContestCard from '../contest/ContestCard';

const EmptyContests = ({ navigate }) => (
  <Box 
    sx={{ 
      textAlign: 'center', 
      py: 6, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'rgba(0,0,0,0.02)',
      borderRadius: 2
    }}
  >
    <EmojiEventsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" color="textSecondary" gutterBottom>
      現在開催中のコンテストはありません
    </Typography>
    <Typography variant="body2" color="textSecondary" sx={{ mb: 3, maxWidth: 600 }}>
      コンテストは定期的に開催されます。新しいコンテストが始まるとここに表示されます。
    </Typography>
    <Button
      variant="outlined"
      color="primary"
      onClick={() => navigate('/contests')}
      sx={{ borderRadius: 6 }}
    >
      過去のコンテストを見る
    </Button>
  </Box>
);

const Contests = ({ contests, handleViewContest, navigate, loading }) => {
  const activeContests = contests.filter((contest) => contest.status === '募集中');
  const scrollContainerRef = useRef(null);
  const theme = useTheme();
  
  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  // Handle wheel events for horizontal scrolling
  useEffect(() => {
    const handleWheel = (e) => {
      if (scrollContainerRef.current && e.deltaY !== 0) {
        e.preventDefault();
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    };
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        mb: 4
      }}
    >
      <Box 
        sx={{ 
          p: 3, 
          bgcolor: 'secondary.dark',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WhatshotIcon sx={{ mr: 1.5 }} />
          <Typography variant="h5" fontWeight="bold">
            開催中のコンテスト
          </Typography>
        </Box>
        {!loading && (
          <Chip 
            label={`${activeContests.length}件`}
            sx={{ 
              bgcolor: 'white', 
              color: 'secondary.dark', 
              fontWeight: 'bold' 
            }} 
          />
        )}
      </Box>
      
      <Box sx={{ p: 3 }}>
        {loading ? (
          <ContestsSkeleton />
        ) : (
          activeContests.length > 0 ? (
            <>
              <Box sx={{ position: 'relative' }}>
                {/* Scroll navigation buttons */}
                <IconButton 
                  onClick={scrollLeft}
                  sx={{ 
                    position: 'absolute', 
                    left: -16, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    zIndex: 1,
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                
                <IconButton 
                  onClick={scrollRight}
                  sx={{ 
                    position: 'absolute', 
                    right: -16, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    zIndex: 1,
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
                
                {/* Horizontal scrolling container */}
                <Box 
                  ref={scrollContainerRef}
                  sx={{
                    display: 'flex',
                    gap: 3,
                    overflowX: 'auto',
                    pb: 2,
                    pl: 1,
                    pr: 1,
                    pt: 1,
                    scrollbarWidth: 'thin',
                    scrollBehavior: 'smooth',
                    '&::-webkit-scrollbar': {
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: theme.palette.secondary.light,
                      borderRadius: 4,
                    },
                    msOverflowStyle: 'none', // IE and Edge
                  }}
                >
                  {activeContests.map((contest) => (
                    <Box
                      key={contest._id}
                      sx={{
                        flex: '0 0 auto',
                        width: { xs: '85%', sm: '350px', md: '320px' },
                        maxWidth: '100%',
                      }}
                    >
                      <ContestCard 
                        contest={contest}
                        onViewDetails={() => handleViewContest(contest._id)}
                        buttonText="詳細を見る"
                        compact={false}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/contests')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    borderRadius: 6,
                    px: 4,
                    py: 1,
                    fontWeight: 'bold'
                  }}
                >
                  すべてのコンテストを見る
                </Button>
              </Box>
            </>
          ) : (
            <EmptyContests navigate={navigate} />
          )
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(Contests);