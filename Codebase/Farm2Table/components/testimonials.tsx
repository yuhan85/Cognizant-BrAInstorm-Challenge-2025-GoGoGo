import { Card, CardContent } from '@/components/ui/card'
import { getTestimonials } from '@/lib/data-store'

export function Testimonials() {
  const testimonials = getTestimonials()

  return (
    <section className="py-20 bg-[#FDFDFD]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-[#2D4A36] mb-12 text-center">What Our Community Says</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map(testimonial => (
            <Card key={testimonial.id} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <p className="italic text-[#2D4A36] mb-4 text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-[#2D4A36] text-sm">{testimonial.author}</h4>
                    <p className="text-[#888888] text-xs">{testimonial.role}{testimonial.farm ? ` • ${testimonial.farm}` : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

