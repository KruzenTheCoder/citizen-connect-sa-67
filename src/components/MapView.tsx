// src/components/MapView.tsx
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Filter, Layers, MapPin, Users, Clock, Zap, Droplets, Construction, Navigation } from 'lucide-react'
import { InteractiveMap } from './InteractiveMap'
import { useGeolocation } from '@/hooks/useGeolocation'

export const MapView = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'water' | 'electricity' | 'roadworks'>('all')
  const [viewMode, setViewMode] = useState<'incidents' | 'reports' | 'alerts'>('incidents')
  const [selectedIncident, setSelectedIncident] = useState<any>(null)

  const { latitude, longitude, municipality } = useGeolocation()

  const filters = [
    { id: 'all', label: 'All Issues', icon: Filter },
    { id: 'water', label: 'Water', icon: Droplets, color: 'status-water' },
    { id: 'electricity', label: 'Electricity', icon: Zap, color: 'status-electricity' },
    { id: 'roadworks', label: 'Roadworks', icon: Construction, color: 'status-roadworks' },
  ] as const

  const viewModes = [
    { id: 'incidents', label: 'Incidents' },
    { id: 'reports', label: 'Reports' },
    { id: 'alerts', label: 'Alerts' },
  ] as const

  // Mock incidents
  const allIncidents = [
    {
      id: 1,
      type: 'water',
      severity: 4,
      location: 'Johannesburg CBD',
      municipality: 'City of Johannesburg',
      province: 'Gauteng',
      affectedCount: 23,
      eta: '2 hours',
      description: 'Main water pipe burst affecting multiple blocks',
    },
    {
      id: 2,
      type: 'electricity',
      severity: 3,
      location: 'Cape Town, Bellville',
      municipality: 'City of Cape Town',
      province: 'Western Cape',
      affectedCount: 15,
      eta: '4 hours',
      description: 'Power outage due to equipment failure',
    },
    {
      id: 3,
      type: 'roadworks',
      severity: 2,
      location: 'Durban, Pinetown',
      municipality: 'eThekwini',
      province: 'KwaZulu-Natal',
      affectedCount: 8,
      eta: null,
      description: 'Pothole repairs needed on main road',
    },
    {
      id: 4,
      type: 'water',
      severity: 5,
      location: 'Cape Town, Khayelitsha',
      municipality: 'City of Cape Town',
      province: 'Western Cape',
      affectedCount: 45,
      eta: '6 hours',
      description: 'Major water supply interruption due to pipe maintenance',
    },
    {
      id: 5,
      type: 'electricity',
      severity: 3,
      location: 'Johannesburg, Sandton',
      municipality: 'City of Johannesburg',
      province: 'Gauteng',
      affectedCount: 12,
      eta: '3 hours',
      description: 'Scheduled maintenance causing power outages',
    },
    {
      id: 6,
      type: 'roadworks',
      severity: 4,
      location: 'Pretoria, Centurion',
      municipality: 'City of Tshwane',
      province: 'Gauteng',
      affectedCount: 18,
      eta: '12 hours',
      description: 'Major road construction affecting traffic flow',
    },
  ]

  // First: location-based filtering
  const nearbyIncidents = useMemo(() => {
    if (!municipality) return allIncidents
    return allIncidents.filter(
      (incident) =>
        incident.municipality === municipality.name || incident.province === municipality.province,
    )
  }, [municipality])

  // Then: type filter
  const incidents = useMemo(() => {
    if (selectedFilter === 'all') return nearbyIncidents
    return nearbyIncidents.filter((i) => i.type === selectedFilter)
  }, [nearbyIncidents, selectedFilter])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'water':
        return Droplets
      case 'electricity':
        return Zap
      case 'roadworks':
        return Construction
      default:
        return MapPin
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'water':
        return 'text-status-water'
      case 'electricity':
        return 'text-status-electricity'
      case 'roadworks':
        return 'text-status-roadworks'
      default:
        return 'text-primary'
    }
  }

  return (
    <div className="flex-1 flex">
      {/* Map */}
      <InteractiveMap
        incidents={incidents}
        userLocation={latitude && longitude ? { latitude, longitude } : null}
        onIncidentClick={setSelectedIncident}
      />

      {/* Map Controls Overlay */}
      <div className="absolute top-20 left-4 space-y-2 z-10">
        {/* Location Status */}
        {municipality && (
          <Card className="p-3 bg-background/90 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-primary" />
              <div className="text-sm">
                <div className="font-medium">{municipality.name}</div>
                <div className="text-xs text-muted-foreground">{municipality.province}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Filter Controls */}
        <Card className="p-2 bg-background/90 backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            {filters.map((filter) => {
              const Icon = filter.icon
              const active = selectedFilter === filter.id
              return (
                <Button
                  key={filter.id}
                  variant={active ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.id)}
                  className="flex items-center space-x-1"
                >
                  <Icon className={`w-4 h-4 ${ (filter as any).color ? `text-${(filter as any).color}` : ''}`} />

                  <span className="hidden sm:inline">{filter.label}</span>
                </Button>
              )
            })}
          </div>
        </Card>

        {/* View Mode Controls (placeholder) */}
        <Card className="p-2 bg-background/90 backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            <Layers className="w-4 h-4 text-muted-foreground mr-2" />
            {viewModes.map((mode) => (
              <Button
                key={mode.id}
                variant={viewMode === mode.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode.id)}
              >
                {mode.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Incidents Sidebar */}
      <div className="w-80 bg-card border-l border-border overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Local Incidents</h3>
              {municipality && <p className="text-xs text-muted-foreground">{municipality.name}</p>}
            </div>
            <Badge variant="secondary">{incidents.length}</Badge>
          </div>

          <div className="space-y-3">
            {incidents.map((incident) => {
              const TypeIcon = getTypeIcon(incident.type)
              const active = selectedIncident?.id === incident.id
              return (
                <Card
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`p-3 hover:bg-accent transition-colors cursor-pointer ${
                    active ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-secondary ${getTypeColor(incident.type)}`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Severity {incident.severity}
                        </Badge>
                        {incident.eta && (
                          <Badge variant="secondary" className="text-xs flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{incident.eta}</span>
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-sm text-foreground truncate">{incident.location}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {incident.description}
                      </p>
                      <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{incident.affectedCount} affected</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}