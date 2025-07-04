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
  TextFields as TextFieldsIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';

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
  initialFilters = {} 
}) => {
  const theme = useTheme();
  
  // フィルター状態
  const [filters, setFilters] = useState({
    minWordCount: '',
    maxWordCount: '',
    startDate: null,
    endDate: null,
    ...initialFilters
  });

  // 初期値の設定
  useEffect(() => {
    if (open) {
      setFilters({
        minWordCount: initialFilters.minWordCount || '',
        maxWordCount: initialFilters.maxWordCount || '',
        startDate: initialFilters.startDate || null,
        endDate: initialFilters.endDate || null,
      });
    }
  }, [open, initialFilters]);

  // フィルター値の変更処理
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // フィルターのクリア処理
  const handleClearFilters = () => {
    setFilters({
      minWordCount: '',
      maxWordCount: '',
      startDate: null,
      endDate: null
    });
  };

  // フィルターの適用処理
  const handleApply = () => {
    // 数値の検証
    const minWordCount = filters.minWordCount ? parseInt(filters.minWordCount) : null;
    const maxWordCount = filters.maxWordCount ? parseInt(filters.maxWordCount) : null;
    
    // 最小値が最大値より大きい場合はエラー
    if (minWordCount && maxWordCount && minWordCount > maxWordCount) {
      alert('文字数の下限は上限より小さく設定してください。');
      return;
    }

    // 開始日が終了日より遅い場合はエラー
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      alert('開始日は終了日より前に設定してください。');
      return;
    }

    const appliedFilters = {
      minWordCount,
      maxWordCount,
      startDate: filters.startDate,
      endDate: filters.endDate
    };

    onApply(appliedFilters);
    onClose();
  };

  // アクティブなフィルターの数を計算
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.minWordCount) count++;
    if (filters.maxWordCount) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  };

  // アクティブなフィルターのチップを生成
  const getActiveFilterChips = () => {
    const chips = [];
    
    if (filters.minWordCount) {
      chips.push(
        <FilterChip
          key="minWordCount"
          label={`文字数下限: ${filters.minWordCount}文字`}
          onDelete={() => handleFilterChange('minWordCount', '')}
        />
      );
    }
    
    if (filters.maxWordCount) {
      chips.push(
        <FilterChip
          key="maxWordCount"
          label={`文字数上限: ${filters.maxWordCount}文字`}
          onDelete={() => handleFilterChange('maxWordCount', '')}
        />
      );
    }
    
    if (filters.startDate) {
      chips.push(
        <FilterChip
          key="startDate"
          label={`開始日: ${filters.startDate.toLocaleDateString('ja-JP')}`}
          onDelete={() => handleFilterChange('startDate', null)}
        />
      );
    }
    
    if (filters.endDate) {
      chips.push(
        <FilterChip
          key="endDate"
          label={`終了日: ${filters.endDate.toLocaleDateString('ja-JP')}`}
          onDelete={() => handleFilterChange('endDate', null)}
        />
      );
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
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
              <CloseIcon />
            </IconButton>
          </ModalHeader>

          <ModalContent>
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
                  value={filters.minWordCount}
                  onChange={(e) => handleFilterChange('minWordCount', e.target.value)}
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
                  value={filters.maxWordCount}
                  onChange={(e) => handleFilterChange('maxWordCount', e.target.value)}
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
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <DatePicker
                    label="開始日"
                    value={filters.startDate}
                    onChange={(newValue) => handleFilterChange('startDate', newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: '未指定の場合は制限なし'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="終了日"
                    value={filters.endDate}
                    onChange={(newValue) => handleFilterChange('endDate', newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: '未指定の場合は制限なし'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>

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