import React, { memo, useCallback, useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Chip,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  Close as CloseIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { LabelWithIcon, FormSectionLabel, FormSection, TagContainer } from './ui/StyledComponents';
import { InfoTooltip } from './ui/FormComponents';

// メモ化したタグ表示コンポーネント
const TagList = memo(({ tags, onRemove }) => (
  <TagContainer>
    {tags.length === 0 ? (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        タグはまだ追加されていません
      </Typography>
    ) : (
      tags.map((tag, index) => (
        <Chip
          key={`${tag}-${index}`}
          label={tag}
          onDelete={() => onRemove(tag)}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: 1.5,
            '& .MuiChip-deleteIcon': {
              color: 'inherit',
              '&:hover': {
                color: 'error.main'
              }
            }
          }}
        />
      ))
    )}
  </TagContainer>
));

const TagSelector = ({ 
  tags, 
  setTags, 
  formErrors 
}) => {
  const [newTag, setNewTag] = useState('');
  
  // タグ追加ハンドラをメモ化
  const handleAddTag = useCallback(() => {
    if (newTag && tags.length < 10 && !tags.includes(newTag)) {
      setTags(prevTags => [...prevTags, newTag]);
      setNewTag('');
    }
  }, [newTag, tags, setTags]);

  // タグ削除ハンドラをメモ化
  const handleRemoveTag = useCallback((tagToRemove) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  }, [setTags]);

  // Enterキー処理
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      handleAddTag();
    }
  }, [newTag, handleAddTag]);

  return (
    <FormSection>
      <LabelWithIcon>
        <FormSectionLabel variant="body2">
          タグ追加 <Box component="span" sx={{ color: 'error.main' }}>*</Box>
        </FormSectionLabel>
        <InfoTooltip title="作品を分類するためのタグです。ジャンル、テーマ、キーワードなどを追加してください。最大10個まで設定できます。" />
      </LabelWithIcon>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          placeholder="タグを入力"
          variant="outlined"
          fullWidth
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          disabled={tags.length >= 10}
          onKeyPress={handleKeyPress}
          size="small"
          error={!!formErrors?.tags}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocalOfferIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: newTag && (
              <InputAdornment position="end">
                <IconButton 
                  size="small"
                  onClick={() => setNewTag('')}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: 1.5 }
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleAddTag} 
          disabled={tags.length >= 10 || !newTag}
          startIcon={<AddIcon />}
          sx={{ borderRadius: 1.5, whiteSpace: 'nowrap' }}
        >
          追加
        </Button>
      </Box>
      
      {formErrors?.tags && (
        <Typography variant="caption" color="error" sx={{ ml: 1, display: 'block', mt: 0.5 }}>
          {formErrors.tags}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {tags.length}/10 タグ
        </Typography>
      </Box>

      {/* タグリスト */}
      <TagList tags={tags} onRemove={handleRemoveTag} />
    </FormSection>
  );
};

export default memo(TagSelector);
