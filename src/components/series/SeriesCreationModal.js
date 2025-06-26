import React, { useState, useCallback, memo } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Modal,
  Paper,
  Chip,
  Divider,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const SeriesCreationModal = memo(({ open, onClose, onCreateSeries }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // フォーム状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isOriginal, setIsOriginal] = useState(true);
  const [isAdultContent, setIsAdultContent] = useState(false);
  const [publicityStatus, setPublicityStatus] = useState('public'); // 🆕 公開設定を追加
  
  // エラー状態
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // 🆕 公開設定変更ハンドラを追加
  const handlePublicityStatusChange = useCallback((e) => {
    setPublicityStatus(e.target.value);
  }, []);

  // その他のハンドラー（既存のまま）
  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
    setTitleError('');
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value);
    setDescriptionError('');
  }, []);

  const handleTagChange = useCallback((e) => {
    setNewTag(e.target.value);
  }, []);

  const handleAddTag = useCallback(() => {
    if (newTag && tags.length < 10 && !tags.includes(newTag)) {
      setTags(prevTags => [...prevTags, newTag]);
      setNewTag('');
    }
  }, [newTag, tags]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  }, []);

  const handleOriginalChange = useCallback((e) => {
    setIsOriginal(e.target.value === 'yes');
  }, []);

  const handleAdultContentChange = useCallback((e) => {
    setIsAdultContent(e.target.value === 'adult');
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && newTag && tags.length < 10 && !tags.includes(newTag)) {
      e.preventDefault();
      handleAddTag();
    }
  }, [newTag, tags, handleAddTag]);

  // モーダルを閉じる前にフォームをリセット
  const handleClose = useCallback(() => {
    setTitle('');
    setDescription('');
    setTags([]);
    setNewTag('');
    setIsOriginal(true);
    setIsAdultContent(false);
    setPublicityStatus('public'); // 🆕 公開設定をリセット
    setTitleError('');
    setDescriptionError('');
    onClose();
  }, [onClose]);

  // 送信ハンドラ修正
  const handleSubmit = useCallback(() => {
    // バリデーション
    let hasError = false;
    
    if (title.length < 5 || title.length > 400) {
      setTitleError('タイトルは5文字以上400文字以内で入力してください。');
      hasError = true;
    }
    
    if (description.length < 20 || description.length > 2000) {
      setDescriptionError('あらすじは20文字以上2000文字以内で入力してください。');
      hasError = true;
    }

    if (hasError) return;

    const seriesData = {
      title,
      description,
      tags,
      isOriginal,
      isAdultContent,
      aiGenerated: true,
      publicityStatus // 🆕 公開設定を追加
    };

    onCreateSeries(seriesData);
    handleClose();
  }, [title, description, tags, isOriginal, isAdultContent, publicityStatus, onCreateSeries, handleClose]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
    >
      <Fade in={open}>
        <Paper 
          elevation={5}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '90%' : '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          {/* ヘッダー部分 */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2" fontWeight="bold" color="primary">
              シリーズを作成
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* フォーム */}
          <Box component="form" noValidate>
            {/* タイトル入力 */}
            <Box mb={3}>
              <TextField
                label="シリーズタイトル"
                variant="outlined"
                fullWidth
                value={title}
                onChange={handleTitleChange}
                error={Boolean(titleError)}
                helperText={titleError || 'シリーズの名前を入力してください（5～400文字）'}
                inputProps={{ maxLength: 400 }}
                required
              />
              <Typography variant="caption" display="block" textAlign="right" mt={0.5}>
                {title.length}/400
              </Typography>
            </Box>
            
            {/* あらすじ入力 */}
            <Box mb={3}>
              <TextField
                label="あらすじ"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={handleDescriptionChange}
                error={Boolean(descriptionError)}
                helperText={descriptionError || 'シリーズのあらすじを入力してください（20～2000文字）'}
                inputProps={{ maxLength: 2000 }}
                required
              />
              <Typography variant="caption" display="block" textAlign="right" mt={0.5}>
                {description.length}/2000
              </Typography>
            </Box>
            
            {/* タグ入力 */}
            <Box mb={3}>
              <TextField
                label="タグを追加"
                variant="outlined"
                fullWidth
                value={newTag}
                onChange={handleTagChange}
                onKeyPress={handleKeyPress}
                helperText={`タグを入力してEnterキーで追加（${tags.length}/10）`}
                InputProps={{
                  endAdornment: (
                    <IconButton 
                      onClick={handleAddTag}
                      disabled={!newTag || tags.length >= 10 || tags.includes(newTag)}
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                  )
                }}
              />
              {tags.length > 0 && (
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>
            
            {/* オリジナル作品設定 */}
            <Box mb={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">オリジナル作品ですか？</FormLabel>
                <RadioGroup
                  row
                  value={isOriginal ? 'yes' : 'no'}
                  onChange={handleOriginalChange}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="はい" />
                  <FormControlLabel value="no" control={<Radio />} label="いいえ" />
                </RadioGroup>
              </FormControl>
            </Box>
            
            {/* 年齢制限設定 */}
            <Box mb={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">対象年齢</FormLabel>
                <RadioGroup
                  row
                  value={isAdultContent ? 'adult' : 'all'}
                  onChange={handleAdultContentChange}
                >
                  <FormControlLabel value="all" control={<Radio />} label="全年齢" />
                  <FormControlLabel value="adult" control={<Radio />} label="R18" />
                </RadioGroup>
              </FormControl>
            </Box>
            
            {/* 🆕 公開設定 */}
            <Box mb={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">公開設定</FormLabel>
                <RadioGroup
                  value={publicityStatus}
                  onChange={handlePublicityStatusChange}
                >
                  <FormControlLabel value="public" control={<Radio />} label="公開" />
                  <FormControlLabel value="limited" control={<Radio />} label="限定公開" />
                  <FormControlLabel value="private" control={<Radio />} label="非公開" />
                </RadioGroup>
              </FormControl>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* ボタン */}
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button 
                variant="outlined" 
                onClick={handleClose}
              >
                キャンセル
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit}
              >
                シリーズを作成
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
});

export default SeriesCreationModal;