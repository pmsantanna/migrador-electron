// src/main/fileManager.ts
import { app, ipcMain } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'

export class FileManager {
  private appDataPath: string

  constructor() {
    // Caminho para %appdata%/YourAppName
    this.appDataPath = app.getPath('userData')
    this.setupIpcHandlers()
  }

  private setupIpcHandlers() {
    // Ler arquivo
    ipcMain.handle('fs:readFile', async (_, filename: string): Promise<string> => {
      try {
        const filePath = path.join(this.appDataPath, filename)
        const content = await fs.readFile(filePath, 'utf-8')
        return content
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          throw new Error(`Arquivo não encontrado: ${filename}`)
        }
        throw new Error(`Erro ao ler arquivo: ${(error as Error).message}`)
      }
    })

    // Escrever arquivo
    ipcMain.handle('fs:writeFile', async (_, filename: string, content: string): Promise<void> => {
      try {
        const filePath = path.join(this.appDataPath, filename)

        // Garantir que o diretório existe
        await fs.mkdir(path.dirname(filePath), { recursive: true })

        await fs.writeFile(filePath, content, 'utf-8')
        console.log(`✅ Arquivo salvo: ${filePath}`)
      } catch (error) {
        throw new Error(`Erro ao escrever arquivo: ${(error as Error).message}`)
      }
    })

    // Verificar se arquivo existe
    ipcMain.handle('fs:exists', async (_, filename: string): Promise<boolean> => {
      try {
        const filePath = path.join(this.appDataPath, filename)
        await fs.access(filePath)
        return true
      } catch {
        return false
      }
    })

    // Listar arquivos
    ipcMain.handle('fs:listFiles', async (_, directory: string = ''): Promise<string[]> => {
      try {
        const dirPath = path.join(this.appDataPath, directory)
        const files = await fs.readdir(dirPath)
        return files.filter((file) => file.endsWith('.json'))
      } catch (error) {
        return []
      }
    })

    // Deletar arquivo
    ipcMain.handle('fs:deleteFile', async (_, filename: string): Promise<boolean> => {
      try {
        const filePath = path.join(this.appDataPath, filename)
        await fs.unlink(filePath)
        return true
      } catch {
        return false
      }
    })

    // Fazer backup
    ipcMain.handle('fs:backup', async (_, filename: string): Promise<string> => {
      try {
        const originalPath = path.join(this.appDataPath, filename)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const backupFilename = `${path.parse(filename).name}-backup-${timestamp}.json`
        const backupPath = path.join(this.appDataPath, 'backups', backupFilename)

        // Garantir que o diretório de backup existe
        await fs.mkdir(path.dirname(backupPath), { recursive: true })

        // Copiar arquivo
        const content = await fs.readFile(originalPath, 'utf-8')
        await fs.writeFile(backupPath, content, 'utf-8')

        console.log(`📁 Backup criado: ${backupPath}`)
        return backupFilename
      } catch (error) {
        throw new Error(`Erro ao criar backup: ${(error as Error).message}`)
      }
    })

    // Obter caminho da pasta de dados
    ipcMain.handle('fs:getAppDataPath', async (): Promise<string> => {
      return this.appDataPath
    })

    // Obter informações do arquivo
    ipcMain.handle('fs:getFileInfo', async (_, filename: string) => {
      try {
        const filePath = path.join(this.appDataPath, filename)
        const stats = await fs.stat(filePath)
        return {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: filePath
        }
      } catch (error) {
        return null
      }
    })
  }

  // Método para inicialização
  async initialize(): Promise<void> {
    try {
      // Garantir que o diretório principal existe
      await fs.mkdir(this.appDataPath, { recursive: true })

      // Criar diretório de backups
      await fs.mkdir(path.join(this.appDataPath, 'backups'), { recursive: true })

      console.log(`📂 Diretório de dados inicializado: ${this.appDataPath}`)
    } catch (error) {
      console.error('Erro ao inicializar FileManager:', error)
    }
  }
}

// Função para usar no main process
export const initializeFileManager = async (): Promise<FileManager> => {
  const fileManager = new FileManager()
  await fileManager.initialize()
  return fileManager
}
