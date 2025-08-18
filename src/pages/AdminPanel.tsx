import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom"; // Import useNavigate
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { IncidentManagement } from "@/components/admin/IncidentManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { DistrictManagement } from "@/components/admin/DistrictManagement";
import { NotificationManagement } from "@/components/admin/NotificationManagement";
import { MunicipalitySettings } from "@/components/admin/MunicipalitySettings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState("dashboard"); 
  const { profile } = useAuth(); // Removed signOut since it's in the parent
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Redirect if not admin
  if (!profile || (profile.role !== 'municipality_admin' && profile.role !== 'super_admin')) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AnalyticsDashboard />;
      case "incidents":
        return <IncidentManagement />;
      case "users":
        return <UserManagement />;
      case "districts":
        return <DistrictManagement />;
      case "notifications":
        return <NotificationManagement />;
      case "settings":
        return <MunicipalitySettings />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <div className="flex-1 flex flex-col p-6">
          {/* Admin Panel Specific Header */}
          <header className="pb-4 mb-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Button to go back to the main app view */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')} // Use navigate hook
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Main App
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">Municipal Administration</h1>
                <p className="text-sm text-muted-foreground">
                  {profile.role === 'super_admin' ? 'Super Administrator' : 'Municipality Admin'}
                </p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanel;