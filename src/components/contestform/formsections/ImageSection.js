import React, { useState } from 'react';
import { 
  Grid, 
  Typography, 
  Button, 
  Box, 
  Paper,
  Tooltip,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Alert,
  Fade,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * 画像アップロードコンポーネント
 */
const ImageSection = React.memo(({ iconPreview, headerPreview, handleImageUpload }) => {
  const [dragActive, setDragActive] = useState({ icon: false, header: false });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState({ open: false, type: null });

  const handleDrag = (e, type, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: active }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fileType = file.type;
      
      // ファイル形式を検証
      if (fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/gif') {
        const event = { target: { files: e.dataTransfer.files } };
        handleImageUpload(event, type);
      } else {
        // 無効な形式の場合、アラートを表示
        alert('PNG、JPG、GIF形式の画像のみアップロードできます。');
      }
    }
  };

  // 削除ダイアログを表示
  const handleDeleteClick = (type) => {
    setDeleteDialogOpen({ open: true, type });
  };

  const handleConfirmDelete = () => {
    const type = deleteDialogOpen.type;
    setDeleteDialogOpen({ open: false, type: null });
    
    // 親コンポーネントの実装に合わせた削除処理
    if (type === 'icon') {
      // ローカルストレージからも削除
      localStorage.removeItem('iconPreview');
      localStorage.removeItem('iconImageName');
    } else if (type === 'header') {
      // ローカルストレージからも削除
      localStorage.removeItem('headerPreview');
      localStorage.removeItem('headerImageName');
    }
    
    // files[0]にアクセスしているエラーを防ぐ特殊なイベントオブジェクト
    const emptyEvent = {
      target: {
        files: null, // nullを設定することで親コンポーネント側で条件分岐できるようにする
        deleteAction: type // 削除する対象を明示的に渡す
      }
    };
    handleImageUpload(emptyEvent, type);
  };

  // 削除キャンセル
  const handleCancelDelete = () => {
    setDeleteDialogOpen({ open: false, type: null });
  };

  const getImageTypeInfo = (type) => {
    return type === 'icon' 
      ? {
          title: 'アイコン画像',
          tooltip: 'コンテスト一覧やプロフィールで表示される正方形の画像です。',
          maxSize: '2MB',
          recommendedSize: '400×400px',
          fit: 'contain'
        }
      : {
          title: 'ヘッダー画像',
          tooltip: 'コンテスト詳細ページの上部に表示される横長の画像です。',
          maxSize: '5MB',
          recommendedSize: '1200×400px',
          fit: 'cover'
        };
  };

  const renderImageUploader = (type, preview) => {
    const info = getImageTypeInfo(type);
    
    return (
      <Grid item xs={12} md={6}>
        <Card 
          elevation={0}
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
            }
          }}
        >
          <CardContent sx={{ flex: 1, p: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                {info.title}
              </Typography>
              <Chip 
                size="small" 
                label={info.recommendedSize}
                sx={{ ml: 1, height: 20, fontSize: '0.7rem', backgroundColor: 'rgba(0,0,0,0.04)' }} 
              />
              <Tooltip 
                title={info.tooltip} 
                arrow
                placement="top"
                enterTouchDelay={0}
                leaveTouchDelay={3000}
              >
                <IconButton size="small" sx={{ ml: 0.5 }}>
                  <HelpOutlineIcon fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
            </Box>
            
            {preview ? (
              <Box sx={{ 
                position: 'relative',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                height: 230,
              }}>
                <CardMedia
                  component="img"
                  image={preview}
                  alt={`${info.title}プレビュー`}
                  sx={{ 
                    height: '100%', 
                    objectFit: info.fit,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}
                />
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 1.5,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(type)}
                    sx={{ 
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    削除
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                onClick={() => document.getElementById(`${type}-upload-input`).click()}
                onDragEnter={(e) => handleDrag(e, type, true)}
                onDragLeave={(e) => handleDrag(e, type, false)}
                onDragOver={(e) => handleDrag(e, type, true)}
                onDrop={(e) => handleDrop(e, type)}
                sx={{
                  border: '2px dashed',
                  borderColor: dragActive[type] ? 'primary.main' : 'rgba(0,0,0,0.12)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  backgroundColor: dragActive[type] ? 'rgba(25, 118, 210, 0.04)' : 'rgba(0,0,0,0.01)',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  height: 230,
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    borderColor: 'primary.light'
                  }
                }}
              >
                <PhotoSizeSelectActualIcon sx={{ fontSize: 48, color: 'primary.light', mb: 2 }} />
                <Typography variant="body1" color="textPrimary" align="center" sx={{ fontWeight: 500, mb: 1 }}>
                  ドラッグ＆ドロップ
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
                  または
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ 
                    mt: 1,
                    borderRadius: '6px',
                    textTransform: 'none',
                    px: 2
                  }}
                >
                  ファイルを選択
                </Button>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="caption" color="textSecondary" align="center">
                    JPEG・PNG・GIF形式 (最大{info.maxSize})
                  </Typography>
                </Box>
              </Box>
            )}

            <input
              id={`${type}-upload-input`}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/gif"
              hidden
              onChange={(e) => {
                // ファイル形式を検証
                const file = e.target.files && e.target.files[0];
                if (file) {
                  const fileType = file.type;
                  if (fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/gif') {
                    handleImageUpload(e, type);
                  } else {
                    // 無効な形式の場合、アラートを表示
                    alert('PNG、JPG、GIF形式の画像のみアップロードできます。');
                  }
                }
              }}
            />
          </CardContent>
          
          <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
            <Button
              variant={preview ? "outlined" : "contained"}
              component="label"
              fullWidth
              startIcon={<AddPhotoAlternateIcon />}
              sx={{ 
                borderRadius: '8px',
                py: 1,
                textTransform: 'none',
                fontWeight: 600
              }}
              onClick={() => document.getElementById(`${type}-upload-input`).click()}
            >
              {preview ? '画像を変更する' : '画像をアップロードする'}
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <>
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h5" sx={{ 
          color: 'text.primary',
          fontWeight: 700,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-8px',
            left: 0,
            width: '60px',
            height: '4px',
            backgroundColor: theme => theme.palette.primary.main,
            borderRadius: '2px'
          }
        }}>
          コンテスト画像設定
        </Typography>
        <Tooltip title="魅力的な画像を設定してコンテストの注目度を高めましょう。" arrow>
          <IconButton size="small" sx={{ ml: 1 }}>
            <HelpOutlineIcon fontSize="small" color="action" />
          </IconButton>
        </Tooltip>
      </Box>

      <Alert 
        severity="info" 
        variant="outlined"
        icon={<InfoOutlinedIcon />}
        sx={{ 
          mb: 3,
          borderRadius: '10px',
          backgroundColor: 'rgba(25, 118, 210, 0.04)'
        }}
      >
        <Typography variant="body2">
          魅力的な画像を設定することで、コンテストの注目度が高まります。
          推奨サイズ：アイコン (400×400px)、ヘッダー (1200×400px)
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {renderImageUploader('icon', iconPreview)}
        {renderImageUploader('header', headerPreview)}
      </Grid>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen.open}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{ 
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            p: 1
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
          {deleteDialogOpen.type === 'icon' ? 'アイコン' : 'ヘッダー'}画像を削除しますか？
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            この操作は元に戻せません。本当に画像を削除してもよろしいですか？
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCancelDelete} 
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            キャンセル
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error" 
            autoFocus
            sx={{ borderRadius: '8px', fontWeight: 600 }}
          >
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default ImageSection;