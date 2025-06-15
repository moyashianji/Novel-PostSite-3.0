import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Typography, Box, Button, Avatar, Grid, Chip, Link, Container, 
  Tab, Tabs, Divider, Paper, Alert, Badge, IconButton, Tooltip, 
  Menu, MenuItem, InputBase, Skeleton, useTheme, useMediaQuery
} from '@mui/material';
import { alpha, styled } from '@mui/system';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SortIcon from '@mui/icons-material/Sort';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import BookIcon from '@mui/icons-material/Book';

// インポートするカードコンポーネント
import PostCard from '../components/post/PostCard';
import SeriesCard from '../components/series/SeriesCard';

// Styled components
const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
}));

const BackgroundPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '40%',
  height: '100%',
  opacity: 0.05,
  background: `radial-gradient(circle, ${theme.palette.primary.main} 8%, transparent 8%) 0 0, 
              radial-gradient(circle, ${theme.palette.primary.main} 8%, transparent 8%) 8px 8px`,
  backgroundSize: '16px 16px',
  transform: 'rotate(15deg) translateX(10%) translateY(-20%)',
  zIndex: 0
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  marginRight: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: 80,
    height: 80,
    marginRight: theme.spacing(2),
  }
}));

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  minWidth: 80
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  position: 'relative',
  display: 'inline-block',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: 40,
    height: 4,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 2
  }
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 50,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(2)
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const UserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State variables
  const [user, setUser] = useState(null);
  const [works, setWorks] = useState([]);
  const [series, setSeries] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user data
        const userResponse = await fetch(`/api/users/${id}`);
        if (!userResponse.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }
        const userData = await userResponse.json();
        setUser(userData);
        setFollowerCount(userData.followerCount || 0);
        
        // Check if current user is following this user
        try {
          const followStatusResponse = await fetch(`/api/users/${id}/is-following`, {
            credentials: 'include',
          });
          if (followStatusResponse.ok) {
            const followStatus = await followStatusResponse.json();
            setIsFollowing(followStatus.isFollowing);
          }
        } catch (followError) {
          console.error('Failed to check follow status:', followError);
        }
        
        // Fetch user's works
        const worksResponse = await fetch(`/api/users/${id}/works`, {
            credentials: 'include',
          });
        if (!worksResponse.ok) {
          throw new Error('作品一覧の取得に失敗しました');
        }
        const worksData = await worksResponse.json();
        setWorks(worksData);
        setFilteredWorks(worksData);
        
        // Fetch user's series
        const seriesResponse = await fetch(`/api/users/${id}/series`);
        if (!seriesResponse.ok) {
          throw new Error('シリーズ一覧の取得に失敗しました');
        }
        const seriesData = await seriesResponse.json();
        setSeries(seriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle tag selection
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.includes(tag);
      const newTags = isSelected 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag];
      
      // Filter works based on selected tags
      if (newTags.length === 0) {
        setFilteredWorks(applySearchAndSort(works, searchQuery, sortOption));
      } else {
        const filtered = works.filter(work => 
          newTags.every(tag => work.tags?.includes(tag))
        );
        setFilteredWorks(applySearchAndSort(filtered, searchQuery, sortOption));
      }
      
      return newTags;
    });
  };
  
  // Handle search query changes
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    // Filter works based on search query and selected tags
    const filtered = works.filter(work => {
      const matchesSearch = query === '' || 
        work.title.toLowerCase().includes(query.toLowerCase()) ||
        work.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => work.tags?.includes(tag));
      
      return matchesSearch && matchesTags;
    });
    
    setFilteredWorks(applySort(filtered, sortOption));
  };
  
  // Handle sort options
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };
  
  const handleSortOptionSelect = (option) => {
    setSortOption(option);
    setFilteredWorks(applySort(filteredWorks, option));
    handleSortClose();
  };
  
  const applySort = (works, sortOption) => {
    const sortedWorks = [...works];
    
    switch (sortOption) {
      case 'newest':
        return sortedWorks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sortedWorks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'mostLiked':
        return sortedWorks.sort((a, b) => (b.goodCounter || 0) - (a.goodCounter || 0));
      case 'mostViewed':
        return sortedWorks.sort((a, b) => (b.viewCounter || 0) - (a.viewCounter || 0));
      case 'wordCount':
        return sortedWorks.sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0));
      default:
        return sortedWorks;
    }
  };
  
  const applySearchAndSort = (works, query, sortOption) => {
    let filtered = works;
    
    if (query) {
      filtered = works.filter(work => 
        work.title.toLowerCase().includes(query.toLowerCase()) ||
        work.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return applySort(filtered, sortOption);
  };
  
  // Handle follow toggle
  const handleFollowToggle = async () => {
    try {
      const url = isFollowing
        ? `/api/users/unfollow/${id}`
        : `/api/users/follow/${id}`;
      const method = isFollowing ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('フォロー操作に失敗しました');
      }

      // Update UI
      setIsFollowing(!isFollowing);
      setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // Optionally show an error message to the user
    }
  };
  
  // Get all unique tags from works
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    works.forEach(work => {
      if (work.tags) {
        work.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  }, [works]);
  
  // Get stats for different types of works
  const workStats = useMemo(() => {
    return {
      total: works.length,
      series: series.length,
      original: works.filter(w => w.isOriginal).length,
      aiGenerated: works.filter(w => w.aiGenerated).length,
      totalViews: works.reduce((sum, work) => sum + (work.viewCounter || 0), 0),
      totalLikes: works.reduce((sum, work) => sum + (work.goodCounter || 0), 0)
    };
  }, [works, series]);
  
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 4, mb: 4 }} />
        <Skeleton variant="text" height={48} width={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1, mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          戻る
        </Button>
      </Container>
    );
  }
  
  // No user found
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          ユーザーが見つかりませんでした。
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          戻る
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <ProfileHeader elevation={0}>
        <BackgroundPattern />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start' }}>
            <ProfileAvatar src={`${user.icon}`} alt={user.nickname} />
            
            <Box sx={{ flex: 1, mb: isMobile ? 2 : 0, textAlign: isMobile ? 'center' : 'left' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                {user.nickname}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 600 }}>
                {user.description || "このユーザーは自己紹介を設定していません。"}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <StatsBox>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {workStats.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    作品
                  </Typography>
                </StatsBox>
                
                <StatsBox>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {workStats.series}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    シリーズ
                  </Typography>
                </StatsBox>
                
                <StatsBox>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {followerCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    フォロワー
                  </Typography>
                </StatsBox>
                
                <StatsBox>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {workStats.totalViews.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    総閲覧数
                  </Typography>
                </StatsBox>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, ml: isMobile ? 0 : 2 }}>
              <Button
                variant={isFollowing ? 'contained' : 'outlined'}
                color={isFollowing ? 'primary' : 'primary'}
                onClick={handleFollowToggle}
                startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                sx={{ borderRadius: 8, minWidth: 150, py: 1 }}
              >
                {isFollowing ? 'フォロー中' : 'フォローする'}
              </Button>
            </Box>
          </Box>
        </Box>
      </ProfileHeader>
      
      {/* Tabs Section */}
      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }} elevation={0}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{ 
            backgroundColor: 'background.paper',
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab label="作品一覧" icon={<BookIcon />} iconPosition="start" />
          <Tab label="シリーズ" icon={<BookmarkIcon />} iconPosition="start" />
          <Tab label="統計" icon={<VisibilityIcon />} iconPosition="start" />
        </Tabs>
      </Paper>
      
      {/* Tab Contents */}
      <TabPanel value={tabValue} index={0}>
        {/* Filter and Search */}
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', mb: 3, gap: 2 }}>
          <SearchContainer sx={{ flex: 1, maxWidth: isMobile ? '100%' : 400 }}>
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
              placeholder="作品を検索..."
              value={searchQuery}
              onChange={handleSearchChange}
              fullWidth
            />
          </SearchContainer>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="表示方法を切り替え">
              <IconButton 
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                color="primary"
              >
                {viewMode === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="並び替え">
              <IconButton 
                onClick={handleSortClick}
                color="primary"
              >
                <SortIcon />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem onClick={() => handleSortOptionSelect('newest')}>
                新着順
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionSelect('oldest')}>
                古い順
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionSelect('mostLiked')}>
                いいね数順
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionSelect('mostViewed')}>
                閲覧数順
              </MenuItem>
              <MenuItem onClick={() => handleSortOptionSelect('wordCount')}>
                文字数順
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {/* Tags */}
        {allTags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalOfferIcon fontSize="small" sx={{ mr: 1 }} />
              タグで絞り込み:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {allTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  clickable
                  color={selectedTags.includes(tag) ? 'primary' : 'default'}
                  variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                  onClick={() => handleTagToggle(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* Works List/Grid */}
        {filteredWorks.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            条件に一致する作品がありません。フィルターを変更してみてください。
          </Alert>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredWorks.map((post) => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <PostCard post={post} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              // List view
              <Box>
                {filteredWorks.map((post) => (
                  <Box key={post._id} sx={{ mb: 2 }}>
                    <PostCard post={post} />
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {/* Series Content */}
        {series.length === 0 ? (
          <Alert severity="info">
            このユーザーはまだシリーズを作成していません。
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {series.map((seriesItem) => (
              <Grid item xs={12} sm={6} key={seriesItem._id}>
                <SeriesCard series={seriesItem} />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {/* Stats Content */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
              <SectionTitle variant="h6">
                作品統計
              </SectionTitle>
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {workStats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総作品数
                      </Typography>
                    </StatsBox>
                  </Grid>
                  <Grid item xs={6}>
                    <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {workStats.series}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        シリーズ数
                      </Typography>
                    </StatsBox>
                  </Grid>

                </Grid>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
              <SectionTitle variant="h6">
                インタラクション統計
              </SectionTitle>
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {workStats.totalViews.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総閲覧数
                      </Typography>
                    </StatsBox>
                  </Grid>
                  <Grid item xs={6}>
                    <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {workStats.totalLikes.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総いいね数
                      </Typography>
                    </StatsBox>
                  </Grid>
                  <Grid item xs={6}>
                    <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {followerCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        フォロワー数
                      </Typography>
                    </StatsBox>
                  </Grid>
                  <Grid item xs={6}>
                    <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {works.length > 0 ? Math.round(workStats.totalViews / works.length) : 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        作品平均閲覧数
                      </Typography>
                    </StatsBox>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
              <SectionTitle variant="h6">
                タグの傾向
              </SectionTitle>
              <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allTags.map(tag => {
                  const count = works.filter(work => work.tags?.includes(tag)).length;
                  const percentage = Math.round((count / works.length) * 100);
                  
                  return (
                    <Chip
                      key={tag}
                      label={`${tag} (${count})`}
                      sx={{
                        fontSize: `${Math.max(0.8, Math.min(1.2, 0.8 + percentage / 100))}rem`,
                        fontWeight: percentage > 30 ? 'bold' : 'normal',
                        backgroundColor: alpha(theme.palette.primary.main, percentage / 200)
                      }}
                    />
                  );
                })}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default UserPage;