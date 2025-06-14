import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper,
  Container,
  CircularProgress,
  Alert,
  Snackbar,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';

import { 
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 共通コンポーネントと設定をインポート
import { SubmitArea, ScrollTopButton } from '../components/post-editor/ui/StyledComponents';

// セクションコンポーネントをインポート
import BasicInfoSection from '../components/post-editor/BasicInfoSection';
import ContentSection from '../components/post-editor/ContentSection';
import SettingsSection from '../components/post-editor/SettingsSection';
import AiInfoSection from '../components/post-editor/AiInfoSection';

const PostEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const author = useMemo(() => user ? user._id : null, [user]);

  // フォーム状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState('');
  
  // AI関連（AI生成は常にtrueとして扱う）
  const [usedAiTools, setUsedAiTools] = useState([]);
  const [aiEvidenceUrl, setAiEvidenceUrl] = useState('');
  const [aiEvidenceDescription, setAiEvidenceDescription] = useState('');
  
  // 作品設定
  const [original, setOriginal] = useState(null);
  const [adultContent, setAdultContent] = useState(null);
  const [publicityStatus, setPublicityStatus] = useState('public');
  const [allowComments, setAllowComments] = useState(true);
  
  // シリーズ関連
  const [series, setSeries] = useState('');
  const [seriesList, setSeriesList] = useState([]);
  
  // 統計情報
  const [imageCount, setImageCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);
  
  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrollVisible, setScrollVisible] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', type: 'success' });
  const [dataLoading, setDataLoading] = useState(true);
  
  // エラー状態
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: '',
    description: '',
    tags: '',
    original: '',
    adultContent: '',
    publicityStatus: '',
    aiTools: '',
    aiDescription: ''
  });
  
  // フィードバッククローズハンドラ
  const handleCloseFeedback = useCallback(() => {
    setFeedback({ ...feedback, open: false });
  }, [feedback]);

  // 投稿の詳細を取得
  useEffect(() => {
    // ログイン状態とロード状態をチェック
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    const fetchPostDetails = async () => {
      setDataLoading(true);
      
      try {
        const response = await fetch(`/api/posts/${id}/edit`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // 基本情報を設定
          setTitle(data.title || '');
          setContent(data.content || '');
          setTags(data.tags || []);
          setDescription(data.description || '');
          
          // AI情報を設定（常にAI生成として扱う）
          if (data.aiEvidence) {
            setUsedAiTools(data.aiEvidence.tools || []);
            setAiEvidenceUrl(data.aiEvidence.url || '');
            setAiEvidenceDescription(data.aiEvidence.description || '');
          }
          
          // 作品設定を設定
          setOriginal(data.original !== undefined ? data.original : null);
          setAdultContent(data.adultContent !== undefined ? data.adultContent : null);
          setPublicityStatus(data.publicityStatus || 'public');
          setAllowComments(data.allowComments !== undefined ? data.allowComments : true);
          
          // シリーズ情報の修正 - より詳細なデバッグとフォールバック
          console.log('Series data from API:', data.series);
          if (data.series) {
            if (typeof data.series === 'object' && data.series._id) {
              // シリーズがオブジェクトの場合
              setSeries(data.series._id);
              console.log('Set series ID (object):', data.series._id);
            } else if (typeof data.series === 'string') {
              // シリーズがIDの場合
              setSeries(data.series);
              console.log('Set series ID (string):', data.series);
            } else {
              console.warn('Unexpected series data format:', data.series);
            }
          } else {
            console.log('No series data found');
          }
          
          // 統計情報
          setCharCount(data.content ? data.content.length : 0);
          setImageCount(data.imageCount || 0);
          setDescCharCount(data.description ? data.description.length : 0);
          
        } else if (response.status === 403) {
          setFeedback({
            open: true,
            message: 'この作品を編集する権限がありません。',
            type: 'error'
          });
          navigate('/');
        } else {
          throw new Error('作品の取得に失敗しました');
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
        setFeedback({
          open: true,
          message: '作品の取得に失敗しました。',
          type: 'error'
        });
        navigate('/');
      } finally {
        setDataLoading(false);
      }
    };

    // シリーズリストを取得
    const fetchSeries = async () => {
      try {
        console.log('Fetching series list...');
        const response = await fetch('/api/series', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Series list received:', data);
          setSeriesList(data || []);
        } else {
          console.error('Failed to fetch series:', response.status);
          setSeriesList([]);
        }
      } catch (error) {
        console.error('Error fetching series:', error);
        setSeriesList([]);
      }
    };

    fetchPostDetails();
    fetchSeries();
  }, [id, navigate, user, isAuthenticated, authLoading]);
  
  // スクロール検出
  useEffect(() => {
    const handleScroll = () => {
      setScrollVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 説明文字数カウント
  useEffect(() => {
    setDescCharCount(description.length);
  }, [description]);

  // デバッグ用: シリーズ状態の変化を監視
  useEffect(() => {
    console.log('Series state changed:', series);
    console.log('Series list:', seriesList);
  }, [series, seriesList]);

  // スクロールトップハンドラ
  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // フォーム検証ロジック
  const validateForm = useCallback(() => {
    const newErrors = {
      title: '',
      content: '',
      description: '',
      tags: '',
      original: '',
      adultContent: '',
      publicityStatus: '',
      aiGenerated: '',
      aiTools: '',
      aiDescription: ''
    };
    
    let isValid = true;
    
    // タイトル
    if (!title.trim()) {
      newErrors.title = 'タイトルを入力してください';
      isValid = false;
    }
    
    // コンテンツ
    if (!content.trim()) {
      newErrors.content = 'コンテンツを入力してください';
      isValid = false;
    }
    
    // 説明
    if (!description.trim()) {
      newErrors.description = '作品説明を入力してください';
      isValid = false;
    }
    
    // タグ
    if (tags.length === 0) {
      newErrors.tags = '少なくとも1つのタグを追加してください';
      isValid = false;
    }
    
    // オリジナル作品
    if (original === null) {
      newErrors.original = 'オリジナル作品かどうかを選択してください';
      isValid = false;
    }
    
    // 年齢設定
    if (adultContent === null) {
      newErrors.adultContent = '対象年齢を選択してください';
      isValid = false;
    }
    
    // 公開設定
    if (!publicityStatus) {
      newErrors.publicityStatus = '公開設定を選択してください';
      isValid = false;
    }
    
    // AIツール（常に必須）
    if (usedAiTools.length === 0) {
      newErrors.aiTools = '少なくとも1つのAIツールを追加してください';
      isValid = false;
    }
    
    // AI説明（常に必須）
    if (!aiEvidenceDescription.trim()) {
      newErrors.aiDescription = 'AI使用の説明を入力してください';
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  }, [
    title, 
    content, 
    description, 
    tags, 
    original, 
    adultContent, 
    publicityStatus,
    usedAiTools, 
    aiEvidenceDescription
  ]);

  // 送信ハンドラ
  const handleSubmit = useCallback(async () => {
    // バリデーションチェック
    if (!validateForm()) {
      setFeedback({
        open: true,
        message: '入力内容に問題があります。必須項目を確認してください。',
        type: 'error'
      });
      
      // エラーのある最初のフィールドまでスクロール
      const errorFields = document.querySelectorAll('.Mui-error');
      if (errorFields.length > 0) {
        errorFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // AI証拠データの準備（常にAI生成として扱う）
      const aiEvidenceData = {
        tools: usedAiTools,
        url: aiEvidenceUrl || null,
        description: aiEvidenceDescription
      };
      
      const updatedPostData = {
        title,
        content,
        description,
        tags,
        original,
        adultContent,
        aiGenerated: true, // 常にtrueとして送信
        aiEvidence: aiEvidenceData,
        charCount,
        series: series || null,
        imageCount,
        publicityStatus,
        allowComments,
      };

      // 投稿データを送信
      const response = await fetch(`/api/posts/${id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedPostData),
      });

      if (response.ok) {
        setFeedback({
          open: true,
          message: '投稿が更新されました！',
          type: 'success'
        });
        
        // 成功後、投稿詳細ページに遷移（少し遅延させる）
        setTimeout(() => {
          navigate(`/novel/${id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        setFeedback({
          open: true,
          message: errorData.message || '投稿の更新に失敗しました。',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setFeedback({
        open: true,
        message: 'エラーが発生しました。しばらくしてから再度お試しください。',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    title, 
    content, 
    description, 
    tags, 
    original, 
    adultContent, 
    usedAiTools, 
    aiEvidenceUrl, 
    aiEvidenceDescription, 
    charCount, 
    series, 
    imageCount, 
    publicityStatus,
    allowComments,
    id,
    navigate
  ]);

  // 認証ローディング中の表示
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // データローディング中の表示
  if (dataLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, md: 4 },
        px: { xs: 1, md: 3 }
      }}
    >
      {/* ヘッダーセクション */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 4 },
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EditIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="bold" 
            sx={{ 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            作品を編集
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/novel/${id}`)}
            sx={{ borderRadius: 2 }}
          >
            作品詳細に戻る
          </Button>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
          作品の内容を編集して更新しましょう
        </Typography>
      </Paper>
      
      {/* 基本情報セクション */}
      <BasicInfoSection 
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        tags={tags}
        setTags={setTags}
        series={series}
        setSeries={setSeries}
        seriesList={seriesList}
        handleOpenModal={() => {}} // 編集時はシリーズ作成不要
        formErrors={formErrors}
        theme={theme}
        descCharCount={descCharCount}
      />
      
      {/* 本文セクション */}
      <ContentSection 
        content={content}
        setContent={setContent}
        charCount={charCount}
        setCharCount={setCharCount}
        imageCount={imageCount}
        setImageCount={setImageCount}
        formErrors={formErrors}
      />
      
      {/* 設定セクション */}
      <SettingsSection 
        original={original}
        setOriginal={setOriginal}
        adultContent={adultContent}
        setAdultContent={setAdultContent}
        publicityStatus={publicityStatus}
        setPublicityStatus={setPublicityStatus}
        allowComments={allowComments}
        setAllowComments={setAllowComments}
        formErrors={formErrors}
      />
      
      {/* AI情報セクション - 常に表示 */}
      <AiInfoSection 
        usedAiTools={usedAiTools}
        setUsedAiTools={setUsedAiTools}
        aiEvidenceUrl={aiEvidenceUrl}
        setAiEvidenceUrl={setAiEvidenceUrl}
        aiEvidenceDescription={aiEvidenceDescription}
        setAiEvidenceDescription={setAiEvidenceDescription}
        formErrors={formErrors}
      />
      
      {/* 更新ボタンエリア */}
      <SubmitArea>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" fontWeight="medium">
            編集が完了したら更新ボタンを押してください
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{ 
            borderRadius: 2,
            px: 4,
            py: 1.2,
            fontWeight: 'bold',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 5,
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          {isSubmitting ? '更新処理中...' : '作品を更新する'}
        </Button>
      </SubmitArea>
      
      {/* スクロールトップボタン */}
      <Fade in={scrollVisible}>
        <ScrollTopButton
          variant="contained"
          color="primary"
          onClick={handleScrollTop}
          aria-label="ページトップへ戻る"
        >
          <ArrowBackIcon sx={{ transform: 'rotate(90deg)' }} />
        </ScrollTopButton>
      </Fade>
      
      {/* フィードバックスナックバー */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseFeedback} 
          severity={feedback.type} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PostEditPage;