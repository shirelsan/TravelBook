import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const [showMyPosts, setShowMyPosts] = useState(false);
 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
 
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
 
  useEffect(() => { fetchPosts(); }, [user]);
 
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllPosts();
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };
 
  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostBody.trim()) return;
    const added = await createPost({ userId: user.id, title: newPostTitle.trim(), body: newPostBody.trim() });
    setPosts([...posts, added]);
    setNewPostTitle(''); setNewPostBody(''); setShowAddPost(false);
    toast('Post published!');
  };
 
  const handleDeletePost = async (id) => {
    await deletePost(id);
    setPosts(posts.filter((p) => p.id !== id));
    if (selectedPost?.id === id) { setSelectedPost(null); setShowComments(false); }
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
    setSelectedPost(post); setShowComments(false); setComments([]);
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
 
  const isMyComment = (comment) => comment.email === user.email;
 
  const [filteredPosts, setfilteredPosts] = useState([]);

  useEffect(() => {
    let result = posts;

    if (showMyPosts) {
      result = result.filter(p => String(p.userId) === String(user.id));
    }

    if (searchUsername.trim()) {
      result = result.filter(p => p.username?.toLowerCase().includes(searchUsername.toLowerCase()));
    }

    if (searchTitle.trim()) {
      result = result.filter(p => p.title?.toLowerCase().includes(searchTitle.toLowerCase()));
    }

    setfilteredPosts(result);
  }, [searchUsername, searchTitle, posts, showMyPosts]);
 
  return (
    <div className="posts-page">
      <div className="page-header">
        <button className="btn-home" onClick={() => navigate('/Home')}>🏠 Home</button>
        <h2>📝 My Travel Journal</h2>
      </div>
 
      <div className="posts-search">
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
          ) : filteredPosts.map((post) => (
            <div key={post.id} className={`post-item ${selectedPost?.id === post.id ? 'selected' : ''}`}>
              <div className="post-item-header" onClick={() => handleSelectPost(post)}>
                <span className="post-id">@{post.username}</span>
                <span className="post-item-title">{post.title}</span>
              </div>
              <div className="post-item-actions">
                <button onClick={() => handleSelectPost(post)}>👁️</button>
                {String(post.userId) === String(user.id) && (
                  <>
                    <button onClick={() => { setEditPostId(post.id); setEditPostTitle(post.title); setEditPostBody(post.body); handleSelectPost(post); }}>✏️</button>
                    <button onClick={() => setConfirmDeletePost(post.id)}>🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))}
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
                <h3>{selectedPost.title}</h3>
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