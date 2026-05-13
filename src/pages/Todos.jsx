import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import { getTodosByUser, createTodo, updateTodo, deleteTodo } from '../services/api';
import '../styles/Todos.css';

export default function Todos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [searchId, setSearchId] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCompleted, setSearchCompleted] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { fetchTodos(); }, [user]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const data = await getTodosByUser(user.id);
      setTodos(data);
    } catch {
      toast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      const added = await createTodo({ userId: user.id, title: newTitle.trim(), completed: false });
      setTodos((prev) => [...prev, added]);
      setNewTitle('');
      setIsAdding(false);
      toast('Task added to your journey!');
    } catch {
      toast('Failed to add task', 'error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleDelete = async (id) => {
    await deleteTodo(id, user.id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setConfirmDelete(null);
    toast('Task deleted', 'error');
  };

  const handleToggle = async (todo) => {
    const updated = await updateTodo(todo.id, { completed: !todo.completed });
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    toast(updated.completed ? 'Marked as done!' : 'Marked as pending');
  };

  const handleEditSave = async (todo) => {
    if (!editTitle.trim()) return;
    const updated = await updateTodo(todo.id, { title: editTitle.trim() });
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    setEditId(null);
    setEditTitle('');
    toast('Task updated');
  };

  const filtered = todos
    .filter((t) => {
      if (searchId && !String(t.id).includes(searchId)) return false;
      if (searchTitle && !t.title.toLowerCase().includes(searchTitle.toLowerCase())) return false;
      if (searchCompleted === 'done' && !t.completed) return false;
      if (searchCompleted === 'pending' && t.completed) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'id') return String(a.id).localeCompare(String(b.id));
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'completed') return Number(b.completed) - Number(a.completed);
      return 0;
    });

  return (
    <div className="todos-page">
      <div className="page-header">
        <button className="btn-home" onClick={() => navigate('/Home')}>🏠 Home</button>
        <h2>☑️ My Travel Tasks</h2>
      </div>

      <div className="todo-filters">
        <input
          placeholder="Search by ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          type="text"
        />
        <input
          placeholder="Search by title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <select value={searchCompleted} onChange={(e) => setSearchCompleted(e.target.value)}>
          <option value="all">All</option>
          <option value="done">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="id">Sort by ID</option>
          <option value="title">Sort by Title</option>
          <option value="completed">Sort by Status</option>
        </select>
      </div>

      {loading ? (
        <Spinner text="Loading your tasks..." />
      ) : (
        <ul className="todo-list">
          <li className="todo-item" style={{ cursor: 'pointer', border: isAdding ? '1px solid #1a6b8a' : '1px dashed #9e9080' }} onClick={() => !isAdding && setIsAdding(true)}>
            {isAdding ? (
              <div className="todo-edit-row" onClick={(e) => e.stopPropagation()}>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Book flight to Paris..."
                  autoFocus
                />
                <button className="btn-primary" onClick={handleAdd}>Add Task</button>
                <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
              </div>
            ) : (
              <div style={{ color: '#1a6b8a', fontWeight: '500', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px' }}>➕</span> Add a new travel task...
              </div>
            )}
          </li>

          {filtered.length === 0 && !isAdding ? (
            <div className="empty-state">
              <span>📋</span>
              <p>{todos.length === 0 ? 'No tasks yet. Start planning!' : 'No tasks match your search.'}</p>
            </div>
          ) : (
            filtered.map((todo) => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
                <span className="todo-id">#{String(todo.id).substring(0, 4)}</span>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo)}
                />
                {editId === todo.id ? (
                  <div className="todo-edit-row">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditSave(todo)}
                      autoFocus
                    />
                    <button className="btn-primary" onClick={() => handleEditSave(todo)}>Save</button>
                    <button className="btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                ) : (
                  <span className="todo-title">{todo.title}</span>
                )}
                {todo.completed && <span className="todo-badge">Done ✓</span>}
                <div className="todo-actions">
                  <button onClick={() => { setEditId(todo.id); setEditTitle(todo.title); }}>✏️</button>
                  <button onClick={() => setConfirmDelete(todo.id)}>🗑️</button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete this task?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}