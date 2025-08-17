
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { MapView } from "@/components/MapView";
import { Dashboard } from "@/components/Dashboard";
import { ReportForm } from "@/components/ReportForm";
import MunicipalitiesList from "@/components/MunicipalitiesList";
import NotificationsPanel from "@/components/NotificationsPanel";
import VoiceReporting from "@/components/VoiceReporting";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [activeTab, setActiveTab] = useState("map");
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [isVoiceReportOpen, setIsVoiceReportOpen] = useState(false);
  const { profile, signOut } = useAuth();

  // Determine user role from profile
  const userRole = profile?.role === 'municipality_admin' ? 'municipality' : 'citizen';

  const handleRoleToggle = () => {
    // For now, we don't allow manual role switching since it's based on actual user role
    return;
  };

  const handleVoiceReportData = (data: any) => {
    // Close voice reporting and open regular form with pre-filled data
    setIsVoiceReportOpen(false);
    setIsReportFormOpen(true);
    // TODO: Pass data to ReportForm component
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
        // Embed the full Admin Panel directly in the app to avoid external routing
        return userRole === "municipality" ? (
          <div className="flex-1">
            {/* Embedded Admin Panel */}
            {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
            {(() => {
              const AdminPanel = require("./AdminPanel").default;
              return <AdminPanel />;
            })()}
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
            {profile?.role === 'municipality_admin' ? 'Municipality Admin' : 
             profile?.role === 'super_admin' ? 'Super Administrator' : 'Citizen'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationsPanel />
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
      </div>
      
      <main className="flex-1 flex">
        {renderContent()}
      </main>

      <ReportForm
        isOpen={isReportFormOpen}
        onClose={() => setIsReportFormOpen(false)}
      />

      {/* Voice Reporting Modal */}
      {isVoiceReportOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 z-10"
              onClick={() => setIsVoiceReportOpen(false)}
            >
              ✕
            </Button>
            <VoiceReporting onReportData={handleVoiceReportData} />
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <Button
          onClick={() => setIsVoiceReportOpen(true)}
          className="rounded-full w-14 h-14 bg-civic-amber hover:bg-civic-amber/80 text-black shadow-lg"
          title="Voice Report"
        >
          🎤
        </Button>
        <Button
          onClick={() => setIsReportFormOpen(true)}
          className="rounded-full w-14 h-14 bg-primary hover:bg-primary/80 shadow-lg"
          title="Report Issue"
        >
          ➕
        </Button>
      </div>
    </div>
  );
};

export default Index;
