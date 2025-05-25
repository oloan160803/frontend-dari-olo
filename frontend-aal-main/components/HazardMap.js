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
    const map = L.map(mapEl.current, { zoomControl: false }).setView([-6.2,106.8],9)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution: '© OpenStreetMap contributors',
      opacity: 0.7,
    }).addTo(map)
    mapRef.current = map

    // Tambahkan legenda jenis bangunan
    const legend = L.control({ position: 'bottomright' })
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend')
      div.style.background = '#ffffff'
      div.style.padding = '6px 12px'
      div.style.borderRadius = '6px'
      div.style.color = 'black'
      div.style.opacity = '0.8'
      div.style.fontSize = '0.8rem'
      
      let html = '<h4 class="text-black font-bold mb-1">Jenis Bangunan</h4>'
      html += `
        <div style="display:flex; align-items:center; margin-bottom:4px;">
          <img src="icons/gedungnegara.svg" style="width:20px; height:20px; margin-right:6px; background:white; padding:2px; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.2);"/>
          <span>Bangunan Milik Negara</span>
        </div>
        <div style="display:flex; align-items:center; margin-bottom:4px;">
          <img src="icons/kesehatan.svg" style="width:20px; height:20px; margin-right:6px; background:white; padding:2px; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.2);"/>
          <span>Fasilitas Kesehatan</span>
        </div>
        <div style="display:flex; align-items:center;">
          <img src="icons/sekolah.svg" style="width:20px; height:20px; margin-right:6px; background:white; padding:2px; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.2);"/>
          <span>Fasilitas Pendidikan</span>
        </div>
      `
      div.innerHTML = html
      return div
    }
    legend.addTo(map)

    buildingCluster.current = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      chunkedLoading: true,
      chunkInterval: 100,
      disableClusteringAtZoom: 18,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: true,
      animateAddingMarkers: false,
      spiderfyDistanceMultiplier: 1,
    })
    map.addLayer(buildingCluster.current)

    // Set batas zoom maksimum untuk peta
    map.setMaxZoom(19)
  }, [])

  useEffect(() => {
    if (!mapRef.current || !buildingCluster.current) return
    const map = mapRef.current
    const cluster = buildingCluster.current

    cluster.clearLayers()
    markers.current = []

    if (!provinsi || !kota) return

    fetch(`/api/gedung?provinsi=${encodeURIComponent(provinsi)}&kota=${encodeURIComponent(kota)}`)
      .then(r => r.json())
      .then(data => {
        const markersList = data.features.map(f => {
          const [lon, lat] = f.geometry.coordinates
          const type = (f.properties.id_bangunan || '').split('_')[0]
          const marker = L.marker([lat, lon], {
            icon: icons[type] || icons.FD,
            riseOnHover: true
          })
          
          marker.on('click', () => {
            if (!marker.getPopup()) {
              const popupContent = `
                <div style="min-width:200px">
                  <strong>${f.properties.nama_gedung}</strong><br/>
                  <small>${f.properties.alamat}</small>
                </div>
              `
              marker.bindPopup(popupContent)
            }
          })
          return marker
        })
        
        markers.current = markersList
        cluster.addLayers(markers.current)

        cluster.refreshClusters()

        setTimeout(() => {
          const bounds = cluster.getBounds()
          if (bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 14
            })
          }
        }, 50)

      })
      .catch(error => {
        console.error("Error fetching building data:", error)
      })

    return () => {
      if (buildingCluster.current) {
        buildingCluster.current.clearLayers()
      }
      markers.current = []
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
