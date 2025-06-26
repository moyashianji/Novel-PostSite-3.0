import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Paper,
  Typography,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LinkIcon from '@mui/icons-material/Link';
import SeriesCard from '../../series/SeriesCard';
import SeriesStatsCard from '../../series/SeriesStatsCard';

const SeriesList = ({ series = [], onSeriesUpdate }) => {
  const navigate = useNavigate();
  
  // 選択状態管理
  const [selectedSeries, setSelectedSeries] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 削除確認ダイアログ
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: '',
    count: 0
  });

  // 全選択/全解除
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedSeries(new Set(series.map(s => s._id)));
    } else {
      setSelectedSeries(new Set());
    }
  }, [series]);

  // 個別選択
  const handleSelectSeries = useCallback((seriesId, checked) => {
    setSelectedSeries(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(seriesId);
      } else {
        newSet.delete(seriesId);
      }
      return newSet;
    });
  }, []);

  // 一括操作実行
  const handleBulkAction = useCallback(() => {
    if (!bulkAction || selectedSeries.size === 0) return;

    if (bulkAction === 'delete') {
      setConfirmDialog({
        open: true,
        action: 'delete',
        count: selectedSeries.size
      });
    } else {
      // 公開状態変更の場合は確認なしで実行
      handleBulkUpdate();
    }
  }, [bulkAction, selectedSeries.size]);

  // 一括更新処理
  const handleBulkUpdate = useCallback(async () => {
    if (selectedSeries.size === 0) return;

    setLoading(true);
    try {
      const updateData = {};
      if (['public', 'limited', 'private'].includes(bulkAction)) {
        updateData.publicityStatus = bulkAction;
      }

      const response = await fetch('/api/series/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          seriesIds: Array.from(selectedSeries),
          updateData
        }),
      });

      if (response.ok) {
        // 成功した場合、親コンポーネントに更新通知
        if (onSeriesUpdate) {
          onSeriesUpdate();
        }
        setSelectedSeries(new Set());
        setBulkAction('');
      } else {
        console.error('一括更新に失敗しました');
      }
    } catch (error) {
      console.error('一括更新エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSeries, bulkAction, onSeriesUpdate]);

  // 削除確認処理
  const handleConfirmDelete = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/series/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          seriesIds: Array.from(selectedSeries)
        }),
      });

      if (response.ok) {
        // 成功した場合、親コンポーネントに更新通知
        if (onSeriesUpdate) {
          onSeriesUpdate();
        }
        setSelectedSeries(new Set());
        setBulkAction('');
      } else {
        console.error('削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: '', count: 0 });
    }
  }, [selectedSeries, onSeriesUpdate]);

  // 公開状態のラベルとカラーを取得
  const getPublicityStatus = (seriesItem) => {
    switch (seriesItem.publicityStatus) {
      case 'private':
        return { label: '非公開', color: 'error' };
      case 'limited':
        return { label: '限定公開', color: 'warning' };
      case 'public':
      default:
        return { label: '公開', color: 'success' };
    }
  };

  // SeriesCardとSeriesStatsCardに渡すデータを適切に整形
  const prepareSeriesData = (seriesItem) => {
    return {
      _id: seriesItem._id,
      title: seriesItem.title || '無題のシリーズ',
      description: seriesItem.description || '',
      author: seriesItem.author || {},
      tags: seriesItem.tags || [],
      posts: seriesItem.posts || [],
      totalLikes: seriesItem.totalLikes || 0,
      totalBookshelf: seriesItem.totalBookshelf || 0,
      totalViews: seriesItem.totalViews || 0,
      totalPoints: seriesItem.totalPoints || 0,
      createdAt: seriesItem.createdAt,
      publicityStatus: seriesItem.publicityStatus || 'public'
    };
  };

  const handleSeriesClick = (seriesId) => {
    navigate(`/series/${seriesId}/works`);
  };

  const handleEditClick = (seriesId) => {
    navigate(`/mypage/series/${seriesId}/edit`);
  };

  if (series.length === 0) {
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
        <AutoStoriesIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>シリーズがありません</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          シリーズを作成して、関連する小説をまとめてみましょう。読者がシリーズを見つけやすくなります。
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/mypage/series/new')}
          startIcon={<AutoStoriesIcon />}
          sx={{ borderRadius: 6, px: 3 }}
        >
          新しいシリーズを作成
        </Button>
      </Paper>
    );
  }

  const allSelected = series.length > 0 && selectedSeries.size === series.length;
  const indeterminate = selectedSeries.size > 0 && selectedSeries.size < series.length;

  return (
    <Box sx={{ width: '100%' }}>
      {/* 一括操作バー */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Checkbox
            checked={allSelected}
            indeterminate={indeterminate}
            onChange={(e) => handleSelectAll(e.target.checked)}
            sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
          />
          <Typography variant="body2" color="text.secondary">
            {selectedSeries.size > 0 ? `${selectedSeries.size}件選択中` : '全て選択'}
          </Typography>

          {selectedSeries.size > 0 && (
            <>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  displayEmpty
                  sx={{ '& .MuiSelect-select': { py: 1 } }}
                >
                  <MenuItem value="">操作を選択</MenuItem>
                  <MenuItem value="public">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VisibilityIcon fontSize="small" />
                      公開
                    </Box>
                  </MenuItem>
                  <MenuItem value="limited">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinkIcon fontSize="small" />
                      限定公開
                    </Box>
                  </MenuItem>
                  <MenuItem value="private">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VisibilityOffIcon fontSize="small" />
                      非公開
                    </Box>
                  </MenuItem>
                  <MenuItem value="delete">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DeleteIcon fontSize="small" />
                      削除
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="secondary"
                startIcon={<PlayArrowIcon />}
                onClick={handleBulkAction}
                disabled={!bulkAction || loading}
                sx={{ borderRadius: 2, fontWeight: 'bold' }}
              >
                実行
              </Button>

              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setSelectedSeries(new Set());
                  setBulkAction('');
                }}
                sx={{ borderRadius: 2 }}
              >
                選択解除
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* シリーズ一覧 */}
      <Grid container spacing={3}>
        {series.map((seriesItem) => {
          const formattedSeriesData = prepareSeriesData(seriesItem);
          const isSelected = selectedSeries.has(seriesItem._id);
          const publicityStatus = getPublicityStatus(seriesItem);
          
          return (
            <Grid item xs={12} key={seriesItem._id}>
              <Paper 
                elevation={isSelected ? 3 : 1}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  border: isSelected ? '2px solid' : '1px solid transparent',
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => handleSelectSeries(seriesItem._id, e.target.checked)}
                    sx={{ mr: 1, mt: -1 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" component="h3">
                        {seriesItem.title}
                      </Typography>
                      <Chip 
                        label={publicityStatus.label}
                        color={publicityStatus.color}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {seriesItem.description}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <SeriesCard 
                      series={formattedSeriesData} 
                      onClick={() => handleSeriesClick(seriesItem._id)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <SeriesStatsCard 
                      series={formattedSeriesData}
                      onEditClick={() => handleEditClick(seriesItem._id)}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: '', count: 0 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            シリーズの削除確認
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              本当に{confirmDialog.count}件のシリーズを削除しますか？
            </Typography>
            <Typography variant="body2">
              削除したシリーズは復旧できません。<br />
              シリーズに含まれる作品は削除されませんが、シリーズからは除外されます。
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setConfirmDialog({ open: false, action: '', count: 0 })}
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeriesList;