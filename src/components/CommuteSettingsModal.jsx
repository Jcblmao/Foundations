import React from 'react';
import { Settings, X, Plus, Trash2 } from 'lucide-react';

export default function CommuteSettingsModal({ show, destinations, onSave, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Settings size={20} /> Commute Destinations</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Configure up to 4 commute destinations. Changes apply to all properties.</p>
          {destinations.map((dest, index) => (
            <div key={dest.id} className="flex items-center gap-2">
              <input
                type="text"
                value={dest.name}
                onChange={(e) => {
                  const updated = destinations.map((d, i) => i === index ? { ...d, name: e.target.value } : d);
                  onSave(updated);
                }}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="Destination name"
              />
              <button
                onClick={() => onSave(destinations.filter((_, i) => i !== index))}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remove destination"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {destinations.length < 4 && (
            <button
              onClick={() => {
                const newId = `dest_${Date.now()}`;
                onSave([...destinations, { id: newId, name: '' }]);
              }}
              className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mt-2"
            >
              <Plus size={16} /> Add destination
            </button>
          )}
          {destinations.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No destinations configured yet.</p>
          )}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">Done</button>
        </div>
      </div>
    </div>
  );
}
