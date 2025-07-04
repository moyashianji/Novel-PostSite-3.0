import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  IconButton,
  Grid,
  Paper,
  Chip,
  useTheme,
  Fade,
  Backdrop,
  styled
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarTodayIcon,
  TextFields as TextFieldsIcon,
  CollectionsBookmark as CollectionsIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';

// スタイル付きコンポーネント
const ModalContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  maxHeight: '85vh',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ModalContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  overflowY: 'auto',
  flexGrow: 1,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.25),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  }
}));

const DetailedSortModal = ({ 
  open, 
  onClose, 
  onApply,
  initialFilters = {},
  contentType = 'posts' // 'posts' または 'series'
}) => {
  const theme = useTheme();
  
  // 日付を文字列形式に変換（input type="datetime-local"用）
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 文字列をDateオブジェクトに変換
  const parseInputDate = (dateString) => {
    return dateString ? new Date(dateString) : null;
  };
  
  // 作品用のフィルター状態
  const [worksFilters, setWorksFilters] = useState({
    minWordCount: '',
    maxWordCount: '',
    startDate: null,
    endDate: null,
  });

  // シリーズ用のフィルター状態
  const [seriesFilters, setSeriesFilters] = useState({
    minWorksCount: '',
    maxWorksCount: '',
    seriesStartDate: null,
    seriesEndDate: null,
  });

  // 初期値の設定
  useEffect(() => {
    if (open) {
      if (contentType === 'posts') {
        setWorksFilters({
          minWordCount: initialFilters.minWordCount || '',
          maxWordCount: initialFilters.maxWordCount || '',
          startDate: initialFilters.startDate || null,
          endDate: initialFilters.endDate || null,
        });
      } else {
        setSeriesFilters({
          minWorksCount: initialFilters.minWorksCount || '',
          maxWorksCount: initialFilters.maxWorksCount || '',
          seriesStartDate: initialFilters.seriesStartDate || null,
          seriesEndDate: initialFilters.seriesEndDate || null,
        });
      }
    }
  }, [open, initialFilters, contentType]);

  // フィルター値の変更処理（作品用）
  const handleWorksFilterChange = (field, value) => {
    setWorksFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // フィルター値の変更処理（シリーズ用）
  const handleSeriesFilterChange = (field, value) => {
    setSeriesFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // フィルターのクリア処理
  const handleClearFilters = () => {
    if (contentType === 'posts') {
      setWorksFilters({
        minWordCount: '',
        maxWordCount: '',
        startDate: null,
        endDate: null
      });
    } else {
      setSeriesFilters({
        minWorksCount: '',
        maxWorksCount: '',
        seriesStartDate: null,
        seriesEndDate: null
      });
    }
  };

  // フィルターの適用処理
  const handleApply = () => {
    if (contentType === 'posts') {
      // 作品の場合の検証
      const minWordCount = worksFilters.minWordCount ? parseInt(worksFilters.minWordCount) : null;
      const maxWordCount = worksFilters.maxWordCount ? parseInt(worksFilters.maxWordCount) : null;
      
      // 最小値が最大値より大きい場合はエラー
      if (minWordCount && maxWordCount && minWordCount > maxWordCount) {
        alert('文字数の下限は上限より小さく設定してください。');
        return;
      }

      // 開始日が終了日より遅い場合はエラー
      if (worksFilters.startDate && worksFilters.endDate && worksFilters.startDate > worksFilters.endDate) {
        alert('開始日は終了日より前に設定してください。');
        return;
      }

      const appliedFilters = {
        minWordCount,
        maxWordCount,
        startDate: worksFilters.startDate,
        endDate: worksFilters.endDate
      };

      onApply(appliedFilters);
    } else {
      // シリーズの場合の検証
      const minWorksCount = seriesFilters.minWorksCount ? parseInt(seriesFilters.minWorksCount) : null;
      const maxWorksCount = seriesFilters.maxWorksCount ? parseInt(seriesFilters.maxWorksCount) : null;
      
      // 最小値が最大値より大きい場合はエラー
      if (minWorksCount && maxWorksCount && minWorksCount > maxWorksCount) {
        alert('作品数の下限は上限より小さく設定してください。');
        return;
      }

      // 開始日が終了日より遅い場合はエラー
      if (seriesFilters.seriesStartDate && seriesFilters.seriesEndDate && seriesFilters.seriesStartDate > seriesFilters.seriesEndDate) {
        alert('開始日は終了日より前に設定してください。');
        return;
      }

      const appliedFilters = {
        minWorksCount,
        maxWorksCount,
        seriesStartDate: seriesFilters.seriesStartDate,
        seriesEndDate: seriesFilters.seriesEndDate
      };

      onApply(appliedFilters);
    }
    
    onClose();
  };

  // アクティブなフィルターの数を計算
  const getActiveFilterCount = () => {
    let count = 0;
    if (contentType === 'posts') {
      if (worksFilters.minWordCount) count++;
      if (worksFilters.maxWordCount) count++;
      if (worksFilters.startDate) count++;
      if (worksFilters.endDate) count++;
    } else {
      if (seriesFilters.minWorksCount) count++;
      if (seriesFilters.maxWorksCount) count++;
      if (seriesFilters.seriesStartDate) count++;
      if (seriesFilters.seriesEndDate) count++;
    }
    return count;
  };

  // アクティブなフィルターのチップを生成
  const getActiveFilterChips = () => {
    const chips = [];
    
    if (contentType === 'posts') {
      if (worksFilters.minWordCount) {
        chips.push(
          <FilterChip
            key="minWordCount"
            label={`文字数下限: ${worksFilters.minWordCount}文字`}
            onDelete={() => handleWorksFilterChange('minWordCount', '')}
          />
        );
      }
      
      if (worksFilters.maxWordCount) {
        chips.push(
          <FilterChip
            key="maxWordCount"
            label={`文字数上限: ${worksFilters.maxWordCount}文字`}
            onDelete={() => handleWorksFilterChange('maxWordCount', '')}
          />
        );
      }
      
      if (worksFilters.startDate) {
        chips.push(
          <FilterChip
            key="startDate"
            label={`投稿開始日: ${worksFilters.startDate.toLocaleDateString('ja-JP')}`}
            onDelete={() => handleWorksFilterChange('startDate', null)}
          />
        );
      }
      
      if (worksFilters.endDate) {
        chips.push(
          <FilterChip
            key="endDate"
            label={`投稿終了日: ${worksFilters.endDate.toLocaleDateString('ja-JP')}`}
            onDelete={() => handleWorksFilterChange('endDate', null)}
          />
        );
      }
    } else {
      if (seriesFilters.minWorksCount) {
        chips.push(
          <FilterChip
            key="minWorksCount"
            label={`作品数下限: ${seriesFilters.minWorksCount}作品`}
            onDelete={() => handleSeriesFilterChange('minWorksCount', '')}
          />
        );
      }
      
      if (seriesFilters.maxWorksCount) {
        chips.push(
          <FilterChip
            key="maxWorksCount"
            label={`作品数上限: ${seriesFilters.maxWorksCount}作品`}
            onDelete={() => handleSeriesFilterChange('maxWorksCount', '')}
          />
        );
      }
      
      if (seriesFilters.seriesStartDate) {
        chips.push(
          <FilterChip
            key="seriesStartDate"
            label={`シリーズ開始日: ${seriesFilters.seriesStartDate.toLocaleDateString('ja-JP')}`}
            onDelete={() => handleSeriesFilterChange('seriesStartDate', null)}
          />
        );
      }
      
      if (seriesFilters.seriesEndDate) {
        chips.push(
          <FilterChip
            key="seriesEndDate"
            label={`シリーズ終了日: ${seriesFilters.seriesEndDate.toLocaleDateString('ja-JP')}`}
            onDelete={() => handleSeriesFilterChange('seriesEndDate', null)}
          />
        );
      }
    }
    
    return chips;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <ModalContainer>
          <ModalHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon />
              <Typography variant="h6" fontWeight="bold">
                詳細フィルター
                {contentType === 'posts' ? (
                  <Chip 
                    label="作品" 
                    size="small" 
                    icon={<MenuBookIcon />}
                    sx={{ ml: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  />
                ) : (
                  <Chip 
                    label="シリーズ" 
                    size="small" 
                    icon={<CollectionsIcon />}
                    sx={{ ml: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  />
                )}
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
              <CloseIcon />
            </IconButton>
          </ModalHeader>

          <ModalContent>
            {contentType === 'posts' ? (
              // 作品用フィルター
              <>
                {/* 文字数フィルター */}
                <SectionTitle>
                  <TextFieldsIcon />
                  文字数フィルター
                </SectionTitle>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="下限（文字数）"
                      type="number"
                      fullWidth
                      value={worksFilters.minWordCount}
                      onChange={(e) => handleWorksFilterChange('minWordCount', e.target.value)}
                      placeholder="制限なし"
                      helperText="未指定の場合は制限なし"
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="上限（文字数）"
                      type="number"
                      fullWidth
                      value={worksFilters.maxWordCount}
                      onChange={(e) => handleWorksFilterChange('maxWordCount', e.target.value)}
                      placeholder="制限なし"
                      helperText="未指定の場合は制限なし"
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* 投稿日フィルター */}
                <SectionTitle>
                  <CalendarTodayIcon />
                  投稿日フィルター
                </SectionTitle>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="開始日"
                      type="datetime-local"
                      fullWidth
                      value={formatDateForInput(worksFilters.startDate)}
                      onChange={(e) => handleWorksFilterChange('startDate', parseInputDate(e.target.value))}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      helperText="未指定の場合は制限なし"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="終了日"
                      type="datetime-local"
                      fullWidth
                      value={formatDateForInput(worksFilters.endDate)}
                      onChange={(e) => handleWorksFilterChange('endDate', parseInputDate(e.target.value))}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      helperText="未指定の場合は制限なし"
                    />
                  </Grid>
                </Grid>
              </>
            ) : (
              // シリーズ用フィルター
              <>
                {/* 作品数フィルター */}
                <SectionTitle>
                  <CollectionsIcon />
                  含まれる作品数フィルター
                </SectionTitle>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="下限（作品数）"
                      type="number"
                      fullWidth
                      value={seriesFilters.minWorksCount}
                      onChange={(e) => handleSeriesFilterChange('minWorksCount', e.target.value)}
                      placeholder="制限なし"
                      helperText="未指定の場合は制限なし"
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="上限（作品数）"
                      type="number"
                      fullWidth
                      value={seriesFilters.maxWorksCount}
                      onChange={(e) => handleSeriesFilterChange('maxWorksCount', e.target.value)}
                      placeholder="制限なし"
                      helperText="未指定の場合は制限なし"
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* シリーズ作成日フィルター */}
                <SectionTitle>
                  <CalendarTodayIcon />
                  シリーズ作成日フィルター
                </SectionTitle>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="開始日"
                      type="datetime-local"
                      fullWidth
                      value={formatDateForInput(seriesFilters.seriesStartDate)}
                      onChange={(e) => handleSeriesFilterChange('seriesStartDate', parseInputDate(e.target.value))}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      helperText="未指定の場合は制限なし"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="終了日"
                      type="datetime-local"
                      fullWidth
                      value={formatDateForInput(seriesFilters.seriesEndDate)}
                      onChange={(e) => handleSeriesFilterChange('seriesEndDate', parseInputDate(e.target.value))}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      helperText="未指定の場合は制限なし"
                    />
                  </Grid>
                </Grid>
              </>
            )}

            {/* アクティブなフィルター表示 */}
            {getActiveFilterCount() > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <SectionTitle>
                  設定中のフィルター ({getActiveFilterCount()}件)
                </SectionTitle>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {getActiveFilterChips()}
                </Box>
              </>
            )}
          </ModalContent>

          {/* フッターボタン */}
          <Box sx={{ 
            p: 3, 
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between'
          }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={getActiveFilterCount() === 0}
            >
              クリア
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={onClose}
              >
                キャンセル
              </Button>
              <Button
                variant="contained"
                onClick={handleApply}
                startIcon={<FilterListIcon />}
              >
                フィルターを適用
              </Button>
            </Box>
          </Box>
        </ModalContainer>
      </Fade>
    </Modal>
  );
};

export default DetailedSortModal;