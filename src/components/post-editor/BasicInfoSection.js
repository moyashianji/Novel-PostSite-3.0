import React, { memo, useCallback } from 'react';
import { 
  Box, 
  FormControl, 
  Select, 
  MenuItem, 
  Divider,
  CardContent,
  Typography
} from '@mui/material';
import { 
  Title as TitleIcon,
  Description as DescriptionIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { LabelWithIcon, FormSectionLabel, FormSection, SectionCard, CardHeaderStyled } from './ui/StyledComponents';
import { LabeledTextField, InfoTooltip } from './ui/FormComponents';
import TagSelector from './TagSelector';

const BasicInfoSection = ({ 
  title, 
  setTitle, 
  description, 
  setDescription, 
  tags, 
  setTags, 
  series, 
  setSeries, 
  seriesList, 
  handleOpenModal, 
  formErrors, 
  theme,
  descCharCount
}) => {
  
  // シリーズ変更ハンドラをメモ化
  const handleSeriesChange = useCallback((e) => {
    setSeries(e.target.value);
  }, [setSeries]);

  // タイトル変更ハンドラをメモ化
  const handleTitleChange = useCallback((value) => {
    setTitle(value);
  }, [setTitle]);

  // 説明テキスト変更ハンドラをメモ化
  const handleDescriptionChange = useCallback((value) => {
    setDescription(value);
  }, [setDescription]);

  return (
    <SectionCard>
      <CardHeaderStyled
        avatar={<TitleIcon />}
        title="基本情報"
        color="primary.main"
      />
      <CardContent sx={{ p: 3 }}>
        {/* シリーズ選択 */}
        <FormSection>
          <LabelWithIcon>
            <FormSectionLabel variant="body2">
              シリーズ選択（任意）
            </FormSectionLabel>
            <InfoTooltip title="シリーズは関連する作品をまとめるための機能です。複数の章や連載作品の場合は、シリーズにまとめることをお勧めします。" />
          </LabelWithIcon>
          
          <FormControl fullWidth size="small">
            <Select
              value={series}
              onChange={handleSeriesChange}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <Typography color="text.secondary">シリーズを選択する（任意）</Typography>;
                }
                const selectedSeries = seriesList.find(s => s._id === selected);
                return selectedSeries ? selectedSeries.title : '';
              }}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="">
                <em>選択なし</em>
              </MenuItem>
              {seriesList.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.title}
                </MenuItem>
              ))}
              <Divider />
              <MenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal();
                }}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                }}
              >
                <AddIcon fontSize="small" sx={{ mr: 1 }} />
                シリーズを新規作成
              </MenuItem>
            </Select>
          </FormControl>
        </FormSection>
        
        {/* タイトル */}
        <FormSection>
          <LabeledTextField 
            label="タイトル"
            value={title}
            onChange={handleTitleChange}
            required
            maxLength={500}
            tooltip="作品のタイトルを入力してください。検索結果に表示される重要な情報です。"
            error={!!formErrors?.title}
            helperText={formErrors?.title || `${title.length}/500文字`}
            startIcon={<TitleIcon color="primary" />}
          />
        </FormSection>

        {/* 作品説明 */}
        <FormSection>
          <LabeledTextField 
            label="作品説明"
            value={description}
            onChange={handleDescriptionChange}
            required
            multiline
            rows={4}
            maxLength={3000}
            tooltip="作品の概要や紹介文を入力してください。検索結果に表示される重要な情報です。"
            error={!!formErrors?.description}
            helperText={formErrors?.description || `${descCharCount}/3000文字`}
            startIcon={<DescriptionIcon color="primary" />}
          />
        </FormSection>

        {/* タグ選択コンポーネント */}
        <TagSelector 
          tags={tags} 
          setTags={setTags} 
          formErrors={formErrors} 
        />
      </CardContent>
    </SectionCard>
  );
};

export default memo(BasicInfoSection);