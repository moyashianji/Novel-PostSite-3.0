import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SearchProvider } from "./context/SearchContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import our new AuthContext
import { CustomThemeProvider } from "./context/ThemeContext"; // 追加

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
import SettingsPage from './pages/SettingsPage'; // 新しく追加

// 静的ページのインポート
import TermsPage from './pages/info/TermsPage';
import PrivacyPage from './pages/info/PrivacyPage';
import ContactPage from './pages/info/ContactPage';
import AboutPage from './pages/info/AboutPage';
import WritingGuidePage from './pages/info/WritingGuidePage';
import FAQPage from './pages/info/FAQPage';
import TipsPage from './pages/info/TipsPage';

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
        {/* メインページ */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/trending" element={<TrendingPage />} />

        {/* 認証関連 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />

        {/* 投稿・編集（認証必要） */}
        <Route path="/new-post" element={
          <ProtectedRoute>
            <PostEditor />
          </ProtectedRoute>
        } />
        
        {/* ユーザーページ */}
        <Route path="/mypage" element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/user/:id" element={<UserPage />} />

        {/* 作品関連 */}
        <Route path="/novel/:id" element={<NovelDetail />} />
        <Route path="/series/:id/works" element={<WorksInSeries />} />
        
        {/* 編集ページ（認証必要） */}
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
        
        {/* 分析ページ（認証必要） */}
        <Route path="/analytics/:id" element={
          <ProtectedRoute>
            <AnalytisPage />
          </ProtectedRoute>
        } />

        {/* コンテスト関連 */}
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

        {/* 通知（認証必要） */}
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />

        {/* === 静的ページ（新規追加） === */}
        
        {/* サイト情報・サポート */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        
        {/* 法的文書 */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        
        {/* 作家向けリソース */}
        <Route path="/guides" element={<WritingGuidePage />} />
        <Route path="/tips" element={<TipsPage />} />
        
        {/* サイトマップ */}
        <Route path="/sitemap" element={<SiteMap />} />

        {/* 404エラーハンドリング（オプション） */}
        <Route path="*" element={
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh',
            gap: 2,
            textAlign: 'center'
          }}>
            <h1>404 - ページが見つかりません</h1>
            <p>お探しのページは存在しないか、移動された可能性があります。</p>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <a href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
                ホームに戻る
              </a>
              <a href="/sitemap" style={{ color: '#1976d2', textDecoration: 'none' }}>
                サイトマップ
              </a>
            </Box>
          </Box>
        } />
      </Routes>
    </Layout>
  );
};

// AppComponent自体もメモ化して不要な再レンダリングを防止
const App = React.memo(() => {
  return (
    <Router>
      <AuthProvider>
        <CustomThemeProvider>
          <SearchProvider>
            <AuthenticatedNotificationProvider>
              <AppRoutes />
            </AuthenticatedNotificationProvider>
          </SearchProvider>
        </CustomThemeProvider>
      </AuthProvider>
    </Router>
  );
});

export default App;