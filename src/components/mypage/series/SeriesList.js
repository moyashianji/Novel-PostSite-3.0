// SeriesList.js の修正
import React from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Paper,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SeriesCard from '../../series/SeriesCard';
import SeriesStatsCard from '../../series/SeriesStatsCard';

const SeriesList = ({ series = [] }) => {
  const navigate = useNavigate();

  // SeriesCardとSeriesStatsCardに渡すデータを適切に整形
  const prepareSeriesData = (seriesItem) => {
    // 必要なデータが存在することを確認
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
      createdAt: seriesItem.createdAt
    };
  };

  // Handler for clicking the card (navigate to series detail)
  const handleSeriesClick = (seriesId) => {
    navigate(`/series/${seriesId}/works`);
  };

  // Handler for edit button (navigate to edit page)
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

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {series.map((seriesItem) => {
          const formattedSeriesData = prepareSeriesData(seriesItem);
          return (
            <Grid item xs={12} key={seriesItem._id}>
              <Grid container spacing={2}>
                {/* Series Card */}
                <Grid item xs={12} md={8}>
                  <SeriesCard 
                    series={formattedSeriesData} 
                    onClick={() => handleSeriesClick(seriesItem._id)}
                  />
                </Grid>
                
                {/* Stats and Edit Button */}
                <Grid item xs={12} md={4}>
                  <SeriesStatsCard 
                    series={formattedSeriesData}
                    onEditClick={() => handleEditClick(seriesItem._id)}
                  />
                </Grid>
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SeriesList;