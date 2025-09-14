// src/components/MapView.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  MapPin,
  Clock,
  Zap,
  Droplets,
  Construction,
  Navigation,
} from "lucide-react";
import { InteractiveMap } from "./InteractiveMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";

// ✅ Type definitions for better safety & clarity
interface Incident {
  id: string;
  type: string;
  severity: number;
  location: string;
  municipality?: string;
  province?: string;
  eta: string | null;
  description?: string;
  coordinates: [number, number] | null;
}

type FilterOption = {
  id: "all" | "water" | "electricity" | "roads";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
};

export const MapView: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "water" | "electricity" | "roads"
  >("all");
  const [viewMode, setViewMode] = useState<"incidents" | "reports" | "alerts">(
    "incidents"
  );
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );

  const { latitude, longitude, municipality } = useGeolocation();

  const filters: readonly FilterOption[] = [
    { id: "all", label: "All Issues", icon: Filter },
    { id: "water", label: "Water", icon: Droplets, color: "status-water" },
    {
      id: "electricity",
      label: "Electricity",
      icon: Zap,
      color: "status-electricity",
    },
    { id: "roads", label: "Roads", icon: Construction, color: "status-roadworks" },
  ] as const;

  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select(
          "id, incident_type, priority, status, title, description, location_lat, location_lng, location_address, estimated_resolution_time, municipalities(name, province)"
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        const priorityToSeverity: Record<string, number> = {
          low: 1,
          medium: 3,
          high: 4,
          critical: 5,
        };

        const transformed: Incident[] = data.map((i: any) => ({
          id: i.id,
          type: i.incident_type,
          severity: priorityToSeverity[i.priority] ?? 1,
          location: i.location_address || i.title || "Unknown location",
          municipality: i.municipalities?.name,
          province: i.municipalities?.province,
          eta: i.estimated_resolution_time
            ? new Date(i.estimated_resolution_time).toLocaleString()
            : null,
          description: i.description,
          coordinates:
            i.location_lng && i.location_lat
              ? [i.location_lng, i.location_lat]
              : null,
        }));

        setAllIncidents(transformed);
      }
    };

    fetchIncidents();

    // ✅ Live updates with Supabase Realtime
    const channel = supabase
      .channel("public:incidents")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        fetchIncidents
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter by location (municipality or province)
  const nearbyIncidents = useMemo(() => {
    if (!municipality) return allIncidents;
    return allIncidents.filter(
      (incident) =>
        incident.municipality === municipality.name ||
        incident.province === municipality.province
    );
  }, [municipality, allIncidents]);

  // Filter by selected issue type
  const incidents = useMemo(() => {
    if (selectedFilter === "all") return nearbyIncidents;
    return nearbyIncidents.filter((i) => i.type === selectedFilter);
  }, [nearbyIncidents, selectedFilter]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "water":
        return Droplets;
      case "electricity":
        return Zap;
      case "roads":
        return Construction;
      default:
        return MapPin;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "water":
        return "text-status-water";
      case "electricity":
        return "text-status-electricity";
      case "roads":
        return "text-status-roadworks";
      default:
        return "text-primary";
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-7rem)] md:min-h-[calc(100vh-3rem)] flex flex-col md:flex-row">
      <div className="w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-1rem)] flex flex-col md:flex-row">
        {/* Map */}
        <div className="flex-1 relative min-h-[60vh] md:min-h-0">
          <InteractiveMap
            incidents={incidents}
            userLocation={
              latitude && longitude ? { latitude, longitude } : null
            }
            onIncidentClick={setSelectedIncident}
          />

          {/* Mobile-friendly Map Controls Overlay */}
          <div className="absolute top-4 left-4 space-y-2 z-10">
            {/* Location Status */}
            {municipality && (
              <Card className="p-3 bg-background/90 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">{municipality.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {municipality.province}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Filter Controls */}
            <Card className="p-2 bg-background/90 backdrop-blur-sm">
              <div className="flex items-center space-x-1">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  const active = selectedFilter === filter.id;
                  return (
                    <Button
                      key={filter.id}
                      variant={active ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter.id)}
                      className="flex items-center space-x-1 min-w-[44px] min-h-[44px]"
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          filter.color ? `text-${filter.color}` : ""
                        }`}
                      />
                      <span className="hidden sm:inline text-xs">
                        {filter.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Incidents Sidebar */}
        <div className="md:w-80 bg-card border-t md:border-t-0 md:border-l border-border overflow-y-auto max-h-[40vh] md:max-h-none">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Local Incidents</h3>
                {municipality && (
                  <p className="text-xs text-muted-foreground">
                    {municipality.name}
                  </p>
                )}
              </div>
              <Badge variant="secondary">{incidents.length}</Badge>
            </div>

            <div className="space-y-3">
              {incidents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No incidents in your area</p>
                </div>
              ) : (
                incidents.map((incident) => {
                  const TypeIcon = getTypeIcon(incident.type);
                  const active = selectedIncident?.id === incident.id;
                  return (
                    <Card
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      className={`p-3 hover:bg-accent transition-colors cursor-pointer min-h-[60px] ${
                        active ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg bg-secondary ${getTypeColor(
                            incident.type
                          )} flex-shrink-0`}
                        >
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              Severity {incident.severity}
                            </Badge>
                            {incident.eta && (
                              <Badge
                                variant="secondary"
                                className="text-xs flex items-center space-x-1"
                              >
                                <Clock className="w-3 h-3" />
                                <span>{incident.eta}</span>
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {incident.location}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {incident.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
