import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, createUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

export default function Register() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== passwordVerify) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const users = await getUsers();
      const exists = users.find((u) => u.username === username);
      if (exists) {
        setError('Username already taken. Please choose another.');
      } else {
        setStep(2);
      }
    } catch {
      setError('Server error. Make sure JSON-Server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const newUser = {
        name,
        username,
        email,
        phone,
        website: password,
        address: { street, city, zipcode: '' },
        company: { name: '' },
      };
      const created = await createUser(newUser);
      login(created);
      navigate('/Home'); // הניווט תוקן לכתובת הבית
    } catch {
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">🗺️</div>
        <h1 className="auth-title">TravelBook</h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Start your journey' : 'Tell us about yourself'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleStep1} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                required
              />
            </div>
            <div className="form-group">
              <label>Verify Password</label>
              <input
                type="password"
                value={passwordVerify}
                onChange={(e) => setPasswordVerify(e.target.value)}
                placeholder="Repeat your password"
                required
              />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>
            <div className="form-group">
              <label>Street</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Your street"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Your city"
              />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}