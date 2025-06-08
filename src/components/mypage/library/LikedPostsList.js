import React from 'react';
import { Card, CardContent, Typography, Box ,Grid} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../../components/post/PostCard.js';

const LikedPostsList = ({ likedPosts = [] }) => {
  const navigate = useNavigate();

  const handleCardClick = (postId) => {
    navigate(`/novel/${postId}`);
  };

  if (likedPosts.length === 0) {
    return (
      <Box sx={{ padding: 2, width: '100%', textAlign: 'center' }}>
        <Typography>いいねした作品はありません</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
            <Grid container spacing={2}>
      
      {likedPosts.map(post => (
                  <Grid item xs={12} sm={6} key={post._id}>
                    <PostCard post={post} />
                  </Grid>
                ))}
                      </Grid>
                
    </Box>
  );
};

export default LikedPostsList;
