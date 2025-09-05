import React, { useState, lazy, Suspense } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Homepage } from "@/components/Homepage";
import { ServicesPage } from "@/components/ServicesPage";
import { CommunityPage } from "@/components/CommunityPage";
import { ProfilePage } from "@/components/ProfilePage";
import { MapView } from "@/components/MapView";
import { Dashboard } from "@/components/Dashboard";
import { ReportForm } from "@/components/ReportForm";
import MunicipalitiesList from "@/components/MunicipalitiesList";
import VoiceReporting from "@/components/VoiceReporting";
import { useAuth } from "@/hooks/useAuth";

// Lazily load the AdminPanel component to enable code-splitting
const AdminPanel = lazy(() => import("./AdminPanel"));

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [isVoiceReportOpen, setIsVoiceReportOpen] = useState(false);
  const { profile } = useAuth();

  // Determine user role from profile
  const userRole = profile?.role === 'municipality_admin' ? 'municipality' : 'citizen';

  const handleRoleToggle = () => {
    // For now, we don't allow manual role switching since it's based on actual user role
    return;
  };

  const handleVoiceReportData = (data) => {
    // Close voice reporting and open regular form with pre-filled data
    setIsVoiceReportOpen(false);
    setIsReportFormOpen(true);
    // TODO: Pass data to ReportForm component
    console.log("Voice reporting data received:", data);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <Homepage 
            onReportIssue={() => setIsReportFormOpen(true)}
            onNavigate={setActiveTab}
          />
        );
      case "map":
        return <MapView />;
      case "community":
        return <CommunityPage />;
      case "services":
        return userRole === "municipality" ? (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center text-muted-foreground">Loading Admin Panel...</div>}>
            <AdminPanel />
          </Suspense>
        ) : <ServicesPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return (
          <Homepage 
            onReportIssue={() => setIsReportFormOpen(true)}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        {renderContent()}
      </main>
      
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
      />

      <ReportForm
        isOpen={isReportFormOpen}
        onClose={() => setIsReportFormOpen(false)}
      />

      {/* Voice Reporting Modal */}
      {isVoiceReportOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative">
            <button
              className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm font-bold"
              onClick={() => setIsVoiceReportOpen(false)}
            >
              ✕
            </button>
            <VoiceReporting onReportData={handleVoiceReportData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;