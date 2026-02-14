import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Home, Plus, BarChart3 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useProperties } from './hooks/useProperties';
import { useSettings } from './hooks/useSettings';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { getPendingCount, processQueue } from './lib/syncEngine';
import pb from './lib/pocketbase';
import { emptyProperty, emptyContacts, STORAGE_KEY, STORAGE_LAST_EXPORT_KEY } from './utils/constants';

import Notification from './components/Notification';
import Header from './components/Header';
import SearchFilterBar from './components/SearchFilterBar';
import ViewingsDashboard from './components/ViewingsDashboard';
import PropertyForm from './components/PropertyForm';
import PropertyCard from './components/PropertyCard';
import QuickAddModal from './components/QuickAddModal';
import ContactsModal from './components/ContactsModal';
import CommuteSettingsModal from './components/CommuteSettingsModal';
import CompareModal from './components/CompareModal';
import PhotoLightbox from './components/PhotoLightbox';
import MapView from './components/MapView';
import LoginPage from './components/LoginPage';
import MigrationPrompt from './components/MigrationPrompt';

function App() {
  const { user, loading: authLoading, isAuthenticated, signInWithGoogle, signOut } = useAuth();
  const userId = user?.id || null;
  const { properties, loading: propsLoading, setProperties, addProperty, updateProperty, deleteProperty, mergeDefaults } = useProperties(userId);
  const {
    darkMode, setDarkMode,
    formSections, setFormSections,
    professionalContacts, setProfessionalContacts, saveProfessionalContacts,
    commuteDestinations, saveCommuteDestinations
  } = useSettings(userId);
  const isOnline = useOnlineStatus();

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [notification, setNotification] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddUrl, setQuickAddUrl] = useState('');
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showCommuteSettings, setShowCommuteSettings] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [printMode, setPrintMode] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [swipedCardId, setSwipedCardId] = useState(null);
  const [formData, setFormData] = useState(emptyProperty);
  const [showMigration, setShowMigration] = useState(true);
  const [pendingCount, setPendingCount] = useState(getPendingCount());

  const showNotificationMessage = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Process sync queue when coming back online
  useEffect(() => {
    if (isOnline && userId) {
      const pending = getPendingCount();
      if (pending > 0) {
        processQueue(pb).then(({ success, failed }) => {
          setPendingCount(getPendingCount());
          if (success > 0) showNotificationMessage(`Synced ${success} changes`, 'success');
          if (failed > 0) showNotificationMessage(`${failed} changes failed to sync`, 'error');
        });
      }
    }
    setPendingCount(getPendingCount());
  }, [isOnline, userId, showNotificationMessage]);

  // Print mode
  useEffect(() => {
    if (!printMode) return;
    const handleAfterPrint = () => setPrintMode(false);
    window.addEventListener('afterprint', handleAfterPrint);
    const timer = setTimeout(() => window.print(), 200);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      clearTimeout(timer);
    };
  }, [printMode]);

  // Backup reminder
  useEffect(() => {
    try {
      const lastExport = localStorage.getItem(STORAGE_LAST_EXPORT_KEY);
      if (lastExport) {
        const daysSince = Math.floor((Date.now() - parseInt(lastExport)) / (1000 * 60 * 60 * 24));
        if (daysSince >= 7) {
          setTimeout(() => showNotificationMessage(`Last backup was ${daysSince} days ago. Consider exporting your data.`, 'info'), 1500);
        }
      }
    } catch {}
  }, [showNotificationMessage]);

  // Filtered and sorted properties
  const filteredProperties = useMemo(() => {
    return properties
      .filter(p => {
        const matchesArchived = showArchived ? p.archived : !p.archived;
        const matchesSearch = p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             p.postcode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFavorite = !filterFavorites || p.favorite;
        return matchesArchived && matchesSearch && matchesFavorite;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price': return (parseInt(a.price) || 0) - (parseInt(b.price) || 0);
          case 'rating': return (b.rating || 0) - (a.rating || 0);
          case 'dateAdded': return new Date(b.dateAdded) - new Date(a.dateAdded);
          default: return 0;
        }
      });
  }, [properties, showArchived, searchTerm, filterFavorites, sortBy]);

  // Map center
  const mapCenter = useMemo(() => {
    const geocoded = (properties || []).filter(p => p.latitude && p.longitude && !p.archived);
    if (geocoded.length > 0) {
      return [
        geocoded.reduce((sum, p) => sum + parseFloat(p.latitude), 0) / geocoded.length,
        geocoded.reduce((sum, p) => sum + parseFloat(p.longitude), 0) / geocoded.length
      ];
    }
    return [50.92, -1.36];
  }, [properties]);

  // Upcoming viewings
  const upcomingViewings = useMemo(() => {
    return properties
      .filter(p => {
        if (!p.viewingDate) return false;
        const viewDate = new Date(p.viewingDate);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return viewDate >= now && viewDate <= weekFromNow;
      })
      .sort((a, b) => new Date(a.viewingDate) - new Date(b.viewingDate));
  }, [properties]);

  // Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const updated = properties.map(p => p.id === editingId ? { ...formData, id: editingId } : p);
      setProperties(updated);
      if (userId) updateProperty(editingId, formData);
    } else {
      addProperty(formData);
    }
    showNotificationMessage('Data saved successfully', 'success');
    setFormData(emptyProperty);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (property) => {
    setFormData({
      ...emptyProperty,
      ...property,
      commuteTimes: { ...(property.commuteTimes || {}) },
      documents: { ...emptyProperty.documents, ...(property.documents || {}) },
      conveyancing: { ...emptyProperty.conveyancing, ...(property.conveyancing || {}) }
    });
    setEditingId(property.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const property = properties.find(p => p.id === id);
    if (property && property.archived) {
      if (window.confirm('Permanently delete this property? This cannot be undone.')) {
        const updated = properties.filter(p => p.id !== id);
        setProperties(updated);
        if (userId) deleteProperty(id);
      }
    } else {
      const updated = properties.map(p => p.id === id ? { ...p, archived: true } : p);
      setProperties(updated);
      if (userId) updateProperty(id, { archived: true });
      showNotificationMessage('Property archived', 'success');
    }
  };

  const handleRestore = (id) => {
    const updated = properties.map(p => p.id === id ? { ...p, archived: false } : p);
    setProperties(updated);
    if (userId) updateProperty(id, { archived: false });
    showNotificationMessage('Property restored', 'success');
  };

  const toggleFavorite = (id) => {
    const prop = properties.find(p => p.id === id);
    const updated = properties.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p);
    setProperties(updated);
    if (userId) updateProperty(id, { favorite: !prop.favorite });
  };

  const updateRating = (id, rating) => {
    const updated = properties.map(p => p.id === id ? { ...p, rating } : p);
    setProperties(updated);
    if (userId) updateProperty(id, { rating });
  };

  const toggleDocumentCheck = (propertyId, docKey) => {
    const updated = properties.map(p => {
      if (p.id === propertyId) {
        const newDocs = { ...emptyProperty.documents, ...(p.documents || {}), [docKey]: !(p.documents || {})[docKey] };
        return { ...p, documents: newDocs };
      }
      return p;
    });
    setProperties(updated);
    const prop = updated.find(p => p.id === propertyId);
    if (userId && prop) updateProperty(propertyId, { documents: prop.documents });
  };

  const toggleCompare = (id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(cid => cid !== id);
      if (prev.length >= 4) {
        showNotificationMessage('Maximum 4 properties for comparison', 'error');
        return prev;
      }
      return [...prev, id];
    });
  };

  const geocodePostcode = async (postcode) => {
    if (!postcode) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(postcode)}&country=GB&format=json&limit=1`,
        { headers: { 'User-Agent': 'PropertyTracker/1.0' } }
      );
      const data = await response.json();
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, latitude: data[0].lat, longitude: data[0].lon }));
        showNotificationMessage('Location found', 'success');
      } else {
        showNotificationMessage('Postcode not found', 'error');
      }
    } catch {
      showNotificationMessage('Geocoding failed', 'error');
    }
  };

  const handlePrintSingle = (propertyId) => {
    const prevExpanded = expandedId;
    setExpandedId(propertyId);
    setTimeout(() => {
      window.print();
      setExpandedId(prevExpanded);
    }, 200);
  };

  const exportData = () => {
    const exportObj = { properties, professionalContacts };
    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `foundations-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    try { localStorage.setItem(STORAGE_LAST_EXPORT_KEY, Date.now().toString()); } catch {}
    showNotificationMessage('Data exported successfully', 'success');
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          const importedProperties = Array.isArray(imported) ? imported : (imported.properties || []);
          const importedContacts = !Array.isArray(imported) && imported.professionalContacts ? imported.professionalContacts : null;
          if (Array.isArray(importedProperties)) {
            const merged = importedProperties.map(mergeDefaults);
            setProperties(merged);
            if (importedContacts) {
              saveProfessionalContacts({ ...emptyContacts, ...importedContacts });
            }
            showNotificationMessage(`Imported ${merged.length} properties${importedContacts ? ' + contacts' : ''}`, 'success');
          } else {
            showNotificationMessage('Invalid file format', 'error');
          }
        } catch {
          showNotificationMessage('Failed to parse file', 'error');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const copyToClipboard = async () => {
    try {
      const exportObj = { properties, professionalContacts };
      await navigator.clipboard.writeText(JSON.stringify(exportObj, null, 2));
      showNotificationMessage('Data copied to clipboard', 'success');
    } catch {
      showNotificationMessage('Failed to copy to clipboard', 'error');
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const imported = JSON.parse(text);
      const importedProperties = Array.isArray(imported) ? imported : (imported.properties || []);
      const merged = importedProperties.map(mergeDefaults);
      setProperties(merged);
      if (imported.professionalContacts) {
        const mergedContacts = {
          solicitor: { ...professionalContacts.solicitor, ...imported.professionalContacts.solicitor },
          broker: { ...professionalContacts.broker, ...imported.professionalContacts.broker },
          mortgage: { ...professionalContacts.mortgage, ...imported.professionalContacts.mortgage }
        };
        saveProfessionalContacts(mergedContacts);
      }
      showNotificationMessage(`Imported ${merged.length} properties from clipboard`, 'success');
    } catch {
      showNotificationMessage('Failed to paste - invalid data or clipboard empty', 'error');
    }
  };

  const handleQuickAdd = () => {
    setFormData({ ...emptyProperty, listingUrl: quickAddUrl });
    setQuickAddUrl('');
    setShowQuickAdd(false);
    setEditingId(null);
    setShowForm(true);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  // Auth gate
  if (!isAuthenticated) {
    const existingDataCount = (() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved).length : 0;
      } catch { return 0; }
    })();
    return <LoginPage onSignIn={signInWithGoogle} existingDataCount={existingDataCount} />;
  }

  if (propsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading your properties...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 md:p-6">
      <Notification notification={notification} />

      {showMigration && (
        <MigrationPrompt
          userId={userId}
          onComplete={() => setShowMigration(false)}
          onSkip={() => setShowMigration(false)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <Header
          properties={properties}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onPrintAll={() => setPrintMode(true)}
          onExport={exportData}
          onImport={importData}
          onCopyClipboard={copyToClipboard}
          onPasteClipboard={pasteFromClipboard}
          onShowContacts={() => setShowContactsModal(true)}
          onShowCommuteSettings={() => setShowCommuteSettings(true)}
          onShowQuickAdd={() => setShowQuickAdd(true)}
          onAddProperty={() => { setShowForm(true); setEditingId(null); setFormData(emptyProperty); }}
          isOnline={isOnline}
          pendingCount={pendingCount}
          onSignOut={signOut}
          user={user}
        />

        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterFavorites={filterFavorites}
          onToggleFavorites={() => setFilterFavorites(!filterFavorites)}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <ViewingsDashboard viewings={upcomingViewings} />

        <PropertyForm
          show={showForm}
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          formSections={formSections}
          setFormSections={setFormSections}
          commuteDestinations={commuteDestinations}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          onShowCommuteSettings={() => setShowCommuteSettings(true)}
          onGeocodePostcode={geocodePostcode}
        />

        <QuickAddModal
          show={showQuickAdd}
          quickAddUrl={quickAddUrl}
          onUrlChange={setQuickAddUrl}
          onSubmit={handleQuickAdd}
          onClose={() => setShowQuickAdd(false)}
        />

        <ContactsModal
          show={showContactsModal}
          contacts={professionalContacts}
          onContactsChange={setProfessionalContacts}
          onSave={saveProfessionalContacts}
          onClose={() => setShowContactsModal(false)}
        />

        <CommuteSettingsModal
          show={showCommuteSettings}
          destinations={commuteDestinations}
          onSave={saveCommuteDestinations}
          onClose={() => setShowCommuteSettings(false)}
        />

        <CompareModal
          show={showCompareModal}
          compareIds={compareIds}
          properties={properties}
          commuteDestinations={commuteDestinations}
          onClearAndClose={() => { setCompareIds([]); setShowCompareModal(false); }}
          onClose={() => setShowCompareModal(false)}
        />

        <PhotoLightbox
          photo={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
        />

        {/* Floating Compare Button */}
        {compareIds.length >= 2 && (
          <div className="fixed bottom-6 right-6 z-30 print:hidden">
            <button onClick={() => setShowCompareModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all">
              <BarChart3 size={20} /> Compare ({compareIds.length})
            </button>
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <MapView
            properties={filteredProperties}
            mapCenter={mapCenter}
            onViewDetails={(id) => { setExpandedId(id); setViewMode('list'); }}
          />
        )}

        {/* Property Cards */}
        {viewMode === 'list' && (filteredProperties.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Home className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No properties yet</h3>
            <p className="text-slate-400 dark:text-slate-500 mb-4">Start tracking properties you're interested in</p>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyProperty); }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus size={20} /> Add Your First Property
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                expanded={expandedId === property.id}
                printMode={printMode}
                compareIds={compareIds}
                commuteDestinations={commuteDestinations}
                professionalContacts={professionalContacts}
                swipedCardId={swipedCardId}
                onToggleExpand={() => setExpandedId(expandedId === property.id ? null : property.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onToggleFavorite={toggleFavorite}
                onUpdateRating={updateRating}
                onToggleCompare={toggleCompare}
                onToggleDocumentCheck={toggleDocumentCheck}
                onPrintSingle={handlePrintSingle}
                onLightboxPhoto={setLightboxPhoto}
                onSwipedCardId={setSwipedCardId}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
