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
  ListItemText
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublishIcon from '@mui/icons-material/Publish';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * フォームのプレビューと送信ボタン
 */
const FormActions = React.memo(({ handlePreview, handleSubmit, loading }) => {
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
        確認と作成
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        コンテスト作成前に、プレビュー機能で内容を確認することをお勧めします。
      </Alert>

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
        <Typography variant="h6" fontWeight={500} sx={{ mb: 3 }}>
          コンテスト作成前のチェックリスト
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="基本情報が正確に入力されていますか？" 
              secondary="タイトルと短い概要は必須項目です"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="詳細な説明文は十分に情報が含まれていますか？" 
              secondary="応募方法、審査基準、賞品などの重要情報を記載しましょう"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="応募期間の設定は適切ですか？" 
              secondary="応募開始日と終了日は必須項目です"
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<VisibilityIcon />}
            onClick={handlePreview}
            fullWidth
            sx={{ 
              py: 1.5,
              fontSize: '1rem',
              mb: 2,
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
              }
            }}
          >
            プレビューで確認する
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <PublishIcon />}
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
            sx={{ 
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 500,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 5,
              }
            }}
          >
            {loading ? 'コンテスト作成中...' : 'コンテストを作成する'}
          </Button>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            作成後もコンテスト情報は編集可能です
          </Typography>
        </Box>
      </Paper>
    </>
  );
});

export default FormActions;