import Image from 'next/image'

export function OurStory() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 mb-4">
              Farm2Table was born from a simple idea: connect local farms directly with customers 
              who value fresh, sustainable produce. We believe in supporting local agriculture 
              and reducing the environmental impact of food distribution.
            </p>
            <p className="text-lg text-gray-600 mb-4">
              Our mission goes beyond just delivering food. We're committed to giving back to 
              our communities by donating 30% of our net income or equivalent food to local 
              food banks and community partners.
            </p>
            <p className="text-lg text-gray-600">
              Every order you place helps support local farmers and feeds families in need. 
              Together, we're building a more sustainable and equitable food system.
            </p>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop"
              alt="Farm fields"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

