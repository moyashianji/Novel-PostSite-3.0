// src/components/user/UserCard.js
import React, { useState, useRef } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Avatar,
    Chip,
    Button,
    Tooltip,
    Grid,
    Divider,
    IconButton,
    alpha,
    Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';

import PostCard from '../post/PostCard';

const UserCard = ({
    user,
    onUserClick,
    isFollowing = false,
    onFollowToggle,
    showFollowButton = true,
    showWorks = false
}) => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(true);

    // 説明文を省略する関数
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };

    // recentWorksが存在するかチェック
    const hasRecentWorks = user && user.recentWorks && Array.isArray(user.recentWorks) && user.recentWorks.length > 0;

    // フォロー/フォロー解除ボタンクリック時の処理
    const handleFollowAction = (e) => {
        e.stopPropagation();
        if (onFollowToggle) {
            onFollowToggle(user._id, !isFollowing);
        }
    };

    // ユーザーカードクリック時の処理
    const handleCardClick = () => {
        if (onUserClick) {
            onUserClick(user._id);
        } else {
            navigate(`/user/${user._id}`);
        }
    };

    // 作品リストをスクロールする処理
    const handleScroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300; // スクロール量
            const container = scrollRef.current;

            if (direction === 'left') {
                container.scrollLeft -= scrollAmount;
            } else {
                container.scrollLeft += scrollAmount;
            }

            // スクロールボタンの表示状態を更新
            setTimeout(() => {
                setShowLeftScroll(container.scrollLeft > 0);
                setShowRightScroll(container.scrollLeft < (container.scrollWidth - container.clientWidth - 10));
            }, 100);
        }
    };

    // スクロールイベントハンドラー
    const handleScrollEvent = () => {
        const container = scrollRef.current;
        if (container) {
            setShowLeftScroll(container.scrollLeft > 0);
            setShowRightScroll(container.scrollLeft < (container.scrollWidth - container.clientWidth - 10));
        }
    };

    // バッジがある場合（AI活用やオリジナル作品）
    const renderBadges = () => {
        const badges = [];

        // AIユーザー
        if (user && user.aiUsagePercent > 50) {
            badges.push(
                <Tooltip key="ai" title="AIを活用している作家">
                    <Chip
                        icon={<SmartToyIcon />}
                        label="AI創作"
                        size="small"
                        sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.main', mr: 1 }}
                    />
                </Tooltip>
            );
        }

        // オリジナル作家
        if (user && user.originalContentPercent > 50) {
            badges.push(
                <Tooltip key="original" title="オリジナル作品が多い">
                    <Chip
                        icon={<LocalLibraryIcon />}
                        label="オリジナル"
                        size="small"
                        sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', color: 'success.main', mr: 1 }}
                    />
                </Tooltip>
            );
        }

        return badges.length > 0 ? (
            <Box mt={1} display="flex" alignItems="center">
                {badges}
            </Box>
        ) : null;
    };

    // ユーザーがnullまたはundefinedの場合のフォールバック
    if (!user) {
        return null;
    }

    return (
        <Card
            elevation={1}
            sx={{
                marginBottom: 2,
                width: '100%',
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                    '& .arrow-icon': {
                        opacity: 1,
                        transform: 'translateX(0)',
                    }
                }
            }}
            onClick={handleCardClick}
        >
            {/* 矢印アイコン（ホバー時に表示） */}
            <ArrowForwardIosIcon
                className="arrow-icon"
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%) translateX(10px)',
                    opacity: 0,
                    transition: 'all 0.3s ease',
                    color: 'primary.main',
                    fontSize: 18,
                    zIndex: 5
                }}
            />

            <CardContent sx={{ p: 0 }}>
                <Grid container>
                    {/* 左側 - アバター */}
                    <Grid item xs={12} sm={4} md={3} sx={{ p: 2 }}>
                        <Box sx={{ position: 'relative', textAlign: 'center' }}>
                            <Avatar
                                src={user.icon}
                                alt={user.nickname}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    border: '3px solid white',
                                    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                                    margin: '0 auto'
                                }}
                            />
                            {/* オンラインステータス（ある場合） */}
                            {user.isOnline && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 5,
                                        right: '50%',
                                        marginRight: '-40px',
                                        width: 12,
                                        height: 12,
                                        backgroundColor: '#4caf50',
                                        borderRadius: '50%',
                                        border: '2px solid white',
                                    }}
                                />
                            )}
                            <Typography variant="subtitle1" fontWeight="bold" mt={1}>
                                {user.nickname}
                            </Typography>

                            {/* フォローボタン */}
                            {showFollowButton && (
                                <Button
                                    variant={isFollowing ? "outlined" : "contained"}
                                    color={isFollowing ? "error" : "primary"}
                                    size="small"
                                    onClick={handleFollowAction}
                                    startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                                    sx={{
                                        borderRadius: 6,
                                        mt: 1,
                                        fontSize: '0.75rem',
                                        px: 1.5
                                    }}
                                >
                                    {isFollowing ? 'フォロー解除' : 'フォローする'}
                                </Button>
                            )}
                        </Box>
                    </Grid>

                    {/* 右側 - ユーザー情報 */}
                    <Grid item xs={12} sm={8} md={9} sx={{
                        p: 2,
                        pl: { xs: 2, sm: 0 },
                        bgcolor: 'rgba(0,0,0,0.01)'
                    }}>
                        <Box>
                            {/* バッジ表示 */}
                            {renderBadges()}

                            {/* 説明文 */}
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1.5,
                                    mt: 1,
                                    minHeight: 60
                                }}
                            >
                                {truncateText(user.description, 150)}
                            </Typography>

                            {/* ユーザー統計情報 */}
                            <Box mt={2}>
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Box display="flex" alignItems="center">
                                                <PersonIcon sx={{ color: 'primary.main', mr: 0.5, fontSize: 18 }} />
                                                <Typography variant="h6" fontWeight="bold">
                                                    {user.followerCount || 0}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">フォロワー</Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={4}>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Box display="flex" alignItems="center">
                                                <AutoStoriesIcon sx={{ color: 'primary.main', mr: 0.5, fontSize: 18 }} />
                                                <Typography variant="h6" fontWeight="bold">
                                                    {user.postCount || 0}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">作品数</Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={4}>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Box display="flex" alignItems="center">
                                                <CollectionsBookmarkIcon sx={{ color: 'primary.main', mr: 0.5, fontSize: 18 }} />
                                                <Typography variant="h6" fontWeight="bold">
                                                    {user.seriesCount || 0}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">シリーズ数</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                {/* 作品一覧（横スクロール） */}
                {showWorks && hasRecentWorks && (
                    <>
                        <Divider />
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Typography variant="subtitle1" fontWeight="medium">最近の作品</Typography>
                                <Button
                                    variant="text"
                                    size="small"
                                    endIcon={<ArrowForwardIosIcon fontSize="small" />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/user/${user._id}`);
                                    }}
                                    sx={{ textTransform: 'none' }}
                                >
                                    すべての作品を見る
                                </Button>
                            </Box>

                            {/* 横スクロールコンテナ */}
                            <Box sx={{ position: 'relative' }}>
                                {/* 左スクロールボタン */}
                                {showLeftScroll && (
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            left: -16,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 1,
                                            backgroundColor: 'background.paper',
                                            boxShadow: '0 0 6px rgba(0,0,0,0.1)',
                                            '&:hover': { backgroundColor: 'background.paper' }
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleScroll('left');
                                        }}
                                    >
                                        <ArrowBackIosNewIcon fontSize="small" />
                                    </IconButton>
                                )}

                                {/* 横スクロール可能な作品一覧 */}
                                <Box
                                    ref={scrollRef}
                                    onScroll={handleScrollEvent}
                                    sx={{
                                        display: 'flex',
                                        overflowX: 'auto',
                                        gap: 2,
                                        py: 1,
                                        px: 0.5,
                                        pb: 2,
                                        scrollBehavior: 'smooth',
                                        msOverflowStyle: 'none', // IE/Edge
                                        scrollbarWidth: 'none', // Firefox
                                        '&::-webkit-scrollbar': { // Chrome/Safari/Opera
                                            display: 'none'
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()} // カード外へのイベントバブリングを防止
                                >
                                    {user.recentWorks.map((post, index) => (
                                        <Box
                                            key={post._id || index}
                                            sx={{
                                                minWidth: 280,
                                                maxWidth: 280,
                                                '&:hover': {
                                                    transform: 'none' // PostCardのホバー効果を打ち消し
                                                }
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/novel/${post._id}`);
                                            }}
                                        >
                                            <PostCard post={post} />
                                        </Box>
                                    ))}
                                </Box>

                                {/* 右スクロールボタン */}
                                {showRightScroll && (
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            right: -16,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 1,
                                            backgroundColor: 'background.paper',
                                            boxShadow: '0 0 6px rgba(0,0,0,0.1)',
                                            '&:hover': { backgroundColor: 'background.paper' }
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleScroll('right');
                                        }}
                                    >
                                        <ArrowForwardIosIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default React.memo(UserCard);