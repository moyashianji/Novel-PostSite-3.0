import React from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';
import { PAGE_SIZE_OPTIONS } from '../utils/constants';

const SearchResultsInfo = ({ 
  resultsInfo,
  pageSize,
  onPageSizeChange
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 2,
      flexWrap: 'wrap',
      gap: 1
    }}>
      <Typography variant="body2" color="text.secondary">
        {`${resultsInfo.start}〜${resultsInfo.end}件 / 全${resultsInfo.total}件`}
      </Typography>
      
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="page-size-select-label">表示件数</InputLabel>
        <Select
          labelId="page-size-select-label"
          id="page-size-select"
          value={pageSize}
          onChange={onPageSizeChange}
          label="表示件数"
        >
          {PAGE_SIZE_OPTIONS.map(option => (
            <MenuItem key={option} value={option}>{option}件</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SearchResultsInfo;