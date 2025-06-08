// middlewares/upload.js
const multer = require('multer');
const path = require('path');

// 保存先のディレクトリとファイル名の設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;