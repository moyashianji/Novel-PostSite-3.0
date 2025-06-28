import React, { useCallback } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  FormControlLabel, 
  Checkbox, 
  TextField, 
  Button, 
  Chip,
  useTheme,
  Collapse,
  Paper,
  Divider,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import WorkIcon from '@mui/icons-material/Work';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CategoryIcon from '@mui/icons-material/Category';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FlagIcon from '@mui/icons-material/Flag';

// テーマ対応のスタイルコンポーネント
const SectionBox = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
    : '0 4px 20px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0, 0, 0, 0.4)'
      : '0 8px 30px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  }
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.default, 0.3)
    : alpha(theme.palette.primary.main, 0.02),
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.1)
      : alpha(theme.palette.primary.main, 0.05),
    transform: 'translateX(4px)',
  },
  '& .MuiFormControlLabel-label': {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.default, 0.5)
      : alpha(theme.palette.background.paper, 0.8),
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.6),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.8)
        : theme.palette.background.paper,
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
        boxShadow: theme.palette.mode === 'dark'
          ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
          : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
    },
  },
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.8,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: `1px solid ${theme.palette.primary.main}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-1px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
      : `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabled,
    color: theme.palette.action.disabledBackground,
    border: `1px solid ${theme.palette.action.disabled}`,
    transform: 'none',
    boxShadow: 'none',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '& .MuiChip-deleteIcon': {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.error.main,
      backgroundColor: alpha(theme.palette.error.main, 0.1),
      borderRadius: '50%',
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transform: 'translateY(-1px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
      : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
    '& .MuiChip-deleteIcon': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

const RequiredIndicator = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 600,
  marginLeft: theme.spacing(0.5),
}));

const CharacterCount = styled(Typography)(({ theme }) => ({
  display: 'block',
  textAlign: 'right',
  fontSize: '0.75rem',
  marginTop: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  transition: 'color 0.2s ease',
}));

const CollapsibleSection = styled(Collapse)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& .MuiCollapse-wrapper': {
    '& .MuiCollapse-wrapperInner': {
      paddingTop: theme.spacing(1),
    },
  },
}));

const WorkRestrictions = React.memo(({ 
  allowFinishedWorks, 
  setAllowFinishedWorks, 
  allowPreStartDate, 
  setAllowPreStartDate, 
  allowSeries, 
  setAllowSeries, 
  allowR18, 
  setAllowR18 
}) => {
  return (
    <Grid item xs={12}>
      <SectionBox elevation={0}>
        <SectionTitle variant="h6">
          <WorkIcon />
          作品制限設定
        </SectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <StyledFormControlLabel
              control={
                <StyledCheckbox 
                  checked={allowFinishedWorks} 
                  onChange={(e) => setAllowFinishedWorks(e.target.checked)} 
                />
              }
              label="完結済作品に限定する"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledFormControlLabel
              control={
                <StyledCheckbox 
                  checked={allowPreStartDate} 
                  onChange={(e) => setAllowPreStartDate(e.target.checked)} 
                />
              }
              label="応募開始日以前の作品を許可"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledFormControlLabel
              control={
                <StyledCheckbox 
                  checked={allowSeries} 
                  onChange={(e) => setAllowSeries(e.target.checked)} 
                />
              }
              label="シリーズ作品を許可する"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledFormControlLabel
              control={
                <StyledCheckbox 
                  checked={allowR18} 
                  onChange={(e) => setAllowR18(e.target.checked)} 
                />
              }
              label="R18作品を許可"
            />
          </Grid>
        </Grid>
      </SectionBox>
    </Grid>
  );
});

const AIRestrictions = React.memo(({ 
  restrictAI, 
  setRestrictAI, 
  aiTagInput, 
  setAiTagInput, 
  handleAddAiTag, 
  aiTags, 
  handleRemoveAiTag 
}) => {
  const theme = useTheme();
  
  const getCharacterCountColor = () => {
    const ratio = aiTagInput.length / 50;
    if (ratio >= 0.9) return theme.palette.error.main;
    if (ratio >= 0.7) return theme.palette.warning.main;
    return theme.palette.text.secondary;
  };

  return (
    <Grid item xs={12}>
      <SectionBox elevation={0}>
        <SectionTitle variant="h6">
          <SmartToyIcon />
          AI制限
        </SectionTitle>
        <StyledFormControlLabel
          control={
            <StyledCheckbox 
              checked={restrictAI} 
              onChange={(e) => setRestrictAI(e.target.checked)} 
            />
          }
          label="使用しているAIを制限する"
        />
        <CollapsibleSection in={restrictAI}>
          <Box>
            <StyledTextField
              label="AI名を入力"
              variant="outlined"
              fullWidth
              value={aiTagInput}
              onChange={(e) => setAiTagInput(e.target.value)}
              placeholder="例: ChatGPT, Claude, Gemini"
              inputProps={{ maxLength: 50 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="AIツール名を入力してください">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <CharacterCount sx={{ color: getCharacterCountColor() }}>
              {aiTagInput.length} / 50 文字
            </CharacterCount>
            <AddButton 
              onClick={handleAddAiTag} 
              variant="contained" 
              startIcon={<AddIcon />}
              disabled={!aiTagInput.trim() || aiTags.length >= 10}
            >
              AIタグを追加
            </AddButton>
            {aiTags.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  制限対象のAI ({aiTags.length}/10):
                </Typography>
                <Box>
                  {aiTags.map((tag, index) => (
                    <StyledChip 
                      key={index} 
                      label={tag} 
                      onDelete={() => handleRemoveAiTag(tag)}
                      deleteIcon={<DeleteIcon />}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </CollapsibleSection>
      </SectionBox>
    </Grid>
  );
});

const GenreRestrictions = React.memo(({ 
  restrictGenres, 
  setRestrictGenres, 
  genreInput, 
  setGenreInput, 
  handleAddGenre, 
  genres, 
  handleRemoveGenre 
}) => {
  const theme = useTheme();
  
  const getCharacterCountColor = () => {
    const ratio = genreInput.length / 50;
    if (ratio >= 0.9) return theme.palette.error.main;
    if (ratio >= 0.7) return theme.palette.warning.main;
    return theme.palette.text.secondary;
  };

  return (
    <Grid item xs={12}>
      <SectionBox elevation={0}>
        <SectionTitle variant="h6">
          <CategoryIcon />
          ジャンル制限
        </SectionTitle>
        <StyledFormControlLabel
          control={
            <StyledCheckbox 
              checked={restrictGenres} 
              onChange={(e) => setRestrictGenres(e.target.checked)} 
            />
          }
          label="ジャンルを制限する"
        />
        <CollapsibleSection in={restrictGenres}>
          <Box>
            <StyledTextField
              label="ジャンルを入力"
              variant="outlined"
              fullWidth
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              placeholder="例: ファンタジー, SF, ミステリー"
              inputProps={{ maxLength: 50 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="許可するジャンルを入力してください">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <CharacterCount sx={{ color: getCharacterCountColor() }}>
              {genreInput.length} / 50 文字
            </CharacterCount>
            <AddButton 
              onClick={handleAddGenre} 
              variant="contained" 
              startIcon={<AddIcon />}
              disabled={!genreInput.trim() || genres.length >= 10}
            >
              ジャンルを追加
            </AddButton>
            {genres.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  許可ジャンル ({genres.length}/10):
                </Typography>
                <Box>
                  {genres.map((genre, index) => (
                    <StyledChip 
                      key={index} 
                      label={genre} 
                      onDelete={() => handleRemoveGenre(genre)}
                      deleteIcon={<DeleteIcon />}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </CollapsibleSection>
      </SectionBox>
    </Grid>
  );
});

const WordCountRestrictions = React.memo(({ 
  restrictWordCount, 
  setRestrictWordCount, 
  minWordCount, 
  setMinWordCount, 
  maxWordCount, 
  setMaxWordCount 
}) => {
  return (
    <Grid item xs={12}>
      <SectionBox elevation={0}>
        <SectionTitle variant="h6">
          <FormatListNumberedIcon />
          文字数制限
        </SectionTitle>
        <StyledFormControlLabel
          control={
            <StyledCheckbox 
              checked={restrictWordCount} 
              onChange={(e) => setRestrictWordCount(e.target.checked)} 
            />
          }
          label="作品の文字数を制限する"
        />
        <CollapsibleSection in={restrictWordCount}>
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="最小文字数"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={minWordCount}
                  onChange={(e) => setMinWordCount(e.target.value)}
                  placeholder="例: 1000"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="最大文字数"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={maxWordCount}
                  onChange={(e) => setMaxWordCount(e.target.value)}
                  placeholder="例: 10000"
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </Box>
        </CollapsibleSection>
      </SectionBox>
    </Grid>
  );
});

const EntryRestrictions = React.memo(({ 
  minEntries, 
  setMinEntries, 
  maxEntries, 
  setMaxEntries 
}) => {
  return (
    <Grid item xs={12}>
      <SectionBox elevation={0}>
        <SectionTitle variant="h6">
          <AssignmentIcon />
          投稿数制限
        </SectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <StyledTextField
              label="最低投稿数"
              variant="outlined"
              type="number"
              fullWidth
              value={minEntries}
              onChange={(e) => setMinEntries(e.target.value)}
              placeholder="例: 1"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledTextField
              label="最大投稿数"
              variant="outlined"
              type="number"
              fullWidth
              value={maxEntries}
              onChange={(e) => setMaxEntries(e.target.value)}
              placeholder="例: 100"
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
      </SectionBox>
    </Grid>
  );
});

const ContestStatus = React.memo(({ status, setStatus }) => {
  return (
    <Grid item xs={12}>
      <SectionBox elevation={0}>
        <SectionTitle variant="h6">
          <FlagIcon />
          コンテストステータス
          <RequiredIndicator component="span">※必須</RequiredIndicator>
        </SectionTitle>
        <StyledTextField
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
        </StyledTextField>
      </SectionBox>
    </Grid>
  );
});

const OptionSection = ({
  allowFinishedWorks,
  setAllowFinishedWorks,
  allowPreStartDate,
  setAllowPreStartDate,
  allowSeries,
  setAllowSeries,
  allowR18,
  setAllowR18,
  restrictAI,
  setRestrictAI,
  aiTagInput,
  setAiTagInput,
  handleAddAiTag,
  aiTags,
  handleRemoveAiTag,
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
  minEntries,
  setMinEntries,
  maxEntries,
  setMaxEntries,
  status,
  setStatus
}) => {
  const memoizedSetAllowFinishedWorks = useCallback((value) => setAllowFinishedWorks(value), [setAllowFinishedWorks]);
  const memoizedSetAllowPreStartDate = useCallback((value) => setAllowPreStartDate(value), [setAllowPreStartDate]);
  const memoizedSetAllowSeries = useCallback((value) => setAllowSeries(value), [setAllowSeries]);
  const memoizedSetAllowR18 = useCallback((value) => setAllowR18(value), [setAllowR18]);
  const memoizedSetRestrictAI = useCallback((value) => setRestrictAI(value), [setRestrictAI]);
  const memoizedSetAiTagInput = useCallback((value) => setAiTagInput(value), [setAiTagInput]);
  const memoizedHandleAddAiTag = useCallback(() => handleAddAiTag(), [handleAddAiTag]);
  const memoizedHandleRemoveAiTag = useCallback((tag) => handleRemoveAiTag(tag), [handleRemoveAiTag]);
  const memoizedSetRestrictGenres = useCallback((value) => setRestrictGenres(value), [setRestrictGenres]);
  const memoizedSetGenreInput = useCallback((value) => setGenreInput(value), [setGenreInput]);
  const memoizedHandleAddGenre = useCallback(() => handleAddGenre(), [handleAddGenre]);
  const memoizedHandleRemoveGenre = useCallback((genre) => handleRemoveGenre(genre), [handleRemoveGenre]);
  const memoizedSetRestrictWordCount = useCallback((value) => setRestrictWordCount(value), [setRestrictWordCount]);
  const memoizedSetMinWordCount = useCallback((value) => setMinWordCount(value), [setMinWordCount]);
  const memoizedSetMaxWordCount = useCallback((value) => setMaxWordCount(value), [setMaxWordCount]);
  const memoizedSetMinEntries = useCallback((value) => setMinEntries(value), [setMinEntries]);
  const memoizedSetMaxEntries = useCallback((value) => setMaxEntries(value), [setMaxEntries]);
  const memoizedSetStatus = useCallback((value) => setStatus(value), [setStatus]);

  return (
    <>
      <WorkRestrictions
        allowFinishedWorks={allowFinishedWorks}
        setAllowFinishedWorks={memoizedSetAllowFinishedWorks}
        allowPreStartDate={allowPreStartDate}
        setAllowPreStartDate={memoizedSetAllowPreStartDate}
        allowSeries={allowSeries}
        setAllowSeries={memoizedSetAllowSeries}
        allowR18={allowR18}
        setAllowR18={memoizedSetAllowR18}
      />
      <AIRestrictions
        restrictAI={restrictAI}
        setRestrictAI={memoizedSetRestrictAI}
        aiTagInput={aiTagInput}
        setAiTagInput={memoizedSetAiTagInput}
        handleAddAiTag={memoizedHandleAddAiTag}
        aiTags={aiTags}
        handleRemoveAiTag={memoizedHandleRemoveAiTag}
      />
      <GenreRestrictions
        restrictGenres={restrictGenres}
        setRestrictGenres={memoizedSetRestrictGenres}
        genreInput={genreInput}
        setGenreInput={memoizedSetGenreInput}
        handleAddGenre={memoizedHandleAddGenre}
        genres={genres}
        handleRemoveGenre={memoizedHandleRemoveGenre}
      />
      <WordCountRestrictions
        restrictWordCount={restrictWordCount}
        setRestrictWordCount={memoizedSetRestrictWordCount}
        minWordCount={minWordCount}
        setMinWordCount={memoizedSetMinWordCount}
        maxWordCount={maxWordCount}
        setMaxWordCount={memoizedSetMaxWordCount}
      />
      <EntryRestrictions
        minEntries={minEntries}
        setMinEntries={memoizedSetMinEntries}
        maxEntries={maxEntries}
        setMaxEntries={memoizedSetMaxEntries}
      />
      <ContestStatus
        status={status}
        setStatus={memoizedSetStatus}
      />
    </>
  );
};

export default React.memo(OptionSection);