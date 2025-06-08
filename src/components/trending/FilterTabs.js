// src/components/trending/FilterTabs.js の完全修正版

import React from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Divider, 
  useTheme, 
  useMediaQuery, 
  Typography,
  Chip,
  Paper
} from '@mui/material';
import { 
  Public as PublicIcon,
  Lock as LockIcon,
  ViewQuilt as ViewQuiltIcon,
  Bookmark as BookmarkIcon,
  MenuBook as MenuBookIcon,
  ViewList as ViewListIcon,
  Done as DoneIcon,
  Update as UpdateIcon
} from '@mui/icons-material';

// 年齢制限フィルタータブ
const AgeFilterTabs = ({ ageFilter, onAgeFilterChange }) => {
  return (
    <Tabs
      value={ageFilter}
      onChange={onAgeFilterChange}
      variant="fullWidth"
      aria-label="年齢制限フィルター"
    >
      <Tab value="all" label="すべて" />
      <Tab value="general" label="全年齢" icon={<PublicIcon />} iconPosition="start" />
      <Tab value="r18" label="R18" icon={<LockIcon />} iconPosition="start" />
    </Tabs>
  );
};

// 作品タイプフィルタータブ
const ContentTypeTabs = ({ contentType, onContentTypeChange }) => {
  return (
    <Tabs
      value={contentType}
      onChange={onContentTypeChange}
      variant="fullWidth"
      aria-label="作品タイプフィルター"
    >
      <Tab value="all" label="すべて" />
      <Tab value="standalone" label="読み切り" icon={<BookmarkIcon />} iconPosition="start" />
      <Tab value="series" label="連載作品" icon={<ViewListIcon />} iconPosition="start" />
    </Tabs>
  );
};

// シリーズ状態フィルタータブ
const SeriesStatusTabs = ({ status, onStatusChange }) => {
  return (
    <Tabs
      value={status}
      onChange={onStatusChange}
      variant="fullWidth"
      aria-label="シリーズ状態フィルター"
    >
      <Tab value="all" label="すべて" />
      <Tab value="ongoing" label="連載中" icon={<UpdateIcon />} iconPosition="start" />
      <Tab value="completed" label="完結済" icon={<DoneIcon />} iconPosition="start" />
    </Tabs>
  );
};

// ジャンルフィルタータブ
const GenreTabs = ({ genres, selectedGenre, onGenreChange, isMobile }) => {
  const theme = useTheme();
  
  // ジャンルリストが空や未定義の場合のデフォルト値
  const defaultGenres = [
    'すべて', '異世界', '恋愛', 'ラブコメ', '歴史', '時代物', 'ローファンタジー',
    'ハイファンタジー', 'SF', 'ファンタジー', 'ミステリー', 'サスペンス', 'ホラー'
  ];
  
  const genresList = genres && genres.length > 0 ? genres : defaultGenres;
  console.log('Rendering genres:', genresList);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
      <Tabs
        value={selectedGenre}
        onChange={onGenreChange}
        variant="scrollable" // 常にスクロール可能に
        scrollButtons="auto"
        aria-label="ジャンルフィルター"
        sx={{
          '.MuiTabs-scrollButtons.Mui-disabled': {
            opacity: 0.3,
          },
          '.MuiTab-root': {
            minWidth: 'auto',
            px: 2,
          }
        }}
      >
        {genresList.map((genre) => (
          <Tab 
            key={genre} 
            value={genre} 
            label={genre} 
            sx={{
              fontWeight: selectedGenre === genre ? 'bold' : 'normal',
              color: selectedGenre === genre ? theme.palette.primary.main : theme.palette.text.primary,
              borderBottom: selectedGenre === genre ? `2px solid ${theme.palette.primary.main}` : 'none',
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

// メインのフィルターコンポーネント
const FilterTabs = ({
  contentType,
  ageFilter,
  selectedContentType,
  seriesStatus,
  selectedGenre,
  genres,
  onAgeFilterChange,
  onContentTypeChange,
  onSeriesStatusChange,
  onGenreChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // デバッグ出力
  console.log('FilterTabs props:', { contentType, ageFilter, selectedContentType, seriesStatus, selectedGenre });
  console.log('Genres available:', genres);

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 3, 
        borderRadius: 2, 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          フィルター設定
        </Typography>
        
        {/* 年齢制限フィルター */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
            年齢制限
          </Typography>
          <AgeFilterTabs ageFilter={ageFilter} onAgeFilterChange={onAgeFilterChange} />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* 作品タイプまたはシリーズ状態フィルター */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
            {contentType === 0 ? '作品タイプ' : 'シリーズ状態'}
          </Typography>
          {contentType === 0 ? (
            <ContentTypeTabs contentType={selectedContentType} onContentTypeChange={onContentTypeChange} />
          ) : (
            <SeriesStatusTabs status={seriesStatus} onStatusChange={onSeriesStatusChange} />
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* ジャンルフィルター */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
            ジャンル
          </Typography>
          <GenreTabs 
            genres={genres} 
            selectedGenre={selectedGenre} 
            onGenreChange={onGenreChange}
            isMobile={isMobile}
          />
        </Box>
        
        {/* 選択中のフィルターを表示 */}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label={ageFilter === 'all' ? 'すべての年齢' : ageFilter === 'general' ? '全年齢' : 'R18'} 
            color="primary" 
            variant="outlined" 
            size="small"
          />
          
          {contentType === 0 ? (
            <Chip 
              label={selectedContentType === 'all' ? 'すべての作品' : selectedContentType === 'standalone' ? '読み切り' : '連載作品'} 
              color="primary" 
              variant="outlined" 
              size="small"
            />
          ) : (
            <Chip 
              label={seriesStatus === 'all' ? 'すべてのシリーズ' : seriesStatus === 'ongoing' ? '連載中' : '完結済'} 
              color="primary" 
              variant="outlined" 
              size="small"
            />
          )}
          
          <Chip 
            label={`ジャンル: ${selectedGenre}`} 
            color="primary" 
            variant="outlined" 
            size="small"
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default FilterTabs;