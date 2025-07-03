// src/pages/info/FAQPage.js
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
  QuestionAnswer as QuestionAnswerIcon,
  SmartToy as SmartToyIcon,
  Create as CreateIcon,
  Security as SecurityIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import StaticPageLayout from '../../components/layout/StaticPageLayout';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const categories = [
    { id: 'all', label: 'すべて', color: 'default' },
    { id: 'ai', label: 'AI使用について', color: 'primary' },
    { id: 'account', label: 'アカウント・年齢確認', color: 'secondary' },
    { id: 'writing', label: '執筆・投稿', color: 'info' },
    { id: 'content', label: 'コンテンツ・表現', color: 'success' },
    { id: 'community', label: 'コミュニティ・Discord', color: 'warning' },
    { id: 'legal', label: '法的事項・規約', color: 'error' },
    { id: 'technical', label: '技術的な問題', color: 'info' }
  ];

  const faqs = [
    // AI使用について
    {
      id: 1,
      category: 'ai',
      question: 'AI使用が必須とは具体的にどういうことですか？',
      answer: 'すみわけでは、投稿するすべての作品においてAI技術の使用が必須となります。一文字・一文章でもAIを使用していれば要件を満たします。全文AI生成から部分的な使用（校正、アイデア出し、文章の一部生成など）まで、すべて許可されています。投稿時には使用したAIツール・サービス名と使用方法の説明を明記していただきます。',
      tags: ['AI必須', 'AI生成', '投稿要件', 'AIツール']
    },
    {
      id: 2,
      category: 'ai',
      question: 'どのようなAIツールが使用できますか？',
      answer: 'ChatGPT、Claude、Gemini、ローカルLLM等、様々なAIサービスが使用可能です。ただし、各AIサービスの利用規約を必ず確認し、遵守する責任があります。年齢制限や商用利用規約、禁止コンテンツ規定などをクリアしている必要があります。AIサービスの利用規約違反による問題について、当団体は一切責任を負いませんので、ご注意ください。',
      tags: ['ChatGPT', 'Claude', 'Gemini', 'AIサービス', '利用規約']
    },
    {
      id: 3,
      category: 'ai',
      question: 'AI使用の証明はどのように行えばよいですか？',
      answer: '投稿時に以下の情報を明記してください：1) 使用したAIツール・サービス名、2) AIの使用部分の概要説明、3) 証明URL（任意）。詳細な会話ログの提出は不要ですが、どの部分でどのようにAIを活用したかを説明していただきます。人間による創作的寄与（具体的な指示、編集、選択等）により著作権が発生します。',
      tags: ['AI証明', '使用説明', '証明URL', '著作権']
    },
    
    // アカウント・年齢確認
    {
      id: 4,
      category: 'account',
      question: 'アカウント登録に年齢制限はありますか？',
      answer: '13歳以上での利用を推奨しています。12歳以下の方は保護者の同意と監督下での利用が条件となります。13歳以上18歳未満の方は保護者の同意があることを前提とします。18歳未満のユーザーはR18作品のタイトルと説明文のみ閲覧可能で、本文は閲覧できません。虚偽の生年月日登録は規約違反となり、アカウント停止の対象となります。',
      tags: ['年齢制限', '13歳以上', '保護者同意', 'R18制限']
    },
    {
      id: 5,
      category: 'account',
      question: 'アカウントの譲渡や複数アカウントの作成は可能ですか？',
      answer: 'アカウントの譲渡・貸与・売買は一切禁止されています。また、他者になりすましてのアカウント作成・利用も禁止です。意図的な虚偽情報による登録も規約違反となります。これらの行為が発覚した場合、事前通告なくアカウントを停止・削除することがあります。',
      tags: ['アカウント譲渡禁止', '複数アカウント', 'なりすまし', '虚偽登録']
    },
    
    // 執筆・投稿
    {
      id: 6,
      category: 'writing',
      question: '小説の投稿に文字数制限はありますか？',
      answer: '1投稿あたり最大7万文字まで投稿可能です。投稿数制限はなく、無制限に投稿できます。文字による創作の最大限の自由を保障しており、小説、詩、脚本、論文、日記、手紙等あらゆる文字表現が可能です。日本語以外の言語での創作も許可されています。',
      tags: ['文字数制限', '7万文字', '無制限投稿', '多言語対応']
    },
    {
      id: 7,
      category: 'writing',
      question: 'ブログ的な利用は可能ですか？',
      answer: 'はい、小説投稿機能をブログ的に使用することを明確に許可しています。日記・エッセイ形式、創作ノート、AI協働記録、読書感想・レビュー、学習記録、旅行記・体験談など、様々な用途で使用可能です。ただし、全ての投稿においてAI使用は必須です。',
      tags: ['ブログ利用', '日記', 'エッセイ', 'AI協働記録', '学習記録']
    },
    {
      id: 8,
      category: 'writing',
      question: '二次創作作品は投稿できますか？',
      answer: '二次創作作品の投稿は可能ですが、投稿時に必ず「二次創作」項目にチェックを入れる必要があります。二次創作に関する法的問題について当団体は一切責任を負いません。二次創作の適法性はユーザーが自己判断・自己責任で行うものとし、権利者からの申立てがあった場合は速やかに対応・削除いたします。',
      tags: ['二次創作', '二次創作チェック', '自己責任', '権利者申立て']
    },
    
    // コンテンツ・表現
    {
      id: 9,
      category: 'content',
      question: 'どの程度まで過激な表現が許可されますか？',
      answer: '本サービスは法的規制範囲内で過激な表現を許可するプラットフォームです。フィクション作品の内容については、現行法に照らし制限を設けません。暴力的な描写、性的な描写、反社会的な行為の描写、グロテスクな表現も、実在人物への害がない限り制限しません。ただし、具体的な犯罪予告や犯罪手法の詳細な教示、脅迫・恐喝は禁止です。',
      tags: ['過激な表現', 'フィクション', '暴力描写', '性的描写', '法的規制']
    },
    {
      id: 10,
      category: 'content',
      question: 'R18コンテンツの投稿ルールは？',
      answer: 'R18コンテンツを投稿する場合、必ず適切にタグ付けしてください。R18イラスト（挿絵）については、性器・陰毛の描写には適切なモザイク処理が必須です。性器及び陰毛部分が判別不可能となる程度の処理が必要です。18歳未満のユーザーはタイトル・あらすじのみ閲覧可能で、本文は閲覧できません。',
      tags: ['R18', 'モザイク処理', '年齢制限', 'タグ付け']
    },
    
    // コミュニティ・Discord
    {
      id: 11,
      category: 'community',
      question: 'Discordでのサポートはどのように受けられますか？',
      answer: '本サービスのお問い合わせ、権利侵害通報、システム障害報告はすべてDiscord経由で行います。Discord内に専用チャンネルが設置されており、サーバー招待リンクまたは直接DMでご連絡いただけます。重大な権利侵害・法令違反、システム障害、法的文書の送達（後日郵送での正式送達要）に対応しています。',
      tags: ['Discord', 'サポート', '専用チャンネル', '権利侵害通報']
    },
    {
      id: 12,
      category: 'community',
      question: '政治的・宗教的な内容の投稿は禁止ですか？',
      answer: '特定の政党・候補者・政治思想の宣伝・支持活動、特定の宗教・宗派の布教・勧誘活動は禁止です。ただし、個人の日記・エッセイ的な範囲での政治・宗教に関する感想・体験談、フィクション作品内での政治・宗教的要素の描写、客観的な研究・分析目的での記述は除外されます。',
      tags: ['政治活動禁止', '宗教活動禁止', '個人的感想', 'フィクション描写']
    },
    
    // 法的事項・規約
    {
      id: 13,
      category: 'legal',
      question: '投稿作品の著作権はどうなりますか？',
      answer: '投稿作品の著作権は100%投稿者（作者）に帰属します。独占契約は一切締結せず、著作者人格権の放棄も求めません。投稿者が自身の作品を商業利用することは自由で、本サービス外での出版・映像化も制限しません。当団体は投稿作品を商業利用しません。AIとの協働創作における作者の権利も完全に保護されます。',
      tags: ['著作権', '100%作者帰属', '商業利用自由', '独占契約なし']
    },
    {
      id: 14,
      category: 'legal',
      question: 'サービス終了時のデータ保護はどうなりますか？',
      answer: 'サービス終了時は、ユーザーが自身の投稿作品をPDF形式で一括ダウンロードできる機能を提供します。通常終了の場合は最低3ヶ月前、緊急終了の場合は最短7日間の事前通知を行います。終了通知から終了まではダウンロード期間として設定され、各自でのデータダウンロード・保存が必要です。サービス終了後のデータ保存義務はありません。',
      tags: ['サービス終了', 'PDF一括ダウンロード', '3ヶ月前通知', 'データ保存']
    },
    
    // 技術的な問題
    {
      id: 15,
      category: 'technical',
      question: 'DDoS攻撃などの妨害行為への対応は？',
      answer: 'DDoS攻撃、サーバーへの過度な負荷、不正アクセス、ハッキング行為は厳格に禁止されています。これらの行為を行った者に対しては、即時アカウント永久削除（警告なし）、プロバイダへの通報、警察への被害届提出、民事・刑事法的措置の検討、損害賠償請求を行います。システムの正常な動作を妨害する行為は一切許可されません。',
      tags: ['DDoS攻撃禁止', '即時永久削除', '法的措置', '損害賠償']
    },
    {
      id: 16,
      category: 'technical',
      question: 'スマートフォンで小説を書くことはできますか？',
      answer: 'はい、可能です。すみわけはレスポンシブデザインに対応しており、スマートフォンやタブレットからでも投稿・編集が可能です。ただし、推奨ブラウザはChrome、Firefox、Safari、Edge（最新版）で、Internet Explorerや古いバージョンのブラウザは非対応です。JavaScriptとCookieが必須です。',
      tags: ['スマートフォン対応', 'レスポンシブ', '推奨ブラウザ', 'JavaScript必須']
    },
    {
      id: 17,
      category: 'technical',
      question: '画像の投稿に制限はありますか？',
      answer: '画像は1枚あたり最大10MBまで投稿可能です。R18イラストについては、性器・陰毛の描写には適切なモザイク処理が必須となります。性器及び陰毛部分が判別不可能となる程度の処理が必要です。全年齢向けイラストについては特に制限はありません。',
      tags: ['画像制限', '10MB', 'モザイク処理', 'R18イラスト']
    },
    
    // サービス固有
    {
      id: 18,
      category: 'writing',
      question: '公開設定はどのような種類がありますか？',
      answer: 'publicityStatus（公開設定）により、作品の公開範囲を設定できます。プライベート設定の場合、作者以外はアクセスできません。また、allowComments設定によりコメントの許可・禁止を設定できます。投稿後も設定変更が可能です。',
      tags: ['公開設定', 'プライベート', 'コメント設定', '設定変更']
    },
    {
      id: 19,
      category: 'ai',
      question: 'AI生成コンテンツの著作権はどうなりますか？',
      answer: 'AI単体の生成物については著作権は発生しないとする政府見解に準拠しています。しかし、人間の創作的寄与（具体的な指示、編集、選択等）により著作権が発生します。AIとの協働創作における全体作品は作者の完全な所有物として扱われ、作者が利用・改変・商用利用する権利を保持します。',
      tags: ['AI著作権', '政府見解', '創作的寄与', '商用利用権']
    },
    {
      id: 20,
      category: 'legal',
      question: '海外からの利用は可能ですか？',
      answer: '特に制限は設けていませんが、各国の法令遵守はユーザー責任となります。日本語以外での投稿も許可されていますが、サポートは日本語のみです。法的準拠は日本国法が適用され、東京地方裁判所が管轄となります。他言語投稿の内容についてはユーザーが全責任を負います。',
      tags: ['海外利用', '多言語投稿', '日本法適用', '東京地裁管轄']
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
      subtitle="すみわけに関するよくある質問と回答"
      breadcrumbItems={[
        { label: 'サイト情報', path: '/about' }
      ]}
    >
      {/* サービス特性の注意書き */}
      <Alert severity="warning" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>重要:</strong> すみわけは<strong>AI使用必須</strong>の小説投稿プラットフォームです。
          法的規制範囲内で過激な表現を許可するサービスの性格をご理解の上、ご利用ください。
        </Typography>
      </Alert>

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
            検索キーワードを変更するか、<strong>Discord経由</strong>でお問い合わせください。
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
                すみわけのサポートはDiscord経由で行っています。
                お問い合わせ、権利侵害通報、システム障害報告など、
                お気軽にDiscord内の専用チャンネルまたは直接DMでご連絡ください。
              </Typography>
              <Button variant="contained" href="/contact" fullWidth>
                Discord でお問い合わせ
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                <HelpOutlineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                関連情報
              </Typography>
              <Typography variant="body2" paragraph>
                利用規約やプライバシーポリシーも併せてご確認ください。
                すみわけの特殊な性格についても詳細に記載されています。
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" href="/terms" size="small">
                  利用規約
                </Button>
                <Button variant="outlined" href="/privacy" size="small">
                  プライバシーポリシー
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI使用についての特別案内 */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <SmartToyIcon color="info" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" color="info.dark" gutterBottom>
              AI使用に関する重要な注意
            </Typography>
            <Typography variant="body2" color="info.dark">
              すみわけは全投稿作品でAI使用が必須のプラットフォームです。
              各AIサービスの利用規約を必ず確認し、遵守してください。
              AI使用に関する問題について当団体は責任を負いませんので、自己責任でご利用ください。
            </Typography>
          </Box>
        </Box>
      </Paper>
    </StaticPageLayout>
  );
};

export default FAQPage;