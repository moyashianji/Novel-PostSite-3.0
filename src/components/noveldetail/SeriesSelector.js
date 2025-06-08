import React, { memo, useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  FormControl, 
  Select, 
  MenuItem, 
  InputLabel, 
  Paper, 
  Chip, 
  Divider,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const SeriesContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: 16,
  boxShadow: theme.shadows[1],
  border: '1px solid',
  borderColor: theme.palette.divider,
  background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
}));

const SeriesTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.primary,
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

// For a single series
const SingleSeriesSelector = ({ seriesTitle, seriesPosts, selectedPostId, handleSeriesChange }) => {
  // APIからのレスポンスを確認するためのデバッグ
  console.log('SingleSeriesSelector:', { seriesTitle, seriesPosts, selectedPostId });
  
  return (
    <>
      <SeriesTitle variant="h6">
        <BookmarksIcon sx={{ mr: 1, color: 'primary.main' }} />
        {seriesTitle.title}
        <Chip 
          label={`全 ${seriesPosts.length} 話`} 
          size="small" 
          color="primary" 
          variant="outlined"
          sx={{ ml: 2, fontWeight: 500 }}
        />
      </SeriesTitle>
      
      <StyledFormControl fullWidth>
        <InputLabel id="series-select-label">シリーズの投稿を選択</InputLabel>
        <Select
          labelId="series-select-label"
          id="series-select"
          value={selectedPostId}
          onChange={handleSeriesChange}
          label="シリーズの投稿を選択"
        >
          {seriesPosts.map((postItem) => (
            <MenuItem key={postItem._id} value={postItem._id}>
              {`${postItem.episodeNumber || '番外編'}: ${postItem.title}`}
            </MenuItem>
          ))}
        </Select>
      </StyledFormControl>
    </>
  );
};

// For multiple series - すべて表示する新しいコンポーネント
const AllSeriesSelector = ({ seriesData, selectedPostId, handleSeriesChange }) => {
  // デバッグ用のログ
  console.log('AllSeriesSelector:', { seriesData, selectedPostId });
  
  // 初期状態で最初のシリーズを展開する
  const initOpenState = () => {
    const state = {};
    if (seriesData && seriesData.length > 0) {
      seriesData.forEach(series => {
        state[series.seriesId] = series.seriesPosts.some(post => post._id === selectedPostId);
      });
      // どのシリーズにも現在の投稿がない場合は最初のシリーズを開く
      if (!Object.values(state).some(value => value)) {
        state[seriesData[0].seriesId] = true;
      }
    }
    return state;
  };
  
  // 各シリーズの展開状態を管理
  const [openSeries, setOpenSeries] = useState(initOpenState);
  
  // 選択されたPostIdが変更されたときに対応するシリーズを展開する
  useEffect(() => {
    if (selectedPostId) {
      const newOpenState = { ...openSeries };
      let found = false;
      
      seriesData.forEach(series => {
        if (series.seriesPosts.some(post => post._id === selectedPostId)) {
          newOpenState[series.seriesId] = true;
          found = true;
        }
      });
      
      if (found) {
        setOpenSeries(newOpenState);
      }
    }
  }, [selectedPostId, seriesData]);

  // シリーズの展開状態をトグルする
  const handleToggle = (seriesId) => {
    setOpenSeries(prev => ({ 
      ...prev, 
      [seriesId]: !prev[seriesId] 
    }));
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CollectionsBookmarkIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          複数のシリーズ
        </Typography>
        <Tooltip title="この小説は複数のシリーズに含まれています">
          <Chip 
            label={`${seriesData.length}シリーズ`} 
            size="small" 
            color="secondary" 
            variant="outlined"
            sx={{ ml: 2, fontWeight: 500 }}
          />
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 2 }} />
      
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {seriesData.map((series) => (
          <React.Fragment key={series.seriesId}>
            <ListItem 
              button 
              onClick={() => handleToggle(series.seriesId)}
              sx={{ 
                borderRadius: 1, 
                mb: 1,
                '&:hover': { 
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemIcon>
                <BookmarksIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={series.seriesTitle.title} 
                secondary={`全 ${series.seriesPosts.length} 話`}
              />
              {openSeries[series.seriesId] ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            
            <Collapse in={openSeries[series.seriesId]} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pr: 2 }}>
                <StyledFormControl fullWidth>
                  <InputLabel id={`series-select-label-${series.seriesId}`}>
                    {series.seriesTitle.title}の投稿を選択
                  </InputLabel>
                  <Select
                    labelId={`series-select-label-${series.seriesId}`}
                    id={`series-select-${series.seriesId}`}
                    value={selectedPostId}
                    onChange={(e) => handleSeriesChange(e, series.seriesId)}
                    label={`${series.seriesTitle.title}の投稿を選択`}
                  >
                    {series.seriesPosts.map((postItem) => (
                      <MenuItem key={postItem._id} value={postItem._id}>
                        {`${postItem.episodeNumber || '番外編'}: ${postItem.title}`}
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
              </Box>
            </Collapse>
            
            <Divider sx={{ my: 1 }} />
          </React.Fragment>
        ))}
      </List>
    </>
  );
};

const SeriesSelector = memo(({ 
  seriesData, 
  selectedPostId, 
  handleSeriesChange 
}) => {
  // デバッグログ
  console.log('SeriesSelector props:', { seriesData, selectedPostId });
  
  // seriesDataが空の場合は何も表示しない
  if (!seriesData || (Array.isArray(seriesData) && seriesData.length === 0)) {
    return null;
  }
  
  // 後方互換性のために確認
  const isLegacyFormat = seriesData.seriesTitle && seriesData.seriesPosts;
  const hasMultipleSeries = Array.isArray(seriesData) && seriesData.length > 1;
  
  console.log('SeriesSelector analysis:', { isLegacyFormat, hasMultipleSeries });
  
  // 旧形式のデータ構造との互換性処理
  if (isLegacyFormat) {
    return (
      <SeriesContainer elevation={0}>
        <SingleSeriesSelector 
          seriesTitle={seriesData.seriesTitle} 
          seriesPosts={seriesData.seriesPosts} 
          selectedPostId={selectedPostId}
          handleSeriesChange={handleSeriesChange}
        />
      </SeriesContainer>
    );
  }
  
  return (
    <SeriesContainer elevation={0}>
      {hasMultipleSeries ? (
        <AllSeriesSelector 
          seriesData={seriesData}
          selectedPostId={selectedPostId}
          handleSeriesChange={handleSeriesChange}
        />
      ) : (
        <SingleSeriesSelector 
          seriesTitle={seriesData[0].seriesTitle}
          seriesPosts={seriesData[0].seriesPosts}
          selectedPostId={selectedPostId}
          handleSeriesChange={(e) => handleSeriesChange(e, seriesData[0].seriesId)}
        />
      )}
    </SeriesContainer>
  );
});

export default SeriesSelector;