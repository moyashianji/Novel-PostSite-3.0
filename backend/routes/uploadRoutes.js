const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const router = express.Router();

// アップロードディレクトリ
const UPLOADS_DIR = path.join(__dirname, '../uploads/contests');

// `uploads` ディレクトリがなければ作成
fs.ensureDirSync(UPLOADS_DIR);

// Multer 設定（ファイルの一時保存）
const storage = multer.memoryStorage();
const upload = multer({ storage });

// **画像アップロードエンドポイント**
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '画像ファイルがアップロードされていません' });
    }

    // WebP 形式に変換して保存
    const filename = `${Date.now()}.webp`;
    const filePath = path.join(UPLOADS_DIR, filename);

    await sharp(req.file.buffer)
      .resize(800) // 最大幅を 800px に調整（オプション）
      .webp({ quality: 80 }) // 圧縮率 80%
      .toFile(filePath);

    // アップロードされた画像の URL を返す
    const imageUrl = `/uploads/contests/${filename}`;
    res.json({ imageUrl });

  } catch (error) {
    console.error('画像アップロードエラー:', error);
    res.status(500).json({ error: '画像の処理に失敗しました' });
  }
});

module.exports = router;
