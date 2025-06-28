// src/pages/TermsPage.js
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Alert,
  Chip,
  Button
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Gavel as GavelIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

// 利用規約データをインポート（実際の実装では動的読み込み）
const TERMS_DATA = {
  "version": "1.0.0",
  "effectiveDate": "2025-01-01",
  "lastUpdated": "2025-01-01",
  "sections": [
    {
      "id": "application",
      "title": "第1条（利用規約の適用）",
      "content": [
        "この利用規約（以下「本規約」といいます）は、NovelCrest（以下「当サービス」といいます）の利用に関する条件を定めるものです。",
        "ユーザーは、本規約に同意の上、当サービスを利用するものとします。",
        "本規約は、ユーザーが当サービスを利用することにより効力を生じます。"
      ]
    },
    {
      "id": "user-registration",
      "title": "第2条（ユーザー登録）",
      "content": [
        "ユーザーは、当サービスを利用するにあたり、真実、正確かつ完全な情報を提供しなければなりません。",
        "当サービスは、ユーザーが以下の各号のいずれかに該当すると判断した場合、ユーザー登録を拒否することがあります。",
        "（1）虚偽の情報を提供した場合",
        "（2）過去に本規約に違反したことがある場合", 
        "（3）反社会的勢力等に関係すると当サービスが判断した場合",
        "（4）その他当サービスがユーザー登録を不適当と判断した場合"
      ]
    },
    {
      "id": "prohibited-acts",
      "title": "第4条（禁止事項）",
      "content": [
        "ユーザーは、当サービスの利用にあたり、以下の行為を行ってはなりません。",
        "（1）法令または公序良俗に違反する行為",
        "（2）犯罪行為に関連する行為",
        "（3）当サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為",
        "（4）当サービスの運営を妨害するおそれのある行為",
        "（5）他のユーザーに関する個人情報等を収集または蓄積する行為",
        "（6）他のユーザーに成りすます行為",
        "（7）著作権、商標権その他の知的財産権を侵害する行為",
        "（8）過度に暴力的または残虐な表現を含む投稿",
        "（9）わいせつな表現を含む投稿（ただし、適切にタグ付けされた成人向けコンテンツを除く）",
        "（10）薬物の不適切な利用を推奨する表現を含む投稿",
        "（11）反社会的勢力に対して直接または間接に利益を供与する行為",
        "（12）宗教活動または政治活動に関する投稿",
        "（13）当サービスに掲載されている情報を営利目的で利用する行為",
        "（14）その他、当サービスが不適切と判断する行為"
      ]
    }
  ]
};

const TermsPage = () => {
  const [termsData, setTermsData] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // 実際の実装では、APIまたはJSONファイルから動的に読み込み
    setTermsData(TERMS_DATA);
  }, []);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleDownloadTerms = () => {
    // PDF生成またはテキストファイルダウンロード機能
    const content = termsData.sections.map(section => 
      `${section.title}\n${section.content.join('\n')}\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NovelCrest_利用規約_v${termsData.version}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!termsData) {
    return (
      <StaticPageLayout title="利用規約" subtitle="読み込み中...">
        <Typography>利用規約を読み込んでいます...</Typography>
      </StaticPageLayout>
    );
  }

  return (
    <StaticPageLayout 
      title="利用規約"
      subtitle="NovelCrestサービス利用規約"
      lastUpdated={termsData.lastUpdated}
      breadcrumbItems={[
        { label: 'サイト情報', path: '/about' }
      ]}
    >
      {/* バージョン情報とダウンロード */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            label={`バージョン ${termsData.version}`} 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label={`施行日: ${new Date(termsData.effectiveDate).toLocaleDateString('ja-JP')}`}
            color="info"
            variant="outlined"
          />
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadTerms}
          size="small"
        >
          テキスト版をダウンロード
        </Button>
      </Box>

      {/* 重要事項の注意書き */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>重要:</strong> 本利用規約は、NovelCrestサービスを利用するすべてのユーザーに適用されます。
          サービスを利用する前に、必ずすべての条項をお読みください。
        </Typography>
      </Alert>

      {/* 利用規約の各セクション */}
      <Box sx={{ mb: 4 }}>
        {termsData.sections.map((section, index) => (
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
                <GavelIcon color="primary" fontSize="small" />
                <Typography variant="h6" fontWeight="bold">
                  {section.title}
                </Typography>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails sx={{ pt: 2 }}>
              {section.content.map((paragraph, pIndex) => (
                <Typography 
                  key={pIndex}
                  variant="body1" 
                  paragraph={pIndex < section.content.length - 1}
                  sx={{ 
                    lineHeight: 1.7,
                    mb: paragraph.startsWith('（') ? 0.5 : 1.5 
                  }}
                >
                  {paragraph}
                </Typography>
              ))}
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

      {/* フッター情報 */}
      <Alert severity="warning" sx={{ mt: 4 }}>
        <Typography variant="body2">
          本利用規約についてご不明な点がございましたら、
          <a href="/contact" style={{ color: 'inherit', fontWeight: 'bold' }}>お問い合わせページ</a>
          よりお気軽にお問い合わせください。
        </Typography>
      </Alert>
    </StaticPageLayout>
  );
};

export default TermsPage;