import { useState, useEffect, useCallback, useRef } from 'react';
import pb from '../lib/pocketbase';
import { toDbRecord, fromDbRecord } from '../lib/fieldMapping';
import { enqueue } from '../lib/syncEngine';
import { STORAGE_KEY, emptyProperty } from '../utils/constants';

/**
 * Offline-first properties hook.
 * Loads from localStorage instantly, syncs with PocketBase in background.
 */
export function useProperties(userId) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const realtimeRef = useRef(null);

  // Merge property with emptyProperty defaults for backward compatibility
  const mergeDefaults = useCallback((p) => {
    let offers = p.offers && p.offers.length > 0 ? p.offers : [];
    if (offers.length === 0 && p.offerMade) {
      const statusMap = { pending: 'Submitted', accepted: 'Accepted', rejected: 'Rejected', countered: 'Countered' };
      offers = [{ id: Date.now().toString(), date: p.dateAdded || new Date().toISOString(), amount: p.offerMade, status: statusMap[p.offerStatus] || 'Submitted', response: '', notes: '' }];
    }
    let commuteTimes = p.commuteTimes || {};
    if (!commuteTimes.eastleigh && p.commuteToEastleigh) commuteTimes.eastleigh = p.commuteToEastleigh;
    if (!commuteTimes.totton && p.commuteToTotton) commuteTimes.totton = p.commuteToTotton;
    return {
      ...emptyProperty,
      ...p,
      offers,
      commuteTimes,
      documents: { ...emptyProperty.documents, ...(p.documents || {}) },
      conveyancing: { ...emptyProperty.conveyancing, ...(p.conveyancing || {}) }
    };
  }, []);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProperties(parsed.map(mergeDefaults));
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
    setLoading(false);
  }, [mergeDefaults]);

  // Fetch from PocketBase if authenticated, then subscribe to realtime
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchFromServer = async () => {
      try {
        const records = await pb.collection('properties').getFullList({
          filter: `owner = "${userId}"`,
          sort: '-created'
        });
        if (cancelled) return;

        const serverProperties = records.map(r => mergeDefaults(fromDbRecord(r)));
        const serverIds = new Set(serverProperties.map(p => p.id));

        // Find local-only properties (numeric timestamp IDs not yet on server)
        let localOnly = [];
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const local = JSON.parse(saved);
            localOnly = local.filter(p => p.id && /^\d+$/.test(p.id) && !serverIds.has(p.id));
          }
        } catch { /* ignore */ }

        // Push local-only properties to PocketBase
        for (const prop of localOnly) {
          try {
            const record = toDbRecord(prop, userId);
            const created = await pb.collection('properties').create(record);
            serverProperties.push(mergeDefaults(fromDbRecord(created)));
          } catch (err) {
            console.error('Failed to push local property to server:', err);
            serverProperties.push(mergeDefaults(prop));
          }
        }

        setProperties(serverProperties);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverProperties));
        } catch { /* ignore */ }
      } catch (err) {
        console.error('Failed to fetch properties from PocketBase:', err);
        // Keep using localStorage data
      }
    };

    fetchFromServer();

    // Subscribe to realtime changes
    pb.collection('properties').subscribe('*', (e) => {
      if (cancelled) return;
      const record = mergeDefaults(fromDbRecord(e.record));

      setProperties(prev => {
        let updated;
        switch (e.action) {
          case 'create':
            if (prev.find(p => p.id === record.id)) return prev;
            updated = [record, ...prev];
            break;
          case 'update':
            updated = prev.map(p => p.id === record.id ? record : p);
            break;
          case 'delete':
            updated = prev.filter(p => p.id !== record.id);
            break;
          default:
            return prev;
        }
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
        return updated;
      });
    }).then(unsub => {
      realtimeRef.current = unsub;
    }).catch(err => {
      console.error('Realtime subscription failed:', err);
    });

    return () => {
      cancelled = true;
      if (typeof realtimeRef.current === 'function') {
        realtimeRef.current();
      } else {
        pb.collection('properties').unsubscribe('*').catch(() => {});
      }
    };
  }, [userId, mergeDefaults]);

  // Save to localStorage and optionally sync to PocketBase
  const saveToLocalStorage = useCallback((newProperties) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProperties));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  const addProperty = useCallback((propertyData) => {
    const now = new Date().toISOString();
    const newProperty = {
      ...propertyData,
      id: Date.now().toString(),
      dateAdded: now
    };

    setProperties(prev => {
      const updated = [...prev, newProperty];
      saveToLocalStorage(updated);
      return updated;
    });

    // Sync to PocketBase
    if (userId && navigator.onLine) {
      const record = toDbRecord(newProperty, userId);
      pb.collection('properties').create(record).then(created => {
        // Update local ID with PocketBase ID
        setProperties(prev => {
          const updated = prev.map(p =>
            p.id === newProperty.id ? { ...p, id: created.id } : p
          );
          saveToLocalStorage(updated);
          return updated;
        });
      }).catch(() => {
        enqueue({ collection: 'properties', operation: 'create', data: toDbRecord(newProperty, userId) });
      });
    } else if (userId) {
      enqueue({ collection: 'properties', operation: 'create', data: toDbRecord(newProperty, userId) });
    }

    return newProperty;
  }, [userId, saveToLocalStorage]);

  const updateProperty = useCallback((id, updates) => {
    setProperties(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      saveToLocalStorage(updated);
      return updated;
    });

    if (userId && navigator.onLine) {
      const record = toDbRecord(updates, userId);
      pb.collection('properties').update(id, record).catch((err) => {
        // Record doesn't exist in PocketBase — create it instead
        if (err?.status === 404) {
          setProperties(prev => {
            const fullProp = prev.find(p => p.id === id);
            if (fullProp) {
              const fullRecord = toDbRecord(fullProp, userId);
              pb.collection('properties').create(fullRecord).then(created => {
                setProperties(inner => {
                  const updated = inner.map(p => p.id === id ? { ...p, id: created.id } : p);
                  saveToLocalStorage(updated);
                  return updated;
                });
              }).catch(() => {
                enqueue({ collection: 'properties', operation: 'create', data: toDbRecord(fullProp, userId) });
              });
            }
            return prev;
          });
        } else {
          enqueue({ collection: 'properties', operation: 'update', recordId: id, data: record });
        }
      });
    } else if (userId) {
      enqueue({ collection: 'properties', operation: 'update', recordId: id, data: toDbRecord(updates, userId) });
    }
  }, [userId, saveToLocalStorage]);

  const deleteProperty = useCallback((id) => {
    setProperties(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });

    if (userId && navigator.onLine) {
      pb.collection('properties').delete(id).catch(() => {
        enqueue({ collection: 'properties', operation: 'delete', recordId: id });
      });
    } else if (userId) {
      enqueue({ collection: 'properties', operation: 'delete', recordId: id });
    }
  }, [userId, saveToLocalStorage]);

  const saveProperties = useCallback((newProperties) => {
    setProperties(newProperties);
    saveToLocalStorage(newProperties);
  }, [saveToLocalStorage]);

  return {
    properties,
    loading,
    setProperties: saveProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    mergeDefaults
  };
}
