import React from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  Box,
  Alert,
  Tooltip,
  IconButton,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CustomEditor from '../../wysiwyg/CustomEditor';

// テーマ対応のスタイルコンポーネント
const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: 600,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
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

const RequiredIndicator = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 600,
  marginLeft: theme.spacing(0.5),
}));

const DescriptionBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.info.main, 0.05)
    : alpha(theme.palette.info.main, 0.03),
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.info.main, 0.08)
      : alpha(theme.palette.info.main, 0.05),
    transform: 'translateY(-1px)',
  },
}));

const HelpIconButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'scale(1.1)',
  },
}));

const StyledPaper = styled(Paper)(({ theme, error }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  border: error 
    ? `2px solid ${theme.palette.error.main}` 
    : `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0, 0, 0, 0.4)'
      : '0 8px 30px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
  '&:focus-within': {
    border: error 
      ? `2px solid ${theme.palette.error.main}` 
      : `2px solid ${theme.palette.primary.main}`,
    boxShadow: error
      ? theme.palette.mode === 'dark'
        ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.2)}`
        : `0 0 0 3px ${alpha(theme.palette.error.main, 0.1)}`
      : theme.palette.mode === 'dark'
        ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
        : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1),
  }
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.error.main, 0.1)
    : alpha(theme.palette.error.main, 0.08),
  color: theme.palette.text.primary,
  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  '& .MuiAlert-icon': {
    color: theme.palette.error.main,
  },
  '& .MuiAlert-message': {
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
}));

const HintBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.success.main, 0.05)
    : alpha(theme.palette.success.main, 0.03),
  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.success.main, 0.08)
      : alpha(theme.palette.success.main, 0.05),
  },
}));

const InfoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}));

const DetailText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  lineHeight: 1.6,
  fontWeight: 400,
  marginTop: theme.spacing(1),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.default, 0.3)
    : alpha(theme.palette.grey[50], 0.8),
  borderRadius: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  fontStyle: 'italic',
}));

/**
 * 詳細説明（リッチテキストエディタ）コンポーネント
 */
const DetailedDescription = React.memo(({ description, handleDescriptionChange, error }) => {
  const theme = useTheme();

  return (
    <>
      <SectionTitle variant="h5">
        <DescriptionIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
        詳細説明
        <RequiredIndicator component="span">※必須</RequiredIndicator>
      </SectionTitle>

      <DescriptionBox>
        <InfoSection>
          <Typography 
            variant="body1" 
            color="text.primary"
            sx={{ fontWeight: 500 }}
          >
            コンテストの詳細情報を記入してください。
          </Typography>
          <Tooltip 
            title="応募期間、賞金、ルール、審査基準などを詳細に記載すると応募者が集まりやすくなります。" 
            arrow
            placement="top"
          >
            <HelpIconButton size="small">
              <HelpOutlineIcon fontSize="small" />
            </HelpIconButton>
          </Tooltip>
        </InfoSection>
        <DetailText variant="body2">
          （コンテスト概要、募集ジャンル、賞、賞金等、応募資格、応募方法、スケジュール、選考方法、規約など必要な情報を詳細に記載してください）
        </DetailText>
      </DescriptionBox>

      {error && (
        <StyledAlert severity="error">
          詳細説明は必須項目です
        </StyledAlert>
      )}

      <StyledPaper 
        variant="outlined" 
        error={error}
      >
        <CustomEditor 
          value={description} 
          onChange={handleDescriptionChange} 
        />
      </StyledPaper>

      <HintBox>
        <LightbulbIcon 
          sx={{ 
            color: theme.palette.success.main,
            fontSize: '1.2rem',
            marginTop: '2px',
            flexShrink: 0,
          }} 
        />
        <Box>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.success.main,
              marginBottom: 0.5,
            }}
          >
            作成のヒント
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ lineHeight: 1.5 }}
          >
            画像やリスト、見出しなどを活用して読みやすく構造化された説明を作成しましょう。
            参加者が求める情報を分かりやすく整理することで、より多くの応募を得られます。
          </Typography>
        </Box>
      </HintBox>
    </>
  );
});

DetailedDescription.displayName = 'DetailedDescription';

export default DetailedDescription;