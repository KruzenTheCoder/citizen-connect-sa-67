import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Phone, 
  Users, 
  MapPin, 
  Clock,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HomepageProps {
  onReportIssue: () => void;
  onNavigate: (tab: string) => void;
}

export const Homepage = ({ onReportIssue, onNavigate }: HomepageProps) => {
  const { profile } = useAuth();

  // Mock data for community feed
  const recentIssues = [
    {
      id: 1,
      type: "Water",
      title: "Water leak on Main Street",
      location: "Cape Town CBD",
      timeAgo: "2 hours ago",
      priority: "high",
      upvotes: 12,
      comments: 3,
      status: "in_progress"
    },
    {
      id: 2,
      type: "Roads",
      title: "Pothole on N1 Highway",
      location: "Bellville",
      timeAgo: "5 hours ago",
      priority: "medium",
      upvotes: 8,
      comments: 1,
      status: "pending"
    },
    {
      id: 3,
      type: "Electricity",
      title: "Street light not working",
      location: "Stellenbosch",
      timeAgo: "1 day ago",
      priority: "low",
      upvotes: 3,
      comments: 0,
      status: "resolved"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-civic-emerald text-white";
      case "in_progress": return "bg-civic-amber text-black";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-civic-red";
      case "medium": return "text-civic-amber";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-4 pt-12 pb-8 safe-area-padding-top">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Citizen Connect SA</h1>
              <p className="text-primary-foreground/80 text-sm">Your voice. Your community. Connected.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span>Welcome back, {profile?.full_name?.split(' ')[0] || 'Citizen'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 relative z-10">
        {/* Main Action Cards */}
        <div className="grid gap-4 mb-8">
          <Card 
            className="bg-gradient-to-br from-civic-red/10 to-civic-red/5 border-civic-red/20 cursor-pointer hover:scale-[1.02] transition-all duration-200 shadow-lg"
            onClick={onReportIssue}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-civic-red/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-civic-red" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Report an Issue</h3>
                  <p className="text-sm text-muted-foreground">Report problems in your area quickly</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-civic-emerald/10 to-civic-emerald/5 border-civic-emerald/20 cursor-pointer hover:scale-[1.02] transition-all duration-200 shadow-lg"
            onClick={() => onNavigate("services")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-civic-emerald/20 rounded-xl flex items-center justify-center">
                  <Phone className="w-7 h-7 text-civic-emerald" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Find Local Services</h3>
                  <p className="text-sm text-muted-foreground">Access municipal services and contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-civic-amber/10 to-civic-amber/5 border-civic-amber/20 cursor-pointer hover:scale-[1.02] transition-all duration-200 shadow-lg"
            onClick={() => onNavigate("community")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-civic-amber/20 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-civic-amber" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Community Updates</h3>
                  <p className="text-sm text-muted-foreground">Stay connected with your neighbors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Community Activity
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">42</div>
                <div className="text-xs text-muted-foreground">Issues Reported</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-civic-emerald">28</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-civic-amber">14</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Issues Feed */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Recently Reported
          </h4>
          
          {recentIssues.map((issue) => (
            <Card key={issue.id} className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className={`w-5 h-5 ${getPriorityColor(issue.priority)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{issue.type}</Badge>
                      <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h5 className="font-medium text-sm mb-1 line-clamp-1">{issue.title}</h5>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {issue.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {issue.timeAgo}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                        <ThumbsUp className="w-3 h-3" />
                        {issue.upvotes}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                        <MessageSquare className="w-3 h-3" />
                        {issue.comments}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Floating Action Button */}
        <Button
          onClick={onReportIssue}
          className="fixed bottom-24 right-6 rounded-full w-14 h-14 bg-civic-red hover:bg-civic-red/90 shadow-lg z-40"
          title="Quick Report"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};