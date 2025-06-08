import React from 'react';
import { Box, CircularProgress } from '@mui/material';

// Import content components
import WorksList from './works/WorksList';
import SeriesList from './series/SeriesList';
import FollowingList from './social/FollowingList';
import FollowersList from './social/FollowersList';
import LikedPostsList from './library/LikedPostsList';
import BookshelfList from './library/BookshelfList';
import BookmarksList from './library/BookmarksList';
import ContestsList from './contests/ContestsList';
import ViewHistoryList from './library/ViewHistoryList'; // 新しく追加

const ContentSection = ({ contentType, contentData, user, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  const renderContent = () => {
    switch (contentType) {
      case 'works':
        return <WorksList works={contentData} />;
      case 'series':
        return <SeriesList series={contentData} />;
      case 'following':
        return <FollowingList followingList={contentData} />;
      case 'followers':
        return <FollowersList followerList={contentData} />;
      case 'likedPosts':
        return <LikedPostsList likedPosts={contentData} />;
      case 'bookshelf':
        return <BookshelfList bookshelf={contentData} />;
      case 'bookmarks':
        return <BookmarksList bookmarks={contentData} />;
      case 'contests':
        return <ContestsList contests={contentData} user={user} />;
        case 'viewHistory':
          return <ViewHistoryList viewHistory={contentData} />; // 新しく追加
    
        default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {renderContent()}
    </Box>
  );
};

export default ContentSection;
