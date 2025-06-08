import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

// 共通コンポーネントと設定をインポート
import { SubmitArea, ScrollTopButton } from '../components/post-editor/ui/StyledComponents';

// 編集用に修正したセクションコンポーネントをインポート
import BasicInfoSection from '../components/post-editor/BasicInfoSection';
import ContentSection from '../components/post-editor/ContentSection';
import SettingsSection from '../components/post-editor/SettingsSection';
import AiInfoSection from '../components/post-editor/AiInfoSection';

const PostEditPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const author = useMemo(() => user ? user._id : null, [user]);

  
  // フォーム状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState('');
  
  // AI関連
  const [aiGenerated, setAiGenerated] = useState(null);
  const [usedAiTools, setUsedAiTools] = useState([]);
  const [aiEvidenceUrl, setAiEvidenceUrl] = useState('');
  const [aiEvidenceDescription, setAiEvidenceDescription] = useState('');
  
  // 作品設定
  const [original, setOriginal] = useState(null);
  const [adultContent, setAdultContent] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
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
  const [loading, setLoading] = useState(true);
  
  // エラー状態
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: '',
    description: '',
    tags: '',
    original: '',
    adultContent: '',
    aiTools: '',
    aiDescription: ''
  });
  
  // 投稿の詳細を取得
  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`/api/posts/${id}/edit`, {
          credentials: 'include',  // 認証情報を含めてリクエスト

        });
        
        if (response.ok) {
          const data = await response.json();
          
          // 基本情報を設定
          setTitle(data.title || '');
          setContent(data.content || '');
          setTags(data.tags || []);
          setDescription(data.description || '');
          
          // AIの情報を設定
          setAiGenerated(data.aiGenerated || false);
          if (data.aiEvidence) {
            setUsedAiTools(data.aiEvidence.tools || []);
            setAiEvidenceUrl(data.aiEvidence.url || '');
            setAiEvidenceDescription(data.aiEvidence.description || '');
          }
          
          // 公開設定を設定
          setOriginal(data.original !== undefined ? data.original : null);
          setAdultContent(data.adultContent !== undefined ? data.adultContent : null);
          setIsPublic(data.isPublic !== undefined ? data.isPublic : true);
          setAllowComments(data.allowComments !== undefined ? data.allowComments : true);
          
          // シリーズ情報
          if (data.series) {
            setSeries(data.series);
          }
          
          // 統計情報
          setCharCount(data.content ? data.content.replace(/<[^>]*>/g, '').length : 0);
          setDescCharCount(data.description ? data.description.length : 0);
          setImageCount(data.imageCount || 0);
          
          setFeedback({
            open: true,
            message: '投稿情報を読み込みました',
            type: 'success'
          });
        } else if (response.status === 302) {
          const data = await response.json();
          navigate(data.redirectUrl);
          setFeedback({
            open: true,
            message: 'リダイレクトします',
            type: 'info'
          });
        } else {
          console.error('Failed to fetch post details');
          navigate('/mypage');
          setFeedback({
            open: true,
            message: '投稿の取得に失敗しました',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
        navigate('/mypage');
        setFeedback({
          open: true,
          message: 'エラーが発生しました',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
    fetchSeriesList();
  }, [id, navigate]);

  // シリーズリストを取得
  const fetchSeriesList = async () => {
    try {
      const response = await fetch(`/api/series`, {
        credentials: 'include',
      });
      if (response.ok) {
        const seriesData = await response.json();
        setSeriesList(seriesData);
      }
    } catch (error) {
      console.error('Error fetching series list:', error);
    }
  };
  
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

  // フォーム検証ロジックをメモ化
  const validateForm = useCallback(() => {
    const newErrors = {
      title: '',
      content: '',
      description: '',
      tags: '',
      original: '',
      adultContent: '',
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
    
    // AI生成
    if (aiGenerated === null) {
      newErrors.aiGenerated = 'AI生成かどうかを選択してください';
      isValid = false;
    }
    
    // AIで生成された場合のみAI関連の検証を行う
    if (aiGenerated) {
      // AIツール
      if (usedAiTools.length === 0) {
        newErrors.aiTools = '少なくとも1つのAIツールを追加してください';
        isValid = false;
      }
      
      // AI説明
      if (!aiEvidenceDescription.trim()) {
        newErrors.aiDescription = 'AI使用の説明を入力してください';
        isValid = false;
      }
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
    aiGenerated, 
    usedAiTools, 
    aiEvidenceDescription
  ]);

  // 送信ハンドラをメモ化
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
      // AI証拠データの準備
      const aiEvidenceData = aiGenerated ? {
        tools: usedAiTools,
        url: aiEvidenceUrl || null,
        description: aiEvidenceDescription
      } : null;
      
      const updatedPostData = {
        title,
        content,
        description,
        tags,
        original,
        adultContent,
        aiGenerated,
        aiEvidence: aiEvidenceData,
        charCount,
        series: series || null,
        imageCount,
        isPublic,
        allowComments,
      };

      // 投稿データを送信
      const response = await fetch(`/api/posts/${id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
        credentials: 'include',  // 認証情報を含めてリクエスト

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
        setFeedback({
          open: true,
          message: '投稿の更新に失敗しました。',
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
    aiGenerated,
    usedAiTools, 
    aiEvidenceUrl, 
    aiEvidenceDescription, 
    charCount, 
    series, 
    imageCount, 
    isPublic, 
    allowComments,
    id,
    navigate
  ]);

  // スクロールトップハンドラ
  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // フィードバック閉じるハンドラ
  const handleCloseFeedback = useCallback(() => {
    setFeedback(prev => ({ ...prev, open: false }));
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          mb: 4, 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
            作品の編集
          </Typography>
          
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/novel/${id}`)}
            sx={{ borderRadius: 2 }}
          >
            キャンセル
          </Button>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          作品の内容を編集してください
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
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        allowComments={allowComments}
        setAllowComments={setAllowComments}
        formErrors={formErrors}
      />
      
      {/* AI情報セクション - AI生成の場合のみ表示 */}
      {aiGenerated && (
        <AiInfoSection 
          usedAiTools={usedAiTools}
          setUsedAiTools={setUsedAiTools}
          aiEvidenceUrl={aiEvidenceUrl}
          setAiEvidenceUrl={setAiEvidenceUrl}
          aiEvidenceDescription={aiEvidenceDescription}
          setAiEvidenceDescription={setAiEvidenceDescription}
          formErrors={formErrors}
        />
      )}
      
      {/* 投稿ボタンエリア */}
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