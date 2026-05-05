import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import {
  getTodosByUser, createTodo, updateTodo, deleteTodo
} from '../services/api';
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
 
  useEffect(() => { fetchTodos(); }, [user]);
 
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const data = await getTodosByUser(user.id);
      setTodos(data);
    } finally {
      setLoading(false);
    }
  };
 
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const added = await createTodo({ userId: user.id, title: newTitle.trim(), completed: false });
    setTodos([...todos, added]);
    setNewTitle('');
    toast('Task added successfully');
  };
 
  const handleDelete = async (id) => {
    await deleteTodo(id);
    setTodos(todos.filter((t) => t.id !== id));
    setConfirmDelete(null);
    toast('Task deleted', 'error');
  };
 
  const handleToggle = async (todo) => {
    const updated = await updateTodo(todo.id, { ...todo, completed: !todo.completed });
    setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
    toast(updated.completed ? 'Marked as done!' : 'Marked as pending');
  };
 
  const handleEditSave = async (todo) => {
    if (!editTitle.trim()) return;
    const updated = await updateTodo(todo.id, { ...todo, title: editTitle.trim() });
    setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
    setEditId(null);
    setEditTitle('');
    toast('Task updated');
  };
 
  const filtered = todos
    .filter((t) => {
      if (searchId && String(t.id) !== searchId) return false;
      if (searchTitle && !t.title.toLowerCase().includes(searchTitle.toLowerCase())) return false;
      if (searchCompleted === 'done' && !t.completed) return false;
      if (searchCompleted === 'pending' && t.completed) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'id') return a.id - b.id;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'completed') return Number(b.completed) - Number(a.completed);
      return 0;
    });
 
  return (
    <div className="todos-page">
      <div className="page-header">
        <button className="btn-home" onClick={() => navigate('/home')}>🏠 Home</button>
        <h2>☑️ My Travel Tasks</h2>
      </div>
 
      <form className="todo-add-form" onSubmit={handleAdd}>
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Add a new task..." />
        <button type="submit">+ Add</button>
      </form>
 
      <div className="todo-filters">
        <input placeholder="Search by ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} type="number" min="1" />
        <input placeholder="Search by title" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
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
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>📋</span>
          <p>{todos.length === 0 ? 'No tasks yet. Add your first travel task above!' : 'No tasks match your search.'}</p>
        </div>
      ) : (
        <ul className="todo-list">
          {filtered.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
              <span className="todo-id">#{todo.id}</span>
              <input type="checkbox" checked={todo.completed} onChange={() => handleToggle(todo)} />
              {editId === todo.id ? (
                <div className="todo-edit-row">
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus />
                  <button onClick={() => handleEditSave(todo)}>Save</button>
                  <button onClick={() => setEditId(null)}>Cancel</button>
                </div>
              ) : (
                <span className="todo-title">{todo.title}</span>
              )}
              {todo.completed && <span className="todo-badge">Done</span>}
              <div className="todo-actions">
                <button onClick={() => { setEditId(todo.id); setEditTitle(todo.title); }}>✏️</button>
                <button onClick={() => setConfirmDelete(todo.id)}>🗑️</button>
              </div>
            </li>
          ))}
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
 