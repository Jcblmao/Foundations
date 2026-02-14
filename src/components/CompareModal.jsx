import React from 'react';
import { BarChart3, X } from 'lucide-react';
import { statusLabels } from '../utils/constants';

export default function CompareModal({ show, compareIds, properties, commuteDestinations, onClearAndClose, onClose }) {
  if (!show || compareIds.length < 2) return null;

  const rows = [
    { label: 'Price', key: 'price', format: v => v ? `£${parseInt(v).toLocaleString()}` : '-', best: 'min' },
    { label: 'Bedrooms', key: 'bedrooms', format: v => v || '-', best: 'max' },
    { label: 'Bathrooms', key: 'bathrooms', format: v => v || '-', best: 'max' },
    { label: 'Sq Ft', key: 'sqft', format: v => v || '-', best: 'max' },
    { label: 'EPC Rating', key: 'epcRating', format: v => v || '-' },
    { label: 'Council Tax', key: 'councilTaxBand', format: v => v ? `Band ${v}` : '-' },
    ...commuteDestinations.map(d => ({ label: `Commute to ${d.name}`, key: `commute_${d.id}`, format: v => v ? `${v} min` : '-', best: 'min', isCommute: true, destId: d.id })),
    { label: 'Flood Risk', key: 'floodRisk', format: v => v || '-' },
    { label: 'Chain Length', key: 'chainLength', format: v => v || '-' },
    { label: 'Rating', key: 'rating', format: v => v ? `${v}/5` : '-', best: 'max' },
    { label: 'Status', key: 'status', format: v => statusLabels[v] || v || '-' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-[95vw] w-full max-h-[85vh] overflow-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><BarChart3 size={22} /> Property Comparison</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2 text-slate-500 font-medium min-w-[120px]">Field</th>
                {compareIds.map(id => {
                  const prop = properties.find(p => p.id === id);
                  return prop ? <th key={id} className="text-left p-2 text-slate-700 font-semibold min-w-[150px]"><div className="truncate max-w-[200px]">{prop.address}</div></th> : null;
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const values = compareIds.map(id => {
                  const prop = properties.find(p => p.id === id);
                  if (!prop) return '';
                  if (row.isCommute) return (prop.commuteTimes && prop.commuteTimes[row.destId]) || '';
                  return prop[row.key] ?? '';
                });
                let bestValue = null;
                if (row.best === 'max') {
                  const nums = values.map(v => parseFloat(v) || 0);
                  bestValue = Math.max(...nums);
                } else if (row.best === 'min') {
                  const nums = values.filter(v => v).map(v => parseFloat(v) || Infinity);
                  bestValue = nums.length > 0 ? Math.min(...nums) : null;
                }
                return (
                  <tr key={row.key} className="border-t border-slate-100">
                    <td className="p-2 text-slate-500 font-medium">{row.label}</td>
                    {values.map((val, i) => {
                      const numVal = parseFloat(val) || 0;
                      const isBest = row.best === 'max' ? numVal === bestValue && numVal > 0
                        : row.best === 'min' ? numVal === bestValue && val
                        : false;
                      return (
                        <td key={i} className={`p-2 ${isBest ? 'text-emerald-700 font-semibold bg-emerald-50' : 'text-slate-700'}`}>
                          {row.format ? row.format(val) : (val || '-')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button onClick={onClearAndClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all">Clear Selection & Close</button>
        </div>
      </div>
    </div>
  );
}
