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
  CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';

/**
 * 審査員入力フォーム
 */
const JudgeInput = React.memo(({
  judgeId,
  setJudgeId,
  isValidObjectId,
  handleAddJudge,
  loadingJudge
}) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
      審査員を追加
    </Typography>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={8}>
        <TextField
          label="審査員アカウントID"
          variant="outlined"
          fullWidth
          value={judgeId}
          onChange={(e) => setJudgeId(e.target.value)}
          error={judgeId && !isValidObjectId(judgeId)}
          helperText={judgeId && !isValidObjectId(judgeId) ? '無効なID形式です' : ''}
          placeholder="例: 507f1f77bcf86cd799439011"
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: theme => theme.palette.primary.main,
                borderWidth: '2px',
              },
            }
          }}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddJudge}
          startIcon={loadingJudge ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
          fullWidth
          disabled={loadingJudge || !judgeId || (judgeId && !isValidObjectId(judgeId))}
          sx={{ 
            height: '56px',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          {loadingJudge ? '検索中...' : '審査員を追加'}
        </Button>
      </Grid>
    </Grid>
  </Box>
));

/**
 * 審査員リスト
 */
const JudgeList = React.memo(({ judges, handleRemoveJudge }) => {
  if (judges.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        審査員が登録されていません。審査員を追加すると、ここに表示されます。
      </Alert>
    );
  }

  return (
    <Box mt={2}>
      <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
        登録済みの審査員 ({judges.length})
      </Typography>
      <Grid container spacing={2}>
        {judges.map((judge, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              variant="outlined"
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: theme => theme.palette.primary.light,
                }
              }}
            >
              <Avatar 
                src={judge.avatar} 
                alt={judge.name}
                sx={{ 
                  width: 48, 
                  height: 48, 
                  mr: 2,
                  border: '2px solid #eee'
                }} 
              />
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="subtitle2" noWrap>{judge.name}</Typography>
                <Typography variant="caption" color="textSecondary" noWrap>
                  ID: {judge.id}
                </Typography>
              </Box>
              <IconButton 
                onClick={() => handleRemoveJudge(index)} 
                color="error"
                size="small"
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Card>
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
  return (
    <>
      <Typography variant="h5" sx={{ 
        mb: 3, 
        color: '#333',
        fontWeight: 600,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-8px',
          left: 0,
          width: '40px',
          height: '3px',
          backgroundColor: theme => theme.palette.primary.main,
        }
      }}>
        審査員設定
      </Typography>

      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          border: '1px solid #eee',
          borderRadius: 2,
          backgroundColor: '#fff' 
        }}
      >
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={enableJudges}
                onChange={(e) => setEnableJudges(e.target.checked)}
                sx={{ 
                  color: theme => theme.palette.primary.main,
                  '&.Mui-checked': {
                    color: theme => theme.palette.primary.main,
                  },
                }}
              />
            }
            label={
              <Typography variant="subtitle1" fontWeight={500}>
                審査員リストを指定する
              </Typography>
            }
          />
          <Tooltip title="指定した審査員のみがこのコンテストの作品を評価できます。審査員はシステムに登録されているユーザーである必要があります。" arrow>
            <IconButton size="small" sx={{ ml: 1 }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {enableJudges && (
          <>
            <Divider sx={{ my: 2 }} />
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
      </Paper>
    </>
  );
});

export default JudgeSection;