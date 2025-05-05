// components/CrudBuildings.js
import { useState, useEffect } from 'react'
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
  recalc
} from '../src/lib/api'

export default function CrudBuildings() {
  const [provList, setProvList] = useState([])
  const [kotaList, setKotaList] = useState([])
  const [rows, setRows] = useState([])
  const [file, setFile] = useState(null)

  const [provFilter, setProvFilter] = useState('')
  const [kotaFilter, setKotaFilter] = useState('')
  const [search, setSearch] = useState('')

  const [modalMode, setModalMode] = useState('') // 'add' | 'edit' | ''
  const [editing, setEditing] = useState(null)

  const [isDelete, setIsDelete] = useState(false)

  // load provinsi once
  useEffect(() => {
    getBuildingProvinsi().then(setProvList)
  }, [])

  // when provinsi changes, load kota
  useEffect(() => {
    if (!provFilter) return setKotaList([])
    getBuildingKota(provFilter).then(setKotaList)
  }, [provFilter])

  // load table on filter change
  useEffect(() => {
    if (provFilter && kotaFilter) {
      getBuildings({ provinsi: provFilter, kota: kotaFilter, nama: search }).then(
        setRows
      )
    } else {
      setRows([])
    }
  }, [provFilter, kotaFilter, search, isDelete])

  async function onUpload() {
    if (!file) return
    await uploadBuildingsCSV(file)
    setFile(null)
    getBuildings({ provinsi: provFilter, kota: kotaFilter, nama: search }).then(
      setRows
    )
  }

  async function openEdit(id) {
    const b = await getBuilding(id)
    setEditing(b)
    setModalMode('edit')
  }

  async function onSaveEdit(data) {
    await updateBuilding(editing.id_bangunan, data)
    setModalMode('')
    setEditing(null)
  }

  async function onAdd(data) {
    const { id_bangunan } = await getNewBuildingId(data.kode_bangunan)
    await addBuilding({ ...data, id_bangunan })
    setModalMode('')
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
      <h2 className="text-xl font-bold">Manajemen Bangunan</h2>

      {/* Upload CSV */}
      <div className="flex gap-2 items-center">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded-lg flex-1"
        />
        <Button
          onClick={onUpload}
          disabled={!file}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Upload
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-end">
        <Select
          id="provFilterBangunan"
          label="Provinsi:"
          options={['', ...provList]}
          value={provFilter}
          onChange={setProvFilter}
          placeholder="-- Pilih Provinsi --"
        />
        <Select
          id="kotaFilterBangunan"
          label="Kota/Kabupaten:"
          options={['', ...kotaList]}
          value={kotaFilter}
          onChange={setKotaFilter}
          disabled={!provFilter}
          placeholder="-- Pilih Kota --"
        />
        <input
          type="text"
          placeholder="Cari Nama"
          disabled={!kotaFilter}
          className="border p-2 rounded-lg flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          onClick={() => setModalMode('add')}
          disabled={!kotaFilter}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          ADD +
        </Button>
        <Button
          onClick={recalc}
          disabled={!provFilter || !kotaFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Kalkulasi Ulang
        </Button>
      </div>

      {/* Table */}
      <table className="w-full text-sm mt-4">
        <thead className="bg-red-700 text-white">
          <tr>
            <th className="p-2 text-left">Nama Gedung</th>
            <th className="p-2 text-left">Alamat</th>
            <th className="p-2 text-left">Kota</th>
            <th className="p-2 text-left">Provinsi</th>
            <th className="p-2 text-left">Lon</th>
            <th className="p-2 text-left">Lat</th>
            <th className="p-2 text-left">Taxonomy</th>
            <th className="p-2 text-left">Luas</th>
            <th className="p-2 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id_bangunan}>
              <td className="p-2">{b.nama_gedung}</td>
              <td className="p-2">{b.alamat}</td>
              <td className="p-2">{b.kota}</td>
              <td className="p-2">{b.provinsi}</td>
              <td className="p-2">{b.lon}</td>
              <td className="p-2">{b.lat}</td>
              <td className="p-2">{b.taxonomy}</td>
              <td className="p-2">{b.luas}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => openEdit(b.id_bangunan)}
                  className="text-blue-600 hover:underline"
                >
                  ✏️
                </button>
                <button
                  onClick={() => {deleteBuilding(b.id_bangunan); setIsDelete(!isDelete)}}
                  className="text-red-600 hover:underline"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Modal */}
      <Modal isOpen={modalMode === 'add'} onClose={() => setModalMode('')}>
        <AddForm provList={provList} kotaList={kotaList} onSave={onAdd} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modalMode === 'edit'} onClose={() => setModalMode('')}>
        <EditForm initial={editing} onSave={onSaveEdit} />
      </Modal>
    </div>
  )
}

// ---- Sub-components for Add/Edit ----

function AddForm({ provList, kotaList, onSave }) {
  const [data, setData] = useState({
    nama_gedung: '',
    alamat: '',
    provinsi: '',
    kota: '',
    lon: '',
    lat: '',
    taxonomy: 'CR',
    luas: '',
    kode_bangunan: 'BMN'
  })

  useEffect(() => {
    if (data.provinsi) {
      getBuildingKota(data.provinsi).then((kl) =>
        setData((d) => ({ ...d, kotaList: kl }))
      )
    }
  }, [data.provinsi])

  return (
    <>
      <h3 className="text-lg font-bold mb-4">Tambah Bangunan</h3>
      {['nama_gedung', 'alamat', 'luas'].map((fld) => (
        <div key={fld}>
          <label className="block text-sm font-semibold">
            {fld.replace('_', ' ').toUpperCase()}
          </label>
          <input
            type={fld === 'luas' ? 'number' : 'text'}
            value={data[fld]}
            onChange={(e) =>
              setData((d) => ({ ...d, [fld]: e.target.value }))
            }
            className="border p-2 w-full rounded-lg"
          />
        </div>
      ))}
      <Select
        id="addProvinsi"
        label="Provinsi"
        options={provList}
        value={data.provinsi}
        onChange={(v) => setData((d) => ({ ...d, provinsi: v }))}
        placeholder="-- Pilih Provinsi --"
      />
      <Select
        id="addKota"
        label="Kota/Kabupaten"
        options={kotaList}
        value={data.kota}
        onChange={(v) => setData((d) => ({ ...d, kota: v }))}
        disabled={!data.provinsi}
        placeholder="-- Pilih Kota --"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-semibold">Longitude</label>
          <input
            type="number"
            step="any"
            value={data.lon}
            onChange={(e) =>
              setData((d) => ({ ...d, lon: e.target.value }))
            }
            className="border p-2 w-full rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Latitude</label>
          <input
            type="number"
            step="any"
            value={data.lat}
            onChange={(e) =>
              setData((d) => ({ ...d, lat: e.target.value }))
            }
            className="border p-2 w-full rounded-lg"
          />
        </div>
      </div>
      <Select
        id="addKodeBangunan"
        label="Kode Bangunan"
        options={['BMN', 'FS', 'FD']}
        value={data.kode_bangunan}
        onChange={(v) => setData((d) => ({ ...d, kode_bangunan: v }))}
      />
      <Select
        id="addTaxonomy"
        label="Taxonomy"
        options={['CR', 'MCF', 'MUR', 'LightWood']}
        value={data.taxonomy}
        onChange={(v) => setData((d) => ({ ...d, taxonomy: v }))}
      />
      <div className="flex justify-end gap-4 mt-4">
        <Button
          onClick={() => onSave(data)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Tambah
        </Button>
      </div>
    </>
  )
}

function EditForm({ initial, onSave }) {
  const [data, setData] = useState(initial)

  useEffect(() => {
    setData(initial)
  }, [initial])

  return (
    <>
      <h3 className="text-lg font-bold mb-4">Edit Bangunan</h3>
      {['nama_gedung', 'alamat', 'lon', 'lat', 'luas'].map((fld) => (
        <div key={fld}>
          <label className="block text-sm font-semibold">
            {fld.replace('_', ' ').toUpperCase()}
          </label>
          <input
            type={['lon', 'lat', 'luas'].includes(fld) ? 'number' : 'text'}
            step={['lon', 'lat'].includes(fld) ? 'any' : undefined}
            value={data[fld]}
            onChange={(e) =>
              setData((d) => ({ ...d, [fld]: e.target.value }))
            }
            className="border p-2 w-full rounded-lg"
          />
        </div>
      ))}
      <div className="flex justify-end gap-4 mt-4">
        <Button
          onClick={() => onSave({
            nama_gedung: data.nama_gedung,
            alamat: data.alamat,
            lon: parseFloat(data.lon),
            lat: parseFloat(data.lat),
            taxonomy: data.taxonomy,
            luas: parseFloat(data.luas)
          })}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Simpan
        </Button>
      </div>
    </>
  )
}
