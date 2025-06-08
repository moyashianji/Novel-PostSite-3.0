import React, { useState, useRef } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  Container,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Link,
  Fade,
  Snackbar
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  KeyboardBackspace as KeyboardBackspaceIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import ReCAPTCHA from 'react-google-recaptcha';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// スタイル付きコンポーネント
const ForgotPasswordCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  overflow: 'visible',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: 'all 0.2s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light,
    },
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
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
}));

const BackButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '8px 16px',
  textTransform: 'none',
  boxShadow: 'none',
  fontSize: '0.9rem',
}));

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();
  
  const API_URL = process.env.REACT_APP_API_URL;

  const handleCaptchaChange = (token) => {
    setRecaptchaToken(token);
    // captchaエラーをクリア
    if (errorMessages.recaptcha) {
      const newErrors = {...errorMessages};
      delete newErrors.recaptcha;
      setErrorMessages(newErrors);
    }
  };
  
  const handleCaptchaExpired = () => {
    setRecaptchaToken(null);
    setErrorMessages({...errorMessages, recaptcha: 'ReCAPTCHAの有効期限が切れました。再度確認をお願いします。'});
  };

  const handleResetPassword = async () => {
    const errors = {};

    // クライアント側バリデーション
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    if (!recaptchaToken) {
      errors.recaptcha = 'Recaptchaを完了してください';
    }
 
    // エラーがある場合は表示して終了
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recaptchaToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setSnackbarMessage('パスワード再設定のメールを送信しました');
        setSnackbarOpen(true);
      } else {
        setErrorMessages({ general: data.message });
      }
    } catch (error) {
      setErrorMessages({ general: 'サーバーエラーが発生しました。後でもう一度お試しください。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // 成功画面のレンダリング
  if (isSuccess) {
    return (
      <Container maxWidth="sm" sx={{ pt: 8, pb: 4 }}>
        <ForgotPasswordCard>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
              メールを送信しました
            </Typography>
            <Typography variant="body1" paragraph>
              {email} 宛にパスワード再設定用のリンクを送信しました。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              メールに記載されているリンクをクリックして、パスワードの再設定を完了してください。
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              メールが届かない場合は、迷惑メールフォルダを確認するか、別のメールアドレスでお試しください。
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGoToLogin}
              sx={{ mt: 3 }}
              startIcon={<KeyboardBackspaceIcon />}
            >
              ログイン画面に戻る
            </Button>
          </CardContent>
        </ForgotPasswordCard>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ pt: 8, pb: 4 }}>
      <ForgotPasswordCard>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
            パスワードをお忘れですか？
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            登録したメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
          </Typography>
          
          {errorMessages.general && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
              {errorMessages.general}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <StyledTextField
              label="メールアドレス"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errorMessages.email}
              helperText={errorMessages.email || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              autoFocus
              disabled={isSubmitting}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={handleCaptchaChange}
              onExpired={handleCaptchaExpired}
              ref={recaptchaRef}
            />
          </Box>
          
          {errorMessages.recaptcha && (
            <Typography color="error" variant="body2" align="center" sx={{ mb: 2 }}>
              {errorMessages.recaptcha}
            </Typography>
          )}
          
          <SubmitButton
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleResetPassword}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          >
            {isSubmitting ? '送信中...' : 'パスワード再設定メールを送信'}
          </SubmitButton>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <BackButton
              variant="text"
              color="inherit"
              onClick={handleGoToLogin}
              startIcon={<KeyboardBackspaceIcon />}
            >
              ログイン画面に戻る
            </BackButton>
          </Box>
        </CardContent>
      </ForgotPasswordCard>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default ForgotPassword;