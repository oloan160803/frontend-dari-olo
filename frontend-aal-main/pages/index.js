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

import CrudHSBGN         from '../components/CrudHSBGN'
import CrudBuildings     from '../components/CrudBuildings'
import LegendAAL         from '../components/LegendAAL'

export default function Home() {
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Choropleth Section */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Average Annual Loss di Indonesia</h2>
          <button
            type="button"
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            onClick={() => {
              window.open('/api/aal-provinsi/download', '_blank');
            }}
          >
            Download AAL CSV
          </button>
          <div className="space-y-6">
            <FilterChoropleth
              hazard={hazard}
              setHazard={setHazard}
              period={period}
              setPeriod={setPeriod}
              model={model}
              setModel={setModel}
            />
            <div className="h-[500px] rounded-lg overflow-hidden">
              <ChoroplethMap
                geojson={geojson}
                hazard={hazard}
                period={period}
                model={model}
              />
            </div>
            <LegendAAL geojson={geojson} hazard={hazard} period={period} model={model} />
          </div>
        </section>

        {/* Charts Section */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">AAL per Provinsi</h2>
          <ChartsSection provs={provs} data={data} load={load} />
        </section>

        {/* Direct Loss Section */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Direct Loss Analysis</h2>
          <div className="space-y-6">
            <FilterDirectLoss {...direct} />
            <div className="h-[500px] rounded-lg overflow-hidden">
              <DirectLossMap
                geojson={direct.geojson}
                filters={direct.filters}
                search={direct.search}
              />
            </div>
          </div>
        </section>

        {/* CRUD Tables Section */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Data Management</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">HSBGN Data</h3>
              <CrudHSBGN />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Buildings Data</h3>
              <CrudBuildings />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
