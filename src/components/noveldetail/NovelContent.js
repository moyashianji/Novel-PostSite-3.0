import React, { memo } from 'react';
import { Typography, Box, Container, Paper, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import Statistics from './Statistics';
import Tags from './Tags';
import AutoScroll from './AutoScroll';
import Content from './Content';
import BookmarkIndicator from './BookmarkIndicator';
import ActionButtons from './ActionButtons';
import SeriesNavigation from './SeriesNavigation'; // SeriesNavigationをインポート

const NovelHeaderContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const NovelTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2rem',
  lineHeight: 1.3,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const NovelDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(3),
}));

const NovelContainer = styled(Container)(({ theme }) => ({
  maxWidth: '800px',
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(5),
  },
}));

const NovelContent = memo(({
  post,
  viewCount,
  goodCount,
  bookshelfCount,
  hasLiked,
  isBookmarkMode,
  scrollSpeed,
  setScrollSpeed,
  handleGoodClick,
  handleBookshelfClick,
  handleBookmarkClick,
  handleTextClick,
  handleTagClick,
  isInBookshelf,
  postDate,
  currentPage,
  setCurrentPage,
  textFragment,
  showSnackbar, // showSnackbar関数を親から受け取る
  seriesData, // SeriesNavigationに渡すためのシリーズデータ
  currentPostId // SeriesNavigationに渡すための現在の投稿ID
}) => (
  <NovelContainer>
    <NovelHeaderContainer>
      <NovelTitle variant="h4">
        {post.title}
      </NovelTitle>
      <NovelDescription variant="body1">
        {post.description}
      </NovelDescription>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          border: '1px solid',
          borderColor: 'divider',
          mb: 3
        }}
      >
        <Statistics
          viewCount={viewCount}
          goodCount={goodCount}
          bookshelfCount={bookshelfCount}
          postDate={postDate}
        />
      </Paper>
      
      <Tags tags={post.tags} handleTagClick={handleTagClick} />
    </NovelHeaderContainer>
    
    <Divider sx={{ my: 4 }} />
    
    <AutoScroll scrollSpeed={scrollSpeed} setScrollSpeed={setScrollSpeed} />
    
    <Content
      content={post.content}
      isBookmarkMode={isBookmarkMode}
      handleTextClick={handleTextClick}
      handleBookmarkError={(message) => showSnackbar(message, 'warning')} // 追加
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      textFragment={textFragment}
      post={post}
    />
    
    <BookmarkIndicator isBookmarkMode={isBookmarkMode} handleBookmarkClick={handleBookmarkClick} />
    
    <ActionButtons
      hasLiked={hasLiked}
      isInBookshelf={isInBookshelf}
      handleGoodClick={handleGoodClick}
      handleBookshelfClick={handleBookshelfClick}
    />

    {/* コンテンツの下にSeriesNavigationを追加 */}
    {seriesData && (
      <Box sx={{ mt: 5 }}>
        <SeriesNavigation 
          currentPostId={currentPostId || post._id}
          seriesData={seriesData}
        />
      </Box>
    )}
  </NovelContainer>
));

export default NovelContent;