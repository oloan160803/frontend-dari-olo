// components/CrudHSBGN.js
import { useState, useEffect } from 'react'
import Modal from './ui/Modal'         // your existing Modal component
import Button from './ui/Button'       // your existing Button component
import { getProvinsi, getHSBGN, updateHSBGN } from '../src/lib/api'

export default function CrudHSBGN() {
  // dropdown options & all rows
  const [provOptions, setProvOptions] = useState([])
  const [rows, setRows]             = useState([])

  // filters
  const [filterProv, setFilterProv] = useState('')
  const [searchCity, setSearchCity] = useState('')

  // editing state
  const [editing, setEditing]       = useState(null)  // the row being edited
  const [newValue, setNewValue]     = useState('')    // edited hsbgn

  // load provinces + table data once
  useEffect(() => {
    getProvinsi()
      .then(setProvOptions)
      .catch(console.error)
    reloadTable()
  }, [])

  // helper to load table
  function reloadTable() {
    getHSBGN()
      .then(setRows)
      .catch(console.error)
  }

  // filtered rows
  const filteredRows = rows.filter(r => {
    const matchProv = !filterProv || r.provinsi === filterProv
    const matchCity = !searchCity || r.kota.toLowerCase().includes(searchCity.toLowerCase())
    return matchProv && matchCity
  })

  // open modal
  function onEditClick(row) {
    setEditing(row)
    setNewValue(row.hsbgn)
  }

  // save edited value
  async function onSave() {
    try {
      await updateHSBGN(editing.id_kota, parseFloat(newValue))
      reloadTable()
      setEditing(null)
    } catch (err) {
      console.error(err)
      alert('Gagal menyimpan perubahan')
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-800">Manajemen HSBGN</h2>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Provinsi:</label>
        <select
          className="border p-2 rounded-lg"
          value={filterProv}
          onChange={e => setFilterProv(e.target.value)}
        >
          <option value="">-- Semua Provinsi --</option>
          {provOptions.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
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
        <form
          onSubmit={e => {
            e.preventDefault()
            onSave()
          }}
          className="flex flex-col gap-4"
        >
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
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
