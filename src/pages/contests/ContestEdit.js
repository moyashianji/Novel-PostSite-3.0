import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
  Stack,
  Container,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingsIcon from '@mui/icons-material/Settings';
import CustomEditor from '../../components/wysiwyg/CustomEditor';

// Styled Components with theme support
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(6),
  maxWidth: '1200px',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0, 0, 0, 0.5)'
      : '0 8px 30px rgba(0, 0, 0, 0.12)',
  },
}));

const SectionHeader = styled(Box)(({ theme, color = 'primary' }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2.5, 3),
  backgroundColor: alpha(theme.palette[color].main, 0.1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
}));

const SectionContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}));

const ImageUploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const PreviewImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: 200,
  borderRadius: theme.spacing(1),
  objectFit: 'cover',
  border: `1px solid ${theme.palette.divider}`,
}));

const TagContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const JudgeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const CharacterCount = styled(Typography)(({ theme, isOver }) => ({
  fontSize: '0.875rem',
  color: isOver ? theme.palette.error.main : theme.palette.text.secondary,
  textAlign: 'right',
  marginTop: theme.spacing(0.5),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  padding: `${theme.spacing(1.5)} ${theme.spacing(3)}`,
  fontWeight: 'bold',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
}));

const ContestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State declarations
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [iconImage, setIconImage] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);
  const [applicationStartDate, setApplicationStartDate] = useState('');
  const [applicationEndDate, setApplicationEndDate] = useState('');
  const [reviewStartDate, setReviewStartDate] = useState('');
  const [reviewEndDate, setReviewEndDate] = useState('');
  const [resultAnnouncementDate, setResultAnnouncementDate] = useState('');
  const [applicationStartDateType, setApplicationStartDateType] = useState('calendar');
  const [applicationEndDateType, setApplicationEndDateType] = useState('calendar');
  const [reviewStartDateType, setReviewStartDateType] = useState('calendar');
  const [reviewEndDateType, setReviewEndDateType] = useState('calendar');
  const [resultAnnouncementDateType, setResultAnnouncementDateType] = useState('calendar');
  const [enableJudges, setEnableJudges] = useState(false);
  const [judges, setJudges] = useState([]);
  const [judgeId, setJudgeId] = useState('');
  const [loadingJudge, setLoadingJudge] = useState(false);
  const [allowFinishedWorks, setAllowFinishedWorks] = useState(false);
  const [allowPreStartDate, setAllowPreStartDate] = useState(false);
  const [restrictAI, setRestrictAI] = useState(false);
  const [aiTags, setAiTags] = useState([]);
  const [aiTagInput, setAiTagInput] = useState('');
  const [allowR18, setAllowR18] = useState(false);
  const [restrictGenres, setRestrictGenres] = useState(false);
  const [genres, setGenres] = useState([]);
  const [genreInput, setGenreInput] = useState('');
  const [restrictWordCount, setRestrictWordCount] = useState(false);
  const [minWordCount, setMinWordCount] = useState('');
  const [maxWordCount, setMaxWordCount] = useState('');
  const [allowSeries, setAllowSeries] = useState(false);
  const [minEntries, setMinEntries] = useState('');
  const [maxEntries, setMaxEntries] = useState('');
  const [status, setStatus] = useState('開催予定');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [applicationStartDateError, setApplicationStartDateError] = useState(false);
  const [applicationEndDateError, setApplicationEndDateError] = useState(false);

  const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

  // Fetch contest data
  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`/api/contests/${id}`);
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title);
          setShortDescription(data.shortDescription);
          const descriptionWithBase64Images = await convertWebPToBase64(data.description);
          setDescription(descriptionWithBase64Images);
          setIconPreview(data.iconImage);
          setHeaderPreview(data.headerImage);
          setApplicationStartDate(data.applicationStartDate);
          setApplicationEndDate(data.applicationEndDate);
          setReviewStartDate(data.reviewStartDate);
          setReviewEndDate(data.reviewEndDate);
          setResultAnnouncementDate(data.resultAnnouncementDate);
          setEnableJudges(data.enableJudges);
          const judgeInfos = await Promise.all(data.judges.map(judge => fetchJudgeInfo(judge.userId._id)));
          setJudges(judgeInfos.filter(judge => judge !== null));
          setAllowFinishedWorks(data.allowFinishedWorks);
          setAllowPreStartDate(data.allowPreStartDate);
          setRestrictAI(data.restrictAI);
          setAiTags(data.aiTags);
          setAllowR18(data.allowR18);
          setRestrictGenres(data.restrictGenres);
          setGenres(data.genres);
          setRestrictWordCount(data.restrictWordCount);
          setMinWordCount(data.minWordCount);
          setMaxWordCount(data.maxWordCount);
          setAllowSeries(data.allowSeries);
          setMinEntries(data.minEntries);
          setMaxEntries(data.maxEntries);
          setStatus(data.status);
        } else {
          console.error('Failed to fetch contest details');
        }
      } catch (error) {
        console.error('Error fetching contest details:', error);
      }
    };

    fetchContest();
  }, [id]);

  // Fetch user info
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

  // Utility functions
  const handleImageUpload = useCallback((event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        if (type === 'icon') {
          setIconImage(file);
          setIconPreview(base64String);
        } else if (type === 'header') {
          setHeaderImage(file);
          setHeaderPreview(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

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
  }, [judgeId, isValidObjectId, judges, fetchJudgeInfo]);

  const handleRemoveJudge = useCallback((index) => {
    setJudges(judges.filter((_, i) => i !== index));
  }, [judges]);

  const handleAddAiTag = useCallback(() => {
    if (aiTagInput && aiTags.length < 10) {
      setAiTags([...aiTags, aiTagInput]);
      setAiTagInput('');
    }
  }, [aiTagInput, aiTags]);

  const handleRemoveAiTag = useCallback((tag) => {
    setAiTags(aiTags.filter((t) => t !== tag));
  }, [aiTags]);

  const handleAddGenre = useCallback(() => {
    if (genreInput && genres.length < 10) {
      setGenres([...genres, genreInput]);
      setGenreInput('');
    }
  }, [genreInput, genres]);

  const handleRemoveGenre = useCallback((genre) => {
    setGenres(genres.filter((g) => g !== genre));
  }, [genres]);

  const extractBase64Images = useCallback((html) => {
    const matches = html.match(/data:image\/[a-zA-Z]+;base64,[^"]+/g) || [];
    return matches;
  }, []);

  const uploadBase64Image = useCallback(async (base64String) => {
    try {
      const blob = await convertBase64ToWebP(base64String);
      const formData = new FormData();
      formData.append('image', blob, 'image.webp');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('アップロード失敗');

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      return base64String;
    }
  }, []);

  const convertBase64ToWebP = useCallback((base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/webp', 0.8);
      };
    });
  }, []);

  const convertWebPToBase64 = useCallback(async (html) => {
    const matches = html.match(/<img[^>]+src="([^"]+)"[^>]*>/g) || [];
    const base64Images = await Promise.all(matches.map(async (match) => {
      const url = match.match(/src="(.*?)"/)[1];
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    }));
    let updatedHtml = html;
    matches.forEach((match, index) => {
      updatedHtml = updatedHtml.replace(match, `<img src="${base64Images[index]}" />`);
    });
    return updatedHtml;
  }, []);

  const validateForm = useCallback(() => {
    let isValid = true;

    if (!applicationStartDate) {
      setApplicationStartDateError(true);
      isValid = false;
    } else {
      setApplicationStartDateError(false);
    }

    if (!applicationEndDate) {
      setApplicationEndDateError(true);
      isValid = false;
    } else {
      setApplicationEndDateError(false);
    }

    return isValid;
  }, [applicationStartDate, applicationEndDate]);

  const handleSubmit = useCallback(async () => {
    if (!title || !shortDescription || !description) {
      alert('必須項目をすべて入力してください。');
      return;
    }
    if (!validateForm()) {
      alert('必須項目をすべて入力してください');
      return;
    }

    const base64Images = extractBase64Images(description);
    const uploadedImages = await Promise.all(base64Images.map(uploadBase64Image));
    let updatedDescription = description;
    base64Images.forEach((base64, index) => {
      updatedDescription = updatedDescription.replace(base64, uploadedImages[index]);
    });

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

    setLoading(true);

    try {
      const response = await fetch(`/api/contests/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        alert('コンテストが更新されました!');
        navigate('/contests');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'コンテスト更新に失敗しました。');
      }
    } catch (error) {
      console.error('Error updating contest:', error);
      alert('エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [
    id, title, shortDescription, description, iconImage, headerImage,
    applicationStartDate, applicationEndDate, reviewStartDate, reviewEndDate,
    resultAnnouncementDate, enableJudges, judges, allowFinishedWorks,
    allowPreStartDate, restrictAI, aiTags, allowR18, restrictGenres, genres,
    restrictWordCount, minWordCount, maxWordCount, allowSeries, minEntries,
    maxEntries, status, extractBase64Images, uploadBase64Image, validateForm, navigate,
  ]);

  const handlePreview = useCallback(() => {
    if (!user) {
      alert('ユーザー情報が取得できませんでした。ログインしていますか?');
      return;
    }
    const previewData = {
      title, shortDescription, description, applicationStartDate, applicationEndDate,
      reviewStartDate, reviewEndDate, resultAnnouncementDate, enableJudges,
      judges: judges.map(judge => ({
        userId: { _id: judge.id, nickname: judge.name, icon: judge.avatar }
      })),
      creator: { _id: user._id, nickname: user.nickname, icon: user.icon },
      entries: [], status: status, headerImage: headerPreview,
      allowFinishedWorks, allowPreStartDate, allowR18, allowSeries,
      restrictGenres, genres: restrictGenres ? genres : [],
      restrictAI, aiTags: restrictAI ? aiTags : [],
      minWordCount, maxWordCount, minEntries,
    };

    sessionStorage.setItem('contestPreviewData', JSON.stringify(previewData));
    window.open('/contest-preview', '_blank');
  }, [
    user, title, shortDescription, description, applicationStartDate, applicationEndDate,
    reviewStartDate, reviewEndDate, resultAnnouncementDate, enableJudges, judges,
    status, headerPreview, allowFinishedWorks, allowPreStartDate, allowR18,
    allowSeries, restrictGenres, genres, restrictAI, aiTags, minWordCount,
    maxWordCount, minEntries
  ]);

  const renderDateInput = useCallback((label, value, setValue, type, setType, isRequired) => (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <ScheduleIcon sx={{ mr: 1, fontSize: 18 }} />
        {label}
        {isRequired && <Typography color="error" sx={{ ml: 0.5 }}>*</Typography>}
      </Typography>
      <FormControl fullWidth sx={{ mb: 1 }}>
        <Select value={type} onChange={(e) => setType(e.target.value)} size="small">
          <MenuItem value="calendar">カレンダーから選択</MenuItem>
          <MenuItem value="text">自由入力</MenuItem>
        </Select>
      </FormControl>
      {type === 'calendar' ? (
        <TextField
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          fullWidth
          error={isRequired && !value}
          helperText={isRequired && !value ? `${label}は必須です` : ''}
          size="small"
        />
      ) : (
        <Box>
          <TextField
            placeholder={`${label}を入力`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 30 }}
            error={isRequired && !value}
            helperText={isRequired && !value ? `${label}は必須です` : ''}
            size="small"
          />
          <CharacterCount isOver={value.length > 30}>
            {value.length} / 30
          </CharacterCount>
        </Box>
      )}
    </Box>
  ), []);

  return (
    <PageContainer>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            ホーム
          </MuiLink>
          <MuiLink component={Link} to="/contests" sx={{ display: 'flex', alignItems: 'center' }}>
            コンテスト
          </MuiLink>
          <Typography color="text.primary">編集</Typography>
        </Breadcrumbs>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          コンテスト編集
        </Typography>
      </Box>

      {/* Basic Information */}
      <StyledCard>
        <SectionHeader color="primary">
          <Box sx={{ mr: 2 }}>
            <EditIcon color="primary" />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            基本情報
          </Typography>
        </SectionHeader>
        <SectionContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                コンテストタイトル <Typography component="span" color="error">*</Typography>
              </Typography>
              <TextField
                placeholder="魅力的なコンテストタイトルを入力してください"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                inputProps={{ maxLength: 50 }}
                error={!title}
                helperText={!title ? 'タイトルは必須です' : ''}
              />
              <CharacterCount isOver={title.length > 50}>
                {title.length} / 50
              </CharacterCount>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                短い説明 <Typography component="span" color="error">*</Typography>
              </Typography>
              <TextField
                placeholder="コンテストの概要を簡潔に説明してください"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
                inputProps={{ maxLength: 100 }}
                error={!shortDescription}
                helperText={!shortDescription ? '短い説明は必須です' : ''}
              />
              <CharacterCount isOver={shortDescription.length > 100}>
                {shortDescription.length} / 100
              </CharacterCount>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                詳細説明 <Typography component="span" color="error">*</Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                コンテスト概要、募集ジャンル、賞、賞金等、応募資格、応募方法、スケジュール、選考方法、規約など必要な情報を詳細に記載してください
              </Typography>
              <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <CustomEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="詳細説明を入力してください..."
                />
              </Box>
            </Grid>
          </Grid>
        </SectionContent>
      </StyledCard>

      {/* Images */}
      <StyledCard>
        <SectionHeader color="info">
          <Box sx={{ mr: 2 }}>
            <ImageIcon color="info" />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            画像設定
          </Typography>
        </SectionHeader>
        <SectionContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                アイコン画像
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="icon-upload"
                type="file"
                onChange={(e) => handleImageUpload(e, 'icon')}
              />
              <label htmlFor="icon-upload">
                <ImageUploadBox>
                  {iconPreview ? (
                    <PreviewImage src={iconPreview} alt="アイコンプレビュー" />
                  ) : (
                    <Box>
                      <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        クリックして画像をアップロード
                      </Typography>
                    </Box>
                  )}
                </ImageUploadBox>
              </label>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                ヘッダー画像
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="header-upload"
                type="file"
                onChange={(e) => handleImageUpload(e, 'header')}
              />
              <label htmlFor="header-upload">
                <ImageUploadBox>
                  {headerPreview ? (
                    <PreviewImage src={headerPreview} alt="ヘッダープレビュー" />
                  ) : (
                    <Box>
                      <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        クリックして画像をアップロード
                      </Typography>
                    </Box>
                  )}
                </ImageUploadBox>
              </label>
            </Grid>
          </Grid>
        </SectionContent>
      </StyledCard>

      {/* Schedule */}
      <StyledCard>
        <SectionHeader color="warning">
          <Box sx={{ mr: 2 }}>
            <ScheduleIcon color="warning" />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            日程設定
          </Typography>
        </SectionHeader>
        <SectionContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderDateInput('応募開始日', applicationStartDate, setApplicationStartDate, applicationStartDateType, setApplicationStartDateType, true)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderDateInput('応募終了日', applicationEndDate, setApplicationEndDate, applicationEndDateType, setApplicationEndDateType, true)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderDateInput('審査開始日', reviewStartDate, setReviewStartDate, reviewStartDateType, setReviewStartDateType, false)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderDateInput('審査終了日', reviewEndDate, setReviewEndDate, reviewEndDateType, setReviewEndDateType, false)}
            </Grid>
            <Grid item xs={12}>
              {renderDateInput('結果発表日', resultAnnouncementDate, setResultAnnouncementDate, resultAnnouncementDateType, setResultAnnouncementDateType, false)}
            </Grid>
          </Grid>
        </SectionContent>
      </StyledCard>

      {/* Advanced Settings */}
      <StyledCard>
        <SectionHeader color="secondary">
          <Box sx={{ mr: 2 }}>
            <SettingsIcon color="secondary" />
          </Box>
          <Typography variant="h6" fontWeight="bold">
            詳細設定
          </Typography>
        </SectionHeader>
        <SectionContent>
          <Stack spacing={3}>
            {/* Judges */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableJudges}
                    onChange={(e) => setEnableJudges(e.target.checked)}
                    color="secondary"
                  />
                }
                label="審査員リストを指定する"
              />
              {enableJudges && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        label="審査員ID"
                        value={judgeId}
                        onChange={(e) => setJudgeId(e.target.value)}
                        fullWidth
                        size="small"
                        error={judgeId && !isValidObjectId(judgeId)}
                        helperText={judgeId && !isValidObjectId(judgeId) ? '無効なID形式です' : ''}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        startIcon={loadingJudge ? <CircularProgress size={16} /> : <AddIcon />}
                        onClick={handleAddJudge}
                        variant="contained"
                        fullWidth
                        disabled={loadingJudge}
                        size="small"
                      >
                        追加
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {judges.map((judge, index) => (
                    <JudgeCard key={index} elevation={1}>
                      <Avatar src={judge.avatar} sx={{ width: 32, height: 32 }} />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {judge.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveJudge(index)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </JudgeCard>
                  ))}
                </Box>
              )}
            </Box>

            <Divider />

            {/* Other Settings */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Checkbox checked={allowFinishedWorks} onChange={(e) => setAllowFinishedWorks(e.target.checked)} />}
                  label="完結済作品に限定する"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Checkbox checked={allowPreStartDate} onChange={(e) => setAllowPreStartDate(e.target.checked)} />}
                  label="応募開始日以前の作品を許可"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Checkbox checked={allowR18} onChange={(e) => setAllowR18(e.target.checked)} />}
                  label="R18作品を許可"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Checkbox checked={allowSeries} onChange={(e) => setAllowSeries(e.target.checked)} />}
                  label="シリーズ作品を許可"
                />
              </Grid>
            </Grid>

            {/* AI Restriction */}
            <Box>
              <FormControlLabel
                control={<Checkbox checked={restrictAI} onChange={(e) => setRestrictAI(e.target.checked)} />}
                label="使用しているAIを制限する"
              />
              {restrictAI && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        label="AIタグ"
                        value={aiTagInput}
                        onChange={(e) => setAiTagInput(e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ maxLength: 50 }}
                      />
                      <CharacterCount isOver={aiTagInput.length > 50}>
                        {aiTagInput.length} / 50
                      </CharacterCount>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddAiTag}
                        variant="outlined"
                        fullWidth
                        disabled={aiTags.length >= 10}
                        size="small"
                      >
                        追加
                      </Button>
                    </Grid>
                  </Grid>
                  <TagContainer>
                    {aiTags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveAiTag(tag)}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </TagContainer>
                </Box>
              )}
            </Box>

            {/* Genre Restriction */}
            <Box>
              <FormControlLabel
                control={<Checkbox checked={restrictGenres} onChange={(e) => setRestrictGenres(e.target.checked)} />}
                label="ジャンルを制限する"
              />
              {restrictGenres && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        label="ジャンル"
                        value={genreInput}
                        onChange={(e) => setGenreInput(e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ maxLength: 50 }}
                      />
                      <CharacterCount isOver={genreInput.length > 50}>
                        {genreInput.length} / 50
                      </CharacterCount>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddGenre}
                        variant="outlined"
                        fullWidth
                        disabled={genres.length >= 10}
                        size="small"
                      >
                        追加
                      </Button>
                    </Grid>
                  </Grid>
                  <TagContainer>
                    {genres.map((genre, index) => (
                      <Chip
                        key={index}
                        label={genre}
                        onDelete={() => handleRemoveGenre(genre)}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </TagContainer>
                </Box>
              )}
            </Box>

            {/* Word Count Restriction */}
            <Box>
              <FormControlLabel
                control={<Checkbox checked={restrictWordCount} onChange={(e) => setRestrictWordCount(e.target.checked)} />}
                label="作品の文字数を制限する"
              />
              {restrictWordCount && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="最小文字数"
                      type="number"
                      value={minWordCount}
                      onChange={(e) => setMinWordCount(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="最大文字数"
                      type="number"
                      value={maxWordCount}
                      onChange={(e) => setMaxWordCount(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              )}
            </Box>

            {/* Entry Limits */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="最小応募数"
                  type="number"
                  value={minEntries}
                  onChange={(e) => setMinEntries(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="最大応募数"
                  type="number"
                  value={maxEntries}
                  onChange={(e) => setMaxEntries(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>コンテストステータス</InputLabel>
              <Select
                value={status}
                label="コンテストステータス"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="開催予定">開催予定</MenuItem>
                <MenuItem value="募集中">募集中</MenuItem>
                <MenuItem value="募集終了">募集終了</MenuItem>
                <MenuItem value="募集一時停止中">募集一時停止中</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </SectionContent>
      </StyledCard>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <ActionButton
          variant="outlined"
          startIcon={<PreviewIcon />}
          onClick={handlePreview}
          size="large"
        >
          プレビュー
        </ActionButton>
        <ActionButton
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSubmit}
          disabled={loading}
          size="large"
        >
          {loading ? '更新中...' : 'コンテスト更新'}
        </ActionButton>
      </Box>
    </PageContainer>
  );
};

export default ContestEdit;