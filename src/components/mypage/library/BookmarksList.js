import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Paper, 
  IconButton, 
  Tooltip, 
  Divider,
  Button,
  Grid,
  Avatar,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LinearProgress from '@mui/material/LinearProgress';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TextFieldsIcon from '@mui/icons-material/TextFields';

const BookmarksList = ({ bookmarks = [], onDelete }) => {
  const navigate = useNavigate();

  const handleBookmarkClick = (novelId, bookmark) => {
    if (novelId) {
      // テキスト断片が短すぎる場合は含めない
      const textFragmentToSend = bookmark.textFragment && bookmark.textFragment.length > 5
      ? bookmark.textFragment
      : null;
    
      console.log('しおりのテキストフラグメント:', bookmark.textFragment);
console.log('実際に送られるフラグメント:', textFragmentToSend);
      // 拡張されたしおり情報を含めてナビゲーション
      navigate(`/novel/${novelId}`, { 
        state: { 
          fromBookmark: true,
          scrollTo: bookmark.position,
          pageNumber: bookmark.pageNumber,
          textFragment: textFragmentToSend
        } 
      });
    }
  };
  
  // Handle delete with stopPropagation to prevent navigation
  const handleDelete = (e, bookmarkId) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(bookmarkId);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <Paper 
        elevation={0} 
        variant="outlined"
        sx={{ 
          padding: 4, 
          width: '100%', 
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,0.01)',
          borderStyle: 'dashed'
        }}
      >
        <BookmarkIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>しおりはありません</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          小説を読みながらしおりを追加すると、ここに表示されます。読書の途中で中断してもすぐに再開できます。
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/search')}
          startIcon={<MenuBookIcon />}
          sx={{ borderRadius: 6, px: 3 }}
        >
          小説を探す
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {bookmarks.map((bookmark, index) => {
        // Get novel information safely
        const novel = bookmark.novelId || {};
        const novelTitle = novel.title || '不明な作品';
        const novelId = novel._id;
        const novelCover = novel.coverImage; // Assuming there might be a cover image
        
        // 進捗率を計算
        const totalLength = novel.totalLength || 100;
        const progressPercent = Math.round((bookmark.position / totalLength) * 100);
        
        return (
          <Card
            key={index}
            elevation={1}
            sx={{ 
              marginBottom: 2, 
              width: '100%', 
              cursor: 'pointer',
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              position: 'relative',
              overflow: 'visible',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 3,
                '& .arrow-icon': {
                  opacity: 1,
                  transform: 'translateX(0)',
                }
              } 
            }}
            onClick={() => handleBookmarkClick(novelId, bookmark)}
          >
            {/* Arrow indicator for navigation */}
            <ArrowForwardIosIcon 
              className="arrow-icon"
              sx={{ 
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%) translateX(10px)',
                opacity: 0,
                transition: 'all 0.3s ease',
                color: 'primary.main',
                fontSize: 18
              }} 
            />
            
            <CardContent sx={{ p: 0 }}>
              <Grid container>
                {/* Left side - Book Cover (if available) */}
                {novelCover && (
                  <Grid item xs={2} sm={1}>
                    <Box 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1
                      }}
                    >
                      <Avatar 
                        variant="rounded" 
                        src={novelCover} 
                        alt={novelTitle}
                        sx={{ width: 48, height: 64, boxShadow: 1 }}
                      >
                        <MenuBookIcon />
                      </Avatar>
                    </Box>
                  </Grid>
                )}
                
                {/* Main Content */}
                <Grid item xs={novelCover ? 10 : 12} sm={novelCover ? 11 : 12}>
                  <Box sx={{ p: 2 }}>
                    {/* Bookmark icon and title */}
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        <BookmarkIcon 
                          color="primary" 
                          sx={{ mr: 1, fontSize: 20, opacity: 0.8 }}
                        />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold',
                            lineHeight: 1.3
                          }}
                        >
                          {novelTitle}
                        </Typography>
                      </Box>
                      
                      {/* Delete button */}
                      {onDelete && (
                        <Tooltip title="しおりを削除">
                          <IconButton 
                            size="small" 
                            onClick={(e) => handleDelete(e, bookmark._id)}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': { color: 'error.main' } 
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    
                    {/* Progress bar */}
                    <Box sx={{ mb: 1.5 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={progressPercent} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(0,0,0,0.05)',
                          mb: 1
                        }}
                      />
                      
                      <Box display="flex" justifyContent="space-between">
                        <Box display="flex" gap={1}>
                          {/* ページ情報が存在する場合に表示 */}
                          {bookmark.pageNumber && (
                            <Tooltip title="ページ番号">
                              <Chip
                                size="small"
                                icon={<AutoStoriesIcon sx={{ fontSize: '14px !important' }} />}
                                label={`ページ ${bookmark.pageNumber}`}
                                sx={{ 
                                  height: 24,
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  fontWeight: 'medium',
                                  '& .MuiChip-label': { px: 1 }
                                }}
                              />
                            </Tooltip>
                          )}
                          

                        </Box>
                        
                        <Tooltip title="しおりを追加した日時">
                          <Box display="flex" alignItems="center">
                            <AccessTimeIcon 
                              sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} 
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(bookmark.date).toLocaleString('ja-JP')}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    {/* テキスト断片がある場合に表示 */}
                    {bookmark.textFragment && (
                      <Box display="flex" alignItems="flex-start" sx={{ mt: 1 }}>
                        <TextFieldsIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1, mt: 0.5 }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontStyle: 'italic',
                            bgcolor: 'rgba(0,0,0,0.02)',
                            p: 1.5,
                            borderRadius: 1,
                            borderLeft: '3px solid',
                            borderColor: 'primary.light',
                            fontSize: '0.8rem'
                          }}
                        >
                          「{bookmark.textFragment.length > 50 
                            ? `${bookmark.textFragment.substring(0, 50)}...` 
                            : bookmark.textFragment}」
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default BookmarksList;