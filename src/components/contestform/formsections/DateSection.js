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
  Chip
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
  const charactersLeft = 30 - (value?.length || 0);
  const isCalendarType = type === 'calendar';

  return (
    <Grid item xs={12} md={6}>
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {label}
          </Typography>
          {isRequired && (
            <Chip 
              label="必須" 
              size="small" 
              color="error" 
              variant="outlined" 
              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
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
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <HelpOutlineIcon fontSize="small" color="action" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <FormControl 
          fullWidth 
          variant="outlined"
          sx={{ mb: 1.5 }}
        >
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            displayEmpty
            size="small"
            startAdornment={
              isCalendarType ? 
                <EventIcon color="primary" sx={{ mr: 1 }} /> : 
                <EditIcon color="primary" sx={{ mr: 1 }} />
            }
            sx={{
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              '&.Mui-focused': {
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
              }
            }}
          >
            <MenuItem value="calendar">カレンダーから選択</MenuItem>
            <MenuItem value="text">自由入力</MenuItem>
          </Select>
        </FormControl>

        <Fade in={true}>
          {isCalendarType ? (
            <TextField
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              error={isRequired && !value}
              helperText={isRequired && !value ? `${label}は必須です` : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  '&:hover fieldset': {
                    borderColor: theme => theme.palette.primary.light,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme => theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                }
              }}
              InputProps={{
                endAdornment: value ? (
                  <InputAdornment position="end">
                    <CheckCircleIcon color="success" fontSize="small" />
                  </InputAdornment>
                ) : null
              }}
            />
          ) : (
            <Box>
              <TextField
                fullWidth
                placeholder="例: 1月中旬 / 春頃 / 2025年3月予定"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                inputProps={{ maxLength: 30 }}
                error={isRequired && !value}
                helperText={isRequired && !value ? `${label}は必須です` : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    '&:hover fieldset': {
                      borderColor: theme => theme.palette.primary.light,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme => theme.palette.primary.main,
                      borderWidth: '2px',
                    },
                  }
                }}
                InputProps={{
                  endAdornment: value ? (
                    <InputAdornment position="end">
                      <CheckCircleIcon color="success" fontSize="small" />
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
                    color: charactersLeft <= 5 ? 'error.main' : 'text.secondary',
                    fontWeight: charactersLeft <= 5 ? 600 : 400
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
        <Typography variant="h5" sx={{ 
          color: 'text.primary',
          fontWeight: 700,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-8px',
            left: 0,
            width: '60px',
            height: '4px',
            backgroundColor: theme => theme.palette.primary.main,
            borderRadius: '2px'
          }
        }}>
          日程設定
        </Typography>
        <Tooltip title="コンテストの各段階の日程を設定します。応募開始日と応募終了日は必須項目です。" arrow>
          <IconButton size="small" sx={{ ml: 1 }}>
            <HelpOutlineIcon fontSize="small" color="action" />
          </IconButton>
        </Tooltip>
      </Box>

      {hasErrors && (
        <Fade in={hasErrors}>
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              '& .MuiAlert-message': {
                fontWeight: 500
              }
            }}
          >
            応募開始日と応募終了日は必須項目です
          </Alert>
        </Fade>
      )}

      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 4, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          backgroundColor: '#fff',
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: theme => `${theme.palette.primary.main}15`,
              color: 'primary.main',
              py: 0.5,
              px: 1.5,
              borderRadius: '6px'
            }}
          >
            必須の日程
          </Typography>
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

        <Divider sx={{ 
          my: 3,
          borderStyle: 'dashed'
        }} />

        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              color: 'text.secondary',
              py: 0.5,
              px: 1.5,
              borderRadius: '6px'
            }}
          >
            任意の日程
          </Typography>
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
      </Paper>
    </>
  );
});

export default DateSection;