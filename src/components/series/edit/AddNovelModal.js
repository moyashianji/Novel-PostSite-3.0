import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Modal, 
  Card, 
  CardContent, 
  Button, 
  IconButton,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Fade,
  Grid,
  Paper,
  useTheme,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Close as CloseIcon, 
  BookmarkAdd as BookmarkAddIcon,
  Search as SearchIcon,
  BookmarkAdded as BookmarkAddedIcon,
  Menu as MenuIcon,
  BookOutlined as BookOutlinedIcon
} from '@mui/icons-material';

// スタイル付きコンポーネント
const ModalContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '800px',
  maxHeight: '85vh',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ModalContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  overflowY: 'auto',
  flexGrow: 1,
}));

const NovelCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
    transform: 'translateY(-2px)',
  }
}));

const NovelCardContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2.5),
  '&:last-child': {
    paddingBottom: theme.spacing(2.5),
  }
}));

const NovelTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const NovelDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const NovelActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(1),
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
}));

const AddNovelModal = ({ open, handleClose, seriesId }) => {
  const [novels, setNovels] = useState([]);
  const [addedNovelIds, setAddedNovelIds] = useState(new Set());
  const [filteredNovels, setFilteredNovels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingNovel, setAddingNovel] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const theme = useTheme();

  useEffect(() => {
    // 検索クエリでフィルタリング
    if (searchQuery.trim() === '') {
      setFilteredNovels(novels);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = novels.filter(novel => 
        novel.title.toLowerCase().includes(lowercasedQuery) || 
        novel.description.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredNovels(filtered);
    }
  }, [searchQuery, novels]);

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      
      setLoading(true);
      setError(null);
      
      try {
        await fetchNovels();
        await fetchSeries();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('データの取得中にエラーが発生しました。もう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, seriesId]);

  const fetchNovels = async () => {
    console.log('Fetching novels for the user...');
    const token = localStorage.getItem('token');
    
    const response = await fetch(`/api/users/me/novels`, {
      credentials: 'include',  // 認証情報を含めてリクエスト

    });
    
    if (!response.ok) {
      console.error('Failed to fetch novels. Status:', response.status);
      throw new Error('小説の取得に失敗しました');
    }
    
    const data = await response.json();
    console.log('Fetched novels:', data);
    setNovels(data);
    setFilteredNovels(data);
  };

  const fetchSeries = async () => {
    console.log('Fetching series details for seriesId:', seriesId);
    const token = localStorage.getItem('token');
    
    const response = await fetch(`/api/series/${seriesId}`, {
      credentials: 'include',  // 認証情報を含めてリクエスト

    });
    
    if (!response.ok) {
      console.error('Failed to fetch series details. Status:', response.status);
      throw new Error('シリーズの詳細取得に失敗しました');
    }
    
    const seriesData = await response.json();
    console.log('Fetched series data:', seriesData);

    // postIdが存在するか確認してからIDを取得
    const novelIds = new Set(
      seriesData.posts
        .map(post => post._id.toString()) // postId._idを文字列に変換して取得
    );
    
    console.log('Extracted novel IDs already in the series:', novelIds);
    setAddedNovelIds(novelIds);
  };

  const handleAddToSeries = async (novelId) => {
    console.log('Attempting to add novel to series. Novel ID:', novelId, 'Series ID:', seriesId);
    setAddingNovel(novelId);
    setError(null);
    
    try {
      const response = await fetch(`/api/series/${seriesId}/addPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // 認証情報を含めてリクエスト

        body: JSON.stringify({ postId: novelId }),
      });

      if (response.ok) {
        console.log('Successfully added novel to series.');
        // 追加されたIDをセットに追加
        setAddedNovelIds(prev => new Set([...prev, novelId.toString()]));
        
        setSuccessMessage('作品がシリーズに追加されました');
        // 3秒後にメッセージを消す
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        const errorResponse = await response.json();
        console.error('Failed to add novel to series:', errorResponse);
        setError(errorResponse.message || '作品の追加に失敗しました');
      }
    } catch (error) {
      console.error('Error adding novel to series:', error);
      setError('作品の追加中にエラーが発生しました');
    } finally {
      setAddingNovel(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      closeAfterTransition
    >
      <Fade in={open}>
        <ModalContainer>
          <ModalHeader>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BookmarkAddIcon sx={{ mr: 1.5 }} />
              <Typography variant="h6" component="h2">
                シリーズに作品を追加
              </Typography>
            </Box>
            <IconButton 
              onClick={handleClose}
              size="small"
              sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </ModalHeader>
          
          <ModalContent>
            {/* 検索ボックス */}
            <SearchContainer>
              <TextField
                fullWidth
                placeholder="作品を検索..."
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: theme.shape.borderRadius * 1.5 }
                }}
              />
            </SearchContainer>

            {/* エラーメッセージ */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* 成功メッセージ */}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            {/* ローディング */}
            {loading ? (
              <LoadingContainer>
                <CircularProgress size={40} />
              </LoadingContainer>
            ) : filteredNovels.length > 0 ? (
              <Grid container spacing={2}>
                {filteredNovels.map((novel) => {
                  const isAlreadyAdded = addedNovelIds.has(novel._id.toString());
                  const isCurrentlyAdding = addingNovel === novel._id;
                  
                  return (
                    <Grid item xs={12} key={novel._id}>
                      <NovelCard>
                        <NovelCardContent>
                          <NovelTitle variant="h6">
                            <IconWrapper>
                              <BookOutlinedIcon color="primary" fontSize="small" />
                            </IconWrapper>
                            {novel.title}
                          </NovelTitle>
                          
                          <NovelDescription variant="body2">
                            {novel.description?.length > 150 
                              ? `${novel.description.substring(0, 150)}...` 
                              : novel.description}
                          </NovelDescription>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                            {novel.tags?.map((tag, index) => (
                              <Chip 
                                key={index} 
                                label={tag} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                sx={{ borderRadius: '4px' }}
                              />
                            ))}
                          </Box>
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          <NovelActions>
                            <Box>
                              <Chip 
                                label={`${novel.charCount || 0} 文字`} 
                                size="small" 
                                color="default"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem', mr: 1 }}
                              />
                              {novel.adultContent ? (
                                <Chip 
                                  label="R18" 
                                  size="small" 
                                  color="error"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              ) : (
                                <Chip 
                                  label="全年齢" 
                                  size="small" 
                                  color="success"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              )}
                            </Box>
                            
                            <Tooltip title={isAlreadyAdded ? "すでに追加されています" : "シリーズに追加"}>
                              <span>
                                <Button
                                  variant={isAlreadyAdded ? "outlined" : "contained"}
                                  color={isAlreadyAdded ? "secondary" : "primary"}
                                  onClick={() => !isAlreadyAdded && handleAddToSeries(novel._id)}
                                  disabled={isAlreadyAdded || isCurrentlyAdding}
                                  startIcon={isAlreadyAdded ? <BookmarkAddedIcon /> : <BookmarkAddIcon />}
                                  size="medium"
                                  sx={{ 
                                    borderRadius: theme.shape.borderRadius * 1.5,
                                    minWidth: '140px'
                                  }}
                                >
                                  {isCurrentlyAdding ? (
                                    <>
                                      <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                                      追加中...
                                    </>
                                  ) : isAlreadyAdded ? (
                                    '追加済み'
                                  ) : (
                                    '追加する'
                                  )}
                                </Button>
                              </span>
                            </Tooltip>
                          </NovelActions>
                        </NovelCardContent>
                      </NovelCard>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <EmptyState>
                <BookOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  作品が見つかりません
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery.trim() !== '' 
                    ? '検索条件に一致する作品がありませんでした。検索語を変更してお試しください。' 
                    : '追加できる作品がありません。新しい作品を作成してください。'}
                </Typography>
              </EmptyState>
            )}
          </ModalContent>
          
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button 
              onClick={handleClose} 
              variant="outlined" 
              fullWidth
              sx={{ borderRadius: theme.shape.borderRadius * 1.5 }}
            >
              閉じる
            </Button>
          </Box>
        </ModalContainer>
      </Fade>
    </Modal>
  );
};

export default AddNovelModal;