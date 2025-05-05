// hooks/useDirectLoss.js
import { useState, useEffect } from 'react'
import { getProvinsi, getKota, getGedung } from '../src/lib/api'

export default function useDirectLoss() {
  const [provList, setProvList]       = useState([])
  const [kotaList, setKotaList]       = useState([])
  const [geojson, setGeojson]         = useState(null)
  const [selectedProv, setSelectedProv] = useState('')
  const [selectedKota, setSelectedKota] = useState('')
  const [filters, setFilters]         = useState({ BMN: true, FS: true, FD: true })
  const [search, setSearch]           = useState('')

  // load provinsi
  useEffect(() => {
    getProvinsi().then(list => {
      setProvList(list.map(p => ({ label: p, value: p })))
    })
  }, [])

  // load kota when prov changes
  useEffect(() => {
    if (!selectedProv) return setKotaList([])
    getKota(selectedProv).then(list => {
      setKotaList(list.map(k => ({ label: k, value: k })))
    })
  }, [selectedProv])

  // load gedung when both prov & kota set
  useEffect(() => {
    if (selectedProv && selectedKota) {
      getGedung(selectedProv, selectedKota).then(setGeojson)
    } else {
      setGeojson(null)
    }
  }, [selectedProv, selectedKota])

  return {
    provList,
    kotaList,
    geojson,
    selectedProv,
    setSelectedProv,
    selectedKota,
    setSelectedKota,
    filters,
    setFilters,
    search,
    setSearch
  }
}
