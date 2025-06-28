// src/pages/WritingGuidePage.js
import React, { useState } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import { 
  MenuBook as MenuBookIcon,
  Create as CreateIcon,
  Lightbulb as LightbulbIcon,
  Timeline as TimelineIcon,
  Palette as PaletteIcon,
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  TipsAndUpdates as TipsIcon
} from '@mui/icons-material';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

const WritingGuidePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const guideCategories = [
    {
      title: '執筆の基本',
      icon: <CreateIcon />,
      sections: [
        {
          id: 'basic-structure',
          title: '小説の基本構造',
          content: [
            '**起承転結の基本**',
            '物語は「起承転結」という基本構造で構成されます：',
            '• 起：物語の始まり、キャラクターや設定の紹介',
            '• 承：物語の発展、事件や問題の提示',
            '• 転：クライマックス、大きな転換点',
            '• 結：物語の終結、問題の解決',
            '',
            '**三幕構成**',
            'より詳細な構成として、三幕構成も有効です：',
            '• 第一幕：設定とキャラクター紹介（全体の25%）',
            '• 第二幕：コンフリクトと展開（全体の50%）',
            '• 第三幕：クライマックスと解決（全体の25%）'
          ]
        },
        {
          id: 'character-development',
          title: 'キャラクター作り',
          content: [
            '**魅力的な主人公の作り方**',
            '読者に愛されるキャラクターには以下の要素が重要です：',
            '• 明確な目標や願望',
            '• 克服すべき欠点や弱点',
            '• 独特な口調や行動パターン',
            '• 過去の体験や背景設定',
            '',
            '**キャラクターシート**',
            'キャラクターを整理するために以下を設定しましょう：',
            '• 基本情報（名前、年齢、職業など）',
            '• 外見の特徴',
            '• 性格と価値観',
            '• 人間関係',
            '• 秘密や隠された側面'
          ]
        }
      ]
    },
    {
      title: '文章技術',
      icon: <PaletteIcon />,
      sections: [
        {
          id: 'writing-style',
          title: '文体と表現',
          content: [
            '**読みやすい文章のコツ**',
            '• 一文を短く、シンプルに',
            '• 主語と述語を明確に',
            '• 修飾語の位置に注意',
            '• 同じ語尾の連続を避ける',
            '',
            '**五感を使った描写**',
            '読者の想像力を刺激する描写のために：',
            '• 視覚：色、形、動き',
            '• 聴覚：音、声、リズム',
            '• 触覚：温度、質感、重さ',
            '• 嗅覚：香り、匂い',
            '• 味覚：甘味、苦味など',
            '',
            '**対話の書き方**',
            '• キャラクターごとに話し方を変える',
            '• 「」内の会話と地の文のバランス',
            '• 感情を込めた台詞回し'
          ]
        }
      ]
    },
    {
      title: 'プロット作成',
      icon: <TimelineIcon />,
      sections: [
        {
          id: 'plot-planning',
          title: 'プロットの組み立て',
          content: [
            '**プロットの重要性**',
            'プロットは物語の設計図です。しっかりと計画することで：',
            '• 一貫性のある物語が書ける',
            '• 途中で迷子にならない',
            '• 魅力的な展開を作れる',
            '',
            '**プロット作成の手順**',
            '1. **テーマの決定**：何を伝えたいか',
            '2. **結末の設定**：どう終わるか',
            '3. **主要なイベント**：重要な出来事',
            '4. **因果関係**：出来事の繋がり',
            '5. **詳細な展開**：シーンごとの内容'
          ]
        }
      ]
    }
  ];

  const tips = [
    {
      title: '毎日少しずつでも書く',
      description: '1日100文字でも継続することが重要です。習慣化が創作力向上の鍵。',
      icon: <CheckCircleIcon color="success" />
    },
    {
      title: '他の作品を読む',
      description: '様々なジャンルの作品を読むことで、表現力や構成力が向上します。',
      icon: <MenuBookIcon color="primary" />
    },
    {
      title: 'フィードバックを求める',
      description: 'コミュニティで感想をもらい、客観的な視点を取り入れましょう。',
      icon: <PsychologyIcon color="secondary" />
    },
    {
      title: '推敲を怠らない',
      description: '一度書いた文章を見直し、より良い表現に修正することが大切。',
      icon: <StarIcon color="warning" />
    }
  ];

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <StaticPageLayout 
      title="執筆ガイド"
      subtitle="より良い物語を書くためのヒント集"
      breadcrumbItems={[
        { label: '作家向け', path: '/writers' }
      ]}
    >
      {/* はじめに */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body1">
          <strong>執筆ガイドへようこそ！</strong> 
          ここでは小説を書く上で役立つ技術やコツを、初心者から上級者まで
          レベルに応じて紹介しています。すべてを一度に覚える必要はありません。
          少しずつ実践していきましょう。
        </Typography>
      </Alert>

      {/* クイックティップス */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'white' }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          <TipsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          今日から始められる執筆のコツ
        </Typography>
        
        <Grid container spacing={2}>
          {tips.map((tip, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {tip.icon}
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {tip.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tip.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* メインコンテンツ */}
      <Paper elevation={1} sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {guideCategories.map((category, index) => (
            <Tab 
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {category.icon}
                  {category.title}
                </Box>
              }
            />
          ))}
        </Tabs>

        {guideCategories.map((category, categoryIndex) => (
          <TabPanel key={categoryIndex} value={activeTab} index={categoryIndex}>
            <Box sx={{ px: 3, pb: 3 }}>
              {category.sections.map((section) => (
                <Accordion 
                  key={section.id}
                  expanded={expanded === section.id}
                  onChange={handleAccordionChange(section.id)}
                  sx={{ mb: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" fontWeight="bold">
                      {section.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {section.content.map((paragraph, pIndex) => {
                      const isBold = paragraph.includes('**');
                      const cleanParagraph = paragraph.replace(/\*\*/g, '');
                      const isBullet = paragraph.startsWith('•');
                      
                      return (
                        <Typography 
                          key={pIndex}
                          variant="body1" 
                          paragraph={pIndex < section.content.length - 1 && paragraph !== ''}
                          sx={{ 
                            fontWeight: isBold ? 'bold' : 'normal',
                            color: isBold ? 'primary.main' : 'text.primary',
                            ml: isBullet ? 2 : 0,
                            lineHeight: 1.7
                          }}
                        >
                          {cleanParagraph}
                        </Typography>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </TabPanel>
        ))}
      </Paper>

      {/* 関連リンク */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                <LightbulbIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                執筆のコツ
              </Typography>
              <Typography variant="body2" paragraph>
                日々の執筆に役立つ具体的なテクニックやヒントを紹介しています。
              </Typography>
              <Button variant="outlined" href="/tips" fullWidth>
                執筆のコツを見る
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                FAQ
              </Typography>
              <Typography variant="body2" paragraph>
                執筆に関するよくある質問と回答を掲載しています。
              </Typography>
              <Button variant="outlined" href="/faq" fullWidth>
                FAQを見る
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </StaticPageLayout>
  );
};

export default WritingGuidePage;