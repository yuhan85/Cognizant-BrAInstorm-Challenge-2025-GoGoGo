'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import Link from 'next/link'

export function PricingCards() {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Basic Plan */}
      <Card className="border-[#4CAF50] border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-[#2D4A36]">Basic</CardTitle>
          <div className="mt-2">
            <span className="text-5xl font-bold text-[#2D4A36]">$19.99</span>
            <span className="text-lg text-[#4CAF50]">/week</span>
          </div>
          <CardDescription className="text-base text-gray-700 mt-2">
            Curated seasonal box
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">Weekly fixed bundle of seasonal produce</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">8-12 items curated for variety and nutrition</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">Remove items you don't want</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">Delivery on fixed weekly day</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full border-[#4CAF50] text-gray-700 hover:bg-gray-50">
              Get Started
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Premium Plan */}
      <Card className="border-[#4CAF50] border-2 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-[#4CAF50] text-white px-4 py-1 rounded-full">
            Most Popular
          </Badge>
        </div>
        <CardHeader className="pt-6">
          <CardTitle className="text-3xl font-bold text-[#2D4A36]">Premium</CardTitle>
          <div className="mt-2">
            <span className="text-5xl font-bold text-[#2D4A36]">$49.99</span>
            <span className="text-lg text-[#4CAF50]">/week</span>
          </div>
          <CardDescription className="text-base text-gray-700 mt-2">
            Build your own box
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">Choose your own items</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">Select from all farms in your city</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">Customize quantities</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">Choose delivery date & time window</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">Skip weeks anytime</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">First access to limited items</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">Priority support</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-[#4CAF50]" />
              <span className="text-gray-700">Additional discounts on future purchases</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white">
              Get Started
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

