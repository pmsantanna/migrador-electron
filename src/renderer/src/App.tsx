import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Topbar from './components/Topbar/Topbar'
import DashboardPage from './pages/DashboardPage'
import ConnectionsPage from './pages/ConnectionsPage'

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Force fullscreen on mount
  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'
    document.documentElement.style.overflow = 'hidden'
  }, [])

  // Handle navigation from sidebar
  const handleNavigate = (pageId: string) => {
    console.log('Navigating to:', pageId) // Debug log
    setCurrentPage(pageId)
  }

  const handleCreateClick = () => {
    console.log('Create button clicked for:', currentPage)
    // TODO: Implement page-specific create actions
    switch (currentPage) {
      case 'dashboard':
        // Could open a "New Pipeline" modal
        break
      case 'connections':
        // This will be handled by the ConnectionsPage component
        break
      case 'pipelines':
        // Could open a "New Pipeline" modal
        break
      default:
        break
    }
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard'
      case 'pipelines':
        return 'Pipelines'
      case 'connections':
        return 'Connections'
      case 'executions':
        return 'Executions'
      case 'monitoring':
        return 'Monitoring'
      case 'history':
        return 'History'
      case 'settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  const renderCurrentPage = () => {
    console.log('Rendering page:', currentPage) // Debug log

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />

      case 'connections':
        return <ConnectionsPage />

      case 'pipelines':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pipelines</h2>
            <p className="text-gray-600">Pipeline management page coming soon...</p>
            <p className="text-sm text-gray-500 mt-2">
              This page will allow you to create, manage, and monitor data pipelines.
            </p>
          </div>
        )

      case 'executions':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Executions</h2>
            <p className="text-gray-600">Pipeline executions overview coming soon...</p>
            <p className="text-sm text-gray-500 mt-2">
              Monitor running, completed, failed, and scheduled executions.
            </p>
          </div>
        )

      case 'monitoring':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Monitoring</h2>
            <p className="text-gray-600">Real-time monitoring dashboard coming soon...</p>
            <p className="text-sm text-gray-500 mt-2">
              Monitor pipeline performance, resource usage, and system health.
            </p>
          </div>
        )

      case 'history':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Execution History</h2>
            <p className="text-gray-600">Pipeline execution history coming soon...</p>
            <p className="text-sm text-gray-500 mt-2">
              View detailed logs and history of all pipeline executions.
            </p>
          </div>
        )

      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Application settings coming soon...</p>
            <p className="text-sm text-gray-500 mt-2">
              Configure application preferences, security settings, and more.
            </p>
          </div>
        )

      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden m-0 p-0">
      {/* Sidebar with correct props */}
      <div className="flex-shrink-0">
        <Sidebar activeItem={currentPage} onItemClick={handleNavigate} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex-shrink-0">
          <Topbar
            title={getPageTitle()}
            onCreateClick={handleCreateClick}
            currentUser={{
              name: 'Admin User',
              initials: 'AU'
            }}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto neutral-bg">
          <div className="px-8">{renderCurrentPage()}</div>
        </main>
      </div>
    </div>
  )
}

export default App
