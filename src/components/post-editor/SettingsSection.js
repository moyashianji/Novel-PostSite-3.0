import React, { memo, useCallback, useMemo } from 'react';
import { 
  Grid,
  CardContent,
  Typography
} from '@mui/material';
import { 
  Tune as TuneIcon
} from '@mui/icons-material';
import { SectionCard, CardHeaderStyled, RadioContainer } from './ui/StyledComponents';
import { RadioButtonGroup } from './ui/FormComponents';

const SettingsSection = ({ 
  original, 
  setOriginal, 
  adultContent, 
  setAdultContent, 
  isPublic, 
  setIsPublic, 
  allowComments, 
  setAllowComments, 
  formErrors 
}) => {
  
  // 各種設定変更ハンドラをメモ化
  const handleOriginalChange = useCallback((e) => {
    setOriginal(e.target.value === 'yes');
  }, [setOriginal]);

  const handleAdultContentChange = useCallback((e) => {
    // 修正: 'all'（全年齢）を選んだら false に、'r18' を選んだら true に設定
    setAdultContent(e.target.value === 'r18');
    console.log(`adultContent 変更: ${e.target.value} => ${e.target.value === 'r18'}`);
  }, [setAdultContent]);

  const handlePublicStatusChange = useCallback((e) => {
    setIsPublic(e.target.value === 'public');
  }, [setIsPublic]);

  const handleCommentsStatusChange = useCallback((e) => {
    setAllowComments(e.target.value === 'on');
  }, [setAllowComments]);

  // オリジナル作品のラジオボタンオプションをメモ化
  const originalOptions = useMemo(() => [
    { value: 'yes', label: 'はい' },
    { value: 'no', label: 'いいえ' }
  ], []);

  // 年齢設定のラジオボタンオプションをメモ化
  const adultContentOptions = useMemo(() => [
    { value: 'all', label: '全年齢' },
    { value: 'r18', label: 'R18' }
  ], []);

  // 公開設定のラジオボタンオプションをメモ化
  const publicOptions = useMemo(() => [
    { value: 'public', label: '公開' },
    { value: 'private', label: '非公開' }
  ], []);

  // コメント設定のラジオボタンオプションをメモ化
  const commentOptions = useMemo(() => [
    { value: 'on', label: 'コメントを許可する' },
    { value: 'off', label: 'コメントを禁止する' }
  ], []);

  return (
    <SectionCard>
      <CardHeaderStyled
        avatar={<TuneIcon />}
        title="公開設定"
        color="primary.main"
      />
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <RadioContainer>
              <RadioButtonGroup 
                legend="オリジナル作品ですか？"
                value={original === true ? 'yes' : original === false ? 'no' : ''}
                onChange={handleOriginalChange}
                options={originalOptions}
                tooltip="オリジナル作品の場合は「はい」、二次創作や翻案の場合は「いいえ」を選択してください。"
                color="primary"
              />
              {formErrors?.original && (
                <Typography variant="caption" color="error">
                  {formErrors.original}
                </Typography>
              )}
            </RadioContainer>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <RadioContainer>
              <RadioButtonGroup 
                legend="対象年齢"
                value={adultContent === false ? 'all' : 'r18'}
                onChange={handleAdultContentChange}
                options={adultContentOptions}
                tooltip="全年齢向けの作品は誰でも閲覧できます。R18作品は成人向けコンテンツを含みます。"
                color="error"
              />
              {formErrors?.adultContent && (
                <Typography variant="caption" color="error">
                  {formErrors.adultContent}
                </Typography>
              )}
            </RadioContainer>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <RadioContainer>
              <RadioButtonGroup 
                legend="公開設定"
                value={isPublic ? 'public' : 'private'}
                onChange={handlePublicStatusChange}
                options={publicOptions}
                tooltip="公開を選択すると、すべてのユーザーが作品を閲覧できます。非公開の場合は、あなた以外見ることができません。"
                color="info"
              />
            </RadioContainer>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <RadioContainer>
              <RadioButtonGroup 
                legend="コメント設定"
                value={allowComments ? 'on' : 'off'}
                onChange={handleCommentsStatusChange}
                options={commentOptions}
                tooltip="コメントを許可すると、他のユーザーが作品にコメントできます。禁止すると、コメント機能が無効になります。"
                color="success"
              />
            </RadioContainer>
          </Grid>
        </Grid>
      </CardContent>
    </SectionCard>
  );
};

export default memo(SettingsSection);
