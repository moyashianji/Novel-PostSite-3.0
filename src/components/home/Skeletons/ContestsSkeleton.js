import React from 'react';
import { Grid, Box, Skeleton } from '@mui/material';

const ContestsSkeleton = () => (
  <Grid container spacing={3}>
    {[1, 2, 3].map(i => (
      <Grid item xs={12} sm={6} md={4} key={i}>
        <Box>
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 1 }} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 6, mt: 2 }} />
        </Box>
      </Grid>
    ))}
  </Grid>
);

export default ContestsSkeleton;