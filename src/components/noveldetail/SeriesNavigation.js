// SeriesNavigation.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  Bookmarks as BookmarksIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NavigationContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const NavButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1, 2),
  transition: 'all 0.2s',
  fontWeight: 'bold',
  minWidth: 120,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    color: 'rgba(0, 0, 0, 0.26)',
  }
}));

const SeriesTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const EpisodeInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderRadius: 8,
  marginBottom: theme.spacing(2),
}));

const SeriesNavigation = ({ 
  currentPostId, 
  seriesData 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [prevEpisode, setPrevEpisode] = useState(null);
  const [nextEpisode, setNextEpisode] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesId, setSeriesId] = useState('');

  // Find current episode index and set prev/next episodes
  useEffect(() => {
    if (!seriesData || !currentPostId) return;

    // If seriesData is a single series (backward compatibility)
    if (seriesData.seriesTitle && seriesData.seriesPosts) {
      const sortedPosts = [...seriesData.seriesPosts].sort((a, b) => 
        (a.episodeNumber || 0) - (b.episodeNumber || 0)
      );
      
      const currentIndex = sortedPosts.findIndex(post => post._id === currentPostId);
      
      if (currentIndex !== -1) {
        setCurrentEpisode(sortedPosts[currentIndex]);
        setPrevEpisode(currentIndex > 0 ? sortedPosts[currentIndex - 1] : null);
        setNextEpisode(currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null);
        setSeriesTitle(seriesData.seriesTitle.title);
        setSeriesId(seriesData.seriesId || (seriesData.seriesTitle && typeof seriesData.seriesTitle === 'object' ? seriesData.seriesTitle._id : ''));
        console.log(seriesData.id);
      }
    } 
    // Multiple series case
    else if (Array.isArray(seriesData)) {
      // Find which series contains the current post
      for (const series of seriesData) {
        const sortedPosts = [...series.seriesPosts].sort((a, b) => 
          (a.episodeNumber || 0) - (b.episodeNumber || 0)
        );
        
        const currentIndex = sortedPosts.findIndex(post => post._id === currentPostId);
        
        if (currentIndex !== -1) {
          setCurrentEpisode(sortedPosts[currentIndex]);
          setPrevEpisode(currentIndex > 0 ? sortedPosts[currentIndex - 1] : null);
          setNextEpisode(currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null);
          setSeriesTitle(series.seriesTitle.title);
          setSeriesId(series.seriesId || '');
          break;
        }
      }
    }
  }, [seriesData, currentPostId]);

  // Navigate to previous episode
  const handlePrevClick = () => {
    if (prevEpisode) {
      navigate(`/novel/${prevEpisode._id}`);
    }
  };

  // Navigate to next episode
  const handleNextClick = () => {
    if (nextEpisode) {
      navigate(`/novel/${nextEpisode._id}`);
    }
  };

  // Navigate to series page
  const handleSeriesClick = () => {
    navigate(`/series/${seriesId}/works`);
  };

  // If no series data or post is not part of a series
  if (!seriesData || !currentEpisode) {
    return null;
  }

  return (
    <NavigationContainer elevation={2}>
      <SeriesTitle variant="h6">
        <CollectionsBookmarkIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
        {seriesTitle}
        <Tooltip title="シリーズを表示">
          <IconButton 
            size="small" 
            onClick={handleSeriesClick}
            sx={{ ml: 1 }}
          >
            <BookmarksIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </SeriesTitle>
      
      <EpisodeInfo>
        <MenuBookIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          現在: 
          <Chip 
            label={`第${currentEpisode.episodeNumber || ''}話: ${currentEpisode.title}`}
            size="small"
            color="primary"
            sx={{ ml: 1, fontWeight: 'bold' }}
          />
        </Typography>
      </EpisodeInfo>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <NavButton
          variant="outlined"
          color="primary"
          startIcon={<NavigateBeforeIcon />}
          onClick={handlePrevClick}
          disabled={!prevEpisode}
        >
          前の話
        </NavButton>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleSeriesClick}
          sx={{ 
            borderRadius: 12,
            px: 3,
            fontWeight: 'bold'
          }}
        >
          シリーズ一覧
        </Button>
        
        <NavButton
          variant="outlined"
          color="primary"
          endIcon={<NavigateNextIcon />}
          onClick={handleNextClick}
          disabled={!nextEpisode}
        >
          次の話
        </NavButton>
      </Box>
      
      {prevEpisode && (
        <Box sx={{ mt: 2, opacity: 0.8 }}>
          <Typography variant="caption" color="textSecondary">
            前の話: 第{prevEpisode.episodeNumber || ''}話『{prevEpisode.title}』
          </Typography>
        </Box>
      )}
      
      {nextEpisode && (
        <Box sx={{ mt: 0.5, textAlign: 'right', opacity: 0.8 }}>
          <Typography variant="caption" color="textSecondary">
            次の話: 第{nextEpisode.episodeNumber || ''}話『{nextEpisode.title}』
          </Typography>
        </Box>
      )}
    </NavigationContainer>
  );
};

export default SeriesNavigation;