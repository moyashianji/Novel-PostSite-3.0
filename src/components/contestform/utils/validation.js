/**
 * MongoDB ObjectIdの形式チェック
 * @param {string} id - チェックするID
 * @returns {boolean} 有効なら true
 */
export const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

/**
 * フォームのバリデーション
 * @param {Object} formData - フォームデータ
 * @param {Function} setApplicationStartDateError - 開始日エラーセッター
 * @param {Function} setApplicationEndDateError - 終了日エラーセッター
 * @returns {boolean} フォームが有効なら true
 */
export const validateForm = (formData, setApplicationStartDateError, setApplicationEndDateError) => {
  const { title, shortDescription, description, applicationStartDate, applicationEndDate } = formData;
  let isValid = true;
  
  // 基本情報のチェック
  if (!title || !shortDescription || !description) {
    isValid = false;
  }
  
  // 日付のチェック
  if (!applicationStartDate) {
    setApplicationStartDateError(true);
    isValid = false;
  } else {
    setApplicationStartDateError(false);
  }
  
  if (!applicationEndDate) {
    setApplicationEndDateError(true);
    isValid = false;
  } else {
    setApplicationEndDateError(false);
  }
  
  return isValid;
};
