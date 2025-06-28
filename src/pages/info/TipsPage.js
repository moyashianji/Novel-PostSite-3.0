// src/pages/TipsPage.js
import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Rating,
  Divider,
  Alert,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Lightbulb as LightbulbIcon,
  Create as CreateIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  ThumbUp as ThumbUpIcon,
  AccessTime as AccessTimeIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

const TipsPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tipCategories = [
    { id: 'daily', label: '日常の執筆', icon: <CreateIcon /> },
    { id: 'technique', label: '文章技術', icon: <MenuBookIcon /> },
    { id: 'inspiration', label: 'アイデア発想', icon: <LightbulbIcon /> },
    { id: 'productivity', label: '効率化', icon: <SpeedIcon /> }
  ];

  const tips = {
    daily: [
      {
        id: 1,
        title: '朝の15分間執筆',
        difficulty: 1,
        timeRequired: '15分',
        category: '習慣作り',
        rating: 4.8,
        description: '毎朝15分間だけでも執筆する習慣をつけましょう。少しずつでも継続することで、執筆力が確実に向上します。',
        content: [
          '**なぜ朝なのか？**',
          '朝は頭がすっきりしており、創造性が最も高い時間帯です。また、日中の予定に邪魔されにくいという利点もあります。',
          '',
          '**具体的な方法**',
          '• 毎日同じ時間に起床',
          '• コーヒーを入れながら執筆の準備',
          '• 15分間タイマーをセット',
          '• 文字数は気にせず、とにかく書く',
          '',
          '**継続のコツ**',
          '完璧を求めず、「今日も書けた」という達成感を大切にしましょう。'
        ],
        tags: ['習慣', '朝活', '継続']
      },
      {
        id: 2,
        title: 'スマホメモ活用法',
        difficulty: 2,
        timeRequired: '随時',
        category: 'アイデア管理',
        rating: 4.6,
        description: 'スマートフォンのメモ機能を活用して、いつでもどこでもアイデアを記録しましょう。',
        content: [
          '**アイデアは突然やってくる**',
          '電車の中、歩いている時、お風呂に入っている時など、アイデアは予期せぬタイミングで浮かびます。',
          '',
          '**効果的な記録方法**',
          '• キーワードだけでも記録',
          '• 音声入力を活用',
          '• カテゴリー別にフォルダ分け',
          '• 定期的に見返して整理',
          '',
          '**おすすめアプリ**',
          '• iOS: 純正メモアプリ、Bear',
          '• Android: Google Keep、Notion'
        ],
        tags: ['アイデア', 'メモ', 'スマホ']
      }
    ],
    technique: [
      {
        id: 3,
        title: '五感描写マスター',
        difficulty: 3,
        timeRequired: '30分',
        category: '表現技術',
        rating: 4.7,
        description: '五感を使った描写で、読者の想像力を刺激する魅力的な文章を書きましょう。',
        content: [
          '**五感描写の重要性**',
          '読者が物語の世界を体感できるよう、視覚・聴覚・触覚・嗅覚・味覚すべてを使った描写を心がけましょう。',
          '',
          '**各感覚の活用例**',
          '• **視覚**: 色彩、光と影、動きの表現',
          '• **聴覚**: 環境音、声のトーン、沈黙',
          '• **触覚**: 温度、質感、重量感',
          '• **嗅覚**: 季節の匂い、料理の香り',
          '• **味覚**: 食べ物、感情と結びつく味',
          '',
          '**練習方法**',
          '身の回りの物を五感で描写する練習から始めましょう。'
        ],
        tags: ['描写', '五感', '表現力']
      },
      {
        id: 4,
        title: '対話文の極意',
        difficulty: 3,
        timeRequired: '45分',
        category: '文章技術',
        rating: 4.5,
        description: 'キャラクターが生き生きと感じられる自然な対話文の書き方をマスターしましょう。',
        content: [
          '**自然な対話の条件**',
          'リアルな会話は、必ずしも完全な文章ではありません。言いよどみや省略も重要な要素です。',
          '',
          '**キャラクター別の話し方**',
          '• 年齢による言葉遣いの違い',
          '• 職業や背景による語彙の選択',
          '• 性格による話すリズムの変化',
          '',
          '**対話文のバランス**',
          '会話だけでなく、間の取り方や仕草の描写も重要です。',
          '',
          '**避けるべきこと**',
          '• 説明臭い台詞',
          '• 全員が同じ話し方',
          '• 長すぎる一人語り'
        ],
        tags: ['対話', 'キャラクター', '自然さ']
      }
    ],
    inspiration: [
      {
        id: 5,
        title: 'What if思考法',
        difficulty: 2,
        timeRequired: '20分',
        category: '発想法',
        rating: 4.9,
        description: '「もしも〜だったら？」という問いかけから、無限のアイデアを生み出す方法です。',
        content: [
          '**What if思考法とは**',
          '既存の状況に「もしも」という仮定を加えることで、新しい物語の可能性を探る発想法です。',
          '',
          '**具体例**',
          '• もしも重力が逆向きだったら？',
          '• もしも動物が人間の言葉を話せたら？',
          '• もしも過去に戻れるのが一度だけだったら？',
          '',
          '**アイデア展開のコツ**',
          '• 小さな変化から始める',
          '• 日常に非日常を混ぜる',
          '• 複数の「もしも」を組み合わせる',
          '',
          '**練習方法**',
          '毎日ひとつ「もしも」を考える習慣をつけましょう。'
        ],
        tags: ['発想法', 'アイデア', 'What if']
      }
    ],
    productivity: [
      {
        id: 6,
        title: 'ポモドーロ執筆法',
        difficulty: 2,
        timeRequired: '25分×n',
        category: '時間管理',
        rating: 4.4,
        description: '25分間集中して執筆し、5分間休憩するサイクルで効率的に作品を完成させましょう。',
        content: [
          '**ポモドーロテクニックとは**',
          '25分間の集中作業と5分間の休憩を繰り返す時間管理術です。執筆にも効果的です。',
          '',
          '**執筆への応用方法**',
          '• 1ポモドーロ = 特定のシーンを書く',
          '• 休憩時間にアイデアを整理',
          '• 4ポモドーロ後に長い休憩（15-30分）',
          '',
          '**メリット**',
          '• 集中力の維持',
          '• 進捗の可視化',
          '• 疲労の軽減',
          '',
          '**おすすめツール**',
          '• Be Focused（iOS）',
          '• Focus Keeper（Android）',
          '• Forest（ゲーミフィケーション）'
        ],
        tags: ['時間管理', '集中力', 'ポモドーロ']
      }
    ]
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'default';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 1: return '初級';
      case 2: return '中級';
      case 3: return '上級';
      default: return '';
    }
  };

  return (
    <StaticPageLayout 
      title="執筆のコツ"
      subtitle="今日から使える実践的な執筆テクニック"
      breadcrumbItems={[
        { label: '作家向け', path: '/writers' }
      ]}
    >
      {/* 概要 */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          <strong>実践的な執筆テクニック集</strong> 
          毎日の執筆に役立つ具体的なコツやテクニックを、
          レベル別・カテゴリー別に紹介しています。
          自分に合った方法を見つけて、少しずつ試してみましょう。
        </Typography>
      </Alert>

      {/* カテゴリータブ */}
      <Paper elevation={1} sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tipCategories.map((category, index) => (
            <Tab 
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {category.icon}
                  {category.label}
                </Box>
              }
            />
          ))}
        </Tabs>

        {tipCategories.map((category, categoryIndex) => (
          <TabPanel key={categoryIndex} value={activeTab} index={categoryIndex}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {tips[category.id]?.map((tip) => (
                  <Grid item xs={12} md={6} key={tip.id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        {/* ヘッダー部分 */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                            {tip.title}
                          </Typography>
                          <Chip 
                            label={getDifficultyLabel(tip.difficulty)}
                            color={getDifficultyColor(tip.difficulty)}
                            size="small"
                          />
                        </Box>

                        {/* メタ情報 */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {tip.timeRequired}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Rating value={tip.rating} precision={0.1} size="small" readOnly />
                            <Typography variant="caption" color="text.secondary">
                              ({tip.rating})
                            </Typography>
                          </Box>
                        </Box>

                        {/* 説明文 */}
                        <Typography variant="body2" paragraph sx={{ lineHeight: 1.6 }}>
                          {tip.description}
                        </Typography>

                        {/* 詳細内容（一部のみ表示） */}
                        <Box sx={{ mb: 2 }}>
                          {tip.content.slice(0, 3).map((paragraph, index) => {
                            const isBold = paragraph.includes('**');
                            const cleanParagraph = paragraph.replace(/\*\*/g, '');
                            
                            if (paragraph === '') return <br key={index} />;
                            
                            return (
                              <Typography 
                                key={index}
                                variant="body2" 
                                sx={{ 
                                  fontWeight: isBold ? 'bold' : 'normal',
                                  color: isBold ? 'primary.main' : 'text.secondary',
                                  mb: 0.5,
                                  fontSize: '0.875rem'
                                }}
                              >
                                {cleanParagraph}
                              </Typography>
                            );
                          })}
                          {tip.content.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              ...続きを読む
                            </Typography>
                          )}
                        </Box>

                        {/* タグ */}
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {tip.tags.map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={tag} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Box>
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<MenuBookIcon />}
                          fullWidth
                        >
                          詳細を見る
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                )) || (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      このカテゴリーのコンテンツは準備中です。近日公開予定です！
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          </TabPanel>
        ))}
      </Paper>

      {/* 追加リソース */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
                <CreateIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                執筆ガイド
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                より体系的な執筆技術を学びたい方は、
                執筆ガイドをご覧ください。
              </Typography>
              <Button variant="outlined" href="/guides" size="small">
                ガイドを見る
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Avatar sx={{ bgcolor: 'secondary.main', mb: 2 }}>
                <PsychologyIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                コミュニティ
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                他の作家と交流し、執筆のコツを
                共有しましょう。
              </Typography>
              <Button 
                variant="outlined" 
                href="https://discord.gg/TsbXmNWq"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                Discordに参加
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Avatar sx={{ bgcolor: 'success.main', mb: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                執筆企画
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                定期的な執筆企画やコンテストで
                スキルアップしましょう。
              </Typography>
              <Button variant="outlined" href="/contests" size="small">
                企画を見る
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 読者からのフィードバック */}
      <Paper elevation={1} sx={{ p: 4, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h5" gutterBottom color="primary" fontWeight="bold" textAlign="center">
          <ThumbUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          読者の声
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="body2" paragraph sx={{ fontStyle: 'italic' }}>
                「ポモドーロ執筆法を試してから、集中力が格段に上がりました！
                短時間でも確実に進捗が出るので、達成感があります。」
              </Typography>
              <Typography variant="caption" color="text.secondary">
                - 小説家 Aさん
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="body2" paragraph sx={{ fontStyle: 'italic' }}>
                「五感描写のコツを実践したら、読者から『情景が目に浮かぶ』
                という感想をもらえるようになりました！」
              </Typography>
              <Typography variant="caption" color="text.secondary">
                - 小説家 Bさん
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </StaticPageLayout>
  );
};

export default TipsPage;