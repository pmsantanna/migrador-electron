import React from 'react'
import { ArrowUp, ArrowDown, Wifi, WifiOff, Clock } from 'lucide-react'
import { ConnectionStatus } from '@renderer/types'

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus
  showTrend?: boolean
  trend?: 'up' | 'down' | 'stable'
  className?: string
}

const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({
  status,
  showTrend = false,
  trend = 'stable',
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Connected',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          borderColor: 'border-green-200',
          icon: <Wifi className="w-3 h-3" />
        }
      case 'disconnected':
        return {
          label: 'Disconnected',
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          borderColor: 'border-red-200',
          icon: <WifiOff className="w-3 h-3" />
        }
      case 'testing':
        return {
          label: 'Testing...',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: <Clock className="w-3 h-3 animate-spin" />
        }
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: <WifiOff className="w-3 h-3" />
        }
    }
  }

  const getTrendIcon = () => {
    if (!showTrend || trend === 'stable') return null

    if (trend === 'up') {
      return <ArrowUp className="w-3 h-3" />
    }
    if (trend === 'down') {
      return <ArrowDown className="w-3 h-3" />
    }
    return null
  }

  const config = getStatusConfig()

  return (
    <span
      className={`
      inline-flex items-center gap-1.5 px-3 !pl-2 !pr-3 py-1.5 rounded-md border !mt-2 text-xs !font-medium
      ${config.bgColor} ${config.textColor} ${config.borderColor}
      ${className}
    `}
    >
      {config.icon}
      <span>{config.label}</span>
      {getTrendIcon()}
    </span>
  )
}

export default ConnectionStatusBadge
