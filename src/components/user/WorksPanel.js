// src/components/user/WorksPanel.js
import React from 'react';
import {
  Typography, Box, Grid, Chip, Alert, IconButton, Tooltip,
  Menu, MenuItem, InputBase, useTheme, useMediaQuery
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import SortIcon from '@mui/icons-material/Sort';

import PostCard from '../post/PostCard';

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 50,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(2)
}));

const WorksPanel = ({
  filteredWorks,
  allTags,
  selectedTags,
  searchQuery,
  viewMode,
  sortAnchorEl,
  onSearchChange,
  onTagToggle,
  onViewModeToggle,
  onSortClick,
  onSortClose,
  onSortOptionSelect
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      {/* Filter and Search */}
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', mb: 3, gap: 2 }}>
        <SearchContainer sx={{ flex: 1, maxWidth: isMobile ? '100%' : 400 }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder="作品を検索..."
            value={searchQuery}
            onChange={onSearchChange}
            fullWidth
          />
        </SearchContainer>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="表示方法を切り替え">
            <IconButton 
              onClick={onViewModeToggle}
              color="primary"
            >
              {viewMode === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="並び替え">
            <IconButton 
              onClick={onSortClick}
              color="primary"
            >
              <SortIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={onSortClose}
          >
            <MenuItem onClick={() => onSortOptionSelect('newest')}>
              新着順
            </MenuItem>
            <MenuItem onClick={() => onSortOptionSelect('oldest')}>
              古い順
            </MenuItem>
            <MenuItem onClick={() => onSortOptionSelect('mostLiked')}>
              いいね数順
            </MenuItem>
            <MenuItem onClick={() => onSortOptionSelect('mostViewed')}>
              閲覧数順
            </MenuItem>
            <MenuItem onClick={() => onSortOptionSelect('wordCount')}>
              文字数順
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Tags */}
      {allTags.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocalOfferIcon fontSize="small" sx={{ mr: 1 }} />
            タグで絞り込み:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {allTags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                clickable
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                onClick={() => onTagToggle(tag)}
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Works List/Grid */}
      {filteredWorks.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          条件に一致する作品がありません。フィルターを変更してみてください。
        </Alert>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredWorks.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post._id}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          ) : (
            // List view
            <Box>
              {filteredWorks.map((post) => (
                <Box key={post._id} sx={{ mb: 2 }}>
                  <PostCard post={post} />
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default WorksPanel;