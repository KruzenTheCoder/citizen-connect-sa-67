import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Building, Phone, Mail, Globe, Save, User } from "lucide-react";
import { toast } from "sonner";

export function MunicipalitySettings() {
  const { profile } = useAuth();
  const [municipality, setMunicipality] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [municipalityForm, setMunicipalityForm] = useState({
    name: '',
    code: '',
    contact_email: '',
    contact_phone: '',
    website: ''
  });

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchMunicipalityData();
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const fetchMunicipalityData = async () => {
    if (!profile?.municipality_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('municipalities')
        .select('*')
        .eq('id', profile.municipality_id)
        .single();

      if (error) throw error;

      setMunicipality(data);
      setMunicipalityForm({
        name: data.name || '',
        code: data.code || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        website: data.website || ''
      });
    } catch (error) {
      console.error('Error fetching municipality:', error);
      toast.error('Failed to load municipality data');
    } finally {
      setLoading(false);
    }
  };

  const saveMunicipalitySettings = async () => {
    if (!municipality) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('municipalities')
        .update({
          name: municipalityForm.name,
          code: municipalityForm.code,
          contact_email: municipalityForm.contact_email,
          contact_phone: municipalityForm.contact_phone,
          website: municipalityForm.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', municipality.id);

      if (error) throw error;

      toast.success('Municipality settings saved successfully');
      fetchMunicipalityData();
    } catch (error) {
      console.error('Error saving municipality settings:', error);
      toast.error('Failed to save municipality settings');
    } finally {
      setSaving(false);
    }
  };

  const saveProfileSettings = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage municipality and account settings</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="profile-email">Email (Read-only)</Label>
              <Input
                id="profile-email"
                value={profileForm.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="profile-phone">Phone Number</Label>
              <Input
                id="profile-phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label>Role</Label>
              <div className="pt-2">
                <Badge variant="outline" className="capitalize">
                  {profile?.role?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          <Button onClick={saveProfileSettings} disabled={saving} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Municipality Settings */}
      {municipality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Municipality Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="muni-name">Municipality Name</Label>
                <Input
                  id="muni-name"
                  value={municipalityForm.name}
                  onChange={(e) => setMunicipalityForm({ ...municipalityForm, name: e.target.value })}
                  placeholder="Municipality name"
                />
              </div>

              <div>
                <Label htmlFor="muni-code">Municipality Code</Label>
                <Input
                  id="muni-code"
                  value={municipalityForm.code}
                  onChange={(e) => setMunicipalityForm({ ...municipalityForm, code: e.target.value })}
                  placeholder="Municipality code"
                />
              </div>

              <div>
                <Label htmlFor="contact-email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact-email"
                    type="email"
                    value={municipalityForm.contact_email}
                    onChange={(e) => setMunicipalityForm({ ...municipalityForm, contact_email: e.target.value })}
                    placeholder="contact@municipality.gov.za"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact-phone"
                    value={municipalityForm.contact_phone}
                    onChange={(e) => setMunicipalityForm({ ...municipalityForm, contact_phone: e.target.value })}
                    placeholder="+27 11 123 4567"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    type="url"
                    value={municipalityForm.website}
                    onChange={(e) => setMunicipalityForm({ ...municipalityForm, website: e.target.value })}
                    placeholder="https://www.municipality.gov.za"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Municipality Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span> {new Date(municipality.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(municipality.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <Button onClick={saveMunicipalitySettings} disabled={saving} className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Municipality Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {!municipality && profile?.role === 'municipality_admin' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Municipality Assigned</h3>
            <p className="text-muted-foreground">
              Contact your super administrator to assign you to a municipality.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}