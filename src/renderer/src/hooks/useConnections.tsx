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
  const [operationsInProgress, setOperationsInProgress] = useState<Set<string>>(new Set())

  // Carregar conexões iniciais
  const refreshConnections = useCallback(async () => {
    try {
      setIsLoading(true)
      const allConnections = await connectionService.getAllConnections()
      setConnections(allConnections)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar conexões')
      console.error('Erro ao carregar conexões:', err)
    } finally {
      setIsLoading(false)
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
      }
    },
    []
  )

  // Salvar conexão
  const saveConnection = useCallback(
    async (connectionData: ConnectionFormData): Promise<Connection> => {
      const operationKey = `save_${connectionData.name}_${Date.now()}`

      // Evitar chamadas duplas usando nome da conexão
      if (operationsInProgress.has(`save_${connectionData.name}`) || isLoading) {
        console.log(
          '⏳ useConnections: Operação de salvamento já em andamento para:',
          connectionData.name
        )
        throw new Error('Operação já em andamento')
      }

      setOperationsInProgress((prev) => new Set(prev).add(`save_${connectionData.name}`))
      setIsLoading(true)
      setError(null)

      try {
        console.log('🔄 useConnections: Salvando conexão:', connectionData.name)
        const savedConnection = await connectionService.saveConnection(connectionData)

        // Atualizar estado local imediatamente
        setConnections((prev) => {
          const existingIndex = prev.findIndex((c) => c.id === savedConnection.id)
          if (existingIndex >= 0) {
            // Atualizar existente
            const newConnections = [...prev]
            newConnections[existingIndex] = savedConnection
            return newConnections
          } else {
            // Adicionar nova
            return [...prev, savedConnection]
          }
        })

        console.log('✅ useConnections: Conexão salva com sucesso')
        return savedConnection
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar conexão'
        console.error('❌ useConnections: Erro ao salvar:', errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
        setOperationsInProgress((prev) => {
          const newSet = new Set(prev)
          newSet.delete(`save_${connectionData.name}`)
          return newSet
        })
      }
    },
    [isLoading, operationsInProgress]
  )

  // Atualizar conexão
  const updateConnection = useCallback(
    async (id: string, connectionData: ConnectionUpdateData): Promise<Connection> => {
      // Evitar chamadas duplas
      if (isLoading) {
        console.log('⏳ Operação já em andamento, ignorando chamada duplicada')
        throw new Error('Operação já em andamento')
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('🔄 useConnections: Atualizando conexão:', id)
        const updatedConnection = await connectionService.updateConnection(id, connectionData)

        // Atualizar estado local imediatamente
        setConnections((prev) => {
          const newConnections = [...prev]
          const index = newConnections.findIndex((c) => c.id === id)
          if (index >= 0) {
            newConnections[index] = updatedConnection
          }
          return newConnections
        })

        console.log('✅ useConnections: Conexão atualizada com sucesso')
        return updatedConnection
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar conexão'
        console.error('❌ useConnections: Erro ao atualizar:', errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading] // Adicionar isLoading como dependência
  )

  // Deletar conexão
  const deleteConnection = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 useConnections: Deletando conexão:', id)
      const success = await connectionService.deleteConnection(id)

      if (success) {
        // Atualizar estado local imediatamente
        setConnections((prev) => prev.filter((c) => c.id !== id))
        console.log('✅ useConnections: Conexão deletada com sucesso')
      }

      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar conexão'
      console.error('❌ useConnections: Erro ao deletar:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Duplicar conexão
  const duplicateConnection = useCallback(async (id: string): Promise<Connection | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔄 useConnections: Duplicando conexão:', id)
      const duplicated = await connectionService.duplicateConnection(id)

      if (duplicated) {
        // Atualizar estado local imediatamente
        setConnections((prev) => [...prev, duplicated])
        console.log('✅ useConnections: Conexão duplicada com sucesso')
      }

      return duplicated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao duplicar conexão'
      console.error('❌ useConnections: Erro ao duplicar:', errorMessage)
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Re-testar conexão existente
  const retestConnection = useCallback(async (id: string): Promise<TestConnectionResult> => {
    setError(null)

    // Atualizar status para "testing" imediatamente
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'testing' as const } : c))
    )

    try {
      console.log('🔄 useConnections: Testando conexão:', id)
      const result = await connectionService.retestConnection(id)

      // Atualizar estado local com o resultado do teste
      setConnections((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: result.success ? ('connected' as const) : ('disconnected' as const),
                lastTested: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : c
        )
      )

      console.log('✅ useConnections: Teste concluído:', result.success ? 'sucesso' : 'falha')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao testar conexão'
      console.error('❌ useConnections: Erro ao testar:', errorMessage)

      // Reverter status em caso de erro
      setConnections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'disconnected' as const } : c))
      )

      setError(errorMessage)
      return {
        success: false,
        message: errorMessage
      }
    }
  }, [])

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
