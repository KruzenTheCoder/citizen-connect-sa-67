
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { MapView } from "@/components/MapView";
import { Dashboard } from "@/components/Dashboard";
import { ReportForm } from "@/components/ReportForm";
import MunicipalitiesList from "@/components/MunicipalitiesList";

const Index = () => {
  const [activeTab, setActiveTab] = useState("map");
  const [userRole, setUserRole] = useState<"citizen" | "municipality">("citizen");
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);

  const handleRoleToggle = () => {
    setUserRole(prev => prev === "citizen" ? "municipality" : "citizen");
    // Switch to appropriate tab based on role
    if (userRole === "citizen" && activeTab === "dashboard") {
      setActiveTab("map");
    }
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
