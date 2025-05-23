// components/CrudBuildings.js
import { useState, useEffect, useRef } from 'react'
import Select from './ui/Select'
import Button from './ui/Button'
import Modal from './ui/Modal'
import {
  getBuildingProvinsi,
  getBuildingKota,
  getBuildings,
  uploadBuildingsCSV,
  getNewBuildingId,
  addBuilding,
  getBuilding,
  updateBuilding,
  deleteBuilding,
  recalc as recalcApi
} from '../src/lib/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Definisi ikon untuk tiap tipe bangunan (copy dari HazardMap.js)
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
  })
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5 inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function MiniMap({ lat, lon, onLatLonChange, kode_bangunan }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (mapRef.current) return
    const map = L.map(mapEl.current).setView([lat || -6.2, lon || 106.8], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)
    mapRef.current = map

    markerRef.current = L.marker([lat || -6.2, lon || 106.8], {
      draggable: true,
      icon: icons[kode_bangunan] || icons.FD
    })
      .addTo(map)
      .on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng()
        onLatLonChange(lat, lng)
      })
  }, [])

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat || -6.2, lon || 106.8], 13)
      markerRef.current.setLatLng([lat || -6.2, lon || 106.8])
      markerRef.current.setIcon(icons[kode_bangunan] || icons.FD)
    }
  }, [lat, lon, kode_bangunan])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return
    setIsSearching(true)
    setResults([])
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=5`)
      const data = await res.json()
      setResults(data)
    } catch (err) {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (result) => {
    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    onLatLonChange(lat, lon)
    setResults([])
    setSearch(result.display_name)
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 16)
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-2 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari lokasi (misal: Taman Mini Indonesia Indah)"
          className="border p-2 rounded-lg w-full text-black"
        />
        <button type="submit" className="bg-blue-500 text-white px-3 rounded-lg" disabled={isSearching}>
          Cari
        </button>
      </form>
      {results.length > 0 && (
        <div className="bg-white border rounded-lg shadow max-h-40 overflow-y-auto mb-2 z-10 relative">
          {results.map((r, i) => (
            <div
              key={r.place_id}
              className="px-2 py-1 hover:bg-blue-100 cursor-pointer text-sm"
              onClick={() => handleResultClick(r)}
            >
              {r.display_name}
            </div>
          ))}
        </div>
      )}
      <div ref={mapEl} style={{ height: '200px', width: '100%', marginTop: '10px' }} />
    </div>
  )
}

export default function CrudBuildings({
  provFilter,
  setProvFilter,
  kotaFilter,
  setKotaFilter,
  onSearchBuilding = () => {},
  recalc = recalcApi
}) {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const perPage = 5
  const [page, setPage] = useState(1)
  const [modalMode, setModalMode] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isSavingAdd, setIsSavingAdd] = useState(false)
  const [provList, setProvList] = useState([])
  const [kotaList, setKotaList] = useState([])

  useEffect(() => {
    getBuildingProvinsi().then(setProvList)
  }, [])

  useEffect(() => {
    if (provFilter) {
      getBuildingKota(provFilter).then(setKotaList)
    } else {
      setKotaList([])
    }
  }, [provFilter])

  function refreshTable() {
    if (provFilter && kotaFilter) {
      return getBuildings({ provinsi: provFilter, kota: kotaFilter, nama: search }).then(setRows)
    }
    setRows([])
    return Promise.resolve()
  }

  useEffect(() => {
    refreshTable()
    setPage(1)
  }, [provFilter, kotaFilter, search])

  async function onUpload() {
    if (!file) return
    setIsUploading(true)
    try {
      await uploadBuildingsCSV(file)
      await recalc()
      setFile(null)
      await refreshTable()
      alert('CSV uploaded and data refreshed')
    } catch (e) {
      console.error(e)
      alert('Error uploading CSV')
    } finally {
      setIsUploading(false)
    }
  }

  async function openEdit(id) {
    const b = await getBuilding(id)
    setEditing(b)
    setModalMode('edit')
  }

  async function onSaveEdit(data) {
    setIsSavingEdit(true)
    try {
      await updateBuilding(editing.id_bangunan, data)
      await recalc(editing.id_bangunan)
      await refreshTable()
      setModalMode('')
      setEditing(null)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function onAdd(data) {
    setIsSavingAdd(true)
    try {
      const { id_bangunan } = await getNewBuildingId(data.kode_bangunan)
      await addBuilding({ ...data, id_bangunan })
      await recalc(id_bangunan)
      await refreshTable()
      setModalMode('')
    } catch (e) {
      console.error(e)
    } finally {
      setIsSavingAdd(false)
    }
  }

  function onDeleteClick(row) {
    setDeleteTarget(row)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteBuilding(deleteTarget.id_bangunan, deleteTarget.provinsi)
      await refreshTable()
      setDeleteTarget(null)
    } catch (e) {
      console.error(e)
      alert('Error deleting')
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.ceil(rows.length / perPage)
  const paginated = rows.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-gray-800 p-5 -mx-4 rounded-2xl shadow flex flex-col h-[600px] -my-4">
      <h2 className="text-white  bg-gray-600 rounded-xl p-2 mb-3">Untuk mengunggah data bangunan, pastikan mengikuti template pengisian data dengan baik.
        Silakan unduh terlebih dahulu.
        <br />
        <a
      href="/sample_bangunan.csv"  // Ganti dengan path file CSV di public folder kamu
      download="template_data_bangunan.csv"
      className="inline-block mt-4 px-4 py-2 bg-[#22D3EE] text-black rounded-4xl hover:bg-[#3B82F6] hover:text-white transition"
    >
      Unduh Template CSV
    </a>
      </h2>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            className="border p-2 rounded-lg flex-1 text-white"
          />
          <Button
            onClick={onUpload}
            disabled={!file || isUploading}
            className="bg-[#22D3EE] text-black rounded-4xl hover:bg-[#3B82F6] hover:text-white px-4 py-2 transition"
          >
            {isUploading && <LoadingSpinner />} Unggah Data
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap items-end">
          <Select
            id="provFilter"
            value={provFilter}
            onChange={setProvFilter}
            options={['', ...provList]}
            placeholder="Pilih Provinsi"
            className="w-48"
          />
          <Select
            id="kotaFilter"
            value={kotaFilter}
            onChange={setKotaFilter}
            options={['', ...kotaList]}
            disabled={!provFilter}
            placeholder="Pilih Kota"
            className="w-48"
          />
          <input
            type="text"
            placeholder="Cari Nama Gedung"
            disabled={!kotaFilter}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border p-2 rounded-lg flex-1 text-white"
          />
          <Button
            onClick={() => setModalMode('add')}
            className="text-black px-4 py-2 bg-[#C084FC] rounded-4xl hover:bg-cyan-700 hover:text-white"
          >
            Tambah
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto mt-4 h-[600px]">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white sticky top-0">
            <tr>
              <th className="p-2">Nama Gedung</th>
              <th className="p-2">Alamat</th>
              <th className="p-2">Kota</th>
              <th className="p-2">Lon</th>
              <th className="p-2">Lat</th>
              <th className="p-2">Lantai</th>
              <th className="p-2">Taxonomy</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(b => (
              <tr
                key={b.id_bangunan}
                className="hover:bg-gray-500 cursor-pointer"
                onClick={() =>
                  onSearchBuilding({
                    lat: parseFloat(b.lat),
                    lon: parseFloat(b.lon),
                    name: b.nama_gedung,
                    type: (b.id_bangunan || '').split('_')[0]
                  })
                }
              >
                <td className="p-2 text-white">{b.nama_gedung}</td>
                <td className="p-2 text-white">{b.alamat}</td>
                <td className="p-2 text-white">{b.kota}</td>
                <td className="p-2 text-white">{b.lon}</td>
                <td className="p-2 text-white">{b.lat}</td>
                <td className="p-2 text-white">{b.jumlah_lantai}</td>
                <td className="p-2 text-white">{b.taxonomy}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => openEdit(b.id_bangunan)} className="text-blue-600">✏️</button>
                  <button onClick={() => onDeleteClick(b)} className="text-red-600">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center gap-2 mt-2 text-white">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-500 rounded text-white"
        >
          ‹ Prev
        </button>
        <span>{page} / {totalPages || 1}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="px-3 py-1 bg-gray-500 rounded disabled:opacity-50"
        >
          Next ›
        </button>
      </div>
      <Modal isOpen={modalMode === 'add'} onClose={() => setModalMode('')}>
        <AddForm provList={provList} onSave={onAdd} isSavingAdd={isSavingAdd} />
      </Modal>
      <Modal isOpen={modalMode === 'edit'} onClose={() => setModalMode('')}>
        <EditForm initial={editing} onSave={onSaveEdit} isSavingEdit={isSavingEdit} />
      </Modal>
      <Modal isOpen={!!deleteTarget} onClose={() => !isDeleting && setDeleteTarget(null)}>
        <h3 className="text-lg font-bold mb-4">Hapus Bangunan</h3>
        <p>Yakin ingin menghapus bangunan <strong>{deleteTarget?.nama_gedung}</strong>?</p>
        <div className="flex justify-end gap-4 mt-6">
          <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">
            Batal
          </Button>
          <Button onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center">
            {isDeleting && <LoadingSpinner />}
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function AddForm({ provList, onSave, isSavingAdd }) {
  const [data, setData] = useState({
    nama_gedung: '',
    alamat: '',
    luas: '',
    jumlah_lantai: '',
    provinsi: '',
    kota: '',
    lon: '',
    lat: '',
    taxonomy: 'CR',
    kode_bangunan: 'BMN'
  })
  const [localKotaList, setLocalKotaList] = useState([])

  useEffect(() => {
    if (data.provinsi) {
      getBuildingKota(data.provinsi).then((kl) => {
        setLocalKotaList(kl)
        setData(d => ({ ...d, kota: '' }))
      })
    } else {
      setLocalKotaList([])
      setData(d => ({ ...d, kota: '' }))
    }
  }, [data.provinsi])

  const handleLatLonChange = (lat, lon) => {
    setData(d => ({ ...d, lat: lat.toString(), lon: lon.toString() }))
  }

  return (
    <>
      <h3 className="text-lg font-bold mb-4">Tambah Bangunan</h3>
      {['nama_gedung','alamat','luas','jumlah_lantai'].map(fld => (
        <div key={fld} className="mb-2">
          <label className="block text-sm font-semibold">
            {fld === 'jumlah_lantai' ? 'JUMLAH LANTAI' : fld.replace('_',' ').toUpperCase()}
          </label>
          <input
            type={['luas','jumlah_lantai'].includes(fld) ? 'number' : 'text'}
            step={fld === 'luas' ? 'any' : undefined}
            value={data[fld]}
            onChange={e => setData(d => ({ ...d, [fld]: e.target.value }))}
            className="border p-2 w-full rounded-lg"
          />
        </div>
      ))}
      <Select
        id="addProvinsi"
        options={provList}
        value={data.provinsi}
        onChange={v => setData(d => ({ ...d, provinsi: v }))}
        placeholder="Pilih Provinsi"
        className="w-full mb-2"
      />
      <Select
        id="addKota"
        options={['',...localKotaList]}
        value={data.kota}
        onChange={v => setData(d => ({ ...d, kota: v }))}
        disabled={!data.provinsi}
        placeholder="Pilih Kota"
        className="w-full mb-2"
      />
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="block text-sm font-semibold">Longitude</label>
          <input
            type="number"
            step="any"
            value={data.lon}
            onChange={e => setData(d => ({ ...d, lon: e.target.value }))}
            className="border p-2 w-full rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Latitude</label>
          <input
            type="number"
            step="any"
            value={data.lat}
            onChange={e => setData(d => ({ ...d, lat: e.target.value }))}
            className="border p-2 w-full rounded-lg"
          />
        </div>
      </div>
      <MiniMap lat={parseFloat(data.lat)} lon={parseFloat(data.lon)} onLatLonChange={handleLatLonChange} kode_bangunan={data.kode_bangunan} />
      <Select
        id="addKodeBangunan"
        options={['BMN','FS','FD']}
        value={data.kode_bangunan}
        onChange={v => setData(d => ({ ...d, kode_bangunan: v }))}
        className="w-full mb-2"
      />
      <Select
        id="addTaxonomy"
        options={['CR','MCF','MUR','LightWood']}
        value={data.taxonomy}
        onChange={v => setData(d => ({ ...d, taxonomy: v }))}
        className="w-full mb-4"
      />
      <div className="flex justify-end">
        <Button
          onClick={() =>
            onSave({
              ...data,
              luas: parseFloat(data.luas),
              jumlah_lantai: parseInt(data.jumlah_lantai, 10)
            })
          }
          disabled={isSavingAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          {isSavingAdd ? 'Menyimpan...' : 'Tambah'}
        </Button>
      </div>
    </>
  )
}

function EditForm({ initial, onSave, isSavingEdit }) {
  const [data, setData] = useState(initial || {})

  useEffect(() => {
    setData(initial || {})
  }, [initial])

  const handleLatLonChange = (lat, lon) => {
    setData(d => ({ ...d, lat: lat.toString(), lon: lon.toString() }))
  }

  return (
    <>
      <h3 className="text-lg font-bold mb-4">Edit Bangunan</h3>
      {['nama_gedung','alamat','lon','lat','luas','jumlah_lantai'].map(fld => (
        <div key={fld} className="mb-2">
          <label className="block text-sm font-semibold">
            {fld === 'jumlah_lantai' ? 'JUMLAH LANTAI' : fld.replace('_',' ').toUpperCase()}
          </label>
          <input
            type={['lon','lat','luas','jumlah_lantai'].includes(fld) ? 'number' : 'text'}
            step={['lon','lat','luas'].includes(fld) ? 'any' : undefined}
            value={data[fld] ?? ''}
            onChange={e => setData(d => ({ ...d, [fld]: e.target.value }))}
            className="border p-2 w-full rounded-lg"
          />
        </div>
      ))}
      <MiniMap lat={parseFloat(data.lat)} lon={parseFloat(data.lon)} onLatLonChange={handleLatLonChange} kode_bangunan={data.kode_bangunan || (data.id_bangunan ? data.id_bangunan.split('_')[0] : 'BMN')} />
      <div className="mb-4">
        <label className="block text-sm font-semibold">Taxonomy</label>
        <select
          value={data.taxonomy || ''}
          onChange={e => setData(d => ({ ...d, taxonomy: e.target.value }))}
          className="border p-2 w-full rounded-lg"
        >
          <option value="CR">CR</option>
          <option value="MCF">MCF</option>
          <option value="MUR">MUR</option>
          <option value="LightWood">LightWood</option>
        </select>
      </div>
      <div className="flex justify-end gap-4">
        <Button
          onClick={() => onSave({
            nama_gedung: data.nama_gedung,
            alamat: data.alamat,
            lon: parseFloat(data.lon),
            lat: parseFloat(data.lat),
            luas: parseFloat(data.luas),
            jumlah_lantai: parseInt(data.jumlah_lantai, 10),
            taxonomy: data.taxonomy
          })}
          disabled={isSavingEdit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          {isSavingEdit ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </>
  )
}
