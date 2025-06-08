import React from 'react';
import { Box, Skeleton, Grid } from '@mui/material';

const SeriesSkeleton = () => {
  return (
    <Grid container spacing={2}>
      {[1, 2, 3, 4].map(i => (
        <Grid item xs={12} sm={6} key={i}>
          <Box>
            <Skeleton 
              variant="rectangular" 
              height={300} 
              sx={{ 
                borderRadius: 2, 
                mb: 1,
                transform: 'none'
              }} 
            />
            <Skeleton variant="text" width="80%" height={32} sx={{ transform: 'none' }} />
            <Skeleton variant="text" width="60%" height={24} sx={{ transform: 'none' }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
              <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1, transform: 'none' }} />
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1, transform: 'none' }} />
              <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1, transform: 'none' }} />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default React.memo(SeriesSkeleton);