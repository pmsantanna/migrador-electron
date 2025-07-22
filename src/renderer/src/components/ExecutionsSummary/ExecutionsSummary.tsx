import React from 'react'

interface ExecutionsSummaryProps {
  className?: string
}

const ExecutionsSummary: React.FC<ExecutionsSummaryProps> = ({ className }) => {
  const teamMembers = [
    { name: 'Gladyce', color: 'from-pink-400 to-red-500', initial: 'G' },
    { name: 'Elbert', color: 'from-blue-400 to-indigo-500', initial: 'E' },
    { name: 'Dash', color: 'from-green-400 to-emerald-500', initial: 'D' },
    { name: 'Joyce', color: 'from-yellow-400 to-orange-500', initial: 'J' },
    { name: 'Marina', color: 'from-purple-400 to-pink-500', initial: 'M' }
  ]

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm ${className || ''}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">857 new executions today!</h3>
        <p className="text-gray-600 text-sm">Monitor pipeline execution status and performance.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${member.color} border-2 border-white flex items-center justify-center shadow-sm`}
              title={member.name}
            >
              <span className="text-white text-sm font-medium">{member.initial}</span>
            </div>
          ))}
        </div>
        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
          View all →
        </button>
      </div>
    </div>
  )
}

export default ExecutionsSummary
