// utils/notificationGenerator.js

const Notification = require('../models/Notification');
const User = require('../models/User');
const Follow = require('../models/Follow');

/**
 * 通知生成ユーティリティクラス
 * 通知を生成するための共通機能を提供します
 */
class NotificationGenerator {
  
/**
 * 新規投稿通知を生成する
 * @param {Object} post 投稿オブジェクト
 * @returns {Promise<void>}
 */
static async generateNewPostNotification(post) {
  try {
    // パラメータのバリデーション
    if (!post || typeof post !== 'object') {
      console.error('新規投稿通知エラー: post パラメータがオブジェクトではありません', post);
      return;
    }

    if (!post._id || !post.author || !post.title) {
      console.error('新規投稿通知エラー: post オブジェクトに必要なフィールドがありません', {
        hasId: !!post._id,
        hasAuthor: !!post.author,
        hasTitle: !!post.title,
        post
      });
      return;
    }

    console.log('新規投稿通知処理を開始:', {
      postId: post._id,
      author: post.author,
      title: post.title
    });
    
    // 投稿者の情報を取得（followers を含む）
    const author = await User.findById(post.author)
      .select('nickname followers')
      .lean();
      
    if (!author) {
      console.error(`投稿者情報の取得に失敗しました。投稿者ID: ${post.author}`);
      return;
    }
    
    // フォロワーがいない場合は何もしない
    if (!author.followers || author.followers.length === 0) {
      console.log(`フォロワーが存在しないため通知は生成されません。投稿者ID: ${post.author}`);
      return;
    }

    // 各フォロワーに通知を作成
   console.log(`${author.followers.length}人のフォロワーに通知を生成します`);
    
    // 各フォロワーに通知を作成
    const notificationPromises = author.followers.map(followerId => 
      Notification.createNotification(
        followerId,
        'post',
        '新規投稿',
        `${author.nickname}さんが新しい作品「${post.title}」を投稿しました`,
        {
          postId: post._id,
          authorId: post.author,
          postTitle: post.title
        },
        30 // 30日後に自動削除
      )
    );
    
    const results = await Promise.all(notificationPromises);
    console.log(`通知生成完了: ${results.length}件の通知を生成しました`);
  } catch (error) {
    console.error('新規投稿通知の生成エラー:', error);
  }
}
  
  /**
   * フォロー通知を生成する
   * @param {String} followerId フォローしたユーザーのID
   * @param {String} followingId フォローされたユーザーのID
   * @returns {Promise<void>}
   */
  static async generateFollowNotification(followerId, followingId) {
    try {
      // フォローしたユーザーの情報を取得
      const follower = await User.findById(followerId).select('nickname icon').lean();
      console.log(follower)
      if (!follower) return;
      
      // 通知を作成
      await Notification.createNotification(
        followingId,
        'follow',
        '新しいフォロワー',
        `${follower.nickname}さんがあなたをフォローしました`,
        {
          userId: followerId,
          userNickname: follower.nickname,
          userIcon: follower.icon
        }
      );
    } catch (error) {
      console.error('フォロー通知の生成エラー:', error);
    }
  }
  
  /**
   * システム通知を全ユーザーに送信する
   * @param {String} title 通知タイトル
   * @param {String} message 通知メッセージ
   * @param {Object} data 追加データ
   * @param {Number} expiresInDays 有効期限（日数）
   * @returns {Promise<void>}
   */
  static async generateSystemNotificationToAll(title, message, data = {}, expiresInDays = 60) {
    try {
      // 全ユーザーIDを取得（実際の実装ではページネーションなどの対策が必要）
      const users = await User.find({}).select('_id').lean();
      
      // 各ユーザーに通知を作成（バッチ処理にするべき）
      const batchSize = 100; // 一度に処理する件数
      
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        const notificationPromises = batch.map(user => 
          Notification.createNotification(
            user._id,
            'system',
            title,
            message,
            data,
            expiresInDays
          )
        );
        
        await Promise.all(notificationPromises);
      }
    } catch (error) {
      console.error('システム通知の生成エラー:', error);
    }
  }
  
  /**
   * コメント通知を生成する
   * @param {Object} comment コメントオブジェクト
   * @param {Object} post 投稿オブジェクト
   * @returns {Promise<void>}
   */
  static async generateCommentNotification(comment, post) {
    try {
      // パラメータのバリデーション
      if (!comment || !post) {
        console.error('コメント通知エラー: 必要なパラメータがありません', { comment, post });
        return;
      }
  
      // comment と post の必須フィールドをチェック
      if (!comment.author || !post.author || !post.title) {
        console.error('コメント通知エラー: 必要なフィールドがありません', {
          hasCommentAuthor: !!comment.author,
          hasPostAuthor: !!post.author,
          hasPostTitle: !!post.title
        });
        return;
      }
  
      // 自分自身へのコメントの場合は通知しない
      const commentAuthorId = comment.author.toString();
      const postAuthorId = post.author.toString();
      
      if (commentAuthorId === postAuthorId) {
        console.log('自分自身の投稿へのコメントのため通知は生成されません');
        return;
      }
      
      console.log('コメント通知処理を開始:', {
        commentId: comment._id,
        commentAuthor: comment.author,
        postId: post._id,
        postAuthor: post.author,
        postTitle: post.title
      });
      
      // コメントしたユーザーの情報を取得
      const commenter = await User.findById(comment.author).select('nickname').lean();
      if (!commenter) {
        console.error(`コメント投稿者情報の取得に失敗しました。投稿者ID: ${comment.author}`);
        return;
      }
      
      // 通知を作成
      await Notification.createNotification(
        post.author,
        'comment',
        '新しいコメント',
        `${commenter.nickname}さんがあなたの作品「${post.title}」にコメントしました`,
        {
          postId: post._id,
          commentId: comment._id,
          commentAuthorId: comment.author,
          postTitle: post.title
        }
      );
      
      console.log('コメント通知が正常に生成されました');
    } catch (error) {
      console.error('コメント通知の生成エラー:', error);
    }
  }
  
  /**
   * 「いいね」通知を生成する
   * @param {String} likerId いいねしたユーザーのID
   * @param {Object} post 投稿オブジェクト
   * @returns {Promise<void>}
   */
  static async generateLikeNotification(likerId, post) {
    try {
      // 自分自身の投稿へのいいねの場合は通知しない
      //if (likerId.toString() === post.author.toString()) return;
      // いいねしたユーザーの情報を取得
      const liker = await User.findById(likerId).select('nickname').lean();
      if (!liker) return;
      
      // 通知を作成
      await Notification.createNotification(
        post.author,
        'like',
        '新しいいいね',
        `${liker.nickname}さんがあなたの作品「${post.title}」にいいねしました`,
        {
          postId: post._id,
          likerId: likerId,
          postTitle: post.title
        }
      );
    } catch (error) {
      console.error('いいね通知の生成エラー:', error);
    }
  }
  
  /**
   * コンテスト関連の通知を生成する
   * @param {String} contestId コンテストID
   * @param {String} notificationType 通知タイプ ('start', 'reminder', 'result')
   * @returns {Promise<void>}
   */
  static async generateContestNotification(contestId, notificationType) {
    try {
      const Contest = require('../models/Contest');
      const contest = await Contest.findById(contestId).lean();
      if (!contest) return;
      
      let title, message;
      
      switch (notificationType) {
        case 'start':
          title = 'コンテスト開始';
          message = `「${contest.title}」コンテストが開始されました！`;
          break;
        case 'reminder':
          title = 'コンテスト締切間近';
          message = `「${contest.title}」コンテストの締切が近づいています。`;
          break;
        case 'result':
          title = 'コンテスト結果発表';
          message = `「${contest.title}」コンテストの結果が発表されました！`;
          break;
        default:
          return;
      }
      
      // コンテスト参加者全員に通知
      if (contest.participants && contest.participants.length > 0) {
        const notificationPromises = contest.participants.map(participantId => 
          Notification.createNotification(
            participantId,
            'system',
            title,
            message,
            {
              contestId: contest._id,
              contestTitle: contest.title,
              notificationType: notificationType
            },
            30 // 30日後に自動削除
          )
        );
        
        await Promise.all(notificationPromises);
      }
    } catch (error) {
      console.error('コンテスト通知の生成エラー:', error);
    }
  }
}

module.exports = NotificationGenerator;