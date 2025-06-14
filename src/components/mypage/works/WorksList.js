// src/components/mypage/works/WorksList.js
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Divider,
  Collapse,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Toolbar,
  Slide,
  Alert,
  FormControlLabel,
  Fade,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../post/PostCard';
import DescriptionIcon from '@mui/icons-material/Description';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import EditIcon from '@mui/icons-material/Edit';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarIcon from '@mui/icons-material/Star';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CommentIcon from '@mui/icons-material/Comment';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CancelIcon from '@mui/icons-material/Cancel';
import WorkAnalytics from '../analytics/WorkAnalytics';

const WorksList = ({ works = [], onWorkUpdate }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedWorkForAnalytics, setSelectedWorkForAnalytics] = useState(null);
  
  // 一括操作の状態
  const [selectedWorks, setSelectedWorks] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkControls, setShowBulkControls] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '', count: 0 });
  const [loading, setLoading] = useState(false);

  // 新しい作品投稿へのナビゲーション
  const handleNewPost = () => {
    navigate('/new-post');
  };

  // 編集ページへのナビゲーション
  const handleEditClick = (workId, e) => {
    e.stopPropagation();
    navigate(`/mypage/novel/${workId}/edit`);
  };

  // 作品詳細ページへのナビゲーション
  const handleViewClick = (workId, e) => {
    e.stopPropagation();
    navigate(`/novel/${workId}`);
  };

  // アナリティクス表示
  const handleAnalyticsClick = (workId, e) => {
    e.stopPropagation();
    if (selectedWorkForAnalytics === workId) {
      setSelectedWorkForAnalytics(null);
    } else {
      setSelectedWorkForAnalytics(workId);
    }
  };

  // アナリティクスを閉じる
  const handleCloseAnalytics = () => {
    setSelectedWorkForAnalytics(null);
  };

  // 全選択・全解除
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedWorks(new Set(works.map(work => work._id)));
      setShowBulkControls(true);
    } else {
      setSelectedWorks(new Set());
      setShowBulkControls(false);
      setBulkAction('');
    }
  }, [works]);

  // 個別選択
  const handleSelectWork = useCallback((workId, checked) => {
    const newSelected = new Set(selectedWorks);
    if (checked) {
      newSelected.add(workId);
    } else {
      newSelected.delete(workId);
    }
    setSelectedWorks(newSelected);
    setShowBulkControls(newSelected.size > 0);
    
    if (newSelected.size === 0) {
      setBulkAction('');
    }
  }, [selectedWorks]);

  // 一括操作の実行
  const handleBulkAction = useCallback(async () => {
    if (!bulkAction || selectedWorks.size === 0) return;

    if (bulkAction === 'delete') {
      setConfirmDialog({
        open: true,
        action: 'delete',
        count: selectedWorks.size
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/posts/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postIds: Array.from(selectedWorks),
          action: bulkAction
        })
      });

      if (response.ok) {
        setSelectedWorks(new Set());
        setBulkAction('');
        setShowBulkControls(false);
        onWorkUpdate?.();
      } else {
        console.error('一括操作に失敗しました');
      }
    } catch (error) {
      console.error('一括操作エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [bulkAction, selectedWorks, onWorkUpdate]);

  // 削除確認の実行
  const handleConfirmDelete = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/posts/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postIds: Array.from(selectedWorks)
        })
      });

      if (response.ok) {
        setSelectedWorks(new Set());
        setBulkAction('');
        setShowBulkControls(false);
        setConfirmDialog({ open: false, action: '', count: 0 });
        onWorkUpdate?.();
      } else {
        console.error('削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedWorks, onWorkUpdate]);

  // ポイントを計算する関数
  const calculatePoints = (work) => {
    return (work.goodCounter || 0) * 2 + (work.bookShelfCounter || 0) * 2;
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // コメント数を取得する関数
  const getCommentCount = (work) => {
    return work.comments?.length || 0;
  };

  // 公開状態のラベルとカラーを取得
const getPublicityStatus = (work) => {
  switch (work.publicityStatus) {
    case 'private':
      return { label: '非公開', color: 'error' };
    case 'limited':
      return { label: '限定公開', color: 'warning' };
    case 'public':
    default:
      return { label: '公開', color: 'success' };
  }
};
  const allSelected = works.length > 0 && selectedWorks.size === works.length;
  const indeterminate = selectedWorks.size > 0 && selectedWorks.size < works.length;

  // 作品がない場合の表示
  if (works.length === 0) {
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
        <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>作品がありません</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          あなたの創作小説を投稿して、読者と共有しましょう。
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleNewPost}
          startIcon={<LibraryAddIcon />}
          sx={{ borderRadius: 6, px: 3 }}
        >
          新しい作品を投稿
        </Button>
      </Paper>
    );
  }

  // 作品を行ごとにグループ化する関数
  const groupWorksByRow = (works, itemsPerRow) => {
    const rows = [];
    for (let i = 0; i < works.length; i += itemsPerRow) {
      rows.push(works.slice(i, i + itemsPerRow));
    }
    return rows;
  };

  const itemsPerRow = 3;
  const workRows = groupWorksByRow(works, itemsPerRow);

  return (
    <Box sx={{ width: '100%' }}>
      {/* 一括操作コントロール */}
      <Slide direction="down" in={showBulkControls} mountOnEnter unmountOnExit>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <Toolbar sx={{ minHeight: 'auto !important', px: 0, gap: 2 }}>
            <Chip 
              icon={<CheckBoxIcon />}
              label={`${selectedWorks.size}件選択中`}
              color="secondary"
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
            
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                displayEmpty
                sx={{ 
                  bgcolor: 'white', 
                  borderRadius: 1,
                  '& .MuiSelect-select': { py: 1 }
                }}
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
              sx={{ 
                borderRadius: 2,
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              実行
            </Button>

            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => {
                setSelectedWorks(new Set());
                setShowBulkControls(false);
                setBulkAction('');
              }}
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              キャンセル
            </Button>
          </Toolbar>
        </Paper>
      </Slide>

      {/* 全選択チェックボックス */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }} elevation={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                indeterminate={indeterminate}
                onChange={(e) => handleSelectAll(e.target.checked)}
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
              />
            }
            label={
              <Typography variant="body2" fontWeight="medium">
                すべて選択 ({works.length}件)
              </Typography>
            }
          />
          
          {selectedWorks.size > 0 && (
            <Typography variant="body2" color="primary" fontWeight="bold">
              {selectedWorks.size}件選択中
            </Typography>
          )}
        </Box>
      </Paper>

      {workRows.map((row, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {/* アナリティクスを行の前に表示 */}
          {row.some(work => selectedWorkForAnalytics === work._id) && (
            <Box sx={{ mb: 3, mt: rowIndex > 0 ? 3 : 0 }}>
              <Collapse in={true} timeout={300}>
                <WorkAnalytics 
                  postId={selectedWorkForAnalytics}
                  onClose={handleCloseAnalytics}
                />
              </Collapse>
            </Box>
          )}

          {/* 作品カードの行 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {row.map((work) => {
              const isSelected = selectedWorks.has(work._id);
              const publicityStatus = getPublicityStatus(work);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={work._id}>
                  <Box sx={{ position: 'relative' }}>
                    {/* 選択チェックボックス */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      left: 8, 
                      zIndex: 3,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      borderRadius: 1,
                      p: 0.5
                    }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectWork(work._id, e.target.checked)}
                        size="small"
                        sx={{ 
                          p: 0.5,
                          '& .MuiSvgIcon-root': { fontSize: 18 }
                        }}
                      />
                    </Box>

                    {/* 公開状態インジケーター */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      zIndex: 3
                    }}>
                      <Chip 
                        label={publicityStatus.label} 
                        size="small" 
                        color={publicityStatus.color}
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>

                    {/* 作品統計情報カード */}
                    <Paper
                      elevation={isSelected ? 4 : 2}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                        boxShadow: isSelected 
                          ? '0 4px 12px rgba(25, 118, 210, 0.2)' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        position: 'relative',
                        zIndex: 2,
                        border: isSelected ? '2px solid' : '1px solid transparent',
                        borderColor: isSelected ? 'primary.main' : 'transparent',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {/* PostCardコンポーネント */}
                      <Box sx={{ mt: 2 }}>
                        <PostCard post={work} />
                      </Box>

                      {/* 基本情報 */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} mt={1}>
                        <Box display="flex" alignItems="center">
                          <AccessTimeIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 16 }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(work.createdAt)}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      {/* 統計情報 */}
                      <Grid container spacing={1}>
                        <Grid item xs={3}>
                          <Tooltip title="閲覧数">
                            <Box display="flex" flexDirection="column" alignItems="center">
                              <VisibilityIcon sx={{ color: '#607d8b', fontSize: 18 }} />
                              <Typography variant="body2" fontWeight="medium">
                                {work.viewCounter?.toLocaleString() || 0}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Grid>
                        
                        <Grid item xs={3}>
                          <Tooltip title="いいね数">
                            <Box display="flex" flexDirection="column" alignItems="center">
                              <FavoriteIcon sx={{ color: '#e91e63', fontSize: 18 }} />
                              <Typography variant="body2" fontWeight="medium">
                                {work.goodCounter?.toLocaleString() || 0}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Grid>
                        
                        <Grid item xs={3}>
                          <Tooltip title="本棚追加数">
                            <Box display="flex" flexDirection="column" alignItems="center">
                              <BookmarkIcon sx={{ color: '#ff9800', fontSize: 18 }} />
                              <Typography variant="body2" fontWeight="medium">
                                {work.bookShelfCounter?.toLocaleString() || 0}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Grid>
                        
                        <Grid item xs={3}>
                          <Tooltip title="コメント数">
                            <Box display="flex" flexDirection="column" alignItems="center">
                              <CommentIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                              <Typography variant="body2" fontWeight="medium">
                                {getCommentCount(work)}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* アクションボタン（オーバーレイ） */}
                    <Box sx={{ 
                      position: 'absolute',
                      top: 60,
                      right: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      zIndex: 10,
                    }}>
                      {/* 編集ボタン */}
                      <Tooltip title="作品を編集">
                        <IconButton
                          aria-label="edit"
                          onClick={(e) => handleEditClick(work._id, e)}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <EditIcon color="primary" />
                        </IconButton>
                      </Tooltip>

                      {/* アナリティクスボタン */}
                      <Tooltip title="アナリティクスを表示">
                        <IconButton
                          aria-label="analytics"
                          onClick={(e) => handleAnalyticsClick(work._id, e)}
                          sx={{
                            backgroundColor: selectedWorkForAnalytics === work._id 
                              ? 'rgba(33, 150, 243, 0.9)' 
                              : 'rgba(255, 255, 255, 0.9)',
                            color: selectedWorkForAnalytics === work._id ? 'white' : 'secondary.main',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            '&:hover': {
                              backgroundColor: selectedWorkForAnalytics === work._id 
                                ? 'rgba(33, 150, 243, 1)' 
                                : 'rgba(255, 255, 255, 1)',
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <AnalyticsIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* アクションボタンエリア */}
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      sx={{ mt: 1 }}
                    >
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<EditIcon />}
                        onClick={(e) => handleEditClick(work._id, e)}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}
                      >
                        編集
                      </Button>
                      
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<AnalyticsIcon />}
                        onClick={(e) => handleAnalyticsClick(work._id, e)}
                        color={selectedWorkForAnalytics === work._id ? 'primary' : 'secondary'}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}
                      >
                        分析
                      </Button>
                    </Stack>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </React.Fragment>
      ))}
      
      {/* 新規作品追加ボタン */}
      <Box textAlign="center" mt={4}>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<LibraryAddIcon />}
          onClick={handleNewPost}
          sx={{ 
            borderRadius: 6, 
            px: 3, 
            py: 1.2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.2s ease'
          }}
        >
          新しい作品を投稿
        </Button>
      </Box>

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
            作品の削除確認
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              本当に{confirmDialog.count}件の作品を削除しますか？
            </Typography>
            <Typography variant="body2">
              削除した作品は復旧できません。<br />
              関連する閲覧分析データも同時に削除されます。
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

export default WorksList;