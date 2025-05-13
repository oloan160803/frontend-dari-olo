// components/HazardMap.js
import React, { useRef, useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import CrudBuildings from './CrudBuildings'

const icons = {
  BMN: L.icon({
    iconUrl: '/icons/office-building-svgrepo-com.svg',
    iconSize: [20,20],
    iconAnchor: [6,20],
    popupAnchor: [0,-20]
  }),
  FS: L.icon({
    iconUrl: '/icons/hospital-svgrepo-com.svg',
    iconSize: [20,20],
    iconAnchor: [6,20],
    popupAnchor: [0,-20]
  }),
  FD: L.icon({
    iconUrl: '/icons/school-sharp-svgrepo-com.svg',
    iconSize: [20,20],
    iconAnchor: [6,20],
    popupAnchor: [0,-20]
  }),
}

// Mapping of hazard types to their return‐period fields
const TYPE_FIELDS = {
  gempa:       ['mmi_500',   'mmi_250',   'mmi_100'],
  banjir:      ['depth_100', 'depth_50',  'depth_25'],
  longsor:     ['mflux_5',   'mflux_2'],
  gunungberapi:['kpa_250',   'kpa_100',   'kpa_50'],
}

// Jenks Natural Breaks
function getJenksBreaks(data, n) {
  const sorted = data.slice().sort((a, b) => a - b)
  const lower = Array(sorted.length + 1).fill().map(() => Array(n + 1).fill(0))
  const variance = Array(sorted.length + 1).fill().map(() => Array(n + 1).fill(Infinity))

  for (let i = 1; i <= n; i++) {
    lower[1][i] = 1
    variance[1][i] = 0
  }
  for (let l = 2; l <= sorted.length; l++) {
    let sum = 0, sumSq = 0, w = 0
    for (let m = 1; m <= l; m++) {
      const v = sorted[l - m]
      sum += v
      sumSq += v * v
      w++
      const cost = sumSq - (sum * sum) / w
      const i4 = l - m
      if (i4 > 0) {
        for (let j = 2; j <= n; j++) {
          const c = cost + variance[i4][j - 1]
          if (variance[l][j] > c) {
            lower[l][j] = i4 + 1
            variance[l][j] = c
          }
        }
      }
    }
    variance[l][1] = sumSq - (sum * sum) / w
    lower[l][1] = 1
  }

  const breaks = Array(n + 1).fill(0)
  breaks[n] = sorted[sorted.length - 1]
  breaks[0] = sorted[0]
  let k = sorted.length, count = n
  while (count > 1) {
    const idx = lower[k][count] - 2
    breaks[count - 1] = sorted[idx]
    k = lower[k][count] - 1
    count--
  }
  return breaks
}

const colorScale = ['#FFEDA0','#FED976','#FD8D3C','#FC4E2A','#E31A1C','#BD0026']
const nullColor = '#CCCCCC'
function getColor(v, jenks) {
  if (v == null || isNaN(v)) return nullColor
  for (let i = jenks.length - 1; i > 0; i--) {
    if (v >= jenks[i]) return colorScale[i - 1]
  }
  return colorScale[0]
}

export default function HazardMap({ provinsi, kota, setProvinsi, setKota }) {
  const [type,  setType]  = useState('')
  const [field, setField] = useState('')

  function handleSearchBuilding({ lat, lon }) {
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 20, { animate: true })
    }
  }

  const mapEl        = useRef(null)
  const mapRef       = useRef(null)
  const hazardLayer  = useRef(null)
  const buildingCluster = useRef(null)

  // initialize map and building clusters
  useEffect(() => {
    if (mapRef.current) return
    const map = L.map(mapEl.current).setView([-6.2,106.8],9)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)
    mapRef.current = map

    buildingCluster.current = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false
    })
    map.addLayer(buildingCluster.current)
  },[])

  // re-cluster buildings when provinsi/kota change
 useEffect(() => {
  const map = mapRef.current
  buildingCluster.current.clearLayers()
  if (!map || !provinsi || !kota) return

  fetch(`/api/gedung?provinsi=${encodeURIComponent(provinsi)}&kota=${encodeURIComponent(kota)}`)
    .then(r => r.json())
    .then(data => {
      data.features.forEach(f => {
        const [lon, lat] = f.geometry.coordinates
        const type = (f.properties.id_bangunan || '').split('_')[0]

        L.marker([lat, lon], { icon: icons[type] || icons.FD })
          .bindPopup(`<strong>${f.properties.nama_gedung}</strong>`)
          .addTo(buildingCluster.current)
      })
      const bounds = buildingCluster.current.getBounds()
      if (bounds.isValid()) map.fitBounds(bounds)
    })
}, [provinsi, kota])

  // whenever map moves or filters change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.on('moveend', updateHazard)
    updateHazard()
    return ()=>map.off('moveend', updateHazard)
  },[provinsi,kota,type,field])

  function getTolerance(zoom) {
    if (zoom < 6 ) return 0.01
    if (zoom < 10) return 0.001
    return 0.0001
  }

  async function updateHazard() {
    const map = mapRef.current
    if (!map) return

    // clear if not fully selected
    if (!provinsi || !kota || !type || !field) {
      hazardLayer.current && map.removeLayer(hazardLayer.current)
      return
    }

    // build bbox & tolerance
    const b   = map.getBounds()
    const tol = getTolerance(map.getZoom())
    const params = new URLSearchParams({
      minlng: b.getWest(), minlat: b.getSouth(),
      maxlng: b.getEast(), maxlat: b.getNorth(),
      tol, field
    })

    const res = await fetch(`/api/buffer/${type}?${params}`)
    let data  = await res.json()
    data.features = data.features.filter(f=>f.properties[field]!=null)
    const vals = data.features.map(f=>f.properties[field])

    // compute jenks breaks (just for color ramp)
    const numClasses = Math.min(6, vals.length)
    let jenks = []
    if (numClasses>1) jenks = getJenksBreaks(vals, numClasses)

    // remove old layer
    hazardLayer.current && map.removeLayer(hazardLayer.current)

    // draw new
    hazardLayer.current = L.geoJSON(data, {
      renderer: L.canvas({ padding: 0.5, tolerance: 0 }),
      interactive: true,
      style: ft=>({
        fillColor: getColor(ft.properties[field], jenks),
        stroke:    false,
        fillOpacity:0.5
      }),
      onEachFeature: (ft, layer)=>{
        const v = ft.properties[field]
        layer.bindPopup(`
          <div style="font-family:sans-serif;font-size:0.9rem">
            <strong>${type.toUpperCase()} — ${field.replace('_',' ').toUpperCase()}</strong><br>
            Nilai: <b>${v==null?'Null':v.toFixed?.(2)||v}</b>
          </div>
        `)
      }
    }).addTo(map)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="md:w-1/2 p-4 bg-[#1E2023] rounded-lg">
              <div className="flex gap-4 mt-4">
          <select
            className="w-full rounded-4xl bg-[#C6FF00] px-4 py-2 text-black appearance-none"
            value={type}
            onChange={e => setType(e.target.value)}
            disabled={!provinsi||!kota}
          >
            <option value="">Pilih Bencana</option>
            {Object.keys(TYPE_FIELDS).map(k=>
              <option key={k} value={k}>{k}</option>
            )}
          </select>
          <select
            className="w-full rounded-4xl bg-[#C6FF00] px-4 py-2 text-black appearance-none"
            value={field}
            onChange={e => setField(e.target.value)}
            disabled={!type}
          >
            <option value="">Pilih Return Period</option>
            {type && TYPE_FIELDS[type].map(f=>
              <option key={f} value={f}>{f} tahun</option>
            )}
          </select>
        </div>
        <h3 className="text-white font-[SF Pro] mb-6"></h3>
        <CrudBuildings
          provFilter={provinsi}
          setProvFilter={setProvinsi}
          kotaFilter={kota}
          setKotaFilter={setKota}
          onSearchBuilding={handleSearchBuilding}
        />

      </div>
      <div className="md:w-1/2 h-[500px] rounded-lg overflow-hidden mt-24">
        <div ref={mapEl} id="map" className="h-full w-full" />
      </div>
    </div>
  )
}
