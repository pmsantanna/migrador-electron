export type DatabaseType = 'MySQL' | 'PostgreSQL' | 'SQLite' | 'SQL Server'
export type ConnectionStatus = 'connected' | 'disconnected' | 'testing'
export type PipelineStatus = 'draft' | 'active' | 'paused' | 'running' | 'completed' | 'failed'
export type ConnectionType = 'source' | 'destination'

export interface Connection {
  id: string
  name: string
  type: DatabaseType
  connectionType: ConnectionType
  host: string
  port: number
  database: string
  status: ConnectionStatus
  lastTested: string
  createdAt: string
  username: string
  password: string
  updatedAt: string
}

export interface ConnectionFormData {
  id?: string
  name: string
  type: DatabaseType
  connectionType: ConnectionType
  host: string
  port: number
  database: string
  username: string
  password: string
}

export interface ConnectionStats {
  total: number
  connected: number
  disconnected: number
  testing: number
  // Novas estatísticas por tipo
  source: number
  destination: number
}

export interface Pipeline {
  id: string
  name: string
  description?: string
  sourceConnectionId: string
  targetConnectionId: string
  sourceQuery: string
  targetTable: string
  status: PipelineStatus
  progress?: number
  lastRun?: string
  nextRun?: string
  createdAt: string
  updatedAt: string
}

export interface ExecutionHistory {
  id: string
  pipelineId: string
  pipelineName: string
  status: 'running' | 'completed' | 'failed'
  startTime: string
  endTime?: string
  duration?: number
  recordsProcessed?: number
  errorMessage?: string
}
