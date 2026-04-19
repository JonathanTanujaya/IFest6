import { X } from 'lucide-react';

export default function Popup({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div 
        className="popup-content" 
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
        style={{ borderTop: `4px solid ${item.color}` }}
      >
        <button className="close-button" onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2 className="popup-title">{item.title}</h2>
        <p className="popup-desc">{item.description}</p>
        
        <button className="popup-action" style={{ backgroundColor: item.color }}>
          {item.actionText || 'Explore'}
        </button>
      </div>
    </div>
  );
}
