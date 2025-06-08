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
} from '@mui/material';
import 'react-quill/dist/quill.snow.css';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomEditor from '../../components/wysiwyg/CustomEditor';

const ContestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  useEffect(() => {
    const fetchJudges = async () => {
      const judgeInfos = await Promise.all(judges.map(judge => fetchJudgeInfo(judge.id)));
      setJudges(judgeInfos.filter(judge => judge !== null));
    };

    fetchJudges();
  }, [fetchJudgeInfo]);
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
    const matches = html.match(/<img src="http:\/\/localhost:5000\/uploads\/(.*?)"/g) || [];
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
      updatedHtml = updatedHtml.replace(match, `<img src="${base64Images[index]}"`);
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
    console.log(title)
    console.log(shortDescription)
    console.log(updatedDescription)
    setLoading(true);

    try {
      const response = await fetch(`/api/contests/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        alert('コンテストが更新されました！');
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
    id,
    title,
    shortDescription,
    description,
    iconImage,
    headerImage,
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
    extractBase64Images,
    uploadBase64Image,
    validateForm,
    navigate,
  ]);

  const characterCountDisplay = useMemo(() => (current, max) => (
    <Typography variant="caption" sx={{ color: '#555' }}>{`${current} / ${max}`}</Typography>
  ), []);

  const renderDateInput = useCallback((label, value, setValue, type, setType, isRequired) => (
    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <MenuItem value="calendar">カレンダーから選択</MenuItem>
          <MenuItem value="text">自由入力</MenuItem>
        </Select>
      </FormControl>
      {type === 'calendar' ? (
        <TextField
          type="datetime-local"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error={isRequired && !value}
          helperText={isRequired && !value ? `${label}は必須です` : ''}
        />
      ) : (
        <Box>
          <TextField
            fullWidth
            placeholder="例: 1月中旬 / 春頃 / 2025年3月予定"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputProps={{ maxLength: 30 }}
            error={isRequired && !value}
            helperText={isRequired && !value ? `${label}は必須です` : ''}
          />
          <Typography variant="caption" sx={{ color: '#555' }}>
            {value.length} / 30
          </Typography>
        </Box>
      )}
    </Grid>
  ), []);

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

    sessionStorage.setItem('contestPreviewData', JSON.stringify(previewData));
    window.open('/contest-preview', '_blank');
  }, [
    user,
    title,
    shortDescription,
    description,
    applicationStartDate,
    applicationEndDate,
    reviewStartDate,
    reviewEndDate,
    resultAnnouncementDate,
    enableJudges,
    judges,
    status,
    headerPreview,
    allowFinishedWorks,
    allowPreStartDate,
    allowR18,
    allowSeries,
    restrictGenres,
    genres,
    restrictAI,
    aiTags,
    minWordCount,
    maxWordCount,
    minEntries
  ]);

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
        padding: 4,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        maxWidth: '1200px',
        margin: '0 auto',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#333' }}>
        コンテスト編集
      </Typography>
      <Grid container spacing={3}>
        <ContestInfo
          title={title}
          handleTitleChange={handleTitleChange}
          characterCountDisplay={characterCountDisplay}
        />
        <ShortDescription
          shortDescription={shortDescription}
          handleShortDescriptionChange={handleShortDescriptionChange}
          characterCountDisplay={characterCountDisplay}
        />
        <DetailedDescription
          description={description}
          handleDescriptionChange={handleDescriptionChange}
        />
        <ContestImages
          iconPreview={iconPreview}
          headerPreview={headerPreview}
          handleImageUpload={handleImageUpload}
        />
        <DateSettings
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
          renderDateInput={renderDateInput}
        />
        <DetailedSettings
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
        <OtherSettings
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
        />
        <ContestStatus
          status={status}
          setStatus={setStatus}
        />
        <PreviewButton
          handlePreview={handlePreview}
        />
        <SubmitButton
          handleSubmit={handleSubmit}
          loading={loading}
        />
      </Grid>
    </Box>
  );
};

const ContestInfo = React.memo(({ title, handleTitleChange, characterCountDisplay }) => (
  <Grid item xs={12}>
    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
      コンテスト基本情報<Typography component="span" color="error"> ※</Typography>
    </Typography>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <Box display="flex" alignItems="center">
        <TextField
          label="コンテストタイトル"
          variant="outlined"
          fullWidth
          value={title}
          onChange={handleTitleChange}
          required
          inputProps={{ maxLength: 50 }}
        />
        <Typography variant="body2" color="error" ml={2}>
          ※
        </Typography>
      </Box>
      {characterCountDisplay(title.length, 50)}
    </Box>
  </Grid>
));

const ShortDescription = React.memo(({ shortDescription, handleShortDescriptionChange, characterCountDisplay }) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <Box display="flex" alignItems="center">
        <TextField
          label="短い概要（50字以内）"
          variant="outlined"
          fullWidth
          value={shortDescription}
          onChange={handleShortDescriptionChange}
          required
          inputProps={{ maxLength: 50 }}
        />
        <Typography variant="body2" color="error" ml={2}>
          ※
        </Typography>
      </Box>
      {characterCountDisplay(shortDescription.length, 50)}
    </Box>
  </Grid>
));

const DetailedDescription = React.memo(({ description, handleDescriptionChange }) => (
  <Grid item xs={12}>
    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
      詳細説明 <Typography component="span" color="error">※</Typography>
    </Typography>
    <Typography variant="h7" sx={{ mb: 1, color: '#555' }}>
      （コンテスト概要、募集ジャンル、賞、賞金等、応募資格、応募方法、スケジュール、選考方法、規約など必要な情報を詳細に記載してください）
    </Typography>
    <Paper variant="outlined" sx={{ padding: 2, backgroundColor: '#fff' }}>
      <CustomEditor value={description} onChange={handleDescriptionChange} />
    </Paper>
  </Grid>
));

const ContestImages = React.memo(({ iconPreview, headerPreview, handleImageUpload }) => (
  <Grid item xs={12}>
    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
      コンテスト画像設定
    </Typography>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Button variant="contained" component="label">
            アイコン画像をアップロード
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImageUpload(e, 'icon')}
            />
          </Button>
          {iconPreview && (
            <Box mt={2}>
              <img
                src={iconPreview}
                alt="アイコン画像プレビュー"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </Box>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button variant="contained" component="label">
            ヘッダー画像をアップロード
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImageUpload(e, 'header')}
            />
          </Button>
          {headerPreview && (
            <Box mt={2}>
              <img
                src={headerPreview}
                alt="ヘッダー画像プレビュー"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  </Grid>
));

const DateSettings = React.memo(({
  applicationStartDate,
  setApplicationStartDate,
  applicationEndDate,
  setApplicationEndDate,
  reviewStartDate,
  setReviewStartDate,
  reviewEndDate,
  setReviewEndDate,
  resultAnnouncementDate,
  setResultAnnouncementDate,
  applicationStartDateType,
  setApplicationStartDateType,
  applicationEndDateType,
  setApplicationEndDateType,
  reviewStartDateType,
  setReviewStartDateType,
  reviewEndDateType,
  setReviewEndDateType,
  resultAnnouncementDateType,
  setResultAnnouncementDateType,
  renderDateInput
}) => (
  <Grid item xs={12}>
    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
      日程設定<Typography component="span" color="error"> ※応募開始、終了日必須</Typography>
    </Typography>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <Grid container spacing={2}>
        <DateInput
          value={applicationEndDate}
          setValue={setApplicationEndDate}
          type={applicationEndDateType}
          setType={setApplicationEndDateType}
          isRequired={true}
          renderDateInput={renderDateInput}
        />
        <DateInput
          label="審査開始日"
          value={reviewStartDate}
          setValue={setReviewStartDate}
          type={reviewStartDateType}
          setType={setReviewStartDateType}
          isRequired={false}
          renderDateInput={renderDateInput}
        />
        <DateInput
          label="審査終了日"
          value={reviewEndDate}
          setValue={setReviewEndDate}
          type={reviewEndDateType}
          setType={setReviewEndDateType}
          isRequired={false}
          renderDateInput={renderDateInput}
        />
        <DateInput
          label="結果発表日"
          value={resultAnnouncementDate}
          setValue={setResultAnnouncementDate}
          type={resultAnnouncementDateType}
          setType={setResultAnnouncementDateType}
          isRequired={false}
          renderDateInput={renderDateInput}

        />
      </Grid>
    </Box>
  </Grid>
));

const DateInput = React.memo(({ label, value, setValue, type, setType, isRequired, renderDateInput }) => (
  <Grid item xs={12} md={6}>
    {renderDateInput(label, value, setValue, type, setType, isRequired)}
  </Grid>
));

const DetailedSettings = React.memo(({
  enableJudges,
  setEnableJudges,
  judgeId,
  setJudgeId,
  isValidObjectId,
  handleAddJudge,
  loadingJudge,
  judges,
  handleRemoveJudge
}) => (
  <Grid item xs={12}>
    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
      詳細設定
    </Typography>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={enableJudges}
            onChange={(e) => setEnableJudges(e.target.checked)}
          />
        }
        label="審査員リストを指定する（個人または会社のすみわけID）"
      />
      {enableJudges && (
        <Box mt={2}>
          <JudgeInput
            judgeId={judgeId}
            setJudgeId={setJudgeId}
            isValidObjectId={isValidObjectId}
            handleAddJudge={handleAddJudge}
            loadingJudge={loadingJudge}
          />
          <JudgeList judges={judges} handleRemoveJudge={handleRemoveJudge} />
        </Box>
      )}
    </Box>
  </Grid>
));

const JudgeInput = React.memo(({
  judgeId,
  setJudgeId,
  isValidObjectId,
  handleAddJudge,
  loadingJudge
}) => (
  <Grid container spacing={2}>
    <Grid item xs={10}>
      <TextField
        label="審査員アカウントID"
        variant="outlined"
        fullWidth
        value={judgeId}
        onChange={(e) => setJudgeId(e.target.value)}
        error={judgeId && !isValidObjectId(judgeId)} // エラーハンドリング
        helperText={judgeId && !isValidObjectId(judgeId) ? '無効なID形式です' : ''}
      />
    </Grid>
    <Grid item xs={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddJudge}
        startIcon={<AddIcon />}
        fullWidth
        disabled={loadingJudge}
      >
        {loadingJudge ? <CircularProgress size={24} color="inherit" /> : '追加'}
      </Button>
    </Grid>
  </Grid>
));

const JudgeList = React.memo(({ judges, handleRemoveJudge }) => (
  <Box mt={2}>
    {judges.map((judge, index) => (
      <Paper
        key={index}
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: 2,
          mb: 1,
          backgroundColor: '#fafafa',
        }}
      >
        <Avatar src={judge.avatar} alt={judge.name} sx={{ width: 40, height: 40, mr: 2 }} />
        <Typography flexGrow={1}>{judge.name}</Typography>
        <IconButton onClick={() => handleRemoveJudge(index)} color="error">
          <DeleteIcon />
        </IconButton>
      </Paper>
    ))}
  </Box>
));

const OtherSettings = React.memo(({
  allowFinishedWorks,
  setAllowFinishedWorks,
  allowPreStartDate,
  setAllowPreStartDate,
  restrictAI,
  setRestrictAI,
  aiTagInput,
  setAiTagInput,
  handleAddAiTag,
  aiTags,
  handleRemoveAiTag,
  allowR18,
  setAllowR18,
  restrictGenres,
  setRestrictGenres,
  genreInput,
  setGenreInput,
  handleAddGenre,
  genres,
  handleRemoveGenre,
  restrictWordCount,
  setRestrictWordCount,
  minWordCount,
  setMinWordCount,
  maxWordCount,
  setMaxWordCount,
  allowSeries,
  setAllowSeries,
  minEntries,
  setMinEntries,
  maxEntries,
  setMaxEntries
}) => (
  <>
    <AllowFinishedWorks
      allowFinishedWorks={allowFinishedWorks}
      setAllowFinishedWorks={setAllowFinishedWorks}
    />
    <AllowPreStartDate
      allowPreStartDate={allowPreStartDate}
      setAllowPreStartDate={setAllowPreStartDate}
    />
    <RestrictAI
      restrictAI={restrictAI}
      setRestrictAI={setRestrictAI}
      aiTagInput={aiTagInput}
      setAiTagInput={setAiTagInput}
      handleAddAiTag={handleAddAiTag}
      aiTags={aiTags}
      handleRemoveAiTag={handleRemoveAiTag}
    />
    <AllowR18
      allowR18={allowR18}
      setAllowR18={setAllowR18}
    />
    <RestrictGenres
      restrictGenres={restrictGenres}
      setRestrictGenres={setRestrictGenres}
      genreInput={genreInput}
      setGenreInput={setGenreInput}
      handleAddGenre={handleAddGenre}
      genres={genres}
      handleRemoveGenre={handleRemoveGenre}
    />
    <RestrictWordCount
      restrictWordCount={restrictWordCount}
      setRestrictWordCount={setRestrictWordCount}
      minWordCount={minWordCount}
      setMinWordCount={setMinWordCount}
      maxWordCount={maxWordCount}
      setMaxWordCount={setMaxWordCount}
    />
    <AllowSeries
      allowSeries={allowSeries}
      setAllowSeries={setAllowSeries}
    />
    <MinEntries
      minEntries={minEntries}
      setMinEntries={setMinEntries}
    />
    <MaxEntries
      maxEntries={maxEntries}
      setMaxEntries={setMaxEntries}
    />
  </>
));

const AllowFinishedWorks = React.memo(({ allowFinishedWorks, setAllowFinishedWorks }) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={allowFinishedWorks}
            onChange={(e) => setAllowFinishedWorks(e.target.checked)}
          />
        }
        label="完結済作品に限定する"
      />
    </Box>
  </Grid>
));

const AllowPreStartDate = React.memo(({ allowPreStartDate, setAllowPreStartDate }) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={allowPreStartDate}
            onChange={(e) => setAllowPreStartDate(e.target.checked)}
          />
        }
        label="応募開始日以前の作品を許可"
      />
    </Box>
  </Grid>
));

const RestrictAI = React.memo(({
  restrictAI,
  setRestrictAI,
  aiTagInput,
  setAiTagInput,
  handleAddAiTag,
  aiTags,
  handleRemoveAiTag
}) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={restrictAI}
            onChange={(e) => setRestrictAI(e.target.checked)}
          />
        }
        label="使用しているAIを制限する"
      />
      {restrictAI && (
        <Box mt={2}>
          <TextField
            label="AI名を入力"
            variant="outlined"
            fullWidth
            value={aiTagInput}
            onChange={(e) => setAiTagInput(e.target.value)}
          />
          <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
            {aiTagInput.length} / 50
          </Typography>
          <Button
            onClick={handleAddAiTag}
            variant="outlined"
            sx={{ mt: 1 }}
            disabled={!aiTagInput || aiTags.length >= 10}
          >
            タグを追加
          </Button>
          <Box mt={2}>
            {aiTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => handleRemoveAiTag(tag)}
                sx={{ margin: '4px' }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  </Grid>
));

const AllowR18 = React.memo(({ allowR18, setAllowR18 }) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={allowR18}
            onChange={(e) => setAllowR18(e.target.checked)}
          />
        }
        label="R18作品を許可"
      />
    </Box>
  </Grid>
));

const RestrictGenres = React.memo(({
  restrictGenres,
  setRestrictGenres,
  genreInput,
  setGenreInput,
  handleAddGenre,
  genres,
  handleRemoveGenre
}) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={restrictGenres}
            onChange={(e) => setRestrictGenres(e.target.checked)}
          />
        }
        label="ジャンルを制限する"
      />
      {restrictGenres && (
        <Box mt={2}>
          <TextField
            label="ジャンルを入力"
            variant="outlined"
            fullWidth
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
          />
          <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
            {genreInput.length} / 50
          </Typography>
          <Button
            onClick={handleAddGenre}
            variant="outlined"
            sx={{ mt: 1 }}
            disabled={!genreInput || genres.length >= 10}
          >
            タグを追加
          </Button>
          <Box mt={2}>
            {genres.map((genre, index) => (
              <Chip
                key={index}
                label={genre}
                onDelete={() => handleRemoveGenre(genre)}
                sx={{ margin: '4px' }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  </Grid>
));

const RestrictWordCount = React.memo(({
  restrictWordCount,
  setRestrictWordCount,
  minWordCount,
  setMinWordCount,
  maxWordCount,
  setMaxWordCount
}) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={restrictWordCount}
            onChange={(e) => setRestrictWordCount(e.target.checked)}
          />
        }
        label="作品の文字数を制限する"
      />
      {restrictWordCount && (
        <Box mt={2}>
          <TextField
            label="最小文字数"
            variant="outlined"
            type="number"
            fullWidth
            value={minWordCount}
            onChange={(e) => setMinWordCount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="最大文字数"
            variant="outlined"
            type="number"
            fullWidth
            value={maxWordCount}
            onChange={(e) => setMaxWordCount(e.target.value)}
          />
        </Box>
      )}
    </Box>
  </Grid>
));

const AllowSeries = React.memo(({ allowSeries, setAllowSeries }) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={allowSeries}
            onChange={(e) => setAllowSeries(e.target.checked)}
          />
        }
        label="シリーズ作品を許可する"
      />
    </Box>
  </Grid>
));

const MinEntries = React.memo(({ minEntries, setMinEntries }) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <TextField
        label="最低投稿数"
        variant="outlined"
        type="number"
        fullWidth
        value={minEntries}
        onChange={(e) => setMinEntries(e.target.value)}
      />
    </Box>
  </Grid>
));

const MaxEntries = React.memo(({ maxEntries, setMaxEntries }) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <TextField
        label="最大投稿数"
        variant="outlined"
        type="number"
        fullWidth
        value={maxEntries}
        onChange={(e) => setMaxEntries(e.target.value)}
      />
    </Box>
  </Grid>
));

const ContestStatus =  React.memo(({ status, setStatus }) => (
  <Grid item xs={12}>
    <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
      コンテストステータス<Typography component="span" color="error"> ※</Typography>
    </Typography>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <TextField
        select
        label="ステータス"
        variant="outlined"
        fullWidth
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        SelectProps={{ native: true }}
      >
        <option value="開催予定">開催予定</option>
        <option value="募集中">募集中</option>
        <option value="募集終了">募集終了</option>
        <option value="募集一時停止中">募集一時停止中</option>
      </TextField>
    </Box>
  </Grid>
));

const PreviewButton = React.memo(({ handlePreview }) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        onClick={handlePreview}
        sx={{ mt: 2 }}
      >
        プレビュー
      </Button>
    </Box>
  </Grid>
));

const SubmitButton = React.memo(({ handleSubmit, loading }) => (
  <Grid item xs={12}>
    <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'コンテスト更新'}
      </Button>
    </Box>
  </Grid>
));

export default ContestEdit;
