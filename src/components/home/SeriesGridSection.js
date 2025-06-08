import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Chip, 
  Button,
  Grid,
  useTheme
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  AutoStories as AutoStoriesIcon
} from '@mui/icons-material';
import SeriesCard from '../series/SeriesCard';
import SeriesSkeleton from './Skeletons/SeriesSkeleton';

const SeriesGridSection = ({ 
  title, 
  series = [], 
  loading = false, 
  navigate,
  icon: Icon = AutoStoriesIcon,
  color = 'primary',
  viewAllPath = '/search?type=series',
  emptyMessage = "シリーズがありません。"
}) => {
  const theme = useTheme();
  
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
        {!loading}
      </Box>
      
      <Box sx={{ p: 3 }}>
        {loading ? (
          <SeriesSkeleton />
        ) : (
          series.length > 0 ? (
            <>
              <Grid container spacing={2}>
                {series.map((seriesItem) => (
                  <Grid item xs={12} sm={6} key={seriesItem._id}>
                    <SeriesCard series={seriesItem} />
                  </Grid>
                ))}
              </Grid>
              
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

export default React.memo(SeriesGridSection);