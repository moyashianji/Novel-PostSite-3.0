

//===== DetailedDescription.js =====
import React from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  Box,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CustomEditor from '../../wysiwyg/CustomEditor';

/**
 * 詳細説明（リッチテキストエディタ）コンポーネント
 */
const DetailedDescription = React.memo(({ description, handleDescriptionChange, error }) => {
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
        詳細説明
        <Typography component="span" color="error" ml={0.5}>※必須</Typography>
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body1" color="textSecondary">
            コンテストの詳細情報を記入してください。
          </Typography>
          <Tooltip title="応募期間、賞金、ルール、審査基準などを詳細に記載すると応募者が集まりやすくなります。" arrow>
            <IconButton size="small" sx={{ ml: 1 }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body2" sx={{ color: '#555' }}>
          （コンテスト概要、募集ジャンル、賞、賞金等、応募資格、応募方法、スケジュール、選考方法、規約など必要な情報を詳細に記載してください）
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          詳細説明は必須項目です
        </Alert>
      )}

      <Paper 
        variant="outlined" 
        sx={{ 
          p: { xs: 1, md: 2 }, 
          backgroundColor: '#fff',
          borderRadius: 2,
          border: error ? '1px solid #f44336' : '1px solid #e0e0e0'
        }}
      >
        <CustomEditor 
          value={description} 
          onChange={handleDescriptionChange} 
        />
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="textSecondary">
          ヒント: 画像やリスト、見出しなどを活用して読みやすく構造化された説明を作成しましょう。
        </Typography>
      </Box>
    </>
  );
});

export default DetailedDescription;