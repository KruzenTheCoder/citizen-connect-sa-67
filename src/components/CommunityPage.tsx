import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  ThumbsUp, 
  MapPin, 
  Clock, 
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

export const CommunityPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const communityPosts = [
    {
      id: 1,
      type: "issue",
      category: "Water",
      title: "Water pressure low in Woodstock area",
      description: "Multiple residents reporting low water pressure since yesterday morning. Affects several streets.",
      author: "Sarah M.",
      location: "Woodstock, Cape Town",
      timeAgo: "2 hours ago",
      upvotes: 24,
      comments: 8,
      status: "investigating",
      priority: "high"
    },
    {
      id: 2,
      type: "update",
      category: "Roads",
      title: "Main Road pothole repair completed",
      description: "The pothole on Main Road near the shopping center has been fixed. Thank you to everyone who reported it!",
      author: "City of Cape Town",
      location: "Observatory, Cape Town",
      timeAgo: "4 hours ago",
      upvotes: 32,
      comments: 12,
      status: "resolved",
      priority: "medium",
      isOfficial: true
    },
    {
      id: 3,
      type: "announcement",
      category: "General",
      title: "Scheduled maintenance: Electricity",
      description: "Planned electricity maintenance will affect the following areas on Saturday 9AM-2PM: Sea Point, Bantry Bay.",
      author: "City of Cape Town",
      location: "Sea Point, Cape Town",
      timeAgo: "6 hours ago",
      upvotes: 18,
      comments: 5,
      status: "scheduled",
      priority: "low",
      isOfficial: true
    },
    {
      id: 4,
      type: "issue",
      category: "Waste",
      title: "Missed garbage collection on Oak Street",
      description: "Garbage wasn't collected yesterday on Oak Street. Bins are overflowing.",
      author: "Mike T.",
      location: "Rondebosch, Cape Town",
      timeAgo: "8 hours ago",
      upvotes: 15,
      comments: 3,
      status: "pending",
      priority: "medium"
    }
  ];

  const filters = [
    { id: "all", label: "All", count: communityPosts.length },
    { id: "issues", label: "Issues", count: communityPosts.filter(p => p.type === "issue").length },
    { id: "updates", label: "Updates", count: communityPosts.filter(p => p.type === "update").length },
    { id: "announcements", label: "News", count: communityPosts.filter(p => p.type === "announcement").length }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-civic-emerald text-white";
      case "investigating": 
      case "scheduled": return "bg-civic-amber text-black";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="w-4 h-4 text-civic-red" />;
      case "medium": return <AlertTriangle className="w-4 h-4 text-civic-amber" />;
      default: return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "update": return <CheckCircle className="w-4 h-4 text-civic-emerald" />;
      case "announcement": return <TrendingUp className="w-4 h-4 text-primary" />;
      default: return <AlertTriangle className="w-4 h-4 text-civic-red" />;
    }
  };

  const filteredPosts = activeFilter === "all" 
    ? communityPosts 
    : communityPosts.filter(post => {
        if (activeFilter === "issues") return post.type === "issue";
        if (activeFilter === "updates") return post.type === "update";
        if (activeFilter === "announcements") return post.type === "announcement";
        return true;
      });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-civic-amber to-civic-amber/80 text-black px-4 pt-12 pb-8 safe-area-padding-top">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Community</h1>
          <p className="text-black/80">Stay connected with your neighborhood</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 relative z-10">
        {/* Search */}
        <Card className="mb-4 shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search community posts..."
                className="pl-10 bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className="whitespace-nowrap"
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-primary" />
              Community Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">156</div>
                <div className="text-xs text-muted-foreground">Active Issues</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-civic-emerald">89</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-civic-amber">1.2k</div>
                <div className="text-xs text-muted-foreground">Community Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Feed */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(post.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      <Badge className={`text-xs ${getStatusColor(post.status)}`}>
                        {post.status.replace('_', ' ')}
                      </Badge>
                      {post.isOfficial && (
                        <Badge variant="outline" className="text-xs text-primary border-primary">
                          Official
                        </Badge>
                      )}
                      {getPriorityIcon(post.priority)}
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span>By {post.author}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.timeAgo}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                        {post.upvotes}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <MessageSquare className="w-3 h-3" />
                        {post.comments} comments
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};