import React from 'react';
import {
  Typography,
  Box,
  Chip,
  TextField,
  IconButton,
  Alert,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LabelIcon from '@mui/icons-material/Label';

/**
 * コンテストタグ設定セクション（1つのタグのみ）
 */
const ContestTagSection = ({
  contestTags,
  setContestTags,
  newContestTag,
  setNewContestTag
}) => {
  // タグ追加（1つのみ）
  const handleAddContestTag = () => {
    const trimmedTag = newContestTag.trim();
    if (trimmedTag && contestTags.length === 0) { // 🔧 1つのみ許可
      setContestTags([trimmedTag]);
      setNewContestTag('');
    }
  };

  // タグ削除
  const handleRemoveContestTag = () => {
    setContestTags([]);
  };

  // Enterキー押下でタグ追加
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddContestTag();
    }
  };

  // タグが既に設定されている場合の処理
  const isTagSet = contestTags.length > 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        color: '#333',
        fontWeight: 600,
        mb: 2
      }}>
        <LabelIcon sx={{ mr: 1, color: 'primary.main' }} />
        コンテストタグ設定
      </Typography>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        ここで設定したタグは、このコンテストに応募された作品に自動的に追加されます。
        <strong>1つのタグのみ設定可能</strong>です。コンテストの特徴を表す代表的なタグを設定してください。
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        {/* タグ入力フィールド */}
        {!isTagSet && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="コンテストタグを追加"
              value={newContestTag}
              onChange={(e) => setNewContestTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="例: 夏の短編コンテスト、SF小説、創作コンテスト"
              inputProps={{ maxLength: 50 }}
              helperText={`${newContestTag.length}/50文字`}
            />
            <IconButton
              onClick={handleAddContestTag}
              disabled={!newContestTag.trim() || isTagSet}
              color="primary"
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'grey.300' }
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        )}

        {/* 設定済みタグ表示 */}
        {isTagSet && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              設定済みコンテストタグ:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={contestTags[0]}
                onDelete={handleRemoveContestTag}
                deleteIcon={<DeleteIcon />}
                color="primary"
                variant="filled"
                size="large"
                sx={{
                  maxWidth: '300px',
                  fontSize: '1rem',
                  py: 1,
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              タグを変更したい場合は、現在のタグを削除してから新しいタグを追加してください。
            </Typography>
          </Box>
        )}

        {/* タグが設定されていない場合の表示 */}
        {!isTagSet && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            color: 'text.secondary',
            bgcolor: 'grey.50',
            borderRadius: 1,
            border: '2px dashed',
            borderColor: 'grey.300'
          }}>
            <LabelIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography variant="body1">
              コンテストタグを追加してください
            </Typography>
            <Typography variant="body2" color="text.disabled">
              応募作品に自動追加される代表的なタグを1つ設定できます
            </Typography>
          </Box>
        )}
      </Paper>

      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>注意:</strong> コンテスト開始後はタグの変更はできません。
          応募作品に追加するタグは慎重に選択してください。
        </Typography>
      </Alert>
    </Box>
  );
};

export default ContestTagSection;