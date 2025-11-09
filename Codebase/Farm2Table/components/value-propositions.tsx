import { Card, CardContent } from '@/components/ui/card'
import { Leaf, Users, TrendingDown } from 'lucide-react'

export function ValuePropositions() {
  return (
    <section className="py-20 bg-[#FDFDFD]">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="text-center border-0 shadow-sm">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-[#4CAF50]" />
              </div>
              <h3 className="text-xl font-bold text-[#2D4A36] mb-3">Sustainable</h3>
              <p className="text-[#555555] text-sm">
                Support regenerative farming practices that heal the land and preserve biodiversity.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#4CAF50]" />
              </div>
              <h3 className="text-xl font-bold text-[#2D4A36] mb-3">Community First</h3>
              <p className="text-[#555555] text-sm">
                30% of our net income feeds families in need through local food banks and meal programs.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-sm">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-8 w-8 text-[#4CAF50]" />
              </div>
              <h3 className="text-xl font-bold text-[#2D4A36] mb-3">Lower Emissions</h3>
              <p className="text-[#555555] text-sm">
                Shared delivery routes save 15-25 kg CO2 per household monthly vs. individual shopping trips.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

