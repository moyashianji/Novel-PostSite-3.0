import React from 'react';
import { Grid, Skeleton } from '@mui/material';

const NewPostsSkeleton = () => (
  <Grid container spacing={2}>
    {[1, 2, 3, 4].map(i => (
      <Grid item xs={12} sm={6} key={i}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 1 }} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </Grid>
    ))}
  </Grid>
);

export default NewPostsSkeleton;