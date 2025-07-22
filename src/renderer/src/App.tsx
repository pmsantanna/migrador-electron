import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Topbar from './components/Topbar/Topbar'
import DashboardPage from './pages/DashboardPage'

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

  const handleCreateClick = () => {
    console.log('Create button clicked')
    // TODO: Implement create modal or navigation
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard'
      case 'pipelines':
        return 'Pipelines'
      case 'connections':
        return 'Connections'
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
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'pipelines':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pipelines</h2>
            <p className="text-gray-600">Pipeline management page coming soon...</p>
          </div>
        )
      case 'connections':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Connections</h2>
            <p className="text-gray-600">Database connections page coming soon...</p>
          </div>
        )
      case 'monitoring':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Monitoring</h2>
            <p className="text-gray-600">Monitoring dashboard coming soon...</p>
          </div>
        )
      case 'history':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">History</h2>
            <p className="text-gray-600">Execution history coming soon...</p>
          </div>
        )
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Application settings coming soon...</p>
          </div>
        )
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden m-0 p-0">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar activeItem={currentPage} onItemClick={setCurrentPage} />
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
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">{renderCurrentPage()}</div>
        </main>
      </div>
    </div>
  )
}

export default App
