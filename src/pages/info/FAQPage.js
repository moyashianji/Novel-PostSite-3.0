// src/pages/FAQPage.js
import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  HelpOutline as HelpOutlineIcon,
  ContactSupport as ContactSupportIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const categories = [
    { id: 'all', label: 'すべて', color: 'default' },
    { id: 'account', label: 'アカウント', color: 'primary' },
    { id: 'writing', label: '執筆・投稿', color: 'secondary' },
    { id: 'reading', label: '読書・閲覧', color: 'info' },
    { id: 'community', label: 'コミュニティ', color: 'success' },
    { id: 'technical', label: '技術的な問題', color: 'warning' },
    { id: 'other', label: 'その他', color: 'error' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'アカウント登録に年齢制限はありますか？',
      answer: 'NovelCrestは13歳以上の方にご利用いただけます。ただし、18歳未満の方は保護者の同意が必要です。また、18歳未満の方は年齢制限コンテンツ（R18）を閲覧することはできません。',
      tags: ['登録', '年齢制限', 'R18']
    },
    {
      id: 2,
      category: 'account',
      question: 'パスワードを忘れてしまいました',
      answer: 'ログインページの「パスワードを忘れた方」リンクをクリックし、登録時のメールアドレスを入力してください。パスワードリセット用のメールをお送りします。メールが届かない場合は、迷惑メールフォルダもご確認ください。',
      tags: ['パスワード', 'リセット', 'ログイン']
    },
    {
      id: 3,
      category: 'writing',
      question: '小説の投稿に文字数制限はありますか？',
      answer: '1話あたりの文字数制限は50,000文字です。また、1つのシリーズには最大500話まで投稿できます。より長い作品を投稿したい場合は、複数のシリーズに分けることをお勧めします。',
      tags: ['投稿', '文字数', '制限']
    },
    {
      id: 4,
      category: 'writing',
      question: '投稿した小説を削除することはできますか？',
      answer: 'はい、可能です。マイページから該当の作品を選択し、「削除」ボタンをクリックしてください。ただし、削除した作品は復元できませんので、事前にバックアップを取ることをお勧めします。',
      tags: ['削除', '復元', 'バックアップ']
    },
    {
      id: 5,
      category: 'writing',
      question: 'R18コンテンツを投稿する際の注意点は？',
      answer: '成人向けコンテンツを投稿する場合は、必ず「R18」タグを設定してください。また、タイトルや概要に直接的な表現を含めないようにお願いします。適切にタグ付けされていない場合、運営側で設定を変更したり、非公開にする場合があります。',
      tags: ['R18', 'タグ', '成人向け']
    },
    {
      id: 6,
      category: 'reading',
      question: 'ブックマーク機能の使い方を教えてください',
      answer: '作品詳細ページで「ブックマーク」ボタンをクリックすると、読書の途中位置を保存できます。次回アクセス時に、保存した位置から読み始めることができます。ブックマークはマイページの「ブックマーク」タブで管理できます。',
      tags: ['ブックマーク', '読書', '途中保存']
    },
    {
      id: 7,
      category: 'community',
      question: 'Discordコミュニティに参加するメリットは？',
      answer: 'Discordコミュニティでは、他の作家や読者と直接交流できます。執筆の相談、感想の交換、執筆企画への参加など、創作活動を豊かにする機会がたくさんあります。また、運営からの最新情報もいち早く受け取れます。',
      tags: ['Discord', 'コミュニティ', '交流']
    },
    {
      id: 8,
      category: 'technical',
      question: 'スマートフォンで小説を書くことはできますか？',
      answer: 'はい、可能です。NovelCrestはレスポンシブデザインに対応しており、スマートフォンやタブレットからでも快適に執筆できます。ただし、長文の執筆にはPCの使用をお勧めします。',
      tags: ['スマートフォン', 'モバイル', '執筆']
    },
    {
      id: 9,
      category: 'technical',
      question: 'エラーが発生して投稿できません',
      answer: 'まず、ブラウザの再読み込みを試してください。それでも解決しない場合は、以下をお試しください：1) ブラウザのキャッシュをクリア、2) 他のブラウザで試す、3) インターネット接続を確認。問題が続く場合はお問い合わせフォームからご連絡ください。',
      tags: ['エラー', 'トラブルシューティング', '投稿']
    },
    {
      id: 10,
      category: 'other',
      question: '商用利用は可能ですか？',
      answer: 'NovelCrestに投稿された作品の著作権は作者に帰属します。そのため、ご自身の作品の商用利用は可能です。ただし、他の利用者の作品を商用利用する場合は、作者の許可が必要です。詳細は利用規約をご確認ください。',
      tags: ['商用利用', '著作権', '利用規約']
    }
  ];

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <StaticPageLayout 
      title="よくある質問（FAQ）"
      subtitle="NovelCrestに関するよくある質問と回答"
      breadcrumbItems={[
        { label: 'サポート', path: '/support' }
      ]}
    >
      {/* 検索とフィルター */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="質問を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.label}
                  color={selectedCategory === category.id ? category.color : 'default'}
                  variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                  onClick={() => setSelectedCategory(category.id)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* FAQ一覧 */}
      {filteredFAQs.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography>
            検索条件に一致する質問が見つかりませんでした。
            検索キーワードを変更するか、<strong>お問い合わせフォーム</strong>からご質問ください。
          </Typography>
        </Alert>
      ) : (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            {filteredFAQs.length}件の質問が見つかりました
          </Typography>
          
          {filteredFAQs.map((faq) => (
            <Accordion 
              key={faq.id}
              expanded={expanded === faq.id}
              onChange={handleAccordionChange(faq.id)}
              sx={{ 
                mb: 1,
                '&:before': { display: 'none' },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                '&.Mui-expanded': {
                  margin: '0 0 8px 0'
                }
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  '&.Mui-expanded': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <QuestionAnswerIcon color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                    {faq.question}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={categories.find(cat => cat.id === faq.category)?.label} 
                    color={categories.find(cat => cat.id === faq.category)?.color}
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ pt: 2 }}>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
                  {faq.answer}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    関連タグ:
                  </Typography>
                  {faq.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* お問い合わせ案内 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                <ContactSupportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                解決しませんでしたか？
              </Typography>
              <Typography variant="body2" paragraph>
                ここに記載されていない質問やより詳細なサポートが必要な場合は、
                お問い合わせフォームからお気軽にご連絡ください。
              </Typography>
              <Button variant="contained" href="/contact" fullWidth>
                お問い合わせする
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                <HelpOutlineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                その他のヘルプ
              </Typography>
              <Typography variant="body2" paragraph>
                執筆ガイドや執筆のコツなど、創作に役立つ情報も
                ご用意しています。
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" href="/guides" size="small">
                  執筆ガイド
                </Button>
                <Button variant="outlined" href="/tips" size="small">
                  執筆のコツ
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </StaticPageLayout>
  );
};

export default FAQPage;