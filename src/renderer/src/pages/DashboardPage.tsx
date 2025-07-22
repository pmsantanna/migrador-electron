import React from 'react'
import OverviewHeader from '@renderer/components/OverviewHeader/OverviewHeader'
import OverviewStats from '@renderer/components/OverviewStats/OverviewStats'
import ExecutionsSummary from '@renderer/components/ExecutionsSummary/ExecutionsSummary'
import PipelineStatusChart from '@renderer/components/PipelineStatusChart/PipelineStatusChart'
import ActivePipelinesList from '@renderer/components/ActivePipelineList/ActivePipelineList'

const DashboardPage: React.FC = () => {
  return (
    <div className="!space-y-8">
      {/* Overview Section */}
      <section>
        <OverviewHeader />

        {/* Stats Cards */}
        <div className="!mb-8">
          <OverviewStats />
        </div>

        {/* Executions Summary */}
        <ExecutionsSummary />
      </section>

      {/* Bottom Section - Chart and Pipelines */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pipeline Status Chart - Takes 2/3 of the width */}
          <div className="lg:col-span-2">
            <PipelineStatusChart />
          </div>

          {/* Active Pipelines List - Takes 1/3 of the width */}
          <div>
            <ActivePipelinesList />
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
