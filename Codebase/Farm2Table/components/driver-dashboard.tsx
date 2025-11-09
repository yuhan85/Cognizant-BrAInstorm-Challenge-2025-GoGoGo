'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Package, Navigation, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-lg bg-gray-100 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
})

interface DeliveryOrder {
  id: string
  userId: string
  status: 'created' | 'preparing' | 'out_for_delivery' | 'delivered'
  createdAt: string
  deliveryDate?: string
  deliveryWindow?: string
  total: number
  deliveryAddress?: {
    street: string
    city: string
    state: string
    zip: string
    lat?: number
    lng?: number
  }
}

interface RoutePoint {
  orderId: string
  lat: number
  lng: number
  address: string
  order: DeliveryOrder
}

export function DriverDashboard() {
  const { data: session } = useSession()
  const [optimizedRoute, setOptimizedRoute] = useState<RoutePoint[]>([])
  const [routeLoading, setRouteLoading] = useState(false)

  // Fetch pending orders (not delivered)
  const { data: orders, isLoading } = useQuery({
    queryKey: ['driver-orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders')
      if (!response.ok) return []
      const data = await response.json()
      return (data.orders || []).filter(
        (order: DeliveryOrder) => order.status !== 'delivered' && order.deliveryAddress?.lat && order.deliveryAddress?.lng
      ) as DeliveryOrder[]
    },
  })

  // Driver's starting location (warehouse/farm location in Halifax)
  const driverLocation = { lat: 44.6488, lng: -63.5752 }

  // Optimize delivery route using specified order sequence
  const optimizeRoute = () => {
    if (!orders || orders.length === 0) return

    setRouteLoading(true)
    
    // Simulate route optimization calculation
    setTimeout(() => {
      // Define the optimized order sequence: order-3, order-8, order-2, order-6, order-7, order-4, order-5
      const optimizedOrderIds = ['order-3', 'order-8', 'order-2', 'order-6', 'order-7', 'order-4', 'order-5']
      
      // Create a map of orders by ID for quick lookup
      const ordersMap = new Map<string, DeliveryOrder>()
      orders.forEach((order: DeliveryOrder) => {
        ordersMap.set(order.id, order)
      })
      
      // Build route points in the specified order
      const routePoints: RoutePoint[] = optimizedOrderIds
        .map((orderId) => {
          const order = ordersMap.get(orderId)
          if (!order || !order.deliveryAddress?.lat || !order.deliveryAddress?.lng) {
            return null
          }
          return {
            orderId: order.id,
            lat: order.deliveryAddress.lat,
            lng: order.deliveryAddress.lng,
            address: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}`,
            order,
          }
        })
        .filter((point): point is RoutePoint => point !== null)

      setOptimizedRoute(routePoints)
      setRouteLoading(false)
    }, 500)
  }

  // Don't auto-optimize route, only optimize when button is clicked

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-blue-500'
      case 'preparing':
        return 'bg-yellow-500'
      case 'out_for_delivery':
        return 'bg-orange-500'
      case 'delivered':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'created':
        return 'Created'
      case 'preparing':
        return 'Preparing'
      case 'out_for_delivery':
        return 'Out for Delivery'
      case 'delivered':
        return 'Delivered'
      default:
        return status
    }
  }

  // Calculate route path for polyline
  const routePath = optimizedRoute.length > 0
    ? [
        [driverLocation.lat, driverLocation.lng],
        ...optimizedRoute.map((point) => [point.lat, point.lng]),
      ]
    : []

  // Calculate center of map - use all orders if route not optimized
  const allOrderPoints = optimizedRoute.length > 0 
    ? optimizedRoute 
    : (orders || []).filter((o: DeliveryOrder) => o.deliveryAddress?.lat && o.deliveryAddress?.lng)
        .map((o: DeliveryOrder) => ({
          lat: o.deliveryAddress!.lat!,
          lng: o.deliveryAddress!.lng!,
        }))
  
  const mapCenter =
    allOrderPoints.length > 0
      ? [
          (driverLocation.lat + allOrderPoints.reduce((sum, p) => sum + p.lat, 0)) /
            (allOrderPoints.length + 1),
          (driverLocation.lng + allOrderPoints.reduce((sum, p) => sum + p.lng, 0)) /
            (allOrderPoints.length + 1),
        ]
      : [driverLocation.lat, driverLocation.lng]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session?.user?.name || 'Driver'}!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pending Deliveries
              </CardTitle>
              <CardDescription>
                {orders?.length || 0} order{orders?.length !== 1 ? 's' : ''} to deliver
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order: DeliveryOrder) => (
                    <Card key={order.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">Order #{order.id.slice(-6)}</h4>
                            <p className="text-sm text-gray-600">
                              {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {order.deliveryDate && (
                            <p>📅 {format(new Date(order.deliveryDate), 'MMM d, yyyy')}</p>
                          )}
                          {order.deliveryWindow && <p>⏰ {order.deliveryWindow}</p>}
                          <p>💰 ${order.total.toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No pending deliveries</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Route Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={optimizeRoute}
                disabled={routeLoading || !orders || orders.length === 0}
                className="w-full"
              >
                {routeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    Optimize Route
                  </>
                )}
              </Button>
              {optimizedRoute.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold">Optimized Route:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    {optimizedRoute.map((point, index) => (
                      <li key={point.orderId}>
                        Stop {index + 1}: Order #{point.orderId.slice(-6)}
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-gray-500 mt-2">
                    Estimated distance: {optimizedRoute.length * 2.5} km
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Map</CardTitle>
              <CardDescription>View all delivery locations and optimized route</CardDescription>
            </CardHeader>
            <CardContent>
              <MapComponent
                driverLocation={driverLocation}
                orders={orders || []}
                optimizedRoute={optimizedRoute}
                mapCenter={mapCenter as [number, number]}
                routePath={routePath as Array<[number, number]>}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

