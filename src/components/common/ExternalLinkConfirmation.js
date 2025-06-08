// src/components/common/ExternalLinkConfirmation.js
import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Link,
  IconButton
} from '@mui/material';
import { Warning as WarningIcon, Close as CloseIcon } from '@mui/icons-material';

const ExternalLinkConfirmation = ({ open, handleClose, url }) => {
  const handleProceed = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: 'warning.light',
        color: 'warning.contrastText',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            外部サイトに移動します
          </Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={handleClose} 
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body1" paragraph>
          以下のリンク先は、当サイトの管理下にないサイトです。
        </Typography>
        <Typography variant="body1" paragraph>
          外部サイトのコンテンツやプライバシーポリシーについて、当サイトは責任を負いません。
        </Typography>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'action.hover', 
          borderRadius: 1,
          wordBreak: 'break-all'
        }}>
          <Link href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => {
            e.preventDefault();
            handleProceed();
          }}>
            {url}
          </Link>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          variant="outlined" 
          onClick={handleClose}
          sx={{ borderRadius: 2 }}
        >
          キャンセル
        </Button>
        <Button 
          variant="contained" 
          onClick={handleProceed}
          color="primary"
          sx={{ borderRadius: 2 }}
        >
          リンク先に移動する
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExternalLinkConfirmation;