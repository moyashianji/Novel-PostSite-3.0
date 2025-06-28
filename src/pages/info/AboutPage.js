// src/pages/AboutPage.js
import React from 'react';
import { 
  Typography, 
  Box, 
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { 
  Info as InfoIcon,
  Create as CreateIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  AutoStories as AutoStoriesIcon,
  People as CommunityIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

const AboutPage = () => {
  const features = [
    {
      icon: <CreateIcon color="primary" />,
      title: '自由な創作環境',
      description: '直感的なエディターで、思いのままに物語を綴れます。シリーズ管理や下書き保存など、創作をサポートする機能も充実。'
    },
    {
      icon: <PeopleIcon color="primary" />,
      title: '活発なコミュニティ',
      description: 'Discordサーバーでは11,000人以上の作家が交流。感想やアドバイスを通じて、お互いの創作を高め合っています。'
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: '安心・安全',
      description: '年齢制限コンテンツの適切な管理や、プライバシー保護により、すべてのユーザーが安心して利用できる環境を提供。'
    },
    {
      icon: <SpeedIcon color="primary" />,
      title: '高速・軽量',
      description: '最新技術を駆使した高速なページ読み込みと、モバイルファーストなレスポンシブデザインで快適な読書体験。'
    }
  ];

  const timeline = [
    {
      date: '2024年12月',
      title: 'NovelCrest β版リリース',
      description: 'クローズドβとして限定ユーザーに公開開始',
      icon: <LaunchIcon />
    },
    {
      date: '2025年1月',
      title: '正式サービス開始',
      description: '一般公開開始、基本機能の提供開始',
      icon: <StarIcon />
    },
    {
      date: '2025年2月',
      title: 'コンテスト機能追加',
      description: '作家向けコンテスト機能を正式リリース',
      icon: <EmojiEventsIcon />
    },
    {
      date: '2025年春',
      title: 'モバイルアプリ公開予定',
      description: 'iOS・Androidアプリをリリース予定',
      icon: <TrendingUpIcon />
    }
  ];

  const stats = [
    { label: '登録作家数', value: '12,000+', icon: <CreateIcon /> },
    { label: '投稿作品数', value: '45,000+', icon: <AutoStoriesIcon /> },
    { label: 'コミュニティメンバー', value: '11,000+', icon: <CommunityIcon /> },
    { label: '月間PV', value: '2.5M+', icon: <TrendingUpIcon /> }
  ];

  return (
    <StaticPageLayout 
      title="NovelCrestについて"
      subtitle="すべての物語に価値がある"
    >
      {/* サービス概要 */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)' }}>
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold" textAlign="center">
          <AutoStoriesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          NovelCrestとは
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          NovelCrestは、すべての作家が自由に創作し、読者と繋がることができる小説投稿プラットフォームです。
          初心者からプロまで、あらゆるレベルの作家が集い、お互いの物語を通じて成長できるコミュニティを目指しています。
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 3 }}>
          <Chip label="無料で利用" color="primary" variant="outlined" />
          <Chip label="AI支援創作" color="secondary" variant="outlined" />
          <Chip label="コミュニティ重視" color="info" variant="outlined" />
          <Chip label="安心・安全" color="success" variant="outlined" />
        </Box>
      </Paper>

      {/* 統計情報 */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 主要機能 */}
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
        主要機能
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* サービス開発の歩み */}
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
        サービスの歩み
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 6 }}>
        <Stepper orientation="vertical">
          {timeline.map((item, index) => (
            <Step key={index} active={true} completed={index < 2}>
              <StepLabel
                StepIconComponent={() => (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    {item.icon}
                  </Avatar>
                )}
              >
                <Typography variant="h6" fontWeight="bold">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.date}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body1" sx={{ pb: 2 }}>
                  {item.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* ミッション・ビジョン */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                <FavoriteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                ミッション
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                すべての作家が自由に創作し、読者と深くつながることができる場所を提供すること。
                創作の喜びを分かち合い、お互いを高め合えるコミュニティを育むことが私たちの使命です。
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                <StarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                ビジョン
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                世界中の人々が物語を通じて繋がり、創造性が花開く未来を実現すること。
                NovelCrestが、次世代の名作を生み出すプラットフォームとなることを目指しています。
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* お問い合わせ・関連リンク */}
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
          <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          詳細情報・お問い合わせ
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          NovelCrestについてのご質問、ご提案、またはビジネスに関するお問い合わせは、
          お気軽にご連絡ください。
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" href="/contact" size="large">
            お問い合わせ
          </Button>
          <Button variant="outlined" href="/terms" size="large">
            利用規約
          </Button>
          <Button variant="outlined" href="/privacy" size="large">
            プライバシーポリシー
          </Button>
          <Button 
            variant="outlined" 
            href="https://discord.gg/TsbXmNWq"
            target="_blank"
            rel="noopener noreferrer"
            size="large"
          >
            コミュニティ参加
          </Button>
        </Box>
      </Paper>
    </StaticPageLayout>
  );
};

export default AboutPage;