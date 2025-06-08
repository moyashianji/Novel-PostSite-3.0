import { useState, useEffect, useCallback } from 'react';

const ADMIN_USER_ID = '66c360d0dd9964e79ab728b6';

const useHome = (auth) => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tagContainers, setTagContainers] = useState([]);
  const [text, setText] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [contests, setContests] = useState([]);
  const [newSeries, setNewSeries] = useState([]);
  const [updatedSeries, setUpdatedSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  // メインデータの取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch posts
        const postsResponse = await fetch(`/api/posts?page=${currentPage}`);
        const postsData = await postsResponse.json();
        setPosts(postsData.posts);
        setTotalPages(postsData.totalPages);
        setCurrentPage(postsData.currentPage);

        // Fetch announcements
        const announcementsResponse = await fetch(`/api/users/${ADMIN_USER_ID}/works`);
        if (announcementsResponse.ok) {
          const announcementsData = await announcementsResponse.json();
          const sortedAnnouncements = announcementsData.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setAnnouncements(sortedAnnouncements);
        }

        // Fetch contests
        const contestsResponse = await fetch('/api/contests');
        if (contestsResponse.ok) {
          const contestsData = await contestsResponse.json();
          setContests(contestsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  // ページ変更ハンドラ
  const handleChangePage = useCallback((event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ユーザータグの取得
  const fetchUserTags = useCallback(async () => {
    if (!auth) return;
    try {
      const response = await fetch('/api/users/tags', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      const fetchedTagContainers = data.tagContainers || [];
      setTagContainers(fetchedTagContainers);
      fetchedTagContainers.forEach((container, index) => {
        if (container.tag) {
          fetchPostsByTag(index, container.tag);
        }
      });
    } catch (error) {
      console.error('Error fetching user tags:', error);
    }
  }, [auth]);


  // タグの保存
  const saveTagToUser = useCallback(async (index, tag) => {
    try {
      const response = await fetch('/api/users/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ index, tag }),
      });
      if (response.ok) {
        console.log('タグ情報が保存されました');
      }
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  }, []);

  // タグ送信ハンドラ
  const handleTagSubmit = useCallback((index) => {
    const tag = text[index] || '';
    fetchPostsByTag(index, tag);
    saveTagToUser(index, tag);
  }, [text, saveTagToUser]);

  // タグコンテナの追加
  const handleAddTagContainer = useCallback(() => {
    if (tagContainers.length >= 10) return;
    setTagContainers([...tagContainers, { tag: '', posts: [], page: 1, totalPages: 1 }]);
  }, [tagContainers]);

  // タグテキスト変更ハンドラ
  const handleTextChange = useCallback((index, value) => {
    setText(prevText => ({
      ...prevText,
      [index]: value,
    }));
  }, []);

  // タグでの投稿の取得
  const fetchPostsByTag = useCallback(async (index, tag, page = 1) => {
    if (!tagContainers[index]) {
      console.error(`Invalid index: ${index}`);
      return;
    }
    try {
      const response = await fetch(`/api/posts/tag/${tag}?page=${page}`);
      const data = await response.json();
      setTagContainers(prevContainers => {
        const updatedContainers = [...prevContainers];
        updatedContainers[index] = {
          ...updatedContainers[index],
          posts: data.posts,
          totalPages: data.totalPages,
          page: data.currentPage,
          fetched: true,
          tag: tag,
        };
        return updatedContainers;
      });
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
    }
  }, [tagContainers]);

  // タグページ変更ハンドラ
  const handleTagPageChange = useCallback((index, value) => {
    const tag = tagContainers[index].tag;
    fetchPostsByTag(index, tag, value);
  }, [tagContainers, fetchPostsByTag]);

  // タグコンテナの削除
  const handleDeleteTagContainer = useCallback(async (index) => {
    try {
      const response = await fetch(`/api/users/tags/${index}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setTagContainers(prevContainers => {
          const updatedContainers = [...prevContainers];
          updatedContainers.splice(index, 1);
          return updatedContainers.map((container, newIndex) => ({
            ...container,
            index: newIndex,
          }));
        });
      } else {
        console.error('Error deleting tag on server');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  }, []);

  // タグの変更
  const handleTagChange = useCallback((index, value) => {
    setTagContainers(prevContainers => {
      const updatedContainers = [...prevContainers];
      updatedContainers[index] = { ...updatedContainers[index], tag: value };
      return updatedContainers;
    });
  }, []);

  // 初期タグの取得
  useEffect(() => {
    if (auth) {
      fetchUserTags();
    }
  }, [auth, fetchUserTags]);

  // タグコンテナの更新時に投稿をフェッチ
  useEffect(() => {
    if (tagContainers.length > 0) {
      tagContainers.forEach((container, index) => {
        if (container.tag && !container.fetched) {
          fetchPostsByTag(index, container.tag);
        }
      });
    }
  }, [tagContainers, fetchPostsByTag]);

  return {
    posts,
    currentPage,
    totalPages,
    tagContainers,
    text,
    announcements,
    contests,
    newSeries,
    updatedSeries,
    loading,
    handleChangePage,
    handleAddTagContainer,
    handleTagSubmit,
    handleTagPageChange,
    handleTextChange,
    handleDeleteTagContainer,
    handleTagChange,
    saveTagToUser,
    fetchPostsByTag,
  };
};

export default useHome;
