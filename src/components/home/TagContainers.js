import React from 'react';
import { 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Button, 
  Chip, 
  Stack, 
  Tooltip, 
  Pagination, 
  Skeleton 
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Tag as TagIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import PostCard from '../post/PostCard';
import { Link } from 'react-router-dom';

// テキストフィールドコンポーネント（メモ化）
const MemoizedTextField = React.memo(({ index, value, handleTextChange }) => (
  <TextField
    label="タグを入力"
    variant="outlined"
    size="small"
    fullWidth
    value={value}
    onChange={(e) => handleTextChange(index, e.target.value)}
    inputProps={{ maxLength: 200 }}
    sx={{
      flexGrow: 1,
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
      }
    }}
  />
));

// 個別のタグコンテナコンポーネント
const TagContainer = React.memo(({ 
  container, 
  index, 
  handleDeleteTagContainer, 
  handleTagSubmit, 
  handleTagPageChange, 
  handleTextChange, 
  text, 
  auth, 
  navigate, 
  loading 
}) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Grid item xs={12} sm={6}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            height: '100%',
            minHeight: 180,
          }}
        >
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
        </Paper>
      </Grid>
    );
  }
  
  return (
    <Grid item xs={12} sm={6}>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          height: '100%',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: 3,
          }
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: auth ? 'background.paper' : alpha(theme.palette.secondary.main, 0.05),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {auth ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MemoizedTextField
                index={index}
                value={text[index] !== undefined ? text[index] : container.tag || ''}
                handleTextChange={handleTextChange}
              />
              <Tooltip title="タグ削除">
                <IconButton 
                  onClick={() => handleDeleteTagContainer(index)}
                  color="error"
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(244, 67, 54, 0.2)',
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button 
                variant="contained" 
                size="small"
                onClick={() => handleTagSubmit(index)}
                sx={{ 
                  borderRadius: 2,
                  minWidth: 64
                }}
              >
                登録
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Chip 
                icon={<TagIcon />}
                label={container.tag || ''}
                color="secondary"
                sx={{ 
                  fontWeight: 'bold',
                  px: 1
                }}
              />
              <Tooltip title="すべての作品を表示">
                <IconButton 
                  color="primary"
                  size="small"
                  onClick={() => navigate(`/search?mustInclude=${encodeURIComponent(container.tag)}`)}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        
        <Box sx={{ p: 2 }}>
          {container.posts && container.posts.length > 0 ? (
            <Box>
              <Stack spacing={2}>
                {container.posts.slice(0, 10).map(post => (
                  <PostCard post={post} key={post._id} compact />
                ))}
              </Stack>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {container.totalPages > 1 && (
                  <Pagination
                    count={container.totalPages}
                    page={container.page}
                    onChange={(e, value) => handleTagPageChange(index, value)}
                    size="small"
                    siblingCount={0}
                  />
                )}
                
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(`/search?mustInclude=${encodeURIComponent(container.tag)}`)}
                  sx={{ 
                    borderRadius: 4,
                    ml: 'auto'
                  }}
                >
                  もっと見る
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              py: 3,
              opacity: 0.7
            }}>
              <BookmarkIcon sx={{ mb: 1, fontSize: 40, opacity: 0.5 }} />
              <Typography variant="body2" color="textSecondary" align="center">
                このタグの作品はまだありません
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Grid>
  );
});

// 新しいタグコンテナを追加するためのコンポーネント
const AddTagContainer = React.memo(({ handleAddTagContainer }) => (
  <Grid item xs={12} sm={6}>
    <Button
      variant="outlined"
      startIcon={<TagIcon />}
      onClick={handleAddTagContainer}
      sx={{
        border: '2px dashed',
        borderColor: 'divider',
        padding: 3,
        width: '100%',
        height: '100%',
        minHeight: 180,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'rgba(25, 118, 210, 0.04)',
        }
      }}
    >
      <Typography variant="h6" color="primary">タグを追加</Typography>
      <Typography variant="body2" color="text.secondary">
        新しいタグを追加して、お気に入りの作品をフォローしましょう
      </Typography>
    </Button>
  </Grid>
));

// メインのタグコンテナコンポーネント
const TagContainers = ({
  tagContainers,
  handleDeleteTagContainer,
  handleTagSubmit,
  handleTagPageChange,
  handleTextChange,
  handleAddTagContainer,
  text,
  auth,
  navigate,
  loading
}) => (
  <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
    <Box 
      sx={{ 
        p: 3, 
        bgcolor: 'secondary.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TagIcon sx={{ mr: 1.5 }} />
        <Typography variant="h5" fontWeight="bold">
          {auth ? 'マイタグフィード' : 'タグフィード'}
        </Typography>
      </Box>
      {auth && (
        <Chip 
          label={`${tagContainers.length}/10`}
          sx={{ 
            bgcolor: 'white', 
            color: 'secondary.main', 
            fontWeight: 'bold' 
          }} 
        />
      )}
    </Box>
    
    <Box sx={{ p: 3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {auth 
          ? 'お気に入りのタグを登録して、関連する作品を簡単にチェックできます。最大10個まで登録できます。' 
          : 'ログインすると、お気に入りのタグを登録して、関連する作品を簡単にチェックできます。'}
      </Typography>
      
      <Grid container spacing={3}>
        {loading ? (
          <>
            {[1, 2].map((_, i) => (
              <TagContainer 
                key={i} 
                loading={true} 
              />
            ))}
          </>
        ) : (
          <>
            {tagContainers.map((container, index) => (
              <TagContainer
                key={index}
                container={container}
                index={index}
                handleDeleteTagContainer={handleDeleteTagContainer}
                handleTagSubmit={handleTagSubmit}
                handleTagPageChange={handleTagPageChange}
                handleTextChange={handleTextChange}
                text={text}
                auth={auth}
                navigate={navigate}
                loading={loading}
              />
            ))}
            {auth && tagContainers.length < 10 && (
              <AddTagContainer handleAddTagContainer={handleAddTagContainer} />
            )}
          </>
        )}
      </Grid>
    </Box>
  </Paper>
);

export default React.memo(TagContainers);