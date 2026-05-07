import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Todos from './pages/Todos';
import Posts from './pages/Posts';
import Albums from './pages/Albums';
import './styles/Global.css';
 
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* הניתוב שונה כדי לכלול את מזהה המשתמש לפי הדרישות */}
          <Route
            path="/users/:userId"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          >
            <Route index element={<WelcomeDashboard />} />
            <Route path="todos" element={<Todos />} />
            <Route path="posts" element={<Posts />} />
            <Route path="albums/*" element={<Albums />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
 
function WelcomeDashboard() {
  const navigate = useNavigate();
  const { userId } = useParams(); // מושכים את ה-ID מה-URL
  
  return (
    <div className="welcome-dashboard">
      <div className="welcome-icon">✈️</div>
      <h2>Welcome to TravelBook</h2>
      <p>Your personal travel journal. Choose a section from the sidebar to get started.</p>
      <div className="welcome-cards">
        <div className="welcome-card" onClick={() => navigate(`/users/${userId}/todos`)}>
          <span>☑️</span>
          <strong>Todos</strong>
          <p>Manage your travel tasks</p>
        </div>
        <div className="welcome-card" onClick={() => navigate(`/users/${userId}/posts`)}>
          <span>📝</span>
          <strong>Posts</strong>
          <p>Write your travel journal</p>
        </div>
        <div className="welcome-card" onClick={() => navigate(`/users/${userId}/albums`)}>
          <span>📷</span>
          <strong>Albums</strong>
          <p>Browse your travel photos</p>
        </div>
      </div>
    </div>
  );
}