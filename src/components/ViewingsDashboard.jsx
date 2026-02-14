import React, { useState } from 'react';
import { Calendar, ChevronRight, ChevronDown, Phone, ExternalLink } from 'lucide-react';

export default function ViewingsDashboard({ viewings }) {
  const [collapsed, setCollapsed] = useState(false);

  if (viewings.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
      >
        <div className="flex items-center gap-2">
          <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Upcoming Viewings ({viewings.length})</h2>
        </div>
        {collapsed ? <ChevronRight size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {viewings.map(p => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{p.address}</p>
                <p className="text-sm text-purple-700">
                  {new Date(p.viewingDate).toLocaleString('en-GB', {
                    weekday: 'short', day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {p.agent && <span className="text-slate-600">{p.agent}</span>}
                {p.agentPhone && (
                  <a href={`tel:${p.agentPhone}`} className="flex items-center gap-1 text-emerald-600 hover:underline">
                    <Phone size={14} /> {p.agentPhone}
                  </a>
                )}
                {p.listingUrl && (
                  <a href={p.listingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <ExternalLink size={14} /> Listing
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
