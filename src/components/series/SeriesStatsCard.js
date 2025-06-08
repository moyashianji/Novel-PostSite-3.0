import React from 'react';
import { 
  Box, 
  Card, 
  Grid, 
  Typography, 
  IconButton,
  Tooltip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const SeriesStatsCard = ({ series, onEditClick }) => {
  return (
    <Card
      elevation={2}
      sx={{ 
        height: '100%',
        borderRadius: 2,
        position: 'relative'
      }}
    >
      <Box 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.02)',
          p: 3,
          position: 'relative'
        }}
      >

        
        {/* Edit button */}
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Tooltip title="シリーズを編集">
            <IconButton 
              color="primary" 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick();
              }}
              sx={{ 
                bgcolor: 'rgba(25, 118, 210, 0.1)',
                '&:hover': { 
                  bgcolor: 'rgba(25, 118, 210, 0.2)',
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Grid container spacing={1.5}>
          {/* Likes */}
          <Grid item xs={6}>
            <StatItem 
              icon={<FavoriteIcon sx={{ color: '#e91e63', fontSize: 20 }} />}
              value={series.totalLikes || 0}
              label="いいね"
            />
          </Grid>
          
          {/* Bookmarks */}
          <Grid item xs={6}>
            <StatItem 
              icon={<BookmarkIcon sx={{ color: '#ff9800', fontSize: 20 }} />}
              value={series.totalBookshelf || 0}
              label="本棚"
            />
          </Grid>
          
          {/* Views */}
          <Grid item xs={6}>
            <StatItem 
              icon={<VisibilityIcon sx={{ color: '#3f51b5', fontSize: 20 }} />}
              value={series.totalViews || 0}
              label="閲覧数"
            />
          </Grid>
          
          {/* Points */}
          <Grid item xs={6}>
            <StatItem 
              icon={<StarIcon sx={{ color: '#ffc107', fontSize: 20 }} />}
              value={series.totalPoints || 0}
              label="ポイント"
            />
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

// Reusable stat item component
const StatItem = ({ icon, value, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Box sx={{ mr: 1 }}>{icon}</Box>
    <Box>
      <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 'bold' }}>
        {value.toLocaleString()}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  </Box>
);

export default SeriesStatsCard;