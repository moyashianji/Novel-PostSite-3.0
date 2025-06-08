// src/components/mypage/works/WorksList.js
import React, { useState } from 'react';
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
  Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../post/PostCard';
import DescriptionIcon from '@mui/icons-material/Description';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import EditIcon from '@mui/icons-material/Edit';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarIcon from '@mui/icons-material/Star';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CommentIcon from '@mui/icons-material/Comment';
import WorkAnalytics from '../analytics/WorkAnalytics';

const WorksList = ({ works = [] }) => {
  const navigate = useNavigate();
  const [selectedWorkForAnalytics, setSelectedWorkForAnalytics] = useState(null);

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
    setSelectedWorkForAnalytics(workId);
  };
    // アナリティクスを閉じる
  const handleCloseAnalytics = () => {
    setSelectedWorkForAnalytics(null);
  };
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

  return (
    <Box sx={{ width: '100%' }}>
      {/* アナリティクス表示エリア */}
      <Collapse in={selectedWorkForAnalytics !== null}>
        {selectedWorkForAnalytics && (
          <Box sx={{ mb: 4 }}>
            <WorkAnalytics 
              postId={selectedWorkForAnalytics}
              onClose={handleCloseAnalytics}
            />
          </Box>
        )}
      </Collapse>

      <Grid container spacing={3}>
        {works.map(work => (
          <Grid item xs={12} sm={6} md={4} key={work._id}>
            <Box sx={{ position: 'relative' }}>
              {/* 作品統計情報カード */}
              <Paper
                elevation={2}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* PostCardコンポーネント */}
                <PostCard post={work} />

                {/* 基本情報 */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center">
                    <CommentIcon sx={{ color: 'primary.main', mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" fontWeight="medium">
                      {getCommentCount(work)}件
                    </Typography>
                  </Box>
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
                    <Tooltip title="総合ポイント">
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <StarIcon sx={{ color: '#ffc107', fontSize: 18 }} />
                        <Typography variant="body2" fontWeight="medium">
                          {calculatePoints(work)?.toLocaleString()}
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
        ))}
      </Grid>
      
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
    </Box>
  );
};

export default WorksList;