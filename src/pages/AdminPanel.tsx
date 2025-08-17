import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { IncidentManagement } from "@/components/admin/IncidentManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { DistrictManagement } from "@/components/admin/DistrictManagement";
import { NotificationManagement } from "@/components/admin/NotificationManagement";
import { MunicipalitySettings } from "@/components/admin/MunicipalitySettings";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { profile, signOut } = useAuth();

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
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Municipal Administration</h1>
                <p className="text-sm text-muted-foreground">
                  {profile.role === 'super_admin' ? 'Super Administrator' : 'Municipality Admin'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{profile.full_name || profile.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
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