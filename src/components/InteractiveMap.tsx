// src/components/InteractiveMap.tsx
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

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

  // Auto-load your Mapbox token
  useEffect(() => {
    // Your provided token
    const userToken = 'pk.eyJ1Ijoia3J1emVuMjIiLCJhIjoiY21lZmo2NWxtMHFhaTJrc2ZpbGc4dzZ0NCJ9.4wAZRxTVo6jHK4_JtfV2MA'
    
    if (userToken?.startsWith('pk.')) {
      setMapboxToken(userToken)
      setShowTokenPrompt(false)
      return
    }
    
    // Fallback to localStorage if needed
    const savedToken = localStorage.getItem('MAPBOX_TOKEN') || ''
    if (savedToken?.startsWith('pk.')) {
      setMapboxToken(savedToken)
      setShowTokenPrompt(false)
    }
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

  // Add district boundaries to map
  const addDistrictBoundaries = async () => {
    if (!mapRef.current || !mapLoaded) return

    // Add district boundaries layer if not already added
    if (!mapRef.current.getSource('districts')) {
      try {
        // Fetch real district boundaries from Supabase
        const { data: districts, error } = await supabase
          .from('districts')
          .select(`
            id,
            name,
            code,
            boundary_geojson,
            municipalities(name)
          `)

        if (error) {
          console.error('Error fetching districts:', error)
          return
        }

        const features = districts?.map(district => ({
          type: 'Feature' as const,
          properties: {
            id: district.id,
            name: district.name,
            code: district.code,
            municipality: district.municipalities?.name || 'Unknown Municipality'
          },
          geometry: district.boundary_geojson as any
        })).filter(f => f.geometry) || []

        mapRef.current.addSource('districts', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features
          }
        })

      // Add fill layer for districts
      mapRef.current.addLayer({
        id: 'district-fills',
        type: 'fill',
        source: 'districts',
        paint: {
          'fill-color': '#627BC1',
          'fill-opacity': 0.1
        }
      })

      // Add border layer for districts
      mapRef.current.addLayer({
        id: 'district-borders',
        type: 'line',
        source: 'districts',
        paint: {
          'line-color': '#627BC1',
          'line-width': 2,
          'line-opacity': 0.7
        }
      })

      // Add click handler for districts
      mapRef.current.on('click', 'district-fills', (e) => {
        if (e.features && e.features[0]) {
          const { name, code, municipality } = e.features[0].properties || {}
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3">
                <h3 class="font-semibold text-sm text-gray-900">${name}</h3>
                <p class="text-xs text-gray-600 mt-1">${municipality}</p>
                <p class="text-xs text-gray-500 mt-1">District Code: ${code}</p>
              </div>
            `)
            .addTo(mapRef.current!)
        }
      })
      } catch (error) {
        console.error('Error setting up district boundaries:', error)
      }
    }
  }

  // Change cursor on hover for districts
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current
    
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ''
    }

    // Add hover handlers
    map.on('mouseenter', 'district-fills', handleMouseEnter)
    map.on('mouseleave', 'district-fills', handleMouseLeave)

    return () => {
      map.off('mouseenter', 'district-fills', handleMouseEnter)
      map.off('mouseleave', 'district-fills', handleMouseLeave)
    }
  }, [mapLoaded])

  const setupDistrictHoverEffects = () => {
  }

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
        .setPopup(new mapboxgl.Popup().setHTML('<div class="p-2"><div class="text-sm font-medium text-gray-900">Your Location</div></div>'))
        .addTo(mapRef.current)
      markersRef.current.push(userMarker)
    }

    // Incident markers with realistic coordinates
    incidents.forEach((incident, index) => {
      // Use more realistic coordinates based on incident location
      let lng, lat
      if (incident.location?.includes('Johannesburg') || incident.municipality?.includes('Johannesburg')) {
        lng = 28.0 + (Math.random() - 0.5) * 0.4
        lat = -26.2 + (Math.random() - 0.5) * 0.4
      } else if (incident.location?.includes('Cape Town') || incident.municipality?.includes('Cape Town')) {
        lng = 18.5 + (Math.random() - 0.5) * 0.4
        lat = -33.8 + (Math.random() - 0.5) * 0.4
      } else if (incident.location?.includes('Durban') || incident.municipality?.includes('eThekwini')) {
        lng = 30.9 + (Math.random() - 0.5) * 0.4
        lat = -29.8 + (Math.random() - 0.5) * 0.4
      } else {
        // Default random coordinates within SA
        lng = 18 + Math.random() * 14
        lat = -35 + Math.random() * 13
      }

      const marker = new mapboxgl.Marker({ color: getIncidentColor(incident.type) })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3">
              <h3 class="font-semibold text-sm text-gray-900">${incident.location || 'Unknown Location'}</h3>
              <p class="text-xs text-gray-600 mt-1">${incident.description || 'No description available'}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Severity ${incident.severity || 'N/A'}</span>
                <span class="text-xs text-gray-500">${incident.affectedCount || 0} affected</span>
              </div>
              <div class="text-xs text-gray-500 mt-1">ETA: ${incident.eta || 'Unknown'}</div>
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
    addDistrictBoundaries()
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