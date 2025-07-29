import React from 'react'
import { Database, CheckCircle, XCircle, Clock } from 'lucide-react'
import { ConnectionStats } from '@renderer/types'

interface ConnectionsStatsProps {
  stats: ConnectionStats
}

const ConnectionsStatsComponent: React.FC<ConnectionsStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Connections',
      value: stats.total.toString(),
      icon: Database,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Connected',
      value: stats.connected.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Disconnected',
      value: stats.disconnected.toString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Testing',
      value: stats.testing.toString(),
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 p-1.5 border rounded-[20px] neutral-bg !mb-4">
      {statCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white rounded-2xl p-2 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${card.bgColor} rounded-xl flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 !-mb-1">{card.title}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ConnectionsStatsComponent
