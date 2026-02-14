import { useState, useEffect, useCallback, useRef } from 'react';
import pb from '../lib/pocketbase';
import {
  STORAGE_DARK_MODE_KEY,
  STORAGE_FORM_SECTIONS_KEY,
  STORAGE_CONTACTS_KEY,
  STORAGE_COMMUTE_KEY,
  emptyContacts,
  defaultDestinations,
  formSectionDefaults
} from '../utils/constants';

/**
 * User settings hook with localStorage cache and PocketBase sync.
 */
export function useSettings(userId) {
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem(STORAGE_DARK_MODE_KEY) === 'true'; } catch { return false; }
  });

  const [formSections, setFormSections] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FORM_SECTIONS_KEY);
      return saved ? { ...formSectionDefaults, ...JSON.parse(saved) } : formSectionDefaults;
    } catch {
      return formSectionDefaults;
    }
  });

  const [professionalContacts, setProfessionalContacts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONTACTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          solicitor: { ...emptyContacts.solicitor, ...(parsed.solicitor || {}) },
          broker: { ...emptyContacts.broker, ...(parsed.broker || {}) },
          mortgage: { ...emptyContacts.mortgage, ...(parsed.mortgage || {}) }
        };
      }
      return emptyContacts;
    } catch {
      return emptyContacts;
    }
  });

  const [commuteDestinations, setCommuteDestinations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMMUTE_KEY);
      return saved ? JSON.parse(saved) : defaultDestinations;
    } catch {
      return defaultDestinations;
    }
  });

  // Debounce timer for PocketBase sync
  const syncTimerRef = useRef(null);

  // Sync settings to PocketBase (debounced)
  const syncToServer = useCallback((settings) => {
    if (!userId || !navigator.onLine) return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        // Try to find existing settings record
        const records = await pb.collection('user_settings').getFullList({
          filter: `owner = "${userId}"`
        });

        const data = {
          owner: userId,
          dark_mode: settings.darkMode,
          form_sections: settings.formSections,
          professional_contacts: settings.professionalContacts,
          commute_destinations: settings.commuteDestinations
        };

        if (records.length > 0) {
          await pb.collection('user_settings').update(records[0].id, data);
        } else {
          await pb.collection('user_settings').create(data);
        }
      } catch (err) {
        console.error('Failed to sync settings to PocketBase:', err);
      }
    }, 2000); // 2 second debounce
  }, [userId]);

  // Persist dark mode and toggle class on <html>
  useEffect(() => {
    try { localStorage.setItem(STORAGE_DARK_MODE_KEY, darkMode); } catch { /* ignore */ }
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist form sections
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FORM_SECTIONS_KEY, JSON.stringify(formSections));
    } catch { /* ignore */ }
  }, [formSections]);

  const saveProfessionalContacts = useCallback((contacts) => {
    setProfessionalContacts(contacts);
    try {
      localStorage.setItem(STORAGE_CONTACTS_KEY, JSON.stringify(contacts));
    } catch { /* ignore */ }
    syncToServer({ darkMode, formSections, professionalContacts: contacts, commuteDestinations });
  }, [darkMode, formSections, commuteDestinations, syncToServer]);

  const saveCommuteDestinations = useCallback((destinations) => {
    setCommuteDestinations(destinations);
    try {
      localStorage.setItem(STORAGE_COMMUTE_KEY, JSON.stringify(destinations));
    } catch { /* ignore */ }
    syncToServer({ darkMode, formSections, professionalContacts, commuteDestinations: destinations });
  }, [darkMode, formSections, professionalContacts, syncToServer]);

  // Fetch settings from PocketBase on mount
  useEffect(() => {
    if (!userId) return;

    const fetchSettings = async () => {
      try {
        const records = await pb.collection('user_settings').getFullList({
          filter: `owner = "${userId}"`
        });
        if (records.length > 0) {
          const s = records[0];
          if (s.dark_mode !== undefined) setDarkMode(s.dark_mode);
          if (s.form_sections) setFormSections(prev => ({ ...formSectionDefaults, ...prev, ...s.form_sections }));
          if (s.professional_contacts) {
            setProfessionalContacts(prev => ({
              solicitor: { ...emptyContacts.solicitor, ...prev.solicitor, ...(s.professional_contacts.solicitor || {}) },
              broker: { ...emptyContacts.broker, ...prev.broker, ...(s.professional_contacts.broker || {}) },
              mortgage: { ...emptyContacts.mortgage, ...prev.mortgage, ...(s.professional_contacts.mortgage || {}) }
            }));
          }
          if (s.commute_destinations) setCommuteDestinations(s.commute_destinations);
        }
      } catch (err) {
        console.error('Failed to fetch settings from PocketBase:', err);
      }
    };

    fetchSettings();
  }, [userId]);

  return {
    darkMode,
    setDarkMode,
    formSections,
    setFormSections,
    professionalContacts,
    setProfessionalContacts,
    saveProfessionalContacts,
    commuteDestinations,
    setCommuteDestinations,
    saveCommuteDestinations
  };
}
