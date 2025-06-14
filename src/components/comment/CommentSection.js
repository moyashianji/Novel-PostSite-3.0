import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Modal, 
  InputAdornment,
  Paper,
  Divider,
  Chip,
  Fade,
  Zoom,
  Slide,
  Collapse,
  Badge,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// 通報モーダル
const ReportModal = memo(({ open, onClose, onSubmit, commentInfo }) => {
  const [reportText, setReportText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [reportReason, setReportReason] = useState('');
  const theme = useTheme();
  
  const reportReasons = [
    'スパム',
    '不適切なコンテンツ',
    '嫌がらせ/いじめ',
    '違法な内容',
    'その他'
  ];

  useEffect(() => {
    if (open) {
      setReportText('');
      setCharCount(0);
      setReportReason('');
    }
  }, [open]);

  const handleSubmit = () => {
    if ((reportReason === 'その他' && reportText.trim() === '') || reportReason === '') {
      return;
    }
    
    const reportData = {
      reason: reportReason,
      details: reportText,
      commentId: commentInfo?.commentId,
      replyId: commentInfo?.replyId
    };
    
    onSubmit(reportData);
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose}
      closeAfterTransition
    >
      <Fade in={open}>
        <Paper 
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            outline: 'none'
          }}
          elevation={5}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FlagIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6">
              コメントを通報
            </Typography>
            <IconButton 
              size="small" 
              onClick={onClose}
              sx={{ ml: 'auto' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            通報理由を選択してください
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {reportReasons.map((reason) => (
              <Chip
                key={reason}
                label={reason}
                onClick={() => setReportReason(reason)}
                color={reportReason === reason ? "primary" : "default"}
                variant={reportReason === reason ? "filled" : "outlined"}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
          
          <Collapse in={reportReason === 'その他'}>
            <TextField
              label="詳細な通報理由"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={reportText}
              onChange={(e) => {
                setReportText(e.target.value);
                setCharCount(e.target.value.length);
              }}
              inputProps={{ maxLength: 100 }}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="textSecondary">
              {charCount}/100
            </Typography>
          </Collapse>
          
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Button 
              variant="outlined" 
              onClick={onClose}
              startIcon={<CloseIcon />}
            >
              キャンセル
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleSubmit}
              disabled={
                (reportReason === 'その他' && reportText.trim() === '') || 
                reportReason === ''
              }
              startIcon={<FlagIcon />}
            >
              通報する
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
});

// コメント入力コンポーネント
const CommentInput = memo(({ newComment, setNewComment, charCount, setCharCount, handleCommentSubmit, isSubmitting }) => {
  const theme = useTheme();
  const inputRef = useRef(null);

  return (
    <Box sx={{ mb: 3 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:focus-within': {
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
          }
        }}
      >
        <TextField
          inputRef={inputRef}
          label="コメントを入力"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            setCharCount(e.target.value.length);
          }}
          inputProps={{ maxLength: 300 }}
          sx={{ 
            mb: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: alpha(theme.palette.primary.main, 0.2),
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
            }
          }}
          disabled={isSubmitting}
          placeholder="作品について感想を共有しましょう..."
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={handleCommentSubmit} 
                  color="primary"
                  disabled={newComment.trim() === '' || isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : <SendIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color={charCount >= 270 ? "error" : "textSecondary"}>
            {charCount}/300
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            endIcon={<SendIcon />}
            onClick={handleCommentSubmit}
            disabled={newComment.trim() === '' || isSubmitting}
            size="small"
          >
            {isSubmitting ? '送信中...' : 'コメントを投稿'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
});

// 返信入力コンポーネント
const ReplyInput = memo(({ replyText, setReplyText, handleReplySubmit, commentId, onCancel, isSubmitting }) => {
  const theme = useTheme();
  const replyInputRef = useRef(null);
  
  useEffect(() => {
    // コンポーネントがマウントされたらフォーカスを当てる
    if (replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, []);

  return (
    <Slide direction="down" in={true} mountOnEnter unmountOnExit>
      <Box sx={{ ml: { xs: 1, sm: 4 }, mt: 2 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            borderRadius: 2,
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.05)
          }}
        >
          <TextField
            inputRef={replyInputRef}
            label="返信を入力"
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            inputProps={{ maxLength: 300 }}
            sx={{ mb: 1 }}
            disabled={isSubmitting}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => handleReplySubmit(commentId)} 
                    color="primary"
                    disabled={replyText.trim() === '' || isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color={replyText.length >= 270 ? "error" : "textSecondary"}>
              {replyText.length}/300
            </Typography>
            <Box>
              <Button 
                variant="text" 
                onClick={onCancel}
                size="small"
                sx={{ mr: 1 }}
                startIcon={<CloseIcon />}
              >
                キャンセル
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={() => handleReplySubmit(commentId)}
                disabled={replyText.trim() === '' || isSubmitting}
                endIcon={<SendIcon />}
              >
                返信する
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Slide>
  );
});

// 個別の返信コンポーネント
const Reply = memo(({ comment, reply, handleMenuOpen, currentUserId }) => {
  const theme = useTheme();
  const isAuthor = currentUserId === reply.author._id;
  
  // 作成日時をフォーマット
  const formattedDate = new Date(reply.createdAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Zoom in={true} style={{ transitionDelay: '100ms' }}>
      <Card 
        key={`${comment._id}-${reply._id}`} 
        sx={{ 
          mt: 2, 
          borderRadius: 2, 
          boxShadow: 2,
          borderLeft: isAuthor ? `3px solid ${theme.palette.primary.main}` : 'none'
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              {reply.author.icon ? (
                <Avatar 
                  src={reply.author.icon} 
                  alt={reply.author.nickname || '匿名ユーザー'} 
                  sx={{ 
                    marginRight: 1,
                    border: isAuthor ? `2px solid ${theme.palette.primary.main}` : 'none'
                  }} 
                />
              ) : (
                <Avatar sx={{ marginRight: 1, bgcolor: theme.palette.secondary.main }}>
                  <PersonIcon />
                </Avatar>
              )}
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {reply.author.nickname || '匿名ユーザー'}
                  {isAuthor && (
                    <Chip 
                      label="自分" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                    />
                  )}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {formattedDate}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              size="small" 
              onClick={(event) => handleMenuOpen(event, comment, reply)}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1, 
              pt: 1,
              pb: 1,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              color: theme.palette.text.primary
            }}
          >
            {reply.text}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );
});

// 個別のコメントコンポーネント
const Comment = memo(({
  comment,
  handleMenuOpen,
  handleReplyClick,
  replyTarget,
  replyText,
  setReplyText,
  handleReplySubmit,
  cancelReply,
  currentUserId,
  isSubmittingReply
}) => {
  const theme = useTheme();
  const [showReplies, setShowReplies] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isAuthor = currentUserId === comment.author._id;
  
  // コメントがフォーカスされているかどうか
  const isReplying = replyTarget?._id === comment._id;
  
  // コメントが新しく追加された場合のアニメーション
  const isNew = Date.now() - new Date(comment.createdAt).getTime() < 30000; // 30秒以内
  
  // 作成日時をフォーマット
  const formattedDate = new Date(comment.createdAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  useEffect(() => {
    // 返信が1つ以上ある場合、初期状態で返信を表示する
    if (hasReplies && comment.replies.length <= 3) {
      setShowReplies(true);
    }
  }, [hasReplies, comment.replies]);
  
  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ mt: 3, mb: 3 }}>
        <Card 
          sx={{ 
            borderRadius: 2, 
            boxShadow: 3,
            transition: 'all 0.2s',
            borderLeft: isAuthor ? `4px solid ${theme.palette.primary.main}` : 'none',
            animation: isNew ? `pulse 2s ${theme.transitions.easing.easeInOut}` : 'none',
            '@keyframes pulse': {
              '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}` },
              '70%': { boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0)}` },
              '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}` }
            }
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                {comment.author.icon ? (
                  <Avatar 
                    src={comment.author.icon} 
                    alt={comment.author.nickname || '匿名ユーザー'} 
                    sx={{ 
                      marginRight: 1,
                      border: isAuthor ? `2px solid ${theme.palette.primary.main}` : 'none',
                      width: 40,
                      height: 40
                    }} 
                  />
                ) : (
                  <Avatar sx={{ marginRight: 1, bgcolor: theme.palette.secondary.main, width: 40, height: 40 }}>
                    <PersonIcon />
                  </Avatar>
                )}
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {comment.author.nickname || '匿名ユーザー'}
                    {isAuthor && (
                      <Chip 
                        label="自分" 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                      />
                    )}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formattedDate}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={(event) => handleMenuOpen(event, comment)}>
                <MoreVertIcon />
              </IconButton>
            </Box>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mt: 2, 
                pt: 1,
                pb: 1,
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
            >
              {comment.text}
            </Typography>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Button
                variant="text"
                color="primary"
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => handleReplyClick(comment)}
                sx={{ 
                  borderRadius: 4,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                返信
              </Button>
              
              {hasReplies && (
                <Button
                  variant="text"
                  color="inherit"
                  size="small"
                  onClick={toggleReplies}
                  endIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ 
                    borderRadius: 4,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.grey[500], 0.1)
                    }
                  }}
                >
                  <Badge 
                    badgeContent={comment.replies.length} 
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <ChatBubbleOutlineIcon fontSize="small" />
                  </Badge>
                  {showReplies ? '返信を隠す' : '返信を表示'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
        
        {isReplying && (
          <ReplyInput
            replyText={replyText}
            setReplyText={setReplyText}
            handleReplySubmit={handleReplySubmit}
            commentId={comment._id}
            onCancel={cancelReply}
            isSubmitting={isSubmittingReply}
          />
        )}
        
        {hasReplies && (
          <Collapse in={showReplies}>
            <Box sx={{ ml: { xs: 2, sm: 4 }, mt: 1, pl: { xs: 1, sm: 2 }, borderLeft: `2px solid ${theme.palette.divider}` }}>
              {comment.replies.map((reply) => (
                <Reply
                  key={`${comment._id}-${reply._id}`}
                  comment={comment}
                  reply={reply}
                  handleMenuOpen={handleMenuOpen}
                  currentUserId={currentUserId}
                />
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    </Fade>
  );
});

// コメントメニュー
const CommentMenu = memo(({
  anchorEl,
  handleMenuClose,
  handleDeleteComment,
  setReportInfo,
  selectedComment,
  selectedReplyComment,
  userId
}) => {
  const theme = useTheme();
  const isCommentOwner = selectedComment && selectedComment.author._id === userId;
  const isReplyOwner = selectedReplyComment && selectedReplyComment.author._id === userId;
  
  // 通報ハンドラー
  const handleReportClick = () => {
    // 通報対象の情報を設定
    const reportInfo = {
      commentId: selectedComment?._id,
      replyId: selectedReplyComment?._id,
      text: selectedReplyComment?.text || selectedComment?.text,
      author: selectedReplyComment?.author || selectedComment?.author
    };
    
    setReportInfo(reportInfo);
    handleMenuClose();
  };

  return (
    <Menu 
      anchorEl={anchorEl} 
      open={Boolean(anchorEl)} 
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          minWidth: 180
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {(isCommentOwner || isReplyOwner) && (
        <MenuItem 
          onClick={() => {
            handleDeleteComment();
            handleMenuClose();
          }}
          sx={{ 
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1)
            }
          }}
        >
          <Box display="flex" alignItems="center">
            <CloseIcon fontSize="small" sx={{ mr: 1 }} />
            {selectedReplyComment ? '返信を削除' : 'コメントを削除'}
          </Box>
        </MenuItem>
      )}
      
      <MenuItem onClick={handleReportClick}>
        <Box display="flex" alignItems="center">
          <FlagIcon fontSize="small" sx={{ mr: 1 }} />
          通報する
        </Box>
      </MenuItem>
    </Menu>
  );
});

// メインのコメントセクションコンポーネント
const CommentSection = ({ postId, allowComments = true }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedReplyComment, setSelectedReplyComment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const commentsRef = useRef(null);

  
  // スナックバーを表示する関数
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // スナックバーを閉じる関数
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ユーザー情報の取得
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/me`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.log('ユーザーはログインしていません');
        return;
      }
      
      const data = await response.json();
      setUserId(data._id);
    } catch (error) {
      console.error('ユーザー情報の取得に失敗しました:', error);
    }
  }, []);

  // コメントの取得
  const fetchComments = useCallback(async (page = 1, reset = false) => {
    if (!allowComments) return; // allowCommentsがfalseの場合は取得しない
    
    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('コメントの取得に失敗しました');
      }
      
      const data = await response.json();
      
      if (reset) {
        setComments(data.comments);
      } else {
        setComments(prevComments => [...prevComments, ...data.comments]);
      }
      
      setTotalComments(data.totalComments);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('コメントの取得に失敗しました:', error);
      showSnackbar('コメントの読み込みに失敗しました', 'error');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [postId, allowComments]);

  // さらに表示ボタンのハンドラー
  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages && !loading) {
      fetchComments(currentPage + 1);
    }
  }, [currentPage, totalPages, loading, fetchComments]);

  // コメント送信ハンドラー
  const handleCommentSubmit = useCallback(async () => {
    if (newComment.trim() === '' || isSubmittingComment) {
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: newComment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          showSnackbar('コメントするにはログインが必要です', 'warning');
          return;
        }
        throw new Error(errorData.message || 'コメントの追加に失敗しました');
      }

      setNewComment('');
      setCharCount(0);
      showSnackbar('コメントを投稿しました！', 'success');
      
      // コメントリストを最新の状態に更新
      fetchComments(1, true);
    } catch (error) {
      console.error('コメントの追加に失敗しました:', error);
      showSnackbar(error.message || 'コメントの追加に失敗しました', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  }, [postId, newComment, fetchComments]);

  // 返信送信ハンドラー
  const handleReplySubmit = useCallback(async (parentCommentId) => {
    if (replyText.trim() === '' || isSubmittingReply) {
      return;
    }

    setIsSubmittingReply(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${parentCommentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: replyText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          showSnackbar('返信するにはログインが必要です', 'warning');
          return;
        }
        throw new Error(errorData.message || '返信の追加に失敗しました');
      }

      setReplyText('');
      setReplyTarget(null);
      showSnackbar('返信を投稿しました！', 'success');
      
      // コメントリストを最新の状態に更新
      fetchComments(1, true);
    } catch (error) {
      console.error('返信の追加に失敗しました:', error);
      showSnackbar(error.message || '返信の追加に失敗しました', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  }, [postId, replyText, fetchComments]);

  // メニュー開くハンドラー
  const handleMenuOpen = useCallback((event, comment, replyComment = null) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
    setSelectedReplyComment(replyComment);
  }, []);

  // メニュー閉じるハンドラー
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedComment(null);
    setSelectedReplyComment(null);
  }, []);

  // コメント/返信削除ハンドラー
  const handleDeleteComment = useCallback(async () => {
    const isReply = Boolean(selectedReplyComment);
    const commentId = selectedComment._id;
    const replyId = selectedReplyComment?._id;

    try {
      let url = `/api/posts/${postId}/comments/${commentId}`;
      
      // 返信を削除する場合、クエリパラメータとして送信
      if (isReply && replyId) {
        url += `?replyId=${replyId}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      if (isReply) {
        // 返信を削除した場合、コメントリスト内の該当する返信のみを削除
        setComments(comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply._id !== replyId)
            };
          }
          return comment;
        }));
        showSnackbar('返信を削除しました', 'success');
      } else {
        // コメント全体を削除した場合
        setComments(comments.filter(comment => comment._id !== commentId));
        showSnackbar('コメントを削除しました', 'success');
      }
    } catch (error) {
      console.error('削除中にエラーが発生しました:', error);
      showSnackbar('削除に失敗しました', 'error');
    }
  }, [postId, selectedComment, selectedReplyComment, comments]);

  // 返信モード切り替えハンドラー
  const handleReplyClick = useCallback((comment) => {
    setReplyTarget(comment);
    setReplyText('');
  }, []);

  // 返信キャンセルハンドラー
  const cancelReply = useCallback(() => {
    setReplyTarget(null);
    setReplyText('');
  }, []);

  // 通報送信ハンドラー
  const handleReportSubmit = useCallback((reportData) => {
    // 実際のAPIエンドポイントと連携する
    console.log('通報データ:', reportData);
    
    // 通報API呼び出しのプレースホルダー
    // 実際の実装では、APIと連携してください
    setTimeout(() => {
      setReportOpen(false);
      showSnackbar('通報を受け付けました', 'info');
    }, 500);
  }, []);

  // 通報モーダルを開く
  const handleOpenReportModal = useCallback((info) => {
    setReportInfo(info);
    setReportOpen(true);
  }, []);

  // 初期データの読み込み
  useEffect(() => {
    fetchUserInfo();
    if (allowComments) {
      fetchComments(1, true);
    }
  }, [fetchUserInfo, fetchComments, allowComments]);

  // ★★★ ここに早期リターンを配置（全てのHooksの後） ★★★
  if (!allowComments) {
    return (
      <Box sx={{ mt: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" gutterBottom>
            コメント
          </Typography>
        </Box>
        
        <Paper
          elevation={1}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            border: `1px dashed ${theme.palette.divider}`
          }}
        >
          <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            コメントが無効になっています
          </Typography>
          <Typography variant="body2" color="textSecondary">
            作者によってこの作品のコメント機能が無効化されています。
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }} ref={commentsRef}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* タイトルとコメント数 */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h6" gutterBottom>
          コメント
          {totalComments > 0 && (
            <Chip 
              label={totalComments} 
              color="primary" 
              size="small" 
              sx={{ ml: 1 }} 
            />
          )}
        </Typography>
        
        {totalComments > 0 && (
          <Typography variant="body2" color="textSecondary">
            {totalComments}件のコメント
          </Typography>
        )}
      </Box>
      
      {/* コメント入力エリア */}
      <CommentInput
        newComment={newComment}
        setNewComment={setNewComment}
        charCount={charCount}
        setCharCount={setCharCount}
        handleCommentSubmit={handleCommentSubmit}
        isSubmitting={isSubmittingComment}
      />
      
      {/* 初期ローディング */}
      {initialLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            コメントを読み込み中...
          </Typography>
        </Box>
      ) : (
        <>
          {/* コメントがない場合 */}
          {comments.length === 0 ? (
            <Paper
              elevation={1}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                border: `1px dashed ${theme.palette.divider}`
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                まだコメントはありません
              </Typography>
              <Typography variant="body2" color="textSecondary">
                この作品について感想を共有しましょう。
              </Typography>
            </Paper>
          ) : (
            /* コメントリスト */
            <Box>
              {comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  handleMenuOpen={handleMenuOpen}
                  handleReplyClick={handleReplyClick}
                  replyTarget={replyTarget}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  handleReplySubmit={handleReplySubmit}
                  cancelReply={cancelReply}
                  currentUserId={userId}
                  isSubmittingReply={isSubmittingReply}
                />
              ))}
              
              {/* さらに表示ボタン */}
              {currentPage < totalPages && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleLoadMore} 
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <ExpandMoreIcon />}
                    sx={{ 
                      px: 4, 
                      py: 1, 
                      borderRadius: 5,
                      boxShadow: 1
                    }}
                  >
                    {loading ? '読み込み中...' : 'さらに表示'}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </>
      )}
      
      {/* コメントメニュー */}
      <CommentMenu
        anchorEl={anchorEl}
        handleMenuClose={handleMenuClose}
        handleDeleteComment={handleDeleteComment}
        setReportInfo={handleOpenReportModal}
        selectedComment={selectedComment}
        selectedReplyComment={selectedReplyComment}
        userId={userId}
      />
      
      {/* 通報モーダル */}
      <ReportModal 
        open={reportOpen} 
        onClose={() => setReportOpen(false)} 
        onSubmit={handleReportSubmit}
        commentInfo={reportInfo} 
      />
    </Box>
  );
};
export default CommentSection;