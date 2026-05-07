const BASE_URL = 'http://localhost:3001';

// Generic fetch helper
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// POSTS
export const getPostsByUser = async (userId) => {
  const [posts, users] = await Promise.all([
    apiFetch(`/posts?userId=${userId}`),
    apiFetch('/users')
  ]);

  const result = posts.map(post => ({
    ...post,
    username: users.find(u => String(u.id) === String(post.userId))?.username || ''
  }));

  return result;
};

export const getAllPosts = async () => {
  const [posts, users] = await Promise.all([
    apiFetch('/posts'),
    apiFetch('/users')
  ]);

  return posts.map(post => ({
    ...post,
    username: users.find(u => String(u.id) === String(post.userId))?.username || ''
  }));
};

// USERS
export const getUsers = () => apiFetch('/users');
export const getUserById = (id) => apiFetch(`/users/${id}`);
export const createUser = (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) });

// TODOS
export const getTodosByUser = (userId) => apiFetch(`/todos?userId=${userId}`);
export const createTodo = (data) => apiFetch('/todos', { method: 'POST', body: JSON.stringify(data) });
export const updateTodo = (id, data) => apiFetch(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTodo = (id) => apiFetch(`/todos/${id}`, { method: 'DELETE' });

// POSTS
//export const getPostsByUser = (userId) => apiFetch(`/posts?userId=${userId}`);
export const createPost = (data) => apiFetch('/posts', { method: 'POST', body: JSON.stringify(data) });
export const updatePost = (id, data) => apiFetch(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePost = (id) => apiFetch(`/posts/${id}`, { method: 'DELETE' });

// COMMENTS
export const getCommentsByPost = (postId) => apiFetch(`/comments?postId=${postId}`);
export const createComment = (data) => apiFetch('/comments', { method: 'POST', body: JSON.stringify(data) });
export const updateComment = (id, data) => apiFetch(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteComment = (id) => apiFetch(`/comments/${id}`, { method: 'DELETE' });

// ALBUMS
export const getAlbumsByUser = (userId) => apiFetch(`/albums?userId=${userId}`);
export const createAlbum = (data) => apiFetch('/albums', { method: 'POST', body: JSON.stringify(data) });
export const deleteAlbum = (id) => apiFetch(`/albums/${id}`, { method: 'DELETE' });

// PHOTOS
export const getPhotosByAlbum = (albumId, page = 1, limit = 6) =>
  apiFetch(`/photos?albumId=${albumId}&_page=${page}&_limit=${limit}`);
export const createPhoto = (data) => apiFetch('/photos', { method: 'POST', body: JSON.stringify(data) });
export const updatePhoto = (id, data) => apiFetch(`/photos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePhoto = (id) => apiFetch(`/photos/${id}`, { method: 'DELETE' });
