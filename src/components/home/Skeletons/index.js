import React from 'react';
import { Box, Grid, Skeleton, Divider } from '@mui/material';

// 新着投稿のローディングスケルトン
export const NewPostsSkeleton = () => (
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

// お知らせのローディングスケルトン
export const AnnouncementsSkeleton = () => (
  <Box sx={{ p: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Box key={i} sx={{ mb: 2 }}>
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
        {i < 5 && <Divider sx={{ mt: 1.5, mb: 1.5 }} />}
      </Box>
    ))}
  </Box>
);

// コンテストのローディングスケルトン
export const ContestsSkeleton = () => (
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

export default {
  NewPostsSkeleton,
  AnnouncementsSkeleton,
  ContestsSkeleton
};