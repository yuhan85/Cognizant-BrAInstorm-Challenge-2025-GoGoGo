'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'

// Fix for default marker icons in react-leaflet
if (typeof window !== 'undefined') {
  delete (Icon.Default.prototype as any)._getIconUrl
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

interface RoutePoint {
  orderId: string
  lat: number
  lng: number
  address: string
  order: {
    id: string
    status: string
  }
}

interface MapComponentProps {
  driverLocation: { lat: number; lng: number }
  orders: Array<{
    id: string
    status: string
    deliveryAddress?: {
      street: string
      city: string
      state: string
      lat?: number
      lng?: number
    }
  }>
  optimizedRoute: RoutePoint[]
  mapCenter: [number, number]
  routePath: Array<[number, number]>
  getStatusColor: (status: string) => string
  getStatusLabel: (status: string) => string
}

export default function MapComponent({
  driverLocation,
  orders,
  optimizedRoute,
  mapCenter,
  routePath,
  getStatusColor,
  getStatusLabel,
}: MapComponentProps) {
  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Driver starting location */}
        <Marker position={[driverLocation.lat, driverLocation.lng]}>
          <Popup>
            <div>
              <strong>🚚 Starting Point</strong>
              <br />
              Warehouse/Farm Location
            </div>
          </Popup>
        </Marker>

        {/* Delivery locations - show all orders if route not optimized, otherwise show optimized route */}
        {(optimizedRoute.length > 0 ? optimizedRoute : orders || [])
          .map((item: any, index: number) => {
            const point = optimizedRoute.length > 0 
              ? item 
              : {
                  orderId: item.id,
                  lat: item.deliveryAddress?.lat,
                  lng: item.deliveryAddress?.lng,
                  address: item.deliveryAddress 
                    ? `${item.deliveryAddress.street}, ${item.deliveryAddress.city}, ${item.deliveryAddress.state}`
                    : '',
                  order: item
                }
            
            if (!point.lat || !point.lng) return null
            
            return (
              <Marker key={point.orderId} position={[point.lat, point.lng]}>
                <Popup>
                  <div>
                    <strong>📍 {optimizedRoute.length > 0 ? `Stop ${index + 1}` : 'Delivery'}</strong>
                    <br />
                    Order #{point.orderId.slice(-6)}
                    <br />
                    {point.address}
                    <br />
                    <Badge className={getStatusColor(point.order.status)}>
                      {getStatusLabel(point.order.status)}
                    </Badge>
                  </div>
                </Popup>
              </Marker>
            )
          })
          .filter(Boolean)}

        {/* Route polyline */}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath as [number, number][]}
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  )
}

