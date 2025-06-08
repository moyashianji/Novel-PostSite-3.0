import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Chip, 
  Avatar, 
  Tooltip, 
  IconButton,
  Button,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PersonIcon from '@mui/icons-material/Person';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TagIcon from '@mui/icons-material/Tag';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PostCard from '../../../components/post/PostCard.js';

const BookshelfList = ({ bookshelf = [], onRemove }) => {
  const navigate = useNavigate();

  const handleCardClick = (postId) => {
    navigate(`/novel/${postId}`);
  };
  
  // Handle remove from bookshelf action
  const handleRemove = (e, postId) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(postId);
    }
  };
  
  // Format date to be more user-friendly
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return `${diffDays}日前に追加`;
    } else {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日に追加`;
    }
  };
  
  // Truncate text if too long
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  if (bookshelf.length === 0) {
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
        <BookmarkAddedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>本棚に追加した作品はありません</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          お気に入りの作品を本棚に追加して、後で簡単にアクセスできるようにしましょう。作品ページの「本棚に追加」ボタンをクリックすると、ここに表示されます。
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

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {bookshelf.map(post => (
                  <Grid item xs={12} sm={6} key={post._id}>
                    <PostCard post={post} />
                  </Grid>
                ))}
      </Grid>
    </Box>
  );
};

export default BookshelfList;