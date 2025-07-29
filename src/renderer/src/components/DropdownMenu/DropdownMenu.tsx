import React, { useState, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'

interface DropdownMenuItem {
  id: string
  label: string
  icon?: React.ComponentType<any>
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

interface DropdownMenuProps {
  items: DropdownMenuItem[]
  triggerClassName?: string
  menuClassName?: string
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  triggerClassName = '',
  menuClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onClick()
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 hover:bg-gray-100 rounded-lg transition-colors ${triggerClassName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
          absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1
          ${menuClassName}
        `}
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors
                  ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : item.variant === 'danger'
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DropdownMenu
