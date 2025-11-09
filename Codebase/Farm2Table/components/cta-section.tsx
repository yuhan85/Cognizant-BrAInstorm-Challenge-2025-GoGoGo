import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="bg-[#F8FAF5] py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-[#2D4A36] mb-4">Ready to Make a Difference?</h2>
        <p className="text-lg text-[#2D4A36] mb-8 max-w-2xl mx-auto">
          Join thousands of families enjoying fresh, local produce while supporting sustainable farming
        </p>
        <Link href="/pricing">
          <Button size="lg" className="bg-[#34A853] hover:bg-[#2d8f47] text-white text-lg px-8">
            Choose Your Plan
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}

