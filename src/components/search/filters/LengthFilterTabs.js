import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { getPostsByType, getPostsByLength } from '../utils/filterUtils';

const LengthFilterTabs = ({ 
  lengthFilter, 
  onLengthFilterChange, 
  postsData,
  ageFilter,
  postTypeFilter,
  tab 
}) => {
  // 作品タブ以外では表示しない
  if (tab !== 'posts' || !postsData || !postsData[ageFilter]) return null;
  
  // タイプフィルター適用後のデータ
  const typedData = getPostsByType(postsData[ageFilter], postTypeFilter);
  
  // 各文字数フィルターの件数を計算
  const typedDataCount = typedData.length;
  const shortCount = getPostsByLength(typedData, "short").length;
  const mediumCount = getPostsByLength(typedData, "medium").length;
  const longCount = getPostsByLength(typedData, "long").length;
  
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
      <Tabs 
        value={lengthFilter} 
        onChange={onLengthFilterChange} 
        aria-label="length filter tabs"
        centered
      >
        <Tab 
          label={`すべて (${typedDataCount})`}
          value="all" 
        />
        <Tab 
          label={`ショート (${shortCount})`}
          value="short" 
        />
        <Tab 
          label={`ミディアム (${mediumCount})`}
          value="medium" 
        />
        <Tab 
          label={`ロング (${longCount})`}
          value="long" 
        />
      </Tabs>
    </Box>
  );
};

export default LengthFilterTabs;