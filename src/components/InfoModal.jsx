import '../styles/InfoModal.css';

export default function InfoModal({ user, onClose }) {
  if (!user) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>👤 Personal Info</h2>
        <div className="info-grid">
          <div className="info-row"><span>Name</span><strong>{user.name}</strong></div>
          <div className="info-row"><span>Username</span><strong>{user.username}</strong></div>
          <div className="info-row"><span>Email</span><strong>{user.email}</strong></div>
          <div className="info-row"><span>Phone</span><strong>{user.phone}</strong></div>
          <div className="info-row">
            <span>Address</span>
            <strong>{user.address?.street}, {user.address?.city}</strong>
          </div>
          <div className="info-row"><span>Company</span><strong>{user.company?.name}</strong></div>
        </div>
      </div>
    </div>
  );
}
