import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  Settings,
  LogOut,
  Bell,
  Shield,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const ProfilePage = () => {
  const { profile, signOut } = useAuth();

  const userStats = {
    issuesReported: 12,
    issuesResolved: 8,
    communityPoints: 156,
    memberSince: "Jan 2024"
  };

  const recentActivity = [
    {
      type: "report",
      title: "Reported water leak on Main Street",
      status: "resolved",
      date: "2 days ago"
    },
    {
      type: "comment",
      title: "Commented on pothole repair",
      status: "active",
      date: "1 week ago"
    },
    {
      type: "upvote",
      title: "Upvoted street light issue",
      status: "pending",
      date: "2 weeks ago"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "report": return <AlertTriangle className="w-4 h-4 text-civic-red" />;
      case "comment": return <MessageSquare className="w-4 h-4 text-primary" />;
      case "upvote": return <TrendingUp className="w-4 h-4 text-civic-emerald" />;
      default: return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "text-civic-emerald";
      case "active": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-4 pt-12 pb-8 safe-area-padding-top">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold mb-1">{profile?.full_name || "Your Profile"}</h1>
          <p className="text-primary-foreground/80">Active Community Member</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 relative z-10">
        {/* User Info Card */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <Badge variant="secondary">
                  {profile?.role === 'municipality_admin' ? 'Municipality Admin' : 
                   profile?.role === 'super_admin' ? 'Super Administrator' : 'Citizen'}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">Member since {userStats.memberSince}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Your Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{userStats.issuesReported}</div>
                <div className="text-xs text-muted-foreground">Issues Reported</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-civic-emerald">{userStats.issuesResolved}</div>
                <div className="text-xs text-muted-foreground">Issues Resolved</div>
              </div>
              <div className="col-span-2">
                <div className="text-3xl font-bold text-civic-amber">{userStats.communityPoints}</div>
                <div className="text-xs text-muted-foreground">Community Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Options */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start h-auto p-3">
              <Bell className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium">Notifications</div>
                <div className="text-xs text-muted-foreground">Manage your alerts</div>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start h-auto p-3">
              <MapPin className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium">Location Settings</div>
                <div className="text-xs text-muted-foreground">Update your area</div>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start h-auto p-3">
              <Shield className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium">Privacy & Security</div>
                <div className="text-xs text-muted-foreground">Manage your data</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};