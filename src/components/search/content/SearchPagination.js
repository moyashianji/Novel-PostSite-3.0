import React from 'react';
import { 
  Box, 
  Pagination, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { Tune as TuneIcon } from '@mui/icons-material';

const SearchPagination = ({ 
  totalPages,
  currentPage,
  onPageChange,
  hasMore,
  currentDatasetLength,
  totalFilteredCount,
  fetchingMore,
  onLoadMore
}) => {
  if (totalPages <= 1 && !hasMore) return null;
  
  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "center", 
      mt: 4, 
      mb: 2,
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      gap: 2
    }}>
      {totalPages > 1 && (
        <Pagination 
          count={totalPages} 
          page={currentPage} 
          onChange={onPageChange} 
          color="primary"
          showFirstButton 
          showLastButton
          siblingCount={1}
          boundaryCount={1}
        />
      )}
      
      {hasMore && currentDatasetLength < totalFilteredCount && (
        <Button 
          variant="outlined" 
          onClick={onLoadMore}
          disabled={fetchingMore}
          startIcon={fetchingMore ? <CircularProgress size={16} /> : <TuneIcon />}
        >
          {fetchingMore ? "読み込み中..." : "もっと読み込む"}
        </Button>
      )}
    </Box>
  );
};

export default SearchPagination;