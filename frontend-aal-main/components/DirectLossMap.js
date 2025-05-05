import { useState, useRef, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const icons = {
  BMN: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [12, 20],
    iconAnchor: [6, 20],
    popupAnchor: [0, -20]
  }),
  FS: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [12, 20],
    iconAnchor: [6, 20],
    popupAnchor: [0, -20]
  }),
  FD: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [12, 20],
    iconAnchor: [6, 20],
    popupAnchor: [0, -20]
  })
}

export default function DirectLossMap({ geojson, filters, search }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const featureGroupRef = useRef(null)

  // Format Rupiah
  const formatRupiah = (num) =>
    'Rp ' + Number(num).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

  useEffect(() => {
    mapRef.current = L.map(mapEl.current, { zoomControl: false }).setView([-8.9, 116.4], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(mapRef.current)

    featureGroupRef.current = L.featureGroup().addTo(mapRef.current)
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current)
  }, [])

  useEffect(() => {
    const fg = featureGroupRef.current
    fg.clearLayers()

    if (!geojson) return

    const items = geojson.features.map((f) => {
      const p = f.properties
      const [lon, lat] = f.geometry.coordinates
      const type = (p.id_bangunan || '').split('_')[0]
      
      // Filter berdasarkan tipe bangunan
      if (!filters[type]) return null

      // Filter berdasarkan pencarian
      if (search && !p.nama_gedung.toLowerCase().includes(search.toLowerCase())) return null

      const popup = `
        <div style="min-width:220px;max-width:320px;font-family:inherit;">
          <div style="font-size:1.1rem;font-weight:700;color:#2563eb;margin-bottom:2px;">${p.nama_gedung}</div>
          <div style="font-size:0.95rem;color:#374151;margin-bottom:4px;">
            <span style="font-style:italic;">${p.taxonomy}</span> &bull; Luas: <b>${p.luas} m²</b><br/>
            <span style="color:#6b7280;">${p.alamat}</span><br/>
            <span style="font-size:0.9em;color:#6b7280;">${p.kota}, ${p.provinsi}</span>
          </div>
          <hr style="margin:6px 0 8px 0;border:none;border-top:1px solid #e5e7eb;"/>
          <div style="font-size:0.95rem;">
            <div style="margin-bottom:6px;"><b style="color:#d97706;">Kerugian Gempa</b><br/>
              <span style="margin-left:8px;">500-th: <b>${formatRupiah(p.direct_loss_gempa_500)}</b></span><br/>
              <span style="margin-left:8px;">250-th: <b>${formatRupiah(p.direct_loss_gempa_250)}</b></span><br/>
              <span style="margin-left:8px;">100-th: <b>${formatRupiah(p.direct_loss_gempa_100)}</b></span>
            </div>
            <div style="margin-bottom:6px;"><b style="color:#2563eb;">Kerugian Banjir</b><br/>
              <span style="margin-left:8px;">100-th: <b>${formatRupiah(p.direct_loss_banjir_100)}</b></span><br/>
              <span style="margin-left:8px;">50-th: <b>${formatRupiah(p.direct_loss_banjir_50)}</b></span><br/>
              <span style="margin-left:8px;">25-th: <b>${formatRupiah(p.direct_loss_banjir_25)}</b></span>
            </div>
            <div style="margin-bottom:6px;"><b style="color:#059669;">Kerugian Longsor</b><br/>
              <span style="margin-left:8px;">5-th: <b>${formatRupiah(p.direct_loss_longsor_5)}</b></span><br/>
              <span style="margin-left:8px;">2-th: <b>${formatRupiah(p.direct_loss_longsor_2)}</b></span>
            </div>
            <div><b style="color:#dc2626;">Kerugian Gunung Berapi</b><br/>
              <span style="margin-left:8px;">250-th: <b>${formatRupiah(p.direct_loss_gunungberapi_250)}</b></span><br/>
              <span style="margin-left:8px;">100-th: <b>${formatRupiah(p.direct_loss_gunungberapi_100)}</b></span><br/>
              <span style="margin-left:8px;">50-th: <b>${formatRupiah(p.direct_loss_gunungberapi_50)}</b></span>
            </div>
          </div>
        </div>
      `

      const marker = L.marker([lat, lon], { icon: icons[type] || icons.FD })
        .bindPopup(popup)
        .bindTooltip(p.nama_gedung, {
          permanent: false,
          direction: 'right',
          offset: [10, 0],
          className: 'building-label'
        })

      return { marker, name: p.nama_gedung, type }
    }).filter(Boolean)

    items.forEach((item) => fg.addLayer(item.marker))

    // Fit to markers
    const bounds = fg.getBounds()
    if (bounds.isValid()) mapRef.current.fitBounds(bounds, { maxZoom: 14 })
  }, [geojson, filters, search])

  return (
    <div className="relative h-full">
      <div id="mapGedung" ref={mapEl} className="h-full w-full rounded-lg" />
    </div>
  )
}
