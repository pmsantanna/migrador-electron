import React from 'react'
import { Database, MoreHorizontal, ArrowUp, ArrowDown, Clock } from 'lucide-react'
import { Connection } from '@renderer/types'
import ConnectionDropdown from '../ConnectionDropdown/ConnectionDropdown'

interface ConnectionsListProps {
  connections: Connection[]
  onEdit: (connection: Connection) => void
  onDelete: (id: string) => void
  onTest: (id: string) => void
  onDuplicate?: (connection: Connection) => void
  onExport?: (connection: Connection) => void
  onToggleVisibility?: (id: string) => void
  maxItems?: number
}

const ConnectionsList: React.FC<ConnectionsListProps> = ({
  connections,
  onEdit,
  onDelete,
  onTest,
  onDuplicate,
  onExport,
  onToggleVisibility,
  maxItems = 10
}) => {
  const getTypeIcon = (type: string) => {
    const iconClass = 'w-6 h-6 text-white'
    const containerClass = 'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0'

    switch (type) {
      case 'MySQL':
        return (
          <div className={`${containerClass} bg-gradient-to-br from-orange-400 to-orange-600`}>
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-(--green-light) text-(--green-text) border-2 border-(--green-text)/20 !rounded-md text-xs !font-medium">
            {/* <ArrowUp className="w-3 h-3" /> */}
            Active
          </span>
        )
      case 'disconnected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-(--red-light) text-(--red-text) border-2 border-(--red-text)/20 !rounded-md text-xs !font-medium">
            {/* <ArrowDown className="w-3 h-3" /> */}
            Offline
          </span>
        )
      case 'testing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3 animate-spin" />
            Testing
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

  const handleDuplicate = (connection: Connection) => {
    if (onDuplicate) {
      onDuplicate(connection)
    } else {
      // Fallback implementation
      console.log('Duplicating connection:', connection.name)
      // Aqui você implementaria a lógica de duplicação
    }
  }

  const handleExport = (connection: Connection) => {
    if (onExport) {
      onExport(connection)
    } else {
      // Fallback implementation
      const configData = {
        name: connection.name,
        type: connection.type,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username
      }

      const dataStr = JSON.stringify(configData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${connection.name.replace(/\s+/g, '_')}_config.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleToggleVisibility = (id: string) => {
    if (onToggleVisibility) {
      onToggleVisibility(id)
    } else {
      // Fallback implementation
      console.log('Toggle visibility for connection:', id)
    }
  }

  const displayConnections = connections.slice(0, maxItems)

  return (
    <div className="bg-white rounded-4xl p-6 border border-gray-100 shadow-2xs">
      <h3 className="text-lg !font-semibold text-gray-900 !mb-2">Active Connections</h3>

      <div className="!space-y-2">
        {displayConnections.map((connection) => (
          <div
            key={connection.id}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {/* Icon */}
            {getTypeIcon(connection.type)}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 !align-center">
                <h4 className="!font-medium text-slate-800 leading-tight text-sm">
                  {connection.name}
                </h4>
                <div className="!-mt-1">{getStatusBadge(connection.status)}</div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{connection.type}</p>
            </div>

            {/* Host info */}
            <div className="text-right">
              <p className="!font-semibold text-gray-900 text-sm">
                {connection.host}:{connection.port}
              </p>
            </div>

            {/* Dropdown Menu */}
            <div className="relative">
              <button>
                <ConnectionDropdown
                  connection={connection}
                  onTest={onTest}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={handleDuplicate}
                  onExport={handleExport}
                  onToggleVisibility={handleToggleVisibility}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      {connections.length > maxItems && (
        <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          All connections
        </button>
      )}
    </div>
  )
}

export default ConnectionsList
