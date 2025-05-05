// hooks/useChartData.js
import { useState, useEffect } from 'react'
import { getAALProvinsiList, getAALProvinsiData } from '../src/lib/api'

export default function useChartData() {
  const [provs, setProvs] = useState([])
  const [data, setData]   = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAALProvinsiList().then(setProvs).catch(setError)
  }, [])

  function load(prov) {
    if (!prov) return setData(null)
    getAALProvinsiData(prov).then(setData).catch(setError)
  }

  return { provs, data, load, error }
}
