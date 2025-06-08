import React, { memo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  CardContent
} from '@mui/material';
import { 
  FormatBold as FormatBoldIcon,
  Image as ImageIcon 
} from '@mui/icons-material';
import { LabelWithIcon, FormSectionLabel, SectionCard, CardHeaderStyled, EditorContainer, InfoChip } from './ui/StyledComponents';
import { InfoTooltip } from './ui/FormComponents';
import CustomEditor from '../wysiwyg/CustomEditor';

const ContentSection = ({ 
  content, 
  setContent, 
  charCount, 
  setCharCount, 
  imageCount, 
  setImageCount, 
  formErrors 
}) => {
  
  // エディタ内容変更ハンドラをメモ化
  const handleContentChange = useCallback((value) => {
    setContent(value);
    
    // HTMLタグを除去して文字数をカウント
    setCharCount(value.replace(/<[^>]*>/g, '').length);
    
    // Base64画像の検出とカウント
    const imgMatches = value.match(/data:image\/[a-zA-Z]+;base64,[^"]+/g) || [];
    setImageCount(imgMatches.length);
  }, [setContent, setCharCount, setImageCount]);

  return (
    <SectionCard>
      <CardHeaderStyled
        avatar={<FormatBoldIcon />}
        title="本文"
        color="primary.main"
      />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <LabelWithIcon>
            <FormSectionLabel variant="body2">
              本文 <Box component="span" sx={{ color: 'error.main' }}>*</Box>
            </FormSectionLabel>
            <InfoTooltip title="作品の本文です。テキスト、画像を含めることができます。フォーマットや装飾はエディタのツールバーを使用してください。" />
          </LabelWithIcon>

          {formErrors?.content && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
              {formErrors.content}
            </Typography>
          )}
        </Box>
        
        <EditorContainer elevation={0}>
          <CustomEditor
            value={content}
            onChange={handleContentChange}
          />
        </EditorContainer>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InfoChip 
              icon={<FormatBoldIcon />} 
              label={`文字数: ${charCount.toLocaleString()}/70,000`}
              color={charCount > 70000 ? "error" : "primary"}
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <InfoChip 
              icon={<ImageIcon />} 
              label={`画像: ${imageCount}枚`}
              color="primary"
            />
          </Grid>
        </Grid>
      </CardContent>
    </SectionCard>
  );
};

export default memo(ContentSection);
