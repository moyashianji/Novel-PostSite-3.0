import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SearchProvider } from "./context/SearchContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import our new AuthContext

import Layout from './components/layout/Layout';
import Home from './pages/Home';
import PostEditor from './pages/PostEditor';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import NovelDetail from './pages/NovelDetail';
import UserPage from './pages/UserPage';
import SearchPage from './pages/SearchPage';
import SeriesEditPage from './pages/SeriesEditPage';
import PostEditPage from './pages/PostEditPage';
import WorksInSeries from './pages/WorksInSeries';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AnalytisPage from './pages/AnalytisPage';
import ContestList from './pages/contests/ContestList';
import ContestDetail from './pages/contests/ContestDetail';
import ContestEntry from './pages/contests/ContestEntry';
import ContestCreate from './pages/contests/ContestCreatePage';
import ContestPreview from './pages/contests/ContestPreview';
import ContestEdit from './pages/contests/ContestEdit';
import NotificationsPage from './pages/notifications/NotificationsPage';
import TrendingPage from './pages/TrendingPage';

import SiteMap from './components/layout/footer/SiteMap';
import { CircularProgress, Box } from '@mui/material';

const theme = createTheme();

// Protected Route component that uses our Auth context
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// 認証状態を取得してNotificationProviderに渡すラッパーコンポーネント
// useMemoCでメモ化してパフォーマンス向上
const AuthenticatedNotificationProvider = React.memo(({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <NotificationProvider isAuthenticated={isAuthenticated}>
      {children}
    </NotificationProvider>
  );
});

AuthenticatedNotificationProvider.displayName = 'AuthenticatedNotificationProvider';

// Routes Component to be used inside the AuthProvider
const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/new-post" element={
          <ProtectedRoute>
            <PostEditor />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/trending" element={<TrendingPage />} />

        <Route path="/mypage" element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        } />
        <Route path="/novel/:id" element={<NovelDetail />} />
        <Route path="/user/:id" element={<UserPage />} />
        <Route path="/mypage/series/:id/edit" element={
          <ProtectedRoute>
            <SeriesEditPage />
          </ProtectedRoute>
        } />
        <Route path="/mypage/novel/:id/edit" element={
          <ProtectedRoute>
            <PostEditPage />
          </ProtectedRoute>
        } />
        <Route path="/series/:id/works" element={<WorksInSeries />} />
        <Route path="/analytics/:id" element={
          <ProtectedRoute>
            <AnalytisPage />
          </ProtectedRoute>
        } />
        <Route path="/contests" element={<ContestList />} />
        <Route path="/contests/:id" element={<ContestDetail />} />
        <Route path="/contests/:id/enter" element={
          <ProtectedRoute>
            <ContestEntry />
          </ProtectedRoute>
        } />
        <Route path="/contests/create" element={
          <ProtectedRoute>
            <ContestCreate />
          </ProtectedRoute>
        } />
        <Route path="/contest-preview" element={
          <ProtectedRoute>
            <ContestPreview />
          </ProtectedRoute>
        } />
        <Route path="/contest-edit/:id" element={
          <ProtectedRoute>
            <ContestEdit />
          </ProtectedRoute>
        } />
        <Route path="/sitemap" element={<SiteMap />} />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  );
};

// AppComponent自体もメモ化して不要な再レンダリングを防止
const App = React.memo(() => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <SearchProvider>
            <AuthenticatedNotificationProvider>
              <AppRoutes />
            </AuthenticatedNotificationProvider>
          </SearchProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
});

export default App;