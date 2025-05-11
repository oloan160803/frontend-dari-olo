// components/FilterDirectLoss.js
import Select from './ui/Select';

export default function FilterDirectLoss({
  provList, kotaList,
  selectedProv, setSelectedProv,
  selectedKota, setSelectedKota,
  filters, setFilters,
  search, setSearch
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Filter Provinsi dan Kota */}
      <div className="flex flex-wrap gap-4">
        <Select
          id="provinsiSelect"
          value={selectedProv}
          onChange={setSelectedProv}
          options={provList}
          placeholder="Pilih Provinsi"
          className="w-64"
        />
        <Select
          id="kotaSelect"
          value={selectedKota}
          onChange={setSelectedKota}
          options={kotaList}
          disabled={!selectedProv}
          placeholder="Pilih Kota"
          className="w-64"
        />
      </div>

      {/* Filter Tipe Bangunan */}
      <div className="flex flex-wrap gap-4">
        {[
          { key: 'BMN', label: 'Bangunan Milik Negara' },
          { key: 'FS', label: 'Fasilitas Kesehatan' },
          { key: 'FD', label: 'Fasilitas Pendidikan' }
        ].map(type => (
          <label key={type.key} className="flex items-center gap-2 text-black px-4 py-2 bg-[#C084FC] rounded-4xl hover:bg-cyan-700 hover:text-black cursor-pointer">
            <input
              type="checkbox"
              checked={filters[type.key]}
              onChange={() => setFilters(f => ({ ...f, [type.key]: !f[type.key] }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{type.label}</span>
          </label>
        ))}
      </div>

      {/* Pencarian Gedung */}
      <div className="relative flex gap-2 items-center">
        <input
          type="text"
          placeholder="Cari nama gedung..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          className="ml-2 px-4 py-2 bg-[#22D3EE] text-black rounded-4xl hover:bg-[#3B82F6] hover:text-white font-[SF Pro] whitespace-nowrap transition "
          onClick={() => {
            // Ambil filter dari props
            const params = new URLSearchParams();
            if (selectedProv) params.append('provinsi', selectedProv);
            if (selectedKota) params.append('kota', selectedKota);
            params.append('bmn', filters.BMN);
            params.append('fs', filters.FS);
            params.append('fd', filters.FD);
            if (search) params.append('search', search);
            window.open(`/api/gedung/download?${params.toString()}`, '_blank');
          }}
        >
          Unduh Data
        </button>
      </div>
    </div>
  );
}
