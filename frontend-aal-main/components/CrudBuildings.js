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

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 inline-block mr-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}

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
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isSavingAdd, setIsSavingAdd] = useState(false)


  // load provinsi once
  useEffect(() => {
    getBuildingProvinsi().then(setProvList)
  }, [])

  // when provinsi filter changes, load kota filter
  useEffect(() => {
    if (!provFilter) {
      setKotaList([])
    } else {
      getBuildingKota(provFilter).then(setKotaList)
    }
  }, [provFilter])

  // helper to refresh table
  const refreshTable = () => {
    if (provFilter && kotaFilter) {
      return getBuildings({
        provinsi: provFilter,
        kota: kotaFilter,
        nama: search
      }).then(setRows)
    } else {
      setRows([])
      return Promise.resolve()
    }
  }

  // load table on filter change or after delete
  useEffect(() => {
    refreshTable()
  }, [provFilter, kotaFilter, search, isDelete])

  // === Modified onUpload ===
  async function onUpload() {
    setIsSaving(true)
    try {
      if (!file) return

      // 1) Upload CSV to server
      await uploadBuildingsCSV(file)
      window.alert('Database berhasil diperbarui dari CSV')

      // 2) Recalc all buildings
      await recalc()
      window.alert('Perhitungan CSV selesai')

      // 3) Reset file input & refresh table
      setFile(null)
      await refreshTable()
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false)
    }
  }
  // === end onUpload modification ===

  async function openEdit(id) {
    try {
      const b = await getBuilding(id)
      setEditing(b)
      setModalMode('edit')
    } catch (error) {
      console.error('Error loading building:', error)
    }
  }

  // EDIT handler: optimistic UI + update DB + recalc + refresh + popups
  async function onSaveEdit(data) {
    setIsSavingEdit(true)
    try {
      // 1) Optimistic update UI
      setRows(rs =>
        rs.map(b =>
          b.id_bangunan === editing.id_bangunan
            ? { ...b, ...data }
            : b
        )
      )

      // 2) Update di server
      await updateBuilding(editing.id_bangunan, data)
      window.alert('Database berhasil diperbarui')

      // 3) Recalc untuk bangunan
      await recalc(editing.id_bangunan)

      // 4) Refresh tabel
      await refreshTable()
      window.alert('Perhitungan untuk bangunan selesai')

      // 5) Tutup modal
      setModalMode('')
      setEditing(null)
    } catch (err) {
      console.error('Error saving edit:', err)
    } finally {
      setIsSavingEdit(false);
    }
  }

  // ADD handler: optimistic insert + create DB + recalc + refresh + popups
  async function onAdd(data) {
    setIsSavingAdd(true)
    try {
      const { id_bangunan } = await getNewBuildingId(data.kode_bangunan)
      const newRow = { ...data, id_bangunan }

      // 1) Optimistic insert
      setRows(rs => [newRow, ...rs])

      // 2) Create di server
      await addBuilding(newRow)
      window.alert('Database berhasil diperbarui')

      // 3) Recalc bangunan baru
      await recalc(id_bangunan)

      // 4) Refresh tabel
      await refreshTable()
      window.alert('Perhitungan untuk bangunan baru selesai')

      // 5) Tutup modal
      setModalMode('')
    } catch (err) {
      console.error('Error adding building:', err)
    } finally {
      setIsSavingAdd(false)
    }
  }

  // DELETE handler: optimistic remove + delete DB + recalc background
  async function confirmDelete() {
    setIsDeleting(true)
    try {
      setRows(rs => rs.filter(b => b.id_bangunan !== deleteTarget.id_bangunan))
      await deleteBuilding(deleteTarget.id_bangunan, deleteTarget.provinsi)
      setIsDelete(prev => !prev)
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus bangunan')
    } finally {
      setIsDeleting(false)
    }
  }

  function onDeleteClick(row) {
    setDeleteTarget(row)
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
          disabled={!file || isSaving}
          className={`bg-red-600 hover:bg-red-700 text-white flex items-center justify-center ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving && (
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
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
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          ADD +
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
            <th className="p-2 text-left">Jumlah Lantai</th>
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
              <td className="p-2">{b.jumlah_lantai}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => openEdit(b.id_bangunan)}
                  className="text-blue-600 hover:underline"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeleteClick(b)}
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
        <AddForm provList={provList} onSave={onAdd} isSavingAdd={isSavingAdd} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modalMode === 'edit'} onClose={() => setModalMode('')}>
        <EditForm initial={editing} onSave={onSaveEdit} isSavingEdit={isSavingEdit} />
      </Modal>

       {/* Modal Delete */}
       <Modal
        isOpen={!!deleteTarget}
        onClose={() => deleteTarget && !isDeleting && setDeleteTarget(null)}
      >
        <h3 className="text-lg font-bold mb-4">Hapus Bangunan</h3>
        <p>Yakin ingin menghapus bangunan <strong>{deleteTarget?.nama_gedung}</strong>?</p>
        <div className="flex justify-end gap-4 mt-6">
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
            className="bg-gray-400 hover:bg-gray-500 text-white"
          >
            Batal
          </Button>
          <Button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center"
          >
            {isDeleting && <LoadingSpinner />}
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// ---- Sub-components for Add/Edit ----

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

  return (
    <>
      <h3 className="text-lg font-bold mb-4">Tambah Bangunan</h3>
      {['nama_gedung', 'alamat', 'luas', 'jumlah_lantai'].map((fld) => (
        <div key={fld}>
          <label className="block text-sm font-semibold">
            {fld === 'jumlah_lantai'
              ? 'JUMLAH LANTAI'
              : fld.replace('_', ' ').toUpperCase()}
          </label>
          <input
            type={['luas', 'jumlah_lantai'].includes(fld) ? 'number' : 'text'}
            step={fld === 'luas' ? 'any' : undefined}
            value={data[fld]}
            onChange={e =>
              setData(d => ({ ...d, [fld]: e.target.value }))
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
        onChange={v => setData(d => ({ ...d, provinsi: v }))}
        placeholder="-- Pilih Provinsi --"
      />
      <Select
        id="addKota"
        label="Kota/Kabupaten"
        options={['', ...localKotaList]}
        value={data.kota}
        onChange={v => setData(d => ({ ...d, kota: v }))}
        disabled={!data.provinsi}
        placeholder="-- Pilih Kota --"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-semibold">Longitude</label>
          <input
            type="number" step="any"
            value={data.lon}
            onChange={e => setData(d => ({ ...d, lon: e.target.value }))}
            className="border p-2 w-full rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Latitude</label>
          <input
            type="number" step="any"
            value={data.lat}
            onChange={e => setData(d => ({ ...d, lat: e.target.value }))}
            className="border p-2 w-full rounded-lg"
          />
        </div>
      </div>
      <Select
        id="addKodeBangunan"
        label="Kode Bangunan"
        options={['BMN', 'FS', 'FD']}
        value={data.kode_bangunan}
        onChange={v => setData(d => ({ ...d, kode_bangunan: v }))}
      />
      <Select
        id="addTaxonomy"
        label="Taxonomy"
        options={['CR', 'MCF', 'MUR', 'LightWood']}
        value={data.taxonomy}
        onChange={v => setData(d => ({ ...d, taxonomy: v }))}
      />
      <div className="flex justify-end gap-4 mt-4">
        <Button
          disable={isSavingAdd}
          onClick={() => onSave({
            ...data,
            luas: parseFloat(data.luas),
            jumlah_lantai: parseInt(data.jumlah_lantai, 10)
          })}
          className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center ${isSavingAdd ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSavingAdd && (
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          Tambah
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

  return (
    <>
      <h3 className="text-lg font-bold mb-4">Edit Bangunan</h3>
      {['nama_gedung', 'alamat', 'lon', 'lat', 'luas', 'jumlah_lantai'].map((fld) => (
        <div key={fld}>
          <label className="block text-sm font-semibold">
            {fld === 'jumlah_lantai'
              ? 'JUMLAH LANTAI'
              : fld.replace('_', ' ').toUpperCase()}
          </label>
          <input
            type={['lon', 'lat', 'luas', 'jumlah_lantai'].includes(fld) ? 'number' : 'text'}
            step={['lon', 'lat', 'luas'].includes(fld) ? 'any' : undefined}
            value={data[fld] ?? ''}
            onChange={e => setData(d => ({ ...d, [fld]: e.target.value }))}
            className="border p-2 w-full rounded-lg"
          />
        </div>
      ))}
      <div className="flex justify-end gap-4 mt-4">
        <Button
          disabled={isSavingEdit}
          onClick={() => onSave({
            nama_gedung: data.nama_gedung,
            alamat: data.alamat,
            lon: parseFloat(data.lon),
            lat: parseFloat(data.lat),
            luas: parseFloat(data.luas),
            jumlah_lantai: parseInt(data.jumlah_lantai, 10),
            taxonomy: data.taxonomy
          })}
          className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center ${isSavingEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSavingEdit && (
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {isSavingEdit ? 'Menyimpan…' : 'Simpan'}
        </Button>
      </div>
    </>
  )
}
