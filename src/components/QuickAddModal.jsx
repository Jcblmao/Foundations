import React from 'react';
import { Link, X, Plus } from 'lucide-react';

export default function QuickAddModal({ show, quickAddUrl, onUrlChange, onSubmit, onClose }) {
  if (!show) return null;

  const detectedSource = (() => {
    try {
      if (!quickAddUrl) return null;
      const hostname = new URL(quickAddUrl).hostname.toLowerCase();
      if (hostname.includes('rightmove')) return 'Rightmove';
      if (hostname.includes('zoopla')) return 'Zoopla';
      if (hostname.includes('onthemarket')) return 'OnTheMarket';
      return null;
    } catch { return null; }
  })();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Link size={20} /> Quick Add from URL
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Paste a property listing URL to start a new entry. The URL will be saved automatically and the full form will open for you to fill in the details.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Listing URL</label>
            <input type="url" value={quickAddUrl} onChange={(e) => onUrlChange(e.target.value)} placeholder="https://www.rightmove.co.uk/properties/..." className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus />
          </div>
          {detectedSource && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 text-sm">
              <p className="font-medium text-emerald-700 dark:text-emerald-400">Detected: {detectedSource}</p>
              <p className="text-emerald-600 dark:text-emerald-500 text-xs mt-1">Copy the key details from the listing page and paste them into the form fields.</p>
            </div>
          )}
          <details className="text-xs text-slate-400 dark:text-slate-500">
            <summary className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">Tips for faster data entry</summary>
            <ul className="mt-2 space-y-1 list-disc list-inside text-slate-500 dark:text-slate-400">
              <li>Open the listing in a new tab alongside this form</li>
              <li>Copy-paste the address, price, and agent details directly</li>
              <li>Right-click property photos to copy image URLs for the photo gallery</li>
              <li>Use the broadband "Check" button once you've entered the postcode</li>
            </ul>
          </details>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Cancel</button>
            <button onClick={onSubmit} disabled={!quickAddUrl} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">Open Form</button>
          </div>
        </div>
      </div>
    </div>
  );
}
