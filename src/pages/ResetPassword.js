import React, { useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  Container,
  InputAdornment,
  IconButton,
  LinearProgress,
  Alert,
  CircularProgress,
  Fade,
  Card,
  CardContent,
  Link,
  Divider
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import ReCAPTCHA from 'react-google-recaptcha';
import zxcvbn from 'zxcvbn';  // パスワード強度チェックライブラリ
import { styled, alpha } from '@mui/material/styles';

// スタイル付きコンポーネント
const ResetPasswordCard = styled(Card)(({ theme }) => ({
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

const PasswordStrengthBar = styled(LinearProgress)(({ theme, strength }) => {
  const colors = [
    theme.palette.error.main, // 弱い (0)
    theme.palette.error.light, // 弱い (1)
    theme.palette.warning.main, // 中 (2)
    theme.palette.success.main, // 強い (3)
  ];
  
  return {
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: alpha(colors[strength] || colors[0], 0.2),
    '& .MuiLinearProgress-bar': {
      backgroundColor: colors[strength] || colors[0],
    },
  };
});

const PasswordStrengthLabel = styled(Typography)(({ theme, strength }) => {
  const colors = [
    theme.palette.error.main, // 弱い (0)
    theme.palette.error.light, // 弱い (1)
    theme.palette.warning.main, // 中 (2)
    theme.palette.success.main, // 強い (3)
  ];
  
  return {
    color: colors[strength] || colors[0],
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textAlign: 'right',
  };
});

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

const ResetPassword = () => {
  const [searchParams] = useSearchParams();  // クエリパラメータを取得
  const token = searchParams.get('token');  // "token" パラメータを取得
  const recaptchaRef = useRef(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setPasswordConfirmation] = useState('');
  const [error, setError] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中かどうかの状態
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // パスワード強度の評価を適切に初期化・設定するための変更
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const result = zxcvbn(newPassword);
    // zxcvbnのscoreは0〜4の範囲で返されるが、万一のために範囲外の場合の処理
    setPasswordStrength(result ? Math.min(result.score, 3) : 0); 
  };

  // パスワード表示/非表示の切り替え
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // ReCAPTCHAの変更時処理
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setRecaptchaVerified(true);
    // recaptchaエラーをクリア
    if (error.recaptcha) {
      const newErrors = {...error};
      delete newErrors.recaptcha;
      setError(newErrors);
    }
  };

  // ReCAPTCHAのトークンが無効になったときに呼び出される
  const handleRecaptchaExpired = () => {
    setRecaptchaToken('');
    setRecaptchaVerified(false);
    setError({...error, recaptcha: 'ReCAPTCHAの有効期限が切れました。再度確認をお願いします。'});
  };

  const handleResetPassword = async () => {
    const errors = {};

    if (!password) {
      errors.password = '新しいパスワードを入力してください';
    } else if (passwordStrength < 2) {
      errors.password = 'パスワードの強度が弱いです';
    }
    
    if (!confirmPassword) {
      errors.passwordConfirmation = 'パスワード確認を入力してください';
    } else if (password !== confirmPassword) {
      errors.passwordConfirmation = 'パスワード確認が一致しません';
    }
    
    if (!recaptchaVerified) {
      errors.recaptcha = 'Recaptchaを完了してください';
    }
    
    // エラーがある場合は表示して終了
    if (Object.keys(errors).length > 0) {
        setError(errors);
        return;
    }

    // 送信ボタンを無効化
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword: confirmPassword, recaptchaToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError({ general: data.message });
        setIsSubmitting(false);
      }
    } catch (error) {
      setError({ general: 'サーバーエラーが発生しました'});
      setIsSubmitting(false);
    }
  };

  // 成功画面のレンダリング
  if (success) {
    return (
      <Container maxWidth="sm" sx={{ pt: 8, pb: 4 }}>
        <ResetPasswordCard>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
              パスワード変更完了
            </Typography>
            <Typography variant="body1" paragraph>
              パスワードの変更が完了しました。新しいパスワードでログインできます。
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ログイン画面に自動的に移動します...
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ mt: 3 }}
            >
              今すぐログイン
            </Button>
          </CardContent>
        </ResetPasswordCard>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ pt: 8, pb: 4 }}>
      <ResetPasswordCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LockResetIcon color="primary" sx={{ fontSize: 28, mr: 1.5 }} />
            <Typography variant="h5" component="h1" fontWeight="bold">
              パスワードを変更する
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            新しいパスワードを設定してください。安全のため、強度の高いパスワードをおすすめします。
          </Typography>

          {error.general && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 1 }}
              icon={<ErrorOutlineIcon />}
            >
              {error.general}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <StyledTextField
              label="新しいパスワード"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={handlePasswordChange}
              inputProps={{ maxLength: 30 }}  // 最大30文字に制限
              error={!!error.password}
              helperText={error.password || ''}
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
            />
            
            <PasswordStrengthBar
              variant="determinate"
              value={(passwordStrength + 1) * 25}
              strength={passwordStrength}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                パスワードの強度
              </Typography>
              <PasswordStrengthLabel strength={passwordStrength} variant="caption">
                {['弱い', '弱い', '中', '強い'][passwordStrength]}
              </PasswordStrengthLabel>
            </Box>
            
            <StyledTextField
              label="パスワード確認"
              variant="outlined"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              inputProps={{ maxLength: 30 }}  // 最大30文字に制限
              error={!!error.passwordConfirmation}
              helperText={error.passwordConfirmation || ''}
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
                      onClick={handleToggleConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={handleRecaptchaChange}
              onExpired={handleRecaptchaExpired}
              ref={recaptchaRef}
            />
          </Box>
          
          {error.recaptcha && (
            <Typography color="error" variant="body2" align="center" sx={{ mb: 2 }}>
              {error.recaptcha}
            </Typography>
          )}
          
          <SubmitButton
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleResetPassword}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />}
          >
            {isSubmitting ? '処理中...' : 'パスワードを変更する'}
          </SubmitButton>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" align="center">
            <Link href="/login" underline="hover">
              ログイン画面に戻る
            </Link>
          </Typography>
        </CardContent>
      </ResetPasswordCard>
    </Container>
  );
};

export default ResetPassword;