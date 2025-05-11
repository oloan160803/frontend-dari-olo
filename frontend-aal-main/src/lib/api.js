/**
 * Fetch JSON from a relative `/api/...` path.
 * Errors if status is not OK.
 */

const BASE_URL = 'http://localhost:5000'


async function fetchJSON(path, opts = {}) {
    const res = await fetch(BASE_URL + path, opts)
    if (!res.ok) {
      throw new Error(`Failed to load ${path} (status ${res.status})`)
    }
    return res.json()
  }
  
  // AAL per Provinsi
  export function getAALProvinsi() {
    return fetchJSON('/api/aal-provinsi')
  }
  export function getAALProvinsiList() {
    return fetchJSON('/api/aal-provinsi-list')
  }
  export function getAALProvinsiData(provinsi) {
    return fetchJSON(
      `/api/aal-provinsi-data?provinsi=${encodeURIComponent(provinsi)}`
    )
  }
  
  // Provinsi & Kota
  export function getProvinsi() {
    return fetchJSON('/api/hsbgn/provinsi')
  }
  export function getKota(provinsi) {
    return fetchJSON(
      `/api/hsbgn/provinsi/${encodeURIComponent(provinsi)}/kota`
    )
  }
  
  // Gedung Direct Loss
  export function getGedung(provinsi, kota) {
    return fetchJSON(
      `/api/gedung?provinsi=${encodeURIComponent(provinsi)}&kota=${encodeURIComponent(kota)}`
    )
  }
  
  // HSBGN CRUD
  export function getHSBGN() {
    return fetchJSON('/api/hsbgn')
  }
  export function updateHSBGN(id, hsbgn) {
    return fetchJSON(`/api/hsbgn/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hsbgn })
    })
  }
  export function addHSBGN(provinsi, kota, hsbgn) {
    return fetchJSON('/api/hsbgn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provinsi, kota, hsbgn })
    })
  }
  
  // Bangunan CRUD
  export function getBuildingProvinsi() {
    return fetchJSON('/api/bangunan/provinsi')
  }
  export function getBuildingKota(provinsi) {
    return fetchJSON(
      `/api/bangunan/kota?provinsi=${encodeURIComponent(provinsi)}`
    )
  }
  export function uploadBuildingsCSV(file) {
    const fd = new FormData()
    fd.append('file', file)
    return fetchJSON('/api/bangunan/upload', { method: 'POST', body: fd })
  }
  export function getBuildings(params) {
    const qs = new URLSearchParams(params).toString()
    return fetchJSON(`/api/bangunan?${qs}`)
  }
  export function getNewBuildingId(kode) {
    return fetchJSON(
      `/api/bangunan/new-id?taxonomy=${encodeURIComponent(kode)}`
    )
  }
  export function addBuilding(payload) {
    return fetchJSON('/api/bangunan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
  export function getBuilding(id) {
    return fetchJSON(`/api/bangunan/${id}`)
  }
  export function updateBuilding(id, payload) {
    return fetchJSON(`/api/bangunan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
  export function deleteBuilding(id, prov) {
    return fetchJSON(`/api/bangunan/${id}/${prov}`, { method: 'DELETE' })
  }
  
  // Recalculate per–building or global.
  // Jika bangunanId diberikan: POST /api/bangunan/:id/recalc
  // Jika bangunanId == null: GET /process_join
  export async function recalc(bangunanId) {
    const url = bangunanId != null
      ? `/api/bangunan/${encodeURIComponent(bangunanId)}/recalc`
      : '/process_join'
    const method = bangunanId != null ? 'POST' : 'GET'
  
    const res = await fetchJSON(url, { method })
    if (!res.ok) {
      console.warn(`⚠️ recalc request to ${url} returned status ${res.status}, diabaikan`)
      return null
    }
    try {
      return await res.json()
    } catch {
      // Kalau body bukan JSON atau kosong, anggap sukses
      return null
    }
  }
  
  // Alias yang jelas: global recalc setelah CSV upload
  export async function recalcAll() {
    // Memanggil endpoint GET /process_join
    const res = await fetchJSON('/process_join', { method: 'GET' })
    if (!res.ok) {
      console.warn(`⚠️ recalcAll request to /process_join returned status ${res.status}, diabaikan`)
      return null
    }
    try {
      return await res.json()
    } catch {
      return null
    }
  }
  
  // kurva
  export function getDisasterCurves() {
    return fetchJSON('/api/disaster-curves')
  }