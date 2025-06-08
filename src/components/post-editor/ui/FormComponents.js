import React, { memo, useCallback } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  IconButton, 
  Tooltip,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { LabelWithIcon, FormSectionLabel } from './StyledComponents';

// InfoIcon付きのTooltipをメモ化したコンポーネントとして定義
export const InfoTooltip = memo(({ title }) => (
  <Tooltip title={title} arrow>
    <IconButton size="small" color="primary" sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
      <InfoIcon fontSize="small" />
    </IconButton>
  </Tooltip>
));

// 共通のフォームフィールドをメモ化
export const LabeledTextField = memo(({ 
  label, 
  value, 
  onChange, 
  required, 
  maxLength, 
  rows, 
  multiline, 
  placeholder, 
  tooltip, 
  startIcon, 
  type = 'text', 
  disabled = false, 
  onKeyPress,
  helperText,
  error
}) => {
  // 入力ハンドラをメモ化
  const handleChange = useCallback((e) => {
    if (typeof onChange === 'function') {
      onChange(e.target.value);
    }
  }, [onChange]);

  // KeyPress handler
  const handleKeyPress = useCallback((e) => {
    if (onKeyPress && e.key === 'Enter') {
      onKeyPress();
    }
  }, [onKeyPress]);

  return (
    <Box sx={{ mb: 1 }}>
      <LabelWithIcon>
        <FormSectionLabel variant="body2">
          {label} {required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
        </FormSectionLabel>
        {tooltip && <InfoTooltip title={tooltip} />}
      </LabelWithIcon>
      
      <TextField
        variant="outlined"
        fullWidth
        value={value || ''}  // Ensure value is never undefined
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        inputProps={{ maxLength }}
        required={required}
        multiline={multiline}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        error={error}
        helperText={helperText}
        InputProps={{
          startAdornment: startIcon ? (
            <InputAdornment position="start">
              {startIcon}
            </InputAdornment>
          ) : null,
          sx: { borderRadius: 1.5 }
        }}
        size="small"
      />
    </Box>
  );
});

// メモ化したラジオグループコンポーネント
export const RadioButtonGroup = memo(({ legend, value, onChange, options, tooltip, color = 'primary' }) => (
  <Box sx={{ mb: 2 }}>
    <LabelWithIcon>
      <FormSectionLabel variant="body2">
        {legend}
      </FormSectionLabel>
      {tooltip && <InfoTooltip title={tooltip} />}
    </LabelWithIcon>
    
    <RadioGroup
      row
      value={value}
      onChange={onChange}
      sx={{ mt: 0.5 }}
    >
      {options.map(option => (
        <FormControlLabel 
          key={option.value} 
          value={option.value} 
          control={<Radio color={color} />} 
          label={option.label}
          sx={{ 
            mr: 3,
            '& .MuiFormControlLabel-label': {
              fontSize: '0.9rem'
            }
          }}
        />
      ))}
    </RadioGroup>
  </Box>
));
