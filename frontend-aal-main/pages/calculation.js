// pages/index.js
import dynamic from 'next/dynamic'
import { useState } from 'react'

// Hooks (moved to top-level hooks/)
import useAALProvinsi from '../hooks/useAALProvinsi'
import useChartData   from '../hooks/useChartData'
import useDirectLoss  from '../hooks/useDirectLoss'

// Components
import Header            from '../components/Header'
import FilterChoropleth  from '../components/FilterChoropleth'
const ChoroplethMap     = dynamic(() => import('../components/ChoroplethMap'), { ssr: false })

import ChartsSection     from '../components/ChartsSection'
import FilterDirectLoss  from '../components/FilterDirectLoss'
const DirectLossMap     = dynamic(() => import('../components/DirectLossMap'), { ssr: false })

export default function Calculation() {
  // Choropleth state
  const [hazard, setHazard] = useState('')
  const [period, setPeriod] = useState('')
  const [model, setModel]   = useState('')
  const { geojson }         = useAALProvinsi()

  // Charts state
  const { provs, data, load } = useChartData()

  // Direct Loss state
  const direct = useDirectLoss()

  return (
    <div className="min-h-screen bg-[#0D0F12] text-gray-200 shadow-xs shadow-gray-600">
      <Header />
      
      <main className="max-w-screen mx-auto py-10 px-6 space-y-6 mt-18">
        {/* Top Section: AAL Choropleth Cards */}
        <section className="w-full">
          {/* Left Card: Filters, Map & Button */}
          <div className="bg-[#1E2023] shadow-xs rounded-lg p-6 flex flex-col space-y-4 md:col-span-2 shadow-gray-600">
            <h2 className="text-2xl font-semibold text-white mb-6 font-[SF Pro]">Average Annual Loss di Indonesia</h2>
            <FilterChoropleth
              hazard={hazard}
              setHazard={setHazard}
              period={period}
              setPeriod={setPeriod}
              model={model}
              setModel={setModel}
            />
            <div className="h-[480px] bg-gray-700 rounded-lg overflow-hidden">
              <ChoroplethMap
                geojson={geojson}
                hazard={hazard}
                period={period}
                model={model}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="px-6 py-2 bg-[#22D3EE] text-black rounded-4xl hover:bg-[#3B82F6] hover:text-white font-[SF Pro] transition"
                onClick={() => window.open('/api/aal-provinsi/download', '_blank')}
              >
                Unduh Data
              </button>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="bg-[#1E2023] rounded-lg shadow-xs p-6 my-7.5 shadow-gray-600">
          <h2 className="text-2xl font-semibold px-4 text-gray-100 mb-0.5 font-[SF Pro]">Grafik Average Annual Loss Provinsi</h2>
          <ChartsSection provs={provs} data={data} load={load} />
        </section>

        {/* Direct Loss Analysis Section */}
        <section className="bg-[#1E2023] shadow-xs shadow-gray-600 rounded-lg p-6">
          <h2 className="text-2xl font-semibold font-[SF Pro] text-white mb-6">Informasi Direct Loss</h2>
          <div className="space-y-6">
            <FilterDirectLoss {...direct} />
            <div className="h-[480px] bg-gray-700 rounded-lg overflow-hidden">
              <DirectLossMap
                geojson={direct.geojson}
                filters={direct.filters}
                search={direct.search}
              />
            </div>
          </div>
          </section>
      </main>
    </div>
  )
}     