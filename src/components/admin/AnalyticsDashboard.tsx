import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Users, Clock, CheckCircle, TrendingUp, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>({
    totalIncidents: 0,
    pendingIncidents: 0,
    resolvedIncidents: 0,
    avgResolutionTime: 0,
    activeUsers: 0,
    incidentsByType: [],
    incidentsTrend: [],
    priorityDistribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch incidents summary
      const { data: incidents } = await supabase
        .from('incidents')
        .select('status, incident_type, priority, created_at, resolved_at');

      // Fetch user count
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'citizen');

      if (incidents) {
        const totalIncidents = incidents.length;
        const pendingIncidents = incidents.filter(i => i.status === 'pending').length;
        const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
        
        // Calculate average resolution time
        const resolvedWithTime = incidents.filter(i => i.resolved_at && i.created_at);
        const avgResolutionTime = resolvedWithTime.length > 0 
          ? resolvedWithTime.reduce((acc, incident) => {
              const created = new Date(incident.created_at);
              const resolved = new Date(incident.resolved_at);
              return acc + (resolved.getTime() - created.getTime());
            }, 0) / (resolvedWithTime.length * 1000 * 60 * 60) // Convert to hours
          : 0;

        // Incidents by type
        const incidentsByType = incidents.reduce((acc: any, incident) => {
          const type = incident.incident_type;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        const incidentTypeData = Object.entries(incidentsByType).map(([type, count]) => ({
          name: type,
          value: count
        }));

        // Priority distribution
        const priorityDistribution = incidents.reduce((acc: any, incident) => {
          const priority = incident.priority;
          acc[priority] = (acc[priority] || 0) + 1;
          return acc;
        }, {});

        const priorityData = Object.entries(priorityDistribution).map(([priority, count]) => ({
          name: priority,
          value: count
        }));

        // Mock trend data (in real app, you'd calculate this from actual dates)
        const incidentsTrend = [
          { date: '2024-01', incidents: 45 },
          { date: '2024-02', incidents: 38 },
          { date: '2024-03', incidents: 52 },
          { date: '2024-04', incidents: 41 },
          { date: '2024-05', incidents: 47 },
          { date: '2024-06', incidents: 39 }
        ];

        setAnalytics({
          totalIncidents,
          pendingIncidents,
          resolvedIncidents,
          avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
          activeUsers: users?.length || 0,
          incidentsByType: incidentTypeData,
          incidentsTrend,
          priorityDistribution: priorityData
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Municipal service performance overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalIncidents}</div>
            <p className="text-xs text-muted-foreground">
              All time reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{analytics.pendingIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.resolvedIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgResolutionTime}h</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.incidentsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.incidentsByType.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidents Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.incidentsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Active Citizens</span>
              </div>
              <Badge variant="secondary">{analytics.activeUsers}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Coverage Areas</span>
              </div>
              <Badge variant="secondary">12 Districts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Resolution Rate</span>
              </div>
              <Badge variant="secondary">
                {analytics.totalIncidents > 0 
                  ? Math.round((analytics.resolvedIncidents / analytics.totalIncidents) * 100)
                  : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}