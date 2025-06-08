const morgan = require('morgan');
const winston = require('winston');

// Winston loggerの設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()  // ログをJSON形式で保存
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }), // エラーログ用
    new winston.transports.File({ filename: 'info.log' }),              // すべてのログ
  ],
});

// MorganのログをWinstonに渡すためのstream設定
const stream = {
  write: (message) => logger.info(message.trim()), // Morganのログをinfoレベルで保存
};

// Morganミドルウェアの設定をエクスポート
const morganMiddleware = morgan('combined', { stream });

module.exports = { logger, morganMiddleware };