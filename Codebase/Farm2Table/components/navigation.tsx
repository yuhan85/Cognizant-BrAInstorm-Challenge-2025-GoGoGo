'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCity } from '@/contexts/city-context'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { getCities } from '@/lib/data-store'
import { City } from '@/lib/types'
import { Logo } from '@/components/logo'

export function Navigation() {
  const { data: session } = useSession()
  const { selectedCity, setSelectedCity } = useCity()
  const cities = getCities()

  return (
    <nav className="border-b bg-white sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Logo className="h-8 w-8" />
            <span>Farm2Table</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/farms" className="text-sm font-medium hover:text-primary transition-colors">
              Farms
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedCity?.id || ''}
            onChange={(e) => {
              const city = cities.find(c => c.id === e.target.value)
              setSelectedCity(city || null)
            }}
            className="w-48"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.state}
              </option>
            ))}
          </Select>
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={async () => {
                await signOut({ redirect: false })
                const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'
                window.location.href = `${baseUrl}/`
              }}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

