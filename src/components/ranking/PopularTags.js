import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Chip, 
  Typography, 
  Paper, 
  Skeleton,
  Tooltip,
  Badge,
  Fade,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import TagIcon from '@mui/icons-material/Tag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import SearchIcon from '@mui/icons-material/Search';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import RestrictedIcon from '@mui/icons-material/DoNotDisturbOn';

const PopularTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ageFilter, setAgeFilter] = useState('all'); // 'all', 'general', 'r18'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        let url = `/api/tags/popular`;
        if (ageFilter !== 'all') {
          url += `?ageFilter=${ageFilter}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTags(data);
        setError(false);
      } catch (error) {
        console.error('❌ Elasticsearch から人気タグ取得エラー:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [ageFilter]);

  const handleTabChange = (event, newValue) => {
    setAgeFilter(newValue);
  };

  const handleTagClick = (tag) => {
    // 年齢フィルターも含めて検索ページに遷移
    let searchParams = `mustInclude=${encodeURIComponent(tag)}`;
    if (ageFilter !== 'all') {
      searchParams += `&ageFilter=${ageFilter}`;
    }
    navigate(`/search?${searchParams}`);
  };

  // Get tag size based on count/popularity
  const getTagSize = (count, max) => {
    // Normalize between 0.9 and 1.4 for font size multiplier
    const normalized = 0.9 + (count / max) * 0.5;
    return normalized;
  };

  // Generate tag cloud layout
  const renderTags = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', p: 2 }}>
          {[...Array(10)].map((_, i) => (
            <Skeleton 
              key={i} 
              variant="rounded" 
              width={80 + Math.random() * 40} 
              height={32} 
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="body2" color="error" gutterBottom>
            タグの読み込み中にエラーが発生しました
          </Typography>
          <Typography variant="caption" color="text.secondary">
            後でもう一度お試しください
          </Typography>
        </Box>
      );
    }

    if (tags.length === 0) {
      return (
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}
        >
          <TagIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.6 }} />
          <Typography variant="body2" color="textSecondary">
            タグがまだありません
          </Typography>
          <Typography variant="caption" color="textSecondary">
            作品が追加されると、ここに人気のタグが表示されます
          </Typography>
        </Box>
      );
    }

    // Find the maximum count for normalization
    const maxCount = Math.max(...tags.map(tag => tag.count || 0));

    return (
      <Fade in={!loading}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            justifyContent: 'center',
            p: 2 
          }}
        >
          {tags.map((tag, index) => {
            const size = getTagSize(tag.count || 0, maxCount);
            const isTopThree = index < 3;
            
            return (
              <Tooltip 
                key={index} 
                title={`${tag.count || 0} 作品`}
                arrow
              >
                <Chip
                  icon={isTopThree ? <TrendingUpIcon fontSize="small" /> : <TagIcon fontSize="small" />}
                  label={tag.tag}
                  onClick={() => handleTagClick(tag.tag)}
                  sx={{
                    fontSize: `${size}rem`,
                    fontWeight: isTopThree ? 'bold' : 'normal',
                    py: 2.2,
                    bgcolor: (theme) => isTopThree 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                    '&:hover': {
                      bgcolor: (theme) => isTopThree 
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateY(-2px)',
                      boxShadow: 1,
                    },
                    transition: 'all 0.2s ease-in-out',
                    borderColor: (theme) => isTopThree 
                      ? alpha(theme.palette.primary.main, 0.3)
                      : 'transparent',
                    borderWidth: isTopThree ? 1 : 0,
                    borderStyle: 'solid',
                    
                    // Special styling for the top tag
                    ...(index === 0 && {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                      color: 'primary.main',
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                    })
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
      </Fade>
    );
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        overflow: 'hidden',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3,
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          position: 'relative'
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" sx={{ textAlign: 'center' }}>
          人気タグ
        </Typography>
        {loading && (
          <CircularProgress 
            size={16} 
            thickness={8} 
            sx={{ 
              position: 'absolute', 
              right: 16, 
              color: 'white' 
            }} 
          />
        )}
        {!loading && (
          <SearchIcon 
            sx={{ 
              position: 'absolute', 
              right: 16, 
              fontSize: 20,
              opacity: 0.8
            }} 
          />
        )}
      </Box>
      
      {/* 年齢フィルタータブ */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={ageFilter} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: '0.875rem',
              fontWeight: 'bold',
              textTransform: 'none',
              py: 1,
            }
          }}
        >
          <Tab 
            label="すべて" 
            value="all" 
            icon={<AllInclusiveIcon fontSize="small" />}
            iconPosition="start"
            sx={{ 
              '&.Mui-selected': { 
                color: 'primary.main',
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08)
              }
            }}
          />
          <Tab 
            label="全年齢" 
            value="general" 
            icon={<FamilyRestroomIcon fontSize="small" />}
            iconPosition="start"
            sx={{ 
              '&.Mui-selected': { 
                color: 'success.main',
                backgroundColor: (theme) => alpha(theme.palette.success.main, 0.08)
              }
            }}
          />
          <Tab 
            label="R18" 
            value="r18" 
            icon={<RestrictedIcon fontSize="small" />}
            iconPosition="start"
            sx={{ 
              '&.Mui-selected': { 
                color: 'error.main',
                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08)
              }
            }}
          />
        </Tabs>
      </Box>
      
      {renderTags()}
      
      {tags.length > 0 && (
        <Box 
          sx={{ 
            p: 1,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {ageFilter === 'all' ? 'すべて' : 
             ageFilter === 'general' ? '全年齢' : 'R18'} のタグ
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PopularTags;