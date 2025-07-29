import React, { useState, useEffect, useRef } from 'react'
import { X, TestTube, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react'
import { Connection, ConnectionFormData } from '@renderer/types/index'
import { useConnections } from '@renderer/hooks/useConnections'
import '../../../assets/effects.css'

interface ConnectionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (connection: Connection) => void
  connection?: Connection | null
  isEditing?: boolean
  defaultConnectionType?: 'source' | 'destination'
}

const ConnectionFormModal: React.FC<ConnectionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  connection,
  isEditing = false,
  defaultConnectionType = 'source'
}) => {
  const { testConnection, saveConnection, updateConnection, isLoading, error, clearError } =
    useConnections()

  const [formData, setFormData] = useState<ConnectionFormData>({
    name: '',
    type: 'MySQL',
    connectionType: defaultConnectionType,
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: ''
  })

  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    latency?: number
  } | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showScrollFadeBottom, setShowScrollFadeBottom] = useState(false)
  const [showScrollFadeTop, setShowScrollFadeTop] = useState(false)
  const [saveAttempted, setSaveAttempted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (connection && isEditing) {
      setFormData({
        id: connection.id,
        name: connection.name,
        type: connection.type,
        connectionType: connection.connectionType,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username || '',
        password: '' // Don't populate password for security
      })
    } else {
      setFormData({
        name: '',
        type: 'MySQL',
        connectionType: defaultConnectionType,
        host: 'localhost',
        port: 3306,
        database: '',
        username: '',
        password: ''
      })
    }
    setTestResult(null)
    setFormErrors({})
    setSaveAttempted(false)
    clearError()
  }, [connection, isEditing, isOpen, defaultConnectionType, clearError])

  // Check scroll position for fade effects with smooth animations
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = scrollRef.current
        const isScrollable = scrollHeight > clientHeight
        const isAtTop = scrollTop <= 5
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10

        setTimeout(() => {
          setShowScrollFadeTop(isScrollable && !isAtTop)
          setShowScrollFadeBottom(isScrollable && !isNearBottom)
        }, 50)
      }
    }

    const scrollElement = scrollRef.current
    if (scrollElement) {
      setTimeout(checkScroll, 100)

      scrollElement.addEventListener('scroll', checkScroll)
      const resizeObserver = new ResizeObserver(() => {
        setTimeout(checkScroll, 100)
      })
      resizeObserver.observe(scrollElement)

      return () => {
        scrollElement.removeEventListener('scroll', checkScroll)
        resizeObserver.disconnect()
      }
    }
  }, [isOpen, testResult])

  const getDefaultPort = (type: string) => {
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

  const handleTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      type: type as ConnectionFormData['type'],
      port: getDefaultPort(type)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da conexão é obrigatório'
    }
    if (!formData.host.trim() && formData.type !== 'SQLite') {
      newErrors.host = 'Host é obrigatório'
    }
    if (!formData.database.trim()) {
      newErrors.database = 'Nome do banco de dados é obrigatório'
    }
    if (formData.type !== 'SQLite') {
      if (!formData.username.trim()) {
        newErrors.username = 'Usuário é obrigatório'
      }
      if (!formData.password.trim() && !isEditing) {
        newErrors.password = 'Senha é obrigatória'
      }
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTestConnection = async () => {
    if (!validateForm()) return

    setIsTestingConnection(true)
    setTestResult(null)

    try {
      const result = await testConnection(formData)
      setTestResult({
        success: result.success,
        message: result.message,
        latency: result.latency
      })
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Erro inesperado ao testar conexão'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSave = async () => {
    setSaveAttempted(true)

    if (!validateForm()) {
      return
    }

    try {
      let savedConnection: Connection

      if (isEditing && formData.id) {
        // Se está editando e não tem senha, omitir a propriedade password
        if (!formData.password) {
          const { password, ...updateDataWithoutPassword } = formData
          savedConnection = await updateConnection(formData.id, updateDataWithoutPassword)
        } else {
          savedConnection = await updateConnection(formData.id, formData)
        }
      } else {
        savedConnection = await saveConnection(formData)
      }

      onSave(savedConnection)
      onClose()
    } catch (err) {
      // Erro já está sendo tratado pelo hook
      console.error('Erro ao salvar conexão:', err)
    }
  }

  const handleClose = () => {
    setTestResult(null)
    setFormErrors({})
    setSaveAttempted(false)
    clearError()
    onClose()
  }

  if (!isOpen) return null

  const hasErrors = Object.keys(formErrors).length > 0 || error

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div
        className="neutral-bg rounded-xl w-full max-w-md overflow-hidden"
        style={{
          animation: 'glassFadeIn 0.3s ease-out',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg !font-semibold text-gray-900">
            {isEditing ? 'Edit Connection' : 'New Connection'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error Global */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 text-sm p-3 rounded-lg border text-red-600 bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form - Com scroll customizado e gradients aprimorados */}
        <div
          className={`scroll-container ${showScrollFadeBottom ? 'scroll-fade-bottom' : ''} ${showScrollFadeTop ? 'scroll-fade-top' : ''}`}
          style={{ height: '400px' }}
        >
          <div
            ref={scrollRef}
            className="scroll-content custom-scrollbar-minimal py-6 !px-6 text-gray-700 !space-y-4"
          >
            {/* Connection Name */}
            <div>
              <label className="block !text-sm !font-medium text-gray-700 !mb-1">
                Nome da Conexão *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Minha Conexão"
              />
              {formErrors.name && <p className="text-red-500 text-xs !mt-1">{formErrors.name}</p>}
            </div>

            {/* Connection Type */}
            <div>
              <label className="block text-sm !font-medium text-gray-700 !mb-1">
                Tipo de Conexão
              </label>
              <select
                value={formData.connectionType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    connectionType: e.target.value as 'source' | 'destination'
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="source">Origem (Source)</option>
                <option value="destination">Destino (Destination)</option>
              </select>
            </div>

            {/* Database Type */}
            <div>
              <label className="block text-sm !font-medium text-gray-700 !mb-1">Driver</label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MySQL">MySQL</option>
                <option value="PostgreSQL">PostgreSQL</option>
                <option value="SQLite">SQLite</option>
                <option value="SQL Server">SQL Server</option>
              </select>
            </div>

            {/* Host and Port */}
            {formData.type !== 'SQLite' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm !font-medium text-gray-700 !mb-1">Host *</label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.host ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="localhost"
                  />
                  {formErrors.host && (
                    <p className="text-red-500 text-xs !mt-1">{formErrors.host}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm !font-medium text-gray-700 !mb-1">Port</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, port: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Database Name */}
            <div>
              <label className="block text-sm !font-medium text-gray-700 !mb-1">
                {formData.type === 'SQLite' ? 'Database File Path *' : 'Banco de Dados *'}
              </label>
              <input
                type="text"
                value={formData.database}
                onChange={(e) => setFormData((prev) => ({ ...prev, database: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.database ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={
                  formData.type === 'SQLite' ? '/path/to/database.db' : 'meu_banco_de_dados'
                }
              />
              {formErrors.database && (
                <p className="text-red-500 text-xs mt-1">{formErrors.database}</p>
              )}
            </div>

            {/* Username and Password */}
            {formData.type !== 'SQLite' && (
              <>
                <div>
                  <label className="block text-sm !font-medium text-gray-700 !mb-1">
                    Usuário *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="usuario"
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-xs !mt-1">{formErrors.username}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm !font-medium text-gray-700 !mb-1">
                    Senha {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder={
                      isEditing ? 'Deixe em branco para manter a senha atual' : '••••••••'
                    }
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                  )}
                </div>
              </>
            )}

            {/* Test Connection */}
            <div className="pt-2">
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingConnection ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
              </button>

              {testResult && (
                <div
                  className={`!mt-2 flex items-start gap-2 text-sm p-3 rounded-lg border ${
                    testResult.success
                      ? 'text-green-600 bg-green-50 border-green-200'
                      : 'text-red-600 bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {testResult.success ? 'Conexão bem-sucedida!' : 'Falha na conexão'}
                    </div>
                    <div className="text-xs mt-1 opacity-80">
                      {testResult.message}
                      {testResult.success && testResult.latency && (
                        <span className="ml-2">({testResult.latency}ms)</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={!!isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!!isLoading || (!!saveAttempted && !!hasErrors)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Atualizar' : 'Criar'} Conexão
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectionFormModal
