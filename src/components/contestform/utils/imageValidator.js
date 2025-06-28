// utils/imageValidator.js (改善版)
export const IMAGE_LIMITS = {
  ICON_MAX_SIZE: 3 * 1024 * 1024, // 3MBに削減
  HEADER_MAX_SIZE: 5 * 1024 * 1024, // 5MBに削減
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  MAX_WIDTH: 1920, // 最大幅を削減
  MAX_HEIGHT: 1920, // 最大高さを削減
  // プレビュー用の制限
  PREVIEW_MAX_WIDTH: 800,
  PREVIEW_MAX_HEIGHT: 600,
  PREVIEW_QUALITY: 0.7
};

export const validateImageFile = (file, type = 'icon') => {
  const errors = [];
  
  // ファイルサイズチェック
  const maxSize = type === 'icon' ? IMAGE_LIMITS.ICON_MAX_SIZE : IMAGE_LIMITS.HEADER_MAX_SIZE;
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    errors.push(`ファイルサイズが${maxSizeMB}MBを超えています（現在: ${(file.size / (1024 * 1024)).toFixed(1)}MB）`);
  }
  
  // ファイル形式チェック
  if (!IMAGE_LIMITS.ALLOWED_TYPES.includes(file.type)) {
    errors.push(`対応していないファイル形式です。対応形式: ${IMAGE_LIMITS.ALLOWED_TYPES.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const resizeImage = (file, maxWidth = IMAGE_LIMITS.MAX_WIDTH, maxHeight = IMAGE_LIMITS.MAX_HEIGHT, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // アスペクト比を保持しながらリサイズ
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 高品質なリサイズのための設定
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);
        
        // Blobとして出力
        canvas.toBlob((blob) => {
          if (blob) {
            // ファイル名を保持
            const processedFile = new File([blob], file.name, {
              type: blob.type,
              lastModified: Date.now()
            });
            resolve(processedFile);
          } else {
            reject(new Error('画像の圧縮に失敗しました'));
          }
        }, file.type, quality);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('画像の読み込みに失敗しました'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * プレビュー用の軽量画像を作成
 * @param {File} file - 元画像ファイル
 * @param {string} type - 'icon' or 'header'
 * @returns {Promise<string>} - base64エンコードされた軽量画像
 */
export const createPreviewImage = (file, type = 'icon') => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // プレビュー用のサイズ設定
        const maxWidth = type === 'icon' ? 200 : IMAGE_LIMITS.PREVIEW_MAX_WIDTH;
        const maxHeight = type === 'icon' ? 200 : IMAGE_LIMITS.PREVIEW_MAX_HEIGHT;
        
        let { width, height } = img;
        
        // アスペクト比を保持してリサイズ
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 高品質なリサイズ設定
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);
        
        // base64として出力（低品質でサイズを抑制）
        const base64 = canvas.toDataURL(file.type, IMAGE_LIMITS.PREVIEW_QUALITY);
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('プレビュー画像の作成に失敗しました'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 画像の実際のサイズを取得
 * @param {File} file - 画像ファイル
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      reject(new Error('画像の寸法取得に失敗しました'));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * base64文字列のサイズを推定
 * @param {string} base64String - base64エンコードされた文字列
 * @returns {number} - バイト数
 */
export const estimateBase64Size = (base64String) => {
  // base64は4文字で3バイトを表現するため、実際のサイズは約75%
  return Math.round(base64String.length * 0.75);
};