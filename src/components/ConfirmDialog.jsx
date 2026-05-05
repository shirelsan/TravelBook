import './ConfirmDialog.css';
 
export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="confirm-yes" onClick={onConfirm}>Yes, delete</button>
          <button className="confirm-no" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
 