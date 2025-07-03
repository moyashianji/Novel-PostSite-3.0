import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';

const SearchTabs = ({ 
  tab, 
  onTabChange, 
  postsCount, 
  seriesCount, 
  usersCount 
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
      <Tabs value={tab} onChange={onTabChange} centered>
        <Tab 
          icon={<SearchIcon />}
          iconPosition="start"
          label={`作品${tab === "posts" ? ` (${postsCount})` : ""}`} 
          value="posts" 
        />
        <Tab 
          icon={<SearchIcon />}
          iconPosition="start"
          label={`シリーズ${tab === "series" ? ` (${seriesCount})` : ""}`} 
          value="series" 
        />
        <Tab 
          icon={<PersonIcon />}
          iconPosition="start"
          label={`ユーザー${tab === "users" ? ` (${usersCount})` : ""}`} 
          value="users" 
        />
      </Tabs>
    </Box>
  );
};

export default SearchTabs;