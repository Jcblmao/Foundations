import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export default function Notification({ notification }) {
  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 print:hidden ${
      notification.type === 'success' ? 'bg-green-500 text-white' : notification.type === 'info' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {notification.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      {notification.message}
    </div>
  );
}
