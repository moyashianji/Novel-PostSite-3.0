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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowForward as ArrowForwardIcon,
  AutoStories as AutoStoriesIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import SeriesCard from '../series/SeriesCard';
import SeriesSkeleton from './Skeletons/SeriesSkeleton';

const SeriesScrollSection = ({ 
  title, 
  series = [], 
  loading = false, 
  navigate,
  icon: Icon = AutoStoriesIcon,
  color = 'primary',
  viewAllPath = '/search?type=series',
  emptyMessage = "シリーズがありません。"
}) => {
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
  
  const EmptyState = () => (
    <Box 
      sx={{ 
        textAlign: 'center', 
        py: 6, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.02)',
        borderRadius: 2,
        width: '100%'
      }}
    >
      <Icon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {emptyMessage}
      </Typography>
    </Box>
  );

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
          bgcolor: `${color}.main`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon sx={{ mr: 1.5 }} />
          <Typography variant="h5" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        {!loading && (
          <Chip 
            label={`${series.length}件`}
            sx={{ 
              bgcolor: 'white', 
              color: `${color}.main`, 
              fontWeight: 'bold' 
            }} 
          />
        )}
      </Box>
      
      <Box sx={{ p: 3 }}>
        {loading ? (
          <SeriesSkeleton />
        ) : (
          series.length > 0 ? (
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
                      backgroundColor: theme.palette[color].light,
                      borderRadius: 4,
                    },
                    msOverflowStyle: 'none', // IE and Edge
                  }}
                >
                  {series.map((seriesItem) => (
                    <Box
                      key={seriesItem._id}
                      sx={{
                        flex: '0 0 auto',
                        width: { xs: '85%', sm: '300px', md: '280px' },
                        maxWidth: '100%',
                      }}
                    >
                      <SeriesCard series={seriesItem} />
                    </Box>
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color={color}
                  onClick={() => navigate(viewAllPath)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    borderRadius: 6,
                    px: 4,
                    py: 1,
                    fontWeight: 'bold'
                  }}
                >
                  すべて見る
                </Button>
              </Box>
            </>
          ) : (
            <EmptyState />
          )
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(SeriesScrollSection);