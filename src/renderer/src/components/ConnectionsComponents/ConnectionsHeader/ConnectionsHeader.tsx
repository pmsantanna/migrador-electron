import React from 'react'
import { Plus, Search, Filter, ChevronDown } from 'lucide-react'

interface ConnectionsHeaderProps {
  onCreateNew: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedFilter: string
  onFilterChange: (filter: string) => void
}

const ConnectionsHeader: React.FC<ConnectionsHeaderProps> = ({
  onCreateNew,
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange
}) => {
  const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'connected', label: 'Conectadas' },
    { value: 'disconnected', label: 'Desconectadas' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'sqlserver', label: 'SQL Server' }
  ]

  return (
    <div className="flex items-center justify-between !mb-6 gap-3">
      {/* Title and Create Button */}
      <div className="flex grow gap-3 items-center justify-between">
        {/* <h2 className="text-xl font-semibold text-gray-900">Database Connections</h2> */}
        <button
          onClick={onCreateNew}
          className="flex justify-self-end items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Conexão
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 !text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar Conexões..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-3 w-72 border border-gray-300 text-black rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
          <select
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="
              pl-10 pr-10 py-3 
              border border-gray-300 rounded-full 
              text-gray-500 
              text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              bg-white text-sm min-w-[160px]
              appearance-none
            "
            style={{
              backgroundImage: 'none'
            }}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}

export default ConnectionsHeader
