import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import {
  AllInclusive as AllInclusiveIcon,
  FamilyRestroom as FamilyRestroomIcon,
  DoNotDisturbOn as RestrictedIcon
} from '@mui/icons-material';

const AgeFilterTabs = ({ 
  ageFilter, 
  onAgeFilterChange, 
  totalCounts,
  tab 
}) => {
  // ユーザータブでは表示しない
  if (tab === 'users') return null;
  
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
      <Tabs 
        value={ageFilter} 
        onChange={onAgeFilterChange} 
        aria-label="age filter tabs"
        textColor="secondary"
        indicatorColor="secondary"
        centered
      >
        <Tab 
          icon={<AllInclusiveIcon fontSize="small" />} 
          iconPosition="start" 
          label={`すべて (${totalCounts.all})`}
          value="all" 
        />
        <Tab 
          icon={<FamilyRestroomIcon fontSize="small" />} 
          iconPosition="start" 
          label={`全年齢 (${totalCounts.general})`}
          value="general" 
        />
        <Tab 
          icon={<RestrictedIcon fontSize="small" />} 
          iconPosition="start" 
          label={`R18 (${totalCounts.r18})`}
          value="r18" 
        />
      </Tabs>
    </Box>
  );
};

export default AgeFilterTabs;