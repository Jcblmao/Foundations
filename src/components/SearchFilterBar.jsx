import React from 'react';
import { Search, Star, Archive, MapPin } from 'lucide-react';

export default function SearchFilterBar({
  searchTerm,
  onSearchChange,
  filterFavorites,
  onToggleFavorites,
  showArchived,
  onToggleArchived,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6 print:hidden">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search by address or postcode..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleFavorites}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              filterFavorites
                ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Star size={18} fill={filterFavorites ? 'currentColor' : 'none'} />
            Favorites
          </button>
          <button
            onClick={onToggleArchived}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              showArchived
                ? 'bg-slate-100 border-slate-400 text-slate-700 dark:bg-slate-700 dark:border-slate-500 dark:text-slate-200'
                : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Archive size={18} />
            {showArchived ? 'Archived' : 'Archive'}
          </button>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="dateAdded">Newest First</option>
            <option value="price">Price (Low to High)</option>
            <option value="rating">Rating (High to Low)</option>
          </select>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
            <button onClick={() => onViewModeChange('list')} className={`px-3 py-2 text-sm transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              List
            </button>
            <button onClick={() => onViewModeChange('map')} className={`px-3 py-2 text-sm flex items-center gap-1 transition-all ${viewMode === 'map' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <MapPin size={14} /> Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
