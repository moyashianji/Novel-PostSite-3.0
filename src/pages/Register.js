import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Checkbox, 
  FormControlLabel, 
  Typography, 
  Paper, 
  IconButton, 
  Avatar, 
  MenuItem, 
  Container,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
  InputAdornment,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Fade,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip
} from '@mui/material';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  WcOutlined as GenderIcon,
  Refresh as RefreshIcon,
  ArticleOutlined as TermsIcon,
  Security as SecurityIcon,
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowForwardIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import zxcvbn from 'zxcvbn';  // パスワード強度チェックライブラリ
import { styled, alpha } from '@mui/material/styles';

// 性別選択肢の定義
const genderOptions = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'どちらでもない' },
];

// スタイル付きコンポーネント
const RegisterCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  overflow: 'visible',
  position: 'relative',
  transition: 'transform 0.3s ease',
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

const StepButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.25)}`,
  },
}));

const StepperContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

const AvatarUpload = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: `4px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 4px 14px ${alpha(theme.palette.common.black, 0.1)}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const UploadButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  padding: 8,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
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

const TimerText = styled(Typography)(({ theme, isExpiring }) => ({
  color: isExpiring ? theme.palette.error.main : theme.palette.text.secondary,
  fontWeight: isExpiring ? 'bold' : 'normal',
  fontSize: '0.875rem',
  transition: 'color 0.3s ease',
}));

const Register = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [step, setStep] = useState(1); // ステップ制御
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); // 確認コード入力用
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [nickname, setNickname] = useState('');
  const [icon, setIcon] = useState(null);
  const [dob, setDob] = useState(null);
  const [gender, setGender] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [preview, setPreview] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errorMessages, setErrorMessages] = useState({});
  const [expirationTime, setExpirationTime] = useState(null);  // 確認コードの有効期限
  const [isCodeExpired, setIsCodeExpired] = useState(false);  // 確認コードの有効期限切れフラグ
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中かどうかの状態
  const [verificationCodeExpiration, setVerificationCodeExpiration] = useState(null); // 失効時間
  const [remainingTime, setRemainingTime] = useState(null); // 残り時間
  const [isResendCode, setIsResendCode] = useState(false); // 送信中かどうかの状態
  const [isVerifyCode, setIsVerifyCode] = useState(false); // 送信中かどうかの状態
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [termsDialogOpen, setTermsDialogOpen] = useState(false); // 利用規約ダイアログの状態
  const API_URL = process.env.REACT_APP_API_URL;

  // 現在の日付を取得
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 月は0から始まるので+1
  const currentDay = today.getDate();
  
  // リアルタイムで残り時間を計算して表示
  useEffect(() => {
    if (verificationCodeExpiration) {
      const intervalId = setInterval(() => {
        const now = new Date();
        const timeLeft = Math.ceil((verificationCodeExpiration - now) / 1000);

        setRemainingTime(timeLeft > 0 ? timeLeft : 0);

        if (timeLeft <= 0) {
          setIsCodeExpired(true);  // 期限が切れた場合のフラグ
          clearInterval(intervalId);
        }
      }, 1000);

      // クリーンアップ関数でインターバルをクリア
      return () => clearInterval(intervalId);
    }
  }, [verificationCodeExpiration]);
  
  // 入力制限
  const handleYearChange = (e) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setYear(value);
    }
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    if (value.length <= 2 && /^\d*$/.test(value) && (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12))) {
      setMonth(value);
    }
  };

  const handleDayChange = (e) => {
    const value = e.target.value;
    if (value.length <= 2 && /^\d*$/.test(value) && (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31))) {
      setDay(value);
    }
  };

  // 残り時間のフォーマット（分:秒）
  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ReCAPTCHAの変更時処理
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setRecaptchaVerified(true);
  };
  
  // ReCAPTCHAのトークンが無効になったときに呼び出される
  const handleRecaptchaExpired = () => {
    setRecaptchaToken('');
    setRecaptchaVerified(false);
    setErrorMessages({...errorMessages, recaptcha: 'ReCAPTCHAの有効期限が切れました。再度確認をお願いします。'});
  };
  
  // パスワード強度の評価を適切に初期化・設定するための変更
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const result = zxcvbn(newPassword);

    // zxcvbnのscoreは0〜4の範囲で返されるが、万一のために範囲外の場合の処理
    setPasswordStrength(result ? Math.min(result.score, 3) : 0);
  };
  
  // Step1: 仮登録（確認コード送信）
  const handleNextStep = async () => {
    const errors = {};

    // クライアント側バリデーション
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    if (passwordStrength < 2) {
      errors.password = 'パスワードの強度が弱いです';
    }
    if (password !== passwordConfirmation) {
      errors.passwordConfirmation = 'パスワード確認が一致しません';
    }
    if (!recaptchaVerified) {
      errors.recaptcha = 'Recaptchaを完了してください';
    }

    // エラーがある場合は表示して終了
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      return;
    }
    // 送信ボタンを無効化
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/register-step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // セッションを含めてリクエストを送信
        body: JSON.stringify({ email, password, passwordConfirmation, recaptchaToken }),
      });

      const data = await response.json();
      if (response.ok) {
        setStep(2); // 確認コード入力ステップへ移行
        setVerificationCodeExpiration(new Date(new Date().getTime() + 5 * 60 * 1000)); // 5分後に失効
        // setExpirationTime(expiration);
      } else {
        setErrorMessages({ general: data.message });
      }
    } catch (error) {
      setErrorMessages({ general: 'サーバーエラーが発生しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step2: 確認コードの検証
  const handleVerifyCode = async () => {
    // Step 2の処理（確認コードの検証）
    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMessages({ general: '確認コードは6桁の数字を入力してください。' });
      return;
    }

    if (isCodeExpired) {
      setErrorMessages({ general: '確認コードの有効期限が切れました。再発行してください。' });
      return;
    }

    setIsVerifyCode(true);

    try {
      const response = await fetch(`${API_URL}/api/register-step2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // セッションを含めてリクエストを送信
        body: JSON.stringify({ verificationCode }), // 確認コードを送信
      });

      const data = await response.json();
      if (response.ok) {
        setStep(3);
      } else {
        setErrorMessages({ general: data.message });
        setIsVerifyCode(false);
      }
    } catch (error) {
      setErrorMessages({ general: 'サーバーエラーが発生しました' });
      setIsVerifyCode(false);
    }
  };
  
  // 確認コード再発行
  const handleResendCode = async () => {
    // 送信ボタンを無効化
    setIsResendCode(true);
    try {
      const response = await fetch(`${API_URL}/api/resend-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setErrorMessages({ general: '新しい確認コードが送信されました。' });
        setVerificationCodeExpiration(new Date(new Date().getTime() + 5 * 60 * 1000)); // 5分後に失効
        setIsCodeExpired(false);
        setTimeout(() => {
          setIsResendCode(false); // 3秒後にボタンを再度有効化
        }, 3000);
      } else {
        setErrorMessages({ general: data.message });
        setIsResendCode(false);
      }
    } catch (error) {
      setErrorMessages({ general: 'サーバーエラーが発生しました' });
      setIsResendCode(false);
    }
  };
  
  // Step3: 本登録処理
  const handleRegister = async () => {
    const errors = {};

    // クライアント側バリデーション
    if (!nickname || nickname.trim().length < 2) {
      errors.nickname = 'ニックネームは2文字以上入力してください';
    }

    // 入力された年、月、日が未来の日付かどうかをチェック
    if (!year || year.length !== 4 || parseInt(year) > currentYear) {
      errors.year = '過去または今年の年を入力してください';
    }
    if (!month || parseInt(month) < 1 || parseInt(month) > 12 || (parseInt(year) === currentYear && parseInt(month) > currentMonth)) {
      errors.month = '過去または現在の月を入力してください';
    }
    if (!day || parseInt(day) < 1 || parseInt(day) > 31 ||
      (parseInt(year) === currentYear && parseInt(month) === currentMonth && parseInt(day) > currentDay)) {
      errors.day = '過去または現在の日を入力してください';
    }

    if (!gender) {
      errors.gender = '性別を選択してください';
    }

    if (!termsAgreed) {
      errors.termsAgreed = '続行するには利用規約に同意してください';
    }

    // エラーがある場合はエラーメッセージを表示
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    // バリデーションOKならデータを送信
    const dobString = new Date(`${year}-${month}-${day}`).toISOString().split('T')[0]; // 例: 2023-01-11形式

    const formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('dob', dobString);
    formData.append('gender', gender);
    if (icon) formData.append('icon', icon);

    try {
      const response = await fetch(`${API_URL}/api/register-step3`, {
        method: 'POST',
        credentials: 'include',  // セッションを含めてリクエストを送信
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        navigate('/mypage');
      } else {
        setErrorMessages({ general: data.message });
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrorMessages({ general: 'サーバーエラーが発生しました' });
      setIsSubmitting(false);
    }
  };

  // アイコンファイル選択処理
  const handleIconChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessages({ ...errorMessages, icon: 'ファイルサイズは2MB以下にしてください' });
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrorMessages({ ...errorMessages, icon: '無効なファイル形式です。jpeg, png, gifのみ許可されています' });
        return;
      }

      setIcon(file);
      setPreview(URL.createObjectURL(file));
      // アイコンのエラーをクリア
      const updatedErrors = {...errorMessages};
      delete updatedErrors.icon;
      setErrorMessages(updatedErrors);
    }
  };

  // 利用規約ダイアログを開く
  const handleOpenTermsDialog = () => {
    setTermsDialogOpen(true);
  };

  // 利用規約ダイアログを閉じる
  const handleCloseTermsDialog = () => {
    setTermsDialogOpen(false);
  };

  // 利用規約に同意する
  const handleAgreeTerms = () => {
    setTermsAgreed(true);
    setTermsDialogOpen(false);
    // 利用規約のエラーをクリア
    const updatedErrors = {...errorMessages};
    delete updatedErrors.termsAgreed;
    setErrorMessages(updatedErrors);
  };

  // Step1: 仮登録画面（確認コード送信）
  const renderStepOne = () => (
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
        Step 1: メール認証
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
          disabled={isSubmitting}
        />
        
        <StyledTextField
          label="パスワード"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={handlePasswordChange}
          inputProps={{ maxLength: 30 }}  // 最大30文字に制限
          error={!!errorMessages.password}
          helperText={errorMessages.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
          }}
          disabled={isSubmitting}
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
          type="password"
          fullWidth
          margin="normal"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          inputProps={{ maxLength: 30 }}  // 最大30文字に制限
          error={!!errorMessages.passwordConfirmation}
          helperText={errorMessages.passwordConfirmation || ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
          }}
          disabled={isSubmitting}
        />
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onChange={handleRecaptchaChange}
          onExpired={handleRecaptchaExpired}
          ref={recaptchaRef}
        />
      </Box>
      
      {errorMessages.recaptcha && (
        <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          {errorMessages.recaptcha}
        </Typography>
      )}
      
      <StepButton
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleNextStep}
        disabled={isSubmitting}
        endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
        size="large"
        sx={{ mt: 2 }}
      >
        {isSubmitting ? '送信中...' : '次へ進む'}
      </StepButton>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        メールアドレスとパスワードを入力し、ReCAPTCHAを完了してください。
        確認コードがメールで届きます。
      </Typography>
    </CardContent>
  );

  // Step2: 確認コード入力画面
  const renderStepTwo = () => (
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
        Step 2: 確認コード入力
      </Typography>
      
      {errorMessages.general && (
        <Alert 
          severity={errorMessages.general.includes('送信されました') ? "success" : "error"} 
          sx={{ mb: 3, borderRadius: 1 }}
        >
          {errorMessages.general}
        </Alert>
      )}
      
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {email} にメールを送信しました。
        </Typography>
        <Typography variant="body2" color="text.secondary">
          メールに記載された6桁の確認コードを入力してください。
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <StyledTextField
          label="確認コード (6桁)"
          variant="outlined"
          fullWidth
          value={verificationCode}
          onChange={(e) => {
            const value = e.target.value;
            // 半角数字のみ許可し、6文字まで入力可能にする
            if (/^\d{0,6}$/.test(value)) {
              setVerificationCode(value);
            }
          }}
          error={!!errorMessages.code}
          helperText={errorMessages.code || ''}
          inputProps={{
            maxLength: 6, // 最大6文字まで
            inputMode: 'numeric', // モバイルで数字キーボードを表示
            pattern: '[0-9]*', // 数字のみ許可
            style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' }
          }}
          sx={{ maxWidth: '300px', margin: '0 auto' }}
          autoFocus
        />
      </Box>
      
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        {isCodeExpired ? (
          <Alert severity="error" sx={{ borderRadius: 1, display: 'inline-flex' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ErrorOutlineIcon sx={{ mr: 1 }} />
              確認コードの有効期限が切れました
            </Box>
          </Alert>
        ) : (
          <TimerText isExpiring={remainingTime && remainingTime < 60}>
            残り時間: {formatTime(remainingTime)}
          </TimerText>
        )}
      </Box>
      
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6}>
          <StepButton
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleVerifyCode}
            disabled={isVerifyCode || isCodeExpired || verificationCode.length !== 6}
            endIcon={isVerifyCode ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
          >
            {isVerifyCode ? '確認中...' : 'コードを確認'}
          </StepButton>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <StepButton
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleResendCode}
            disabled={isResendCode || (!isCodeExpired && remainingTime > 0 && remainingTime > 240)}
            startIcon={isResendCode ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          >
            {isResendCode ? '送信中...' : '確認コード再送信'}
          </StepButton>
        </Grid>
      </Grid>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        確認コードが届かない場合は、迷惑メールフォルダをご確認いただくか、コードの再送信ボタンをクリックしてください。
      </Typography>
    </CardContent>
  );

  // Step3: 本登録画面（ユーザー情報入力）
  const renderStepThree = () => (
    <CardContent sx={{ p: 4 }}>
      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
        Step 3: ユーザー情報入力
      </Typography>
      
      {errorMessages.general && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
          {errorMessages.general}
        </Alert>
      )}
      
      <AvatarUpload>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="icon-button-file"
          type="file"
          onChange={handleIconChange}
        />
        <label htmlFor="icon-button-file" style={{ position: 'relative' }}>
          <LargeAvatar
            src={preview || ''}
            alt="プロフィール画像"
          >
            {!preview && <BadgeIcon sx={{ fontSize: 40 }} />}
          </LargeAvatar>
          <UploadButton size="small">
            <UploadIcon fontSize="small" />
          </UploadButton>
        </label>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          プロフィール画像（任意）
        </Typography>
        {errorMessages.icon && (
          <Typography color="error" variant="caption" sx={{ mt: 1 }}>
            {errorMessages.icon}
          </Typography>
        )}
      </AvatarUpload>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledTextField
            label="ニックネーム"
            variant="outlined"
            fullWidth
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            inputProps={{ maxLength: 30 }}
            error={!!errorMessages.nickname}
            helperText={errorMessages.nickname || ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="action" />
                </InputAdornment>
              ),
            }}
            required
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <CakeIcon sx={{ mr: 1, fontSize: 20, color: 'action.active' }} />
            生年月日
            <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <StyledTextField
                label="年"
                value={year}
                onChange={handleYearChange}
                placeholder="YYYY"
                error={!!errorMessages.year}
                helperText={errorMessages.year || ''}
                inputProps={{ maxLength: 4 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <StyledTextField
                label="月"
                value={month}
                onChange={handleMonthChange}
                placeholder="MM"
                error={!!errorMessages.month}
                helperText={errorMessages.month || ''}
                inputProps={{ maxLength: 2 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <StyledTextField
                label="日"
                value={day}
                onChange={handleDayChange}
                placeholder="DD"
                error={!!errorMessages.day}
                helperText={errorMessages.day || ''}
                inputProps={{ maxLength: 2 }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <StyledTextField
            label="性別"
            select
            fullWidth
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            error={!!errorMessages.gender}
            helperText={errorMessages.gender || ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GenderIcon color="action" />
                </InputAdornment>
              ),
            }}
            required
          >
            {genderOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </StyledTextField>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={termsAgreed} 
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  <span>利用規約</span>
                  <Button 
                    onClick={handleOpenTermsDialog}
                    sx={{ textTransform: 'none', p: '0 4px', minWidth: 'auto' }}
                  >
                    （内容を確認）
                  </Button>
                  <span>に同意します</span>
                </Typography>
              }
            />
          </Box>
          {errorMessages.termsAgreed && (
            <Typography color="error" variant="caption" sx={{ ml: 4 }}>
              {errorMessages.termsAgreed}
            </Typography>
          )}
        </Grid>
      </Grid>
      
      <StepButton
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
        disabled={isSubmitting || !termsAgreed}
        endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
        sx={{ mt: 4 }}
      >
        {isSubmitting ? '登録中...' : '登録を完了する'}
      </StepButton>
    </CardContent>
  );

  // 利用規約ダイアログ
  const renderTermsDialog = () => (
    <Dialog
      open={termsDialogOpen}
      onClose={handleCloseTermsDialog}
      scroll="paper"
      maxWidth="md"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TermsIcon sx={{ mr: 1 }} />
          利用規約
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          <Typography variant="h6" gutterBottom>第1条（利用規約の適用）</Typography>
          <Typography paragraph>
            1. この利用規約（以下「本規約」といいます）は、当サービス（以下「本サービス」といいます）の利用に関する条件を定めるものです。
          </Typography>
          <Typography paragraph>
            2. ユーザーは、本規約に同意の上、本サービスを利用するものとします。
          </Typography>
          
          <Typography variant="h6" gutterBottom>第2条（ユーザー登録）</Typography>
          <Typography paragraph>
            1. ユーザーは、本サービスを利用するにあたり、真実、正確かつ完全な情報を提供しなければなりません。
          </Typography>
          <Typography paragraph>
            2. 当サービスは、ユーザーが以下の各号のいずれかに該当すると判断した場合、ユーザー登録を拒否することがあります。
            <br />（1）虚偽の情報を提供した場合
            <br />（2）過去に本規約に違反したことがある場合
            <br />（3）その他当サービスがユーザー登録を不適当と判断した場合
          </Typography>
          
          <Typography variant="h6" gutterBottom>第3条（プライバシー）</Typography>
          <Typography paragraph>
            当サービスのプライバシーポリシーは、本規約の一部を構成します。ユーザーは、本サービスを利用することにより、当サービスが別途定めるプライバシーポリシーに同意したものとみなされます。
          </Typography>
          
          <Typography variant="h6" gutterBottom>第4条（禁止事項）</Typography>
          <Typography paragraph>
            ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
            <br />（1）法令または公序良俗に違反する行為
            <br />（2）犯罪行為に関連する行為
            <br />（3）当サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
            <br />（4）当サービスのサービスの運営を妨害するおそれのある行為
            <br />（5）他のユーザーに関する個人情報等を収集または蓄積する行為
            <br />（6）他のユーザーに成りすます行為
            <br />（7）当サービスのサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為
            <br />（8）その他、当サービスが不適切と判断する行為
          </Typography>
          
          <Typography variant="h6" gutterBottom>第5条（本サービスの提供の停止等）</Typography>
          <Typography paragraph>
            1. 当サービスは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
            <br />（1）本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
            <br />（2）地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
            <br />（3）コンピュータまたは通信回線等が事故により停止した場合
            <br />（4）その他、当サービスが本サービスの提供が困難と判断した場合
          </Typography>
          <Typography paragraph>
            2. 当サービスは、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害について、理由を問わず一切の責任を負わないものとします。
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseTermsDialog} color="inherit">
          閉じる
        </Button>
        <Button onClick={handleAgreeTerms} color="primary" variant="contained">
          同意する
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ステップごとの表示切り替え
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <StepperContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Stepper activeStep={step - 1} alternativeLabel>
          <Step>
            <StepLabel>メール認証</StepLabel>
          </Step>
          <Step>
            <StepLabel>確認コード</StepLabel>
          </Step>
          <Step>
            <StepLabel>ユーザー情報</StepLabel>
          </Step>
        </Stepper>
      </StepperContainer>
      
      <RegisterCard>
        {step === 1 && renderStepOne()}
        {step === 2 && renderStepTwo()}
        {step === 3 && renderStepThree()}
      </RegisterCard>
      
      {renderTermsDialog()}
      
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          既にアカウントをお持ちの方は
          <Button 
            variant="text" 
            color="primary" 
            onClick={() => navigate('/login')}
            sx={{ textTransform: 'none' }}
          >
            ログイン
          </Button>
          してください。
        </Typography>
      </Box>
    </Container>
  );
};

export default Register;