// components/DisasterCurves.js
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Ticks
} from 'chart.js'
import { getDisasterCurves } from '../src/lib/api' // sesuaikan path
// register component‐level Chart.js modules
ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// load Line chart only on client
const Line = dynamic(() => import('react-chartjs-2').then(m => m.Line), {
  ssr: false
})

export default function DisasterCurves() {
  const [rawData, setRawData] = useState(null)

  useEffect(() => {
    getDisasterCurves()
      .then(setRawData)
      .catch(err => console.error('Failed to load curves', err))
  }, [])

  if (!rawData) {
    return <p className="p-8 text-center">Loading charts…</p>
  }

  const taxonomyColors = {
    lightwood: '#ffc107',
    mur:       '#fd7e14',
    mcf:       '#dc3545',
    cr:        '#6f42c1',
    '1.0':     '#ffc107',
    '2.0':     '#dc3545',
  };

  const disasters = [
    { key: 'gempa',        label: 'Gempa' },
    { key: 'banjir',       label: 'Banjir' },
    { key: 'gunungberapi', label: 'Gunung Berapi' },
    { key: 'longsor',      label: 'Longsor' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
      {disasters.map(({ key, label }) => {
        const grouped = rawData[key] || {}
        const taxonomyList =
          key === 'banjir'
            ? Object.keys(grouped)
            : ['lightwood','mur','mcf','cr']

        const allX = taxonomyList.flatMap(t => grouped[t]?.x || [])
        const maxX = allX.length ? Math.max(...allX) : 0

        const datasets = taxonomyList.map(tax => {
          const pts = grouped[tax] || { x: [], y: [] }
          const data = pts.x.map((x, i) => ({ x, y: pts.y[i] }))

          let labelText;
          if (key === 'banjir') {
            labelText = {
              '1.0': 'Lantai 1',
              '2.0': 'Lantai 2'
            }[tax] || `Kurva ${tax}`;
          } else {
            labelText = {
              lightwood: 'Lightwood',
              mur: 'MUR',
              mcf: 'MCF',
              cr: 'CR'
            }[tax] || tax;
          }   

          return {
            label: labelText,
            data,
            borderColor: taxonomyColors[tax] || 'gray',
            fill: false,
            tension: 0.4,
            cubicInterpolationMode: 'monotone'
          }
        })

        return (
          <div key={key} className="bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{label}</h2>
            <Line
              data={{ datasets }}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top', labels: { color: '#ffffff', usePointStyle: true, pointStyle: 'line', padding: 10, font: { size: 13 }, } } },
                scales: {
                  x: { 
                    type: 'linear', 
                    min: 0, 
                    max: maxX, 
                    title: { 
                      display: true, 
                      text: 'Intensitas Bencana', 
                      color: '#ffffff', font: { size: 14 }
                    } , 
                    ticks: {
                      color: '#ffffff',
                      font: { size: 12 }
                    },
                    grid: {
                      color: '#ffffff'
                  }
                },
                  y: {
                    min: 0, 
                    max: 1, 
                    title: { 
                      display: true, 
                      text: 'Tingkat Kerusakan',  
                      color: '#ffffff',
                      font: { size: 14 }
                    },
                  ticks: {
                    color: '#ffffff',
                    font: { size: 12 }
                  },
                  grid: {
                    color: '#ffffff'
                  }
                }
              }
            }}
          />
        </div>
        )
      })}
    </div>
  )
}
