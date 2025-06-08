import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Snackbar,
  Button 
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfileInfo from '../components/profile/ProfileInfo';
import Sidebar from '../components/mypage/Sidebar';
import ContentSection from '../components/mypage/ContentSection';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../context/AuthContext';

const MyPage = () => {
  // State management
  const [user, setUser] = useState(null);
  const [displayedContent, setDisplayedContent] = useState('works');
  const [contentData, setContentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Hooks
  const { fetchUserData, fetchMyWorks, fetchBookshelf } = useAPI();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userData = await fetchUserData();
        if (userData) {
          setUser(userData);
          
          // If no specific tab is requested, default to fetching works data
          if (!(location.state && location.state.activeTab)) {
            const worksData = await fetchMyWorks();
            setContentData(worksData || []);
          }
        } else {
          setError('ユーザー情報の取得に失敗しました');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('ユーザー情報の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadUserData();
    } else {
      // Redirect to login if not authenticated
      navigate('/login', { 
        state: { from: location.pathname, message: 'このページを表示するにはログインが必要です' } 
      });
    }
  }, [isAuthenticated, fetchUserData, navigate, location.pathname]);

  // Handle route state to determine which tab to display
  useEffect(() => {
    const handleStateBasedNavigation = async () => {
      if (location.state && location.state.activeTab) {
        setDisplayedContent(location.state.activeTab);
        await handleInitialContentLoad(location.state.activeTab);
        
        // Clear the state after using it to prevent it from persisting on refresh
        // This technique uses replaceState to modify browser history without creating a new entry
        window.history.replaceState(
          { ...window.history.state, activeTab: undefined }, 
          document.title
        );
      }
    };
    
    if (user) {
      handleStateBasedNavigation();
    }
  }, [location.state, user]);

  // Function to load the correct data when a tab is selected from navigation
  const handleInitialContentLoad = async (contentType) => {
    setLoading(true);
    
    try {
      let data = [];
      
      switch (contentType) {
        case 'bookshelf':
          data = await fetchBookshelf();
          break;
        case 'works':
          data = await fetchMyWorks();
          break;
        // Add other cases as needed
        default:
          // Default case will be handled by the Sidebar component
          break;
      }
      
      if (data) {
        setContentData(data);
      }
    } catch (err) {
      console.error(`Error loading ${contentType} data:`, err);
      setError(`${getContentTypeName(contentType)}の取得に失敗しました`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get display name for content types
  const getContentTypeName = (contentType) => {
    const contentTypeMap = {
      works: '作品一覧',
      series: 'シリーズ一覧',
      following: 'フォローリスト',
      followers: 'フォロワーリスト',
      likedPosts: 'いいねした作品',
      bookshelf: '本棚',
      bookmarks: 'しおり',
      contests: 'コンテスト'
    };
    
    return contentTypeMap[contentType] || contentType;
  };

  // Handler for profile updates
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setFeedback({
      open: true,
      message: 'プロフィールが更新されました',
      severity: 'success'
    });
  };

  // Handler for content changes (when tabs are clicked)
  const handleContentChange = useCallback((contentType, data) => {
    setDisplayedContent(contentType);
    setContentData(data || []);
  }, []);

  // Handler for error feedback close
  const handleFeedbackClose = () => {
    setFeedback({ ...feedback, open: false });
  };

  // Display loading state when data is being fetched
  if (loading && !user) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center',

          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          データを読み込み中...
        </Typography>
      </Box>
    );
  }

  // Display error state if fetching fails
  if (error && !user) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <Paper 
          elevation={2}
          sx={{ 
            p: 4, 
            maxWidth: 600, 
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            エラーが発生しました
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {error}
          </Typography>
          <Box mt={3}>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
            >
              再読み込み
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            {user ? (
              <ProfileInfo user={user} onProfileUpdate={handleProfileUpdate} />
            ) : (
              <Paper 
                elevation={3}
                sx={{ 
                  width: '100%', 
                  mb: 4, 
                  borderRadius: 4,
                  p: 3
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              </Paper>
            )}
          </Box>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={3}>
          <Sidebar 
            onContentChange={handleContentChange} 
            currentContent={displayedContent}
          />
        </Grid>

        {/* Content Section */}
        <Grid item xs={12} md={6}>
          {loading ? (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                my: 4
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <ContentSection 
              contentType={displayedContent} 
              contentData={contentData}
              user={user}
              error={error}
            />
          )}
        </Grid>

        {/* Right sidebar/empty space */}
        <Grid item xs={12} md={3}>
          <Box sx={{ height: '100%', backgroundColor: 'transparent' }} />
        </Grid>
      </Grid>

      {/* Feedback Snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={5000}
        onClose={handleFeedbackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleFeedbackClose} 
          severity={feedback.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyPage;