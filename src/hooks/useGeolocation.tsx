import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

interface Municipality {
  name: string;
  type: 'metro' | 'district' | 'local';
  province: string;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  const [municipality, setMunicipality] = useState<Municipality | null>(null);

  // South African municipalities data
  const municipalities = {
    metro: [
      { name: "Buffalo City", province: "Eastern Cape" },
      { name: "City of Cape Town", province: "Western Cape" },
      { name: "City of Johannesburg", province: "Gauteng" },
      { name: "City of Tshwane", province: "Gauteng" },
      { name: "Ekurhuleni", province: "Gauteng" },
      { name: "eThekwini", province: "KwaZulu-Natal" },
      { name: "Mangaung", province: "Free State" },
      { name: "Nelson Mandela Bay", province: "Eastern Cape" }
    ],
    districts: {
      "Eastern Cape": ["Alfred Nzo", "Amathole", "Chris Hani", "Joe Gqabi", "OR Tambo", "Sarah Baartman"],
      "Free State": ["Fezile Dabi", "Lejweleputswa", "Thabo Mofutsanyana", "Xhariep"],
      "Gauteng": ["Sedibeng", "West Rand"],
      "KwaZulu-Natal": ["Amajuba", "Harry Gwala", "iLembe", "King Cetshwayo", "Ugu", "uMgungundlovu", "uMkhanyakude", "uMzinyathi", "uThukela", "Zululand"],
      "Limpopo": ["Capricorn", "Mopani", "Sekhukhune", "Vhembe", "Waterberg"],
      "Mpumalanga": ["Ehlanzeni", "Gert Sibande", "Nkangala"],
      "North West": ["Bojanala Platinum", "Dr Kenneth Kaunda", "Dr Ruth Segomotsi Mompati", "Ngaka Modiri Molema"],
      "Northern Cape": ["Frances Baard", "John Taolo Gaetsewe", "Namakwa", "Pixley ka Seme", "ZF Mgcawu"],
      "Western Cape": ["Cape Winelands", "Central Karoo", "Garden Route", "Overberg", "West Coast"]
    }
  };

  // Simplified geolocation to municipality mapping
  const getLocationDetails = (lat: number, lng: number): Municipality => {
    // This is a simplified approach - in a real app you'd use proper GIS data
    // For now, we'll use rough coordinate ranges for major cities
    
    // Cape Town area
    if (lat >= -34.5 && lat <= -33.5 && lng >= 18.0 && lng <= 19.0) {
      return { name: "City of Cape Town", type: "metro", province: "Western Cape" };
    }
    
    // Johannesburg area
    if (lat >= -26.5 && lat <= -25.5 && lng >= 27.5 && lng <= 28.5) {
      return { name: "City of Johannesburg", type: "metro", province: "Gauteng" };
    }
    
    // Durban area
    if (lat >= -30.0 && lat <= -29.0 && lng >= 30.5 && lng <= 31.5) {
      return { name: "eThekwini", type: "metro", province: "KwaZulu-Natal" };
    }
    
    // Pretoria area
    if (lat >= -26.0 && lat <= -25.0 && lng >= 28.0 && lng <= 29.0) {
      return { name: "City of Tshwane", type: "metro", province: "Gauteng" };
    }
    
    // Default to a district based on rough province mapping
    if (lat >= -35 && lng >= 18 && lng <= 25) {
      return { name: "Garden Route", type: "district", province: "Western Cape" };
    }
    
    if (lat >= -27 && lng >= 27 && lng <= 29) {
      return { name: "West Rand", type: "district", province: "Gauteng" };
    }
    
    // Default fallback
    return { name: "City of Cape Town", type: "metro", province: "Western Cape" };
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: "Geolocation is not supported",
        loading: false,
      }));
      return;
    }

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setLocation({
        latitude,
        longitude,
        error: null,
        loading: false,
      });
      
      const detectedMunicipality = getLocationDetails(latitude, longitude);
      setMunicipality(detectedMunicipality);
    };

    const error = (error: GeolocationPositionError) => {
      setLocation(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      
      // Set default location (Cape Town) if geolocation fails
      setMunicipality({ name: "City of Cape Town", type: "metro", province: "Western Cape" });
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }, []);

  return { ...location, municipality };
};