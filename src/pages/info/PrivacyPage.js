// src/pages/info/PrivacyPage.js
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
  Divider
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  PrivacyTip as PrivacyTipIcon,
  Download as DownloadIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

// すみわけプライバシーポリシーデータ（txtファイルの内容を一文字も変更せずそのまま実装）
const SUMIWAKE_PRIVACY_DATA = {
  "version": "1.0.0",
  "effectiveDate": "2025-07-01",
  "lastUpdated": "2025-07-01",
  "sections": [
    {
      "id": "privacy-policy",
      "title": "プライバシーポリシー",
      "content": [
        "1. 個人情報の収集",
        "当団体は、以下の個人情報を収集します。",
        "(1) 氏名またはユーザー名",
        "(2) メールアドレス",
        "(3) 生年月日",
        "(4) 投稿履歴",
        "(5) 作品閲覧履歴",
        "",
        "2. 個人情報の利用目的",
        "収集した個人情報は以下の目的で利用します。",
        "(1) サービスの提供・運営",
        "(2) 年齢確認",
        "(3) 明確な法令違反行為の調査（道徳的・社会的問題は除く）",
        "(4) DDoS攻撃等の不正行為調査",
        "(6) サービスの改善",
        "(7) 重要なお知らせの送信",
        "",
        "3. 個人情報の第三者提供",
        "当団体は、以下の場合を除き、個人情報を第三者に提供しません。",
        "(1) ユーザーの同意がある場合",
        "(2) 法令に基づく開示要求がある場合",
        "",
        "4. 個人情報の安全管理",
        "当団体は、個人情報への不正アクセス、紛失、破損、改ざん、漏洩を防ぐため、適切な安全管理措置を講じます。",
        "",
        "5. Cookieの使用",
        "本サービスでは、サービス向上のためCookieを使用することがあります。ブラウザの設定によりCookieを無効にすることも可能です。",
        "",
        "6. プライバシーポリシーの変更",
        "本ポリシーは、法令の変更やサービスの変更に応じて更新されることがあります。"
      ]
    }
  ]
};

const PrivacyPage = () => {
  const [privacyData, setPrivacyData] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // すみわけプライバシーポリシーデータを設定
    setPrivacyData(SUMIWAKE_PRIVACY_DATA);
  }, []);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleDownloadPrivacy = () => {
    // オリジナルの形式でダウンロード
    const originalPrivacyContent = `すみわけプライバシーポリシー

${privacyData.sections.map(section => 
  `${section.title}
${section.content.join('\n')}`
).join('\n\n')}`;
    
    const blob = new Blob([originalPrivacyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `すみわけプライバシーポリシー_v${privacyData.version}.txt`;
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
      subtitle="すみわけプライバシーポリシー"
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

      {/* 重要事項の注意書き */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>重要:</strong> 当団体は、個人情報保護法に基づき、ユーザーの個人情報を適切に取り扱います。
          ご不明な点がございましたらお気軽にお問い合わせください。
        </Typography>
      </Alert>

      {/* プライバシーポリシーの各セクション */}
      <Box sx={{ mb: 4 }}>
        {privacyData.sections.map((section, index) => (
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
                // 空行の場合はスペースを追加
                if (paragraph === '') {
                  return <Box key={pIndex} sx={{ height: 16 }} />;
                }
                
                return (
                  <Typography 
                    key={pIndex}
                    variant="body1" 
                    paragraph={pIndex < section.content.length - 1}
                    sx={{ 
                      lineHeight: 1.7,
                      mb: paragraph.startsWith('（') || paragraph.startsWith('(') ? 0.5 : 1.5,
                      fontWeight: paragraph.includes('重要：') || paragraph.includes('注意：') ? 'bold' : 'normal',
                      color: paragraph.includes('重要：') ? 'error.main' : 'text.primary'
                    }}
                  >
                    {paragraph}
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




    </StaticPageLayout>
  );
};

export default PrivacyPage;