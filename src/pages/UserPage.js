import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Tab, Tabs, Paper, Alert, Button, Skeleton, Grid, useMediaQuery, useTheme
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BookIcon from '@mui/icons-material/Book';

// Lazy loading components
const ProfileHeader = React.lazy(() => import('../components/user/ProfileHeader'));
const WorksPanel = React.lazy(() => import('../components/user/WorksPanel'));
const SeriesPanel = React.lazy(() => import('../components/user/SeriesPanel'));
const StatsPanel = React.lazy(() => import('../components/user/StatsPanel'));

// Memoized TabPanel component
const TabPanel = React.memo(({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && children}
  </div>
));

// Custom hook for data fetching
const useUserData = (id) => {
  const [state, setState] = useState({
    user: null,
    works: [],
    series: [],
    isFollowing: false,
    followerCount: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        const [userRes, worksRes, seriesRes, followRes] = await Promise.allSettled([
          fetch(`/api/users/${id}`),
          fetch(`/api/users/${id}/works`, { credentials: 'include' }),
          fetch(`/api/users/${id}/series`),
          fetch(`/api/users/${id}/is-following`, { credentials: 'include' })
        ]);

        if (!mounted) return;

        if (userRes.status === 'rejected' || !userRes.value.ok) {
          throw new Error('ユーザー情報の取得に失敗しました');
        }

        const userData = await userRes.value.json();
        const worksData = worksRes.status === 'fulfilled' && worksRes.value.ok 
          ? await worksRes.value.json() : [];
        const seriesData = seriesRes.status === 'fulfilled' && seriesRes.value.ok 
          ? await seriesRes.value.json() : [];
        const followData = followRes.status === 'fulfilled' && followRes.value.ok 
          ? await followRes.value.json() : { isFollowing: false };

        setState({
          user: userData,
          works: worksData,
          series: seriesData,
          isFollowing: followData.isFollowing,
          followerCount: userData.followerCount || 0,
          loading: false,
          error: null
        });
      } catch (error) {
        if (mounted) {
          setState(prev => ({ ...prev, loading: false, error: error.message }));
        }
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [id]);

  return state;
};

// Custom hook for works filtering
const useWorksFilter = (works) => {
  const [filters, setFilters] = useState({
    selectedTags: [],
    searchQuery: '',
    sortOption: 'newest'
  });

  const filteredWorks = useMemo(() => {
    let result = works;

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(work => 
        work.title.toLowerCase().includes(query) ||
        work.description.toLowerCase().includes(query)
      );
    }

    // Tags filter
    if (filters.selectedTags.length > 0) {
      result = result.filter(work => 
        filters.selectedTags.every(tag => work.tags?.includes(tag))
      );
    }

    // Sort
    const sortMap = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      mostLiked: (a, b) => (b.goodCounter || 0) - (a.goodCounter || 0),
      mostViewed: (a, b) => (b.viewCounter || 0) - (a.viewCounter || 0),
      wordCount: (a, b) => (b.wordCount || 0) - (a.wordCount || 0)
    };

    return result.sort(sortMap[filters.sortOption] || sortMap.newest);
  }, [works, filters]);

  const allTags = useMemo(() => 
    [...new Set(works.flatMap(work => work.tags || []))], [works]
  );

  return { filteredWorks, allTags, filters, setFilters };
};

const UserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { user, works, series, isFollowing, followerCount, loading, error } = useUserData(id);
  const { filteredWorks, allTags, filters, setFilters } = useWorksFilter(works);
  
  const [uiState, setUiState] = useState({
    tabValue: 0,
    viewMode: 'grid',
    sortAnchorEl: null,
    localFollowing: isFollowing,
    localFollowerCount: followerCount
  });

  // Update local state when props change
  useEffect(() => {
    setUiState(prev => ({
      ...prev,
      localFollowing: isFollowing,
      localFollowerCount: followerCount
    }));
  }, [isFollowing, followerCount]);

  // Memoized stats
  const workStats = useMemo(() => ({
    total: works.length,
    series: series.length,
    original: works.filter(w => w.isOriginal).length,
    aiGenerated: works.filter(w => w.aiGenerated).length,
    totalViews: works.reduce((sum, work) => sum + (work.viewCounter || 0), 0),
    totalLikes: works.reduce((sum, work) => sum + (work.goodCounter || 0), 0)
  }), [works, series]);

  // Memoized handlers
  const handleFollowToggle = useCallback(async () => {
    try {
      const method = uiState.localFollowing ? 'DELETE' : 'POST';
      const url = `/api/users/${uiState.localFollowing ? 'unfollow' : 'follow'}/${id}`;
      
      const response = await fetch(url, { method, credentials: 'include' });
      
      if (!response.ok) {
        if (response.status === 401) navigate('/login');
        return;
      }

      setUiState(prev => ({
        ...prev,
        localFollowing: !prev.localFollowing,
        localFollowerCount: prev.localFollowing ? prev.localFollowerCount - 1 : prev.localFollowerCount + 1
      }));
    } catch (error) {
      console.error('Follow toggle failed:', error);
    }
  }, [id, navigate, uiState.localFollowing]);

  const handleLinkClick = useCallback((url) => {
    if (url) window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  }, []);

  const handleAuthorTagClick = useCallback((author) => {
    navigate(`/search?mustInclude=${encodeURIComponent(author)}&type=users&fields=favoriteAuthors`);
  }, [navigate]);

  const handleTagToggle = useCallback((tag) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag) 
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  }, [setFilters]);

  const handleSearchChange = useCallback((event) => {
    setFilters(prev => ({ ...prev, searchQuery: event.target.value }));
  }, [setFilters]);

  const handleSortOptionSelect = useCallback((option) => {
    setFilters(prev => ({ ...prev, sortOption: option }));
    setUiState(prev => ({ ...prev, sortAnchorEl: null }));
  }, [setFilters]);

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 4, mb: 4 }} />
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1, mb: 4 }} />
        <Grid container spacing={3}>
          {Array.from({ length: 6 }, (_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity={error ? "error" : "info"} sx={{ mb: 4 }}>
          {error || "ユーザーが見つかりませんでした。"}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>戻る</Button>
      </Container>
    );
  }

  const tabContent = [
    <WorksPanel
      key="works"
      filteredWorks={filteredWorks}
      allTags={allTags}
      selectedTags={filters.selectedTags}
      searchQuery={filters.searchQuery}
      viewMode={uiState.viewMode}
      sortAnchorEl={uiState.sortAnchorEl}
      onSearchChange={handleSearchChange}
      onTagToggle={handleTagToggle}
      onViewModeToggle={() => setUiState(prev => ({ ...prev, viewMode: prev.viewMode === 'grid' ? 'list' : 'grid' }))}
      onSortClick={(e) => setUiState(prev => ({ ...prev, sortAnchorEl: e.currentTarget }))}
      onSortClose={() => setUiState(prev => ({ ...prev, sortAnchorEl: null }))}
      onSortOptionSelect={handleSortOptionSelect}
    />,
    <SeriesPanel key="series" series={series} />,
    <StatsPanel 
      key="stats"
      workStats={workStats}
      followerCount={uiState.localFollowerCount}
      works={works}
      allTags={allTags}
    />
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <React.Suspense fallback={<Skeleton variant="rectangular" height={250} sx={{ borderRadius: 4, mb: 4 }} />}>
        <ProfileHeader
          user={user}
          workStats={workStats}
          followerCount={uiState.localFollowerCount}
          isFollowing={uiState.localFollowing}
          onFollowToggle={handleFollowToggle}
          onLinkClick={handleLinkClick}
          onAuthorTagClick={handleAuthorTagClick}
        />
      </React.Suspense>
      
      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }} elevation={0}>
        <Tabs
          value={uiState.tabValue}
          onChange={(e, newValue) => setUiState(prev => ({ ...prev, tabValue: newValue }))}
          variant="fullWidth"
          sx={{ 
            backgroundColor: 'background.paper',
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
          }}
        >
          <Tab label="作品一覧" icon={<BookIcon />} iconPosition="start" />
          <Tab label="シリーズ" icon={<BookmarkIcon />} iconPosition="start" />
          <Tab label="統計" icon={<VisibilityIcon />} iconPosition="start" />
        </Tabs>
      </Paper>
      
      <React.Suspense fallback={<Skeleton variant="rectangular" height={300} />}>
        <TabPanel value={uiState.tabValue} index={uiState.tabValue}>
          {tabContent[uiState.tabValue]}
        </TabPanel>
      </React.Suspense>
    </Container>
  );
};

export default React.memo(UserPage);