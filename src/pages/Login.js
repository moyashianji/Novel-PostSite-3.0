import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  Container,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import ReCAPTCHA from 'react-google-recaptcha';
import { alpha, styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

// Custom styled components
const LoginPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  maxWidth: '450px',
  width: '100%',
  margin: '2em auto',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '&:hover': {
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-4px)'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: 'all 0.2s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.95rem',
  },
  '& .MuiInputAdornment-root': {
    color: theme.palette.primary.main,
  }
}));

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '10px 0',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: 'none',
  marginTop: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  '&:hover': {
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.2)}, transparent)`,
    transition: 'all 0.6s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));

const CaptchaContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  display: 'flex',
  justifyContent: 'center',
  transform: 'scale(0.9)',
  transformOrigin: 'left center',
  [theme.breakpoints.down('sm')]: {
    transform: 'scale(0.77)',
    marginLeft: '-20px',
  }
}));

const ForgotPasswordLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
  fontWeight: 500,
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  '&:hover': {
    color: theme.palette.primary.dark,
    textDecoration: 'underline',
  }
}));

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleCaptchaChange = (token) => {
    setRecaptchaToken(token);
    if (token) {
      setError(''); // Clear error when captcha is completed
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    if (!password) {
      setError('パスワードを入力してください');
      return;
    }
    
    if (captchaRequired && !recaptchaToken) {
      setError('CAPTCHAを完了してください');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password, recaptchaToken);
      
      if (result.success) {
        navigate('/mypage');
      } else {
        if (result.requireCaptcha) {
          setCaptchaRequired(true);
          setError('ログイン試行回数が多すぎます。CAPTCHAを完了してください');
        } else {
          setError(result.message || 'メールアドレスまたはパスワードが正しくありません');
        }
      }
    } catch (err) {
      setError('ネットワークエラー。後でもう一度お試しください');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <LoginPaper elevation={3}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '3px',
              background: theme.palette.primary.main,
              borderRadius: '3px'
            }
          }}
        >
          ログイン
        </Typography>
        
        {error && (
          <Slide direction="down" in={!!error} mountOnEnter unmountOnExit>
            <Alert 
              severity="error" 
              sx={{ mb: 2, borderRadius: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Slide>
        )}
        
        <Box component="form" onSubmit={handleLogin} noValidate>
          <StyledTextField
            label="メールアドレス"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            disabled={isSubmitting}
            required
          />
          
          <StyledTextField
            label="パスワード"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            disabled={isSubmitting}
            required
          />
          
          {captchaRequired && (
            <CaptchaContainer>
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={handleCaptchaChange}
              />
            </CaptchaContainer>
          )}
          
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <ForgotPasswordLink to="/forgot-password">
              パスワードをお忘れですか？
            </ForgotPasswordLink>
          </Box>
          
          <LoginButton
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={isSubmitting}
            startIcon={isSubmitting ? undefined : <LoginIcon />}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'ログイン'
            )}
          </LoginButton>
        </Box>
        
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            または
          </Typography>
        </Divider>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            アカウントをお持ちでないですか？
          </Typography>
          <Button 
            component={Link} 
            to="/register" 
            color="secondary" 
            sx={{ 
              mt: 1, 
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            今すぐ登録する
          </Button>
        </Box>
      </LoginPaper>
    </Container>
  );
};

export default Login;