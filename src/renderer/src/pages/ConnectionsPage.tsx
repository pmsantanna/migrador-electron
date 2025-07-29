import React, { useState, useMemo, useEffect } from 'react'
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
  Info
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
  const [isFileInfoOpen, setIsFileInfoOpen] = useState(false)
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Carregar conexões ao montar o componente
  useEffect(() => {
    refreshConnections()
  }, [refreshConnections])

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
    try {
      if (editingConnection) {
        // Para edição, usar apenas os dados necessários
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
        await updateConnection(editingConnection.id, updateData)
      } else {
        // Para criar nova conexão, garantir que tem o tipo correto
        const newConnectionData = {
          name: connectionData.name,
          type: connectionData.type,
          connectionType: activeTab, // Usar a aba ativa
          host: connectionData.host,
          port: connectionData.port,
          database: connectionData.database,
          username: connectionData.username,
          password: connectionData.password
        }
        await saveConnection(newConnectionData)
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error('Erro ao salvar conexão:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      await deleteConnection(id)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  const handleTest = async (id: string) => {
    await retestConnection(id)
  }

  const handleExport = async () => {
    try {
      const exportData = await jsonStorageService.exportConnections(connections)

      // Criar e baixar arquivo
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `connections-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
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

      // Confirmar importação
      if (
        window.confirm(
          `Importar ${importedConnections.length} conexões? Isso irá substituir as conexões atuais.`
        )
      ) {
        // Fazer backup antes da importação
        await jsonStorageService.backupConnections()

        // Limpar conexões atuais e adicionar as importadas
        for (const conn of importedConnections) {
          const connectionData = {
            name: conn.name,
            type: conn.type,
            connectionType: conn.connectionType,
            host: conn.host,
            port: conn.port,
            database: conn.database,
            username: conn.username,
            password: conn.password || 'senha_temporaria' // Será solicitada no primeiro uso
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

    // Limpar input
    event.target.value = ''
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === type
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
        {type === 'source' ? stats.source : stats.destination}
      </span>
    </button>
  )

  const EmptyState = () => (
    <div className="text-center py-12">
      <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {searchTerm || selectedFilter !== 'all'
          ? 'Nenhuma conexão encontrada'
          : `Nenhuma conexão ${activeTab === 'source' ? 'de origem' : 'de destino'} ainda`}
      </h3>
      <p className="text-gray-600 mb-6">
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

  return (
    <div className="bg-white rounded-4xl px-6 pt-6 pb-6 space-y-6">
      {/* Header com status do sistema */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conexões de Banco de Dados</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-600">Gerencie suas conexões de origem e destino</p>
            <SystemStatus />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Info do arquivo */}
          <button
            onClick={() => setIsFileInfoOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Informações do arquivo"
          >
            <Info className="w-4 h-4" />
            Info
          </button>

          {/* Importar */}
          <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          {/* Exportar */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={connections.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
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

      {/* Abas */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <TabButton type="source" icon={ArrowRight} label="Origem" />
        <TabButton type="destination" icon={ArrowLeft} label="Destino" />
      </div>

      {/* Header de busca e filtros */}
      <ConnectionsHeader
        onCreateNew={handleCreateNew}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      {/* Stats */}
      <ConnectionsStatsComponent stats={stats} />

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <DeleteConfirmation connection={connections.find((c) => c.id === deleteConfirmId)!} />
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

      {/* Modal de informações do arquivo
      <FileInfoModal
        isOpen={isFileInfoOpen}
        onClose={() => setIsFileInfoOpen(false)}
        onRestore={refreshConnections}
      /> */}

      {/* Modal */}
      <ConnectionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        connection={editingConnection}
        isEditing={!!editingConnection}
        defaultConnectionType={activeTab}
      />
    </div>
  )
}

export default ConnectionsPage
