import React, { useRef, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import CrudBuildings from './CrudBuildings'

const icons = {
  BMN: L.icon({
    iconUrl: 'icons/gedungnegara.svg',
    iconSize: [20,20],
    iconAnchor: [6,20],
    popupAnchor: [0,-20],
    className: 'rounded-icon'
  }),
  FS: L.icon({
    iconUrl: 'icons/kesehatan.svg',
    iconSize: [20,20],
    iconAnchor: [6,20],
    popupAnchor: [0,-20],
    className: 'rounded-icon'
  }),
  FD: L.icon({
    iconUrl: 'icons/sekolah.svg',
    iconSize: [20,20],
    iconAnchor: [6,20],
    popupAnchor: [0,-20],
    className: 'rounded-icon'
  }),
}

export default function HazardMap({ provinsi, kota, setProvinsi, setKota }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const buildingCluster = useRef(null)
  const markers = useRef([])

  function handleSearchBuilding({ lat, lon }) {
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 18, { animate: true })
    }
  }

  useEffect(() => {
    if (mapRef.current) return
    const map = L.map(mapEl.current).setView([-6.2,106.8],9)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution: '© OpenStreetMap contributors',
      opacity: 0.5,
    }).addTo(map)
    mapRef.current = map

    buildingCluster.current = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      chunkedLoading: true,
      chunkInterval: 200,
      disableClusteringAtZoom: 18,
    })
    map.addLayer(buildingCluster.current)
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    const cluster = buildingCluster.current

    cluster.clearLayers()
    markers.current.forEach(m => {
      if (map.hasLayer(m)) map.removeLayer(m)
    })
    markers.current = []

    if (!provinsi || !kota) return

    fetch(`/api/gedung?provinsi=${encodeURIComponent(provinsi)}&kota=${encodeURIComponent(kota)}`)
      .then(r => r.json())
      .then(data => {
        data.features.forEach(f => {
          const [lon, lat] = f.geometry.coordinates
          const type = (f.properties.id_bangunan || '').split('_')[0]
          const marker = L.marker([lat, lon], { icon: icons[type] || icons.FD })
          marker.bindPopup(`<strong>${f.properties.nama_gedung}</strong>`)
          markers.current.push(marker)
        })

        function updateMarkers() {
          const zoom = map.getZoom()
          cluster.clearLayers()
          markers.current.forEach(m => {
            if (map.hasLayer(m)) map.removeLayer(m)
          })

          if (zoom >= 13) {
            markers.current.forEach(m => {
              m.addTo(map)
            })
          } else {
            markers.current.forEach(m => {
              cluster.addLayer(m)
            })
            if (!map.hasLayer(cluster)) {
              map.addLayer(cluster)
            }
          }
        }

        updateMarkers()
        map.on('zoomend', updateMarkers)

        const bounds = L.latLngBounds(markers.current.map(m => m.getLatLng()))
        if (bounds.isValid()) map.fitBounds(bounds)
      })

    return () => {
      if (map) map.off('zoomend')
    }
  }, [provinsi, kota])

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start min-h-[600px]">
      <style>
        {`
          .rounded-icon {
            border-radius: 50%;
            background-color: white;
            padding: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .rounded-icon img {
            border-radius: 50%;
          }
        `}
      </style>
      <div className="md:w-1/2 p-4 bg-[#1E2023] rounded-lg flex flex-col">
        <CrudBuildings
          provFilter={provinsi}
          setProvFilter={setProvinsi}
          kotaFilter={kota}
          setKotaFilter={setKota}
          onSearchBuilding={handleSearchBuilding}
        />
      </div>
      <div className="md:w-1/2 h-[600px] rounded-xl overflow-hidden">
        <div ref={mapEl} id="map" className="h-full w-full" />
      </div>
    </div>
  )
}
