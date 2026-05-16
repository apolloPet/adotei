
import { FilterType, User } from '../types';
import UserFilterBadges from '../UserFilterBadges';
import UserFilterDropdown from '../UserFilterDropdown';
import UserSearchBar from '../UserSearchBar';
import UserViewToggle from '../UserViewToggle';

interface UserListHeaderProps {
  viewMode: 'simple' | 'detailed';
  setViewMode: (mode: 'simple' | 'detailed') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FilterType;
  setFilters: React.Dispatch<React.SetStateAction<FilterType>>;
  users: User[];
}

export const UserListHeader = ({ 
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  users,
}: UserListHeaderProps) => {
  const cityOptions = Array.from(new Set(users
    .map(user => user.address?.city || '')
    .filter(Boolean)));
  
  const neighborhoodOptions = Array.from(new Set(users
    .map(user => user.address?.neighborhood || '')
    .filter(Boolean)));

  const updateFilter = (
    key: keyof FilterType, 
    value: string[] | boolean | null
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayFilter = (key: keyof FilterType, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [key]: currentArray.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [key]: [...currentArray, value]
        };
      }
    });
  };

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value) && value.length > 0) return count + 1;
    if (value !== null) return count + 1;
    return count;
  }, 0);

  return (
    <div className="px-3 sm:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <UserViewToggle 
            viewMode={viewMode} 
            setViewMode={setViewMode}
          />
          
          <UserSearchBar 
            searchTerm={searchTerm}
            handleSearch={setSearchTerm}
          />
          
          <UserFilterDropdown 
            filters={filters}
            updateFilter={updateFilter}
            toggleArrayFilter={toggleArrayFilter}
            cityOptions={cityOptions}
            neighborhoodOptions={neighborhoodOptions}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      </div>
      
      <UserFilterBadges 
        filters={filters} 
        updateFilter={updateFilter} 
      />
    </div>
  );
};
