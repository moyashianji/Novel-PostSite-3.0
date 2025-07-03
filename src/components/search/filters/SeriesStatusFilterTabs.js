import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { getSeriesByStatus } from '../utils/filterUtils';

const SeriesStatusFilterTabs = ({ 
  seriesStatusFilter, 
  onSeriesStatusFilterChange, 
  seriesData,
  ageFilter,
  tab 
}) => {
  // シリーズタブ以外では表示しない
  if (tab !== 'series' || !seriesData || !seriesData[ageFilter]) return null;
  
  // 各シリーズ状態フィルターの件数を計算
  const allSeriesCount = seriesData[ageFilter].length;
  const ongoingCount = getSeriesByStatus(seriesData[ageFilter], "ongoing").length;
  const completedCount = getSeriesByStatus(seriesData[ageFilter], "completed").length;
  
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
      <Tabs 
        value={seriesStatusFilter} 
        onChange={onSeriesStatusFilterChange} 
        aria-label="series status filter tabs"
        centered
      >
        <Tab 
          label={`すべて (${allSeriesCount})`}
          value="all" 
        />
        <Tab 
          label={`連載中 (${ongoingCount})`}
          value="ongoing" 
        />
        <Tab 
          label={`完結済 (${completedCount})`}
          value="completed" 
        />
      </Tabs>
    </Box>
  );
};

export default SeriesStatusFilterTabs;