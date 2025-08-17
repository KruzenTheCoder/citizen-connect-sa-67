import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, Clock, CheckCircle, AlertCircle, Droplets, Zap, Construction } from "lucide-react";

export const Dashboard = () => {
  // Mock data
  const stats = {
    openIncidents: 15,
    openAlerts: 3,
    affectedCitizens: 142,
    avgResolutionTime: "6.2 hours"
  };

  const incidentsByType = [
    { type: "water", count: 8, color: "bg-status-water" },
    { type: "electricity", count: 5, color: "bg-status-electricity" },
    { type: "roadworks", count: 2, color: "bg-status-roadworks" },
  ];

  const recentIncidents = [
    {
      id: 1,
      type: "water",
      location: "Johannesburg CBD",
      severity: 4,
      reports: 12,
      eta: "2 hours",
      status: "in-progress"
    },
    {
      id: 2,
      type: "electricity",
      location: "Cape Town, Bellville",
      severity: 3,
      reports: 8,
      eta: "4 hours",
      status: "assigned"
    },
    {
      id: 3,
      type: "roadworks",
      location: "Durban, Pinetown",
      severity: 2,
      reports: 3,
      eta: null,
      status: "open"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "water": return Droplets;
      case "electricity": return Zap;
      case "roadworks": return Construction;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress": return "bg-civic-amber";
      case "assigned": return "bg-primary";
      case "open": return "bg-muted-foreground";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Municipal Dashboard</h2>
        <p className="text-muted-foreground">Overview of incidents and service delivery</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.openIncidents}</div>
            <p className="text-xs text-muted-foreground">Active reports requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.openAlerts}</div>
            <p className="text-xs text-muted-foreground">Published municipal alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affected Citizens</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.affectedCitizens}</div>
            <p className="text-xs text-muted-foreground">Citizens impacted by incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground">Mean time to resolution</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Type</CardTitle>
            <CardDescription>Current distribution of incident types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {incidentsByType.map((item) => {
              const Icon = getTypeIcon(item.type);
              const total = incidentsByType.reduce((sum, i) => sum + i.count, 0);
              const percentage = (item.count / total) * 100;
              
              return (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium capitalize">{item.type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Latest reported incidents requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.map((incident) => {
                const TypeIcon = getTypeIcon(incident.type);
                return (
                  <div key={incident.id} className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
                    <div className="p-2 bg-background rounded-lg">
                      <TypeIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {incident.location}
                        </h4>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(incident.status)}`}></div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Severity {incident.severity}</span>
                        <span>•</span>
                        <span>{incident.reports} reports</span>
                        {incident.eta && (
                          <>
                            <span>•</span>
                            <span>ETA: {incident.eta}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common municipal administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
              <AlertCircle className="w-6 h-6 text-civic-amber" />
              <span>Publish Alert</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
              <CheckCircle className="w-6 h-6 text-civic-emerald" />
              <span>Bulk Resolve</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center space-y-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};