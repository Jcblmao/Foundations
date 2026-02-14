import { STORAGE_SYNC_QUEUE_KEY } from '../utils/constants';

/**
 * Sync engine for offline-first PocketBase integration.
 * Queues mutations when offline and processes them when back online.
 */

function getQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  try {
    localStorage.setItem(STORAGE_SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    console.error('Failed to save sync queue');
  }
}

/**
 * Add an operation to the offline sync queue
 */
export function enqueue(operation) {
  const queue = getQueue();
  queue.push({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
    ...operation
  });
  saveQueue(queue);
}

/**
 * Process all queued operations against PocketBase
 * @param {import('pocketbase').default} pb - PocketBase client
 * @param {function} onProgress - Called with (processed, total) after each operation
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function processQueue(pb, onProgress) {
  const queue = getQueue();
  if (queue.length === 0) return { success: 0, failed: 0 };

  let success = 0;
  let failed = 0;
  const remaining = [];

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    try {
      switch (entry.operation) {
        case 'create':
          await pb.collection(entry.collection).create(entry.data);
          break;
        case 'update':
          try {
            await pb.collection(entry.collection).update(entry.recordId, entry.data);
          } catch (updateErr) {
            // Record doesn't exist in PocketBase — create it instead
            if (updateErr?.status === 404 && entry.data) {
              await pb.collection(entry.collection).create(entry.data);
            } else {
              throw updateErr;
            }
          }
          break;
        case 'delete':
          await pb.collection(entry.collection).delete(entry.recordId);
          break;
        default:
          console.warn('Unknown sync operation:', entry.operation);
      }
      success++;
    } catch (err) {
      // If it's a 404 on delete, the record is already gone - treat as success
      if (entry.operation === 'delete' && err?.status === 404) {
        success++;
      } else {
        console.error('Sync failed for entry:', entry, err);
        remaining.push(entry);
        failed++;
      }
    }

    if (onProgress) {
      onProgress(i + 1, queue.length);
    }
  }

  saveQueue(remaining);
  return { success, failed };
}

/**
 * Get the number of pending sync operations
 */
export function getPendingCount() {
  return getQueue().length;
}

/**
 * Clear all pending sync operations
 */
export function clearQueue() {
  saveQueue([]);
}
