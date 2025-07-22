import React from 'react'

interface OverviewHeaderProps {
  className?: string
}

const OverviewHeader: React.FC<OverviewHeaderProps> = ({ className }) => {
  const timeOptions = [
    { value: 'last-month', label: 'Last month' },
    { value: 'last-week', label: 'Last week' },
    { value: 'last-24h', label: 'Last 24 hours' },
    { value: 'last-7-days', label: 'Last 7 days' }
  ]

  return (
    <div className={`flex items-center justify-between !mb-6 ${className || ''}`}>
      <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
      <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px]">
        {timeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default OverviewHeader
