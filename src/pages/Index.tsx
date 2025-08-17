
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { MapView } from "@/components/MapView";
import { Dashboard } from "@/components/Dashboard";
import { ReportForm } from "@/components/ReportForm";
import MunicipalitiesList from "@/components/MunicipalitiesList";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [activeTab, setActiveTab] = useState("map");
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const { profile, signOut } = useAuth();

  // Determine user role from profile
  const userRole = profile?.role === 'municipality_admin' ? 'municipality' : 'citizen';

  const handleRoleToggle = () => {
    // For now, we don't allow manual role switching since it's based on actual user role
    return;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "map":
        return <MapView />;
      case "dashboard":
        return userRole === "municipality" ? <Dashboard /> : <MapView />;
      case "municipalities":
        return <MunicipalitiesList />;
      case "admin":
        return userRole === "municipality" ? (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            <p className="text-muted-foreground">Municipal administration tools</p>
          </div>
        ) : <MapView />;
      default:
        return <MapView />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
        onRoleToggle={handleRoleToggle}
        onNewReport={() => setIsReportFormOpen(true)}
      />
      
      {/* User Profile Bar */}
      <div className="bg-card border-b border-border/30 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{profile?.full_name || profile?.email}</span>
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
            {profile?.role === 'municipality_admin' ? 'Municipality Admin' : 'Citizen'}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={signOut}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
      
      <main className="flex-1 flex">
        {renderContent()}
      </main>

      <ReportForm
        isOpen={isReportFormOpen}
        onClose={() => setIsReportFormOpen(false)}
      />
    </div>
  );
};

export default Index;
