import React from 'react'
import { Database, MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react'
import { Connection } from '@renderer/types'

interface ConnectionCardProps {
  connection: Connection
  onEdit: (connection: Connection) => void
  onDelete: (id: string) => void
  onTest: (id: string) => void
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onEdit,
  onDelete,
  onTest
}) => {
  const getTypeIcon = () => {
    const iconClass = 'w-6 h-6 text-white'
    const containerClass = 'w-12 h-12 rounded-xl flex items-center justify-center'

    switch (connection.type) {
      case 'MySQL':
        return (
          <div className={`${containerClass} bg-gradient-to-br from-orange-200 to-orange-600`}>
            <Database className={iconClass} />
          </div>
        )
      case 'PostgreSQL':
        return (
          <div className={`${containerClass} bg-gradient-to-br from-blue-400 to-blue-600`}>
            <Database className={iconClass} />
          </div>
        )
      case 'SQLite':
        return (
          <div className={`${containerClass} bg-gradient-to-br from-green-400 to-green-600`}>
            <Database className={iconClass} />
          </div>
        )
      case 'SQL Server':
        return (
          <div className={`${containerClass} bg-gradient-to-br from-red-400 to-red-600`}>
            <Database className={iconClass} />
          </div>
        )
      default:
        return (
          <div className={`${containerClass} bg-gradient-to-br from-gray-400 to-gray-600`}>
            <Database className={iconClass} />
          </div>
        )
    }
  }

  const getStatusBadge = () => {
    switch (connection.status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <ArrowUp className="w-3 h-3" />
            Active
          </span>
        )
      case 'disconnected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <ArrowDown className="w-3 h-3" />
            Offline
          </span>
        )
      case 'testing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            Testing...
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            Unknown
          </span>
        )
    }
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        {/* Icon */}
        {getTypeIcon()}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {connection.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{connection.type}</p>
        </div>

        {/* Price equivalent - Host:Port */}
        <div className="text-right">
          <p className="font-semibold text-gray-900 text-sm">{connection.host}</p>
          <div className="mt-1">{getStatusBadge()}</div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectionCard
