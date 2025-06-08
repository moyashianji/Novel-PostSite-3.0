import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  IconButton, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Paper,
  Divider,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
  LinearProgress,
  Skeleton,
  Grid,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { styled } from '@mui/material/styles';
import { 
  DragIndicator as DragIndicatorIcon, 
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
  Edit as EditIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import AddNovelModal from '../components/series/edit/AddNovelModal';
import SeriesEditSidebar from '../components/series/edit/SeriesEditSidebar';

// Styled components
const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.shadows[3],
}));

const StyledCard = styled(Card)(({ theme, isDragging }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
  cursor: 'move',
  borderRadius: theme.spacing(1.5),
  opacity: isDragging ? 0.5 : 1,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  transition: 'all 0.2s ease-in-out',
  boxShadow: isDragging 
    ? theme.shadows[8] 
    : theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[5],
    transform: 'translateY(-2px)',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(5),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  boxShadow: 'none',
  fontWeight: 'bold',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[2],
    transform: 'translateY(-2px)',
  },
}));

const FloatingFab = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  borderRadius: theme.spacing(4),
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  boxShadow: theme.shadows[5],
  zIndex: 1000,
  fontWeight: 'bold',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-3px)',
  },
}));

const DragHandle = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  },
}));

const EpisodeNumber = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  height: 28,
  marginRight: theme.spacing(2),
}));

const SeriesEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [series, setSeries] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, message: '', type: 'success' });
  const [isSaving, setIsSaving] = useState(false);
  

  
  const fetchSeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/series/${id}`, {
        credentials: 'include',  // 認証情報を含めてリクエスト

      });

      if (response.status === 404) {
        setError('シリーズが見つかりませんでした。');
        navigate('/mypage'); // マイページにリダイレクト
        return;
      }

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      // エピソード番号でソートする
      data.posts.sort((a, b) => a.episodeNumber - b.episodeNumber);

      setSeries(data);
    } catch (error) {
      console.error('Error fetching series details:', error);
      setError('シリーズの読み込み中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      if (!series || !series.posts) return;
      
      const updatedPosts = [...series.posts];
      const [removed] = updatedPosts.splice(dragIndex, 1);
      updatedPosts.splice(hoverIndex, 0, removed);

      setSeries({ ...series, posts: updatedPosts });
      setIsModified(true); // 移動があった場合、保存ボタンを有効化
    },
    [series]
  );

  const handleAddNovelClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    fetchSeries();
    setIsModalOpen(false);
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

// handleDeleteConfirm 関数の修正
const handleDeleteConfirm = async () => {
  if (!postToDelete) {
    console.error('No post selected for deletion');
    return;
  }

  setIsSaving(true); // 削除中の状態を表示

  try {
    const response = await fetch(`/api/series/${id}/removePost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ postId: postToDelete }),
    });

    if (!response.ok) {
      // レスポンスからエラーメッセージを取得
      const errorData = await response.json().catch(() => ({ message: '作品の削除に失敗しました' }));
      throw new Error(errorData.message || '作品の削除に失敗しました');
    }

    // 成功した場合、ローカルの状態を更新
    setSeries(prevSeries => ({
      ...prevSeries,
      posts: prevSeries.posts.filter(post => post._id !== postToDelete),
    }));

    setFeedback({
      open: true,
      message: '作品がシリーズから削除されました',
      type: 'success'
    });

    // サイドバーとの同期のために再フェッチ
    await fetchSeries();
  } catch (error) {
    console.error('Error removing post from series:', error);
    
    setFeedback({
      open: true,
      message: error.message || '作品の削除中にエラーが発生しました',
      type: 'error'
    });
  } finally {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
    setIsSaving(false);
  }
};

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const handleSave = async () => {
    if (!series || !series.posts) return;
    
    setIsSaving(true);
    
    const updatedPosts = series.posts.map((post, index) => ({
      postId: post._id, // postIdをそのまま送る
      episodeNumber: index + 1, // カードが上から何番目にあるかを基に新しいエピソード番号を設定
    }));

    try {
      const response = await fetch(`/api/series/${id}/updatePosts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // 認証情報を含めてリクエスト
        body: JSON.stringify({ posts: updatedPosts }),
      });

      if (response.ok) {
        setIsModified(false);
        await fetchSeries();
        setFeedback({
          open: true,
          message: 'エピソード順が更新されました。',
          type: 'success'
        });
      } else {
        const errorMessage = await response.text();
        console.error('Failed to update posts order:', errorMessage);
        setFeedback({
          open: true,
          message: '更新に失敗しました。',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving updated series:', error);
      setFeedback({
        open: true,
        message: '保存中にエラーが発生しました。',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseFeedback = () => {
    setFeedback({ ...feedback, open: false });
  };

  // Loading skeletons for the card list
  const renderSkeletons = () => (
    <>
      {[1, 2, 3, 4].map((item) => (
        <Card key={item} sx={{ mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
            <Box sx={{ width: '100%' }}>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="90%" height={20} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Skeleton variant="text" width="20%" height={16} />
                <Skeleton variant="text" width="20%" height={16} />
                <Skeleton variant="text" width="20%" height={16} />
              </Box>
            </Box>
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Card>
      ))}
    </>
  );

  // If there's an error, display it
  if (error && !loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/mypage')}
        >
          マイページに戻る
        </Button>
      </Container>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="rectangular" height={100} sx={{ mb: 3, borderRadius: 2 }} />
            <LinearProgress />
            {renderSkeletons()}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              <Fade in={!loading}>
                <Box>
                  <HeaderPaper elevation={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h4" gutterBottom fontWeight="bold">
                        {series.title}
                      </Typography>
                      
                      <Box>
                        <ActionButton
                          variant="contained"
                          color="inherit"
                          startIcon={<ArrowBackIcon />}
                          onClick={() => navigate('/mypage')}
                          sx={{ mr: 1 }}
                        >
                          戻る
                        </ActionButton>
                        
                        <ActionButton
                          variant="contained"
                          color="primary"
                          disabled={!isModified || isSaving}
                          onClick={handleSave}
                          startIcon={<SaveIcon />}
                        >
                          {isSaving ? '保存中...' : '変更を保存'}
                        </ActionButton>
                      </Box>
                    </Box>
                    
                    <Chip 
                      label={`${series.posts?.length || 0} エピソード`} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        mt: 1
                      }} 
                    />
                    
                    {series.description && (
                      <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
                        {series.description}
                      </Typography>
                    )}
                  </HeaderPaper>
                  
                  {isModified && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      エピソードの順序が変更されています。変更を保存するには「変更を保存」ボタンをクリックしてください。
                    </Alert>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      エピソード一覧
                    </Typography>
                    
                    <ActionButton
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddNovelClick}
                    >
                      作品を追加
                    </ActionButton>
                  </Box>
                  
                  {series.posts && series.posts.length > 0 ? (
                    <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', p: 2 }}>
                      {series.posts.map((post, index) => (
                        <CardItem
                          key={post._id}
                          post={post}
                          index={index}
                          moveCard={moveCard}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </Paper>
                  ) : (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: 'divider',
                        bgcolor: 'background.paper'
                      }}
                    >
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        シリーズに作品がありません
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        「作品を追加」ボタンをクリックして、シリーズに作品を追加しましょう。
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddNovelClick}
                      >
                        作品を追加
                      </Button>
                    </Paper>
                  )}
                </Box>
              </Fade>
            </Grid>
            
            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Fade in={!loading}>
                <Box>
                <SeriesEditSidebar 
  series={series} 
  setSeries={(updatedSeriesInfo) => {
    // シリーズ情報の更新
    setSeries(prev => ({
      ...prev,
      ...updatedSeriesInfo,
    }));
    
    // 変更をサーバーで処理後、最新データを再取得して同期を確保
    fetchSeries();
    
    setFeedback({
      open: true,
      message: 'シリーズ情報が更新されました',
      type: 'success'
    });
  }} 
/>                </Box>
              </Fade>
            </Grid>
          </Grid>
        )}
        
        {/* 削除確認ダイアログ */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="error" sx={{ mr: 1 }} />
            作品を削除しますか？
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              本当にシリーズからこの作品を削除しますか？この操作はシリーズからのみ削除され、作品自体は削除されません。
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleDeleteCancel} 
              color="primary"
              variant="outlined"
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error"
              variant="contained"
              startIcon={<DeleteIcon />}
            >
              削除する
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* フィードバックスナックバー */}
        <Snackbar 
          open={feedback.open} 
          autoHideDuration={6000} 
          onClose={handleCloseFeedback}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseFeedback} 
            severity={feedback.type} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {feedback.message}
          </Alert>
        </Snackbar>
        
        {/* 右下に固定された「小説を追加」ボタン (モバイル向け) */}
        {isMobile && (
          <FloatingFab
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddNovelClick}
          >
            作品を追加
          </FloatingFab>
        )}
        
        {/* モーダル表示 */}
        {isModalOpen && (
          <AddNovelModal
            open={isModalOpen}
            handleClose={handleCloseModal}
            seriesId={id}
          />
        )}
      </Container>
    </DndProvider>
  );
};

// Card item component with drag and drop functionality
const CardItem = ({ post, index, moveCard, onDelete }) => {
  const theme = useTheme();
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: 'CARD',
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { type: 'CARD', index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <StyledCard ref={ref} isDragging={isDragging} elevation={isDragging ? 8 : 1}>
      <DragHandle>
        <DragIndicatorIcon />
      </DragHandle>
      
      <StyledCardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EpisodeNumber label={`EP ${index + 1}`} size="small" />
          <Typography variant="subtitle1" fontWeight="bold">
            {post.title}
          </Typography>
        </Box>
        
        {post.description && (
          <Typography variant="body2" color="textSecondary" sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 1
          }}>
            {post.description}
          </Typography>
        )}
        
        <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
          <Tooltip title="閲覧数">
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <VisibilityIcon sx={{ color: theme.palette.text.secondary, fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" color="textSecondary">
                {post.viewCounter || 0}
              </Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title="いいね数">
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <FavoriteIcon sx={{ color: '#e91e63', fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" color="textSecondary">
                {post.goodCounter || 0}
              </Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title="本棚登録数">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BookmarkIcon sx={{ color: theme.palette.primary.main, fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" color="textSecondary">
                {post.bookShelfCounter || 0}
              </Typography>
            </Box>
          </Tooltip>
          
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Tooltip title="作品を編集">
              <IconButton 
                size="small"
                color="primary"
                component="a"
                href={`/mypage/novel/${post._id}/edit`}
                onClick={(e) => e.stopPropagation()}
                sx={{ 
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="シリーズから削除">
              <IconButton 
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(post._id);
                }}
                sx={{ 
                  bgcolor: 'rgba(211, 47, 47, 0.1)',
                  '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.2)' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </StyledCardContent>
    </StyledCard>
  );
};

export default SeriesEditPage;