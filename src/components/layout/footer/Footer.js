import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Link, 
  Grid, 
  Container, 
  Divider, 
  TextField, 
  Button, 
  IconButton,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Twitter as TwitterIcon, 
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactSupport as ContactSupportIcon,
  Gavel as GavelIcon,
  PrivacyTip as PrivacyTipIcon,
  HelpOutline as HelpOutlineIcon,
  Email as EmailIcon
} from '@mui/icons-material';

// Discord icon component (since it's not in MUI icons)
const DiscordIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// Styled components
const FooterContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 103, 103, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)`,
    pointerEvents: 'none'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
  }
}));

const FooterSection = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0.8
  }
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: 'rgba(255,255,255,0.8)',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  fontSize: '0.9rem',
  position: 'relative',
  '&:hover': {
    color: theme.palette.common.white,
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: 'translateX(8px)',
    paddingLeft: theme.spacing(1.5),
    '&::before': {
      width: '3px',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '0px',
    height: '20px',
    backgroundColor: theme.palette.secondary.main,
    transition: 'width 0.3s ease',
    borderRadius: '0 2px 2px 0'
  }
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  width: 48,
  height: 48,
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
    '&.twitter': {
      backgroundColor: '#1da1f2',
      borderColor: '#1da1f2',
    },
    '&.discord': {
      backgroundColor: '#5865f2',
      borderColor: '#5865f2',
    },
    '&.instagram': {
      background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
      borderColor: '#bc1888',
    },
    '&.youtube': {
      backgroundColor: '#ff0000',
      borderColor: '#ff0000',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const LogoSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    textAlign: 'left'
  }
}));

const NovelCrest = styled(Typography)(({ theme }) => ({
  fontWeight: '800',
  letterSpacing: 2,
  position: 'relative',
  display: 'inline-block',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontSize: '2rem',
  marginBottom: theme.spacing(1),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: 4,
    [theme.breakpoints.up('md')]: {
      left: 0,
      transform: 'none',
      width: '80%'
    }
  }
}));

const ScrollToTop = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(3),
  top: 10,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  width: 48,
  height: 48,
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
  },
  '&:active': {
    transform: 'translateY(-1px)',
  }
}));



const NewsletterInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255,255,255,0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.secondary.main,
      borderWidth: 2,
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255,255,255,0.12)',
    }
  },
  '& .MuiInputBase-input': {
    color: theme.palette.common.white,
    '&::placeholder': {
      color: 'rgba(255,255,255,0.6)',
      opacity: 1,
    }
  }
}));

const SubscribeButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  transition: 'all 0.3s ease',
  fontWeight: 'bold',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
  }
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  color: 'rgba(255,255,255,0.8)',
  fontSize: '0.9rem',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.secondary.main,
    fontSize: '1.1rem'
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
  color: theme.palette.common.white,
  position: 'relative',
  paddingBottom: theme.spacing(1),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '30px',
    height: '2px',
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 2
  }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(76, 175, 80, 0.2)',
  color: '#4caf50',
  border: '1px solid rgba(76, 175, 80, 0.3)',
  fontSize: '0.75rem',
  marginTop: theme.spacing(1)
}));

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [discordMemberCount, setDiscordMemberCount] = useState(11094); // デフォルト値
  const [isLoading, setIsLoading] = useState(false);
  
  // Discord APIからメンバー数を取得
  useEffect(() => {
    const fetchDiscordMembers = async () => {
      setIsLoading(true);
      try {
        // Discord Invite APIを使用してメンバー数を取得
        const response = await fetch('https://discord.com/api/v10/invites/TsbXmNWq?with_counts=true', {
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.approximate_member_count) {
            setDiscordMemberCount(data.approximate_member_count);
          }
        }
      } catch (error) {
        console.log('Discord API取得エラー:', error);
        // エラーの場合はデフォルト値を使用
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscordMembers();
    
    // 5分ごとに更新
    const interval = setInterval(fetchDiscordMembers, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <FooterContainer>
      <ScrollToTop onClick={handleScrollToTop} aria-label="scroll to top">
        <KeyboardArrowUpIcon />
      </ScrollToTop>
      
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info & Contact */}
          <Grid item xs={12} md={4}>
            <FooterSection elevation={0}>
              <LogoSection>
                <NovelCrest variant="h4">
                  NovelCrest
                </NovelCrest>
              </LogoSection>
              
              <Typography variant="body2" sx={{ 
                mb: 3, 
                opacity: 0.9, 
                lineHeight: 1.7,
                fontSize: '0.95rem'
              }}>
                創作活動を共有し、読者とつながる小説コミュニティプラットフォーム。あなたの物語を世界へ届けます。
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <ContactInfo>
                  <EmailIcon />
                  support@novelcrest.com
                </ContactInfo>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <SocialButton className="twitter" aria-label="twitter">
                  <TwitterIcon />
                </SocialButton>
                <SocialButton className="discord" aria-label="discord">
                  <DiscordIcon />
                </SocialButton>
                <SocialButton className="instagram" aria-label="instagram">
                  <InstagramIcon />
                </SocialButton>
                <SocialButton className="youtube" aria-label="youtube">
                  <YouTubeIcon />
                </SocialButton>
              </Box>
            </FooterSection>
          </Grid>
          
          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <FooterSection elevation={0}>
              <SectionTitle variant="h6">
                サイト
              </SectionTitle>
              <Stack>
                <FooterLink href="/">
                  <HomeIcon fontSize="small" sx={{ mr: 1.5, fontSize: 18 }} />
                  ホーム
                </FooterLink>
                <FooterLink href="/about">
                  <InfoIcon fontSize="small" sx={{ mr: 1.5, fontSize: 18 }} />
                  サイト情報
                </FooterLink>
                <FooterLink href="/contact">
                  <ContactSupportIcon fontSize="small" sx={{ mr: 1.5, fontSize: 18 }} />
                  お問い合わせ
                </FooterLink>
                <FooterLink href="/terms">
                  <GavelIcon fontSize="small" sx={{ mr: 1.5, fontSize: 18 }} />
                  利用規約
                </FooterLink>
                <FooterLink href="/privacy">
                  <PrivacyTipIcon fontSize="small" sx={{ mr: 1.5, fontSize: 18 }} />
                  プライバシーポリシー
                </FooterLink>
              </Stack>
            </FooterSection>
          </Grid>
          
          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <FooterSection elevation={0}>
              <SectionTitle variant="h6">
                作家向け
              </SectionTitle>
              <Stack>
                <FooterLink href="/contests">
                  コンテスト情報
                </FooterLink>
                <FooterLink href="/guides">
                  執筆ガイド
                </FooterLink>
                <FooterLink href="/faq">
                  <HelpOutlineIcon fontSize="small" sx={{ mr: 1.5, fontSize: 18 }} />
                  よくある質問
                </FooterLink>
                <FooterLink href="/tips">
                  執筆のコツ
                </FooterLink>
                <FooterLink href="/community">
                  コミュニティ
                </FooterLink>
              </Stack>
            </FooterSection>
          </Grid>
          
          {/* Contact & Support */}
          <Grid item xs={12} md={4}>
            <FooterSection elevation={0}>
              <SectionTitle variant="h6">
                サポート & コミュニティ
              </SectionTitle>
              <Typography variant="body2" sx={{ 
                mb: 3, 
                opacity: 0.9, 
                lineHeight: 1.6,
                fontSize: '0.9rem'
              }}>
                ご質問やサポートが必要でしたら、お気軽にお問い合わせください。
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  href="https://discord.gg/TsbXmNWq"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<DiscordIcon />}
                  sx={{
                    borderColor: '#5865f2',
                    color: '#5865f2',
                    backgroundColor: 'rgba(88, 101, 242, 0.1)',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#5865f2',
                      color: 'white',
                      borderColor: '#5865f2',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(88, 101, 242, 0.3)',
                    }
                  }}
                >
                  Discordサーバーに参加
                </Button>
              </Box>
              
              <Typography variant="body2" sx={{ 
                opacity: 0.8,
                fontSize: '0.85rem',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>

              </Typography>
            </FooterSection>
          </Grid>
        </Grid>
        
        <Divider sx={{ 
          my: 4, 
          backgroundColor: 'rgba(255,255,255,0.15)',
          height: 1
        }} />
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2
          }}
        >
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.7)',
            mb: { xs: 2, sm: 0 },
            fontSize: '0.85rem'
          }}>
            &copy; {new Date().getFullYear()} NovelCrest. All Rights Reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <FooterLink 
              href="/sitemap" 
              variant="body2" 
              sx={{ 
                mb: 0, 
                fontSize: '0.85rem',
                '&:hover': {
                  transform: 'none',
                  paddingLeft: 0
                }
              }}
            >
              サイトマップ
            </FooterLink>
            <FooterLink 
              href="/status" 
              variant="body2" 
              sx={{ 
                mb: 0, 
                fontSize: '0.85rem',
                '&:hover': {
                  transform: 'none',
                  paddingLeft: 0
                }
              }}
            >
              サーバー状況
            </FooterLink>
          </Box>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;