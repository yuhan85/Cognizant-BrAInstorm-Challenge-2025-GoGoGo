'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCity } from '@/contexts/city-context'
import { getFarms } from '@/lib/data-store'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function FarmsList() {
  const { selectedCity } = useCity()
  const farms = getFarms(selectedCity?.id)

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {farms.map(farm => (
        <Link key={farm.id} href={`/farms/${farm.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="relative h-48 w-full">
              <img
                src={farm.bannerImage}
                alt={farm.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{farm.name}</CardTitle>
                {farm.available ? (
                  <Badge variant="default">Available</Badge>
                ) : (
                  <Badge variant="secondary">Unavailable</Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {farm.bio}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-primary font-medium">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

