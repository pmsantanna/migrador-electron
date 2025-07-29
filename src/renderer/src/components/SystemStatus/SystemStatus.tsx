// components/SystemStatus.tsx
import React, { useState, useEffect } from 'react'
import { Info, Monitor, HardDrive, Wifi, WifiOff } from 'lucide-react'
import { jsonStorageService } from '@renderer/services/jsonStorageService'

interface SystemStatusProps {
  className?: string
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

  const getEnvironmentIcon = (env: string) => {
    switch (env) {
      case 'electron':
        return <HardDrive className="w-4 h-4 text-blue-600" />
      case 'browser':
        return <Monitor className="w-4 h-4 text-orange-600" />
      default:
        return <WifiOff className="w-4 h-4 text-red-600" />
    }
  }

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'electron':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'browser':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  const getEnvironmentLabel = (env: string) => {
    switch (env) {
      case 'electron':
        return 'Produção (Electron)'
      case 'browser':
        return 'Desenvolvimento (Browser)'
      default:
        return 'Desconhecido'
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        Verificando sistema...
      </div>
    )
  }

  if (!status) {
    return (
      <div className={`flex items-center gap-2 text-sm text-red-600 ${className}`}>
        <WifiOff className="w-4 h-4" />
        Sistema indisponível
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Status Badge */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getEnvironmentColor(status.environment)}`}
      >
        {getEnvironmentIcon(status.environment)}
        {getEnvironmentLabel(status.environment)}
        {status.available ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      </div>

      {/* Detailed Info */}
      <div className="mt-2 text-xs text-gray-600 space-y-1">
        <div>
          📍 <strong>Local:</strong> {status.appPath || 'N/A'}
        </div>
        <div>
          📄 <strong>Arquivo:</strong> {status.fileExists ? '✅ Existe' : '❌ Não existe'}
        </div>
        {status.fileInfo && (
          <div>
            📊 <strong>Tamanho:</strong> {formatBytes(status.fileInfo.size)}
          </div>
        )}
        {status.backupsCount !== undefined && (
          <div>
            🗂️ <strong>Backups:</strong> {status.backupsCount}
          </div>
        )}
        <div className="pt-1 border-t border-gray-200">
          <span className="text-gray-500">{status.message}</span>
        </div>
      </div>
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
