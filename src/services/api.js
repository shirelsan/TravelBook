const BASE_URL = 'http://localhost:3001';

// אובייקט Cache פשוט לשמירת מידע שכבר נטען
const cache = {
  users: null,
  todos: {},
  posts: {},
  albums: {}
};

// Generic fetch helper
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// פונקציית עזר משודרגת ליצירת מזהה מספרי רץ
// מוודאת שהמספר מוחזר כמחרוזת ("1", "2") כדי ש-JSON-Server לא ידרוס אותו
async function getNextId(endpoint) {
  try {
    const items = await apiFetch(endpoint);
    const validItems = Array.isArray(items) ? items : (items?.data || []);
    if (validItems.length === 0) return "1";
    
    const maxId = validItems.reduce((max, item) => {
      // מנסים להמיר את ה-ID למספר, גם אם הוא נשמר כמחרוזת בשרת
      const numId = Number(item.id);
      return !isNaN(numId) && numId > max ? numId : max;
    }, 0);
    
    // מחזירים את המספר הבא בתור כמחרוזת נקי כדי שהשרת יקבל אותו כ-ID לגיטימי
    return String(maxId + 1);
  } catch {
    return String(Date.now()); // גיבוי בטוח
  }
}

// --- USERS ---
export const getUsers = async () => {
  if (cache.users) return cache.users;
  const data = await apiFetch('/users');
  cache.users = data;
  return data;
};

export const getUserById = (id) => apiFetch(`/users/${id}`);

export const createUser = async (data) => {
  const nextId = await getNextId('/users');
  const newUser = await apiFetch('/users', { 
    method: 'POST', 
    body: JSON.stringify({ ...data, id: nextId }) 
  });
  cache.users = null;
  return newUser;
};

export const updateUser = async (id, data) => {
  const updatedUser = await apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  cache.users = null;
  return updatedUser;
};

// --- TODOS ---
export const getTodosByUser = async (userId) => {
  if (cache.todos[userId]) return cache.todos[userId];
  const data = await apiFetch(`/todos?userId=${userId}`);
  cache.todos[userId] = data;
  return data;
};

export const createTodo = async (data) => {
  const nextId = await getNextId('/todos');
  // שולחים את המזהה המנורמל. JSON-Server חייב לקבל שדה id מפורש
  const normalizedData = { 
    id: nextId, 
    ...data, 
    userId: String(data.userId) 
  }; 
  
  const newTodo = await apiFetch('/todos', { 
    method: 'POST', 
    body: JSON.stringify(normalizedData) 
  });
  
  if (cache.todos[data.userId]) {
    cache.todos[data.userId] = [...cache.todos[data.userId], newTodo];
  }
  return newTodo;
};

export const updateTodo = async (id, data) => {
  const updated = await apiFetch(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (cache.todos[data.userId]) {
    cache.todos[data.userId] = cache.todos[data.userId].map(t => t.id === id ? updated : t);
  }
  return updated;
};

export const deleteTodo = async (id, userId) => {
  await apiFetch(`/todos/${id}`, { method: 'DELETE' });
  if (cache.todos[userId]) {
    cache.todos[userId] = cache.todos[userId].filter(t => t.id !== id);
  }
};

// --- POSTS ---
export const getPostsByUser = async (userId) => {
  if (cache.posts[userId]) return cache.posts[userId];
  
  const [posts, users] = await Promise.all([
    apiFetch(`/posts?userId=${userId}`),
    getUsers()
  ]);

  const result = posts.map(post => ({
    ...post,
    username: users.find(u => String(u.id) === String(post.userId))?.username || ''
  }));

  cache.posts[userId] = result;
  return result;
};

export const getAllPosts = async () => {
  const [posts, users] = await Promise.all([
    apiFetch('/posts'),
    getUsers()
  ]);

  return posts.map(post => ({
    ...post,
    username: users.find(u => String(u.id) === String(post.userId))?.username || ''
  }));
};

export const createPost = async (data) => {
  const nextId = await getNextId('/posts');
  const normalizedData = { 
    id: nextId, 
    ...data, 
    userId: String(data.userId) 
  };
  
  const newPost = await apiFetch('/posts', { 
    method: 'POST', 
    body: JSON.stringify(normalizedData) 
  });
  
  if (cache.posts[data.userId]) {
    newPost.username = cache.users?.find(u => String(u.id) === String(data.userId))?.username || '';
    cache.posts[data.userId] = [...cache.posts[data.userId], newPost];
  }
  return newPost;
};

export const updatePost = async (id, data) => {
  const updated = await apiFetch(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (cache.posts[data.userId]) {
    updated.username = cache.users?.find(u => String(u.id) === String(data.userId))?.username || '';
    cache.posts[data.userId] = cache.posts[data.userId].map(p => p.id === id ? updated : p);
  }
  return updated;
};

export const deletePost = async (id, userId) => {
  await apiFetch(`/posts/${id}`, { method: 'DELETE' });
  if (cache.posts[userId]) {
    cache.posts[userId] = cache.posts[userId].filter(p => p.id !== id);
  }
};

// --- COMMENTS ---
export const getCommentsByPost = (postId) => apiFetch(`/comments?postId=${postId}`);

export const createComment = async (data) => {
  const nextId = await getNextId('/comments');
  const normalizedData = { 
    id: nextId, 
    ...data, 
    postId: String(data.postId) 
  };
  return apiFetch('/comments', { method: 'POST', body: JSON.stringify(normalizedData) });
};

export const updateComment = (id, data) => apiFetch(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteComment = (id) => apiFetch(`/comments/${id}`, { method: 'DELETE' });

// --- ALBUMS ---

export const getAlbumsByUser = async (userId) => {
  if (cache.albums[userId]) return cache.albums[userId];
  const data = await apiFetch(`/albums?userId=${userId}`);
  cache.albums[userId] = data;
  return data;
};

export const createAlbum = async (data) => {
  const nextId = await getNextId('/albums');
  const normalizedData = { 
    id: nextId, 
    ...data, 
    userId: String(data.userId) 
  };
  const newAlbum = await apiFetch('/albums', { method: 'POST', body: JSON.stringify(normalizedData) });
  
  if (cache.albums[data.userId]) {
    cache.albums[data.userId] = [...cache.albums[data.userId], newAlbum];
  }
  return newAlbum;
};

export const deleteAlbum = async (id, userId) => {
  await apiFetch(`/albums/${id}`, { method: 'DELETE' });
  if (cache.albums[userId]) {
    cache.albums[userId] = cache.albums[userId].filter(a => a.id !== id);
  }
};

export const updateAlbum = async (id, data) => {
  const updated = await apiFetch(`/albums/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (cache.albums[data.userId]) {
    cache.albums[data.userId] = cache.albums[data.userId].map(a => a.id === id ? updated : a);
  }
  return updated;
};

// --- PHOTOS ---
export const getPhotosByAlbum = (albumId, page = 1, limit = 6) =>
  apiFetch(`/photos?albumId=${albumId}&_page=${page}&_per_page=${limit}`);

export const createPhoto = async (data) => {
  const nextId = await getNextId('/photos');
  const normalizedData = { 
    id: nextId, 
    ...data, 
    albumId: String(data.albumId) 
  };
  return apiFetch('/photos', { method: 'POST', body: JSON.stringify(normalizedData) });
};

export const updatePhoto = (id, data) => apiFetch(`/photos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePhoto = (id) => apiFetch(`/photos/${id}`, { method: 'DELETE' });