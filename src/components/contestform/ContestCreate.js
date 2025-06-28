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
  Alert,
  Container,
  Card,
  CardContent,
  Fade,
  LinearProgress
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Create as CreateIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Preview as PreviewIcon,
  Check as CheckIcon
} from '@mui/icons-material';

// フォームセクションをインポート
import BasicInfo from './formsections/BasicInfo';
import DetailedDescription from './formsections/DetailedDescription';
import ImageSection from './formsections/ImageSection';
import DateSection from './formsections/DateSection';
import JudgeSection from './formsections/JudgeSection';
import OptionSection from './formsections/OptionSection';
import ContestTagSection from './formsections/ContestTagSection';
import FormActions from './formsections/FormActions';

// ユーティリティをインポート
import { 
  getLocalStorageData, 
  saveFormData, 
  savePreviewData, 
  saveImagePreview, 
  getImagePreview, 
  removeImagePreview,
  getStorageInfo 
} from './utils/storage';
import { base64ToFile, processHtmlImages } from './utils/imageProcessor';
import { isValidObjectId, validateForm } from './utils/validation';
import { validateImageFile, resizeImage, formatFileSize, IMAGE_LIMITS } from './utils/imageValidator';

// スタイル付きコンポーネント
const ContestContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  maxWidth: '1200px',
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiStepLabel-root': {
    '& .MuiStepLabel-label': {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    '& .MuiStepLabel-label.Mui-active': {
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
    '& .MuiStepLabel-label.Mui-completed': {
      color: theme.palette.success.main,
    },
  },
  '& .MuiStepIcon-root': {
    '&.Mui-active': {
      color: theme.palette.primary.main,
    },
    '&.Mui-completed': {
      color: theme.palette.success.main,
    },
  },
}));

const ContentCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)',
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.3s ease',
  overflow: 'visible',
}));

const NavigationBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(10px)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
  '&:disabled': {
    transform: 'none',
    boxShadow: 'none',
  },
}));

const ProgressIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

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
  const [iconPreview, setIconPreview] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);
  const [imageError, setImageError] = useState({ icon: '', header: '' });
  const [uploadProgress, setUploadProgress] = useState({ icon: 0, header: 0 });

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
  
  // コンテストタグ
  const [contestTags, setContestTags] = useState(initialData?.contestTags || getLocalStorageData('contestTags', []));
  const [newContestTag, setNewContestTag] = useState('');
  
  // ステータス
  const [status, setStatus] = useState(initialData?.status || getLocalStorageData('status', '開催予定'));
  
  // バリデーション・ローディング
  const [applicationStartDateError, setApplicationStartDateError] = useState(false);
  const [applicationEndDateError, setApplicationEndDateError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // ステップ定義
  const steps = [
    'コンテスト基本情報',
    '詳細説明',
    '画像設定',
    '日程設定',
    '審査員と応募条件',
    'コンテストタグ設定',
    '確認と作成'
  ];

  // 進捗率計算
  const progressPercentage = useMemo(() => {
    return ((activeStep + 1) / steps.length) * 100;
  }, [activeStep, steps.length]);

  // LocalStorageの容量監視（デバッグ用）
  useEffect(() => {
    const storageInfo = getStorageInfo();
    if (storageInfo) {
      console.log('LocalStorage使用状況:', storageInfo);
    }
  }, []);

  // ページロード時に画像プレビューを復元
  useEffect(() => {
    const iconData = getImagePreview('icon');
    const headerData = getImagePreview('header');
    
    if (iconData.preview && iconData.fileName) {
      setIconPreview(iconData.preview);
    }
    
    if (headerData.preview && headerData.fileName) {
      setHeaderPreview(headerData.preview);
    }
  }, []);

  // フォームデータ保存（画像データを除外）
  const saveCurrentFormData = useCallback(() => {
    const formData = {
      title,
      shortDescription,
      description,
      // 画像プレビューは個別保存されるため除外
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
      contestTags,
    };

    const success = saveFormData(formData);
    if (!success) {
      console.warn('フォームデータの保存に失敗しました');
    }
  }, [
    title, shortDescription, description,
    applicationStartDate, applicationEndDate, reviewStartDate, reviewEndDate, resultAnnouncementDate,
    enableJudges, judges, allowFinishedWorks, allowPreStartDate, restrictAI, aiTags,
    allowR18, restrictGenres, genres, restrictWordCount, minWordCount, maxWordCount,
    allowSeries, minEntries, maxEntries, status, contestTags,
  ]);

  // フォームデータ保存のデバウンス処理
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCurrentFormData();
    }, 1000); // 1秒後に保存

    return () => clearTimeout(timer);
  }, [saveCurrentFormData]);

  // 次のステップへ進む
  const handleNext = useCallback(() => {
    // 現在のステップのバリデーション
    if (activeStep === 0) {
      if (!title || !shortDescription) {
        setErrors({
          ...errors,
          title: !title,
          shortDescription: !shortDescription
        });
        return;
      }
    } else if (activeStep === 1) {
      if (!description || description === '<p></p>') {
        setErrors({
          ...errors,
          description: true
        });
        return;
      }
    } else if (activeStep === 3) {
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
            imageError={imageError}
            uploadProgress={uploadProgress}
            imageLimits={IMAGE_LIMITS}
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
          <ContestTagSection
            contestTags={contestTags}
            setContestTags={setContestTags}
            newContestTag={newContestTag}
            setNewContestTag={setNewContestTag}
          />
        );
      case 6:
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

  // LocalStorageから画像をロード（修正版）
  useEffect(() => {
    const iconData = getImagePreview('icon');
    if (iconData.preview && iconData.fileName) {
      setIconPreview(iconData.preview);
      setIconImage(base64ToFile(iconData.preview, iconData.fileName));
    }

    const headerData = getImagePreview('header');
    if (headerData.preview && headerData.fileName) {
      setHeaderPreview(headerData.preview);
      setHeaderImage(base64ToFile(headerData.preview, headerData.fileName));
    }
  }, []);

  // 保存された審査員データをロード
  useEffect(() => {
    const storedJudges = getLocalStorageData('judges', []);
    const fetchStoredJudges = async () => {
      const judgeInfos = await Promise.all(storedJudges.map(judge => fetchJudgeInfo(judge.id)));
      setJudges(judgeInfos.filter(judge => judge !== null));
    };
    fetchStoredJudges();
  }, []);

  // 画像アップロード処理（修正版）
  const handleImageUpload = useCallback(async (event, type) => {
    // エラーをクリア
    setImageError(prev => ({ ...prev, [type]: '' }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    // 削除アクションの場合
    if (event.target.files === null) {
      if (type === 'icon') {
        setIconImage(null);
        setIconPreview(null);
        removeImagePreview('icon');
      } else if (type === 'header') {
        setHeaderImage(null);
        setHeaderPreview(null);
        removeImagePreview('header');
      }
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    try {
      // ファイルバリデーション
      const validation = validateImageFile(file, type);
      if (!validation.isValid) {
        setImageError(prev => ({ 
          ...prev, 
          [type]: validation.errors.join('\n') 
        }));
        event.target.value = '';
        return;
      }

      setUploadProgress(prev => ({ ...prev, [type]: 25 }));

      // 必要に応じて画像をリサイズ（より積極的に圧縮）
      let processedFile = file;
      const shouldCompress = file.size > 512 * 1024; // 512KB以上は圧縮
      
      if (shouldCompress) {
        const maxDimension = type === 'icon' ? 512 : 1920;
        // 圧縮率を上げる（品質を下げる）
        const quality = file.size > 2 * 1024 * 1024 ? 0.6 : 0.8;
        processedFile = await resizeImage(file, maxDimension, maxDimension, quality);
        setUploadProgress(prev => ({ ...prev, [type]: 50 }));
      }

      setUploadProgress(prev => ({ ...prev, [type]: 75 }));

      // ファイルを読み込み
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        
        // サイズチェック（base64は元のサイズの約1.37倍になる）
        const estimatedSize = base64String.length * 0.75;
        if (estimatedSize > 1024 * 1024) { // 1MB以上の場合は警告
          console.warn(`Large image preview (${(estimatedSize / (1024 * 1024)).toFixed(1)}MB):`, type);
        }

        if (type === 'icon') {
          setIconImage(processedFile);
          setIconPreview(base64String);
          saveImagePreview('icon', base64String, processedFile.name || file.name);
        } else if (type === 'header') {
          setHeaderImage(processedFile);
          setHeaderPreview(base64String);
          saveImagePreview('header', base64String, processedFile.name || file.name);
        }

        setUploadProgress(prev => ({ ...prev, [type]: 100 }));
        
        // 進捗をリセット
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, [type]: 0 }));
        }, 1000);
      };

      reader.onerror = () => {
        setImageError(prev => ({ 
          ...prev, 
          [type]: 'ファイルの読み込みに失敗しました' 
        }));
        setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      };

      reader.readAsDataURL(processedFile);

    } catch (error) {
      console.error('Image upload error:', error);
      setImageError(prev => ({ 
        ...prev, 
        [type]: 'ファイルの処理中にエラーが発生しました' 
      }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      event.target.value = '';
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

  // フォーム送信時のエラーハンドリングを改善
  const handleSubmit = useCallback(async () => {
    if (!validateFormData()) {
      alert('必須項目をすべて入力してください');
      return;
    }

    // 画像エラーがある場合は送信を停止
    if (imageError.icon || imageError.header) {
      alert('画像にエラーがあります。修正してから再度お試しください。');
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
      
      // 画像ファイルサイズの最終チェック
      if (iconImage) {
        if (iconImage.size > IMAGE_LIMITS.ICON_MAX_SIZE) {
          throw new Error(`アイコン画像のサイズが大きすぎます（最大: ${IMAGE_LIMITS.ICON_MAX_SIZE / (1024 * 1024)}MB）`);
        }
        formData.append('iconImage', iconImage);
      }
      
      if (headerImage) {
        if (headerImage.size > IMAGE_LIMITS.HEADER_MAX_SIZE) {
          throw new Error(`ヘッダー画像のサイズが大きすぎます（最大: ${IMAGE_LIMITS.HEADER_MAX_SIZE / (1024 * 1024)}MB）`);
        }
        formData.append('headerImage', headerImage);
      }

      // その他のフォームデータを追加
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
      formData.append('contestTags', JSON.stringify(contestTags));

      // APIリクエスト送信
      const response = await fetch(`/api/contests/create`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        // エラーレスポンスの処理
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'コンテスト作成に失敗しました。');
        } else {
          // HTMLエラーページの場合（413エラーなど）
          if (response.status === 413) {
            throw new Error('ファイルサイズが大きすぎます。画像ファイルのサイズを小さくしてください。');
          } else {
            throw new Error(`サーバーエラーが発生しました (${response.status})`);
          }
        }
      }

      const result = await response.json();
      alert('コンテストが作成されました！');
      
      // LocalStorageをクリア
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('iconPreview') || key.startsWith('headerPreview') || 
            key.startsWith('iconImageName') || key.startsWith('headerImageName') ||
            key === 'contestFormData') {
          localStorage.removeItem(key);
        }
      });
      
      navigate('/contests');

    } catch (error) {
      console.error('Error creating contest:', error);
      alert(error.message || 'エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [
    title, shortDescription, description, iconImage, headerImage,
    applicationStartDate, applicationEndDate, reviewStartDate, reviewEndDate, resultAnnouncementDate,
    enableJudges, judges, allowFinishedWorks, allowPreStartDate,
    restrictAI, aiTags, allowR18, restrictGenres, genres,
    restrictWordCount, minWordCount, maxWordCount,
    allowSeries, minEntries, maxEntries, status, contestTags,
    validateFormData, navigate, imageError
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
      contestTags: contestTags,
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
    minWordCount, maxWordCount, minEntries, contestTags
  ]);

  // 文字数表示関数
  const characterCountDisplay = useMemo(() => (current, max) => (
    <Typography variant="caption" color="text.secondary">{`${current} / ${max}`}</Typography>
  ), []);

  // 入力ハンドラー
  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
    // エラークリア
    setErrors(prev => ({ ...prev, title: false }));
  }, []);

  const handleShortDescriptionChange = useCallback((e) => {
    setShortDescription(e.target.value);
    // エラークリア
    setErrors(prev => ({ ...prev, shortDescription: false }));
  }, []);

  const handleDescriptionChange = useCallback((value) => {
    setDescription(value);
    // エラークリア
    setErrors(prev => ({ ...prev, description: false }));
  }, []);

  return (
    <ContestContainer>
      {/* ヘッダーカード */}
      <HeaderCard>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <CreateIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography 
              variant="h3" 
              component="h1" 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              コンテスト作成
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
          >
            魅力的なコンテストを作成して、たくさんの作品を集めましょう
          </Typography>
          
          {/* 進捗インジケーター */}
          <ProgressIndicator>
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              進捗: {Math.round(progressPercentage)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ 
                width: 200, 
                height: 8, 
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }
              }} 
            />
            <Typography variant="caption" color="text.secondary">
              ステップ {activeStep + 1} / {steps.length}
            </Typography>
          </ProgressIndicator>
        </CardContent>
      </HeaderCard>

      {/* ステッパー */}
      <StyledStepper 
        activeStep={activeStep} 
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={({ active, completed }) => (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: completed 
                      ? theme.palette.success.main 
                      : active 
                        ? theme.palette.primary.main 
                        : theme.palette.grey[300],
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                  }}
                >
                  {completed ? <CheckIcon fontSize="small" /> : index + 1}
                </Box>
              )}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </StyledStepper>
      
      {/* コンテンツエリア */}
      <Fade in={true} timeout={500}>
        <ContentCard>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {getStepContent(activeStep)}
          </CardContent>
        </ContentCard>
      </Fade>
      
      {/* ナビゲーションボタン */}
      <NavigationBox>
        <StyledButton
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
        >
          戻る
        </StyledButton>
        
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {steps[activeStep]}
        </Typography>
        
        <Box>
          {activeStep !== steps.length - 1 ? (
            <StyledButton
              variant="contained"
              onClick={handleNext}
              endIcon={<NavigateNextIcon />}
            >
              次へ
            </StyledButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <StyledButton
                variant="outlined"
                onClick={handlePreview}
                startIcon={<PreviewIcon />}
                disabled={loading}
              >
                プレビュー
              </StyledButton>
              <StyledButton
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
              >
                {loading ? '作成中...' : 'コンテストを作成'}
              </StyledButton>
            </Box>
          )}
        </Box>
      </NavigationBox>
    </ContestContainer>
  );
};

export default ContestCreate;