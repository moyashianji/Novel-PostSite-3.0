// src/components/user/ProfileHeader.js
import React from 'react';
import {
  Typography, Box, Button, Avatar, Tooltip, useTheme, useMediaQuery
} from '@mui/material';
import { alpha, styled } from '@mui/system';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import TwitterIcon from '@mui/icons-material/Twitter';
import LaunchIcon from '@mui/icons-material/Launch';
import BrushIcon from '@mui/icons-material/Brush';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LinkIcon from '@mui/icons-material/Link';

// Styled components
const ProfileHeaderContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
}));

const BackgroundPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '40%',
  height: '100%',
  opacity: 0.05,
  background: `radial-gradient(circle, ${theme.palette.primary.main} 8%, transparent 8%) 0 0, 
              radial-gradient(circle, ${theme.palette.primary.main} 8%, transparent 8%) 8px 8px`,
  backgroundSize: '16px 16px',
  transform: 'rotate(15deg) translateX(10%) translateY(-20%)',
  zIndex: 0
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  marginRight: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: 80,
    height: 80,
    marginRight: theme.spacing(2),
  }
}));

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  minWidth: 80
}));

const LinksContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  flexWrap: 'wrap',
}));

const LinkButton = styled('button')(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  }
}));

const FavoriteAuthorsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const AuthorChip = styled('button')(({ theme }) => ({
  margin: theme.spacing(0.25),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
  color: theme.palette.secondary.main,
  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
  fontSize: '0.75rem',
  height: 26,
  padding: theme.spacing(0, 1),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.secondary.main, 0.2),
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  }
}));

const ProfileHeader = ({ 
  user, 
  workStats, 
  followerCount, 
  isFollowing, 
  onFollowToggle, 
  onLinkClick, 
  onAuthorTagClick 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 外部リンクの存在チェック
  const hasLinks = user && (user.xLink || user.pixivLink || user.otherLink);

  return (
    <ProfileHeaderContainer>
      <BackgroundPattern />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start' }}>
          <ProfileAvatar src={`${user.icon}`} alt={user.nickname} />
          
          <Box sx={{ flex: 1, mb: isMobile ? 2 : 0, textAlign: isMobile ? 'center' : 'left' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {user.nickname}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 600 }}>
              {user.description || "このユーザーは自己紹介を設定していません。"}
            </Typography>

            {/* 好きな作家タグ */}
            {user.favoriteAuthors && user.favoriteAuthors.length > 0 && (
              <FavoriteAuthorsContainer>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FavoriteIcon sx={{ fontSize: 18, color: 'secondary.main', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    好きな作家
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', maxHeight: 70, overflow: 'hidden' }}>
                  {user.favoriteAuthors.slice(0, 12).map((author, index) => (
                    <AuthorChip
                      key={index}
                      onClick={() => onAuthorTagClick(author)}
                    >
                      {author}
                    </AuthorChip>
                  ))}
                  {user.favoriteAuthors.length > 12 && (
                    <AuthorChip style={{ 
                      backgroundColor: 'transparent',
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.4)}`
                    }}>
                      +{user.favoriteAuthors.length - 12}人
                    </AuthorChip>
                  )}
                </Box>
              </FavoriteAuthorsContainer>
            )}

            {/* 外部リンク */}
            {hasLinks && (
              <LinksContainer>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <LinkIcon sx={{ fontSize: 18, color: 'primary.main', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    リンク
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {user.xLink && (
                    <Tooltip title="X (Twitter)">
                      <LinkButton onClick={() => onLinkClick(user.xLink)}>
                        <TwitterIcon style={{ fontSize: 20 }} />
                      </LinkButton>
                    </Tooltip>
                  )}
                  {user.pixivLink && (
                    <Tooltip title="Pixiv">
                      <LinkButton onClick={() => onLinkClick(user.pixivLink)}>
                        <BrushIcon style={{ fontSize: 20 }} />
                      </LinkButton>
                    </Tooltip>
                  )}
                  {user.otherLink && (
                    <Tooltip title="その他のリンク">
                      <LinkButton onClick={() => onLinkClick(user.otherLink)}>
                        <LaunchIcon style={{ fontSize: 20 }} />
                      </LinkButton>
                    </Tooltip>
                  )}
                </Box>
              </LinksContainer>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <StatsBox>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {workStats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  作品
                </Typography>
              </StatsBox>
              
              <StatsBox>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {workStats.series}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  シリーズ
                </Typography>
              </StatsBox>
              
              <StatsBox>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {followerCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  フォロワー
                </Typography>
              </StatsBox>
              
              <StatsBox>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {workStats.totalViews.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  総閲覧数
                </Typography>
              </StatsBox>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, ml: isMobile ? 0 : 2 }}>
            <Button
              variant={isFollowing ? 'contained' : 'outlined'}
              color="primary"
              onClick={onFollowToggle}
              startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
              sx={{ borderRadius: 8, minWidth: 150, py: 1 }}
            >
              {isFollowing ? 'フォロー中' : 'フォローする'}
            </Button>
          </Box>
        </Box>
      </Box>
    </ProfileHeaderContainer>
  );
};

export default ProfileHeader;