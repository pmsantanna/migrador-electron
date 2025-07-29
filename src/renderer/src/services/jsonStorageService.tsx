// services/jsonStorageService.ts
import { Connection } from '@renderer/types/index'

export interface ConnectionsData {
  connections: Connection[]
  lastUpdated: string
  version: string
}

export interface FileInfo {
  size: number
  created: Date
  modified: Date
  path: string
}

export class JsonStorageService {
  private readonly CONNECTIONS_FILE = 'connections.json'
  private readonly STORAGE_KEY = 'database_connections'

  // Verificar ambiente
  private get isElectron(): boolean {
    return typeof window !== 'undefined' && (window as any).electronAPI != null
  }

  private get isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  }

  private get currentEnvironment(): string {
    if (this.isElectron) return 'electron'
    if (this.isBrowser) return 'browser'
    return 'unknown'
  }

  // ===============================
  // MÉTODOS PRINCIPAIS
  // ===============================

  // Carregar conexões (auto-detecta ambiente)
  async loadConnections(): Promise<Connection[]> {
    console.log(`🔍 Carregando conexões no ambiente: ${this.currentEnvironment}`)

    try {
      if (this.isElectron) {
        return await this.loadFromElectron()
      } else if (this.isBrowser) {
        return this.loadFromLocalStorage()
      } else {
        console.warn('⚠️ Nenhum método de armazenamento disponível')
        return []
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conexões:', error)
      return []
    }
  }

  // Salvar conexões (auto-detecta ambiente)
  async saveConnections(connections: Connection[]): Promise<void> {
    console.log(
      `💾 Salvando ${connections.length} conexões no ambiente: ${this.currentEnvironment}`
    )

    try {
      if (this.isElectron) {
        await this.saveToElectron(connections)
      } else if (this.isBrowser) {
        this.saveToLocalStorage(connections)
      } else {
        console.warn('⚠️ Nenhum método de armazenamento disponível')
        return
      }

      console.log(`✅ Conexões salvas com sucesso!`)
    } catch (error) {
      console.error('❌ Erro ao salvar conexões:', error)
      throw error
    }
  }

  // Exportar conexões (funciona em qualquer ambiente)
  async exportConnections(connections: Connection[]): Promise<string> {
    const data: ConnectionsData = {
      connections: connections.map((conn) => ({
        ...conn,
        password: '' // Não exportar senhas
      })),
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }

    console.log(`📤 Preparadas ${connections.length} conexões para exportação`)
    return JSON.stringify(data, null, 2)
  }

  // Importar conexões (funciona em qualquer ambiente)
  async importConnections(fileContent: string): Promise<Connection[]> {
    try {
      const data = JSON.parse(fileContent)

      if (!data.connections || !Array.isArray(data.connections)) {
        throw new Error('Formato de arquivo inválido - esperado array "connections"')
      }

      const importedConnections = data.connections.map((conn) => this.sanitizeConnection(conn))
      console.log(`📥 Validadas ${importedConnections.length} conexões para importação`)
      return importedConnections
    } catch (error) {
      console.error('❌ Erro ao importar:', error)
      throw new Error(`Falha na importação: ${error}`)
    }
  }

  // ===============================
  // MÉTODOS ELECTRON
  // ===============================

  private async loadFromElectron(): Promise<Connection[]> {
    try {
      const exists = await (window as any).electronAPI.fs.exists(this.CONNECTIONS_FILE)
      if (!exists) {
        console.log('📁 Arquivo Electron não existe ainda')
        return []
      }

      const fileContent = await (window as any).electronAPI.fs.readFile(this.CONNECTIONS_FILE)
      const data: ConnectionsData = JSON.parse(fileContent)

      if (data.connections && Array.isArray(data.connections)) {
        console.log(`✅ Carregadas ${data.connections.length} conexões do arquivo Electron`)
        return data.connections.map((conn) => this.sanitizeConnection(conn))
      }

      return []
    } catch (error) {
      console.error('❌ Erro ao carregar do Electron:', error)
      return []
    }
  }

  private async saveToElectron(connections: Connection[]): Promise<void> {
    try {
      const data: ConnectionsData = {
        connections: connections.map((conn) => ({
          ...conn,
          password: '' // Não salvar senhas
        })),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }

      const jsonContent = JSON.stringify(data, null, 2)
      await (window as any).electronAPI.fs.writeFile(this.CONNECTIONS_FILE, jsonContent)

      console.log(`💾 Salvo no arquivo Electron: ${this.CONNECTIONS_FILE}`)
    } catch (error) {
      console.error('❌ Erro ao salvar no Electron:', error)
      throw error
    }
  }

  // ===============================
  // MÉTODOS BROWSER (localStorage)
  // ===============================

  private loadFromLocalStorage(): Connection[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        console.log('📁 Nenhum dado no localStorage')
        return []
      }

      const data: ConnectionsData = JSON.parse(stored)
      if (data.connections && Array.isArray(data.connections)) {
        console.log(`✅ Carregadas ${data.connections.length} conexões do localStorage`)
        return data.connections.map((conn) => this.sanitizeConnection(conn))
      }

      return []
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error)
      return []
    }
  }

  private saveToLocalStorage(connections: Connection[]): void {
    try {
      const data: ConnectionsData = {
        connections: connections.map((conn) => ({
          ...conn,
          password: '' // Não salvar senhas
        })),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      console.log(`💾 Salvo no localStorage (${connections.length} conexões)`)
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error)
      throw error
    }
  }

  // ===============================
  // MÉTODOS DE BACKUP (só Electron)
  // ===============================

  async backupConnections(): Promise<string | null> {
    try {
      if (!this.isElectron) {
        console.warn('⚠️ Backup só disponível no Electron (modo dev usa localStorage)')
        return null
      }

      const exists = await (window as any).electronAPI.fs.exists(this.CONNECTIONS_FILE)
      if (!exists) {
        console.log('📁 Nenhum arquivo para backup')
        return null
      }

      const backupFilename = await (window as any).electronAPI.fs.backup(this.CONNECTIONS_FILE)
      console.log(`📁 Backup criado: ${backupFilename}`)
      return backupFilename
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error)
      return null
    }
  }

  async listBackups(): Promise<string[]> {
    try {
      if (!this.isElectron) {
        console.warn('⚠️ Listagem de backup só disponível no Electron')
        return []
      }

      const allFiles = await (window as any).electronAPI.fs.listFiles('backups')
      return allFiles.filter((file: string) => file.includes('connections-backup'))
    } catch (error) {
      console.error('❌ Erro ao listar backups:', error)
      return []
    }
  }

  async restoreBackup(backupFilename: string): Promise<boolean> {
    try {
      if (!this.isElectron) {
        console.warn('⚠️ Restauração só disponível no Electron')
        return false
      }

      await this.backupConnections()
      const backupContent = await (window as any).electronAPI.fs.readFile(
        `backups/${backupFilename}`
      )

      const data = JSON.parse(backupContent)
      if (!data.connections || !Array.isArray(data.connections)) {
        throw new Error('Backup inválido')
      }

      await (window as any).electronAPI.fs.writeFile(this.CONNECTIONS_FILE, backupContent)
      console.log(`🔄 Backup "${backupFilename}" restaurado`)
      return true
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error)
      return false
    }
  }

  // ===============================
  // MÉTODOS DE INFORMAÇÃO
  // ===============================

  async getFileInfo(): Promise<FileInfo | null> {
    try {
      if (this.isElectron) {
        return await (window as any).electronAPI.fs.getFileInfo(this.CONNECTIONS_FILE)
      } else if (this.isBrowser) {
        // Simular info para localStorage
        const stored = localStorage.getItem(this.STORAGE_KEY)
        const size = stored ? new Blob([stored]).size : 0
        const now = new Date()

        return {
          size,
          created: now,
          modified: now,
          path: 'localStorage (Browser)'
        }
      }
      return null
    } catch (error) {
      console.error('❌ Erro ao obter info:', error)
      return null
    }
  }

  async getAppDataPath(): Promise<string | null> {
    try {
      if (this.isElectron) {
        return await (window as any).electronAPI.fs.getAppDataPath()
      } else if (this.isBrowser) {
        return 'Browser localStorage (modo desenvolvimento)'
      }
      return null
    } catch (error) {
      console.error('❌ Erro ao obter caminho:', error)
      return null
    }
  }

  // ===============================
  // MÉTODOS AUXILIARES
  // ===============================

  isAvailable(): boolean {
    return this.isElectron || this.isBrowser
  }

  async getSystemStatus() {
    const environment = this.currentEnvironment

    if (environment === 'electron') {
      try {
        const appPath = await this.getAppDataPath()
        const fileExists = await (window as any).electronAPI.fs.exists(this.CONNECTIONS_FILE)
        const fileInfo = fileExists ? await this.getFileInfo() : null
        const backups = await this.listBackups()

        return {
          available: true,
          environment: 'electron',
          appPath,
          fileExists,
          fileInfo,
          backupsCount: backups.length,
          message: 'Sistema Electron funcionando'
        }
      } catch (error) {
        return {
          available: false,
          environment: 'electron',
          message: `Erro no Electron: ${error}`
        }
      }
    } else if (environment === 'browser') {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const hasData = !!stored
      const dataSize = stored ? new Blob([stored]).size : 0

      return {
        available: true,
        environment: 'browser',
        appPath: 'localStorage',
        fileExists: hasData,
        fileInfo: hasData
          ? {
              size: dataSize,
              created: new Date(),
              modified: new Date(),
              path: 'localStorage'
            }
          : null,
        backupsCount: 0,
        message: 'Modo desenvolvimento (localStorage)'
      }
    } else {
      return {
        available: false,
        environment: 'unknown',
        message: 'Nenhum sistema de armazenamento disponível'
      }
    }
  }

  // Migrar dados do localStorage para Electron (quando disponível)
  async migrateFromLocalStorage(): Promise<boolean> {
    try {
      if (!this.isElectron || !this.isBrowser) {
        return false
      }

      const localData = localStorage.getItem(this.STORAGE_KEY)
      if (!localData) {
        console.log('📁 Nenhum dado no localStorage para migrar')
        return false
      }

      // Verificar se já existe arquivo Electron
      const electronExists = await (window as any).electronAPI.fs.exists(this.CONNECTIONS_FILE)
      if (electronExists) {
        console.log('📁 Arquivo Electron já existe, pulando migração')
        return false
      }

      // Migrar dados
      await (window as any).electronAPI.fs.writeFile(this.CONNECTIONS_FILE, localData)
      console.log('🔄 Dados migrados do localStorage para arquivo Electron')

      // Opcionalmente, limpar localStorage
      // localStorage.removeItem(this.STORAGE_KEY)

      return true
    } catch (error) {
      console.error('❌ Erro na migração:', error)
      return false
    }
  }

  private sanitizeConnection(connection: any): Connection {
    return {
      id: connection.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: connection.name || 'Conexão sem nome',
      type: connection.type || 'MySQL',
      connectionType: connection.connectionType || 'source',
      host: connection.host || 'localhost',
      port: Number(connection.port) || this.getDefaultPort(connection.type || 'MySQL'),
      database: connection.database || '',
      username: connection.username || '',
      password: connection.password || '',
      status: connection.status || 'disconnected',
      lastTested: connection.lastTested || 'Nunca',
      createdAt: connection.createdAt || new Date().toISOString(),
      updatedAt: connection.updatedAt || new Date().toISOString()
    }
  }

  private getDefaultPort(type: string): number {
    switch (type) {
      case 'MySQL':
        return 3306
      case 'PostgreSQL':
        return 5432
      case 'SQL Server':
        return 1433
      case 'SQLite':
        return 0
      default:
        return 3306
    }
  }
}

// Instância singleton
export const jsonStorageService = new JsonStorageService()
