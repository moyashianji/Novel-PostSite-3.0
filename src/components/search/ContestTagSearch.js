import React, { useState, useCallback } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  InputAdornment, 
  IconButton 
} from '@mui/material';
import { 
  EmojiEvents as EmojiEventsIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const ContestTagSearch = ({ tab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contestTagInput, setContestTagInput] = useState('');

  // 現在のURL からコンテストタグ検索かどうかを判定
  const isContestTagSearch = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const fields = params.get('fields');
    return fields === 'contestTags';
  }, [location.search]);

  // コンテストタグ検索の実行
  const handleContestTagSearch = useCallback(() => {
    if (!contestTagInput.trim()) return;
    
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("mustInclude", contestTagInput.trim());
    updatedParams.set("fields", "contestTags");
    updatedParams.set("tagSearchType", "exact");
    updatedParams.set("type", "posts"); // 作品タブに設定
    updatedParams.set("page", "1");
    
    navigate({ search: updatedParams.toString() });
  }, [contestTagInput, location.search, navigate]);

  // コンテストタグ検索のクリア
  const handleClearContestTagSearch = useCallback(() => {
    setContestTagInput('');
    
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.delete("mustInclude");
    updatedParams.delete("fields");
    updatedParams.set("tagSearchType", "partial");
    updatedParams.set("page", "1");
    
    navigate({ search: updatedParams.toString() });
  }, [location.search, navigate]);

  // Enterキーでの検索
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      handleContestTagSearch();
    }
  }, [handleContestTagSearch]);

  // ユーザータブ・シリーズタブでは表示しない
  if (tab === 'users' || tab === 'series') return null;

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        backgroundColor: isContestTagSearch() ? 'primary.50' : 'background.paper',
        border: isContestTagSearch() ? '2px solid' : '1px solid',
        borderColor: isContestTagSearch() ? 'primary.main' : 'divider',
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <EmojiEventsIcon 
          fontSize="small" 
          sx={{ 
            mr: 1, 
            color: isContestTagSearch() ? 'primary.main' : 'text.secondary' 
          }} 
        />
        <Typography 
          variant="subtitle1" 
          fontWeight="500"
          color={isContestTagSearch() ? 'primary.main' : 'text.primary'}
        >
          コンテストタグ検索
        </Typography>
        {isContestTagSearch() && (
          <Typography 
            variant="caption" 
            sx={{ 
              ml: 1, 
              px: 1, 
              py: 0.25, 
              backgroundColor: 'primary.main', 
              color: 'white', 
              borderRadius: 1,
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}
          >
            検索中
          </Typography>
        )}
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        コンテストに応募された作品を特定のコンテストタグで検索できます
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          label="コンテストタグを入力"
          variant="outlined"
          size="small"
          fullWidth
          value={contestTagInput}
          onChange={(e) => setContestTagInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="例: 春のコンテスト2024"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmojiEventsIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: contestTagInput && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setContestTagInput('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleContestTagSearch}
          disabled={!contestTagInput.trim()}
          startIcon={<SearchIcon />}
          sx={{ 
            minWidth: 100,
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          検索
        </Button>
        
        {isContestTagSearch() && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearContestTagSearch}
            startIcon={<ClearIcon />}
            sx={{ 
              minWidth: 80,
              borderRadius: 2
            }}
          >
            クリア
          </Button>
        )}
      </Box>
      
      {isContestTagSearch() && (
        <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'info.50', borderRadius: 1 }}>
          <Typography variant="caption" color="info.main" sx={{ fontWeight: 'bold' }}>
            💡 ヒント: コンテストタグクラウドからも直接検索できます
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ContestTagSearch;