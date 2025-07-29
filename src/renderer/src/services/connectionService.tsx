// services/connectionService.ts
import { Connection, ConnectionFormData } from '@renderer/types/index'
import { jsonStorageService } from './jsonStorageService'

export interface TestConnectionResult {
  success: boolean
  message: string
  errorCode?: string
  latency?: number
}

export class ConnectionService {
  private connections: Connection[] = []
  private isLoading = false

  constructor() {
    this.loadConnections()
  }

  // Carregar conexões do arquivo JSON
  private async loadConnections(): Promise<void> {
    if (this.isLoading) return

    this.isLoading = true
    try {
      this.connections = await jsonStorageService.loadConnections()
      console.log(`🔄 ConnectionService: ${this.connections.length} conexões carregadas`)
    } catch (error) {
      console.error('❌ Erro ao carregar conexões:', error)
      this.connections = []
    } finally {
      this.isLoading = false
    }
  }

  // Salvar conexões no arquivo JSON
  private async saveConnections(): Promise<void> {
    try {
      await jsonStorageService.saveConnections(this.connections)
    } catch (error) {
      console.error('❌ Erro ao salvar conexões:', error)
      throw error
    }
  }

  // Aguardar carregamento inicial
  private async ensureLoaded(): Promise<void> {
    while (this.isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  // Gerar ID único para nova conexão
  private generateId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Testar conexão com o banco de dados
  async testConnection(connectionData: ConnectionFormData): Promise<TestConnectionResult> {
    const startTime = Date.now()

    try {
      // Simulação de teste de conexão - substitua pela implementação real
      await this.performConnectionTest(connectionData)

      const latency = Date.now() - startTime

      return {
        success: true,
        message: 'Conexão estabelecida com sucesso!',
        latency
      }
    } catch (error) {
      return {
        success: false,
        message: this.getErrorMessage(error),
        errorCode: this.getErrorCode(error)
      }
    }
  }

  // Implementação do teste de conexão (substitua pela lógica real)
  private async performConnectionTest(connectionData: ConnectionFormData): Promise<void> {
    // Validações básicas
    this.validateConnectionData(connectionData)

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simular diferentes cenários de erro para teste
    const errorScenarios = [
      { chance: 0.1, error: 'TIMEOUT', message: 'Timeout de conexão' },
      { chance: 0.1, error: 'AUTH_FAILED', message: 'Falha na autenticação' },
      { chance: 0.05, error: 'HOST_NOT_FOUND', message: 'Host não encontrado' },
      { chance: 0.05, error: 'DATABASE_NOT_FOUND', message: 'Banco de dados não encontrado' }
    ]

    for (const scenario of errorScenarios) {
      if (Math.random() < scenario.chance) {
        throw new Error(`${scenario.error}:${scenario.message}`)
      }
    }

    // Se chegou até aqui, conexão foi bem-sucedida
  }

  // Validar dados da conexão
  private validateConnectionData(connectionData: ConnectionFormData): void {
    if (!connectionData.name?.trim()) {
      throw new Error('VALIDATION:Nome da conexão é obrigatório')
    }

    if (!connectionData.host?.trim() && connectionData.type !== 'SQLite') {
      throw new Error('VALIDATION:Host é obrigatório')
    }

    if (!connectionData.database?.trim()) {
      throw new Error('VALIDATION:Nome do banco de dados é obrigatório')
    }

    if (connectionData.type !== 'SQLite') {
      if (!connectionData.username?.trim()) {
        throw new Error('VALIDATION:Nome de usuário é obrigatório')
      }
      if (!connectionData.password?.trim()) {
        throw new Error('VALIDATION:Senha é obrigatória')
      }
    }

    // Validar porta
    if (connectionData.port && (connectionData.port < 1 || connectionData.port > 65535)) {
      throw new Error('VALIDATION:Porta deve estar entre 1 e 65535')
    }
  }

  // Extrair código de erro
  private getErrorCode(error: unknown): string {
    if (error instanceof Error && error.message.includes(':')) {
      return error.message.split(':')[0]
    }
    return 'UNKNOWN_ERROR'
  }

  // Extrair mensagem de erro amigável
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes(':')) {
        return error.message.split(':')[1]
      }
      return error.message
    }
    return 'Erro desconhecido ao testar conexão'
  }

  // Verificar se já existe conexão com o mesmo nome
  private async checkDuplicateName(name: string, excludeId?: string): Promise<boolean> {
    await this.ensureLoaded()
    return this.connections.some(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== excludeId
    )
  }

  // Salvar nova conexão
  async saveConnection(connectionData: ConnectionFormData): Promise<Connection> {
    await this.ensureLoaded()

    try {
      // Verificar nome duplicado
      const hasDuplicateName = await this.checkDuplicateName(connectionData.name, connectionData.id)
      if (hasDuplicateName) {
        throw new Error(`VALIDATION:Já existe uma conexão com o nome "${connectionData.name}"`)
      }

      // Se tem ID, é uma atualização, não testa novamente
      const isUpdate =
        !!connectionData.id && this.connections.some((c) => c.id === connectionData.id)

      if (!isUpdate) {
        // Só testa conexões novas
        console.log(`🔍 Testando nova conexão: ${connectionData.name}`)
        const testResult = await this.testConnection(connectionData)
        if (!testResult.success) {
          throw new Error(`Falha no teste de conexão: ${testResult.message}`)
        }
      } else {
        console.log(`📝 Atualizando conexão existente: ${connectionData.name}`)
      }

      const existingConnection = isUpdate
        ? this.connections.find((c) => c.id === connectionData.id)
        : null

      const connection: Connection = {
        ...connectionData,
        id: connectionData.id || this.generateId(),
        createdAt: existingConnection?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastTested: isUpdate
          ? existingConnection?.lastTested || new Date().toISOString()
          : new Date().toISOString(),
        status: isUpdate ? existingConnection?.status || 'disconnected' : 'connected'
      }

      const existingIndex = this.connections.findIndex((c) => c.id === connection.id)

      if (existingIndex >= 0) {
        // Atualizar conexão existente
        console.log(`🔄 Conexão "${connection.name}" atualizada`)
        this.connections[existingIndex] = connection
      } else {
        // Adicionar nova conexão
        console.log(`➕ Nova conexão "${connection.name}" adicionada`)
        this.connections.push(connection)
      }

      await this.saveConnections()
      return connection
    } catch (error) {
      console.error('❌ Erro ao salvar conexão:', error)
      throw error
    }
  }

  // Atualizar conexão existente
  async updateConnection(
    id: string,
    connectionData: Partial<ConnectionFormData>
  ): Promise<Connection> {
    await this.ensureLoaded()

    const existingConnection = this.connections.find((c) => c.id === id)
    if (!existingConnection) {
      throw new Error('Conexão não encontrada')
    }

    // Criar dados atualizados, preservando password se não fornecida
    const updatedData: ConnectionFormData = {
      ...existingConnection,
      ...connectionData,
      id,
      // Se password não foi fornecida ou está vazia, manter a existente
      password: connectionData.password || existingConnection.password
    }

    return this.saveConnection(updatedData)
  }

  // Obter todas as conexões
  async getAllConnections(): Promise<Connection[]> {
    await this.ensureLoaded()
    return [...this.connections]
  }

  // Obter conexões por tipo
  async getConnectionsByType(connectionType: 'source' | 'destination'): Promise<Connection[]> {
    await this.ensureLoaded()
    return this.connections.filter((c) => c.connectionType === connectionType)
  }

  // Obter conexão por ID
  getConnectionById(id: string): Connection | null {
    return this.connections.find((c) => c.id === id) || null
  }

  // Deletar conexão
  async deleteConnection(id: string): Promise<boolean> {
    await this.ensureLoaded()

    const initialLength = this.connections.length
    this.connections = this.connections.filter((c) => c.id !== id)

    if (this.connections.length < initialLength) {
      await this.saveConnections()
      return true
    }
    return false
  }

  // Duplicar conexão
  async duplicateConnection(id: string): Promise<Connection | null> {
    await this.ensureLoaded()

    const original = this.connections.find((c) => c.id === id)
    if (!original) return null

    const duplicated: Connection = {
      ...original,
      id: this.generateId(),
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'disconnected'
    }

    this.connections.push(duplicated)
    await this.saveConnections()
    return duplicated
  }

  // Testar conexão existente
  async retestConnection(id: string): Promise<TestConnectionResult> {
    await this.ensureLoaded()

    const connection = this.connections.find((c) => c.id === id)
    if (!connection) {
      return {
        success: false,
        message: 'Conexão não encontrada'
      }
    }

    // Marcar como testando
    const connectionIndex = this.connections.findIndex((c) => c.id === id)
    if (connectionIndex >= 0) {
      this.connections[connectionIndex].status = 'testing'
      await this.saveConnections()
    }

    const testData: ConnectionFormData = {
      ...connection
    }

    const result = await this.testConnection(testData)

    // Atualizar status da conexão baseado no resultado
    if (connectionIndex >= 0) {
      this.connections[connectionIndex].lastTested = new Date().toISOString()
      this.connections[connectionIndex].status = result.success ? 'connected' : 'disconnected'
      this.connections[connectionIndex].updatedAt = new Date().toISOString()
      await this.saveConnections()
    }

    return result
  }

  // Recarregar conexões do arquivo (útil após importação)
  async refreshConnections(): Promise<Connection[]> {
    this.isLoading = false // Reset do flag para permitir reload
    await this.loadConnections()
    return this.getAllConnections()
  }

  // Obter estatísticas das conexões
  async getConnectionStats() {
    await this.ensureLoaded()

    return {
      total: this.connections.length,
      connected: this.connections.filter((c) => c.status === 'connected').length,
      disconnected: this.connections.filter((c) => c.status === 'disconnected').length,
      testing: this.connections.filter((c) => c.status === 'testing').length,
      source: this.connections.filter((c) => c.connectionType === 'source').length,
      destination: this.connections.filter((c) => c.connectionType === 'destination').length,
      byType: {
        MySQL: this.connections.filter((c) => c.type === 'MySQL').length,
        PostgreSQL: this.connections.filter((c) => c.type === 'PostgreSQL').length,
        SQLite: this.connections.filter((c) => c.type === 'SQLite').length,
        'SQL Server': this.connections.filter((c) => c.type === 'SQL Server').length
      }
    }
  }

  // Limpar todas as conexões (útil para reset)
  async clearAllConnections(): Promise<void> {
    await this.ensureLoaded()

    if (
      window.confirm(
        '⚠️ Tem certeza que deseja excluir TODAS as conexões? Esta ação não pode ser desfeita.'
      )
    ) {
      // Fazer backup antes de limpar
      await jsonStorageService.backupConnections()

      this.connections = []
      await this.saveConnections()
      console.log('🗑️ Todas as conexões foram removidas')
    }
  }
}

// Instância singleton
export const connectionService = new ConnectionService()
