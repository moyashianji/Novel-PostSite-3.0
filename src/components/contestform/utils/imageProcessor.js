/**
 * Base64文字列をFileオブジェクトに変換
 * @param {string} base64 - Base64文字列
 * @param {string} filename - ファイル名
 * @returns {File} Fileオブジェクト
 */
export const base64ToFile = (base64, filename) => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

/**
 * HTML内のBase64画像を抽出
 * @param {string} html - HTML文字列
 * @returns {string[]} Base64画像の配列
 */
export const extractBase64Images = (html) => {
  const matches = html.match(/data:image\/[a-zA-Z]+;base64,[^"]+/g) || [];
  return matches;
};

/**
 * Base64をWebP Blobに変換
 * @param {string} base64 - Base64文字列
 * @returns {Promise<Blob>} WebP Blob
 */
export const convertBase64ToWebP = (base64) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/webp', 0.8);
    };
  });
};

/**
 * Base64画像をサーバーにアップロード
 * @param {string} base64String - Base64文字列
 * @returns {Promise<string>} アップロードされた画像のURL
 */
export const uploadBase64Image = async (base64String) => {
  try {
    const blob = await convertBase64ToWebP(base64String);
    const formData = new FormData();
    formData.append('image', blob, 'image.webp');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('アップロード失敗');

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return base64String; // 失敗時は元のBase64を返す
  }
};

/**
 * HTML内の全Base64画像を処理して置換
 * @param {string} html - HTML文字列
 * @returns {Promise<string>} 画像URLが置換されたHTML
 */
export const processHtmlImages = async (html) => {
  const base64Images = extractBase64Images(html);
  if (base64Images.length === 0) return html;

  const uploadedImages = await Promise.all(base64Images.map(uploadBase64Image));
  
  let updatedHtml = html;
  base64Images.forEach((base64, index) => {
    updatedHtml = updatedHtml.replace(base64, uploadedImages[index]);
  });
  
  return updatedHtml;
};
