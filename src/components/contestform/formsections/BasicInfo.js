import React from 'react';
import { 
  Grid, 
  Typography, 
  TextField, 
  Box, 
  Paper,
  Fade,
  Tooltip,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// テーマ対応のスタイルコンポーネント
const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 600,
  position: 'relative',
  color: theme.palette.text.primary,
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

const FieldLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
}));

const RequiredIndicator = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: theme.spacing(0.5),
  fontWeight: 600,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.default, 0.5)
      : alpha(theme.palette.background.paper, 0.8),
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: theme.palette.divider,
      transition: 'border-color 0.3s ease',
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.6),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.8)
        : theme.palette.background.paper,
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
        boxShadow: theme.palette.mode === 'dark'
          ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
          : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
    },
    '&.Mui-error': {
      '& fieldset': {
        borderColor: theme.palette.error.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.error.main,
        boxShadow: theme.palette.mode === 'dark'
          ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.2)}`
          : `0 0 0 3px ${alpha(theme.palette.error.main, 0.1)}`,
      },
    },
  },
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.8,
    },
  },
  '& .MuiFormHelperText-root': {
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
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

const CharacterCount = styled(Typography)(({ theme }) => ({
  textAlign: 'right',
  marginTop: theme.spacing(0.5),
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
  transition: 'color 0.2s ease',
}));

/**
 * タイトルと短い概要を入力するコンポーネント
 */
const BasicInfo = React.memo(({ 
  title, 
  handleTitleChange, 
  shortDescription, 
  handleShortDescriptionChange, 
  characterCountDisplay,
  errors = {}
}) => {
  const theme = useTheme();
  
  // 文字数の色を動的に決定
  const getCharacterCountColor = (current, max) => {
    const ratio = current / max;
    if (ratio >= 0.9) return theme.palette.error.main;
    if (ratio >= 0.7) return theme.palette.warning.main;
    return theme.palette.text.secondary;
  };

  return (
    <>
      <SectionTitle variant="h5">
        コンテスト基本情報
      </SectionTitle>

      <StyledPaper elevation={0}>
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <FieldLabel variant="subtitle1">
              コンテストタイトル
            </FieldLabel>
            <RequiredIndicator component="span">
              ※必須
            </RequiredIndicator>
            <Tooltip 
              title="コンテストのタイトルは検索結果や一覧に表示されるため、内容を的確に表す魅力的なタイトルにしましょう。" 
              arrow
              placement="top"
            >
              <HelpIconButton size="small">
                <HelpOutlineIcon fontSize="small" />
              </HelpIconButton>
            </Tooltip>
          </Box>

          <StyledTextField
            variant="outlined"
            fullWidth
            placeholder="例: 第1回 夏の短編小説コンテスト"
            value={title}
            onChange={handleTitleChange}
            required
            error={errors.title}
            helperText={errors.title ? "タイトルは必須項目です" : ""}
            inputProps={{ maxLength: 50 }}
          />
          <Fade in={true}>
            <CharacterCount 
              sx={{ 
                color: getCharacterCountColor(title.length, 50)
              }}
            >
              {title.length} / 50 文字
            </CharacterCount>
          </Fade>
        </Box>

        <Box>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <FieldLabel variant="subtitle1">
              短い概要
            </FieldLabel>
            <RequiredIndicator component="span">
              ※必須
            </RequiredIndicator>
            <Tooltip 
              title="コンテストの内容を簡潔に説明する短い文章です。検索結果や一覧ページに表示されます。" 
              arrow
              placement="top"
            >
              <HelpIconButton size="small">
                <HelpOutlineIcon fontSize="small" />
              </HelpIconButton>
            </Tooltip>
          </Box>

          <StyledTextField
            variant="outlined"
            fullWidth
            placeholder="例: 夏をテーマにした5000字以内のオリジナル短編小説を募集します"
            value={shortDescription}
            onChange={handleShortDescriptionChange}
            required
            error={errors.shortDescription}
            helperText={errors.shortDescription ? "概要は必須項目です" : ""}
            inputProps={{ maxLength: 50 }}
          />
          <Fade in={true}>
            <CharacterCount 
              sx={{ 
                color: getCharacterCountColor(shortDescription.length, 50)
              }}
            >
              {shortDescription.length} / 50 文字
            </CharacterCount>
          </Fade>
        </Box>
      </StyledPaper>
    </>
  );
});

BasicInfo.displayName = 'BasicInfo';

export default BasicInfo;