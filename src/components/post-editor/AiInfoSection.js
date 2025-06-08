import React, { memo, useCallback } from 'react';
import { 
  Alert,
  CardContent,
  Typography
} from '@mui/material';
import { 
  SmartToy as SmartToyIcon,
  Link as LinkIcon,
  LightbulbOutlined as LightbulbOutlinedIcon
} from '@mui/icons-material';
import { SectionCard, CardHeaderStyled, FormSection } from './ui/StyledComponents';
import { LabeledTextField } from './ui/FormComponents';
import AiToolSelector from './AiToolSelector';

const AiInfoSection = ({ 
  usedAiTools, 
  setUsedAiTools, 
  aiEvidenceUrl, 
  setAiEvidenceUrl, 
  aiEvidenceDescription, 
  setAiEvidenceDescription, 
  formErrors 
}) => {

  // AI説明変更ハンドラをメモ化
  const handleAiDescriptionChange = useCallback((value) => {
    setAiEvidenceDescription(value);
  }, [setAiEvidenceDescription]);

  // URL変更ハンドラをメモ化
  const handleUrlChange = useCallback((value) => {
    setAiEvidenceUrl(value);
  }, [setAiEvidenceUrl]);

  return (
    <SectionCard>
      <CardHeaderStyled
        avatar={<SmartToyIcon />}
        title="AI情報 (必須)"
        color="info.main"
      />
      <CardContent sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            当プラットフォームはAIを活用した創作を推奨しています。使用したAIツールや方法について詳細を記入してください。
          </Typography>
        </Alert>
        
        <FormSection>
          {/* AIツールセレクターコンポーネント */}
          <AiToolSelector 
            usedAiTools={usedAiTools} 
            setUsedAiTools={setUsedAiTools} 
            formErrors={formErrors} 
          />
        </FormSection>
        
        {/* URL入力（オプショナル） */}
        <FormSection>
          <LabeledTextField
            label="AI使用の証明URL（任意）"
            placeholder="https://example.com/"
            value={aiEvidenceUrl}
            onChange={handleUrlChange}
            startIcon={<LinkIcon color="primary" />}
            tooltip="AIの使用履歴やプロンプトの保存先URLなどがあれば入力してください。（任意）"
          />
        </FormSection>
        
        {/* AI説明（必須） */}
        <FormSection>
          <LabeledTextField
            label="AI使用の説明"
            placeholder="どのようにAIを使用したか説明してください"
            value={aiEvidenceDescription}
            onChange={handleAiDescriptionChange}
            required
            multiline
            rows={4}
            tooltip="AIをどのように利用して作品を作成したか詳細に説明してください。使用したプロンプトや編集プロセスなどを含めると良いでしょう。"
            error={!!formErrors?.aiDescription}
            helperText={formErrors?.aiDescription}
            startIcon={<LightbulbOutlinedIcon color="primary" />}
          />
        </FormSection>
      </CardContent>
    </SectionCard>
  );
};

export default memo(AiInfoSection);
