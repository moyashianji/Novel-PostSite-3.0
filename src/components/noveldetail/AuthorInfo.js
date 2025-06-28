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
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.4)'
    : theme.shadows[2],
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.background.default})`
    : 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(4),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0, 0, 0, 0.5)'
      : '0 8px 25px rgba(0, 0, 0, 0.15)',
  }
}));

const AuthorAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginBottom: theme.spacing(2),
  border: theme.palette.mode === 'dark'
    ? `4px solid ${theme.palette.background.paper}`
    : '4px solid white',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 12px rgba(0, 0, 0, 0.5)'
    : '0 4px 12px rgba(0, 0, 0, 0.15)',
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
  boxShadow: isfollowing === 'true' 
    ? 'none' 
    : theme.palette.mode === 'dark'
      ? '0 4px 10px rgba(0, 0, 0, 0.3)'
      : '0 4px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s',
  backgroundColor: isfollowing === 'true'
    ? theme.palette.mode === 'dark'
      ? theme.palette.action.selected
      : theme.palette.grey[100]
    : theme.palette.primary.main,
  color: isfollowing === 'true'
    ? theme.palette.text.primary
    : theme.palette.primary.contrastText,
  border: isfollowing === 'true'
    ? `1px solid ${theme.palette.divider}`
    : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: isfollowing === 'true' 
      ? theme.palette.mode === 'dark'
        ? '0 4px 10px rgba(0, 0, 0, 0.4)'
        : '0 4px 10px rgba(0, 0, 0, 0.1)' 
      : theme.palette.mode === 'dark'
        ? '0 6px 15px rgba(0, 0, 0, 0.4)'
        : '0 6px 15px rgba(0, 0, 0, 0.15)',
    backgroundColor: isfollowing === 'true'
      ? theme.palette.mode === 'dark'
        ? theme.palette.action.hover
        : theme.palette.grey[200]
      : theme.palette.primary.dark,
  },
}));

const AuthorInfo = memo(({ author, isFollowing, handleFollowToggle }) => {
  const theme = useTheme();
  
  return (
    <AuthorCard elevation={2}>
      {author && (
        <AuthorAvatar
          src={author.icon}
          alt={author.nickname}
          component={RouterLink}
          to={`/user/${author._id}`}
        />
      )}
      
      {author && (
        <AuthorName variant="h6">
          {author.nickname}
        </AuthorName>
      )}
      
      <FollowButton
        variant={isFollowing ? "outlined" : "contained"}
        isfollowing={isFollowing ? 'true' : 'false'}
        onClick={handleFollowToggle}
        startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
      >
        {isFollowing ? 'フォロー解除' : 'フォロー'}
      </FollowButton>
    </AuthorCard>
  );
});

export default AuthorInfo;