// pages/index.js
import dynamic from 'next/dynamic'
import { useState } from 'react'

// Hooks
import useChartData   from '../hooks/useChartData'
import useDirectLoss  from '../hooks/useDirectLoss'

// Components
import Header           from '../components/Header'
import CrudHSBGN        from '../components/CrudHSBGN'
import FilterPetaBencana from '../components/FilterPetaBencana'

// Dynamic Imports
const HazardMap     = dynamic(() => import('../components/HazardMap'), { ssr: false })
const DisasterCurves = dynamic(() => import('../components/DisasterCurves'), { ssr: false })
const PetaBencana = dynamic(() => import('../components/PetaBencana'), { ssr: false })

export default function Home() {
  // Charts state
  const { provs, data, load } = useChartData()

  // Direct Loss state
  const direct = useDirectLoss()

  // Lifted filters for buildings
  const [selectedProv, setSelectedProv] = useState('')
  const [selectedKota, setSelectedKota] = useState('')
  const [layer, setLayer] = useState('hazard_gempa_mmi_500')

  return (
    <div className="min-h-screen bg-[#0D0F12]">
      <Header />

      <main className="max-w-screen mx-auto py-10 px-6 space-y-6 mt-18">
        {/* Manajemen Data Bangunan */}
        <section className="bg-[#1E2023] rounded-xl p-6 shadow-xs shadow-gray-600">
          <h2 className="text-2xl font-bold text-white mb-6">Manajemen Data Bangunan</h2>
          <HazardMap
            provinsi={selectedProv}
            kota={selectedKota}
            setProvinsi={setSelectedProv}
            setKota={setSelectedKota}
          />
        </section>

        {/* HSBGN */}
        <section className="bg-[#1E2023] rounded-xl p-6 shadow-xs shadow-gray-600 md:w-1/2 center mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Manajemen Harga Satuan Bangunan Gedung Negara</h2>
          <CrudHSBGN />
        </section>

        {/* Peta Bencana */}
        <section className="w-full">
          <div className="bg-[#1E2023] shadow-xs rounded-lg p-6 flex flex-col space-y-4 md:col-span-2 shadow-gray-600">
            <PetaBencana />
          </div>
        </section>

        {/* Kurva Kerentanan */}
        <section className="bg-[#1E2023] rounded-xl p-6 shadow-xs shadow-gray-600">
          <h2 className="text-2xl font-bold text-white mb-6">Kurva Kerentanan</h2>
          <DisasterCurves />
        </section>
      </main>
    </div>
  )
}
