// src/pages/PrivacyPage.js
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Alert,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  PrivacyTip as PrivacyTipIcon,
  Download as DownloadIcon,
  Security as SecurityIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

// プライバシーポリシーデータ（実際の実装では外部ファイルから読み込み）
const PRIVACY_DATA = {
  "version": "1.0.0",
  "effectiveDate": "2025-01-01",
  "lastUpdated": "2025-01-01",
  "sections": [
    {
      "id": "basic-policy",
      "title": "第1条（基本方針）",
      "content": [
        "NovelCrest（以下「当サービス」といいます）は、ユーザーの個人情報を適切に保護することを重要な責務と考えています。",
        "本プライバシーポリシーは、当サービスがどのような個人情報を収集し、どのように利用・保護するかについて説明するものです。",
        "当サービスを利用することで、本プライバシーポリシーに同意したものとみなされます。"
      ]
    },
    {
      "id": "information-collection",
      "title": "第2条（収集する情報）",
      "content": [
        "当サービスでは、以下の情報を収集します：",
        "**アカウント情報**",
        "・ユーザー名（ペンネーム）",
        "・メールアドレス",
        "・生年月日（年齢制限コンテンツの表示判定用）",
        "・性別（任意）",
        "・プロフィール情報（任意）",
        "",
        "**作品・投稿情報**",
        "・投稿した小説、コメント、レビュー",
        "・いいね、ブックマーク等の活動履歴",
        "・読書履歴、閲覧履歴",
        "",
        "**技術的情報**",
        "・IPアドレス",
        "・ブラウザ情報、デバイス情報",
        "・アクセスログ、操作履歴",
        "・Cookieおよび類似技術による情報"
      ]
    },
    {
      "id": "user-rights",
      "title": "第8条（ユーザーの権利）",
      "content": [
        "ユーザーは、自己の個人情報について以下の権利を有します：",
        "（1）**アクセス権**：自己の個人情報の開示を求める権利",
        "（2）**訂正・削除権**：個人情報の訂正・削除を求める権利",
        "（3）**利用停止権**：個人情報の利用停止を求める権利",
        "（4）**データポータビリティ権**：個人情報の提供を求める権利",
        "",
        "これらの権利を行使したい場合は、当サービスのお問い合わせ窓口までご連絡ください。",
        "本人確認を行った上で、合理的な期間内に対応いたします。"
      ]
    }
  ]
};

const PrivacyPage = () => {
  const [privacyData, setPrivacyData] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // 実際の実装では、APIまたはJSONファイルから動的に読み込み
    setPrivacyData(PRIVACY_DATA);
  }, []);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleDownloadPrivacy = () => {
    const content = privacyData.sections.map(section => 
      `${section.title}\n${section.content.join('\n')}\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NovelCrest_プライバシーポリシー_v${privacyData.version}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!privacyData) {
    return (
      <StaticPageLayout title="プライバシーポリシー" subtitle="読み込み中...">
        <Typography>プライバシーポリシーを読み込んでいます...</Typography>
      </StaticPageLayout>
    );
  }

  return (
    <StaticPageLayout 
      title="プライバシーポリシー"
      subtitle="個人情報保護方針"
      lastUpdated={privacyData.lastUpdated}
      breadcrumbItems={[
        { label: 'サイト情報', path: '/about' }
      ]}
    >
      {/* バージョン情報とダウンロード */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`バージョン ${privacyData.version}`} 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label={`施行日: ${new Date(privacyData.effectiveDate).toLocaleDateString('ja-JP')}`}
            color="info"
            variant="outlined"
          />
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPrivacy}
          size="small"
        >
          テキスト版をダウンロード
        </Button>
      </Box>

      {/* 重要な権利の概要 */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          <PrivacyTipIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          あなたの権利
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><PersonAddIcon color="primary" /></ListItemIcon>
            <ListItemText primary="アクセス権" secondary="あなたの個人情報の開示を求めることができます" />
          </ListItem>
          <ListItem>
            <ListItemIcon><SettingsIcon color="primary" /></ListItemIcon>
            <ListItemText primary="訂正・削除権" secondary="個人情報の訂正や削除を求めることができます" />
          </ListItem>
          <ListItem>
            <ListItemIcon><SecurityIcon color="primary" /></ListItemIcon>
            <ListItemText primary="利用停止権" secondary="個人情報の利用停止を求めることができます" />
          </ListItem>
          <ListItem>
            <ListItemIcon><EmailIcon color="primary" /></ListItemIcon>
            <ListItemText primary="お問い合わせ" secondary="privacy@novelcrest.com または お問い合わせフォーム" />
          </ListItem>
        </List>
      </Paper>

      {/* 重要事項の注意書き */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>重要:</strong> 当サービスは、ユーザーの個人情報を適切に保護し、
          透明性を持って取り扱います。ご不明な点がございましたらお気軽にお問い合わせください。
        </Typography>
      </Alert>

      {/* プライバシーポリシーの各セクション */}
      <Box sx={{ mb: 4 }}>
        {privacyData.sections.map((section) => (
          <Accordion 
            key={section.id}
            expanded={expanded === section.id || expanded === 'all'}
            onChange={handleAccordionChange(section.id)}
            sx={{ 
              mb: 1,
              '&:before': { display: 'none' },
              boxShadow: 1,
              borderRadius: 1,
              '&.Mui-expanded': {
                boxShadow: 2
              }
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: '4px 4px 0 0',
                '&.Mui-expanded': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PrivacyTipIcon color="primary" fontSize="small" />
                <Typography variant="h6" fontWeight="bold">
                  {section.title}
                </Typography>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails sx={{ pt: 2 }}>
              {section.content.map((paragraph, pIndex) => {
                // マークダウン風の太字対応
                const isBold = paragraph.includes('**');
                const cleanParagraph = paragraph.replace(/\*\*/g, '');
                
                return (
                  <Typography 
                    key={pIndex}
                    variant="body1" 
                    paragraph={pIndex < section.content.length - 1}
                    sx={{ 
                      lineHeight: 1.7,
                      mb: paragraph.startsWith('（') ? 0.5 : 1.5,
                      fontWeight: isBold ? 'bold' : 'normal',
                      color: isBold ? 'primary.main' : 'text.primary'
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

      {/* 全て展開/折りたたみボタン */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setExpanded(expanded === 'all' ? false : 'all')}
          color="secondary"
        >
          {expanded === 'all' ? 'すべて折りたたむ' : 'すべて展開する'}
        </Button>
      </Box>

      {/* クイックアクセス */}
      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          クイックアクセス
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" href="/contact" size="small">
            お問い合わせ
          </Button>
          <Button variant="outlined" href="/mypage/settings" size="small">
            プライバシー設定
          </Button>
          <Button variant="outlined" href="/mypage/data" size="small">
            データの確認
          </Button>
        </Box>
      </Paper>

      {/* フッター情報 */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>お問い合わせ:</strong> プライバシーに関するご質問は、
          <a href="mailto:privacy@novelcrest.com" style={{ color: 'inherit', fontWeight: 'bold' }}>
            privacy@novelcrest.com
          </a> または
          <a href="/contact" style={{ color: 'inherit', fontWeight: 'bold' }}>お問い合わせフォーム</a>
          からお気軽にご連絡ください。
        </Typography>
      </Alert>
    </StaticPageLayout>
  );
};

export default PrivacyPage;