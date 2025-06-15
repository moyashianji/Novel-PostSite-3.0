// routes/contests.js
const express = require('express');
const multer = require('multer');
const Contest = require('../models/Contest');
const Post = require('../models/Post');

const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose'); // 🔧 mongoosed → mongoose


// Multerで画像アップロードの設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/contests'); // 保存先ディレクトリ
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });

router.post('/create', authenticateToken, upload.fields([{ name: 'iconImage' }, { name: 'headerImage' }]), async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      description,
      applicationStartDate,
      applicationEndDate,
      reviewStartDate,
      reviewEndDate,
      resultAnnouncementDate,
      enableJudges,
      judges,
      allowFinishedWorks,
      allowPreStartDate,
      restrictAI,
      aiTags,
      allowR18,
      restrictGenres,
      genres,
      restrictWordCount,
      minWordCount,
      maxWordCount,
      allowSeries,
      minEntries,
      maxEntries,
      status,
      contestTags // 🆕 追加
    } = req.body;
    // ✅ `Date` に変換できる場合は `Date` として保存、それ以外は `String`
    const parseDateOrString = (value) => {
      return !isNaN(Date.parse(value)) ? new Date(value) : value;
    };
    console.log("test")

        // 画像のパスを設定
        const iconImage = req.files['iconImage'] ? `/uploads/contests/${req.files['iconImage'][0].filename}` : '';
        const headerImage = req.files['headerImage'] ? `/uploads/contests/${req.files['headerImage'][0].filename}` : '';
    // judges をパースして `position` が必須フィールドになっていることを確認
    let parsedJudges = [];
    if (judges) {
      parsedJudges = JSON.parse(judges).map(judge => ({
        userId: judge.id,
        sns: judge.sns,
      }));
    }
        
    // 新しいコンテストを作成
    const newContest = new Contest({
      title: title,
      shortDescription: shortDescription,
      description: description,
      iconImage: iconImage,
      headerImage: headerImage,
      applicationStartDate: parseDateOrString(applicationStartDate),
      applicationEndDate: parseDateOrString(applicationEndDate),
      reviewStartDate: reviewStartDate ? parseDateOrString(reviewStartDate) : null,
      reviewEndDate: reviewEndDate ? parseDateOrString(reviewEndDate) : null,
      resultAnnouncementDate: resultAnnouncementDate ? parseDateOrString(resultAnnouncementDate) : null,
      enableJudges: enableJudges === 'true', // Boolean に変換
      judges: judges ? parsedJudges : [],
      allowFinishedWorks: allowFinishedWorks === 'true',
      allowPreStartDate: allowPreStartDate === 'true',
      restrictAI: restrictAI === 'true',
      aiTags: aiTags ? JSON.parse(aiTags) : [],
      allowR18: allowR18 === 'true',
      restrictGenres: restrictGenres === 'true',
      genres: genres ? JSON.parse(genres) : [],
      restrictWordCount: restrictWordCount === 'true',
      minWordCount: parseInt(minWordCount, 10) || 0,
      maxWordCount: parseInt(maxWordCount, 10) || 0,
      allowSeries: allowSeries === 'true',
      minEntries: parseInt(minEntries, 10) || 0,
      maxEntries: parseInt(maxEntries, 10) || Infinity,
      creator: req.user._id, // 認証されたユーザーを主催者として設定
      status: status,
      contestTags: contestTags ? JSON.parse(contestTags) : [], // 🆕 追加

    });
    console.log("testtt")

    // 保存
    await newContest.save();

    res.status(201).json({ message: 'コンテストが作成されました。', contest: newContest });
  } catch (error) {
    console.error('Error creating contest:', error);
    res.status(500).json({ message: 'コンテストの作成に失敗しました。', error });
  }
});

// コンテスト応募エンドポイント - タグ追加機能付き
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    console.log("aaaa")
    const contestId = req.params.id; // URLからコンテストIDを取得
    const {selectedPostId} = req.body; // リクエストボディからpostIdを取得
    const userId = req.user._id; // 認証されたユーザーID
    // postId の形式を検証
    if (!selectedPostId || !mongoose.isValidObjectId(selectedPostId)) { // 🔧 mongoosed → mongoose
      return res.status(400).json({ message: '無効な作品IDが提供されました。' });
    }

    // コンテストを取得
    const contest = await Contest.findById(contestId);
    console.log(contest.contestTags)

    if (!contest) {
      return res.status(404).json({ message: 'コンテストが見つかりませんでした。' });
    }
    
    // **ステータスが「募集中」以外なら応募不可**
    if (contest.status !== '募集中') {
      return res.status(400).json({ message: '現在、このコンテストには応募できません。' });
    }
    
    // 作品を取得
    const post = await Post.findById(selectedPostId);
    if (!post) {
      return res.status(404).json({ message: '作品が見つかりませんでした。' });
    }

    // 🆕 contestTagsフィールドが存在しない場合は初期化
    if (!post.contestTags) {
      post.contestTags = [];
      console.log(`🔧 作品 ${selectedPostId} にcontestTagsフィールドを初期化しました`);
    }

    console.log("Post ID from DB:", post._id);
    console.log("Current contestTags:", post.contestTags);

    // 既に応募されている場合はエラーを返す
    const alreadyApplied = contest.entries.some(entry =>
      entry.postId.toString() === selectedPostId // 文字列形式で比較
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'この作品は既に応募されています。' });
    }

    // 🆕 作品にコンテストタグを追加（Elasticsearchにも自動反映）
    let addedTags = [];
    if (contest.contestTags && contest.contestTags.length > 0) {
      // 既存のコンテストタグと重複しないようにフィルタリング
      const newContestTags = contest.contestTags.filter(tag => 
        !post.contestTags.includes(tag)
      );
      
      if (newContestTags.length > 0) {
        // 作品にコンテストタグを追加
        post.contestTags = [...post.contestTags, ...newContestTags];
        
        // 🚀 save()により、Postモデルのpost('save')フックが自動実行され、
        // Elasticsearchにも自動的にcontestTagsが更新される
        await post.save();
        
        addedTags = newContestTags;
        console.log(`✅ 作品 ${selectedPostId} にコンテストタグを追加しました:`, newContestTags);
        console.log(`🔍 Elasticsearchへの自動同期: Post.save()により自動実行されました`);
      }
    }

    // 応募エントリを作成
    const entry = {
        postId: selectedPostId, // postId を ObjectId にキャスト
        userId: userId, // userId を ObjectId にキャスト
    };
    
    // entries フィールドに応募を追加
    contest.entries.push(entry);

    // コンテストを保存
    await contest.save();

    res.status(200).json({ 
      message: '応募が完了しました。', 
      contest,
      addedTags: addedTags, // 🆕 実際に追加されたタグ情報を返す
      elasticsearchUpdated: addedTags.length > 0 // 🆕 ES更新状況を返す
    });
  } catch (error) {
    console.error('Error applying to contest:', error);
    res.status(500).json({ message: 'コンテスト応募に失敗しました。', error: error.message });
  }
});
// コンテスト応募削除エンドポイント - contestTags自動削除機能付き
router.delete('/:id([0-9a-fA-F]{24})/entry/:entryId([0-9a-fA-F]{24})', authenticateToken, async (req, res) => {
    try {
      const contestId = req.params.id; // URLからコンテストIDを取得
      const entryId = req.params.entryId; // URLからエントリーIDを取得
      const userId = req.user._id; // 認証されたユーザーID
  
      console.log(`Contest ID: ${contestId}`);
      console.log(`Entry ID: ${entryId}`);
      console.log(`User ID: ${userId}`);
  
      // コンテストを取得
      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ message: 'コンテストが見つかりませんでした。' });
      }
  
      // エントリーを見つけて削除
      const entryIndex = contest.entries.findIndex(entry => 
        entry.postId.toString() === entryId && entry.userId.toString() === userId.toString()
      );
  
      if (entryIndex === -1) {
        return res.status(404).json({ message: 'エントリーが見つかりませんでした。' });
      }

      // 🆕 作品からコンテストタグを削除
      const post = await Post.findById(entryId);
      if (post && contest.contestTags && contest.contestTags.length > 0) {
        console.log('🏷️ 応募取り消し前のcontestTags:', post.contestTags);
        
        // このコンテストのタグを作品から削除
        const updatedContestTags = post.contestTags.filter(tag => 
          !contest.contestTags.includes(tag)
        );
        
        if (updatedContestTags.length !== post.contestTags.length) {
          post.contestTags = updatedContestTags;
          
          // 🚀 save()により、Postモデルのpost('save')フックが自動実行され、
          // Elasticsearchにも自動的にcontestTagsが更新される
          await post.save();
          
          const removedTags = contest.contestTags.filter(tag => 
            post.contestTags.includes(tag) === false
          );
          
          console.log(`✅ 作品 ${entryId} からコンテストタグを削除しました:`, removedTags);
          console.log('🏷️ 応募取り消し後のcontestTags:', post.contestTags);
          console.log(`🔍 Elasticsearchへの自動同期: Post.save()により自動実行されました`);
        } else {
          console.log('ℹ️ 削除するコンテストタグはありませんでした');
        }
      } else {
        console.log('ℹ️ 作品が見つからないか、コンテストにタグが設定されていません');
      }
  
      // コンテストエントリを削除
      contest.entries.splice(entryIndex, 1);
      await contest.save();
  
      res.status(200).json({ 
        message: 'エントリーが削除されました。',
        removedFromContestTags: contest.contestTags || [] // 🆕 削除されたタグ情報を返す
      });
    } catch (error) {
      console.error('Error deleting contest entry:', error);
      res.status(500).json({ message: 'コンテストエントリーの削除に失敗しました。', error: error.message });
    }
  });



  router.get('/:id', async (req, res) => {
    try {
      const contest = await Contest.findById(req.params.id)
      .populate({
        path: 'judges.userId', // ✅ `userId` を `User` として `populate`
        select: 'nickname icon ', // ✅ `nickname` と `icon` のみ取得
      })
      .populate({
        path: 'entries.postId',
        select: 'title description author series tags contestTags viewCounter goodCounter bookShelfCounter wordCount isAdultContent isAI isOriginal aiEvidence', // 🆕 contestTags 追加
        populate: [
          {
          path: 'author',
          select: 'nickname icon', // 必要なフィールドのみ取得
        },
        {
          path: 'series',
          select: 'title _id'
        }
        ]
      });
      if (!contest) {
        return res.status(404).json({ message: 'コンテストが見つかりませんでした。' });
      }
      res.status(200).json(contest);
    } catch (error) {
      console.error('Error fetching contest details:', error);
      res.status(500).json({ message: 'コンテスト詳細の取得に失敗しました。', error });
    }
  });

  router.get('/', async (req, res) => {
    try {
      // 「募集中」「開催予定」「募集終了」「募集一時停止」のコンテストを取得
      const contests = await Contest.find({ status: { $in: ['募集中', '開催予定', '募集終了', '募集一時停止中'] } });

      res.status(200).json(contests);
    } catch (error) {
      console.error('Error fetching contests:', error);
      res.status(500).json({ message: 'コンテスト一覧の取得に失敗しました。', error });
    }
  });

  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await Contest.findByIdAndDelete(id);
      res.status(200).json({ message: 'コンテストが削除されました。' });
    } catch (error) {
      console.error('Error deleting contest:', error);
      res.status(500).json({ message: 'コンテストの削除に失敗しました。', error });
    }
  });
  
// コンテスト編集エンドポイント - タグ機能付き
  router.put('/:id', authenticateToken, upload.fields([{ name: 'iconImage' }, { name: 'headerImage' }]), async (req, res) => {
    try {
      const { 
        title, 
        shortDescription, 
        description, 
        applicationStartDate,
        applicationEndDate,
        reviewStartDate,
        reviewEndDate,
        resultAnnouncementDate,
        enableJudges,
        judges,
        allowFinishedWorks,
        allowPreStartDate,
        restrictAI,
        aiTags,
        allowR18,
        restrictGenres,
        genres,
        restrictWordCount,
        minWordCount,
        maxWordCount,
        allowSeries,
        minEntries,
        maxEntries,
        status,
        contestTags // 🆕 追加
      } = req.body;

      // ✅ `Date` に変換できる場合は `Date` として保存、それ以外は `String`
      const parseDateOrString = (value) => {
        return !isNaN(Date.parse(value)) ? new Date(value) : value;
      };

      const contest = await Contest.findById(req.params.id);
      if (!contest) {
        return res.status(404).json({ message: 'コンテストが見つかりませんでした。' });
      }

      // **コンテスト作成者のみ編集可能**
      if (contest.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'このコンテストを編集する権限がありません。' });
      }

      // 画像のパスを設定
      const iconImage = req.files['iconImage'] ? `/uploads/contests/${req.files['iconImage'][0].filename}` : contest.iconImage;
      const headerImage = req.files['headerImage'] ? `/uploads/contests/${req.files['headerImage'][0].filename}` : contest.headerImage;

      // judges をパースして `position` が必須フィールドになっていることを確認
      let parsedJudges = [];
      if (judges) {
        parsedJudges = JSON.parse(judges).map(judge => ({
          userId: judge.id,
          sns: judge.sns,
        }));
      }
      console.log(title)
      console.log(shortDescription)
      console.log(description)

      contest.title = title;
      contest.shortDescription = shortDescription;
      contest.description = description;
      contest.iconImage = iconImage;
      contest.headerImage = headerImage;
      contest.applicationStartDate = parseDateOrString(applicationStartDate);
      contest.applicationEndDate = parseDateOrString(applicationEndDate);
      contest.reviewStartDate = reviewStartDate ? parseDateOrString(reviewStartDate) : null;
      contest.reviewEndDate = reviewEndDate ? parseDateOrString(reviewEndDate) : null;
      contest.resultAnnouncementDate = resultAnnouncementDate ? parseDateOrString(resultAnnouncementDate) : null;
      contest.enableJudges = enableJudges === 'true';
      contest.judges = judges ? parsedJudges : [];
      contest.allowFinishedWorks = allowFinishedWorks === 'true';
      contest.allowPreStartDate = allowPreStartDate === 'true';
      contest.restrictAI = restrictAI === 'true';
      contest.aiTags = aiTags ? JSON.parse(aiTags) : [];
      contest.allowR18 = allowR18 === 'true';
      contest.restrictGenres = restrictGenres === 'true';
      contest.genres = genres ? JSON.parse(genres) : [];
      contest.restrictWordCount = restrictWordCount === 'true';
      contest.minWordCount = parseInt(minWordCount, 10) || 0;
      contest.maxWordCount = parseInt(maxWordCount, 10) || 0;
      contest.allowSeries = allowSeries === 'true';
      contest.minEntries = parseInt(minEntries, 10) || 0;
      contest.maxEntries = parseInt(maxEntries, 10) || Infinity;
      contest.status = status;
      contest.contestTags = contestTags ? JSON.parse(contestTags) : []; // 🆕 追加

      await contest.save();

      res.status(200).json({ message: 'コンテストが更新されました。', contest });
    } catch (error) {
      console.error('Error updating contest:', error);
      res.status(500).json({ message: 'コンテストの更新に失敗しました。', error: error.message });
    }
  });

  router.get('/by-tag/:tag', async (req, res) => {
  try {
    const { tag } = req.params;
    
    if (!tag) {
      return res.status(400).json({ message: 'コンテストタグが指定されていません。' });
    }

    console.log(`[INFO] コンテストタグ検索: ${tag}`);

    // コンテストタグで完全一致検索
    const contests = await Contest.find({
      contestTags: { $in: [tag] }, // 指定されたタグを含むコンテストを検索
      status: { $in: ['募集中', '開催予定', '募集終了', '募集一時停止中'] } // アクティブなコンテストのみ
    })
    .populate({
      path: 'creator',
      select: 'nickname icon'
    })
    .populate({
      path: 'judges.userId',
      select: 'nickname icon'
    })
    .sort({ 
      // 募集中を最優先、次に開催予定、作成日時降順
      status: 1,
      createdAt: -1 
    })
    .lean();

    console.log(`[INFO] 見つかったコンテスト数: ${contests.length}`);

    if (contests.length === 0) {
      return res.status(404).json({ 
        message: `コンテストタグ「${tag}」に関連するコンテストが見つかりませんでした。` 
      });
    }

    // ステータス順でソート（募集中 > 開催予定 > その他）
    const statusPriority = {
      '募集中': 1,
      '開催予定': 2,
      '募集終了': 3,
      '募集一時停止中': 4
    };

    contests.sort((a, b) => {
      const aPriority = statusPriority[a.status] || 5;
      const bPriority = statusPriority[b.status] || 5;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // 同じステータスの場合は作成日時降順
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json(contests);
    
  } catch (error) {
    console.error('[ERROR] コンテストタグ検索エラー:', error);
    res.status(500).json({ 
      message: 'コンテスト検索中にエラーが発生しました。', 
      error: error.message 
    });
  }
});
  module.exports = router;