// src/components/trending/FilterSkeleton.js

import React from 'react';
import { Box, Skeleton, Paper, Divider } from '@mui/material';

const FilterSkeleton = () => {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 3, 
        borderRadius: 2, 
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* タイトル */}
        <Skeleton variant="text" width={120} height={32} sx={{ mb: 1 }} />
        
        {/* 年齢制限フィルター */}
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width="33%" height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="33%" height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="33%" height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* 作品タイプフィルター */}
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width="33%" height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="33%" height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="33%" height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* ジャンルフィルター */}
        <Box>
          <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'hidden' }}>
            {[...Array(8)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" width={80} height={36} sx={{ borderRadius: 1, flex: '0 0 auto' }} />
            ))}
          </Box>
        </Box>
        
        {/* 選択中のフィルター */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 12 }} />
          <Skeleton variant="rectangular" width={120} height={24} sx={{ borderRadius: 12 }} />
          <Skeleton variant="rectangular" width={140} height={24} sx={{ borderRadius: 12 }} />
        </Box>
      </Box>
    </Paper>
  );
};

export default FilterSkeleton;