import React, { useCallback } from 'react';
import { Grid, Typography, Box, FormControlLabel, Checkbox, TextField, Button, Chip } from '@mui/material';

const WorkRestrictions = React.memo(({ allowFinishedWorks, setAllowFinishedWorks, allowPreStartDate, setAllowPreStartDate, allowSeries, setAllowSeries, allowR18, setAllowR18 }) => {
  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
        作品制限設定
      </Typography>
      <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Checkbox checked={allowFinishedWorks} onChange={(e) => setAllowFinishedWorks(e.target.checked)} />}
              label="完結済作品に限定する"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Checkbox checked={allowPreStartDate} onChange={(e) => setAllowPreStartDate(e.target.checked)} />}
              label="応募開始日以前の作品を許可"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Checkbox checked={allowSeries} onChange={(e) => setAllowSeries(e.target.checked)} />}
              label="シリーズ作品を許可する"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Checkbox checked={allowR18} onChange={(e) => setAllowR18(e.target.checked)} />}
              label="R18作品を許可"
            />
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
});

const AIRestrictions = React.memo(({ restrictAI, setRestrictAI, aiTagInput, setAiTagInput, handleAddAiTag, aiTags, handleRemoveAiTag }) => {
  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
        AI制限
      </Typography>
      <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
        <FormControlLabel
          control={<Checkbox checked={restrictAI} onChange={(e) => setRestrictAI(e.target.checked)} />}
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
            <Button onClick={handleAddAiTag} variant="outlined" sx={{ mt: 1 }} disabled={!aiTagInput || aiTags.length >= 10}>
              タグを追加
            </Button>
            <Box mt={2}>
              {aiTags.map((tag, index) => (
                <Chip key={index} label={tag} onDelete={() => handleRemoveAiTag(tag)} sx={{ margin: '4px' }} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Grid>
  );
});

const GenreRestrictions = React.memo(({ restrictGenres, setRestrictGenres, genreInput, setGenreInput, handleAddGenre, genres, handleRemoveGenre }) => {
  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
        ジャンル制限
      </Typography>
      <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
        <FormControlLabel
          control={<Checkbox checked={restrictGenres} onChange={(e) => setRestrictGenres(e.target.checked)} />}
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
            <Button onClick={handleAddGenre} variant="outlined" sx={{ mt: 1 }} disabled={!genreInput || genres.length >= 10}>
              タグを追加
            </Button>
            <Box mt={2}>
              {genres.map((genre, index) => (
                <Chip key={index} label={genre} onDelete={() => handleRemoveGenre(genre)} sx={{ margin: '4px' }} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Grid>
  );
});

const WordCountRestrictions = React.memo(({ restrictWordCount, setRestrictWordCount, minWordCount, setMinWordCount, maxWordCount, setMaxWordCount }) => {
  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
        文字数制限
      </Typography>
      <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
        <FormControlLabel
          control={<Checkbox checked={restrictWordCount} onChange={(e) => setRestrictWordCount(e.target.checked)} />}
          label="作品の文字数を制限する"
        />
        {restrictWordCount && (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="最小文字数"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={minWordCount}
                  onChange={(e) => setMinWordCount(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="最大文字数"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={maxWordCount}
                  onChange={(e) => setMaxWordCount(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Grid>
  );
});

const EntryRestrictions = React.memo(({ minEntries, setMinEntries, maxEntries, setMaxEntries }) => {
  return (
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ mb: 1, color: '#555' }}>
        投稿数制限
      </Typography>
      <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="最低投稿数"
              variant="outlined"
              type="number"
              fullWidth
              value={minEntries}
              onChange={(e) => setMinEntries(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="最大投稿数"
              variant="outlined"
              type="number"
              fullWidth
              value={maxEntries}
              onChange={(e) => setMaxEntries(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
});

const ContestStatus = React.memo(({ status, setStatus }) => {
  return (
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
