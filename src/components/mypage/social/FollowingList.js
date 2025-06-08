// src/components/mypage/social/FollowingList.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserCard from '../../user/UserCard';

const FollowingList = ({ followingList = [], isLoading = false }) => {
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  // コンポーネントマウント時にフォロー中情報を設定
  useEffect(() => {
    if (followingList.length > 0) {
      setFollowing(followingList);
      setLoading(false);
    } else {
      setLoading(isLoading);
    }
  }, [followingList, isLoading]);

  // ユーザープロフィールへのナビゲーション
  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  // フォロー解除の処理
  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      // フォロー解除APIを呼び出し
      const response = await fetch(`/api/users/unfollow/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // 成功したらリストから削除
        setFollowing(prev => prev.filter(user => user._id !== userId));
      }
    } catch (error) {
      console.error('フォロー解除に失敗しました:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (following.length === 0) {
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
          フォローしているユーザーはいません
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          気になる作家や読者をフォローして、新しい作品を見つけましょう。
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/explore')}
          sx={{ borderRadius: 6 }}
        >
          ユーザーを探す
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {following.map((user) => (
        <UserCard
          key={user._id}
          user={user}
          onUserClick={handleUserClick}
          isFollowing={true} // フォロー中リストなのでtrue
          onFollowToggle={handleFollowToggle}
          showWorks={true}
        />
      ))}
    </Box>
  );
};

export default FollowingList;