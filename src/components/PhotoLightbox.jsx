import React from 'react';
import { X } from 'lucide-react';

export default function PhotoLightbox({ photo, onClose }) {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors">
        <X size={32} />
      </button>
      <img src={photo} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
