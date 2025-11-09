'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getFarmById, getProducts } from '@/lib/data-store'
import { getGrowthTimelineByProductId } from '@/lib/data-store'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'

interface FarmDetailProps {
  farmId: string
}

export function FarmDetail({ farmId }: FarmDetailProps) {
  const farm = getFarmById(farmId)
  const products = getProducts(farmId)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!farm) {
    return <div>Farm not found</div>
  }

  const selectedProductData = selectedProduct ? products.find(p => p.id === selectedProduct) : null
  const timeline = selectedProduct ? getGrowthTimelineByProductId(selectedProduct) : null

  return (
    <div className="space-y-8">
      <div className="relative h-96 rounded-lg overflow-hidden">
        <img
          src={farm.bannerImage}
          alt={farm.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{farm.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{farm.bio}</p>
          {farm.videoUrl && (
            <div className="mb-6">
              <iframe
                src={farm.videoUrl}
                className="w-full h-64 rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Products</h2>
          <div className="space-y-4">
            {products.filter(p => p.available).map(product => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant="outline">{product.quantity} {product.unit} left</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          ${product.price.toFixed(2)} / {product.unit}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product.id)
                            setDialogOpen(true)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{selectedProductData?.name}</DialogTitle>
          </DialogHeader>
          {selectedProductData && (
            <div className="space-y-4">
              <img
                src={selectedProductData.image}
                alt={selectedProductData.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <p className="text-gray-600">{selectedProductData.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-semibold">${selectedProductData.price.toFixed(2)} / {selectedProductData.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="font-semibold">{selectedProductData.quantity} {selectedProductData.unit}</p>
                </div>
              </div>
              {timeline && timeline.entries.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Growth Timeline
                  </h4>
                  <div className="space-y-4">
                    {timeline.entries.map((entry, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                          {idx < timeline.entries.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 ml-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium text-gray-500">
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </p>
                          <p className="text-gray-700">{entry.stage}</p>
                          {entry.image && (
                            <img
                              src={entry.image}
                              alt={entry.stage}
                              className="w-full h-32 object-cover rounded-lg mt-2"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

