import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Paper,
  Badge
} from '@mui/material';
import { useAPI } from '../../hooks/useAPI';

// Import Material icons
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History'; // 新しく追加

const Sidebar = ({ onContentChange, currentContent }) => {
  const { 
    fetchMyWorks, 
    fetchMySeries, 
    fetchFollowingList, 
    fetchFollowerList, 
    fetchLikedPosts, 
    fetchBookshelf, 
    fetchBookmarks, 
    fetchContests, 
    fetchViewHistory // 閲覧履歴取得関数を追加

  } = useAPI();
  useEffect(() => {
    // If bookshelf is already selected (from navigation), fetch the data
    if (currentContent === 'bookshelf') {
      handleContentSelect('bookshelf', fetchBookshelf);
    }
  }, []);
  const handleContentSelect = async (contentType, fetchFunction) => {
    const data = await fetchFunction();
    if (data) {
      onContentChange(contentType, data);
    }
  };

  // Group menu items for better organization
  const menuGroups = [
    {
      title: "マイコンテンツ",
      items: [
        { 
          id: 'works', 
          label: '自分の作品一覧', 
          icon: <AutoStoriesIcon />, 
          fetchFn: fetchMyWorks 
        },
        { 
          id: 'series', 
          label: '自分のシリーズ一覧', 
          icon: <CollectionsBookmarkIcon />, 
          fetchFn: fetchMySeries 
        },
        { 
          id: 'contests', 
          label: 'コンテストを開催', 
          icon: <EmojiEventsIcon />, 
          fetchFn: fetchContests 
        },
      ]
    },
    {
      title: "コミュニティ",
      items: [
        { 
          id: 'following', 
          label: 'フォローリスト', 
          icon: <PersonAddIcon />, 
          fetchFn: fetchFollowingList 
        },
        { 
          id: 'followers', 
          label: 'フォロワーリスト', 
          icon: <PeopleAltIcon />, 
          fetchFn: fetchFollowerList 
        },
      ]
    },
    {
      title: "マイライブラリ",
      items: [
        { 
          id: 'likedPosts', 
          label: 'いいねした作品', 
          icon: <FavoriteIcon />, 
          fetchFn: fetchLikedPosts 
        },
        { 
          id: 'bookshelf', 
          label: '自分の本棚', 
          icon: <BookmarksIcon />, 
          fetchFn: fetchBookshelf 
        },
        { 
          id: 'bookmarks', 
          label: 'しおりを見る', 
          icon: <BookmarkIcon />, 
          fetchFn: fetchBookmarks 
        },
        { 
          id: 'viewHistory', 
          label: '閲覧履歴', 
          icon: <HistoryIcon />, 
          fetchFn: fetchViewHistory 
        },
      ]
    }
  ];

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          py: 3,
          px: 2,
          background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          マイページ
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          小説・ユーザー管理
        </Typography>
      </Box>
      
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 2,
          pt: 2,
          pb: 3,
        }}
      >
        {menuGroups.map((group, groupIndex) => (
          <React.Fragment key={group.title}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                px: 2, 
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontWeight: 'bold',
                display: 'block',
                mt: groupIndex > 0 ? 2 : 0,
                mb: 0.5
              }}
            >
              {group.title}
            </Typography>
            
            <List dense sx={{ pt: 0 }}>
              {group.items.map((item) => (
                <ListItem 
                  key={item.id}
                  disablePadding
                  sx={{ mb: 0.5 }}
                >
                  <Button
                    fullWidth
                    onClick={() => handleContentSelect(item.id, item.fetchFn)}
                    sx={{
                      borderRadius: 1.5,
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      color: currentContent === item.id ? 'white' : 'text.primary',
                      bgcolor: currentContent === item.id ? 'primary.main' : 'transparent',
                      '&:hover': {
                        bgcolor: currentContent === item.id ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                      },
                      transition: 'all 0.2s ease-in-out',
                      '&::before': currentContent === item.id ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
                        borderRadius: 1.5,
                      } : {},
                      ...( currentContent === item.id && {
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      })
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: currentContent === item.id ? 'white' : 'primary.main',
                      }}
                    >
                      {item.id === 'likedPosts' ? (
                        <Badge color="error" variant="dot">
                          {item.icon}
                        </Badge>
                      ) : item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: currentContent === item.id ? 'bold' : 'normal',
                      }}
                    />
                  </Button>
                </ListItem>
              ))}
            </List>
            
            {groupIndex < menuGroups.length - 1 && (
              <Divider sx={{ mt: 1.5, mb: 1.5 }} />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Paper>
  );
};

export default Sidebar;