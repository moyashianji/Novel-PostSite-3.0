import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';

import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Modal,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Avatar,
    Divider,
    Paper,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material'; import DOMPurify from 'dompurify';

const ContestPreview = () => {
    const [contest, setContest] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // ✅ `sessionStorage` からデータを取得
        const storedData = sessionStorage.getItem('contestPreviewData');
        if (storedData) {
            setContest(JSON.parse(storedData));
        }
    }, []);

    if (!contest) {
        return <Typography variant="h6">プレビューするコンテスト情報がありません。</Typography>;
    }

    const formatDate = (date) => {
        if (!date) return '未設定';
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) return date;
        return parsedDate.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };
    const getStatusChip = (status) => {
        switch (status) {
            case '開催予定':
                return <Chip label="開催予定" color="info" />;
            case '募集中':
                return <Chip label="募集中" color="success" />;
            case '募集終了':
                return <Chip label="募集終了" color="error" />;
            case '募集一時停止中':
                return <Chip label="募集一時停止中" color="warning" />;
            default:
                return <Chip label="不明" color="default" />;
        }
    };
    const fixImagePaths = (html) => {
        return html.replace(/<img src="\/uploads\/(.*?)"/g, `<img src="http://localhost:5000/uploads/$1"`);
    };
    const renderStatusChip = (status) => (
        <Chip
            label={status ? '可' : '不可'}
            color={status ? 'success' : 'error'}
            sx={{ fontWeight: 'bold', marginLeft: 1 }}
        />
    );
    const handleTagClick = (tag) => {
        navigate(`/search?mustInclude=${encodeURIComponent(tag)}`);
    };
    return (
        <Grid container spacing={2} sx={{ maxWidth: '1400px', margin: '0 auto', paddingTop: 4 }}>

            {/* 左サイドバー（主催者情報） */}
            <Grid item xs={12} md={3}>
                <Box sx={{ top: 80 }}>
                    <Paper elevation={3} sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#fff' }}>
                        <Typography variant="h6" textAlign="center">主催者</Typography>
                        <RouterLink to={`/user/${contest.creator._id}`}>

                            <Avatar src={contest.creator.icon} alt={contest.creator.nickname} sx={{ width: 80, height: 80, mx: 'auto', mt: 2 }} />
                        </RouterLink>

                        <Typography variant="h6" textAlign="center">{contest.creator.nickname}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h4" fontWeight="bold" textAlign="center">{contest.entries.length}</Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">応募作品総数</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            {getStatusChip(contest.status)}
                        </Box>
                        {/* 応募ボタン（ステータスの下に表示） */}
                        <Box textAlign="center">
                            <Button variant="contained" color="primary" size="large">
                                応募する
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Grid>

            {/* 中央コンテンツ（コンテスト詳細） */}
            <Grid item xs={12} md={8} sx={{ paddingLeft: 2, paddingRight: 2 }}>
                <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 4 }}>

                    {/* ヘッダー画像 */}
                    {contest.headerImage && (
                        <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: '8px', marginBottom: 4 }}>
                            <img
                                src={contest.headerImage}
                                alt={contest.title}
                                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                            />
                        </Paper>
                    )}
                    {/* コンテスト概要 */}
                    <Typography variant="h5" gutterBottom>
                        コンテスト概要
                    </Typography>
                    <Paper
                        elevation={3}
                        sx={{
                            padding: 3,
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            wordBreak: 'break-word', // ✅ 長い単語は自動改行
                            overflowWrap: 'break-word', // ✅ テキストがはみ出さないように
                            maxWidth: '100%', // ✅ Paper の幅を超えないようにする
                            whiteSpace: 'normal', // ✅ 余計なスペースを削除
                        }}
                    >
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            {contest.title}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {/*contest.shortDescription*/}
                        </Typography>
                        {/* WYSIWYG のリッチテキストをそのまま表示 */}
                        <div
                            className="contest-description"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fixImagePaths(contest.description)) }}
                        />
                    </Paper>

                    {/* 画像サイズを調整するための CSS */}
                    <style>
                        {`
              .contest-description img {
                max-width: 100% !important; /* ✅ Paper の幅を超えない */
                height: auto !important; /* ✅ アスペクト比を維持して自動縮小 */
                display: block !important; /* ✅ インライン要素の余白を削除 */
                margin: 10px auto !important; /* ✅ 画像を中央揃え */
              }
            `}
                    </style>
                    {/* 応募ボタン */}
                    <Box textAlign="center" mt={4}>
                        <Button variant="contained" color="primary" size="large">
                            応募する
                        </Button>
                    </Box>

                    {/* 応募条件 */}
                    <Box mt={4}>
                        <Typography variant="h5" gutterBottom>
                            応募条件（詳しくはコンテスト概要を読んでください）
                        </Typography>
                        <Paper elevation={3} sx={{ padding: 3, borderRadius: '8px', backgroundColor: '#fff' }}>
                            <List>
                                <ListItem>
                                    <ListItemText primary="応募可能な作品のステータス" />

                                </ListItem>
                                <ListItem>
                                    <Chip
                                        label={contest.allowFinishedWorks ? '完結済作品のみ応募可能' : '未完結作品も応募可能'}
                                        color={contest.allowFinishedWorks ? 'success' : 'warning'}
                                        sx={{ fontWeight: 'bold', marginLeft: 1 }}
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="コンテスト開催前に投稿された作品の応募" />

                                </ListItem>
                                <ListItem>
                                    {renderStatusChip(contest.allowPreStartDate)}

                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="R18作品" />
                                </ListItem>
                                <ListItem>
                                    {renderStatusChip(contest.allowR18)}

                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="シリーズ作品の応募について" />
                                </ListItem>
                                <ListItem>
                                    {renderStatusChip(contest.allowSeries)}

                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="ジャンル制限" />
                                </ListItem>
                                <ListItem>
                                    <Box>

                                        {contest.restrictGenres && contest.genres.length > 0 ? (
                                            contest.genres.map((tag, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tag}
                                                    sx={{ marginRight: 0.5, marginBottom: 0.5 }}
                                                    onClick={() => handleTagClick(tag)}
                                                />
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">なし</Typography>
                                        )}
                                    </Box>
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="AI使用制限" />
                                </ListItem>
                                <ListItem>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {contest.restrictAI && contest.aiTags.length > 0 ? (
                                            contest.aiTags.map((tag, index) => (
                                                <Chip
                                                    key={index}
                                                    label={tag}
                                                    sx={{ marginRight: 0.5, marginBottom: 0.5 }}
                                                    onClick={() => handleTagClick(tag)}
                                                />
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">なし</Typography>
                                        )}
                                    </Box>
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="文字数制限（最低～最大）" />
                                </ListItem>
                                <ListItem>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        <Typography variant="h6" fontWeight="bold" color="primary">
                                            {contest.minWordCount}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            ～
                                        </Typography>
                                        <Typography variant="h6" fontWeight="bold" color="primary">
                                            {contest.maxWordCount > 0 ? contest.maxWordCount : '制限なし'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            文字
                                        </Typography>
                                    </Box>
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="コンテストの実施に必要な最低応募総数" />
                                </ListItem>
                                <ListItem>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        <Typography variant="h6" fontWeight="bold" color="primary">
                                            {contest.minEntries > 0 ? contest.minEntries : '制限なし'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            作品
                                        </Typography>
                                    </Box>
                                </ListItem>
                            </List>
                        </Paper>
                    </Box>

                    {/* 日程情報 */}
                    <Box mt={4}>
                        <Typography variant="h5" gutterBottom>
                            日程情報
                        </Typography>
                        <Paper elevation={3} sx={{ padding: 3, borderRadius: '8px', backgroundColor: '#fff' }}>
                            <List>
                                <ListItem>
                                    <ListItemText primary="応募期間" secondary={`${formatDate(contest.applicationStartDate)} - ${formatDate(contest.applicationEndDate)}`} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="審査期間" secondary={`${formatDate(contest.reviewStartDate)} - ${formatDate(contest.reviewEndDate)}`} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary="結果発表日" secondary={formatDate(contest.resultAnnouncementDate)} />
                                </ListItem>
                            </List>
                        </Paper>
                    </Box>
                    {/* 審査員情報 */}
                    {contest.enableJudges && contest.judges.length > 0 && (
                        <Box mt={4}>
                            <Typography variant="h5" gutterBottom>
                                審査員
                            </Typography>
                            <Grid container spacing={2}>
                                {contest.judges.map((judge, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={judge.userId._id}> {/* ✅ `judge._id` を `key` に使用 */}
                                        <Card elevation={3} sx={{ borderRadius: '8px' }}>
                                            <CardContent sx={{ textAlign: 'center' }}>
                                                <RouterLink to={`/user/${judge.userId._id}`}>
                                                    <Avatar
                                                        src={judge.userId.icon} // ✅ `judge.userId.icon` を直接使用
                                                        alt={judge.userId.nickname} // ✅ `judge.userId.nickname` を直接使用
                                                        sx={{ width: 80, height: 80, marginBottom: 2, margin: '0 auto' }}
                                                    />
                                                </RouterLink>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {judge.userId.nickname || '不明なユーザー'}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                    )}
                    {/* 応募作品一覧 */}
                    <Box mt={4}>
                        <Typography variant="h5" gutterBottom>応募作品一覧</Typography>
                        {contest.entries.length > 0 ? (
                            <Grid container spacing={2}>
                                {contest.entries.map((entry, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Paper elevation={3} sx={{ padding: 2, borderRadius: '8px', backgroundColor: '#fff' }}>
                                            <Typography>{entry.post ? entry.post.title : "応募作品なし"}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography variant="body1">まだ応募作品がありません。</Typography>
                        )}
                    </Box>
                    {/* 閉じるボタン */}
                    <Box textAlign="center" mt={4}>
                        <Button variant="contained" color="secondary" onClick={() => window.close()}>
                            閉じる
                        </Button>
                    </Box>
                </Box>

            </Grid>

        </Grid>
    );
};

export default ContestPreview;
