// src/pages/ContactPage.js
import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar
} from '@mui/material';
import { 
  ContactSupport as ContactSupportIcon,
  Email as EmailIcon,
  Send as SendIcon,
  Help as HelpIcon,
  BugReport as BugReportIcon,
  Feedback as FeedbackIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

// カスタムDiscordアイコン
const DiscordIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'general', label: '一般的なお問い合わせ', icon: <HelpIcon /> },
    { value: 'bug', label: 'バグ報告', icon: <BugReportIcon /> },
    { value: 'feature', label: '機能要望・改善提案', icon: <FeedbackIcon /> },
    { value: 'security', label: 'セキュリティ関連', icon: <SecurityIcon /> },
    { value: 'business', label: 'ビジネス・提携', icon: <BusinessIcon /> },
    { value: 'privacy', label: 'プライバシー・個人情報', icon: <SecurityIcon /> }
  ];

  const priorities = [
    { value: 'low', label: '低', color: 'info' },
    { value: 'normal', label: '通常', color: 'primary' },
    { value: 'high', label: '高', color: 'warning' },
    { value: 'urgent', label: '緊急', color: 'error' }
  ];

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = '名前を入力してください';
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    if (!formData.category) newErrors.category = 'カテゴリを選択してください';
    if (!formData.subject.trim()) newErrors.subject = '件名を入力してください';
    if (!formData.message.trim()) newErrors.message = 'メッセージを入力してください';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // 実際の実装では、APIエンドポイントに送信
      await new Promise(resolve => setTimeout(resolve, 2000)); // シミュレーション
      
      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
        priority: 'normal'
      });
    } catch (error) {
      console.error('送信エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StaticPageLayout 
      title="お問い合わせ"
      subtitle="ご質問やご提案をお聞かせください"
      breadcrumbItems={[
        { label: 'サポート', path: '/support' }
      ]}
    >
      <Grid container spacing={4}>
        {/* お問い合わせフォーム */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
              <ContactSupportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              お問い合わせフォーム
            </Typography>
            
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="お名前"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="メールアドレス"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.category} required>
                    <InputLabel>カテゴリ</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={handleInputChange('category')}
                      label="カテゴリ"
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {cat.icon}
                            {cat.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && (
                      <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                        {errors.category}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>優先度</InputLabel>
                    <Select
                      value={formData.priority}
                      onChange={handleInputChange('priority')}
                      label="優先度"
                    >
                      {priorities.map((priority) => (
                        <MenuItem key={priority.value} value={priority.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: `${priority.color}.main`
                              }}
                            />
                            {priority.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="件名"
                    value={formData.subject}
                    onChange={handleInputChange('subject')}
                    error={!!errors.subject}
                    helperText={errors.subject}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="メッセージ"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange('message')}
                    error={!!errors.message}
                    helperText={errors.message || '詳細な情報をお書きください（最大2000文字）'}
                    inputProps={{ maxLength: 2000 }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    お問い合わせいただいた内容には、通常1-3営業日以内に回答いたします。
                    緊急度の高い内容については、優先的に対応いたします。
                  </Alert>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? null : <SendIcon />}
                    sx={{ 
                      minWidth: 200,
                      height: 48
                    }}
                  >
                    {isSubmitting ? '送信中...' : '送信する'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* サイドバー情報 */}
        <Grid item xs={12} md={4}>
          {/* 直接連絡先 */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                直接連絡
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="一般お問い合わせ"
                    secondary="support@novelcrest.com"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="プライバシー関連"
                    secondary="privacy@novelcrest.com"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="ビジネス・提携"
                    secondary="business@novelcrest.com"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* コミュニティサポート */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                コミュニティサポート
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                Discordコミュニティでは、他のユーザーやスタッフと直接やり取りできます。
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                href="https://discord.gg/TsbXmNWq"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<DiscordIcon />}
                sx={{
                  borderColor: '#5865f2',
                  color: '#5865f2',
                  '&:hover': {
                    backgroundColor: '#5865f2',
                    color: 'white'
                  }
                }}
              >
                Discordに参加
              </Button>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                <HelpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                よくある質問
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                お問い合わせ前に、よくある質問をご確認ください。
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                href="/faq"
                color="primary"
              >
                FAQを見る
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 成功メッセージ */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />
          }}
        >
          お問い合わせを送信しました！1-3営業日以内に回答いたします。
        </Alert>
      </Snackbar>
    </StaticPageLayout>
  );
};

export default ContactPage;