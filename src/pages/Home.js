import React, { useMemo } from 'react';
import { Container, Grid, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// カスタムフック
import useHome from '../hooks/useHome';

// コンポーネント
import LeftSidebar from '../components/home/LeftSidebar';
import MainContent from '../components/home/MainContent';
import RightSidebar from '../components/home/RightSidebar';
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated} = useAuth();

  // カスタムフックからの状態とロジックを取得
  const {
    posts,
    currentPage,
    totalPages,
    tagContainers,
    text,
    announcements,
    contests,
    loading,
    handleChangePage,
    handleAddTagContainer,
    handleTagSubmit,
    handleTagPageChange,
    handleTextChange,
    handleDeleteTagContainer,
    handleTagChange,
  } = useHome(isAuthenticated);

  // メモ化されたコンポーネント
  const leftSidebar = useMemo(() => (
    <LeftSidebar 
      contests={contests} 
      loading={loading} 
      navigate={navigate} 
    />
  ), [contests, loading, navigate]);

  const mainContent = useMemo(() => (
    <MainContent
      posts={posts}
      totalPages={totalPages}
      currentPage={currentPage}
      handleChangePage={handleChangePage}
      contests={contests}
      tagContainers={tagContainers}
      handleAddTagContainer={handleAddTagContainer}
      handleDeleteTagContainer={handleDeleteTagContainer}
      handleTagSubmit={handleTagSubmit}
      handleTagPageChange={handleTagPageChange}
      handleTextChange={handleTextChange}
      text={text}
      auth={isAuthenticated}
      navigate={navigate}
      loading={loading}
    />
  ), [
    posts, 
    totalPages, 
    currentPage, 
    handleChangePage, 
    contests, 
    tagContainers, 
    handleAddTagContainer,
    handleDeleteTagContainer,
    handleTagSubmit,
    handleTagPageChange,
    handleTextChange,
    text,
    isAuthenticated,
    navigate,
    loading
  ]);

  const rightSidebar = useMemo(() => (
    <RightSidebar 
      announcements={announcements} 
      loading={loading} 
    />
  ), [announcements, loading]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {leftSidebar}
        {mainContent}
        {rightSidebar}
      </Grid>
    </Container>
  );
};

export default React.memo(Home);