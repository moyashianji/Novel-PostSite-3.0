import React from 'react';
import { Box, Skeleton, Divider } from '@mui/material';

const AnnouncementsSkeleton = () => (
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

export default AnnouncementsSkeleton;