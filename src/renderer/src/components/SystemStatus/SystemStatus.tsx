// components/SystemStatus.tsx
import React, { useState, useEffect } from 'react'
import {
  Info,
  Monitor,
  HardDrive,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  FolderOpen,
  Database,
  Archive
} from 'lucide-react'
import { jsonStorageService } from '@renderer/services/jsonStorageService'

interface SystemStatusProps {
  className?: string
}

interface StatusItem {
  id: string
  label: string
  value: string | number | boolean
  icon: React.ComponentType<any>
  status: 'success' | 'warning' | 'error' | 'info'
  description?: string
}

const SystemStatus: React.FC<SystemStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSystemStatus()
  }, [])

  const loadSystemStatus = async () => {
    setIsLoading(true)
    try {
      const systemStatus = await jsonStorageService.getSystemStatus()
      setStatus(systemStatus)
    } catch (error) {
      console.error('Erro ao carregar status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEnvironmentInfo = (env: string) => {
    switch (env) {
      case 'electron':
        return {
          icon: HardDrive,
          label: 'Produção (Electron)',
          status: 'success' as const,
          color: 'text-blue-600'
        }
      case 'browser':
        return {
          icon: Monitor,
          label: 'Desenvolvimento (Browser)',
          status: 'warning' as const,
          color: 'text-orange-600'
        }
      default:
        return {
          icon: WifiOff,
          label: 'Desconhecido',
          status: 'error' as const,
          color: 'text-red-600'
        }
    }
  }

  const getStatusItems = (): StatusItem[] => {
    if (!status) return []

    const envInfo = getEnvironmentInfo(status.environment)

    return [
      {
        id: 'environment',
        label: 'Ambiente',
        value: envInfo.label,
        icon: envInfo.icon,
        status: envInfo.status,
        description: 'Tipo de ambiente em execução'
      },
      {
        id: 'connection',
        label: 'Conexão',
        value: status.available ? 'Conectado' : 'Desconectado',
        icon: status.available ? Wifi : WifiOff,
        status: status.available ? 'success' : 'error',
        description: 'Status da conexão com o sistema de arquivos'
      },
      {
        id: 'file',
        label: 'Arquivo de Dados',
        value: status.fileExists ? 'Existe' : 'Não encontrado',
        icon: Database,
        status: status.fileExists ? 'success' : 'warning',
        description: 'Arquivo principal de conexões'
      },
      {
        id: 'size',
        label: 'Tamanho do Arquivo',
        value: status.fileInfo ? formatBytes(status.fileInfo.size) : 'N/A',
        icon: FolderOpen,
        status: 'info',
        description: 'Tamanho atual do arquivo de dados'
      },
      {
        id: 'backups',
        label: 'Backups',
        value: status.backupsCount ?? 0,
        icon: Archive,
        status: (status.backupsCount ?? 0) > 0 ? 'success' : 'warning',
        description: 'Número de backups disponíveis'
      }
    ]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getValueColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-700'
      case 'warning':
        return 'text-yellow-700'
      case 'error':
        return 'text-red-700'
      default:
        return 'text-blue-700'
    }
  }

  const StatusItem: React.FC<{ item: StatusItem }> = ({ item }) => {
    const Icon = item.icon

    return (
      <div className="flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-md transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-500" />
            {getStatusIcon(item.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">{item.label}</div>
            {item.description && (
              <div className="text-xs text-gray-500 truncate">{item.description}</div>
            )}
          </div>
        </div>
        <div className={`text-sm font-medium ${getValueColor(item.status)}`}>
          {typeof item.value === 'boolean' ? (item.value ? 'Sim' : 'Não') : item.value}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Carregando status do sistema...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">Sistema indisponível</p>
            <p className="text-xs text-gray-500 mt-1">Não foi possível carregar o status</p>
          </div>
        </div>
      </div>
    )
  }

  const statusItems = getStatusItems()
  const envInfo = getEnvironmentInfo(status.environment)

  return (
    <div className={`${className}`}>
      {/* Header com resumo */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <envInfo.icon className={`w-5 h-5 ${envInfo.color}`} />
          <span className="font-medium text-gray-900">Sistema Operacional</span>
        </div>
        <button
          onClick={loadSystemStatus}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Atualizar status"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Lista de status - similar ao dropdown menu */}
      <div className="space-y-1">
        {statusItems.map((item) => (
          <StatusItem key={item.id} item={item} />
        ))}
      </div>

      {/* Footer com caminho */}
      {status.appPath && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <FolderOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Localização:</p>
              <p className="text-xs text-gray-700 font-mono break-all">{status.appPath}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem do sistema */}
      {status.message && (
        <div className="mt-3 p-2 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">{status.message}</p>
        </div>
      )}
    </div>
  )
}

// Utility function
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default SystemStatus
