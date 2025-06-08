// routes/contests.js
const express = require('express');
const multer = require('multer');
const Contest = require('../models/Contest');
const Post = require('../models/Post');

const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();
const path = require('path');
const mongoosed = require('mongoose');


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

router.post('/:id/enter', authenticateToken, async (req, res) => {
    try {
      const { id: contestId } = req.params;
      const { postId } = req.body;
      const userId = req.user._id;
  
      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ message: 'コンテストが見つかりませんでした。' });
  
      const alreadyEntered = contest.entries.some(entry => entry.userId.toString() === userId.toString());
      if (alreadyEntered) return res.status(400).json({ message: '既に応募済みです。' });
  
      if (contest.entries.length >= contest.maxEntries) {
        return res.status(400).json({ message: '応募数が上限に達しました。' });
      }
  
      contest.entries.push({ postId, userId });
      await contest.save();
  
      res.status(200).json({ message: '応募が完了しました。' });
    } catch (error) {
      console.error('Error entering contest:', error);
      res.status(500).json({ message: '応募に失敗しました。', error });
    }
  });

// コンテスト応募削除エンドポイント
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
  
      contest.entries.splice(entryIndex, 1); // エントリーを削除
      await contest.save();
  
      res.status(200).json({ message: 'エントリーが削除されました。' });
    } catch (error) {
      console.error('Error deleting contest entry:', error);
      res.status(500).json({ message: 'コンテストエントリーの削除に失敗しました。', error: error.message });
    }
  });
// コンテスト応募エンドポイント
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const contestId = req.params.id; // URLからコンテストIDを取得
    const {selectedPostId} = req.body; // リクエストボディからpostIdを取得
    const userId = req.user._id; // 認証されたユーザーID

    // postId の形式を検証
    if (!selectedPostId || !mongoosed.isValidObjectId(selectedPostId)) {
      return res.status(400).json({ message: '無効な作品IDが提供されました。' });
    }

    // コンテストを取得
    const contest = await Contest.findById(contestId);
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

    console.log("Post ID from DB:", post._id);

    // 既に応募されている場合はエラーを返す
    const alreadyApplied = contest.entries.some(entry =>
      entry.postId.toString() === selectedPostId // 文字列形式で比較
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'この作品は既に応募されています。' });
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

    res.status(200).json({ message: '応募が完了しました。', contest });
  } catch (error) {
    console.error('Error applying to contest:', error);
    res.status(500).json({ message: 'コンテスト応募に失敗しました。', error: error.message });
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
        select: 'title description author series tags viewCounter goodCounter bookShelfCounter wordCount isAdultContent isAI isOriginal aiEvidence',
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
        status
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

      await contest.save();

      res.status(200).json({ message: 'コンテストが更新されました。', contest });
    } catch (error) {
      console.error('Error updating contest:', error);
      res.status(500).json({ message: 'コンテストの更新に失敗しました。', error: error.message });
    }
  });
  module.exports = router;
