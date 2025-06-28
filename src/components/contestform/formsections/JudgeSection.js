import React from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  FormControlLabel, 
  Checkbox, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper, 
  Avatar, 
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Chip,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

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

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.default, 0.3)
    : alpha(theme.palette.primary.main, 0.02),
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.1)
      : alpha(theme.palette.primary.main, 0.05),
    transform: 'translateX(4px)',
  },
  '& .MuiFormControlLabel-label': {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.default, 0.5)
      : alpha(theme.palette.background.paper, 0.8),
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: theme.palette.divider,
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
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
  '& .MuiFormHelperText-root': {
    fontSize: '0.875rem',
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  height: '56px',
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 20px rgba(0, 0, 0, 0.4)'
      : '0 6px 20px rgba(0, 0, 0, 0.2)',
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabled,
    color: theme.palette.action.disabledBackground,
    transform: 'none',
    boxShadow: 'none',
  },
}));

const JudgeCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 20px rgba(0, 0, 0, 0.3)'
      : '0 4px 20px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  marginRight: theme.spacing(2),
  border: `2px solid ${theme.palette.mode === 'dark' 
    ? theme.palette.divider 
    : alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.2s ease',
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  color: theme.palette.error.main,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    transform: 'scale(1.1)',
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

const StyledAlert = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(2),
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
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  borderColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.divider, 0.8)
    : theme.palette.divider,
}));

const CountChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  fontWeight: 600,
  marginLeft: theme.spacing(1),
}));

/**
 * 審査員入力フォーム
 */
const JudgeInput = React.memo(({
  judgeId,
  setJudgeId,
  isValidObjectId,
  handleAddJudge,
  loadingJudge
}) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="subtitle1" 
        fontWeight={600} 
        sx={{ 
          mb: 2, 
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <PersonAddIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        審査員を追加
      </Typography>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} sm={8}>
          <StyledTextField
            label="審査員アカウントID"
            variant="outlined"
            fullWidth
            value={judgeId}
            onChange={(e) => setJudgeId(e.target.value)}
            error={judgeId && !isValidObjectId(judgeId)}
            helperText={judgeId && !isValidObjectId(judgeId) ? '無効なID形式です' : ''}
            placeholder="例: 507f1f77bcf86cd799439011"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <AddButton
            variant="contained"
            onClick={handleAddJudge}
            startIcon={loadingJudge ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
            fullWidth
            disabled={loadingJudge || !judgeId || (judgeId && !isValidObjectId(judgeId))}
          >
            {loadingJudge ? '検索中...' : '審査員を追加'}
          </AddButton>
        </Grid>
      </Grid>
    </Box>
  );
});

/**
 * 審査員リスト
 */
const JudgeList = React.memo(({ judges, handleRemoveJudge }) => {
  const theme = useTheme();
  
  if (judges.length === 0) {
    return (
      <StyledAlert severity="info">
        審査員が登録されていません。審査員を追加すると、ここに表示されます。
      </StyledAlert>
    );
  }

  return (
    <Box mt={2}>
      <Typography 
        variant="subtitle1" 
        fontWeight={600} 
        sx={{ 
          mb: 2, 
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <GroupIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        登録済みの審査員
        <CountChip label={judges.length} size="small" />
      </Typography>
      <Grid container spacing={2}>
        {judges.map((judge, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <JudgeCard variant="outlined">
              <StyledAvatar 
                src={judge.avatar} 
                alt={judge.name}
              >
                {!judge.avatar && <PersonIcon />}
              </StyledAvatar>
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography 
                  variant="subtitle2" 
                  noWrap
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {judge.name}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  noWrap
                  sx={{ fontSize: '0.75rem' }}
                >
                  ID: {judge.id}
                </Typography>
              </Box>
              <DeleteButton 
                onClick={() => handleRemoveJudge(index)} 
                size="small"
              >
                <DeleteIcon />
              </DeleteButton>
            </JudgeCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

/**
 * 審査員設定セクション
 */
const JudgeSection = React.memo(({
  enableJudges,
  setEnableJudges,
  judgeId,
  setJudgeId,
  isValidObjectId,
  handleAddJudge,
  loadingJudge,
  judges,
  handleRemoveJudge
}) => {
  const theme = useTheme();
  
  return (
    <>
      <SectionTitle variant="h5">
        <AdminPanelSettingsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        審査員設定
      </SectionTitle>

      <StyledPaper elevation={0}>
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <StyledFormControlLabel
            control={
              <StyledCheckbox
                checked={enableJudges}
                onChange={(e) => setEnableJudges(e.target.checked)}
              />
            }
            label="審査員リストを指定する"
          />
          <Tooltip 
            title="指定した審査員のみがこのコンテストの作品を評価できます。審査員はシステムに登録されているユーザーである必要があります。" 
            arrow
            placement="top"
          >
            <HelpIconButton size="small">
              <HelpOutlineIcon fontSize="small" />
            </HelpIconButton>
          </Tooltip>
        </Box>

        {enableJudges && (
          <>
            <StyledDivider />
            <JudgeInput
              judgeId={judgeId}
              setJudgeId={setJudgeId}
              isValidObjectId={isValidObjectId}
              handleAddJudge={handleAddJudge}
              loadingJudge={loadingJudge}
            />
            <JudgeList 
              judges={judges} 
              handleRemoveJudge={handleRemoveJudge} 
            />
          </>
        )}
      </StyledPaper>
    </>
  );
});

JudgeInput.displayName = 'JudgeInput';
JudgeList.displayName = 'JudgeList';
JudgeSection.displayName = 'JudgeSection';

export default JudgeSection;