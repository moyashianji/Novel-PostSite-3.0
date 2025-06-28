import React from 'react';
import {
  Typography,
  Box,
  Chip,
  TextField,
  IconButton,
  Alert,
  Paper,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LabelIcon from '@mui/icons-material/Label';

// テーマ対応のスタイルコンポーネント
const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.primary,
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0, 0, 0, 0.4)'
      : '0 8px 30px rgba(0, 0, 0, 0.12)',
  }
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
    color: theme.palette.text.secondary,
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const AddButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
      : `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabled,
    color: theme.palette.action.disabledBackground,
    transform: 'none',
    boxShadow: 'none',
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  maxWidth: '300px',
  fontSize: '1rem',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  transition: 'all 0.2s ease',
  border: `2px solid ${theme.palette.primary.main}`,
  '& .MuiChip-label': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: theme.spacing(0, 1),
  },
  '& .MuiChip-deleteIcon': {
    color: theme.palette.primary.contrastText,
    transition: 'all 0.2s ease',
    '&:hover': {
      color: theme.palette.error.main,
      backgroundColor: alpha(theme.palette.error.main, 0.1),
      borderRadius: '50%',
    },
  },
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
      : `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
  }
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.default, 0.3)
    : alpha(theme.palette.grey[50], 0.8),
  borderRadius: theme.spacing(1),
  border: `2px dashed ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.5),
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.05)
      : alpha(theme.palette.primary.main, 0.02),
  },
  '& .MuiSvgIcon-root': {
    fontSize: 48,
    color: theme.palette.text.disabled,
    marginBottom: theme.spacing(1),
  }
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.info.main, 0.1)
    : alpha(theme.palette.info.main, 0.08),
  color: theme.palette.text.primary,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  '& .MuiAlert-icon': {
    color: theme.palette.info.main,
  },
  '&.MuiAlert-standardWarning': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.warning.main, 0.1)
      : alpha(theme.palette.warning.main, 0.08),
    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
    '& .MuiAlert-icon': {
      color: theme.palette.warning.main,
    },
  }
}));

/**
 * コンテストタグ設定セクション（1つのタグのみ）
 */
const ContestTagSection = ({
  contestTags,
  setContestTags,
  newContestTag,
  setNewContestTag
}) => {
  const theme = useTheme();

  // タグ追加（1つのみ）
  const handleAddContestTag = () => {
    const trimmedTag = newContestTag.trim();
    if (trimmedTag && contestTags.length === 0) { // 🔧 1つのみ許可
      setContestTags([trimmedTag]);
      setNewContestTag('');
    }
  };

  // タグ削除
  const handleRemoveContestTag = () => {
    setContestTags([]);
  };

  // Enterキー押下でタグ追加
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddContestTag();
    }
  };

  // タグが既に設定されている場合の処理
  const isTagSet = contestTags.length > 0;

  // 文字数の色を決定
  const getCharacterCountColor = () => {
    const ratio = newContestTag.length / 50;
    if (ratio >= 0.9) return theme.palette.error.main;
    if (ratio >= 0.7) return theme.palette.warning.main;
    return theme.palette.text.secondary;
  };

  return (
    <Box>
      <SectionTitle variant="h6" gutterBottom>
        <LabelIcon />
        コンテストタグ設定
      </SectionTitle>

      <StyledAlert severity="info" sx={{ mb: 3 }}>
        ここで設定したタグは、このコンテストに応募された作品に自動的に追加されます。
        <strong>1つのタグのみ設定可能</strong>です。コンテストの特徴を表す代表的なタグを設定してください。
      </StyledAlert>

      <StyledPaper elevation={0}>
        {/* タグ入力フィールド */}
        {!isTagSet && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, gap: 1 }}>
            <StyledTextField
              fullWidth
              variant="outlined"
              label="コンテストタグを追加"
              value={newContestTag}
              onChange={(e) => setNewContestTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="例: 夏の短編コンテスト、SF小説、創作コンテスト"
              inputProps={{ maxLength: 50 }}
              helperText={
                <span style={{ color: getCharacterCountColor() }}>
                  {newContestTag.length}/50文字
                </span>
              }
            />
            <AddButton
              onClick={handleAddContestTag}
              disabled={!newContestTag.trim() || isTagSet}
              size="large"
            >
              <AddIcon />
            </AddButton>
          </Box>
        )}

        {/* 設定済みタグ表示 */}
        {isTagSet && (
          <Box>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              sx={{ mb: 2, fontWeight: 500 }}
            >
              設定済みコンテストタグ:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <StyledChip
                label={contestTags[0]}
                onDelete={handleRemoveContestTag}
                deleteIcon={<DeleteIcon />}
                variant="filled"
                size="large"
              />
            </Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontStyle: 'italic',
                padding: theme.spacing(1),
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.info.main, 0.05)
                  : alpha(theme.palette.info.main, 0.03),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
              }}
            >
              タグを変更したい場合は、現在のタグを削除してから新しいタグを追加してください。
            </Typography>
          </Box>
        )}

        {/* タグが設定されていない場合の表示 */}
        {!isTagSet && (
          <EmptyState>
            <LabelIcon />
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              コンテストタグを追加してください
            </Typography>
            <Typography variant="body2" color="text.disabled">
              応募作品に自動追加される代表的なタグを1つ設定できます
            </Typography>
          </EmptyState>
        )}
      </StyledPaper>

      <StyledAlert severity="warning">
        <Typography variant="body2">
          <strong>注意:</strong> コンテスト開始後はタグの変更はできません。
          応募作品に追加するタグは慎重に選択してください。
        </Typography>
      </StyledAlert>
    </Box>
  );
};

export default ContestTagSection;