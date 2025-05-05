// hooks/useAALProvinsi.js
import { useState, useEffect } from 'react'
import { getAALProvinsi } from '../src/lib/api'

export default function useAALProvinsi() {
  const [geojson, setGeojson] = useState(null)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getAALProvinsi()
      .then((data) => setGeojson(data))
      .catch((err) => setError(err))
  }, [])

  return { geojson, error }
}
