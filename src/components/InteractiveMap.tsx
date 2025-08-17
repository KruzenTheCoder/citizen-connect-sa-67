// src/components/InteractiveMap.tsx
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

interface InteractiveMapProps {
  incidents: any[]
  userLocation?: { latitude: number; longitude: number } | null
  onIncidentClick?: (incident: any) => void
}

const SA_BOUNDS: [number, number, number, number] = [16.3, -35.0, 33.0, -22.0]

const getIncidentColor = (type: string) => {
  switch (type) {
    case 'water':
      return '#3b82f6' // Blue
    case 'electricity':
      return '#f59e0b' // Amber
    case 'roadworks':
      return '#ef4444' // Red
    default:
      return '#6b7280' // Gray
  }
}

export const InteractiveMap = ({ incidents, userLocation, onIncidentClick }: InteractiveMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  const [mapboxToken, setMapboxToken] = useState('')
  const [showTokenPrompt, setShowTokenPrompt] = useState(true)

  // Fetch token from Supabase edge function
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch('/functions/v1/get-mapbox-token')
        if (response.ok) {
          const data = await response.json()
          if (data.token?.startsWith('pk.')) {
            setMapboxToken(data.token)
            setShowTokenPrompt(false)
            return
          }
        }
      } catch (error) {
        console.log('Could not fetch token from edge function, checking localStorage')
      }
      
      // Fallback to localStorage
      const savedToken = localStorage.getItem('MAPBOX_TOKEN') || ''
      if (savedToken?.startsWith('pk.')) {
        setMapboxToken(savedToken)
        setShowTokenPrompt(false)
      }
    }
    
    fetchMapboxToken()
  }, [])

  const createMap = () => {
    if (mapRef.current || !mapContainerRef.current || !mapboxToken) return
    mapboxgl.accessToken = mapboxToken

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [24.7, -28.5], // Center of South Africa
      zoom: 5,
      maxBounds: SA_BOUNDS,
      maxZoom: 15,
      minZoom: 4,
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.on('load', () => setMapLoaded(true))
    mapRef.current = map
  }

  // Create map when token + container are ready
  useEffect(() => {
    createMap()
  }, [mapboxToken, showTokenPrompt])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers when data changes
  const refreshMarkers = () => {
    if (!mapRef.current) return

    // Remove old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // User location marker
    if (userLocation) {
      const userMarker = new mapboxgl.Marker({ color: '#ff6b35' })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(new mapboxgl.Popup().setHTML('<div class="text-sm font-medium">Your Location</div>'))
        .addTo(mapRef.current)
      markersRef.current.push(userMarker)
    }

    // Incident markers (demo coordinates within SA)
    incidents.forEach((incident) => {
      const lng = 18 + Math.random() * 14
      const lat = -35 + Math.random() * 13
      const marker = new mapboxgl.Marker({ color: getIncidentColor(incident.type) })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${incident.location}</h3>
              <p class="text-xs text-gray-600 mt-1">${incident.description}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Severity ${incident.severity}</span>
                <span class="text-xs text-gray-500">${incident.affectedCount} affected</span>
              </div>
            </div>
          `),
        )
        .addTo(mapRef.current!)
      marker.getElement().addEventListener('click', () => onIncidentClick?.(incident))
      markersRef.current.push(marker)
    })
  }

  useEffect(() => {
    if (!mapLoaded) return
    refreshMarkers()
  }, [mapLoaded, incidents, userLocation])

  return (
    <div className="relative flex-1 min-h-[400px]">
      {/* Map container is always mounted so initialization never bails */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Token overlay */}
      {showTokenPrompt && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-background/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold">Interactive Map Setup</h3>
              <p className="text-sm text-muted-foreground">
                Enter your Mapbox public token to view the interactive map
              </p>
            </div>

            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Enter Mapbox public token (pk.)"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={() => {
                  if (!mapboxToken.startsWith('pk.')) return
                  localStorage.setItem('MAPBOX_TOKEN', mapboxToken)
                  setShowTokenPrompt(false) // map container already exists; useEffect will init
                }}
                disabled={!mapboxToken || !mapboxToken.startsWith('pk.')}
                className="w-full"
              >
                Load Map
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>
                Get your token at{' '}
                <a
                  href="https://mapbox.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
              <p>Account → Access Tokens</p>
            </div>
          </Card>
        </div>
      )}

      {/* Legend overlay */}
      <div className="absolute top-4 right-4">
        <Card className="p-2 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Water</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Electricity</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Roadworks</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}