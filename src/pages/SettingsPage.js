import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    Switch,
    FormControlLabel,
    FormGroup,
    Button,
    Alert,
    Snackbar,
    Grid,
    Slider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Breadcrumbs,
    Link as MuiLink,
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import {
    Settings as SettingsIcon,
    Palette as PaletteIcon,
    Notifications as NotificationsIcon,
    Security as SecurityIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Home as HomeIcon,
    CloudDownload as CloudDownloadIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    MenuBook as MenuBookIcon,
    Forest as ForestIcon,
    NightlightRound as NightlightRoundIcon,
    LocalFlorist as LocalFloristIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeSettings } from '../context/ThemeContext';

// 軽量化：Styled Componentsを最小限に
const SettingsContainer = styled(Container)({ paddingTop: 32, paddingBottom: 64, maxWidth: '1200px' });
const HeaderSection = styled(Box)({ marginBottom: 32, textAlign: 'center' });

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    marginBottom: 24,
    transition: 'transform 0.2s ease',
    '&:hover': { transform: 'translateY(-2px)' },
}));

const SectionHeader = styled(Box)(({ theme, color = 'primary' }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '20px 24px',
    backgroundColor: alpha(theme.palette[color].main, 0.1),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SettingItem = styled(Box)({ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.1)', '&:last-child': { borderBottom: 'none' } });

// 軽量化：プレビューコンポーネントをシンプル化
const ThemePresetCard = memo(styled(Box)(({ theme, selected }) => ({
    width: '100%',
    height: 100,
    borderRadius: 12,
    border: selected ? `3px solid ${theme.palette.primary.main}` : `2px solid ${theme.palette.divider}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    background: theme.palette.background.default,
    overflow: 'hidden',
    '&:hover': { transform: 'scale(1.02)' },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        background: theme.palette.primary.main,
    },
})));

const ThemeModePreview = memo(styled(Box)(({ theme, selected, mode }) => {
    const bgColors = {
        light: '#ffffff',
        dark: '#121212',
    };

    return {
        width: 70,
        height: 50,
        borderRadius: 8,
        border: selected ? `3px solid ${theme.palette.primary.main}` : `2px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: bgColors[mode],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': { transform: 'scale(1.05)' },
    };
}));

const PresetIcon = styled(Box)(({ selected, theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
}));

// メモ化されたコンポーネント
const AppearanceSettings = memo(({ themeSettings, onThemeChange, onSave, onReset, isAuthenticated }) => {
    const { themePresets } = useThemeSettings();

    const presetIcons = {
        classic: <PaletteIcon />,
        warm: <MenuBookIcon />,
        forest: <ForestIcon />,
        midnight: <NightlightRoundIcon />,
        sakura: <LocalFloristIcon />,
    };

    // ログインしていない場合の警告表示
    if (!isAuthenticated) {
        return (
            <StyledCard>
                <SectionHeader color="primary">
                    <Box sx={{ mr: 2 }}><PaletteIcon color="primary" /></Box>
                    <Typography variant="h6" fontWeight="bold">外観設定</Typography>
                </SectionHeader>
                <SettingItem>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        外観設定を変更するには、ログインが必要です。
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                        現在はライトモードで表示されています。ログイン後にお好みのテーマを選択できます。
                    </Typography>
                </SettingItem>
            </StyledCard>
        );
    }

    return (
        <StyledCard>
            <SectionHeader color="primary">
                <Box sx={{ mr: 2 }}><PaletteIcon color="primary" /></Box>
                <Typography variant="h6" fontWeight="bold">外観設定</Typography>
            </SectionHeader>

            {/* テーマプリセット */}
            <SettingItem>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>テーマプリセット</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {Object.entries(themePresets).map(([key, preset]) => (
                        <Grid item xs={4} sm={2.4} key={key}>
                            <Box sx={{ textAlign: 'center' }}>
                                <ThemePresetCard
                                    selected={themeSettings.preset === key}
                                    onClick={() => onThemeChange('preset', key)}
                                >
                                    <PresetIcon selected={themeSettings.preset === key}>
                                        {presetIcons[key]}
                                    </PresetIcon>
                                </ThemePresetCard>
                                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                    {preset.name}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </SettingItem>

            {/* テーマモード */}
            <SettingItem>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>表示モード</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    {[
                        { key: 'light', label: 'ライト', icon: <LightModeIcon /> },
                        { key: 'dark', label: 'ダーク', icon: <DarkModeIcon /> }
                    ].map((option) => (
                        <Box key={option.key} sx={{ textAlign: 'center' }}>
                            <ThemeModePreview
                                selected={themeSettings.mode === option.key}
                                mode={option.key}
                                onClick={() => onThemeChange('mode', option.key)}
                            >
                                {option.icon}
                            </ThemeModePreview>
                            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                {option.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </SettingItem>

            {/* フォントサイズ */}
            <SettingItem>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>フォントサイズ</Typography>
                <Slider
                    value={themeSettings.fontSize}
                    onChange={(e, value) => onThemeChange('fontSize', value)}
                    min={12}
                    max={24}
                    step={1}
                    marks={[
                        { value: 12, label: '小' },
                        { value: 16, label: '中' },
                        { value: 20, label: '大' },
                        { value: 24, label: '特大' }
                    ]}
                    valueLabelDisplay="auto"
                    sx={{ mt: 2 }}
                />
            </SettingItem>

            {/* 保存・リセットボタン */}
            <SettingItem>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={onReset}
                        size="small"
                    >
                        リセット
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={onSave}
                        size="small"
                    >
                        保存
                    </Button>
                </Box>
            </SettingItem>
        </StyledCard>
    );
});

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { themeSettings, updateThemeSettings } = useThemeSettings();

    const [localThemeSettings, setLocalThemeSettings] = useState(themeSettings);
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        notifyOnComment: true,
        notifyOnFollow: true,
        notifyOnLike: true,
        notifyOnPost: false,
        twoFactorAuth: false,
    });

    const [saveStatus, setSaveStatus] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // themeSettingsが変更されたらlocalThemeSettingsも同期
    useEffect(() => {
        setLocalThemeSettings(themeSettings);
    }, [themeSettings]);

    // 軽量化：ユーザー設定取得
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
    }, [isAuthenticated, navigate]);

    // 軽量化：コールバック関数をメモ化
    const handleThemeChange = useCallback((key, value) => {
        setLocalThemeSettings(prev => ({ ...prev, [key]: value }));
        updateThemeSettings({ [key]: value }); // リアルタイム反映
    }, [updateThemeSettings]);

    const handleSaveTheme = useCallback(async () => {
        try {
            const response = await fetch('/api/users/theme-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(localThemeSettings)
            });

            if (response.ok) {
                setSaveStatus({
                    open: true,
                    message: '外観設定を保存しました',
                    severity: 'success'
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || '保存に失敗しました');
            }
        } catch (error) {
            console.error('Theme save error:', error);
            setSaveStatus({
                open: true,
                message: `保存に失敗しました: ${error.message}`,
                severity: 'error'
            });
        }
    }, [localThemeSettings]);

    const handleResetTheme = useCallback(async () => {
        try {
            const response = await fetch('/api/users/theme-settings', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                const defaultSettings = { mode: 'light', preset: 'classic', fontSize: 16 };
                setLocalThemeSettings(defaultSettings);
                updateThemeSettings(defaultSettings);
                setSaveStatus({
                    open: true,
                    message: 'デフォルト設定にリセットしました',
                    severity: 'info'
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'リセットに失敗しました');
            }
        } catch (error) {
            console.error('Theme reset error:', error);
            setSaveStatus({
                open: true,
                message: `リセットに失敗しました: ${error.message}`,
                severity: 'error'
            });
        }
    }, [updateThemeSettings]);

    const handleSettingChange = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSave = useCallback(async () => {
        try {
            setSaveStatus({
                open: true,
                message: '設定を保存しました',
                severity: 'success'
            });
        } catch (error) {
            setSaveStatus({
                open: true,
                message: '保存に失敗しました',
                severity: 'error'
            });
        }
    }, [settings]);

    const handleDeleteAccount = useCallback(async () => {
        try {
            setDeleteDialogOpen(false);
            setSaveStatus({
                open: true,
                message: 'アカウント削除のリクエストを送信しました',
                severity: 'warning'
            });
        } catch (error) {
            setSaveStatus({
                open: true,
                message: 'アカウント削除のリクエストに失敗しました',
                severity: 'error'
            });
        }
    }, []);

    if (!isAuthenticated) return null;

    return (
        <SettingsContainer>
            <HeaderSection>
                <Breadcrumbs sx={{ justifyContent: 'center', display: 'flex', mb: 2 }}>
                    <MuiLink component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
                        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        ホーム
                    </MuiLink>
                    <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <SettingsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        設定
                    </Typography>
                </Breadcrumbs>

                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                    設定
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    あなたの読書体験をカスタマイズして、より快適にサイトをご利用ください
                </Typography>
            </HeaderSection>

            <Grid container spacing={4}>
                {/* 外観設定 */}
                <Grid item xs={12}>
                    <AppearanceSettings
                        themeSettings={localThemeSettings}
                        onThemeChange={handleThemeChange}
                        onSave={handleSaveTheme}
                        onReset={handleResetTheme}
                        isAuthenticated={isAuthenticated}
                    />
                </Grid>

                {/* その他の設定は省略（元のまま） */}
                {/* 通知設定 */}
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <SectionHeader color="secondary">
                            <Box sx={{ mr: 2 }}><NotificationsIcon color="secondary" /></Box>
                            <Typography variant="h6" fontWeight="bold">通知設定</Typography>
                        </SectionHeader>
                        <SettingItem>
                            <FormGroup>
                                <FormControlLabel
                                    control={<Switch checked={settings.emailNotifications} onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)} color="secondary" />}
                                    label="メール通知を有効にする"
                                />
                                <FormControlLabel
                                    control={<Switch checked={settings.pushNotifications} onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)} color="secondary" />}
                                    label="プッシュ通知を有効にする"
                                />
                            </FormGroup>
                        </SettingItem>
                        <SettingItem>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>通知するイベント</Typography>
                            <FormGroup>
                                {[
                                    { key: 'notifyOnComment', label: 'コメントがついたとき' },
                                    { key: 'notifyOnFollow', label: 'フォローされたとき' },
                                    { key: 'notifyOnLike', label: 'いいねされたとき' },
                                    { key: 'notifyOnPost', label: '新しい投稿があったとき' }
                                ].map(({ key, label }) => (
                                    <FormControlLabel
                                        key={key}
                                        control={<Switch checked={settings[key]} onChange={(e) => handleSettingChange(key, e.target.checked)} size="small" />}
                                        label={label}
                                    />
                                ))}
                            </FormGroup>
                        </SettingItem>
                    </StyledCard>
                </Grid>

                {/* プライバシー設定 */}
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <SectionHeader color="success">
                            <Box sx={{ mr: 2 }}><VisibilityIcon color="success" /></Box>
                            <Typography variant="h6" fontWeight="bold">プライバシー設定</Typography>
                        </SectionHeader>
                        <SettingItem>
                            <Typography variant="body2" color="text.secondary">
                                プライバシー設定は今後のアップデートで追加予定です。
                            </Typography>
                        </SettingItem>
                    </StyledCard>
                </Grid>

                {/* セキュリティとデータ */}
                <Grid item xs={12}>
                    <StyledCard>
                        <SectionHeader color="error">
                            <Box sx={{ mr: 2 }}><SecurityIcon color="error" /></Box>
                            <Typography variant="h6" fontWeight="bold">セキュリティとデータ</Typography>
                        </SectionHeader>
                        <Grid container>
                            <Grid item xs={12} md={4}>
                                <SettingItem>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="medium">二要素認証</Typography>
                                            <Typography variant="body2" color="text.secondary">セキュリティを強化</Typography>
                                        </Box>
                                        <Switch checked={settings.twoFactorAuth} onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)} color="error" />
                                    </Box>
                                </SettingItem>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <SettingItem>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="medium">データダウンロード</Typography>
                                            <Typography variant="body2" color="text.secondary">データをエクスポート</Typography>
                                        </Box>
                                        <Button variant="outlined" startIcon={<CloudDownloadIcon />} size="small">DL</Button>
                                    </Box>
                                </SettingItem>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <SettingItem>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="medium" color="error.main">アカウント削除</Typography>
                                            <Typography variant="body2" color="text.secondary">取り消し不可</Typography>
                                        </Box>
                                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" onClick={() => setDeleteDialogOpen(true)}>削除</Button>
                                    </Box>
                                </SettingItem>
                            </Grid>
                        </Grid>
                    </StyledCard>
                </Grid>
            </Grid>

            {/* 設定保存ボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSave} sx={{ borderRadius: 50, px: 4, py: 1.5, fontWeight: 'bold' }}>
                    設定を保存
                </Button>
            </Box>

            {/* 削除確認ダイアログ */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle><Typography variant="h6" color="error">アカウント削除の確認</Typography></DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>この操作は取り消すことができません。すべてのデータが永久に削除されます。</Alert>
                    <Typography>本当にアカウントを削除しますか？削除後は投稿した小説、コメント、フォロー情報などすべてのデータが失われます。</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
                    <Button onClick={handleDeleteAccount} color="error" variant="contained">削除する</Button>
                </DialogActions>
            </Dialog>

            {/* 保存状況のスナックバー */}
            <Snackbar
                open={saveStatus.open}
                autoHideDuration={4000}
                onClose={() => setSaveStatus(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSaveStatus(prev => ({ ...prev, open: false }))} severity={saveStatus.severity} variant="filled">
                    {saveStatus.message}
                </Alert>
            </Snackbar>
        </SettingsContainer>
    );
};

export default memo(SettingsPage);