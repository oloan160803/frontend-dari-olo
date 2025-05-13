// components/DirectLossMap.js
import { useRef, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'

// Definisi ikon untuk tiap tipe bangunan dan cluster
const icons = {
  BMN: L.icon({ iconUrl: 'icons/office-building-svgrepo-com.svg', iconSize: [20,20], iconAnchor:[6,20], popupAnchor:[0,-20] }),
  FS:  L.icon({ iconUrl: 'icons/hospital-svgrepo-com.svg',      iconSize: [20,20], iconAnchor:[6,20], popupAnchor:[0,-20] }),
  FD:  L.icon({ iconUrl: 'icons/school-sharp-svgrepo-com.svg',    iconSize: [20,20], iconAnchor:[6,20], popupAnchor:[0,-20] })
}

export default function DirectLossMap({ geojson, filters, search }) {
  const mapEl      = useRef(null)
  const mapRef     = useRef(null)
  const clusterRef = useRef(null)

  // Format Rupiah
  const formatRupiah = (num) =>
    'Rp ' + Number(num).toLocaleString('id-ID', { minimumFractionDigits: 0 })

  // Inisialisasi peta dan MarkerClusterGroup sekali
  useEffect(() => {
    if (mapRef.current) return
    mapRef.current = L.map(mapEl.current, { zoomControl: false }).setView([-8.9,116.4],5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current)

    // Konfigurasi MarkerClusterGroup
    clusterRef.current = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      chunkedLoading: true,
      chunkInterval: 200
    })
    // Tambahkan cluster ke map
      mapRef.current.addLayer(clusterRef.current)
    }, []) // Add the missing closing parenthesis for the first useEffect

  // Tambahkan ulang marker saat data/filter/search berubah
  useEffect(() => {
    if (!mapRef.current) return
    const cluster = clusterRef.current
    cluster.clearLayers()
    if (!geojson) return

    geojson.features
      .map((f) => {
        const p = f.properties
        const [lon, lat] = f.geometry.coordinates
        const type = (p.id_bangunan||'').split('_')[0]

        // Filter berdasarkan tipe, provinsi/kota, dan search
        if (!filters[type]) return null
        if (search && !p.nama_gedung.toLowerCase().includes(search.toLowerCase())) return null

        // Hitung total Direct Loss untuk marker ini
        const directLossValue = Object.entries(p)
          .filter(([k]) => k.startsWith('direct_loss_'))
          .reduce((sum, [_, v]) => sum + (v||0), 0)

        // Bind popup detail
        const popupHtml = `
          <div style="min-width:220px; max-width:320px; font-family:inherit; bg-gray-300">
            <div style="font-size:1.1rem; font-weight:700; color:#2563eb; margin-bottom:2px;">${p.nama_gedung}</div>
            <div style="font-size:0.95rem; color:#374151; margin-bottom:4px;">
              <span style="font-style:italic;">${p.taxonomy}</span> &bull; Luas: <b>${p.luas} m²</b><br/>
              <span style="color:#6b7280;">${p.alamat}</span><br/>
              <span style="font-size:0.9em; color:#6b7280;">${p.kota}, ${p.provinsi}</span>
            </div>
            <hr style="margin:6px 0 8px 0; border:none; border-top:1px solid #e5e7eb;"/>
            <div style="font-size:0.95rem;">
              <div style="margin-bottom:6px;"><b style="color:#2563eb;">Kerugian Gempa</b><br/>
                <span style="margin-left:8px;">500-th: <b>${formatRupiah(p.direct_loss_gempa_500)}</b></span><br/>
                <span style="margin-left:8px;">250-th: <b>${formatRupiah(p.direct_loss_gempa_250)}</b></span><br/>
                <span style="margin-left:8px;">100-th: <b>${formatRupiah(p.direct_loss_gempa_100)}</b></span>
              </div>
              <div style="margin-bottom:6px;"><b style="color:#059669;">Kerugian Banjir</b><br/>
                <span style="margin-left:8px;">100-th: <b>${formatRupiah(p.direct_loss_banjir_100)}</b></span><br/>
                <span style="margin-left:8px;">50-th: <b>${formatRupiah(p.direct_loss_banjir_50)}</b></span><br/>
                <span style="margin-left:8px;">25-th: <b>${formatRupiah(p.direct_loss_banjir_25)}</b></span>
              </div>
              <div style="margin-bottom:6px;"><b style="color:#d97706;">Kerugian Longsor</b><br/>
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

        return L.marker([lat, lon], { icon: icons[type]||icons.FD, directLossValue })
          .bindPopup(popupHtml)
          .bindTooltip(p.nama_gedung, { permanent: false, direction: 'right', offset: [10,0], className: 'building-label' })
      })
      .filter(Boolean)
      .forEach(marker => cluster.addLayer(marker))

    // Sesuaikan bounds map ke seluruh cluster
    const bounds = cluster.getBounds()
    if (bounds.isValid()) mapRef.current.fitBounds(bounds, { maxZoom:14 })
  }, [geojson, filters, search])

  return (
    <div className="relative h-full">
      <div ref={mapEl} className="h-full w-full rounded-lg" />
    </div>
  )
}
