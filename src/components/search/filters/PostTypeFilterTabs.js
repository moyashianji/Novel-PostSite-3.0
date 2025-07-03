import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { getPostsByType } from '../utils/filterUtils';

const PostTypeFilterTabs = ({ 
  postTypeFilter, 
  onPostTypeFilterChange, 
  postsData,
  ageFilter,
  tab 
}) => {
  // 作品タブ以外では表示しない
  if (tab !== 'posts' || !postsData || !postsData[ageFilter]) return null;
  
  // フィルタリング結果の件数を計算
  const allPostsCount = postsData[ageFilter].length;
  const standaloneCount = getPostsByType(postsData[ageFilter], "standalone").length;
  const seriesCount = getPostsByType(postsData[ageFilter], "series").length;
  
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
      <Tabs 
        value={postTypeFilter} 
        onChange={onPostTypeFilterChange} 
        aria-label="post type filter tabs"
        centered
      >
        <Tab 
          label={`すべて (${allPostsCount})`}
          value="all" 
        />
        <Tab 
          label={`読み切り (${standaloneCount})`}
          value="standalone" 
        />
        <Tab 
          label={`連載作品 (${seriesCount})`}
          value="series" 
        />
      </Tabs>
    </Box>
  );
};

export default PostTypeFilterTabs;