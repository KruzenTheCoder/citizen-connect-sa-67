import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, MapPin, User, Eye, Edit, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function IncidentManagement() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [etaUpdate, setEtaUpdate] = useState("");

  useEffect(() => {
    fetchIncidents();

    // Set up real-time subscription for new incidents
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'incidents'
        },
        (payload) => {
          console.log('Real-time incident update:', payload);
          // Refresh incidents when changes occur
          fetchIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          profiles:reporter_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async () => {
    if (!selectedIncident || !statusUpdate) return;

    try {
      const updates: any = { 
        status: statusUpdate,
        updated_at: new Date().toISOString()
      };

      if (statusUpdate === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      if (etaUpdate) {
        updates.estimated_resolution_time = new Date(etaUpdate).toISOString();
      }

      const { error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', selectedIncident.id);

      if (error) throw error;

      // Add update record
      if (updateMessage) {
        await supabase
          .from('incident_updates')
          .insert({
            incident_id: selectedIncident.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            message: updateMessage,
            status: statusUpdate as any,
            eta_update: etaUpdate ? new Date(etaUpdate).toISOString() : null
          });
      }

      toast.success('Incident updated successfully');
      fetchIncidents();
      setSelectedIncident(null);
      setStatusUpdate("");
      setUpdateMessage("");
      setEtaUpdate("");
    } catch (error) {
      console.error('Error updating incident:', error);
      toast.error('Failed to update incident');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Incident Management</h2>
        <p className="text-muted-foreground">Review and manage reported incidents</p>
      </div>

      <div className="space-y-4">
        {incidents.map((incident) => (
          <Card key={incident.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-foreground">{incident.title}</h3>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                    <Badge className={getPriorityColor(incident.priority)}>
                      {incident.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{incident.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{incident.location_address || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{incident.profiles?.full_name || incident.profiles?.email || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(incident.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Incident Details</DialogTitle>
                      </DialogHeader>
                      
                      {selectedIncident && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Title</Label>
                              <p className="text-sm">{selectedIncident.title}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Type</Label>
                              <p className="text-sm capitalize">{selectedIncident.incident_type}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <Badge className={getStatusColor(selectedIncident.status)}>
                                {selectedIncident.status}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Priority</Label>
                              <Badge className={getPriorityColor(selectedIncident.priority)}>
                                {selectedIncident.priority}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Description</Label>
                            <p className="text-sm bg-muted p-3 rounded">{selectedIncident.description}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Location</Label>
                            <p className="text-sm">{selectedIncident.location_address || 'Not specified'}</p>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Update Status</Label>
                            
                            <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select new status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>

                            <div>
                              <Label className="text-sm font-medium">Update Message</Label>
                              <Textarea
                                placeholder="Add update message for the reporter..."
                                value={updateMessage}
                                onChange={(e) => setUpdateMessage(e.target.value)}
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Estimated Resolution Time</Label>
                              <Input
                                type="datetime-local"
                                value={etaUpdate}
                                onChange={(e) => setEtaUpdate(e.target.value)}
                              />
                            </div>

                            <Button 
                              onClick={updateIncidentStatus}
                              disabled={!statusUpdate}
                              className="w-full"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Update Incident
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {incidents.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No incidents found</h3>
              <p className="text-muted-foreground">No incidents have been reported yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}