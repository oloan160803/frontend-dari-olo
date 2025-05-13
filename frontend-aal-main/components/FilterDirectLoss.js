// components/FilterDirectLoss.js
import React, { useMemo } from 'react'
import Select from './ui/Select';

export default function FilterDirectLoss({
  provList,
  kotaList,
  selectedProv,
  setSelectedProv,
  selectedKota,
  setSelectedKota,
  filters,
  setFilters,
  search,
  setSearch,
  geojson
}) {
  // Generate suggestions based on current filters and search term
  const suggestions = useMemo(() => {
    if (!selectedProv || !selectedKota || !search) return [];
    const lower = search.toLowerCase();
    return (
      geojson.features
        .filter((f) => {
          const p = f.properties;
          const type = (p.id_bangunan || '').split('_')[0];
          if (!filters[type]) return false;
          if (p.provinsi !== selectedProv || p.kota !== selectedKota) return false;
          return p.nama_gedung.toLowerCase().includes(lower);
        })
        .map((f) => f.properties.nama_gedung)
        .filter((v, i, a) => a.indexOf(v) === i)
        // hide exact match so suggestions clear on click
        .filter((v) => v.toLowerCase() !== lower)
        .slice(0, 20)
    );
  }, [geojson, selectedProv, selectedKota, filters, search]);

  return (
    <div className="flex flex-col gap-4 overflow-visible">
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
          { key: 'FS',  label: 'Fasilitas Kesehatan' },
          { key: 'FD',  label: 'Fasilitas Pendidikan' }
        ].map((type) => (
          <label
            key={type.key}
            className="flex items-center gap-2 text-black px-4 py-2 bg-[#C084FC] rounded-4xl hover:bg-cyan-700 hover:text-black cursor-pointer"
          >
            <input
              type="checkbox"
              checked={filters[type.key]}
              onChange={() => setFilters((f) => ({ ...f, [type.key]: !f[type.key] }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{type.label}</span>
          </label>
        ))}
      </div>

      {/* Pencarian Gedung dengan Preview */}
      <div className="relative">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Cari nama gedung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedProv || !selectedKota}
          />
          <button
            type="button"
            className="ml-2 px-4 py-2 bg-[#22D3EE] text-black rounded-4xl hover:bg-[#3B82F6] hover:text-white font-[SF Pro] whitespace-nowrap transition"
            onClick={() => {
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

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 z-[9999] w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 font-[SF Pro] text-sm shadow-lg">
            {suggestions.map((name) => (
              <li
                key={name}
                onClick={() => setSearch(name)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 font-[SF Pro]"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
