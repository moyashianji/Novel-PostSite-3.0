import React from 'react';
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
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Twitter as TwitterIcon, 
  Facebook as FacebookIcon, 
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Send as SendIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactSupport as ContactSupportIcon,
  Gavel as GavelIcon,
  PrivacyTip as PrivacyTipIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';

// Styled components
const FooterContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(to right, #1a237e, #283593)`,
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'180\' height=\'180\' viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M81.28 88H68.413l19.298 19.298L81.28 88zm2.107 0h13.226L90 107.838 83.387 88zm15.334 0h12.866l-19.298 19.298L98.72 88zm-32.927-2.207L73.586 78h32.827l.5.5 7.294 7.293L115.414 87l-24.707 24.707-.707.707L64.586 87l1.207-1.207zm2.62.207L74 80.414 79.586 86H68.414L70 85.414zM120.414 73l.707.707-3.293 3.293-24.707 24.707-.707.707-20.414-20.414.707-.707 19.298-19.298.707-.707 1.207 1.207zM63.586 73l-1.207 1.207 3.293 3.293L91.414 103l.707.707 15.293-15.293-1.207-1.207-3.293 3.293-7.293-7.293L69.414 73l-5.828 5.828zM87 111.414L92.586 117H81.414L87 111.414z\' fill=\'%23ffffff\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    backgroundSize: 'cover',
    opacity: 0.1,
  }
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    color: theme.palette.secondary.light,
    transform: 'translateX(3px)',
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginRight: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
    transform: 'translateY(-3px)',
    boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  letterSpacing: 1,
  position: 'relative',
  display: 'inline-block',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: '25%',
    width: '50%',
    height: 3,
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 4,
  }
}));

const ScrollToTop = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(3),
  top: -20,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.secondary.dark,
  },
}));

const LightPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.05)',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  height: '100%',
}));

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
          {/* Logo and About */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <LogoText variant="h5" gutterBottom>
                A7Studio
              </LogoText>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, maxWidth: { md: '90%' } }}>
                創作活動を共有し、読者とつながる小説コミュニティプラットフォーム。自分だけの物語を世界へ。
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <SocialButton aria-label="twitter">
                  <TwitterIcon />
                </SocialButton>
                <SocialButton aria-label="facebook">
                  <FacebookIcon />
                </SocialButton>
                <SocialButton aria-label="instagram">
                  <InstagramIcon />
                </SocialButton>
                <SocialButton aria-label="youtube">
                  <YouTubeIcon />
                </SocialButton>
              </Box>
            </Box>
          </Grid>
          
          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <LightPaper elevation={0}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                サイト
              </Typography>
              <Stack>
                <FooterLink href="/">
                  <HomeIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                  ホーム
                </FooterLink>
                <FooterLink href="/about">
                  <InfoIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                  サイト情報
                </FooterLink>
                <FooterLink href="/contact">
                  <ContactSupportIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                  お問い合わせ
                </FooterLink>
                <FooterLink href="/terms">
                  <GavelIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                  利用規約
                </FooterLink>
                <FooterLink href="/privacy">
                  <PrivacyTipIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                  プライバシー
                </FooterLink>
              </Stack>
            </LightPaper>
          </Grid>
          
          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <LightPaper elevation={0}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                作家向け
              </Typography>
              <Stack>
                <FooterLink href="/contests">
                  コンテスト情報
                </FooterLink>
                <FooterLink href="/guides">
                  執筆ガイド
                </FooterLink>
                <FooterLink href="/faq">
                  <HelpOutlineIcon fontSize="small" sx={{ mr: 1, fontSize: 16 }} />
                  よくある質問
                </FooterLink>
                <FooterLink href="/tips">
                  執筆のコツ
                </FooterLink>
                <FooterLink href="/community">
                  コミュニティ
                </FooterLink>
              </Stack>
            </LightPaper>
          </Grid>
          
          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <LightPaper elevation={0}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                最新情報を受け取る
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                新作小説やコンテスト情報など、最新のお知らせをメールで受け取りましょう。
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  variant="outlined"
                  placeholder="example@email.com"
                  size="small"
                  fullWidth
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                />
                <Button 
                  variant="contained" 
                  color="secondary" 
                  sx={{ ml: 1, borderRadius: 1 }}
                  endIcon={<SendIcon />}
                >
                  登録
                </Button>
              </Box>
              
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                ※登録することで、プライバシーポリシーに同意したことになります。
              </Typography>
            </LightPaper>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: { xs: 2, sm: 0 } }}>
            &copy; {new Date().getFullYear()} A7Studio. All Rights Reserved.
          </Typography>
          
          <Box>
            <FooterLink href="/sitemap" variant="body2" sx={{ ml: 2, mb: 0 }}>
              サイトマップ
            </FooterLink>
          </Box>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;