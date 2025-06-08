import React, { useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  IconButton, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

// アイコン
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// コンポーネント
import PostCard from '../../post/PostCard';

// API呼び出し用のカスタムフック
import { useAPI } from '../../../hooks/useAPI';

// 各履歴アイテムをメモ化したコンポーネント
const ViewHistoryItem = React.memo(({ item, onDelete, formatDate, theme }) => {
  const post = item.post;
  
  const handleDeleteClick = useCallback((e) => {
    e.stopPropagation();
    onDelete(item._id);
  }, [item._id, onDelete]);
  
  if (!post) return null;
  
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Box sx={{ position: 'relative' }}>
        {/* オーバーレイする削除ボタン */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10
          }}
        >
          <Tooltip title="履歴から削除">
            <IconButton
              size="small"
              color="default"
              onClick={handleDeleteClick}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.light, 0.1),
                  color: theme.palette.error.main
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* 閲覧日時表示 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            zIndex: 10,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(4px)',
            borderRadius: 4,
            px: 1,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            boxShadow: 1
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.text.secondary }} />
          <Typography variant="caption" color="text.secondary">
            {formatDate(item.viewedAt)}
          </Typography>
        </Box>
        
        {/* PostCardコンポーネントを使用 */}
        <PostCard post={post} />
      </Box>
    </Grid>
  );
});

ViewHistoryItem.displayName = 'ViewHistoryItem';

const ViewHistoryList = ({ viewHistory: initialViewHistory = { history: [] } }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  
  // 状態管理
  const [viewHistory, setViewHistory] = useState(initialViewHistory.history || []);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 日付フォーマット関数をメモ化
  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ja });
    } catch (e) {
      return '日時不明';
    }
  }, []);
  
  // 単一の履歴項目削除ダイアログを開く
  const openDeleteDialog = useCallback((itemId) => {
    setSelectedItemId(itemId);
    setDeleteDialogOpen(true);
  }, []);
  
  // 履歴クリアダイアログを開く
  const openClearDialog = useCallback(() => {
    setClearDialogOpen(true);
  }, []);
  
  // 単一の履歴項目を削除
  const deleteHistoryItem = useCallback(async () => {
    if (!selectedItemId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/view-history/${selectedItemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        // 状態を更新して、削除された項目を除外
        setViewHistory(prevHistory => 
          prevHistory.filter(item => item._id !== selectedItemId)
        );
      } else {
        console.error('履歴項目の削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  }, [selectedItemId]);
  
  // 履歴をすべてクリア
  const clearAllHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/view-history', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        // 全ての履歴を削除
        setViewHistory([]);
      } else {
        console.error('履歴のクリアに失敗しました');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    } finally {
      setLoading(false);
      setClearDialogOpen(false);
    }
  }, []);

  // 閲覧履歴の項目数をメモ化
  const historyCount = useMemo(() => {
    // 配列性を確認して安全に長さを取得
    return Array.isArray(viewHistory) ? viewHistory.length : 0;
  }, [viewHistory]);
  // 空の履歴の場合の表示
  if (historyCount === 0) {
    return (
      <Paper 
        elevation={0} 
        variant="outlined"
        sx={{ 
          padding: 4, 
          width: '100%', 
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,0.01)',
          borderStyle: 'dashed'
        }}
      >
        <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>閲覧履歴はありません</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          作品を読むと、あなたの閲覧履歴がここに表示されます。後で簡単に続きを読むことができます。
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/search')}
          startIcon={<MenuBookIcon />}
          sx={{ borderRadius: 6, px: 3 }}
        >
          作品を探す
        </Button>
      </Paper>
    );
  }
  // マッピング部分も必ず配列であることを確認
  {Array.isArray(viewHistory) && viewHistory.map((item) => (
    <ViewHistoryItem 
      key={item._id} 
      item={item} 
      onDelete={openDeleteDialog} 
      formatDate={formatDate} 
      theme={theme} 
    />
  ))}
  return (
    <Box sx={{ width: '100%' }}>
      {/* 上部のアクションボタン */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1 }} /> 閲覧履歴
          <Chip 
            label={`${historyCount}件`} 
            size="small" 
            sx={{ ml: 1 }}
            color="primary"
          />
        </Typography>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteSweepIcon />}
          onClick={openClearDialog}
          size="small"
        >
          履歴をクリア
        </Button>
      </Box>
      
      {/* 履歴リスト - 横3列表示 */}
      <Grid container spacing={2}>
        {viewHistory.map((item) => (
          <ViewHistoryItem 
            key={item._id} 
            item={item} 
            onDelete={openDeleteDialog} 
            formatDate={formatDate} 
            theme={theme} 
          />
        ))}
      </Grid>
      
      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>履歴から削除しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            選択した作品を閲覧履歴から削除します。この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button 
            onClick={deleteHistoryItem} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            削除する
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 履歴クリア確認ダイアログ */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>閲覧履歴をクリアしますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            閲覧履歴をすべて削除します。この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setClearDialogOpen(false)} 
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button 
            onClick={clearAllHistory} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            すべて削除する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(ViewHistoryList);