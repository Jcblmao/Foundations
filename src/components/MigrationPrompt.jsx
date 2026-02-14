import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import pb from '../lib/pocketbase';
import { toDbRecord } from '../lib/fieldMapping';
import { STORAGE_KEY, STORAGE_CONTACTS_KEY, STORAGE_COMMUTE_KEY, STORAGE_MIGRATION_KEY, emptyProperty } from '../utils/constants';

export default function MigrationPrompt({ userId, onComplete, onSkip }) {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);

  // Check if migration is needed
  const localData = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const alreadyMigrated = localStorage.getItem(STORAGE_MIGRATION_KEY) === 'true';

  if (alreadyMigrated || localData.length === 0) return null;

  const handleMigrate = async () => {
    setMigrating(true);
    setError(null);
    setProgress({ current: 0, total: localData.length });

    try {
      for (let i = 0; i < localData.length; i++) {
        const property = { ...emptyProperty, ...localData[i] };
        const record = toDbRecord(property, userId);
        record.legacy_id = property.id;
        await pb.collection('properties').create(record);
        setProgress({ current: i + 1, total: localData.length });
      }

      // Migrate contacts
      try {
        const contacts = JSON.parse(localStorage.getItem(STORAGE_CONTACTS_KEY) || 'null');
        const commute = JSON.parse(localStorage.getItem(STORAGE_COMMUTE_KEY) || 'null');
        if (contacts || commute) {
          await pb.collection('user_settings').create({
            owner: userId,
            professional_contacts: contacts || {},
            commute_destinations: commute || []
          });
        }
      } catch { /* contacts migration is best-effort */ }

      localStorage.setItem(STORAGE_MIGRATION_KEY, 'true');
      onComplete();
    } catch (err) {
      console.error('Migration failed:', err);
      setError('Migration failed. You can try again or skip for now.');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
        <Upload className="mx-auto text-emerald-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Import Existing Data</h2>
        <p className="text-slate-500 mb-6">
          Found <span className="font-semibold text-slate-700">{localData.length}</span> properties on this device.
          Import them to your account?
        </p>

        {migrating && (
          <div className="mb-4">
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-sm text-slate-500">
              Migrating {progress.current} of {progress.total}...
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-lg">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            disabled={migrating}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {migrating ? 'Migrating...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
