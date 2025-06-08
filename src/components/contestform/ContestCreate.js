import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';

// フォームセクションをインポート
import BasicInfo from './formsections/BasicInfo';
import DetailedDescription from './formsections/DetailedDescription';
import ImageSection from './formsections/ImageSection';
import DateSection from './formsections/DateSection';
import JudgeSection from './formsections/JudgeSection';
import OptionSection from './formsections/OptionSection';
import FormActions from './formsections/FormActions';

// ユーティリティをインポート
import { getLocalStorageData, saveFormData, savePreviewData } from './utils/storage';
import { base64ToFile, processHtmlImages } from './utils/imageProcessor';
import { isValidObjectId, validateForm } from './utils/validation';

/**
 * コンテスト作成フォームのメインコンテナーコンポーネント
 */
const ContestCreate = ({ initialData, onSubmit }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // アクティブなステップを追加
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});

  // 基本情報
  const [title, setTitle] = useState(initialData?.title || getLocalStorageData('title', ''));
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || getLocalStorageData('shortDescription', ''));
  const [description, setDescription] = useState(initialData?.description || getLocalStorageData('description', ''));
  
  // 画像
  const [iconImage, setIconImage] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [iconPreview, setIconPreview] = useState(initialData?.iconPreview || getLocalStorageData('iconPreview', null));
  const [headerPreview, setHeaderPreview] = useState(initialData?.headerPreview || getLocalStorageData('headerPreview', null));

  // 日付
  const [applicationStartDate, setApplicationStartDate] = useState(initialData?.applicationStartDate || getLocalStorageData('applicationStartDate', ''));
  const [applicationEndDate, setApplicationEndDate] = useState(initialData?.applicationEndDate || getLocalStorageData('applicationEndDate', ''));
  const [reviewStartDate, setReviewStartDate] = useState(initialData?.reviewStartDate || getLocalStorageData('reviewStartDate', ''));
  const [reviewEndDate, setReviewEndDate] = useState(initialData?.reviewEndDate || getLocalStorageData('reviewEndDate', ''));
  const [resultAnnouncementDate, setResultAnnouncementDate] = useState(initialData?.resultAnnouncementDate || getLocalStorageData('resultAnnouncementDate', ''));
  const [applicationStartDateType, setApplicationStartDateType] = useState('calendar');
  const [applicationEndDateType, setApplicationEndDateType] = useState('calendar');
  const [reviewStartDateType, setReviewStartDateType] = useState('calendar');
  const [reviewEndDateType, setReviewEndDateType] = useState('calendar');
  const [resultAnnouncementDateType, setResultAnnouncementDateType] = useState('calendar');

  // 審査員
  const [enableJudges, setEnableJudges] = useState(initialData?.enableJudges || getLocalStorageData('enableJudges', false));
  const [judges, setJudges] = useState(initialData?.judges || getLocalStorageData('judges', []));
  const [loadingJudge, setLoadingJudge] = useState(false);
  const [judgeId, setJudgeId] = useState('');

  // その他の設定
  const [allowFinishedWorks, setAllowFinishedWorks] = useState(initialData?.allowFinishedWorks || getLocalStorageData('allowFinishedWorks', false));
  const [allowPreStartDate, setAllowPreStartDate] = useState(initialData?.allowPreStartDate || getLocalStorageData('allowPreStartDate', false));
  const [restrictAI, setRestrictAI] = useState(initialData?.restrictAI || getLocalStorageData('restrictAI', false));
  const [aiTags, setAiTags] = useState(initialData?.aiTags || getLocalStorageData('aiTags', []));
  const [aiTagInput, setAiTagInput] = useState('');
  const [allowR18, setAllowR18] = useState(initialData?.allowR18 || getLocalStorageData('allowR18', false));
  const [restrictGenres, setRestrictGenres] = useState(initialData?.restrictGenres || getLocalStorageData('restrictGenres', false));
  const [genres, setGenres] = useState(initialData?.genres || getLocalStorageData('genres', []));
  const [genreInput, setGenreInput] = useState('');
  const [restrictWordCount, setRestrictWordCount] = useState(initialData?.restrictWordCount || getLocalStorageData('restrictWordCount', false));
  const [minWordCount, setMinWordCount] = useState(initialData?.minWordCount || getLocalStorageData('minWordCount', ''));
  const [maxWordCount, setMaxWordCount] = useState(initialData?.maxWordCount || getLocalStorageData('maxWordCount', ''));
  const [allowSeries, setAllowSeries] = useState(initialData?.allowSeries || getLocalStorageData('allowSeries', false));
  const [minEntries, setMinEntries] = useState(initialData?.minEntries || getLocalStorageData('minEntries', ''));
  const [maxEntries, setMaxEntries] = useState(initialData?.maxEntries || getLocalStorageData('maxEntries', ''));
  
  // ステータス
  const [status, setStatus] = useState(initialData?.status || getLocalStorageData('status', '開催予定'));
  
  // バリデーション・ローディング
  const [applicationStartDateError, setApplicationStartDateError] = useState(false);
  const [applicationEndDateError, setApplicationEndDateError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const steps = [
    'コンテスト基本情報',
    '詳細説明',
    '画像設定',
    '日程設定',
    '審査員と応募条件',
    '確認と作成'
  ];

  // 次のステップへ進む
  const handleNext = useCallback(() => {
    // 現在のステップのバリデーション
    if (activeStep === 0) {
      // 基本情報のバリデーション
      if (!title || !shortDescription) {
        setErrors({
          ...errors,
          title: !title,
          shortDescription: !shortDescription
        });
        return;
      }
    } else if (activeStep === 1) {
      // 詳細説明のバリデーション
      if (!description || description === '<p></p>') {
        setErrors({
          ...errors,
          description: true
        });
        return;
      }
    } else if (activeStep === 3) {
      // 日程設定のバリデーション
      if (!applicationStartDate || !applicationEndDate) {
        setApplicationStartDateError(!applicationStartDate);
        setApplicationEndDateError(!applicationEndDate);
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  }, [activeStep, title, shortDescription, description, applicationStartDate, applicationEndDate, errors]);

  // 前のステップに戻る
  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  }, []);

  // 現在のステップのコンテンツを表示
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BasicInfo
            title={title}
            handleTitleChange={handleTitleChange}
            shortDescription={shortDescription}
            handleShortDescriptionChange={handleShortDescriptionChange}
            characterCountDisplay={characterCountDisplay}
            errors={errors}
          />
        );
      case 1:
        return (
          <DetailedDescription
            description={description}
            handleDescriptionChange={handleDescriptionChange}
            error={errors.description}
          />
        );
      case 2:
        return (
          <ImageSection
            iconPreview={iconPreview}
            headerPreview={headerPreview}
            handleImageUpload={handleImageUpload}
          />
        );
      case 3:
        return (
          <DateSection
            applicationStartDate={applicationStartDate}
            setApplicationStartDate={setApplicationStartDate}
            applicationEndDate={applicationEndDate}
            setApplicationEndDate={setApplicationEndDate}
            reviewStartDate={reviewStartDate}
            setReviewStartDate={setReviewStartDate}
            reviewEndDate={reviewEndDate}
            setReviewEndDate={setReviewEndDate}
            resultAnnouncementDate={resultAnnouncementDate}
            setResultAnnouncementDate={setResultAnnouncementDate}
            applicationStartDateType={applicationStartDateType}
            setApplicationStartDateType={setApplicationStartDateType}
            applicationEndDateType={applicationEndDateType}
            setApplicationEndDateType={setApplicationEndDateType}
            reviewStartDateType={reviewStartDateType}
            setReviewStartDateType={setReviewStartDateType}
            reviewEndDateType={reviewEndDateType}
            setReviewEndDateType={setReviewEndDateType}
            resultAnnouncementDateType={resultAnnouncementDateType}
            setResultAnnouncementDateType={setResultAnnouncementDateType}
            applicationStartDateError={applicationStartDateError}
            applicationEndDateError={applicationEndDateError}
          />
        );
      case 4:
        return (
          <>
            <JudgeSection
              enableJudges={enableJudges}
              setEnableJudges={setEnableJudges}
              judgeId={judgeId}
              setJudgeId={setJudgeId}
              isValidObjectId={isValidObjectId}
              handleAddJudge={handleAddJudge}
              loadingJudge={loadingJudge}
              judges={judges}
              handleRemoveJudge={handleRemoveJudge}
            />
            <OptionSection
              allowFinishedWorks={allowFinishedWorks}
              setAllowFinishedWorks={setAllowFinishedWorks}
              allowPreStartDate={allowPreStartDate}
              setAllowPreStartDate={setAllowPreStartDate}
              restrictAI={restrictAI}
              setRestrictAI={setRestrictAI}
              aiTagInput={aiTagInput}
              setAiTagInput={setAiTagInput}
              handleAddAiTag={handleAddAiTag}
              aiTags={aiTags}
              handleRemoveAiTag={handleRemoveAiTag}
              allowR18={allowR18}
              setAllowR18={setAllowR18}
              restrictGenres={restrictGenres}
              setRestrictGenres={setRestrictGenres}
              genreInput={genreInput}
              setGenreInput={setGenreInput}
              handleAddGenre={handleAddGenre}
              genres={genres}
              handleRemoveGenre={handleRemoveGenre}
              restrictWordCount={restrictWordCount}
              setRestrictWordCount={setRestrictWordCount}
              minWordCount={minWordCount}
              setMinWordCount={setMinWordCount}
              maxWordCount={maxWordCount}
              setMaxWordCount={setMaxWordCount}
              allowSeries={allowSeries}
              setAllowSeries={setAllowSeries}
              minEntries={minEntries}
              setMinEntries={setMinEntries}
              maxEntries={maxEntries}
              setMaxEntries={setMaxEntries}
              status={status}
              setStatus={setStatus}
            />
          </>
        );
      case 5:
        return (
          <FormActions
            handlePreview={handlePreview}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user/me', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // LocalStorageから画像をロード
  useEffect(() => {
    const storedIconPreview = localStorage.getItem('iconPreview');
    const storedIconName = localStorage.getItem('iconImageName');
    if (storedIconPreview && storedIconName) {
      setIconPreview(storedIconPreview);
      setIconImage(base64ToFile(storedIconPreview, storedIconName));
    }

    const storedHeaderPreview = localStorage.getItem('headerPreview');
    const storedHeaderName = localStorage.getItem('headerImageName');
    if (storedHeaderPreview && storedHeaderName) {
      setHeaderPreview(storedHeaderPreview);
      setHeaderImage(base64ToFile(storedHeaderPreview, storedHeaderName));
    }
  }, []);

  // フォームデータをLocalStorageに保存
  useEffect(() => {
    const formData = {
      title,
      shortDescription,
      description,
      iconPreview,
      headerPreview,
      applicationStartDate,
      applicationEndDate,
      reviewStartDate,
      reviewEndDate,
      resultAnnouncementDate,
      enableJudges,
      judges,
      allowFinishedWorks,
      allowPreStartDate,
      restrictAI,
      aiTags,
      allowR18,
      restrictGenres,
      genres,
      restrictWordCount,
      minWordCount,
      maxWordCount,
      allowSeries,
      minEntries,
      maxEntries,
      status,
    };

    saveFormData(formData);
  }, [
    title,
    shortDescription,
    description,
    iconPreview,
    headerPreview,
    applicationStartDate,
    applicationEndDate,
    reviewStartDate,
    reviewEndDate,
    resultAnnouncementDate,
    enableJudges,
    judges,
    allowFinishedWorks,
    allowPreStartDate,
    restrictAI,
    aiTags,
    allowR18,
    restrictGenres,
    genres,
    restrictWordCount,
    minWordCount,
    maxWordCount,
    allowSeries,
    minEntries,
    maxEntries,
    status,
  ]);

  // 保存された審査員データをロード
  useEffect(() => {
    const storedJudges = getLocalStorageData('judges', []);
    const fetchStoredJudges = async () => {
      const judgeInfos = await Promise.all(storedJudges.map(judge => fetchJudgeInfo(judge.id)));
      setJudges(judgeInfos.filter(judge => judge !== null));
    };
    fetchStoredJudges();
  }, []);

  // 画像アップロード処理
  const handleImageUpload = useCallback((event, type) => {
    
      // 削除アクションの場合
  if (event.target.files === null) {
    if (type === 'icon') {
      setIconImage(null);
      setIconPreview(null);
      localStorage.removeItem('iconPreview');
      localStorage.removeItem('iconImageName');
    } else if (type === 'header') {
      setHeaderImage(null);
      setHeaderPreview(null);
      localStorage.removeItem('headerPreview');
      localStorage.removeItem('headerImageName');
    }
    return;
  }
    
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;

        if (type === 'icon') {
          setIconImage(file);
          setIconPreview(base64String);
          localStorage.setItem('iconPreview', base64String);
          localStorage.setItem('iconImageName', file.name);
        } else if (type === 'header') {
          setHeaderImage(file);
          setHeaderPreview(base64String);
          localStorage.setItem('headerPreview', base64String);
          localStorage.setItem('headerImageName', file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // 審査員情報取得
  const fetchJudgeInfo = useCallback(async (id) => {
    try {
      setLoadingJudge(true);
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) throw new Error('ユーザーが見つかりません');
      const data = await response.json();

      return { id, name: data.nickname, avatar: data.icon };
    } catch (error) {
      console.error('Error fetching judge:', error);
      alert('ユーザーが見つかりません');
      return null;
    } finally {
      setLoadingJudge(false);
    }
  }, []);

  // 審査員追加
  const handleAddJudge = useCallback(async () => {
    if (!judgeId) {
      alert('審査員のアカウントIDを入力してください');
      return;
    }

    if (!isValidObjectId(judgeId)) {
      alert('無効なアカウントIDです。正しいIDを入力してください。');
      return;
    }

    if (judges.some((judge) => judge.id === judgeId)) {
      alert('この審査員はすでに追加されています');
      return;
    }

    const judgeInfo = await fetchJudgeInfo(judgeId);
    if (judgeInfo) {
      setJudges([...judges, judgeInfo]);
      setJudgeId('');
    }
  }, [judgeId, judges, fetchJudgeInfo]);

  // 審査員削除
  const handleRemoveJudge = useCallback((index) => {
    setJudges(judges.filter((_, i) => i !== index));
  }, [judges]);

  // AIタグ追加
  const handleAddAiTag = useCallback(() => {
    if (aiTagInput && aiTags.length < 10) {
      setAiTags([...aiTags, aiTagInput]);
      setAiTagInput('');
    }
  }, [aiTagInput, aiTags]);

  // AIタグ削除
  const handleRemoveAiTag = useCallback((tag) => {
    setAiTags(aiTags.filter((t) => t !== tag));
  }, [aiTags]);

  // ジャンル追加
  const handleAddGenre = useCallback(() => {
    if (genreInput && genres.length < 10) {
      setGenres([...genres, genreInput]);
      setGenreInput('');
    }
  }, [genreInput, genres]);

  // ジャンル削除
  const handleRemoveGenre = useCallback((genre) => {
    setGenres(genres.filter((g) => g !== genre));
  }, [genres]);

  // フォームバリデーション
  const validateFormData = useCallback(() => {
    const formData = {
      title, 
      shortDescription, 
      description, 
      applicationStartDate, 
      applicationEndDate
    };
    
    return validateForm(
      formData, 
      setApplicationStartDateError, 
      setApplicationEndDateError
    );
  }, [title, shortDescription, description, applicationStartDate, applicationEndDate]);

  // フォーム送信
  const handleSubmit = useCallback(async () => {
    if (!validateFormData()) {
      alert('必須項目をすべて入力してください');
      return;
    }

    setLoading(true);

    try {
      // HTML内の画像を処理
      const updatedDescription = await processHtmlImages(description);
      
      // フォームデータ作成
      const formData = new FormData();
      formData.append('title', title);
      formData.append('shortDescription', shortDescription);
      formData.append('description', updatedDescription);
      if (iconImage) formData.append('iconImage', iconImage);
      if (headerImage) formData.append('headerImage', headerImage);

      formData.append('applicationStartDate', applicationStartDate);
      formData.append('applicationEndDate', applicationEndDate);
      formData.append('reviewStartDate', reviewStartDate);
      formData.append('reviewEndDate', reviewEndDate);
      formData.append('resultAnnouncementDate', resultAnnouncementDate);
      formData.append('enableJudges', enableJudges);
      formData.append('judges', JSON.stringify(judges));
      formData.append('allowFinishedWorks', allowFinishedWorks);
      formData.append('allowPreStartDate', allowPreStartDate);
      formData.append('restrictAI', restrictAI);
      formData.append('aiTags', JSON.stringify(aiTags));
      formData.append('allowR18', allowR18);
      formData.append('restrictGenres', restrictGenres);
      formData.append('genres', JSON.stringify(genres));
      formData.append('restrictWordCount', restrictWordCount);
      formData.append('minWordCount', minWordCount);
      formData.append('maxWordCount', maxWordCount);
      formData.append('allowSeries', allowSeries);
      formData.append('minEntries', minEntries);
      formData.append('maxEntries', maxEntries);
      formData.append('status', status);

      // APIリクエスト送信
      const response = await fetch(`/api/contests/create`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        alert('コンテストが作成されました！');
        navigate('/contests');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'コンテスト作成に失敗しました。');
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [
    title, shortDescription, description, iconImage, headerImage,
    applicationStartDate, applicationEndDate, reviewStartDate, reviewEndDate, resultAnnouncementDate,
    enableJudges, judges, allowFinishedWorks, allowPreStartDate,
    restrictAI, aiTags, allowR18, restrictGenres, genres,
    restrictWordCount, minWordCount, maxWordCount,
    allowSeries, minEntries, maxEntries, status,
    validateFormData, navigate
  ]);

  // プレビュー表示
  const handlePreview = useCallback(() => {
    if (!user) {
      alert('ユーザー情報が取得できませんでした。ログインしていますか？');
      return;
    }
    
    const previewData = {
      title,
      shortDescription,
      description,
      applicationStartDate,
      applicationEndDate,
      reviewStartDate,
      reviewEndDate,
      resultAnnouncementDate,
      enableJudges,
      judges: judges.map(judge => ({
        userId: { _id: judge.id, nickname: judge.name, icon: judge.avatar }
      })),
      creator: {
        _id: user._id,
        nickname: user.nickname,
        icon: user.icon
      },
      entries: [],
      status: status,
      headerImage: headerPreview,
      allowFinishedWorks: allowFinishedWorks,
      allowPreStartDate: allowPreStartDate,
      allowR18: allowR18,
      allowSeries: allowSeries,
      restrictGenres: restrictGenres,
      genres: restrictGenres ? genres : [],
      restrictAI: restrictAI,
      aiTags: restrictAI ? aiTags : [],
      minWordCount: minWordCount,
      maxWordCount: maxWordCount,
      minEntries: minEntries,
    };

    // SessionStorageに保存
    savePreviewData(previewData);
    
    // 新しいタブでプレビュー
    window.open('/contest-preview', '_blank');
  }, [
    user, title, shortDescription, description,
    applicationStartDate, applicationEndDate, reviewStartDate, reviewEndDate, resultAnnouncementDate,
    enableJudges, judges, status, headerPreview,
    allowFinishedWorks, allowPreStartDate, allowR18, allowSeries,
    restrictGenres, genres, restrictAI, aiTags,
    minWordCount, maxWordCount, minEntries
  ]);

  // 文字数表示関数
  const characterCountDisplay = useMemo(() => (current, max) => (
    <Typography variant="caption" sx={{ color: '#555' }}>{`${current} / ${max}`}</Typography>
  ), []);

  // 入力ハンドラー
  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
  }, []);

  const handleShortDescriptionChange = useCallback((e) => {
    setShortDescription(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback((value) => {
    setDescription(value);
  }, []);

  return (
    <Box
      sx={{
        padding: { xs: 2, md: 4 },
        backgroundColor: '#f8f9fa',
        borderRadius: 2,
        maxWidth: '1200px',
        margin: '0 auto',
        boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ 
        textAlign: 'center', 
        color: '#333',
        fontSize: { xs: '1.5rem', md: '2rem' },
        fontWeight: 600,
        mb: 4
      }}>
        コンテスト作成
      </Typography>

      {/* ステッパー追加 */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{ mb: 4 }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, md: 4 }, 
          mb: 3,
          backgroundColor: '#fff',
          borderRadius: 2,
          border: '1px solid #eee'
        }}
      >
        {getStepContent(activeStep)}
      </Paper>
      
      {/* ステップナビゲーションボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          戻る
        </Button>
        <Box>
          {activeStep !== steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              color="primary"
            >
              次へ
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              コンテストを作成
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ContestCreate;
