import React from 'react'
import { Users, Database, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  percentage: number
  icon: React.ComponentType<any>
  isPositive: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  percentage,
  icon: Icon,
  isPositive
}) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-2xs">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <div className="flex items-center gap-2 mt-1">
          {isPositive ? (
            <ArrowUp className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {percentage}%
          </span>
          <span className="text-sm text-gray-500">vs last month</span>
        </div>
      </div>
    </div>
  )
}

interface OverviewStatsProps {
  className?: string
}

const OverviewStats: React.FC<OverviewStatsProps> = ({ className }) => {
  const stats = [
    {
      title: 'Pipelines',
      value: '1,293',
      percentage: 36.8,
      icon: Users,
      isPositive: true
    },
    {
      title: 'Data Processed',
      value: '256k',
      percentage: 36.8,
      icon: Database,
      isPositive: true
    }
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${className || ''}`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          percentage={stat.percentage}
          icon={stat.icon}
          isPositive={stat.isPositive}
        />
      ))}
    </div>
  )
}

export default OverviewStats
