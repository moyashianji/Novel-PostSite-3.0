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
import { styled, alpha } from '@mui/material/styles';
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

// テーマ対応のスタイルコンポーネント
const EmptyStateContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.default, 0.5)
    : alpha(theme.palette.grey[50], 0.8),
  border: `2px dashed ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.5),
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.05)
      : alpha(theme.palette.primary.main, 0.02),
  }
}));

const BulkControlsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.4)'
    : '0 4px 20px rgba(0, 0, 0, 0.15)',
}));

const SelectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 15px rgba(0, 0, 0, 0.3)'
      : '0 4px 15px rgba(0, 0, 0, 0.1)',
  }
}));

const WorkCardPaper = styled(Paper)(({ theme, isSelected }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(2),
  backgroundColor: isSelected 
    ? theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.1)
      : alpha(theme.palette.primary.main, 0.05)
    : theme.palette.background.paper,
  boxShadow: isSelected 
    ? theme.palette.mode === 'dark'
      ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
      : `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`
    : theme.palette.mode === 'dark'
      ? '0 2px 10px rgba(0, 0, 0, 0.3)'
      : '0 2px 10px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  zIndex: 2,
  border: isSelected 
    ? `2px solid ${theme.palette.primary.main}` 
    : `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 25px rgba(0, 0, 0, 0.4)'
      : '0 8px 25px rgba(0, 0, 0, 0.15)',
  }
}));

const ActionButton = styled(IconButton)(({ theme, isActive }) => ({
  backgroundColor: isActive 
    ? alpha(theme.palette.primary.main, 0.9)
    : alpha(theme.palette.background.paper, 0.95),
  color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: isActive 
      ? theme.palette.primary.main
      : theme.palette.background.paper,
    transform: 'scale(1.1)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 15px rgba(0, 0, 0, 0.4)'
      : '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.1)
      : alpha(theme.palette.grey[100], 0.8),
    transform: 'scale(1.05)',
  },
}));

const NewPostButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.2, 3),
  fontWeight: 600,
  textTransform: 'none',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
    : `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 15px rgba(0, 0, 0, 0.3)'
    : '0 4px 15px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 25px rgba(0, 0, 0, 0.4)'
      : '0 8px 25px rgba(0, 0, 0, 0.2)',
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(45deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
      : `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
  },
}));

const StatusChip = styled(Chip)(({ theme, color }) => {
  const getStatusColors = () => {
    switch (color) {
      case 'success':
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          border: alpha(theme.palette.success.main, 0.3),
        };
      case 'warning':
        return {
          bg: alpha(theme.palette.warning.main, 0.1),
          color: theme.palette.warning.main,
          border: alpha(theme.palette.warning.main, 0.3),
        };
      case 'error':
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          border: alpha(theme.palette.error.main, 0.3),
        };
      default:
        return {
          bg: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          border: alpha(theme.palette.primary.main, 0.3),
        };
    }
  };

  const colors = getStatusColors();
  
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: 600,
    fontSize: '0.7rem',
  };
});

const CheckboxOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 3,
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0.5),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.15)',
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
}));

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
      <EmptyStateContainer elevation={0} variant="outlined">
        <DescriptionIcon 
          sx={{ 
            fontSize: 48, 
            color: 'text.disabled', 
            mb: 2, 
            opacity: 0.6 
          }} 
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          作品がありません
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}
        >
          あなたの創作小説を投稿して、読者と共有しましょう。
        </Typography>
        <NewPostButton startIcon={<LibraryAddIcon />} onClick={handleNewPost}>
          新しい作品を投稿
        </NewPostButton>
      </EmptyStateContainer>
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
        <BulkControlsPaper elevation={3}>
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
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 2px 10px rgba(0, 0, 0, 0.3)'
                  : '0 2px 10px rgba(0, 0, 0, 0.2)',
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
                  bgcolor: alpha(theme.palette.common.white, 0.1)
                }
              }}
            >
              キャンセル
            </Button>
          </Toolbar>
        </BulkControlsPaper>
      </Slide>

      {/* 全選択チェックボックス */}
      <SelectionPaper elevation={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                indeterminate={indeterminate}
                onChange={(e) => handleSelectAll(e.target.checked)}
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                sx={{ 
                  '& .MuiSvgIcon-root': { fontSize: 20 },
                  color: theme.palette.primary.main,
                  '&.Mui-checked': { color: theme.palette.primary.main },
                }}
              />
            }
            label={
              <Typography variant="body2" fontWeight="medium" color="text.primary">
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
      </SelectionPaper>

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
                    <CheckboxOverlay>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectWork(work._id, e.target.checked)}
                        size="small"
                        sx={{ 
                          p: 0.5,
                          '& .MuiSvgIcon-root': { fontSize: 18 },
                          color: theme.palette.primary.main,
                          '&.Mui-checked': { color: theme.palette.primary.main },
                        }}
                      />
                    </CheckboxOverlay>

                    {/* 公開状態インジケーター */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      zIndex: 3
                    }}>
                      <StatusChip 
                        label={publicityStatus.label} 
                        size="small" 
                        color={publicityStatus.color}
                      />
                    </Box>

                    {/* 作品統計情報カード */}
                    <WorkCardPaper elevation={0} isSelected={isSelected}>
                      {/* PostCardコンポーネント */}
                      <Box sx={{ mt: 2 }}>
                        <PostCard post={work} />
                      </Box>

                      {/* 基本情報 */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} mt={1}>
                        <Box display="flex" alignItems="center">
                          <AccessTimeIcon 
                            sx={{ 
                              color: 'text.secondary', 
                              mr: 0.5, 
                              fontSize: 16 
                            }} 
                          />
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
                            <StatBox>
                              <VisibilityIcon 
                                sx={{ 
                                  color: theme.palette.mode === 'dark' ? '#90a4ae' : '#607d8b', 
                                  fontSize: 18 
                                }} 
                              />
                              <Typography variant="body2" fontWeight="medium" color="text.primary">
                                {work.viewCounter?.toLocaleString() || 0}
                              </Typography>
                            </StatBox>
                          </Tooltip>
                        </Grid>
                        
                        <Grid item xs={3}>
                          <Tooltip title="いいね数">
                            <StatBox>
                              <FavoriteIcon 
                                sx={{ 
                                  color: theme.palette.mode === 'dark' ? '#f06292' : '#e91e63', 
                                  fontSize: 18 
                                }} 
                              />
                              <Typography variant="body2" fontWeight="medium" color="text.primary">
                                {work.goodCounter?.toLocaleString() || 0}
                              </Typography>
                            </StatBox>
                          </Tooltip>
                        </Grid>
                        
                        <Grid item xs={3}>
                          <Tooltip title="本棚追加数">
                            <StatBox>
                              <BookmarkIcon 
                                sx={{ 
                                  color: theme.palette.mode === 'dark' ? '#ffb74d' : '#ff9800', 
                                  fontSize: 18 
                                }} 
                              />
                              <Typography variant="body2" fontWeight="medium" color="text.primary">
                                {work.bookShelfCounter?.toLocaleString() || 0}
                              </Typography>
                            </StatBox>
                          </Tooltip>
                        </Grid>
                        
                        <Grid item xs={3}>
                          <Tooltip title="コメント数">
                            <StatBox>
                              <CommentIcon 
                                sx={{ 
                                  color: theme.palette.mode === 'dark' ? '#81c784' : '#4caf50', 
                                  fontSize: 18 
                                }} 
                              />
                              <Typography variant="body2" fontWeight="medium" color="text.primary">
                                {getCommentCount(work)}
                              </Typography>
                            </StatBox>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </WorkCardPaper>

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
                        <ActionButton
                          aria-label="edit"
                          onClick={(e) => handleEditClick(work._id, e)}
                          isActive={false}
                        >
                          <EditIcon color="primary" />
                        </ActionButton>
                      </Tooltip>

                      {/* アナリティクスボタン */}
                      <Tooltip title="アナリティクスを表示">
                        <ActionButton
                          aria-label="analytics"
                          onClick={(e) => handleAnalyticsClick(work._id, e)}
                          isActive={selectedWorkForAnalytics === work._id}
                        >
                          <AnalyticsIcon />
                        </ActionButton>
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
                          fontSize: '0.85rem',
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: theme.palette.primary.main,
                          }
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
                          fontSize: '0.85rem',
                          '&:hover': {
                            backgroundColor: selectedWorkForAnalytics === work._id 
                              ? alpha(theme.palette.primary.main, 0.08)
                              : alpha(theme.palette.secondary.main, 0.08),
                          }
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
        <NewPostButton startIcon={<LibraryAddIcon />} onClick={handleNewPost}>
          新しい作品を投稿
        </NewPostButton>
      </Box>

      {/* 削除確認ダイアログ */}
      <StyledDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: '', count: 0 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            <Typography variant="h6" color="text.primary">
              作品の削除確認
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: 1,
              backgroundColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.error.main, 0.1)
                : alpha(theme.palette.error.main, 0.08),
            }}
          >
            <Typography variant="body1" fontWeight="bold" gutterBottom color="text.primary">
              本当に{confirmDialog.count}件の作品を削除しますか？
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
      </StyledDialog>
    </Box>
  );
};

export default WorksList;