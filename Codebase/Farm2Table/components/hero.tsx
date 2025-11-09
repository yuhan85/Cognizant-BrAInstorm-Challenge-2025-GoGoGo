import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Heart } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background video with reduced saturation */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: 'saturate(0.6) brightness(1.05)',
        }}
      >
        <source src="/homeimg.mp4" type="video/mp4" />
      </video>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/20" />
      
      {/* Content with semi-transparent background */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="text-[#2D4A36]">Fresh From Farm</span>
                <br />
                <span className="text-[#4CAF50]">To Your Table</span>
              </h1>
              <p className="text-lg text-[#555555] mb-8 max-w-2xl mx-auto">
                Local, organic produce delivered weekly. Supporting farmers, feeding communities, and reducing carbon emissions—one box at a time.
              </p>
              <div className="flex gap-4 justify-center mb-6">
                <Link href="/pricing">
                  <Button size="lg" className="text-lg px-8 bg-[#4CAF50] hover:bg-[#45a049] text-white">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/farms">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-[#DDDDDD] text-[#555555] hover:bg-gray-50">
                    Explore Farms
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-2 text-base md:text-lg text-[#555555]">
                <Heart className="h-5 w-5 text-[#E53935]" fill="#E53935" />
                <span>30% of net income donated to local food banks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

