// src/utils/contentManager.js
/**
 * 静的コンテンツの管理と更新を効率化するユーティリティ
 * 利用規約やプライバシーポリシーの変更を簡単に行えます
 */

// 設定ファイルの基本パス
const CONFIG_BASE_PATH = '/config';

/**
 * JSONファイルからコンテンツを読み込む
 * @param {string} filename - 読み込むファイル名
 * @returns {Promise<Object>} - パースされたJSONオブジェクト
 */
export const loadContent = async (filename) => {
  try {
    const response = await fetch(`${CONFIG_BASE_PATH}/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Content loading error:', error);
    // フォールバック用のデフォルトコンテンツを返す
    return getDefaultContent(filename);
  }
};

/**
 * デフォルトコンテンツを返す（フォールバック）
 * @param {string} filename - ファイル名
 * @returns {Object} - デフォルトコンテンツ
 */
const getDefaultContent = (filename) => {
  const defaults = {
    'terms.json': {
      version: '1.0.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      sections: [
        {
          id: 'default',
          title: 'コンテンツ読み込みエラー',
          content: ['申し訳ございませんが、利用規約を読み込めませんでした。']
        }
      ]
    },
    'privacy.json': {
      version: '1.0.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      sections: [
        {
          id: 'default',
          title: 'コンテンツ読み込みエラー',
          content: ['申し訳ございませんが、プライバシーポリシーを読み込めませんでした。']
        }
      ]
    }
  };
  
  return defaults[filename] || { error: 'Unknown content type' };
};

/**
 * コンテンツのバージョンを比較する
 * @param {string} currentVersion - 現在のバージョン
 * @param {string} newVersion - 新しいバージョン
 * @returns {number} - 比較結果 (-1: 古い, 0: 同じ, 1: 新しい)
 */
export const compareVersions = (currentVersion, newVersion) => {
  const current = currentVersion.split('.').map(Number);
  const updated = newVersion.split('.').map(Number);
  
  for (let i = 0; i < Math.max(current.length, updated.length); i++) {
    const currentPart = current[i] || 0;
    const updatedPart = updated[i] || 0;
    
    if (currentPart < updatedPart) return 1; // 新しいバージョン
    if (currentPart > updatedPart) return -1; // 古いバージョン
  }
  
  return 0; // 同じバージョン
};

/**
 * コンテンツの更新チェック
 * @param {string} contentType - コンテンツタイプ ('terms' | 'privacy')
 * @param {string} currentVersion - 現在のバージョン
 * @returns {Promise<Object>} - 更新情報
 */
export const checkForUpdates = async (contentType, currentVersion) => {
  try {
    const filename = `${contentType}.json`;
    const latestContent = await loadContent(filename);
    const comparison = compareVersions(currentVersion, latestContent.version);
    
    return {
      hasUpdate: comparison > 0,
      latestVersion: latestContent.version,
      currentVersion,
      lastUpdated: latestContent.lastUpdated,
      content: latestContent
    };
  } catch (error) {
    console.error('Update check failed:', error);
    return {
      hasUpdate: false,
      error: error.message
    };
  }
};

/**
 * コンテンツをテキストファイルとしてダウンロード
 * @param {Object} content - ダウンロードするコンテンツ
 * @param {string} filename - ファイル名
 */
export const downloadAsText = (content, filename) => {
  const textContent = content.sections.map(section => 
    `${section.title}\n${section.content.join('\n')}\n\n`
  ).join('');
  
  const header = `${filename.replace('.txt', '')}\nバージョン: ${content.version}\n最終更新: ${content.lastUpdated}\n\n`;
  const fullContent = header + textContent;
  
  const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 変更履歴を管理するクラス
 */
export class ContentVersionManager {
  constructor() {
    this.storageKey = 'novelcrest_content_versions';
  }
  
  /**
   * 現在の版数情報を取得
   * @returns {Object} - 保存された版数情報
   */
  getStoredVersions() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse stored versions:', error);
      return {};
    }
  }
  
  /**
   * 版数情報を保存
   * @param {string} contentType - コンテンツタイプ
   * @param {string} version - バージョン
   */
  setVersion(contentType, version) {
    try {
      const versions = this.getStoredVersions();
      versions[contentType] = {
        version,
        acceptedAt: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(versions));
    } catch (error) {
      console.error('Failed to store version:', error);
    }
  }
  
  /**
   * ユーザーが最新版に同意したかチェック
   * @param {string} contentType - コンテンツタイプ
   * @param {string} latestVersion - 最新バージョン
   * @returns {boolean} - 同意済みかどうか
   */
  hasAcceptedLatest(contentType, latestVersion) {
    const versions = this.getStoredVersions();
    const userVersion = versions[contentType]?.version;
    return userVersion === latestVersion;
  }
}

// シングルトンインスタンス
export const versionManager = new ContentVersionManager();

/**
 * 使用例とベストプラクティス
 * 
 * // 1. 基本的な使用方法
 * const termsContent = await loadContent('terms.json');
 * 
 * // 2. 更新チェック
 * const updateInfo = await checkForUpdates('terms', '1.0.0');
 * if (updateInfo.hasUpdate) {
 *   // 新しいバージョンが利用可能
 *   console.log(`New version available: ${updateInfo.latestVersion}`);
 * }
 * 
 * // 3. バージョン管理
 * versionManager.setVersion('terms', '1.1.0');
 * const hasAccepted = versionManager.hasAcceptedLatest('terms', '1.1.0');
 * 
 * // 4. ダウンロード機能
 * downloadAsText(termsContent, 'NovelCrest_利用規約_v1.0.0.txt');
 */