// EditProfile.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { styled } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import TwitterIcon from '@mui/icons-material/Twitter';
import PixivIcon from '@mui/icons-material/Pix';
import LinkIcon from '@mui/icons-material/Link';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import CakeIcon from '@mui/icons-material/Cake';

const ModalBox = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  maxHeight: '85vh',
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  boxShadow: theme.shadows[10],
  padding: 0,
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ModalContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const AvatarUpload = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 120,
  height: 120,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  borderRadius: '50%',
  border: `2px dashed ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const UploadOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  '&:hover': {
    opacity: 1,
  },
}));

const TagsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  minHeight: theme.spacing(3),
}));

const BirthdayContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const BirthdaySelectsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  
  gap: theme.spacing(2),
  marginTop: theme.spacing(1),
}));

const EditProfile = ({ user, onProfileUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState(user.nickname);
  const [icon, setIcon] = useState(null);
  const [preview, setPreview] = useState(`${user.icon}` || '');
  const [description, setDescription] = useState(user.description || '');
  const [xLink, setXLink] = useState(user.xLink || '');
  const [pixivLink, setPixivLink] = useState(user.pixivLink || '');
  const [otherLink, setOtherLink] = useState(user.otherLink || '');
  const [charCount, setCharCount] = useState(description.length);
  const [errorMessages, setErrorMessages] = useState({});
  const [formValid, setFormValid] = useState(true);
  const [favoriteAuthors, setFavoriteAuthors] = useState(user.favoriteAuthors || []);
  const [newAuthor, setNewAuthor] = useState('');
  const [authorError, setAuthorError] = useState('');
  
  // 誕生日関連の状態
  const [birthDay, setBirthDay] = useState(1);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthYear, setBirthYear] = useState(2000);

  // 現在の日付を取得して年の範囲を設定
  const currentYear = new Date().getFullYear();
  
  // ユーザーの誕生日を初期化
  useEffect(() => {
    if (user.dob) {
      const dobDate = new Date(user.dob);
      setBirthYear(dobDate.getFullYear());
      setBirthMonth(dobDate.getMonth() + 1); // JavaScriptでは月は0から始まるため +1
      setBirthDay(dobDate.getDate());
    }
  }, [user.dob]);

  useEffect(() => {
    validateForm();
  }, [nickname, xLink, pixivLink, otherLink]);

  const handleOpen = () => {
    // Reset form to current user data
    setNickname(user.nickname);
    setDescription(user.description || '');
    setXLink(user.xLink || '');
    setPixivLink(user.pixivLink || '');
    setOtherLink(user.otherLink || '');
    setFavoriteAuthors(user.favoriteAuthors || []);

    // 誕生日情報のリセット
    if (user.dob) {
      const dobDate = new Date(user.dob);
      setBirthYear(dobDate.getFullYear());
      setBirthMonth(dobDate.getMonth() + 1);
      setBirthDay(dobDate.getDate());
    }

    setIcon(null);
    setPreview(`${user.icon}` || '');
    setErrorMessages({});
    setFormValid(true);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  
  const validateAuthor = (author) => {
    if (!author.trim()) {
      setAuthorError('作家名を入力してください');
      return false;
    }
    
    if (author.length > 50) {
      setAuthorError('作家名は50文字以内で入力してください');
      return false;
    }
    
    if (favoriteAuthors.includes(author)) {
      setAuthorError('同じ作家名は追加できません');
      return false;
    }
    
    setAuthorError('');
    return true;
  };
  
  const handleAddAuthor = () => {
    if (favoriteAuthors.length >= 20) {
      setAuthorError('好きな作家は最大20人まで追加できます');
      return;
    }
    
    if (validateAuthor(newAuthor)) {
      setFavoriteAuthors([...favoriteAuthors, newAuthor.trim()]);
      setNewAuthor('');
    }
  };

  const handleRemoveAuthor = (authorToRemove) => {
    setFavoriteAuthors(favoriteAuthors.filter(author => author !== authorToRemove));
  };

  const handleAuthorKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAuthor();
    }
  };
  
  const validateForm = () => {
    const nicknameError = !nickname.trim() ? 'ニックネームが必要です' : '';
    const xLinkError = xLink ? validateLink(xLink) : '';
    const pixivLinkError = pixivLink ? validateLink(pixivLink) : '';
    const otherLinkError = otherLink ? validateLink(otherLink) : '';

    const errors = {
      nickname: nicknameError,
      xLink: xLinkError,
      pixivLink: pixivLinkError,
      otherLink: otherLinkError,
    };

    setErrorMessages(errors);
    const isValid = !Object.values(errors).some((error) => error !== '');
    setFormValid(isValid);
    return isValid;
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessages((prev) => ({ ...prev, general: 'ファイルサイズは2MB以下にしてください' }));
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrorMessages((prev) => ({ ...prev, general: '無効なファイル形式です。jpeg, png, gifのみ許可されています' }));
        return;
      }

      setIcon(file);
      setErrorMessages((prev) => ({ ...prev, general: '' }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!nickname.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('nickname', nickname.trim());
    if (icon) formData.append('icon', icon);
    formData.append('description', description);
    formData.append('xLink', xLink);
    formData.append('pixivLink', pixivLink);
    formData.append('otherLink', otherLink);
    formData.append('favoriteAuthors', JSON.stringify(favoriteAuthors));
    
    // 誕生日データをISOString形式で追加
    const birthdate = new Date(birthYear, birthMonth - 1, birthDay);
    formData.append('dob', birthdate.toISOString());

    try {
      const response = await fetch(`/api/users/${user._id}/update`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onProfileUpdate(updatedUser);
        handleClose();
      } else {
        const data = await response.json();
        setErrorMessages({ general: data.message || 'プロフィールの更新に失敗しました' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessages({ general: '通信エラーが発生しました。後でもう一度お試しください。' });
    } finally {
      setLoading(false);
    }
  };

  const validateLink = (link) => {
    const urlPattern = /^https?:\/\/.*/;

    if (!urlPattern.test(link)) {
      return 'http://またはhttps://で始まる正しいリンクを入力してください';
    }
    if (link.length > 300) {
      return 'リンクは300文字以内で入力してください';
    }
    return '';
  };

  const handleLinkChange = (setLink, value, linkType) => {
    setLink(value);
    const errorMessage = value ? validateLink(value) : '';
    setErrorMessages((prev) => ({ ...prev, [linkType]: errorMessage }));
  };

  const handleInputChange = (setInput, value, inputType) => {
    setInput(value);
    if (inputType === 'nickname' && !value.trim()) {
      setErrorMessages((prev) => ({ ...prev, [inputType]: 'ニックネームが必要です' }));
    } else {
      setErrorMessages((prev) => ({ ...prev, [inputType]: '' }));
    }
  };

  const getLinkIcon = (linkType) => {
    switch (linkType) {
      case 'xLink':
        return <TwitterIcon fontSize="small" />;
      case 'pixivLink':
        return <PixivIcon fontSize="small" />;
      case 'otherLink':
        return <LinkIcon fontSize="small" />;
      default:
        return <LinkIcon fontSize="small" />;
    }
  };

  const getLinkLabel = (linkType) => {
    switch (linkType) {
      case 'xLink':
        return 'X (Twitter)';
      case 'pixivLink':
        return 'Pixiv';
      case 'otherLink':
        return 'その他のリンク';
      default:
        return '外部リンク';
    }
  };

  // 月ごとの日数を生成
  const getDaysInMonth = (month, year) => {
    // 月は0から始まるため -1
    return new Date(year, month, 0).getDate();
  };

  // 年の選択肢を生成
  const generateYearOptions = () => {
    const years = [];
    for (let y = currentYear - 100; y <= currentYear; y++) {
      years.push(y);
    }
    return years.reverse();
  };

  // 日の選択肢を生成（月と年に応じて変化）
  const daysInSelectedMonth = getDaysInMonth(birthMonth, birthYear);

  return (
    <div>
      <Button 
        variant="contained" 
        onClick={handleOpen}
        sx={{
          borderRadius: 20,
          px: 3,
          boxShadow: 2,
          '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
          transition: 'all 0.2s'
        }}
      >
        プロフィール編集
      </Button>
      
      <Modal open={open} onClose={handleClose}>
        <ModalBox>
          <ModalHeader>
            <Typography variant="h6" fontWeight="bold">プロフィールを編集</Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </ModalHeader>
          
          <ModalContent>
            {errorMessages.general && (
              <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                {errorMessages.general}
              </Typography>
            )}
            
            <input
              accept="image/png, image/jpeg, image/gif"
              id="icon-input"
              type="file"
              style={{ display: 'none' }}
              onChange={handleIconChange}
            />
            <label htmlFor="icon-input">
              <AvatarUpload>
                <Avatar
                  src={preview}
                  alt="Icon preview"
                  sx={{ width: '100%', height: '100%' }}
                />
                <UploadOverlay>
                  <AddAPhotoIcon sx={{ color: 'white', fontSize: 32 }} />
                </UploadOverlay>
              </AvatarUpload>
            </label>
            
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mb: 3 }}>
              画像容量は2MB以内で、対応形式はPNG/JPG/GIFです
            </Typography>
            
            <TextField
              label="ニックネーム"
              variant="outlined"
              fullWidth
              margin="normal"
              value={nickname}
              onChange={(e) => handleInputChange(setNickname, e.target.value, 'nickname')}
              helperText={errorMessages.nickname}
              error={!!errorMessages.nickname}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            
            {/* 誕生日の設定フォーム */}
            <BirthdayContainer>
              <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <CakeIcon sx={{ mr: 1, fontSize: 20 }} />
                誕生日
              </Typography>
              
              <BirthdaySelectsContainer>
                {/* 年の選択 */}
                <FormControl sx={{ flex: 2 }}>
                  <InputLabel id="birth-year-label">年</InputLabel>
                  <Select
                    labelId="birth-year-label"
                    value={birthYear}
                    label="年"
                    onChange={(e) => setBirthYear(e.target.value)}
                    MenuProps={{ 
                      PaperProps: { 
                        style: { maxHeight: 300 } 
                      } 
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    {generateYearOptions().map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 月の選択 */}
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel id="birth-month-label">月</InputLabel>
                  <Select
                    labelId="birth-month-label"
                    value={birthMonth}
                    label="月"
                    onChange={(e) => {
                      setBirthMonth(e.target.value);
                      // 日が月の最大値を超える場合は調整
                      const newDaysInMonth = getDaysInMonth(e.target.value, birthYear);
                      if (birthDay > newDaysInMonth) {
                        setBirthDay(newDaysInMonth);
                      }
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 日の選択 */}
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel id="birth-day-label">日</InputLabel>
                  <Select
                    labelId="birth-day-label"
                    value={birthDay}
                    label="日"
                    onChange={(e) => setBirthDay(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {Array.from({ length: daysInSelectedMonth }).map((_, i) => (
                      <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </BirthdaySelectsContainer>
            </BirthdayContainer>
            
            <TextField
              label="自己紹介"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={description}
              onChange={(e) => {
                handleInputChange(setDescription, e.target.value, 'description');
                setCharCount(e.target.value.length);
              }}
              inputProps={{ maxLength: 300 }}
              InputProps={{ sx: { borderRadius: 2 } }}
              helperText={`${charCount}/300`}
            />
            
            <Box mt={3}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>好きな作家</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  variant="outlined"
                  fullWidth
                  size="small"
                  placeholder="作家名を入力"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  onKeyPress={handleAuthorKeyPress}
                  error={!!authorError}
                  helperText={authorError}
                  disabled={favoriteAuthors.length >= 20}
                  sx={{ mr: 1 }}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddAuthor}
                  disabled={!newAuthor.trim() || favoriteAuthors.length >= 20}
                  startIcon={<PersonAddIcon />}
                  sx={{ borderRadius: 2, height: 40 }}
                >
                  追加
                </Button>
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1, mb: 1 }}>
                {favoriteAuthors.length}/20
              </Typography>
              
              <TagsContainer>
                {favoriteAuthors.map((author, index) => (
                  <Chip
                    key={index}
                    label={author}
                    onDelete={() => handleRemoveAuthor(author)}
                    color="primary"
                    variant="outlined"
                    deleteIcon={<DeleteIcon />}
                    sx={{ borderRadius: '16px' }}
                  />
                ))}
              </TagsContainer>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle2" sx={{ mb: 2 }}>外部リンク</Typography>
            
            {['xLink', 'pixivLink', 'otherLink'].map((linkType) => (
              <TextField
                key={linkType}
                label={getLinkLabel(linkType)}
                variant="outlined"
                fullWidth
                margin="normal"
                value={linkType === 'xLink' ? xLink : linkType === 'pixivLink' ? pixivLink : otherLink}
                onChange={(e) => handleLinkChange(
                  linkType === 'xLink' ? setXLink : linkType === 'pixivLink' ? setPixivLink : setOtherLink,
                  e.target.value,
                  linkType
                )}
                helperText={errorMessages[linkType] || 'http://またはhttps://で始まるリンクを入力してください'}
                error={!!errorMessages[linkType]}
                InputProps={{
                  startAdornment: getLinkIcon(linkType),
                  sx: { borderRadius: 2 }
                }}
              />
            ))}
            
            <Box mt={4} display="flex" justifyContent="space-between" gap={2}>
              <Button
                variant="outlined"
                onClick={handleClose}
                fullWidth
                sx={{ borderRadius: 2, py: 1.2 }}
              >
                キャンセル
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={!formValid || loading}
                fullWidth
                sx={{ borderRadius: 2, py: 1.2 }}
              >
                {loading ? <CircularProgress size={24} /> : '保存する'}
              </Button>
            </Box>
          </ModalContent>
        </ModalBox>
      </Modal>
    </div>
  );
};

export default EditProfile;