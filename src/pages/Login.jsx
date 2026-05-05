import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
 
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const users = await getUsers();
      const found = users.find(
        (u) => u.username === username && u.website === password
      );
      if (found) {
        login(found);
        navigate('/home');
      } else {
        setError('Invalid username or password. Please try again.');
      }
    } catch {
      setError('Server error. Make sure JSON-Server is running.');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">✈️</div>
        <h1 className="auth-title">TravelBook</h1>
        <p className="auth-subtitle">Welcome back, Traveler</p>
 
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Checking...' : 'Login'}
          </button>
        </form>
 
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
 
      </div>
    </div>
  );
}
 