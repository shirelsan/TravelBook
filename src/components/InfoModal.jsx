import { useState } from 'react';
import { updateUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import '../styles/InfoModal.css';

export default function InfoModal({ user, onClose }) {
  const { updateUserData } = useAuth();
  const toast = useToast();
  
  // State לניהול מצב עריכה
  const [isEditing, setIsEditing] = useState(false);
  // State לניהול הטופס - מאתחלים עם פרטי המשתמש הקיימים
  const [formData, setFormData] = useState({
    ...user,
    address: { ...user.address }
  });

  if (!user) return null;

  const handleSave = async () => {
    try {
      const updated = await updateUser(user.id, formData);
      updateUserData(updated); // עדכון ה-Context וה-LocalStorage
      setIsEditing(false);
      toast('Profile updated successfully!');
    } catch (err) {
      toast('Failed to update profile', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'street' || name === 'city') {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{isEditing ? '✏️ Edit Profile' : '👤 Personal Info'}</h2>
        
        <div className="info-grid">
          <div className="info-row">
            <span>Name</span>
            {isEditing ? (
              <input name="name" value={formData.name} onChange={handleChange} />
            ) : (
              <strong>{user.name}</strong>
            )}
          </div>
          
          <div className="info-row">
            <span>Email</span>
            {isEditing ? (
              <input name="email" value={formData.email} onChange={handleChange} />
            ) : (
              <strong>{user.email}</strong>
            )}
          </div>

          <div className="info-row">
            <span>Phone</span>
            {isEditing ? (
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Add phone number..." />
            ) : (
              <strong>{user.phone || 'Not provided'}</strong>
            )}
          </div>

          <div className="info-row">
            <span>City</span>
            {isEditing ? (
              <input name="city" value={formData.address.city} onChange={handleChange} />
            ) : (
              <strong>{user.address?.city}</strong>
            )}
          </div>

          <div className="info-row">
            <span>Street</span>
            {isEditing ? (
              <input name="street" value={formData.address.street} onChange={handleChange} />
            ) : (
              <strong>{user.address?.street}</strong>
            )}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
          {isEditing ? (
            <>
              <button className="btn-primary" onClick={handleSave}>Save Changes</button>
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Details</button>
          )}
        </div>
      </div>
    </div>
  );
}