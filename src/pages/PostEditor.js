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
  AutoAwesome as AutoAwesomeIcon,
  ArrowBack as ArrowBackIcon,
  SportsScore as SportsScoreIcon,
  Flag as SaveIcon
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import SeriesCreationModal from '../components/series/SeriesCreationModal'; 

// 画像処理ユーティリティをインポート
import { processHtmlImages } from '../components/contestform/utils/imageProcessor'; 

// スタイル付きコンポーネントのインポート
import { SubmitArea, ScrollTopButton } from '../components/post-editor/ui/StyledComponents';

// セクションコンポーネントのインポート
import BasicInfoSection from '../components/post-editor/BasicInfoSection';
import ContentSection from '../components/post-editor/ContentSection';
import SettingsSection from '../components/post-editor/SettingsSection';
import AiInfoSection from '../components/post-editor/AiInfoSection';
import { useAuth } from "../context/AuthContext";

const PostEditor = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  const author = useMemo(() => user ? user._id : null, [user]);
  
  // フォーム状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState('');
  
  // AI関連
  const [usedAiTools, setUsedAiTools] = useState([]);
  const [aiEvidenceUrl, setAiEvidenceUrl] = useState('');
  const [aiEvidenceDescription, setAiEvidenceDescription] = useState('');
  
  // 作品設定
  const [original, setOriginal] = useState(null);
  const [adultContent, setAdultContent] = useState(false);
  const [publicityStatus, setPublicityStatus] = useState('public'); // isPublic削除
  const [allowComments, setAllowComments] = useState(true);
  
  // シリーズ関連
  const [series, setSeries] = useState('');
  const [seriesList, setSeriesList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  
  // 統計情報
  const [imageCount, setImageCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);
  
  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrollVisible, setScrollVisible] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', type: 'success' });
  
  // エラー状態
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: '',
    description: '',
    tags: '',
    original: '',
    adultContent: '',
    publicityStatus: '', // isPublic削除
    aiTools: '',
    aiDescription: ''
  });
  
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
  
  // シリーズデータの取得
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch(`/api/series`, {
          credentials: 'include',
        });
        if (response.ok) {
          const seriesData = await response.json();
          setSeriesList(seriesData);
        } else {
          console.error('Failed to fetch series list');
          setFeedback({
            open: true,
            message: 'シリーズの取得に失敗しました',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error fetching series:', error);
        setFeedback({
          open: true,
          message: 'シリーズの取得中にエラーが発生しました',
          type: 'error'
        });
      }
    };

    fetchSeries();
  }, []);

  // フォーム検証ロジックをメモ化
  const validateForm = useCallback(() => {
    const newErrors = {
      title: '',
      content: '',
      description: '',
      tags: '',
      original: '',
      adultContent: '',
      publicityStatus: '',
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
    
    setFormErrors(newErrors);
    return isValid;
  }, [title, content, description, tags, original, adultContent, publicityStatus, usedAiTools, aiEvidenceDescription]);

  // 投稿処理
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      setFeedback({
        open: true,
        message: '入力内容にエラーがあります。確認してください。',
        type: 'error'
      });
      return;
    }

    if (!user) {
      setFeedback({
        open: true,
        message: 'ログインしてください。',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // AI証拠データの準備
      const aiEvidenceData = {
        tools: usedAiTools,
        url: aiEvidenceUrl || null,
        description: aiEvidenceDescription
      };
      
      // HTML内の画像を処理
      const processedContent = await processHtmlImages(content);
      
      const postData = {
        title,
        content: processedContent,
        description,
        tags,
        original,
        adultContent,
        aiGenerated: true,
        aiEvidence: aiEvidenceData,
        charCount,
        author,
        series: series || null,
        imageCount,
        publicityStatus, // isPublic削除
        allowComments,
      };

      // 投稿データを送信
      const response = await fetch(`/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const post = await response.json();

        // シリーズが選択されている場合、そのシリーズに投稿を追加
        if (series) {
          await fetch(`/api/series/${series}/addPost`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ postId: post._id }),
          });
        }

        setFeedback({
          open: true,
          message: '作品が投稿されました！',
          type: 'success'
        });
        
        // 成功後、ホームページに遷移
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setFeedback({
          open: true,
          message: '投稿に失敗しました。',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting post:', error);
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
    user, 
    usedAiTools, 
    aiEvidenceUrl, 
    aiEvidenceDescription, 
    content, 
    title, 
    description, 
    tags, 
    original, 
    adultContent, 
    charCount, 
    author, 
    series, 
    imageCount, 
    publicityStatus, // isPublic削除
    allowComments, 
    navigate
  ]);

  // シリーズ作成ハンドラをメモ化
  const handleCreateSeries = useCallback(async (seriesData) => {
    try {
      const response = await fetch(`/api/series`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(seriesData),
      });
      if (response.ok) {
        const newSeries = await response.json();
        setSeriesList(prevList => [...prevList, newSeries]);
        setSeries(newSeries._id);
        setOpenModal(false);
        setFeedback({
          open: true,
          message: 'シリーズが作成されました',
          type: 'success'
        });
      } else {
        console.error('Failed to create series');
        setFeedback({
          open: true,
          message: 'シリーズの作成に失敗しました',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating series:', error);
      setFeedback({
        open: true,
        message: 'シリーズの作成中にエラーが発生しました',
        type: 'error'
      });
    }
  }, []);

  // モーダル開閉ハンドラをメモ化
  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  // スクロールトップハンドラ
  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // フィードバック閉じるハンドラ
  const handleCloseFeedback = useCallback(() => {
    setFeedback(prev => ({ ...prev, open: false }));
  }, []);

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
            <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
            新しい作品を投稿
          </Typography>
          
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ borderRadius: 2 }}
          >
            キャンセル
          </Button>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          AIを活用したあなたのオリジナル作品を共有しましょう
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
        handleOpenModal={handleOpenModal}
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
        publicityStatus={publicityStatus} // isPublic削除
        setPublicityStatus={setPublicityStatus} // isPublic削除
        allowComments={allowComments}
        setAllowComments={setAllowComments}
        formErrors={formErrors}
      />
      
      {/* AI情報セクション */}
      <AiInfoSection 
        usedAiTools={usedAiTools}
        setUsedAiTools={setUsedAiTools}
        aiEvidenceUrl={aiEvidenceUrl}
        setAiEvidenceUrl={setAiEvidenceUrl}
        aiEvidenceDescription={aiEvidenceDescription}
        setAiEvidenceDescription={setAiEvidenceDescription}
        formErrors={formErrors}
      />
      
      {/* 投稿ボタンエリア */}
      <SubmitArea>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SportsScoreIcon color="success" sx={{ mr: 1.5 }} />
          <Typography variant="body1" fontWeight="medium">
            入力完了しましたか？ 投稿ボタンを押して公開しましょう！
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
          {isSubmitting ? '投稿処理中...' : '作品を投稿する'}
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
      
      {/* シリーズ作成モーダル */}
      <SeriesCreationModal
        open={openModal}
        onClose={handleCloseModal}
        onCreateSeries={handleCreateSeries}
      />
      
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

export default PostEditor;