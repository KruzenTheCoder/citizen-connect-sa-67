import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/integrations/supabase/client";
import { X, MapPin, Camera, Droplets, Zap, Construction, Send } from "lucide-react";

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportForm = ({ isOpen, onClose }: ReportFormProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { latitude, longitude, error: locationError, municipality } = useGeolocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "",
    severity: "",
    cause: "",
    description: "",
    attachment: "",
    consent: false,
    location: locationError ? "Location unavailable" : "Detecting location..."
  });

  // Update location when geolocation data becomes available
  useEffect(() => {
    if (latitude && longitude) {
      setFormData(prev => ({
        ...prev,
        location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}${municipality ? ` (${municipality.name})` : ''}`
      }));
    } else if (locationError) {
      setFormData(prev => ({
        ...prev,
        location: "Location unavailable"
      }));
    }
  }, [latitude, longitude, locationError, municipality]);

  const issueTypes = [
    { value: "water", label: "Water Issues", icon: Droplets, color: "text-status-water" },
    { value: "electricity", label: "Electricity", icon: Zap, color: "text-status-electricity" },
    { value: "roads", label: "Roads", icon: Construction, color: "text-status-roadworks" },
  ];

  const severityToPriority = {
    "1": "low",
    "2": "low", 
    "3": "medium",
    "4": "high",
    "5": "critical"
  } as const;

  const severityLevels = [
    { value: "1", label: "Minor (1)", description: "Low impact" },
    { value: "2", label: "Low (2)", description: "Some inconvenience" },
    { value: "3", label: "Medium (3)", description: "Moderate impact" },
    { value: "4", label: "High (4)", description: "Significant disruption" },
    { value: "5", label: "Critical (5)", description: "Emergency" },
  ];

  const [detectedMunicipalityId, setDetectedMunicipalityId] = useState<string | null>(null);
  const [resolvingMunicipality, setResolvingMunicipality] = useState(false);

  // Try to resolve municipality_id from geolocated municipality name
  useEffect(() => {
    const resolveMunicipality = async () => {
      if (!municipality?.name) return;
      setResolvingMunicipality(true);
      try {
        const { data, error } = await supabase
          .from('municipalities')
          .select('id')
          .eq('name', municipality.name)
          .maybeSingle();
        if (!error && data?.id) {
          setDetectedMunicipalityId(data.id);
        }
      } catch (e) {
        console.error('Failed to resolve municipality id:', e);
      } finally {
        setResolvingMunicipality(false);
      }
    };
    resolveMunicipality();
  }, [municipality]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.severity || !formData.description || !formData.consent) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and accept the consent.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const municipalityId = profile?.municipality_id || detectedMunicipalityId;
      if (!municipalityId) {
        toast({
          title: "Select Municipality",
          description: "We couldn't detect your municipality. Please set your municipality in profile settings and try again.",
          variant: "destructive",
        });
        return;
      }

      // Create the incident record
      const incidentData = {
        reporter_id: user.id,
        municipality_id: municipalityId,
        incident_type: formData.type as any,
        priority: severityToPriority[formData.severity as keyof typeof severityToPriority] as any,
        status: 'pending' as any,
        title: `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Issue - ${formData.cause || 'Reported by citizen'}`,
        description: formData.description,
        location_lat: latitude || null,
        location_lng: longitude || null,
        location_address: formData.location,
        images: formData.attachment ? [formData.attachment] : null
      };

      const { error } = await supabase
        .from('incidents')
        .insert([incidentData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Report Submitted Successfully",
        description: "Your incident report has been submitted. You'll receive updates on its progress.",
      });
      
      // Reset form
      setFormData({
        type: "",
        severity: "",
        cause: "",
        description: "",
        attachment: "",
        consent: false,
        location: latitude && longitude ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}${municipality ? ` (${municipality.name})` : ''}` : "Location unavailable"
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Report an Issue</h2>
              <p className="text-sm text-muted-foreground">Help improve municipal services in your area</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Issue Type *</Label>
              <div className="grid grid-cols-3 gap-2">
                {issueTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      type="button"
                      variant={formData.type === type.value ? "default" : "outline"}
                      className="h-auto py-3 flex flex-col items-center space-y-2"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                    >
                      <Icon className={`w-5 h-5 ${type.color}`} />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity" className="text-sm font-medium">Severity Level *</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{level.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{level.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Location</Label>
              <div className="flex items-center space-x-2 p-3 bg-secondary rounded-lg">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{formData.location}</span>
                <Button variant="ghost" size="sm" className="ml-auto">
                  Adjust
                </Button>
              </div>
            </div>

            {/* Cause (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="cause" className="text-sm font-medium">Possible Cause (Optional)</Label>
              <Input
                id="cause"
                placeholder="e.g., burst pipe, cable theft, accident"
                value={formData.cause}
                onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Attachment */}
            <div className="space-y-2">
              <Label htmlFor="attachment" className="text-sm font-medium">Photo/Document (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="attachment"
                  placeholder="Photo URL or upload"
                  value={formData.attachment}
                  onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
                />
                <Button type="button" variant="outline" size="sm">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Consent */}
            <div className="flex items-start space-x-2 p-4 bg-muted rounded-lg">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => setFormData({ ...formData, consent: !!checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="consent" className="text-sm font-medium cursor-pointer">
                  Privacy Consent (Required) *
                </Label>
                <p className="text-xs text-muted-foreground">
                  I consent to sharing my coarse location publicly and exact location securely with the relevant municipality for service delivery purposes, in compliance with POPIA.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-civic-amber hover:bg-civic-amber/90 text-background"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};