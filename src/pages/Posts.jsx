import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import {
  getAllPosts, createPost, updatePost, deletePost,
  getCommentsByPost, createComment, updateComment, deleteComment
} from '../services/api';
import '../styles/Posts.css';

export default function Posts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // סנכרון מזהה הפוסט הפתוח מול שורת הכתובות
  const [searchParams, setSearchParams] = useSearchParams();

  // ברירת המחדל היא true כדי להציג מיד רק את הפוסטים של המשתמש
  const [showMyPosts, setShowMyPosts] = useState(true);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
 
  const [searchId, setSearchId] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
 
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
 
  const [editPostId, setEditPostId] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostBody, setEditPostBody] = useState('');
 
  const [newCommentBody, setNewCommentBody] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentBody, setEditCommentBody] = useState('');
 
  const [confirmDeletePost, setConfirmDeletePost] = useState(null);
  const [confirmDeleteComment, setConfirmDeleteComment] = useState(null);
  
  // --- תוספת חדשה: סטייט לניהול כמות הפוסטים המוצגת (טעינה בשלבים) ---
  const [visibleCount, setVisibleCount] = useState(10);
 
  // טעינה ראשונית - שימוש ב-ID בלבד למניעת בקשות כפולות
  useEffect(() => { 
    if (user?.id) {
      fetchPosts(); 
    }
  }, [user?.id]);
 
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllPosts();
      // הופכים את המערך כדי שהפוסטים האחרונים (החדשים ביותר) יופיעו ראשונים בפיד
      setPosts([...data].reverse());
    } finally {
      setLoading(false);
    }
  };

  // פתיחה אוטומטית של פוסט מתוך ה-URL
  useEffect(() => {
    const urlPostId = searchParams.get('postId');
    if (posts.length > 0 && urlPostId) {
      const found = posts.find(p => String(p.id) === String(urlPostId));
      if (found && (!selectedPost || String(selectedPost.id) !== String(urlPostId))) {
        setSelectedPost(found);
      }
    }
  }, [posts, searchParams]);
 
  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostBody.trim()) return;
    const added = await createPost({ userId: user.id, title: newPostTitle.trim(), body: newPostBody.trim() });
    // מוסיפים את הפוסט החדש לראש הרשימה כדי שיופיע מיד למעלה
    setPosts([added, ...posts]);
    setNewPostTitle(''); setNewPostBody(''); setShowAddPost(false);
    toast('Post published!');
  };
 
  const handleDeletePost = async (id) => {
    await deletePost(id);
    setPosts(posts.filter((p) => p.id !== id));
    if (selectedPost?.id === id) { 
      setSelectedPost(null); 
      setShowComments(false); 
      setSearchParams({}); 
    }
    setConfirmDeletePost(null);
    toast('Post deleted', 'error');
  };
 
  const handleEditPostSave = async () => {
    if (!editPostTitle.trim() || !editPostBody.trim()) return;
    const updated = await updatePost(editPostId, {
      ...posts.find(p => p.id === editPostId),
      title: editPostTitle.trim(), body: editPostBody.trim()
    });
    setPosts(posts.map((p) => (p.id === editPostId ? updated : p)));
    if (selectedPost?.id === editPostId) setSelectedPost(updated);
    setEditPostId(null);
    toast('Post updated');
  };
 
  const handleSelectPost = (post) => {
    setSelectedPost(post); 
    setShowComments(false); 
    setComments([]);
    setSearchParams({ postId: post.id });
  };
 
  const handleShowComments = async (post) => {
    setShowComments(true); setLoadingComments(true);
    try {
      const data = await getCommentsByPost(post.id);
      setComments(data);
    } finally {
      setLoadingComments(false);
    }
  };
 
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;
    const added = await createComment({
      postId: typeof selectedPost.id === 'string' && !isNaN(selectedPost.id) 
        ? Number(selectedPost.id)
        : selectedPost.id, 
      name: user.name,
      email: user.email, 
      body: newCommentBody.trim()
    });
    setComments([...comments, added]);
    setNewCommentBody('');
    toast('Comment added');
  };
 
  const handleDeleteComment = async (id) => {
    await deleteComment(id);
    setComments(comments.filter((c) => c.id !== id));
    setConfirmDeleteComment(null);
    toast('Comment deleted', 'error');
  };
 
  const handleEditCommentSave = async (comment) => {
    const updated = await updateComment(comment.id, { ...comment, body: editCommentBody });
    setComments(comments.map((c) => (c.id === comment.id ? updated : c)));
    setEditCommentId(null);
    toast('Comment updated');
  };
 
  const isMyComment = (comment) => comment.email === user?.email;
 
  const [filteredPosts, setfilteredPosts] = useState([]);

  // סינון הפוסטים
  useEffect(() => {
    let result = posts;

    if (showMyPosts) {
      result = result.filter(p => String(p.userId) === String(user?.id));
    }

    if (searchId.trim()) {
      result = result.filter(p => String(p.id).includes(searchId.trim()));
    }

    if (searchUsername.trim()) {
      result = result.filter(p => p.username?.toLowerCase().includes(searchUsername.toLowerCase()));
    }

    if (searchTitle.trim()) {
      result = result.filter(p => p.title?.toLowerCase().includes(searchTitle.toLowerCase()));
    }

    setfilteredPosts(result);
  }, [searchId, searchUsername, searchTitle, posts, showMyPosts, user?.id]);
 
  // --- חיתוך הפוסטים להצגה בפועל לפי הסטייט של visibleCount ---
  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <div className="posts-page">
      <div className="page-header">
        <button className="btn-home" onClick={() => navigate('/Home')}>🏠 Home</button>
        <h2>📝 My Travel Journal</h2>
      </div>
 
      <div className="posts-search">
        <input placeholder="Search by ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} style={{ width: '130px' }} />
        <input placeholder="Search by username" value={searchUsername} onChange={(e) => setSearchUsername(e.target.value)} />
        <input placeholder="Search by title" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
        
        <button className="btn-secondary" onClick={() => setShowMyPosts(!showMyPosts)}>
          {showMyPosts ? '🌍 All Posts' : '👤 My Posts'}
        </button>
        <button className="btn-primary" onClick={() => setShowAddPost(!showAddPost)}>
          {showAddPost ? 'Cancel' : '+ New Post'}
        </button>
      </div>
 
      {showAddPost && (
        <form className="post-add-form" onSubmit={handleAddPost}>
          <input value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder="Post title" required />
          <textarea value={newPostBody} onChange={(e) => setNewPostBody(e.target.value)} placeholder="Write about your trip..." rows={4} required />
          <button type="submit" className="btn-primary">Publish Post</button>
        </form>
      )}
 
      <div className="posts-layout">
        <div className="posts-list">
          {loading ? <Spinner text="Loading posts..." /> : filteredPosts.length === 0 ? (
            <div className="empty-state">
              <span>📝</span>
              <p>{posts.length === 0 ? 'No posts yet. Write your first travel story!' : 'No posts match your search.'}</p>
            </div>
          ) : (
            <>
              {/* רינדור הפוסטים הגזורים בלבד */}
              {displayedPosts.map((post) => (
                <div key={post.id} className={`post-item ${selectedPost?.id === post.id ? 'selected' : ''}`}>
                  <div className="post-item-header" onClick={() => handleSelectPost(post)}>
                    <span className="post-id" style={{ fontWeight: 'bold', color: '#9e9080', marginRight: '6px' }}>
                      #{String(post.id).substring(0, 4)}
                    </span>
                    <span className="post-author" style={{ color: '#1a6b8a', marginRight: '8px' }}>
                      @{post.username}
                    </span>
                    <span className="post-item-title">{post.title}</span>
                  </div>
                  
                  <div className="post-item-actions">
                    <button onClick={() => handleSelectPost(post)}>👁️</button>
                    {String(post.userId) === String(user?.id) && (
                      <>
                        <button onClick={() => { setEditPostId(post.id); setEditPostTitle(post.title); setEditPostBody(post.body); handleSelectPost(post); }}>✏️</button>
                        <button onClick={() => setConfirmDeletePost(post.id)}>🗑️</button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* כפתור טעינת עוד פוסטים - מוצג רק אם נותרו פוסטים להציג */}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button className="btn-secondary" onClick={() => setVisibleCount(prev => prev + 10)}>
                    ⬇️ Load More Posts
                  </button>
                </div>
              )}
            </>
          )}
        </div>
 
        {selectedPost && (
          <div className="post-detail">
            {editPostId === selectedPost.id ? (
              <div className="post-edit-form">
                <input value={editPostTitle} onChange={(e) => setEditPostTitle(e.target.value)} />
                <textarea value={editPostBody} onChange={(e) => setEditPostBody(e.target.value)} rows={5} />
                <div className="edit-actions">
                  <button className="btn-primary" onClick={handleEditPostSave}>Save</button>
                  <button onClick={() => setEditPostId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{selectedPost.title}</h3>
                  <button onClick={() => { setSelectedPost(null); setSearchParams({}); }} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                </div>
                <p className="post-body">{selectedPost.body}</p>
                <button className="btn-secondary" onClick={() => handleShowComments(selectedPost)}>
                  💬 Show Comments
                </button>
              </>
            )}
 
            {showComments && (
              <div className="comments-section">
                <h4>Comments</h4>
                {loadingComments ? <Spinner text="Loading comments..." /> : (
                  <>
                    {comments.length === 0 ? (
                      <div className="empty-state small"><span>💬</span><p>No comments yet. Be the first!</p></div>
                    ) : (
                      <ul className="comments-list">
                        {comments.map((c) => (
                          <li key={c.id} className="comment-item">
                            <div className="comment-meta">
                              <strong>{c.name}</strong> <span>{c.email}</span>
                            </div>
                            {editCommentId === c.id ? (
                              <div>
                                <textarea value={editCommentBody} onChange={(e) => setEditCommentBody(e.target.value)} rows={2} />
                                <button onClick={() => handleEditCommentSave(c)}>Save</button>
                                <button onClick={() => setEditCommentId(null)}>Cancel</button>
                              </div>
                            ) : <p>{c.body}</p>}
                            {isMyComment(c) && (
                              <div className="comment-actions">
                                <button onClick={() => { setEditCommentId(c.id); setEditCommentBody(c.body); }}>✏️</button>
                                <button onClick={() => setConfirmDeleteComment(c.id)}>🗑️</button>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
                <form className="add-comment-form" onSubmit={handleAddComment}>
                  <textarea value={newCommentBody} onChange={(e) => setNewCommentBody(e.target.value)} placeholder="Add your comment..." rows={2} required />
                  <button type="submit" className="btn-primary">Add Comment</button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
 
      {confirmDeletePost && (
        <ConfirmDialog
          message="Are you sure you want to delete this post?"
          onConfirm={() => handleDeletePost(confirmDeletePost)}
          onCancel={() => setConfirmDeletePost(null)}
        />
      )}
      {confirmDeleteComment && (
        <ConfirmDialog
          message="Are you sure you want to delete this comment?"
          onConfirm={() => handleDeleteComment(confirmDeleteComment)}
          onCancel={() => setConfirmDeleteComment(null)}
        />
      )}
    </div>
  );
}