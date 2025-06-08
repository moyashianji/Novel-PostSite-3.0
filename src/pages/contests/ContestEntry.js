// src/pages/ContestEntry.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
} from '@mui/material';

const ContestEntry = () => {
  const { id } = useParams(); // コンテストID
  const navigate = useNavigate();

  const [postOptions, setPostOptions] = useState([]); // ユーザーの投稿選択肢
  const [selectedPost, setSelectedPost] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await fetch('http://localhost/api/users/me/posts', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setPostOptions(data);
        } else {
          console.error('投稿の取得に失敗しました');
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserPosts();
  }, []);

  const handleSubmit = async () => {
    if (!selectedPost) {
      alert('応募する投稿を選択してください。');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost/api/contests/${id}/enter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ postId: selectedPost }),
      });

      if (response.ok) {
        alert('コンテストに応募しました！');
        navigate(`/contests/${id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.message || '応募に失敗しました。');
      }
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        コンテスト応募
      </Typography>
      <Typography variant="body1" gutterBottom>
        以下から応募する作品を選択してください。
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            label="投稿を選択"
            value={selectedPost}
            onChange={(e) => setSelectedPost(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          >
            {postOptions.map((post) => (
              <MenuItem key={post._id} value={post._id}>
                {post.title}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : '応募する'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContestEntry;
