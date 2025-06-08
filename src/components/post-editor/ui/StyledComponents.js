import { styled } from '@mui/material/styles';
import { 
  Box, 
  Card,
  CardHeader,
  Chip,
  Paper,
  Typography,
  Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';

// セクションカード
export const SectionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0px 3px 15px rgba(0, 0, 0, 0.05)',
  overflow: 'visible',
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.08)',
  }
}));

export const CardHeaderStyled = styled(CardHeader)(({ theme, color = 'primary.main' }) => ({
  backgroundColor: alpha(theme.palette[color.split('.')[0]][color.split('.')[1]], 0.08),
  '& .MuiCardHeader-title': {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiCardHeader-avatar': {
    marginRight: theme.spacing(1),
  },
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
}));

// タグ関連のスタイル
export const TagContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  minHeight: theme.spacing(4),
}));

// AI候補チップ用コンテナ
export const ChipsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.75),
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5)
}));

// フォームセクション
export const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
}));

// フォーム見出し
export const FormSectionLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 'medium',
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.primary,
}));

// アイコン付きラベル
export const LabelWithIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(0.5),
}));

// オプションアイコン
export const IconWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.primary.main,
}));

// ラジオボタンのコンテナ
export const RadioContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

// ポイント表示用のチップ
export const InfoChip = styled(Chip)(({ theme, color = 'primary' }) => ({
  backgroundColor: alpha(theme.palette[color].main, 0.1),
  color: theme.palette[color].main,
  fontWeight: 'bold',
  height: 26,
  '& .MuiChip-icon': {
    color: 'inherit',
  }
}));

// サブミットボタンエリア
export const SubmitArea = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(8px)',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 10,
  marginTop: theme.spacing(4),
}));

// スクロールトップボタン
export const ScrollTopButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 9,
  borderRadius: '50%',
  minWidth: 0,
  width: 48,
  height: 48,
  boxShadow: theme.shadows[4],
}));

// エディタコンテナ
export const EditorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));
