import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  IconButton, 
  Tooltip,
  Skeleton 
} from '@mui/material';
import { 
  Announcement as AnnouncementIcon,
  MoreHoriz as MoreHorizIcon 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AnnouncementsSkeleton from './Skeletons/AnnouncementsSkeleton';

const ADMIN_USER_ID = '66c360d0dd9964e79ab728b6';
const MAX_ANNOUNCEMENTS_DISPLAY = 5;

const AnnouncementList = ({ announcements }) => (
  <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
    {announcements.map((post) => (
      <Box
        component="li"
        key={post._id}
        sx={{
          '&:not(:last-child)': {
            borderBottom: '1px solid',
            borderColor: 'divider',
          }
        }}
      >
        <Box
          component={Link}
          to={`/novel/${post._id}`}
          sx={{
            display: 'block',
            p: 2,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'background-color 0.2s',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.04)',
            }
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.secondary',
            }}
          >
            {new Date(post.createdAt).toLocaleDateString('ja-JP', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
);

const Announcements = ({ announcements, loading }) => {
  const displayedAnnouncements = announcements.slice(0, MAX_ANNOUNCEMENTS_DISPLAY);
  const hasMoreAnnouncements = announcements.length > MAX_ANNOUNCEMENTS_DISPLAY;
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: '#ff5722',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AnnouncementIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            お知らせ
          </Typography>
        </Box>
        {hasMoreAnnouncements && (
          <Tooltip title="すべてのお知らせを見る">
            <IconButton 
              size="small" 
              component={Link} 
              to={`/user/${ADMIN_USER_ID}`}
              sx={{ color: 'white' }}
            >
              <MoreHorizIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <Box sx={{ p: 0 }}>
        {loading ? (
          <AnnouncementsSkeleton />
        ) : (
          displayedAnnouncements.length > 0 ? (
            <AnnouncementList announcements={displayedAnnouncements} />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                現在お知らせはありません。
              </Typography>
            </Box>
          )
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(Announcements);