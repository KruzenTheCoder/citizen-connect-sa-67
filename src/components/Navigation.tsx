import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, BarChart3, Users, Settings, Plus } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: "citizen" | "municipality";
  onRoleToggle: () => void;
  onNewReport: () => void;
}

export const Navigation = ({ 
  activeTab, 
  onTabChange, 
  userRole, 
  onRoleToggle, 
  onNewReport 
}: NavigationProps) => {
  const tabs = [
    { id: "map", label: "Map", icon: MapPin, available: true },
    { id: "dashboard", label: "Dashboard", icon: BarChart3, available: userRole === "municipality" },
    { id: "municipalities", label: "Municipalities", icon: Users, available: true },
    { id: "admin", label: "Admin", icon: Settings, available: userRole === "municipality" },
  ];

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Citizen Connect SA</h1>
              <p className="text-xs text-muted-foreground">Municipal Service Reporting</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1">
            {tabs.filter(tab => tab.available).map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className="flex items-center space-x-2"
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Role Toggle */}
            <div className="flex items-center space-x-2">
              <Badge 
                variant={userRole === "citizen" ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={onRoleToggle}
              >
                {userRole === "citizen" ? "Citizen" : "Municipality"}
              </Badge>
            </div>

            {/* Report Button */}
            <Button 
              onClick={onNewReport}
              size="sm"
              className="bg-civic-amber hover:bg-civic-amber/90 text-background font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Report Issue
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.filter(tab => tab.available).map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};