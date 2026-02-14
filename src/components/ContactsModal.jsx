import React from 'react';
import { Briefcase, X } from 'lucide-react';

export default function ContactsModal({ show, contacts, onContactsChange, onSave, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-40 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Briefcase size={20} /> Professional Contacts</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-6">
          {/* Solicitor */}
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Solicitor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'name', placeholder: 'John Smith' },
                { key: 'firm', placeholder: 'Smith & Jones LLP' },
                { key: 'email', placeholder: 'john@smithjones.co.uk', type: 'email' },
                { key: 'phone', placeholder: '023 8012 3456' }
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 capitalize">{field.key}</label>
                  <input type={field.type || 'text'} value={contacts.solicitor[field.key]} onChange={(e) => onContactsChange(prev => ({...prev, solicitor: {...prev.solicitor, [field.key]: e.target.value}}))} placeholder={field.placeholder} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Reference</label>
                <input type="text" value={contacts.solicitor.reference} onChange={(e) => onContactsChange(prev => ({...prev, solicitor: {...prev.solicitor, reference: e.target.value}}))} placeholder="Case ref: SJ/2026/1234" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>

          {/* Broker */}
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Mortgage Broker</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'name', placeholder: '' },
                { key: 'firm', placeholder: '' },
                { key: 'email', placeholder: '', type: 'email' },
                { key: 'phone', placeholder: '' }
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 capitalize">{field.key}</label>
                  <input type={field.type || 'text'} value={contacts.broker[field.key]} onChange={(e) => onContactsChange(prev => ({...prev, broker: {...prev.broker, [field.key]: e.target.value}}))} placeholder={field.placeholder} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Mortgage */}
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Mortgage Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'lender', placeholder: 'e.g. Nationwide' },
                { key: 'product', placeholder: 'e.g. 5yr fixed' },
                { key: 'rate', placeholder: 'e.g. 4.25', label: 'Rate (%)' },
                { key: 'term', placeholder: 'e.g. 25', label: 'Term (years)' }
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{field.label || field.key.charAt(0).toUpperCase() + field.key.slice(1)}</label>
                  <input type="text" value={contacts.mortgage[field.key]} onChange={(e) => onContactsChange(prev => ({...prev, mortgage: {...prev.mortgage, [field.key]: e.target.value}}))} placeholder={field.placeholder} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-200">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">Close</button>
            <button onClick={() => onSave(contacts)} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">Save Contacts</button>
          </div>
        </div>
      </div>
    </div>
  );
}
