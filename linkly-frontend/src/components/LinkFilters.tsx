import { Search, X, ArrowDownAZ, Clock, TrendingUp, Filter } from 'lucide-react';

export type StatusFilter = 'all' | 'active' | 'disabled' | 'expired';
export type SortOption = 'newest' | 'oldest' | 'clicks' | 'alphabetical';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  totalCount: number;
  filteredCount: number;
}

const statusOptions: { value: StatusFilter; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'purple' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'disabled', label: 'Disabled', color: 'red' },
  { value: 'expired', label: 'Expired', color: 'orange' },
];

const sortOptions: { value: SortOption; label: string; icon: any }[] = [
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'oldest', label: 'Oldest', icon: Clock },
  { value: 'clicks', label: 'Most Clicks', icon: TrendingUp },
  { value: 'alphabetical', label: 'A-Z', icon: ArrowDownAZ },
];

export default function LinkFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
}: Props) {
  const hasFilters = search !== '' || status !== 'all' || sortBy !== 'newest';

  const clearFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onSortChange('newest');
  };

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-xl p-4 mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, URL, or short code..."
          className="w-full pl-11 pr-10 py-3 bg-cyber-bg border border-cyber-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-500"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500 mr-1" />
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  status === opt.value
                    ? `bg-${opt.color}-500/20 border border-${opt.color}-500/50 text-${opt.color}-300`
                    : 'bg-cyber-bg border border-cyber-border text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-1.5 bg-cyber-bg border border-cyber-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {hasFilters && (
        <div className="text-sm text-slate-400 flex items-center gap-2">
          <span className="text-purple-400 font-semibold">{filteredCount}</span>
          <span>of</span>
          <span>{totalCount}</span>
          <span>links</span>
          {search && (
            <span className="text-slate-500">
              matching "<span className="text-white font-mono">{search}</span>"
            </span>
          )}
        </div>
      )}
    </div>
  );
}