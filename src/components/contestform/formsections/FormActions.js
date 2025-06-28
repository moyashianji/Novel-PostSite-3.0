import React from 'react';
import { 
  Grid, 
  Box, 
  Button, 
  CircularProgress, 
  Paper,
  Typography,
  Alert,
  Card,
  CardContent,
  Divider,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublishIcon from '@mui/icons-material/Publish';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import InfoIcon from '@mui/icons-material/Info';

// テーマ対応のスタイルコンポーネント
const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: 600,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: 0,
    width: '40px',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px',
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.3s ease',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0, 0, 0, 0.4)'
      : '0 8px 30px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  }
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.info.main, 0.1)
    : alpha(theme.palette.info.main, 0.08),
  color: theme.palette.text.primary,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  '& .MuiAlert-icon': {
    color: theme.palette.info.main,
  },
  '& .MuiAlert-message': {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
}));

const ChecklistTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const StyledList = styled(List)(({ theme }) => ({
  padding: 0,
  '& .MuiListItem-root': {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderRadius: theme.spacing(1),
    transition: 'all 0.2s ease',
    marginBottom: theme.spacing(0.5),
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.default, 0.3)
      : alpha(theme.palette.success.main, 0.02),
    border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? alpha(theme.palette.success.main, 0.1)
        : alpha(theme.palette.success.main, 0.05),
      transform: 'translateX(4px)',
    },
  },
  '& .MuiListItemIcon-root': {
    minWidth: 40,
    paddingLeft: theme.spacing(1),
  },
  '& .MuiListItemText-root': {
    margin: 0,
    paddingRight: theme.spacing(1),
  },
  '& .MuiListItemText-primary': {
    color: theme.palette.text.primary,
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  '& .MuiListItemText-secondary': {
    color: theme.palette.text.secondary,
    fontSize: '0.85rem',
    marginTop: theme.spacing(0.5),
  },
}));

const PreviewButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  fontSize: '1rem',
  marginBottom: theme.spacing(2),
  borderWidth: '2px',
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.main, 0.1)
    : 'transparent',
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  '&:hover': {
    borderWidth: '2px',
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.2)
      : alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`
      : `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  transition: 'all 0.3s ease',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
    : `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(45deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
      : `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0, 0, 0, 0.4)'
      : '0 8px 30px rgba(0, 0, 0, 0.2)',
  },
  '&:disabled': {
    background: theme.palette.action.disabled,
    color: theme.palette.action.disabledBackground,
    transform: 'none',
    boxShadow: 'none',
  },
}));

const HintBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  textAlign: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.info.main, 0.05)
    : alpha(theme.palette.info.main, 0.03),
  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& > *': {
    marginBottom: theme.spacing(1),
  },
}));

/**
 * フォームのプレビューと送信ボタン
 */
const FormActions = React.memo(({ handlePreview, handleSubmit, loading }) => {
  const theme = useTheme();
  
  const checklistItems = [
    {
      primary: "基本情報が正確に入力されていますか？",
      secondary: "タイトルと短い概要は必須項目です"
    },
    {
      primary: "詳細な説明文は十分に情報が含まれていますか？",
      secondary: "応募方法、審査基準、賞品などの重要情報を記載しましょう"
    },
    {
      primary: "応募期間の設定は適切ですか？",
      secondary: "応募開始日と終了日は必須項目です"
    },
    {
      primary: "画像は適切にアップロードされていますか？",
      secondary: "アイコンやヘッダー画像でコンテストを魅力的に演出しましょう"
    },
    {
      primary: "応募条件や制限事項は明確に設定されていますか？",
      secondary: "参加者が混乱しないよう、ルールを明確にしましょう"
    }
  ];

  return (
    <>
      <SectionTitle variant="h5">
        <AssignmentTurnedInIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        確認と作成
      </SectionTitle>

      <StyledAlert severity="info" icon={<InfoIcon />}>
        コンテスト作成前に、プレビュー機能で内容を確認することをお勧めします。
        作成後も編集は可能ですが、事前確認で完成度を高めましょう。
      </StyledAlert>

      <StyledPaper elevation={0}>
        <ChecklistTitle variant="h6">
          <PlaylistAddCheckIcon />
          コンテスト作成前のチェックリスト
        </ChecklistTitle>
        
        <StyledList>
          {checklistItems.map((item, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <CheckCircleIcon 
                  sx={{ 
                    color: theme.palette.success.main,
                    fontSize: '1.5rem',
                  }} 
                />
              </ListItemIcon>
              <ListItemText 
                primary={item.primary}
                secondary={item.secondary}
              />
            </ListItem>
          ))}
        </StyledList>
        
        <ButtonContainer>
          <PreviewButton
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={handlePreview}
            fullWidth
          >
            プレビューで確認する
          </PreviewButton>
          
          <SubmitButton
            variant="contained"
            startIcon={loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <PublishIcon />
            )}
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
          >
            {loading ? 'コンテスト作成中...' : 'コンテストを作成する'}
          </SubmitButton>
        </ButtonContainer>
        
        <HintBox>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <InfoIcon sx={{ fontSize: '1rem' }} />
            作成後もコンテスト情報は編集可能です
          </Typography>
        </HintBox>
      </StyledPaper>
    </>
  );
});

FormActions.displayName = 'FormActions';

export default FormActions;