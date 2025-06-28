import React from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  TextField, 
  FormControl, 
  Select, 
  MenuItem,
  Paper,
  Tooltip,
  IconButton,
  Divider,
  Alert,
  InputAdornment,
  Fade,
  Chip,
  useTheme
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// テーマ対応のスタイルコンポーネント
const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 700,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: 0,
    width: '60px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '2px'
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
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
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

const SectionLabel = styled(Typography)(({ theme, required }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: required 
    ? alpha(theme.palette.primary.main, 0.1) 
    : alpha(theme.palette.text.secondary, 0.08),
  color: required 
    ? theme.palette.primary.main 
    : theme.palette.text.secondary,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(0.75),
  border: `1px solid ${required 
    ? alpha(theme.palette.primary.main, 0.2) 
    : alpha(theme.palette.text.secondary, 0.2)}`,
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.default, 0.5)
      : alpha(theme.palette.primary.main, 0.02),
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
        : alpha(theme.palette.primary.main, 0.05),
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
        boxShadow: theme.palette.mode === 'dark'
          ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
          : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
    },
  },
  '& .MuiSelect-select': {
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
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
  '& .MuiFormHelperText-root': {
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

const RequiredChip = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: '0.7rem',
  marginLeft: theme.spacing(1),
  backgroundColor: alpha(theme.palette.error.main, 0.1),
  color: theme.palette.error.main,
  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  '& .MuiChip-label': {
    fontWeight: 600,
    padding: theme.spacing(0, 0.5),
  },
}));

const HelpIconButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'scale(1.1)',
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  borderStyle: 'dashed',
  borderColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.divider, 0.8)
    : theme.palette.divider,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
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

/**
 * 日付入力コンポーネント
 */
const DateInput = React.memo(({ 
  label, 
  value, 
  setValue, 
  type, 
  setType, 
  isRequired, 
  error,
  helpText
}) => {
  const theme = useTheme();
  const charactersLeft = 30 - (value?.length || 0);
  const isCalendarType = type === 'calendar';

  // 文字数の色を決定
  const getCharacterCountColor = () => {
    if (charactersLeft <= 5) return theme.palette.error.main;
    if (charactersLeft <= 10) return theme.palette.warning.main;
    return theme.palette.text.secondary;
  };

  return (
    <Grid item xs={12} md={6}>
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight={600}
            color="text.primary"
          >
            {label}
          </Typography>
          {isRequired && (
            <RequiredChip 
              label="必須" 
              size="small" 
              variant="outlined" 
            />
          )}
          {helpText && (
            <Tooltip 
              title={helpText} 
              arrow 
              placement="top"
              enterTouchDelay={0}
              leaveTouchDelay={3000}
            >
              <HelpIconButton size="small">
                <HelpOutlineIcon fontSize="small" />
              </HelpIconButton>
            </Tooltip>
          )}
        </Box>

        <StyledFormControl fullWidth variant="outlined">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            displayEmpty
            size="small"
            startAdornment={
              isCalendarType ? 
                <EventIcon sx={{ color: theme.palette.primary.main, mr: 1 }} /> : 
                <EditIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
            }
          >
            <MenuItem value="calendar">カレンダーから選択</MenuItem>
            <MenuItem value="text">自由入力</MenuItem>
          </Select>
        </StyledFormControl>

        <Fade in={true}>
          {isCalendarType ? (
            <StyledTextField
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              error={isRequired && !value}
              helperText={isRequired && !value ? `${label}は必須です` : ''}
              InputProps={{
                endAdornment: value ? (
                  <InputAdornment position="end">
                    <CheckCircleIcon 
                      sx={{ color: theme.palette.success.main }} 
                      fontSize="small" 
                    />
                  </InputAdornment>
                ) : null
              }}
            />
          ) : (
            <Box>
              <StyledTextField
                fullWidth
                placeholder="例: 1月中旬 / 春頃 / 2025年3月予定"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                inputProps={{ maxLength: 30 }}
                error={isRequired && !value}
                helperText={isRequired && !value ? `${label}は必須です` : ''}
                InputProps={{
                  endAdornment: value ? (
                    <InputAdornment position="end">
                      <CheckCircleIcon 
                        sx={{ color: theme.palette.success.main }} 
                        fontSize="small" 
                      />
                    </InputAdornment>
                  ) : null
                }}
              />
              <Box 
                display="flex" 
                justifyContent="flex-end" 
                alignItems="center" 
                sx={{ mt: 0.5 }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: getCharacterCountColor(),
                    fontWeight: charactersLeft <= 5 ? 600 : 400,
                    transition: 'color 0.2s ease',
                  }}
                >
                  残り {charactersLeft} 文字
                </Typography>
              </Box>
            </Box>
          )}
        </Fade>
      </Box>
    </Grid>
  );
});

/**
 * 日程設定セクションコンポーネント
 */
const DateSection = React.memo(({
  applicationStartDate,
  setApplicationStartDate,
  applicationEndDate,
  setApplicationEndDate,
  reviewStartDate,
  setReviewStartDate,
  reviewEndDate,
  setReviewEndDate,
  resultAnnouncementDate,
  setResultAnnouncementDate,
  applicationStartDateType,
  setApplicationStartDateType,
  applicationEndDateType,
  setApplicationEndDateType,
  reviewStartDateType,
  setReviewStartDateType,
  reviewEndDateType,
  setReviewEndDateType,
  resultAnnouncementDateType,
  setResultAnnouncementDateType,
  applicationStartDateError,
  applicationEndDateError
}) => {
  const theme = useTheme();
  const hasErrors = applicationStartDateError || applicationEndDateError;

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          mb: 3
        }}
      >
        <SectionTitle variant="h5">
          日程設定
        </SectionTitle>
        <Tooltip title="コンテストの各段階の日程を設定します。応募開始日と応募終了日は必須項目です。" arrow>
          <HelpIconButton size="small">
            <HelpOutlineIcon fontSize="small" />
          </HelpIconButton>
        </Tooltip>
      </Box>

      {hasErrors && (
        <Fade in={hasErrors}>
          <StyledAlert severity="error" variant="filled">
            応募開始日と応募終了日は必須項目です
          </StyledAlert>
        </Fade>
      )}

      <StyledPaper elevation={0}>
        <Box sx={{ mb: 3 }}>
          <SectionLabel 
            variant="h6" 
            required={true}
          >
            必須の日程
          </SectionLabel>
          <Grid container spacing={3}>
            {/* 応募開始日 */}
            <DateInput
              label="応募開始日"
              value={applicationStartDate}
              setValue={setApplicationStartDate}
              type={applicationStartDateType}
              setType={setApplicationStartDateType}
              isRequired={true}
              error={applicationStartDateError}
              helpText="コンテストへの応募受付を開始する日時です。この日時以降に作品の投稿が可能になります。"
            />
            
            {/* 応募終了日 */}
            <DateInput
              label="応募終了日"
              value={applicationEndDate}
              setValue={setApplicationEndDate}
              type={applicationEndDateType}
              setType={setApplicationEndDateType}
              isRequired={true}
              error={applicationEndDateError}
              helpText="コンテストへの応募受付を終了する日時です。この日時以降は新規の応募ができなくなります。"
            />
          </Grid>
        </Box>

        <StyledDivider />

        <Box>
          <SectionLabel 
            variant="h6" 
            required={false}
          >
            任意の日程
          </SectionLabel>
          <Grid container spacing={3}>
            {/* 審査開始日 */}
            <DateInput
              label="審査開始日"
              value={reviewStartDate}
              setValue={setReviewStartDate}
              type={reviewStartDateType}
              setType={setReviewStartDateType}
              isRequired={false}
              error={false}
              helpText="審査を開始する予定の日時です。応募者への情報提供として表示されます。"
            />
            
            {/* 審査終了日 */}
            <DateInput
              label="審査終了日"
              value={reviewEndDate}
              setValue={setReviewEndDate}
              type={reviewEndDateType}
              setType={setReviewEndDateType}
              isRequired={false}
              error={false}
              helpText="審査を終了する予定の日時です。応募者への情報提供として表示されます。"
            />
            
            {/* 結果発表日 */}
            <DateInput
              label="結果発表日"
              value={resultAnnouncementDate}
              setValue={setResultAnnouncementDate}
              type={resultAnnouncementDateType}
              setType={setResultAnnouncementDateType}
              isRequired={false}
              error={false}
              helpText="コンテストの結果を発表する予定の日時です。応募者への重要な情報となります。"
            />
          </Grid>
        </Box>
      </StyledPaper>
    </>
  );
});

DateInput.displayName = 'DateInput';
DateSection.displayName = 'DateSection';

export default DateSection;