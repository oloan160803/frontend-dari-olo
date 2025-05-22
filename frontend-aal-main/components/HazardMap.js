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

export default function HazardMap({ provinsi, kota, setProvinsi, setKota }) {
  function handleSearchBuilding({ lat, lon }) {
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 20, { animate: true })
    }
  }

  const mapEl        = useRef(null)
  const mapRef       = useRef(null)
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

    let markers = []

    fetch(`/api/gedung?provinsi=${encodeURIComponent(provinsi)}&kota=${encodeURIComponent(kota)}`)
      .then(r => r.json())
      .then(data => {
        data.features.forEach(f => {
          const [lon, lat] = f.geometry.coordinates
          const type = (f.properties.id_bangunan || '').split('_')[0]
          const marker = L.marker([lat, lon], { icon: icons[type] || icons.FD })
          marker.on('click', function(e) {
            const infoGedung = `<strong>${f.properties.nama_gedung}</strong>`
            marker.bindPopup(infoGedung).openPopup()
          })
          markers.push(marker)
        })
        function updateBuildingMarkers() {
          const zoom = map.getZoom()
          buildingCluster.current.clearLayers()
          markers.forEach(m => m.remove())
          if (zoom >= 13) {
            markers.forEach(m => m.addTo(map))
          } else {
            markers.forEach(m => buildingCluster.current.addLayer(m))
            map.addLayer(buildingCluster.current)
          }
        }
        updateBuildingMarkers()
        map.on('zoomend', updateBuildingMarkers)
        const bounds = L.latLngBounds(markers.map(m => m.getLatLng()))
        if (bounds.isValid()) map.fitBounds(bounds)
      })
    return () => {
      if (map) map.off('zoomend')
    }
  }, [provinsi, kota])

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start min-h-[600px]">
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
