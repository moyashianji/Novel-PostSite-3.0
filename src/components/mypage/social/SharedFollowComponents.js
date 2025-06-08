// SharedFollowComponents.jsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar,
  Chip,
  Button,
  Tooltip,
  Paper
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

// Shared user list item component
export const UserListItem = ({ user, API_URL, onUserClick, isFollowing = false }) => {
  // Truncate description if too long
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  // Handle follow/unfollow button click (prevent propagation to the card)
  const handleFollowAction = (e) => {
    e.stopPropagation();
    // Implement follow/unfollow logic here
    console.log(`${isFollowing ? 'Unfollow' : 'Follow'} user:`, user._id);
  };

  return (
    <Card
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
      onClick={() => onUserClick(user._id)}
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
      
      <CardContent sx={{ display: 'flex', p: 2 }}>
        {/* Left side - Avatar with status indicator */}
        <Box sx={{ position: 'relative', mr: 2 }}>
          <Avatar 
            src={`${API_URL}${user.icon}`} 
            alt={user.nickname} 
            sx={{ 
              width: 56, 
              height: 56,
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
          />
          {/* Online status dot (if available in user data) */}
          {user.isOnline && (
            <Box 
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                backgroundColor: '#4caf50',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
          )}
        </Box>
        
        {/* Center - User info */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 1 }}>
              {user.nickname}
            </Typography>
            
            {/* User verification badge or special status */}
            {user.isVerified && (
              <Tooltip title="認証済みユーザー">
                <Chip 
                  label="認証済" 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.65rem',
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiChip-label': { px: 1 }
                  }} 
                />
              </Tooltip>
            )}
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3,
              mt: 0.5,
              mb: 1,
              minHeight: 32
            }}
          >
            {truncateText(user.description, 100)}
          </Typography>
          
          {/* User stats */}
          <Box display="flex" alignItems="center" mt={0.5}>
            <Tooltip title="フォロワー">
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="caption" color="text.secondary">
                  {user.followers?.length || 0}
                </Typography>
              </Box>
            </Tooltip>
            
            <Tooltip title="作品数">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AutoStoriesIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="caption" color="text.secondary">
                  {user.works || 0}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Right - Action buttons */}
        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
          <Button
            variant={isFollowing ? "outlined" : "contained"}
            color={isFollowing ? "error" : "primary"}
            size="small"
            onClick={handleFollowAction}
            startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
            sx={{ 
              borderRadius: 6,
              fontSize: '0.75rem',
              px: 1.5,
              py: 0.5,
              minWidth: 'auto'
            }}
          >
            {isFollowing ? 'フォロー解除' : 'フォロー'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// EmptyFollowList component for when there are no followers/following
export const EmptyFollowList = ({ type }) => {
  const isFollowers = type === 'followers';
  
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
      <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {isFollowers ? 'フォロワーはいません' : 'フォローしているユーザーはいません'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
        {isFollowers 
          ? '他のユーザーにフォローされると、ここに表示されます。あなたの作品を充実させて、読者を増やしましょう。'
          : '気になる作家や読者をフォローすると、ここに表示されます。新しい作品の投稿を見つけやすくなります。'}
      </Typography>
      {!isFollowers && (
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />}
          sx={{ borderRadius: 6, px: 3 }}
          href="/discover"
        >
          ユーザーを探す
        </Button>
      )}
    </Paper>
  );
};