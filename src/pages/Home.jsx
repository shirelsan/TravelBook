import { useState, useEffect } from 'react';
import { useNavigate, Outlet, NavLink, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfoModal from '../components/InfoModal';
import '../styles/Home.css';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams(); // קריאת ה-ID של המשתמש מהכתובת
  const [showInfo, setShowInfo] = useState(false);

  // אבטחה: מניעת גישה למידע של משתמש אחר
  useEffect(() => {
    if (user && userId && String(user.id) !== userId) {
      // אם יש ניסיון לגשת למשתמש אחר, זורקים אותו חזרה לעמוד שלו
      navigate(`/users/${user.id}`, { replace: true });
    }
  }, [user, userId, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // אם ה-ID עדיין לא תואם (לפני הרינדור מחדש של ה-useEffect), אל תציג כלום כדי לא להדליף מידע
  if (String(user.id) !== userId) return null;

  return (
    <div className="home-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">✈️</span>
          <div>
            <div className="sidebar-brand">TravelBook</div>
            <div className="sidebar-user">{user?.name}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-btn info-btn" onClick={() => setShowInfo(true)}>
            <span>👤</span> Info
          </button>
          <NavLink to={`/users/${user.id}/todos`} className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>☑️</span> Todos
          </NavLink>
          <NavLink to={`/users/${user.id}/posts`} className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>📝</span> Posts
          </NavLink>
          <NavLink to={`/users/${user.id}/albums`} className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>📷</span> Albums
          </NavLink>
        </nav>

        <button className="nav-btn logout-btn" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      {showInfo && <InfoModal user={user} onClose={() => setShowInfo(false)} />}
    </div>
  );
}