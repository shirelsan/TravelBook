import { useState } from 'react';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InfoModal from '../components/InfoModal';
import '../styles/Home.css';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

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
          <NavLink to="/Home" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>🏠</span> Home
          </NavLink>
          <NavLink to="/todos" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>☑️</span> Todos
          </NavLink>
          <NavLink to="/posts" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <span>📝</span> Posts
          </NavLink>
          
          {/* הניווט הותאם בדיוק למבנה הנדרש הכולל את מזהה המשתמש */}
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