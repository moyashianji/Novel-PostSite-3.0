import React from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Chip,
  InputAdornment
} from '@mui/material';
import { EmojiEvents as EmojiEventsIcon } from '@mui/icons-material';

const ContestTagFilter = ({ 
  contestTag, 
  onContestTagChange, 
  onClearContestTag,
  tab 
}) => {
  // ユーザータブでは表示しない
  if (tab === 'users') return null;
  
  return (
    <Box sx={{ my: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <EmojiEventsIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="subtitle1" fontWeight="500">
          コンテストで検索
        </Typography>
        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
          （該当するコンテストタグを持つ作品を上位表示）
        </Typography>
      </Box>
      
      <TextField
        fullWidth
        size="small"
        placeholder="例: 春コンテスト"
        value={contestTag}
        onChange={(e) => onContestTagChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmojiEventsIcon fontSize="small" color="primary" />
            </InputAdornment>
          ),
          endAdornment: contestTag && (
            <InputAdornment position="end">
              <Chip 
                label="クリア" 
                size="small" 
                variant="outlined"
                onClick={onClearContestTag}
                sx={{ cursor: 'pointer' }}
              />
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              }
            }
          }
        }}
      />
      
      {contestTag && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="success.main">
            「{contestTag}」のコンテストタグを持つ作品を優先表示中
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ContestTagFilter;