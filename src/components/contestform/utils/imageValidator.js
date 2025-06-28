// utils/imageValidator.js (新規作成)
export const IMAGE_LIMITS = {
  ICON_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  HEADER_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048
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
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
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
      
      // 画像を描画
      ctx.drawImage(img, 0, 0, width, height);
      
      // Blobとして出力
      canvas.toBlob(resolve, file.type, quality);
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