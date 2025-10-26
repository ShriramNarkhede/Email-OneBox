import React from 'react';
import { Stats } from '../types';
import { getCategoryColor, getCategoryIcon } from '../utils/helpers';

interface CategoryStatsProps {
  stats: Stats;
  selectedCategory: string;
  onCategoryClick: (category: string) => void;
}

const CategoryStats: React.FC<CategoryStatsProps> = ({
  stats,
  selectedCategory,
  onCategoryClick,
}) => {
  return (
    <div>
      <h3 className="text-sm font-bold text-base-content mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Categories
      </h3>
      
      <div className="space-y-1.5">
        {stats.byCategory && Object.entries(stats.byCategory).length > 0 ? (
          Object.entries(stats.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => (
              <div
                key={category}
                onClick={() => onCategoryClick(category)}
                className={`
                  flex items-center justify-between p-2 rounded-lg cursor-pointer
                  transition-all duration-200 hover:shadow-sm
                  ${selectedCategory === category 
                    ? 'bg-primary/10 border border-primary shadow-sm' 
                    : 'bg-base-200 border border-transparent hover:bg-base-300'
                  }
                `}
              >
                <div className="flex items-center gap-1.5">
                  <div className="text-sm">{getCategoryIcon(category, 'w-4 h-4')}</div>
                  <span 
                    className="category-badge text-white text-xs"
                    style={{ backgroundColor: getCategoryColor(category) }}
                  >
                    {category}
                  </span>
                </div>
                <div className="badge badge-ghost badge-sm font-bold">{count}</div>
              </div>
            ))
        ) : (
          <div className="text-center text-base-content/60 py-3 text-xs">
            No categories yet
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryStats;