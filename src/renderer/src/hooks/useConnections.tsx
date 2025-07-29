// hooks/useConnections.ts
import { useState, useEffect, useCallback } from 'react'
import { Connection, ConnectionFormData } from '@renderer/types/index'
import { connectionService, TestConnectionResult } from '../services/connectionService'

// Tipo para atualização onde password é opcional
interface ConnectionUpdateData extends Omit<ConnectionFormData, 'password'> {
  password?: string
}

interface UseConnectionsReturn {
  connections: Connection[]
  isLoading: boolean
  error: string | null
  testConnection: (connectionData: ConnectionFormData) => Promise<TestConnectionResult>
  saveConnection: (connectionData: ConnectionFormData) => Promise<Connection>
  updateConnection: (id: string, connectionData: ConnectionUpdateData) => Promise<Connection>
  deleteConnection: (id: string) => Promise<boolean>
  duplicateConnection: (id: string) => Promise<Connection | null>
  retestConnection: (id: string) => Promise<TestConnectionResult>
  refreshConnections: () => Promise<void>
  getConnectionsByType: (connectionType: 'source' | 'destination') => Promise<Connection[]>
  clearError: () => void
}

export const useConnections = (): UseConnectionsReturn => {
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar conexões iniciais
  const refreshConnections = useCallback(async () => {
    try {
      const allConnections = await connectionService.getAllConnections()
      setConnections(allConnections)
    } catch (err) {
      setError('Erro ao carregar conexões')
      console.error('Erro ao carregar conexões:', err)
    }
  }, [])

  // Carregar conexões por tipo
  const getConnectionsByType = useCallback(async (connectionType: 'source' | 'destination') => {
    try {
      return await connectionService.getConnectionsByType(connectionType)
    } catch (err) {
      setError('Erro ao carregar conexões por tipo')
      console.error('Erro ao carregar conexões por tipo:', err)
      return []
    }
  }, [])

  // Carregar conexões ao montar o hook
  useEffect(() => {
    refreshConnections()
  }, [refreshConnections])

  // Testar conexão
  const testConnection = useCallback(
    async (connectionData: ConnectionFormData): Promise<TestConnectionResult> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await connectionService.testConnection(connectionData)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao testar conexão'
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Salvar conexão
  const saveConnection = useCallback(
    async (connectionData: ConnectionFormData): Promise<Connection> => {
      setIsLoading(true)
      setError(null)

      try {
        const savedConnection = await connectionService.saveConnection(connectionData)
        refreshConnections() // Recarregar lista
        return savedConnection
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar conexão'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [refreshConnections]
  )

  // Atualizar conexão
  const updateConnection = useCallback(
    async (id: string, connectionData: ConnectionUpdateData): Promise<Connection> => {
      setIsLoading(true)
      setError(null)

      try {
        const updatedConnection = await connectionService.updateConnection(id, connectionData)
        refreshConnections() // Recarregar lista
        return updatedConnection
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar conexão'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [refreshConnections]
  )

  // Deletar conexão
  const deleteConnection = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const success = connectionService.deleteConnection(id)
        refreshConnections()
        return success
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar conexão'
        setError(errorMessage)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [refreshConnections]
  )

  // Duplicar conexão
  const duplicateConnection = useCallback(
    async (id: string): Promise<Connection | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const duplicated = await connectionService.duplicateConnection(id)
        if (duplicated) {
          await refreshConnections() // Recarregar lista
        }
        return duplicated
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao duplicar conexão'
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [refreshConnections]
  )

  // Re-testar conexão existente
  const retestConnection = useCallback(
    async (id: string): Promise<TestConnectionResult> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await connectionService.retestConnection(id)
        await refreshConnections() // Recarregar para atualizar status
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao testar conexão'
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage
        }
      } finally {
        setIsLoading(false)
      }
    },
    [refreshConnections]
  )

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    connections,
    isLoading,
    error,
    testConnection,
    saveConnection,
    updateConnection,
    deleteConnection,
    duplicateConnection,
    retestConnection,
    refreshConnections,
    getConnectionsByType,
    clearError
  }
}
