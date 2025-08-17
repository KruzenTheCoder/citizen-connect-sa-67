import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Map, Plus, Edit, MapPin, Building } from "lucide-react";
import { toast } from "sonner";

export function DistrictManagement() {
  const [districts, setDistricts] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [districtsResult, municipalitiesResult] = await Promise.all([
        supabase
          .from('districts')
          .select(`
            *,
            municipalities(name, code)
          `)
          .order('name'),
        supabase
          .from('municipalities')
          .select('*')
          .order('name')
      ]);

      if (districtsResult.error) throw districtsResult.error;
      if (municipalitiesResult.error) throw municipalitiesResult.error;

      setDistricts(districtsResult.data || []);
      setMunicipalities(municipalitiesResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load district data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDistrict = async (districtData: any) => {
    try {
      if (isEditing && selectedDistrict) {
        const { error } = await supabase
          .from('districts')
          .update({
            name: districtData.name,
            code: districtData.code,
            municipality_id: districtData.municipality_id
          })
          .eq('id', selectedDistrict.id);

        if (error) throw error;
        toast.success('District updated successfully');
      } else {
        const { error } = await supabase
          .from('districts')
          .insert({
            name: districtData.name,
            code: districtData.code,
            municipality_id: districtData.municipality_id
          });

        if (error) throw error;
        toast.success('District created successfully');
      }

      fetchData();
      setSelectedDistrict(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving district:', error);
      toast.error('Failed to save district');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">District Management</h2>
          <p className="text-muted-foreground">Manage municipal districts and boundaries</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedDistrict(null); setIsEditing(false); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add District
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit District' : 'Add New District'}
              </DialogTitle>
            </DialogHeader>
            <DistrictForm
              district={selectedDistrict}
              municipalities={municipalities}
              onSave={handleSaveDistrict}
              isEditing={isEditing}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Districts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {districts.map((district) => (
          <Card key={district.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  {district.name}
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { setSelectedDistrict(district); setIsEditing(true); }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit District</DialogTitle>
                    </DialogHeader>
                    <DistrictForm
                      district={selectedDistrict}
                      municipalities={municipalities}
                      onSave={handleSaveDistrict}
                      isEditing={isEditing}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{district.code}</Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>{district.municipalities?.name || 'No municipality assigned'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {district.boundary_geojson ? 'Boundary defined' : 'No boundary data'}
                </span>
              </div>
              
              <div className="pt-2 text-xs text-muted-foreground">
                Created: {new Date(district.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}

        {districts.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No districts found</h3>
                <p className="text-muted-foreground">Start by adding a new district to manage.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// District Form Component
function DistrictForm({ 
  district, 
  municipalities, 
  onSave, 
  isEditing 
}: { 
  district: any; 
  municipalities: any[]; 
  onSave: (data: any) => void; 
  isEditing: boolean; 
}) {
  const [formData, setFormData] = useState({
    name: district?.name || '',
    code: district?.code || '',
    municipality_id: district?.municipality_id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.municipality_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">District Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter district name"
          required
        />
      </div>

      <div>
        <Label htmlFor="code">District Code *</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="Enter district code (e.g., DIS001)"
          required
        />
      </div>

      <div>
        <Label htmlFor="municipality">Municipality *</Label>
        <select
          id="municipality"
          value={formData.municipality_id}
          onChange={(e) => setFormData({ ...formData, municipality_id: e.target.value })}
          className="w-full p-2 border border-input bg-background rounded-md"
          required
        >
          <option value="">Select a municipality</option>
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={municipality.id}>
              {municipality.name} ({municipality.code})
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? 'Update District' : 'Create District'}
      </Button>
    </form>
  );
}