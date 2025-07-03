import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { SORT_OPTIONS } from '../utils/constants';

const SortTabs = ({ 
  sortOption, 
  onSortChange, 
  tab 
}) => {
  // ユーザータブでは表示しない
  if (tab === "users") return null;
  
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
      <Tabs 
        value={sortOption} 
        onChange={onSortChange} 
        aria-label="sort options"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {SORT_OPTIONS.map(option => (
          <Tab 
            key={option.value}
            icon={option.icon} 
            iconPosition="start" 
            label={option.label}
            value={option.value} 
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default SortTabs;