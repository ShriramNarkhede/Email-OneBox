import React from 'react';
import { Stats } from '../types';
import CategoryStats from './CategoryStats';

interface SidebarProps {
  stats: Stats | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedAccount: string;
  setSelectedAccount: (account: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading: boolean;
  hasActiveFilters: boolean;
  onCategoryClick: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  stats,
  searchQuery,
  setSearchQuery,
  selectedAccount,
  setSelectedAccount,
  selectedCategory,
  setSelectedCategory,
  onApplyFilters,
  onClearFilters,
  loading,
  hasActiveFilters,
  onCategoryClick,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onApplyFilters();
    }
  };

  return (
    <aside className="bg-base-100 rounded-xl shadow-lg p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-base-content flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h3>
        {hasActiveFilters && (
          <button 
            onClick={onClearFilters}
            className="btn btn-ghost btn-xs gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="form-control mb-3">
        <label className="label py-1">
          <span className="label-text text-xs font-semibold">Search</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search emails..."
            className="input input-bordered w-full pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <svg 
            className="w-5 h-5 absolute right-3 top-3.5 text-base-content/40"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Account Select */}
      <div className="form-control mb-3">
        <label className="label py-1">
          <span className="label-text text-xs font-semibold">Account</span>
        </label>
        <select 
          className="select select-bordered select-sm w-full"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          <option value="">All Accounts</option>
          {stats?.byAccount && Object.entries(stats.byAccount).map(([account, count]) => (
            <option key={account} value={account}>
              {account.split('@')[0]} ({count})
            </option>
          ))}
        </select>
      </div>

      {/* Category Select */}
      <div className="form-control mb-3">
        <label className="label py-1">
          <span className="label-text text-xs font-semibold">Category</span>
        </label>
        <select 
          className="select select-bordered select-sm w-full"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {stats?.byCategory && Object.entries(stats.byCategory).map(([category, count]) => (
            <option key={category} value={category}>
              {category} ({count})
            </option>
          ))}
        </select>
      </div>

      {/* Apply Button */}
      <button 
        className="btn btn-primary btn-sm w-full mb-4 gap-2"
        onClick={onApplyFilters}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            Loading...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Apply
          </>
        )}
      </button>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-3 space-y-1">
          <div className="text-[10px] font-semibold text-base-content/60 uppercase tracking-wide mb-1">
            Active Filters
          </div>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <div className="badge badge-primary gap-1">
                {searchQuery}
                <button onClick={() => setSearchQuery('')}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {selectedAccount && (
              <div className="badge badge-secondary gap-1">
                {selectedAccount.split('@')[0]}
                <button onClick={() => setSelectedAccount('')}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {selectedCategory && (
              <div className="badge badge-accent gap-1">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('')}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="divider my-3"></div>

      {/* Category Stats */}
      {stats && (
        <CategoryStats
          stats={stats}
          selectedCategory={selectedCategory}
          onCategoryClick={onCategoryClick}
        />
      )}
    </aside>
  );
};

export default Sidebar;