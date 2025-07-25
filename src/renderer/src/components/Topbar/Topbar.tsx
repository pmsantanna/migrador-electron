import React from 'react'
import { Search, Plus, Bell, MessageSquare, Settings } from 'lucide-react'

interface TopbarProps {
  title?: string
  showSearchBar?: boolean
  showCreateButton?: boolean
  onCreateClick?: () => void
  currentUser?: {
    name: string
    avatar?: string
    initials: string
  }
}

const Topbar: React.FC<TopbarProps> = ({
  title = 'Dashboard',
  showSearchBar = true,
  showCreateButton = true,
  onCreateClick,
  currentUser = { name: 'User', initials: 'U' }
}) => {
  return (
    <header className="bg-grey-50 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>

        {/* Right side - Search, Actions, Profile */}
        <div className="flex items-center gap-4">
          {showSearchBar && (
            <div className="relative">
              <Search className="w-4 h-4 rounded-full !text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search pipelines, connections..."
                className="pl-10 pr-4 py-2 w-80 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 text-sm bg-gray-50 focus:bg-white transition-colors shadow-sm"
              />
            </div>
          )}

          {/* Create Button */}
          {showCreateButton && (
            <button
              onClick={onCreateClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Messages/Logs */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-lg transition-colors">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{currentUser.initials}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
