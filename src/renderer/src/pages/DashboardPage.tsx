import React from 'react'
import OverviewHeader from '@renderer/components/OverviewHeader/OverviewHeader'
import OverviewStats from '@renderer/components/OverviewStats/OverviewStats'
import ExecutionsSummary from '@renderer/components/ExecutionsSummary/ExecutionsSummary'
import PipelineStatusChart from '@renderer/components/PipelineStatusChart/PipelineStatusChart'
import ActivePipelinesList from '@renderer/components/ActivePipelineList/ActivePipelineList'

const DashboardPage: React.FC = () => {
  return (
    <>
      <div className="lg:grid gap-2">
        <div className="bg-white rounded-4xl shadow-2xs !space-y-8 px-8 pt-4 pb-6">
          {/* Overview Section */}
          <section>
            <OverviewHeader />

            {/* Stats Cards */}
            <div className="!mb-8">{/* <OverviewStats /> */}</div>

            {/* Executions Summary */}
            {/* <ExecutionsSummary /> */}
          </section>
          {/* Bottom Section - Chart and Pipelines */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pipeline Status Chart - Takes 2/3 of the width */}
              {/* <div className="lg:col-span-2">
            <PipelineStatusChart />
          </div> */}

              {/* Active Pipelines List - Takes 1/3 of the width */}
              <div>{/* <ActivePipelinesList /> */}</div>
            </div>
          </section>
        </div>

        <section>
          <div className="lg:col-span-2">
            <PipelineStatusChart />
          </div>
        </section>
      </div>
    </>
  )
}

export default DashboardPage
