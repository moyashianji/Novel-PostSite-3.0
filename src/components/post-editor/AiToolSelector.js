import React, { memo, useCallback, useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Chip,
  InputAdornment,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { FormSectionLabel, ChipsContainer } from './ui/StyledComponents';

// AI候補のサンプルリスト
const AI_SUGGESTIONS = [
  "AIのべりすと","ChatGPT", "Claude", "GPT-4", "DALL-E", "Midjourney", "Stable Diffusion", 
  "Bard", "Bing AI", "Jasper", "Rytr", "Copy.ai", "Novel AI", "AI Dungeon",
  "Replika", "Character.AI", "Playground AI", "DeepL", "Notion AI", "Sudowrite",
  "Synthesia", "RunwayML", "Kaiber", "Leonardo.AI", "Firefly"
];

const AiToolSelector = ({ 
  usedAiTools, 
  setUsedAiTools, 
  formErrors 
}) => {
  const [newAiTool, setNewAiTool] = useState('');

  // AIツール追加ハンドラをメモ化
  const handleAddAiTool = useCallback(() => {
    if (newAiTool && !usedAiTools.includes(newAiTool) && usedAiTools.length < 20) {
      setUsedAiTools(prevTools => [...prevTools, newAiTool]);
      setNewAiTool('');
    }
  }, [newAiTool, usedAiTools, setUsedAiTools]);

  // AIツール削除ハンドラをメモ化
  const handleRemoveAiTool = useCallback((toolToRemove) => {
    setUsedAiTools(prevTools => prevTools.filter(tool => tool !== toolToRemove));
  }, [setUsedAiTools]);

  // AI候補からAIツール追加ハンドラをメモ化
  const handleAddAiSuggestion = useCallback((suggestion) => {
    if (!usedAiTools.includes(suggestion) && usedAiTools.length < 20) {
      setUsedAiTools(prevTools => [...prevTools, suggestion]);
    }
  }, [usedAiTools, setUsedAiTools]);

  // テキスト入力ハンドラをメモ化
  const handleAiToolChange = useCallback((e) => {
    setNewAiTool(e.target.value);
  }, []);

  // Enterキーでの追加ハンドラをメモ化
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && newAiTool && !usedAiTools.includes(newAiTool) && usedAiTools.length < 20) {
      e.preventDefault();
      handleAddAiTool();
    }
  }, [newAiTool, usedAiTools, handleAddAiTool]);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TextField
          placeholder="AIツール名を入力"
          variant="outlined"
          fullWidth
          value={newAiTool}
          onChange={handleAiToolChange}
          disabled={usedAiTools.length >= 20}
          onKeyPress={handleKeyPress}
          size="small"
          error={!!formErrors?.aiTools}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SmartToyIcon color="primary" />
              </InputAdornment>
            ),
            sx: { borderRadius: 1.5 }
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleAddAiTool} 
          disabled={!newAiTool || usedAiTools.includes(newAiTool) || usedAiTools.length >= 20}
          startIcon={<AddIcon />}
          sx={{ borderRadius: 1.5, whiteSpace: 'nowrap' }}
        >
          追加
        </Button>
      </Box>
      
      {formErrors?.aiTools && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
          {formErrors.aiTools}
        </Typography>
      )}
      
      <FormSectionLabel variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>選択したAIツール</Box>
        <Typography variant="caption" color="text.secondary">
          {usedAiTools.length}/20
        </Typography>
      </FormSectionLabel>
      
      <ChipsContainer>
        {usedAiTools.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            AIツールはまだ選択されていません
          </Typography>
        ) : (
          usedAiTools.map((tool, index) => (
            <Chip
              key={`tool-${tool}-${index}`}
              label={tool}
              onDelete={() => handleRemoveAiTool(tool)}
              color="info"
              sx={{ borderRadius: 1.5 }}
              size="small"
            />
          ))
        )}
      </ChipsContainer>
      
      <Divider sx={{ my: 2 }} />
      
      <FormSectionLabel variant="body2">
        一般的なAIツール（クリックで追加）
      </FormSectionLabel>
      
      <ChipsContainer>
        {AI_SUGGESTIONS.map((suggestion) => (
          <Chip
            key={`suggestion-${suggestion}`}
            label={suggestion}
            onClick={() => handleAddAiSuggestion(suggestion)}
            color="default"
            variant="outlined"
            clickable
            disabled={usedAiTools.includes(suggestion)}
            size="small"
            sx={{ 
              borderRadius: 1.5,
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                borderColor: 'primary.main'
              }
            }}
          />
        ))}
      </ChipsContainer>
    </>
  );
};

export default memo(AiToolSelector);
