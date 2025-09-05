import { Home, MapPin, Settings, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: "citizen" | "municipality";
}

export const BottomNavigation = ({ 
  activeTab, 
  onTabChange, 
  userRole 
}: BottomNavigationProps) => {
  const tabs = [
    { id: "home", label: "Home", icon: Home, available: true },
    { id: "map", label: "Map", icon: MapPin, available: true },
    { id: "community", label: "Community", icon: MessageSquare, available: true },
    { id: "services", label: "Services", icon: Settings, available: userRole === "municipality" },
    { id: "profile", label: "Profile", icon: User, available: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="safe-area-padding-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.filter(tab => tab.available).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <tab.icon className={cn("w-5 h-5 mb-1", isActive && "scale-110")} />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};