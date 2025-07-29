import React from 'react'
import { TestTube, Edit, Copy, Download, Trash2, Eye, EyeOff } from 'lucide-react'
import DropdownMenu from '@renderer/components/DropdownMenu/DropdownMenu'
import { Connection } from '@renderer/types'

interface ConnectionDropdownProps {
  connection: Connection
  onTest: (id: string) => void
  onEdit: (connection: Connection) => void
  onDelete: (id: string) => void
  onDuplicate?: (connection: Connection) => void
  onExport?: (connection: Connection) => void
  onToggleVisibility?: (id: string) => void
}

const ConnectionDropdown: React.FC<ConnectionDropdownProps> = ({
  connection,
  onTest,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  onToggleVisibility
}) => {
  const menuItems = [
    {
      id: 'test',
      label: 'Test Connection',
      icon: TestTube,
      onClick: () => onTest(connection.id),
      disabled: connection.status === 'testing'
    },
    {
      id: 'edit',
      label: 'Edit Connection',
      icon: Edit,
      onClick: () => onEdit(connection)
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: () => onDuplicate?.(connection)
    },
    {
      id: 'export',
      label: 'Export Config',
      icon: Download,
      onClick: () => onExport?.(connection)
    },
    {
      id: 'visibility',
      label: connection.status === 'connected' ? 'Hide from Dashboard' : 'Show in Dashboard',
      icon: connection.status === 'connected' ? EyeOff : Eye,
      onClick: () => onToggleVisibility?.(connection.id)
    },
    {
      id: 'delete',
      label: 'Delete Connection',
      icon: Trash2,
      onClick: () => onDelete(connection.id),
      variant: 'danger' as const
    }
  ]

  return <DropdownMenu items={menuItems} />
}

export default ConnectionDropdown
