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
  IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
        コンテスト基本情報
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
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={500}>
              コンテストタイトル
            </Typography>
            <Typography component="span" color="error" ml={0.5}>
              ※必須
            </Typography>
            <Tooltip title="コンテストのタイトルは検索結果や一覧に表示されるため、内容を的確に表す魅力的なタイトルにしましょう。" arrow>
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <TextField
            variant="outlined"
            fullWidth
            placeholder="例: 第1回 夏の短編小説コンテスト"
            value={title}
            onChange={handleTitleChange}
            required
            error={errors.title}
            helperText={errors.title ? "タイトルは必須項目です" : ""}
            inputProps={{ maxLength: 50 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: theme => theme.palette.primary.main,
                  borderWidth: '2px',
                },
              },
              transition: 'all 0.3s'
            }}
          />
          <Fade in={true}>
            {characterCountDisplay(title.length, 50)}
          </Fade>
        </Box>

        <Box>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={500}>
              短い概要
            </Typography>
            <Typography component="span" color="error" ml={0.5}>
              ※必須
            </Typography>
            <Tooltip title="コンテストの内容を簡潔に説明する短い文章です。検索結果や一覧ページに表示されます。" arrow>
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <TextField
            variant="outlined"
            fullWidth
            placeholder="例: 夏をテーマにした5000字以内のオリジナル短編小説を募集します"
            value={shortDescription}
            onChange={handleShortDescriptionChange}
            required
            error={errors.shortDescription}
            helperText={errors.shortDescription ? "概要は必須項目です" : ""}
            inputProps={{ maxLength: 50 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: theme => theme.palette.primary.main,
                  borderWidth: '2px',
                },
              }
            }}
          />
          <Fade in={true}>
            {characterCountDisplay(shortDescription.length, 50)}
          </Fade>
        </Box>
      </Paper>
    </>
  );
});

export default BasicInfo;