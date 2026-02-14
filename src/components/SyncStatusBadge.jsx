import React from 'react';
import { Wifi, AlertCircle } from 'lucide-react';

export default function SyncStatusBadge({ isOnline, pendingCount }) {
  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
      !isOnline ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
      pendingCount > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''
    }`}>
      {!isOnline ? (
        <>
          <AlertCircle size={12} />
          Offline
          {pendingCount > 0 && <span>({pendingCount} pending)</span>}
        </>
      ) : pendingCount > 0 ? (
        <>
          <Wifi size={12} />
          Syncing {pendingCount}...
        </>
      ) : null}
    </div>
  );
}
