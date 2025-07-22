import React from 'react'
import { BarChart3 } from 'lucide-react'

interface PipelineStatusChartProps {
  className?: string
}

const PipelineStatusChart: React.FC<PipelineStatusChartProps> = ({ className }) => {
  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm ${className || ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Status</h3>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      {/* Placeholder for chart */}
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Pipeline status chart will go here</p>
        </div>
      </div>
    </div>
  )
}

export default PipelineStatusChart
