// src/components/mypage/social/FollowersList.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserCard from '../../user/UserCard';

const FollowersList = ({ followerList = [], isLoading = false }) => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [loading, setLoading] = useState(true);

  // コンポーネントマウント時にフォロワー情報を設定
  useEffect(() => {
    if (followerList.length > 0) {
      setFollowers(followerList);
      
      // フォロー状態を初期化
      const statusMap = {};
      followerList.forEach(user => {
        // フォロー状態をAPIから取得または初期値を設定
        statusMap[user._id] = user.isFollowedByMe || false;
      });
      setFollowStatus(statusMap);
      setLoading(false);
    } else {
      setLoading(isLoading);
    }
  }, [followerList, isLoading]);

  // ユーザープロフィールへのナビゲーション
  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  // フォロー/フォロー解除の処理
  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      const endpoint = isFollowing 
        ? `/api/users/follow/${userId}`
        : `/api/users/unfollow/${userId}`;
      
      const method = isFollowing ? 'POST' : 'DELETE';
      
      const response = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // 成功したらUI状態を更新
        setFollowStatus(prev => ({
          ...prev,
          [userId]: isFollowing
        }));
      }
    } catch (error) {
      console.error('フォロー操作に失敗しました:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (followers.length === 0) {
    return (
      <Box 
        sx={{ 
          padding: 4, 
          width: '100%', 
          textAlign: 'center',
          bgcolor: 'rgba(0,0,0,0.01)',
          borderRadius: 2,
          border: '1px dashed rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          フォロワーはいません
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          あなたの作品を充実させて、読者を増やしましょう。
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {followers.map((user) => (
        <UserCard
          key={user._id}
          user={user}
          onUserClick={handleUserClick}
          isFollowing={followStatus[user._id] || false}
          onFollowToggle={handleFollowToggle}
          showWorks={true}
        />
      ))}
    </Box>
  );
};

export default FollowersList;