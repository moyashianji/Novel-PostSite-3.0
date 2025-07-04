import React, { useMemo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { 
  Search as SearchIcon, 
  SmartToy as SmartToyIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';

const SearchResultsHeader = ({ 
  searchParams, 
  tab, 
  onClearAIToolFilter,
  onClearContestTagFilter 
}) => {
  // 検索タイトルの生成
  const searchTitle = useMemo(() => {
    const parts = [];
    let hasFilters = false;
    
    if (searchParams.mustInclude) {
      parts.push(<span key="must">{`"${searchParams.mustInclude}"`}</span>);
      hasFilters = true;
    }
    
    if (searchParams.aiTool && tab !== "users") {
      parts.push(
        <Chip 
          key="aiTool"
          icon={<SmartToyIcon />}
          label={searchParams.aiTool} 
          color="secondary"
          onDelete={onClearAIToolFilter}
          size="medium"
          sx={{ ml: 1, fontWeight: 500 }}
        />
      );
      hasFilters = true;
    }
    
    if (searchParams.contestTag && tab !== "users") {
      parts.push(
        <Chip 
          key="contestTag"
          icon={<EmojiEventsIcon />}
          label={`コンテスト: ${searchParams.contestTag}`} 
          color="primary"
          variant="outlined"
          onDelete={onClearContestTagFilter}
          size="medium"
          sx={{ ml: 1, fontWeight: 500 }}
        />
      );
      hasFilters = true;
    }
    
    if (!hasFilters) {
      return "すべての結果";
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchIcon sx={{ mr: 1 }} />
        <Typography variant="h5" component="span" sx={{ mr: 1 }}>
          検索結果
        </Typography>
        {parts}
      </Box>
    );
  }, [searchParams.mustInclude, searchParams.aiTool, searchParams.contestTag, tab, onClearAIToolFilter, onClearContestTagFilter]);

  return (
    <Box sx={{ mb: 3 }}>
      {searchTitle}
    </Box>
  );
};

export default SearchResultsHeader;