'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useCity } from '@/contexts/city-context'
import { getFarms, getCityById } from '@/lib/data-store'
import Link from 'next/link'
import { ArrowRight, MapPin, Check } from 'lucide-react'

export function PartnerFarms() {
  const { selectedCity } = useCity()
  const farms = getFarms(selectedCity?.id)

  return (
    <section className="py-20 bg-[#FDFDFD]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#2D4A36] mb-4">Our Partner Farms</h2>
          <p className="text-lg text-[#4CAF50]">
            Meet the dedicated farmers growing your food with care and expertise.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
          {farms.slice(0, 2).map(farm => {
            const city = getCityById(farm.cityId)
            return (
              <Link key={farm.id} href={`/farms/${farm.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                  <div className="relative h-64 w-full">
                    <img
                      src={farm.bannerImage}
                      alt={farm.name}
                      className="w-full h-full object-cover"
                    />
                    {farm.available && (
                      <div className="absolute top-4 right-4 bg-[#4CAF50] text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
                        <Check className="h-4 w-4" />
                        Available
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#2D4A36] mb-2">{farm.name}</h3>
                    {city && (
                      <div className="flex items-center gap-1 text-[#888888] text-sm mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{city.name}</span>
                      </div>
                    )}
                    <p className="text-[#888888] text-sm mb-4 line-clamp-2">
                      {farm.bio}
                    </p>
                    <div className="flex items-center text-[#4CAF50] font-medium text-sm">
                      View Farm Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        <div className="text-center">
          <Link href="/farms">
            <button className="px-6 py-2 rounded-lg font-medium transition-colors border border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9]">
              View All Farms
              <ArrowRight className="ml-2 h-4 w-4 inline" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

