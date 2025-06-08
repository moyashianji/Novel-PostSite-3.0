/**
 * LocalStorageからデータを取得する
 * @param {string} key - 取得するキー
 * @param {any} defaultValue - キーが存在しない場合のデフォルト値
 * @returns {any} 取得した値またはデフォルト値
 */
export const getLocalStorageData = (key, defaultValue) => {
  const storedData = localStorage.getItem('contestFormData');
  if (storedData) {
    const parsedData = JSON.parse(storedData);
    return parsedData[key] !== undefined ? parsedData[key] : defaultValue;
  }
  return defaultValue;
};

/**
 * フォームデータをLocalStorageに保存する
 * @param {Object} formData - 保存するフォームデータ
 */
export const saveFormData = (formData) => {
  localStorage.setItem('contestFormData', JSON.stringify(formData));
};

/**
 * プレビューデータをSessionStorageに保存する
 * @param {Object} previewData - プレビューデータ
 */
export const savePreviewData = (previewData) => {
  sessionStorage.setItem('contestPreviewData', JSON.stringify(previewData));
};
