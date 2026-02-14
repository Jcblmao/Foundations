import React from 'react';
import { Home, Plus, Download, Upload, Moon, Sun, Briefcase, Settings, Link, Printer, Clipboard, LogOut } from 'lucide-react';
import SyncStatusBadge from './SyncStatusBadge';

export default function Header({
  properties,
  darkMode,
  onToggleDarkMode,
  onPrintAll,
  onExport,
  onImport,
  onCopyClipboard,
  onPasteClipboard,
  onShowContacts,
  onShowCommuteSettings,
  onShowQuickAdd,
  onAddProperty,
  isOnline,
  pendingCount,
  onSignOut,
  user
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Home className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Foundations</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {properties.filter(p => !p.archived).length} properties
              {properties.some(p => p.archived) ? ` (${properties.filter(p => p.archived).length} archived)` : ''}
            </p>
          </div>
          <SyncStatusBadge isOnline={isOnline} pendingCount={pendingCount} />
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            onClick={onToggleDarkMode}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={onPrintAll}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all print:hidden"
            title="Print all visible properties"
          >
            <Printer size={18} />
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            title="Export data"
          >
            <Download size={18} /> Export
          </button>
          <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">
            <Upload size={18} /> Import
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
          <button
            onClick={onCopyClipboard}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            title="Copy data to clipboard"
          >
            <Clipboard size={18} />
          </button>
          <button
            onClick={onPasteClipboard}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            title="Paste data from clipboard"
          >
            <Clipboard size={18} className="transform scale-x-[-1]" />
          </button>
          <button
            onClick={onShowContacts}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            title="Professional contacts"
          >
            <Briefcase size={18} /> Contacts
          </button>
          <button
            onClick={onShowCommuteSettings}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            title="Commute destinations"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={onShowQuickAdd}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            title="Quick add from listing URL"
          >
            <Link size={18} /> Quick Add
          </button>
          <button
            onClick={onAddProperty}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus size={20} /> Add Property
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all"
              title={user?.email ? `Sign out (${user.email})` : 'Sign out'}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
