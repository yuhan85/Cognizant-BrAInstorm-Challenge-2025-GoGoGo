'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Loader2, ArrowDown } from 'lucide-react'

// Vehicle emissions in kg CO2 per km
const vehicleEmissions: Record<string, number> = {
  compact: 0.12,
  midsize: 0.15,
  suv: 0.18,
  truck: 0.22,
}

export function CarbonCalculator() {
  const [tripsPerWeek, setTripsPerWeek] = useState('')
  const [kmRoundTrip, setKmRoundTrip] = useState('8')
  const [vehicleClass, setVehicleClass] = useState<'compact' | 'midsize' | 'suv' | 'truck'>('midsize')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    estimated_monthly_kg_co2_saved: number
    assumptions: string[]
    explanation: string
  } | null>(null)
  const [animatedValue, setAnimatedValue] = useState(0)
  const [animatedTemperature, setAnimatedTemperature] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Calculate current monthly emissions
  const calculateCurrentEmissions = () => {
    if (!tripsPerWeek) return 0
    const trips = parseInt(tripsPerWeek) || 0
    const km = parseFloat(kmRoundTrip) || 8
    const kgPerKm = vehicleEmissions[vehicleClass] || 0.15
    return trips * km * kgPerKm * 4.33 // Monthly
  }

  // Calculate emissions after using Farm2Table
  const calculateNewEmissions = () => {
    const current = calculateCurrentEmissions()
    if (!result) return 0
    // New emissions = current - saved
    return Math.max(0, current - result.estimated_monthly_kg_co2_saved)
  }

  // Calculate reduction percentage
  const calculateReductionPercentage = () => {
    const current = calculateCurrentEmissions()
    if (current === 0) return 0
    return (result?.estimated_monthly_kg_co2_saved || 0) / current * 100
  }

  // Calculate temperature impact (in microdegrees Celsius)
  // Based on scientific estimates: 1 ton CO2 ≈ 0.0000000015°C warming
  // 1 microdegree = 0.000001°C, so 1 ton CO2 ≈ 0.0015 microdegrees
  // For better readability, we'll calculate based on kg CO2 saved
  const calculateTemperatureImpact = () => {
    if (!result) return 0
    // Convert kg to tons (divide by 1000)
    const tonsCO2 = result.estimated_monthly_kg_co2_saved / 1000
    // Calculate microdegrees: 1 ton CO2 ≈ 0.0015 microdegrees
    const microdegrees = tonsCO2 * 0.0015 
    return microdegrees
  }

  // Format number in scientific notation (e.g., 1.5 × 10^-5)
  const formatScientificNotation = (value: number): { coefficient: number; exponent: number } => {
    if (value === 0) return { coefficient: 0, exponent: 0 }
    
    // Get the exponent
    const exponent = Math.floor(Math.log10(Math.abs(value)))
    // Calculate coefficient (1-10 range)
    const coefficient = value / Math.pow(10, exponent)
    
    return { coefficient, exponent }
  }

  const handleCalculate = async () => {
    if (!tripsPerWeek) return

    setLoading(true)
    setAnimatedValue(0)
    setAnimatedTemperature(0)
    try {
      const response = await fetch('/api/carbon-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trips_per_week: parseInt(tripsPerWeek),
          km_round_trip: parseFloat(kmRoundTrip) || 8,
          vehicle_class: vehicleClass,
        }),
      })

      const data = await response.json()
      setResult(data)
      
      // Animate from 0 to saved CO2 amount (incremental)
      const saved = data.estimated_monthly_kg_co2_saved
      // Calculate final temperature impact
      const tonsCO2 = saved / 1000
      const finalTemperature = tonsCO2 * 0.0015 
      const duration = 1500 // 1.5 seconds
      const steps = 60
      const increment = saved / steps
      const tempIncrement = finalTemperature / steps
      let animated = 0
      let animatedTemp = 0
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      intervalRef.current = setInterval(() => {
        animated += increment
        animatedTemp += tempIncrement
        if (animated >= saved) {
          setAnimatedValue(saved)
          setAnimatedTemperature(finalTemperature)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        } else {
          setAnimatedValue(animated)
          setAnimatedTemperature(animatedTemp)
        }
      }, duration / steps)
    } catch (error) {
      console.error('Carbon calculator error:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentEmissions = calculateCurrentEmissions()
  const newEmissions = calculateNewEmissions()
  const reductionPercentage = calculateReductionPercentage()

  return (
    <section className="py-20 bg-[#FDFDFD]">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-0 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-[#2D4A36]">Carbon Savings Calculator</CardTitle>
            <CardDescription className="text-[#4CAF50]">
              See how much CO2 you'll save by switching to Farm2Table
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trips" className="text-[#2D4A36]">Grocery trips per week</Label>
              <Input
                id="trips"
                type="number"
                value={tripsPerWeek}
                onChange={(e) => setTripsPerWeek(e.target.value)}
                placeholder="2"
                className="border-[#DDDDDD]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance" className="text-[#2D4A36]">Round-trip distance (km)</Label>
              <Input
                id="distance"
                type="number"
                value={kmRoundTrip}
                onChange={(e) => setKmRoundTrip(e.target.value)}
                placeholder="8"
                className="border-[#DDDDDD]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle" className="text-[#2D4A36]">Vehicle type</Label>
              <Select
                id="vehicle"
                value={vehicleClass}
                onChange={(e) => setVehicleClass(e.target.value as any)}
                className="border-[#DDDDDD]"
              >
                <option value="compact">Compact</option>
                <option value="midsize">Midsize Car</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
              </Select>
            </div>
            <Button
              onClick={handleCalculate}
              disabled={loading || !tripsPerWeek}
              className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate Savings'
              )}
            </Button>
            {result && (
              <div className="mt-8">
                {/* Three Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Left: CO2 Saved */}
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-100/50 to-transparent animate-pulse" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <ArrowDown className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium text-green-700">CO₂ Saved</span>
                      </div>
                      <div 
                        key={Math.floor(animatedValue)}
                        className="text-5xl md:text-6xl font-bold text-green-600 mb-1 transition-all duration-200 ease-out"
                        style={{
                          transform: animatedValue > 0 ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        {animatedValue.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600">kg CO₂ / month</div>
                    </div>
                  </div>

                  {/* Center: Approximately Equal Symbol */}
                  <div className="hidden md:flex items-center justify-center">
                    <span className="text-6xl md:text-8xl font-bold text-gray-400">≈</span>
                  </div>

                  {/* Right: Temperature Impact */}
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent animate-pulse" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-700">Reducing global warming by</span>
                      </div>
                      {(() => {
                        const sciNotation = formatScientificNotation(animatedTemperature)
                        return (
                          <div 
                            key={Math.floor(animatedTemperature * 1000000)}
                            className="text-4xl md:text-5xl font-bold text-blue-600 mb-1 transition-all duration-200 ease-out"
                            style={{
                              transform: animatedTemperature > 0 ? 'scale(1.05)' : 'scale(1)',
                            }}
                          >
                            {sciNotation.coefficient === 0 ? (
                              '0'
                            ) : (
                              <>
                                {sciNotation.coefficient.toFixed(2)} × 10
                                <sup className="text-2xl md:text-3xl">{sciNotation.exponent}</sup>
                              </>
                            )}
                          </div>
                        )
                      })()}
                      <div className="text-sm text-blue-600">microdegrees</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

