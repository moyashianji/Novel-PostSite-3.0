import React from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { PAGE_SIZE_OPTIONS } from '../utils/constants';

const SearchResultsInfo = ({ 
  resultsInfo,
  pageSize,
  onPageSizeChange,
  // 詳細設定関連のprops
  showDetailedButton = false,
  onDetailedButtonClick,
  activeDetailedFiltersCount = 0
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
      
      {/* 右側のコントロール群 */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        flexWrap: 'wrap'
      }}>
        {/* 詳細設定ボタン（作品・シリーズタブのみ表示） */}
        {showDetailedButton && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={onDetailedButtonClick}
            sx={{ 
              borderRadius: 1.5,
              fontSize: '0.875rem',
              px: 2,
              py: 0.5,
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              }
            }}
          >
            詳細設定
            {activeDetailedFiltersCount > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.75,
                  py: 0.25,
                  backgroundColor: 'error.main',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '0.625rem',
                  fontWeight: 'bold',
                  minWidth: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
              >
                {activeDetailedFiltersCount}
              </Box>
            )}
          </Button>
        )}
        
        {/* 表示件数ドロップダウン */}
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
    </Box>
  );
};

export default SearchResultsInfo;