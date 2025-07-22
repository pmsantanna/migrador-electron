import React, { useState } from 'react'
import {
  LayoutDashboard,
  GitBranch,
  Database,
  Activity,
  History,
  Settings,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

interface SidebarProps {
  className?: string
  activeItem?: any
  onItemClick?: (string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [activeItem, setActiveItem] = useState('dashboard')
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      hasSubmenu: false
    },
    {
      id: 'pipelines',
      label: 'Pipelines',
      icon: GitBranch,
      hasSubmenu: false
    },
    {
      id: 'connections',
      label: 'Connections',
      icon: Database,
      hasSubmenu: true,
      submenu: ['MySQL', 'PostgreSQL', 'SQLite']
    },
    {
      id: 'executions',
      label: 'Executions',
      icon: Activity,
      hasSubmenu: true,
      submenu: ['Running', 'Completed', 'Failed', 'Scheduled']
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Activity,
      hasSubmenu: false
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      hasSubmenu: false
    }
  ]

  return (
    <div
      className={`w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col ${className || ''}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Migrador RHF</h1>
            <p className="text-xs text-gray-500">Pipeline Manager</p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-6 py-3 bg-green-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-medium">System Online</span>
          <span className="text-gray-500 ml-auto">3 running</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          const isExpanded = expandedItems.includes(item.id)

          return (
            <div key={item.id} className="px-4 !mb-2">
              <button
                onClick={() => {
                  setActiveItem(item.id)
                  if (item.hasSubmenu) {
                    toggleExpanded(item.id)
                  }
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left group
                  ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm font-medium'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.hasSubmenu && (
                  <div className="ml-auto">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </button>

              {/* Submenu */}
              {item.hasSubmenu && isExpanded && item.submenu && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.submenu.map((subItem, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      {/* Ícones específicos para subitens */}
                      {subItem === 'Running' && <Play className="w-3 h-3 text-green-500" />}
                      {subItem === 'Completed' && (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      )}
                      {subItem === 'Failed' && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      {subItem === 'Scheduled' && <Clock className="w-3 h-3 text-blue-500" />}
                      <span>{subItem}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Settings at bottom */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-gray-900 transition-all duration-200 text-left">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
