/**
 * LocalStorageからデータを取得する
 * @param {string} key - 取得するキー
 * @param {any} defaultValue - キーが存在しない場合のデフォルト値
 * @returns {any} 取得した値またはデフォルト値
 */
export const getLocalStorageData = (key, defaultValue) => {
  try {
    const storedData = localStorage.getItem('contestFormData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      return parsedData[key] !== undefined ? parsedData[key] : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error('Failed to get localStorage data:', error);
    return defaultValue;
  }
};

/**
 * フォームデータをLocalStorageに保存する（画像データは除外）
 * @param {Object} formData - 保存するフォームデータ
 */
export const saveFormData = (formData) => {
  try {
    // 画像データを除外したコピーを作成
    const dataToSave = { ...formData };
    
    // 大容量データを除外
    delete dataToSave.iconPreview;
    delete dataToSave.headerPreview;
    
    // サイズをチェックしてから保存
    const dataString = JSON.stringify(dataToSave);
    const dataSize = new Blob([dataString]).size;
    
    // LocalStorageの推定制限（約5MB）をチェック
    if (dataSize > 4 * 1024 * 1024) { // 4MBを超える場合は警告
      console.warn('Data size is too large for localStorage:', dataSize);
      return false;
    }
    
    localStorage.setItem('contestFormData', dataString);
    return true;
  } catch (error) {
    console.error('Failed to save form data:', error);
    
    // QuotaExceededErrorの場合は古いデータをクリアして再試行
    if (error.name === 'QuotaExceededError') {
      try {
        clearFormData();
        const dataToSave = { ...formData };
        delete dataToSave.iconPreview;
        delete dataToSave.headerPreview;
        localStorage.setItem('contestFormData', JSON.stringify(dataToSave));
        return true;
      } catch (retryError) {
        console.error('Failed to save even after clearing:', retryError);
        return false;
      }
    }
    return false;
  }
};

/**
 * プレビューデータをSessionStorageに保存する
 * @param {Object} previewData - プレビューデータ
 */
export const savePreviewData = (previewData) => {
  try {
    sessionStorage.setItem('contestPreviewData', JSON.stringify(previewData));
  } catch (error) {
    console.error('Failed to save preview data:', error);
    if (error.name === 'QuotaExceededError') {
      // SessionStorageもクリアして再試行
      sessionStorage.clear();
      try {
        sessionStorage.setItem('contestPreviewData', JSON.stringify(previewData));
      } catch (retryError) {
        console.error('Failed to save preview data even after clearing:', retryError);
      }
    }
  }
};

/**
 * 画像プレビューを個別に保存する（圧縮版）
 * @param {string} type - 'icon' or 'header'
 * @param {string} base64Data - base64画像データ
 * @param {string} fileName - ファイル名
 */
export const saveImagePreview = (type, base64Data, fileName) => {
  try {
    // 圧縮された画像データのみ保存
    localStorage.setItem(`${type}Preview`, base64Data);
    localStorage.setItem(`${type}ImageName`, fileName);
  } catch (error) {
    console.error(`Failed to save ${type} preview:`, error);
    if (error.name === 'QuotaExceededError') {
      // 他の画像データをクリアして再試行
      clearImagePreviews();
      try {
        localStorage.setItem(`${type}Preview`, base64Data);
        localStorage.setItem(`${type}ImageName`, fileName);
      } catch (retryError) {
        console.error(`Failed to save ${type} preview even after clearing:`, retryError);
      }
    }
  }
};

/**
 * 画像プレビューを個別に取得する
 * @param {string} type - 'icon' or 'header'
 * @returns {Object} - {preview, fileName}
 */
export const getImagePreview = (type) => {
  try {
    return {
      preview: localStorage.getItem(`${type}Preview`),
      fileName: localStorage.getItem(`${type}ImageName`)
    };
  } catch (error) {
    console.error(`Failed to get ${type} preview:`, error);
    return { preview: null, fileName: null };
  }
};

/**
 * 画像プレビューを削除する
 * @param {string} type - 'icon' or 'header'
 */
export const removeImagePreview = (type) => {
  try {
    localStorage.removeItem(`${type}Preview`);
    localStorage.removeItem(`${type}ImageName`);
  } catch (error) {
    console.error(`Failed to remove ${type} preview:`, error);
  }
};

/**
 * 全ての画像プレビューをクリアする
 */
export const clearImagePreviews = () => {
  try {
    localStorage.removeItem('iconPreview');
    localStorage.removeItem('iconImageName');
    localStorage.removeItem('headerPreview');
    localStorage.removeItem('headerImageName');
  } catch (error) {
    console.error('Failed to clear image previews:', error);
  }
};

/**
 * フォームデータをクリアする
 */
export const clearFormData = () => {
  try {
    localStorage.removeItem('contestFormData');
    clearImagePreviews();
  } catch (error) {
    console.error('Failed to clear form data:', error);
  }
};

/**
 * LocalStorageの使用容量を取得する（デバッグ用）
 * @returns {Object} - {used, total, available}
 */
export const getStorageInfo = () => {
  try {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    return {
      used: used,
      usedMB: (used / (1024 * 1024)).toFixed(2),
      // LocalStorageの一般的な制限は5-10MB
      estimatedTotal: 5 * 1024 * 1024,
      estimatedAvailable: Math.max(0, (5 * 1024 * 1024) - used)
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return null;
  }
};