// components/CrudHSBGN.js
import { useState, useEffect } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import {
  getProvinsi,
  getHSBGN,
  updateHSBGN,
  recalcAll   // global recalculation endpoint
} from '../src/lib/api'

export default function CrudHSBGN() {
  const [provOptions, setProvOptions] = useState([])
  const [rows, setRows] = useState([])
  const [filterProv, setFilterProv] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [editing, setEditing] = useState(null)
  const [newValue, setNewValue] = useState('')

  // **Loading state** untuk tombol Simpan
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getProvinsi().then(setProvOptions).catch(console.error)
    reloadTable()
  }, [])

  function reloadTable() {
    getHSBGN().then(setRows).catch(console.error)
  }

  const filteredRows = rows.filter(r => {
    const matchProv = !filterProv || r.provinsi === filterProv
    const matchCity = !searchCity || r.kota.toLowerCase().includes(searchCity.toLowerCase())
    return matchProv && matchCity
  })

  function onEditClick(row) {
    setEditing(row)
    setNewValue(row.hsbgn)
  }

  async function onSave() {
    setIsSaving(true)       // mulai loading
    try {
      await updateHSBGN(editing.id_kota, parseFloat(newValue))
      window.alert('Database berhasil diperbarui')

      await recalcAll()
      window.alert('Perhitungan selesai')

      reloadTable()
      setEditing(null)
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan perubahan')
    } finally {
      setIsSaving(false)    // berhenti loading
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
      <h2 className="text-xl font-bold">Manajemen HSBGN</h2>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Provinsi:</label>
        <select
          className="border p-2 rounded-lg"
          value={filterProv}
          onChange={e => setFilterProv(e.target.value)}
        >
          <option value="">-- Semua Provinsi --</option>
          {provOptions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <label className="text-sm font-semibold">Cari Kota:</label>
        <input
          type="text"
          className="border p-2 rounded-lg"
          placeholder="ketik untuk cari..."
          value={searchCity}
          onChange={e => setSearchCity(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-sm mt-4">
          <thead className="bg-red-700 text-white">
            <tr>
              <th className="p-2 text-left">Kota</th>
              <th className="p-2 text-left">Provinsi</th>
              <th className="p-2 text-left">Nilai HSBGN</th>
              <th className="p-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(r => (
              <tr key={r.id_kota}>
                <td className="p-2">{r.kota}</td>
                <td className="p-2">{r.provinsi}</td>
                <td className="p-2">Rp {Number(r.hsbgn).toLocaleString('id-ID')}</td>
                <td className="p-2">
                  <Button
                    onClick={() => onEditClick(r)}
                    className="text-blue-600 hover:underline p-0"
                  >
                    ✏️ Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)}>
        <h3 className="text-lg font-bold mb-4">Edit HSBGN</h3>
        <form onSubmit={e => { e.preventDefault(); onSave() }} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold">Kota</label>
            <input
              type="text"
              className="border p-2 w-full rounded-lg"
              value={editing?.kota || ''}
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Provinsi</label>
            <input
              type="text"
              className="border p-2 w-full rounded-lg"
              value={editing?.provinsi || ''}
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Nilai HSBGN (Rp)</label>
            <input
              type="number"
              className="border p-2 w-full rounded-lg"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              type="button"
              onClick={() => setEditing(null)}
              className="bg-gray-400 hover:bg-gray-500 text-white"
              disabled={isSaving}
            >
              Batal
            </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                {isSaving ? 'Menyimpan…' : 'Simpan Perubahan'}
              </Button>
            </div>
        </form>
      </Modal>
    </div>
  )
}
