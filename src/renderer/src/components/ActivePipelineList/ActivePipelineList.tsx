import React from 'react'
import { Database, Activity, Clock } from 'lucide-react'

interface Pipeline {
  id: string
  name: string
  source: string
  target: string
  progress: number | null
  status: 'Active' | 'Running' | 'Scheduled'
  icon: React.ComponentType<any>
  color: string
}

interface PipelineItemProps {
  pipeline: Pipeline
}

const PipelineItem: React.FC<PipelineItemProps> = ({ pipeline }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700'
      case 'Running':
        return 'bg-blue-100 text-blue-700'
      case 'Scheduled':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div
        className={`w-10 h-10 bg-gradient-to-br ${pipeline.color} rounded-lg flex items-center justify-center`}
      >
        <pipeline.icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{pipeline.name}</p>
        <p className="text-xs text-gray-500">
          {pipeline.source} → {pipeline.target}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium text-gray-900 mb-1">
          {pipeline.progress !== null ? `${pipeline.progress}%` : '--'}
        </p>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(pipeline.status)}`}>
          {pipeline.status}
        </span>
      </div>
    </div>
  )
}

interface ActivePipelinesListProps {
  className?: string
}

const ActivePipelinesList: React.FC<ActivePipelinesListProps> = ({ className }) => {
  const pipelines: Pipeline[] = [
    {
      id: '1',
      name: 'User Migration',
      source: 'MySQL',
      target: 'PostgreSQL',
      progress: 95,
      status: 'Active',
      icon: Database,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: '2',
      name: 'Product Sync',
      source: 'SQLite',
      target: 'MySQL',
      progress: 78,
      status: 'Running',
      icon: Activity,
      color: 'from-blue-400 to-indigo-500'
    },
    {
      id: '3',
      name: 'Order Import',
      source: 'PostgreSQL',
      target: 'MySQL',
      progress: null,
      status: 'Scheduled',
      icon: Clock,
      color: 'from-orange-400 to-red-500'
    }
  ]

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 shadow-2xs ${className || ''}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Pipelines</h3>

      <div className="space-y-4 mb-4">
        {pipelines.map((pipeline) => (
          <PipelineItem key={pipeline.id} pipeline={pipeline} />
        ))}
      </div>

      <button className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        All pipelines
      </button>
    </div>
  )
}

export default ActivePipelinesList
