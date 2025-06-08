import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
  Tooltip,
  Alert,
  Snackbar,
  FormHelperText,
  FormGroup,
  Switch,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Title as TitleIcon,
  Description as DescriptionIcon,
  LocalOffer as LocalOfferIcon,
  Add as AddIcon,
  Save as SaveIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Copyright as CopyrightIcon,
  Warning as WarningIcon,
  SmartToy as SmartToyIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const FormLabel = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  fontWeight: 'medium',
  color: theme.palette.text.secondary,
}));

const FormIcon = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.primary.main,
}));

const TagInput = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  minHeight: theme.spacing(4),
}));

const SwitchGroup = styled(FormGroup)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

const SeriesEditSidebar = ({ series, setSeries }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isOriginal, setIsOriginal] = useState(false);
  const [isAdultContent, setIsAdultContent] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [tagError, setTagError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', type: 'success' });
  const [isCompleted, setIsCompleted] = useState(false); // 新しいstate追加


  
  // サイドバーが開かれたときや、シリーズが更新されたときに状態を更新する
  useEffect(() => {
    if (series) {
      setTitle(series.title || '');
      setDescription(series.description || '');
      setTags(series.tags || []);
      setIsOriginal(series.isOriginal || false);
      setIsAdultContent(series.isAdultContent || false);
      setAiGenerated(series.aiGenerated || false);
      setIsCompleted(series.isCompleted || false); // 完結状態も読み込む

      // Reset errors
      setTitleError('');
      setDescriptionError('');
      setTagError('');
    }
  }, [series]);

  const validateTag = (tag) => {
    if (!tag.trim()) {
      setTagError('タグを入力してください');
      return false;
    }
    
    if (tag.length > 20) {
      setTagError('タグは20文字以内で入力してください');
      return false;
    }
    
    if (tags.includes(tag)) {
      setTagError('同じタグは追加できません');
      return false;
    }
    
    setTagError('');
    return true;
  };

  const handleAddTag = () => {
    if (tags.length >= 10) {
      setTagError('タグは最大10個まで追加できます');
      return;
    }
    
    if (validateTag(newTag)) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const validate = () => {
    let isValid = true;
    
    if (!title.trim() || title.length < 5 || title.length > 400) {
      setTitleError('タイトルは5文字以上400文字以内で入力してください');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    if (!description.trim() || description.length < 20 || description.length > 2000) {
      setDescriptionError('あらすじは20文字以上2000文字以内で入力してください');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    return isValid;
  };

  const handleSaveSeriesInfo = async () => {
    if (!validate()) return;
    
    setLoading(true);
    
    const updatedSeries = {
      title: title.trim(),
      description: description.trim(),
      tags,
      isOriginal,
      isAdultContent,
      aiGenerated,
      isCompleted, // 完結状態も送信データに追加

    };

    try {
      const response = await fetch(`/api/series/${series._id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
        credentials: 'include',  // 認証情報を含めてリクエスト

        body: JSON.stringify(updatedSeries),
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        // 親コンポーネントの状態を更新
        if (setSeries) {
          setSeries(current => ({ ...current, ...updatedData }));
        }
        
        // 成功した場合のみ状態を更新
        setTitle(updatedData.title);
        setDescription(updatedData.description);
        setTags(updatedData.tags);
        setIsOriginal(updatedData.isOriginal);
        setIsAdultContent(updatedData.isAdultContent);
        setAiGenerated(updatedData.aiGenerated);
        
        // 成功メッセージを表示
        setFeedback({
          open: true,
          message: 'シリーズ情報が更新されました',
          type: 'success'
        });
      } else {
        const errorMessage = await response.text();
        console.error('Failed to update series information:', errorMessage);
        
        // エラーメッセージを表示
        setFeedback({
          open: true,
          message: 'シリーズ情報の更新に失敗しました',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating series information:', error);
      
      // エラーメッセージを表示
      setFeedback({
        open: true,
        message: '通信エラーが発生しました',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseFeedback = () => {
    setFeedback({ ...feedback, open: false });
  };

  return (
    <StyledCard>
      <CardHeader 
        title="シリーズ情報"
        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          pb: 2
        }}
      />
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <FormSection>
          <FormLabel>
            <FormIcon><TitleIcon fontSize="small" /></FormIcon>
            タイトル
          </FormLabel>
          <TextField
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="シリーズのタイトルを入力"
            variant="outlined"
            size="small"
            error={Boolean(titleError)}
            helperText={titleError || `${title.length}/400`}
            InputProps={{
              sx: { borderRadius: 1.5 }
            }}
          />
        </FormSection>
        
        <FormSection>
          <FormLabel>
            <FormIcon><DescriptionIcon fontSize="small" /></FormIcon>
            あらすじ
          </FormLabel>
          <TextField
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="シリーズの説明を入力"
            multiline
            rows={5}
            variant="outlined"
            size="small"
            error={Boolean(descriptionError)}
            helperText={descriptionError || `${description.length}/2000`}
            InputProps={{
              sx: { borderRadius: 1.5 }
            }}
          />
        </FormSection>
        
        <FormSection>
          <FormLabel>
            <FormIcon><LocalOfferIcon fontSize="small" /></FormIcon>
            タグ
          </FormLabel>
          
          <TagInput>
            <TextField
              fullWidth
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="タグを入力"
              variant="outlined"
              size="small"
              disabled={tags.length >= 10}
              error={Boolean(tagError)}
              onKeyPress={handleKeyPress}
              sx={{ mr: 1 }}
              InputProps={{
                sx: { borderRadius: 1.5 },
                endAdornment: newTag && (
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => setNewTag('')}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddTag}
              disabled={tags.length >= 10 || !newTag.trim()}
              startIcon={<AddIcon />}
              size="small"
              sx={{ 
                minWidth: 'auto',
                borderRadius: 1.5,
                whiteSpace: 'nowrap',
              }}
            >
              追加
            </Button>
          </TagInput>
          
          {tagError && (
            <FormHelperText error sx={{ ml: 1, mb: 1 }}>
              {tagError}
            </FormHelperText>
          )}
          
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 1, mb: 1 }}>
            {tags.length}/10 タグ
          </Typography>
          
          <TagsContainer>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1.5 }}
              />
            ))}
          </TagsContainer>
        </FormSection>
        
        <Divider sx={{ my: 2 }} />
        
        <SwitchGroup>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Switch 
                  checked={isOriginal} 
                  onChange={(e) => setIsOriginal(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CopyrightIcon fontSize="small" sx={{ mr: 1, color: isOriginal ? 'success.main' : 'text.disabled' }} />
                  <Typography>オリジナル作品</Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={isAdultContent} 
                  onChange={(e) => setIsAdultContent(e.target.checked)}
                  color="error"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon fontSize="small" sx={{ mr: 1, color: isAdultContent ? 'error.main' : 'text.disabled' }} />
                  <Typography>成人向けコンテンツ (R-18)</Typography>
                </Box>
              }
            />
                        {/* 完結済みスイッチを追加 */}
            <FormControlLabel
              control={
                <Switch 
                  checked={isCompleted} 
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlineIcon 
                    fontSize="small" 
                    sx={{ mr: 1, color: isCompleted ? 'success.main' : 'text.disabled' }} 
                  />
                  <Typography>完結済み</Typography>
                </Box>
              }
            />

          </Stack>
        </SwitchGroup>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSeriesInfo}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            fullWidth
            sx={{ 
              py: 1.2,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s'
            }}
          >
            {loading ? '保存中...' : '変更を保存'}
          </Button>
        </Box>
      </CardContent>
      
      {/* Feedback Snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseFeedback} 
          severity={feedback.type} 
          sx={{ width: '100%' }}
          variant="filled"
          icon={feedback.type === 'success' ? <CheckCircleOutlineIcon /> : undefined}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </StyledCard>
  );
};

export default SeriesEditSidebar;