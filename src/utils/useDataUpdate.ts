import { useEffect, useState } from 'react'
import { DATA_UPDATED_EVENT } from './dataUpdateEvent'

export default function useDataUpdate() {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const handler = () => setVersion(v => v + 1)
    window.addEventListener(DATA_UPDATED_EVENT, handler)
    return () => window.removeEventListener(DATA_UPDATED_EVENT, handler)
  }, [])

  return version
}
