'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { City } from '@/lib/types'

interface CityContextType {
  selectedCity: City | null
  setSelectedCity: (city: City | null) => void
}

const CityContext = createContext<CityContextType | undefined>(undefined)

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<City | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('selectedCity')
    if (stored) {
      try {
        setSelectedCityState(JSON.parse(stored))
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const setSelectedCity = (city: City | null) => {
    setSelectedCityState(city)
    if (city) {
      localStorage.setItem('selectedCity', JSON.stringify(city))
    } else {
      localStorage.removeItem('selectedCity')
    }
  }

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  )
}

export function useCity() {
  const context = useContext(CityContext)
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider')
  }
  return context
}

