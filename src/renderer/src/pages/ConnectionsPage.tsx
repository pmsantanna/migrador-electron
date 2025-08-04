import React, { useState, useMemo, useEffect, useRef } from 'react'
import ConnectionsHeader from '@renderer/components/ConnectionsComponents/ConnectionsHeader/ConnectionsHeader'
import ConnectionsList from '@renderer/components/ConnectionsComponents/ConnectionsList/ConnectionsList'
import ConnectionsStatsComponent from '@renderer/components/ConnectionsComponents/ConnectionStats/ConnectionStats'
import ConnectionFormModal from '@renderer/components/ConnectionsComponents/ConnectionFormModal/ConnectionFormModal'
import SystemStatus from '@renderer/components/SystemStatus/SystemStatus'
import {
  Database,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Upload,
  Info,
  ChevronDown,
  Settings,
  MoreVertical
} from 'lucide-react'
import { Connection, ConnectionStats, ConnectionType } from '../types'
import { useConnections } from '../hooks/useConnections'
import { jsonStorageService } from '../services/jsonStorageService'

const ConnectionsPage: React.FC = () => {
  const {
    connections,
    isLoading,
    error,
    saveConnection,
    updateConnection,
    deleteConnection,
    retestConnection,
    refreshConnections,
    getConnectionsByType,
    clearError
  } = useConnections()

  const [activeTab, setActiveTab] = useState<'source' | 'destination'>('source')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false) // Estado para Actions dropdown
  const [showSystemStatus, setShowSystemStatus] = useState(false) // Estado para mostrar SystemStatus dentro do dropdown
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Ref para controlar clique fora do dropdown
  const actionsDropdownRef = useRef<HTMLDivElement>(null)

  // Carregar conexões ao montar o componente
  useEffect(() => {
    refreshConnections()
  }, [refreshConnections])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsDropdownRef.current &&
        !actionsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsActionsDropdownOpen(false)
      }
    }

    if (isActionsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isActionsDropdownOpen])

  // Filtrar conexões pela aba ativa
  const tabConnections = useMemo(() => {
    return connections.filter((conn) => conn.connectionType === activeTab)
  }, [connections, activeTab])

  // Calculate stats
  const stats: ConnectionStats = useMemo(
    () => ({
      total: connections.length,
      connected: connections.filter((c) => c.status === 'connected').length,
      disconnected: connections.filter((c) => c.status === 'disconnected').length,
      testing: connections.filter((c) => c.status === 'testing').length,
      source: connections.filter((c) => c.connectionType === 'source').length,
      destination: connections.filter((c) => c.connectionType === 'destination').length
    }),
    [connections]
  )

  // Filter connections
  const filteredConnections = useMemo(() => {
    return tabConnections.filter((connection) => {
      // Search filter
      const matchesSearch =
        connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        connection.database.toLowerCase().includes(searchTerm.toLowerCase())

      // Type/status filter
      let matchesFilter = true
      switch (selectedFilter) {
        case 'connected':
          matchesFilter = connection.status === 'connected'
          break
        case 'disconnected':
          matchesFilter = connection.status === 'disconnected'
          break
        case 'mysql':
          matchesFilter = connection.type === 'MySQL'
          break
        case 'postgresql':
          matchesFilter = connection.type === 'PostgreSQL'
          break
        case 'sqlite':
          matchesFilter = connection.type === 'SQLite'
          break
        case 'sqlserver':
          matchesFilter = connection.type === 'SQL Server'
          break
        default:
          matchesFilter = true
      }

      return matchesSearch && matchesFilter
    })
  }, [tabConnections, searchTerm, selectedFilter])

  const handleCreateNew = () => {
    setEditingConnection(null)
    setIsModalOpen(true)
  }

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection)
    setIsModalOpen(true)
  }

  const handleSave = async (connectionData: Connection) => {
    if (isSaving) {
      console.log('⏳ ConnectionsPage: Salvamento já em andamento, ignorando segunda chamada')
      return
    }

    setIsSaving(true)

    try {
      if (editingConnection) {
        const updateData = {
          name: connectionData.name,
          type: connectionData.type,
          connectionType: connectionData.connectionType,
          host: connectionData.host,
          port: connectionData.port,
          database: connectionData.database,
          username: connectionData.username,
          password: connectionData.password
        }
        console.log('🔄 ConnectionsPage: Editando conexão:', editingConnection.id)
        await updateConnection(editingConnection.id, updateData)
      } else {
        const newConnectionData = {
          name: connectionData.name,
          type: connectionData.type,
          connectionType: activeTab,
          host: connectionData.host,
          port: connectionData.port,
          database: connectionData.database,
          username: connectionData.username,
          password: connectionData.password
        }
        console.log('🔄 ConnectionsPage: Criando nova conexão:', newConnectionData.name)
        await saveConnection(newConnectionData)
      }

      setIsModalOpen(false)
      console.log('✅ ConnectionsPage: Operação concluída com sucesso, modal fechado')
    } catch (err) {
      console.error('❌ ConnectionsPage: Erro ao salvar conexão:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      await deleteConnection(id)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  const handleTest = async (id: string) => {
    await retestConnection(id)
  }

  const handleExport = async () => {
    try {
      const exportData = await jsonStorageService.exportConnections(connections)

      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `connections-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setIsActionsDropdownOpen(false)
    } catch (err) {
      console.error('Erro ao exportar conexões:', err)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileContent = await file.text()
      const importedConnections = await jsonStorageService.importConnections(fileContent)

      if (
        window.confirm(
          `Importar ${importedConnections.length} conexões? Isso irá substituir as conexões atuais.`
        )
      ) {
        await jsonStorageService.backupConnections()

        for (const conn of importedConnections) {
          const connectionData = {
            name: conn.name,
            type: conn.type,
            connectionType: conn.connectionType,
            host: conn.host,
            port: conn.port,
            database: conn.database,
            username: conn.username,
            password: conn.password || 'senha_temporaria'
          }

          try {
            await saveConnection(connectionData)
          } catch (err) {
            console.warn(`⚠️ Erro ao importar conexão "${conn.name}":`, err)
          }
        }

        await refreshConnections()
        alert(`✅ ${importedConnections.length} conexões importadas com sucesso!`)
      }
    } catch (err) {
      console.error('❌ Erro ao importar conexões:', err)
      alert('❌ Erro ao importar conexões. Verifique o formato do arquivo.')
    }

    event.target.value = ''
    setIsActionsDropdownOpen(false)
  }

  const TabButton = ({
    type,
    icon: Icon,
    label
  }: {
    type: ConnectionType
    icon: React.ComponentType<any>
    label: string
  }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl text-md font-semibold transition-all duration-200 ${
        activeTab === type
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
          : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      <span
        className={`ml-2 px-2.5 py-1 text-xs font-bold rounded-full transition-colors ${
          activeTab === type
            ? 'bg-white/20 text-white'
            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
        }`}
      >
        {type === 'source' ? stats.source : stats.destination}
      </span>
      {activeTab === type && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </button>
  )

  const EmptyState = () => (
    <div className="flex flex-col !items-center gap-2 !text-center py-12">
      <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {searchTerm || selectedFilter !== 'all'
          ? 'Nenhuma conexão encontrada'
          : `Nenhuma conexão ${activeTab === 'source' ? 'de origem' : 'de destino'} ainda`}
      </h3>
      <p className="text-gray-600 !mb-8">
        {searchTerm || selectedFilter !== 'all'
          ? 'Tente ajustar seus critérios de busca ou filtro'
          : `Crie sua primeira conexão ${activeTab === 'source' ? 'de origem' : 'de destino'} para começar`}
      </p>
      {!searchTerm && selectedFilter === 'all' && (
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Database className="w-4 h-4" />
          Criar Conexão {activeTab === 'source' ? 'de Origem' : 'de Destino'}
        </button>
      )}
    </div>
  )

  const DeleteConfirmation = ({ connection }: { connection: Connection }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">Excluir "{connection.name}"?</p>
          <p className="text-xs text-red-600 mt-1">
            Clique em excluir novamente para confirmar. Esta ação não pode ser desfeita.
          </p>
        </div>
        <button
          onClick={() => setDeleteConfirmId(null)}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  )

  // Dropdown de Ações (Status, Import, Export)
  const ActionsDropdown = () => {
    const handleImportClick = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (event) => {
        handleImport(event as any)
      }
      input.click()
    }

    const handleStatusClick = () => {
      setShowSystemStatus(!showSystemStatus)
    }

    const menuItems = [
      {
        id: 'status',
        label: 'System Status',
        icon: Info,
        description: 'Ver status do sistema',
        onClick: handleStatusClick,
        active: showSystemStatus
      },
      {
        id: 'import',
        label: 'Import Connections',
        icon: Upload,
        description: 'Carregar conexões de arquivo',
        onClick: handleImportClick
      },
      {
        id: 'export',
        label: 'Export Connections',
        icon: Download,
        description: 'Salvar todas as conexões',
        onClick: handleExport,
        disabled: connections.length === 0
      }
    ]

    return (
      <div className="relative" ref={actionsDropdownRef}>
        <button
          onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full border transition-colors text-sm ${
            isActionsDropdownOpen
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          title="Ações"
        >
          <Settings className="w-4 h-4" />
          Ações
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isActionsDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isActionsDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            <div className="p-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${
                      item.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : item.active
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <Icon
                        className={`w-4 h-4 ${item.active ? 'text-blue-500' : 'text-gray-500'}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                    {item.id === 'status' && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${showSystemStatus ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* SystemStatus expandido */}
            {showSystemStatus && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div
                  className="p-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  style={{
                    paddingRight: '20px', // Reserva espaço para scrollbar
                    marginRight: '-4px' // Compensa o padding extra
                  }}
                >
                  <SystemStatus />
                </div>
              </div>
            )}

            {/* Footer com info */}
            <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {connections.length} conexão{connections.length !== 1 ? 'ões' : ''} disponível
                  {connections.length !== 1 ? 'is' : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-4xl px-6 pt-6 pb-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando conexões...</span>
        </div>
      </div>
    )
  }

  const connectionToDelete = deleteConfirmId
    ? connections.find((c) => c.id === deleteConfirmId)
    : null

  return (
    <div className="bg-white rounded-4xl px-6 pt-6 pb-6 space-y-6">
      {/* Header - Layout limpo e organizado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl !font-bold text-gray-900">Conexões de Banco de Dados</h1>
          <p className="text-gray-600 !-mt-1 !mb-8">Gerencie suas conexões de origem e destino</p>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-3">
          {/* Actions Dropdown - unifica Status, Import e Export */}
          <ActionsDropdown />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
            <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header de busca e filtros */}
      <ConnectionsHeader
        onCreateNew={handleCreateNew}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      {/* Abas Premium */}
      <div className="block !justify-items-center gap-4 mb-4">
        <div className="flex gap-2">
          <TabButton type="source" icon={ArrowRight} label="Origem" />
          <TabButton type="destination" icon={ArrowLeft} label="Destino" />
        </div>
      </div>

      {/* Stats */}
      <ConnectionsStatsComponent stats={stats} />

      {/* Delete Confirmation */}
      {deleteConfirmId && connectionToDelete && (
        <DeleteConfirmation connection={connectionToDelete} />
      )}

      {/* Lista de conexões */}
      {filteredConnections.length === 0 ? (
        <EmptyState />
      ) : (
        <ConnectionsList
          connections={filteredConnections}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTest={handleTest}
        />
      )}

      {/* Modal do SystemStatus */}
      {/* Removido - agora é dropdown */}

      {/* Modal de Conexão */}
      <ConnectionFormModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        onSave={handleSave}
        connection={editingConnection}
        isEditing={!!editingConnection}
        defaultConnectionType={activeTab}
        isLoading={isSaving}
      />
    </div>
  )
}

export default ConnectionsPage
