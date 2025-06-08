import React, { memo } from 'react';
import { Typography, Paper, Button, Avatar, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

const AuthorCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 16,
  boxShadow: theme.shadows[2],
  background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
  marginBottom: theme.spacing(4),
}));

const AuthorAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginBottom: theme.spacing(2),
  border: '4px solid white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const AuthorName = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const FollowButton = styled(Button)(({ theme, isfollowing }) => ({
  marginTop: theme.spacing(2),
  borderRadius: 30,
  padding: '8px 24px',
  fontWeight: 600,
  boxShadow: isfollowing === 'true' ? 'none' : '0 4px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: isfollowing === 'true' ? '0 4px 10px rgba(0, 0, 0, 0.1)' : '0 6px 15px rgba(0, 0, 0, 0.15)',
  },
}));

const AuthorInfo = memo(({ author, isFollowing, handleFollowToggle }) => {
  const theme = useTheme();
  
  return (
    <AuthorCard elevation={3}>
      {author && (
        <RouterLink to={`/user/${author._id}`} style={{ textDecoration: 'none' }}>
          <AuthorAvatar
            src={`${author.icon}`}
            alt={author.nickname}
          />
        </RouterLink>
      )}
      
      {author && <AuthorName variant="h6">{author.nickname}</AuthorName>}
      
      <FollowButton
        variant={isFollowing ? 'outlined' : 'contained'}
        color={isFollowing ? 'secondary' : 'primary'}
        onClick={handleFollowToggle}
        isfollowing={isFollowing ? 'true' : 'false'}
        startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
      >
        {isFollowing ? 'フォロー解除' : 'フォロー'}
      </FollowButton>
    </AuthorCard>
  );
});

export default AuthorInfo;