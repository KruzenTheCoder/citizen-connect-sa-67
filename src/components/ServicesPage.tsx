import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Users, 
  FileText,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from "lucide-react";

export const ServicesPage = () => {
  const services = [
    {
      category: "Emergency Services",
      icon: AlertCircle,
      color: "text-civic-red",
      bgColor: "bg-civic-red/10",
      items: [
        { name: "Police", phone: "10111", hours: "24/7" },
        { name: "Fire Department", phone: "107", hours: "24/7" },
        { name: "Ambulance", phone: "10177", hours: "24/7" },
      ]
    },
    {
      category: "Municipal Services",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      items: [
        { name: "Water & Sanitation", phone: "021-400-4911", hours: "7AM-7PM", email: "water@capetown.gov.za" },
        { name: "Electricity", phone: "021-400-4658", hours: "24/7", email: "electricity@capetown.gov.za" },
        { name: "Roads & Transport", phone: "021-400-4201", hours: "8AM-5PM", email: "roads@capetown.gov.za" },
        { name: "Waste Management", phone: "021-400-4477", hours: "7AM-4PM", email: "waste@capetown.gov.za" },
      ]
    },
    {
      category: "Permits & Licensing",
      icon: FileText,
      color: "text-civic-emerald",
      bgColor: "bg-civic-emerald/10",
      items: [
        { name: "Building Plans", phone: "021-400-1234", hours: "8AM-4PM", email: "building@capetown.gov.za" },
        { name: "Business Licenses", phone: "021-400-5678", hours: "8AM-4PM", email: "business@capetown.gov.za" },
        { name: "Event Permits", phone: "021-400-9012", hours: "8AM-4PM", email: "events@capetown.gov.za" },
      ]
    }
  ];

  const quickLinks = [
    { name: "Pay Municipal Bills", url: "#", icon: ExternalLink },
    { name: "Schedule Service", url: "#", icon: Clock },
    { name: "Download Forms", url: "#", icon: FileText },
    { name: "Municipality Website", url: "#", icon: ExternalLink },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-civic-emerald to-civic-emerald/80 text-white px-4 pt-12 pb-8 safe-area-padding-top">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Local Services</h1>
          <p className="text-white/90">Access municipal services and emergency contacts</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 relative z-10">
        {/* Quick Links */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent"
                >
                  <link.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs text-center">{link.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Services Categories */}
        <div className="space-y-6">
          {services.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <span className="text-lg">{category.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.items.map((service, serviceIndex) => (
                  <div key={serviceIndex} className="border-l-4 border-primary/20 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">{service.name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={`tel:${service.phone}`}
                          className="text-primary hover:underline"
                        >
                          {service.phone}
                        </a>
                      </div>
                      {service.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a 
                            href={`mailto:${service.email}`}
                            className="text-primary hover:underline"
                          >
                            {service.email}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{service.hours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Status */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-civic-emerald" />
              Service Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Water Services</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-civic-emerald rounded-full"></div>
                  <span className="text-xs text-civic-emerald">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Electricity</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-civic-amber rounded-full"></div>
                  <span className="text-xs text-civic-amber">Maintenance</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Waste Collection</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-civic-emerald rounded-full"></div>
                  <span className="text-xs text-civic-emerald">Operational</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};