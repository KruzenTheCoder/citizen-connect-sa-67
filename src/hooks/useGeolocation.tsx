import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionRequested: boolean;
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
    permissionRequested: false,
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

  // Enhanced geolocation to municipality mapping
  const getLocationDetails = (lat: number, lng: number): Municipality => {
    // More comprehensive coordinate ranges for South African municipalities
    
    // Cape Town Metropolitan (expanded area)
    if (lat >= -34.7 && lat <= -33.2 && lng >= 18.0 && lng <= 19.5) {
      return { name: "City of Cape Town", type: "metro", province: "Western Cape" };
    }
    
    // Johannesburg Metropolitan (expanded area)
    if (lat >= -26.8 && lat <= -25.8 && lng >= 27.5 && lng <= 28.8) {
      return { name: "City of Johannesburg", type: "metro", province: "Gauteng" };
    }
    
    // eThekwini Metropolitan (Durban - expanded area)
    if (lat >= -30.5 && lat <= -29.3 && lng >= 30.3 && lng <= 31.3) {
      return { name: "eThekwini", type: "metro", province: "KwaZulu-Natal" };
    }
    
    // City of Tshwane (Pretoria - expanded area)
    if (lat >= -26.3 && lat <= -25.2 && lng >= 27.8 && lng <= 28.8) {
      return { name: "City of Tshwane", type: "metro", province: "Gauteng" };
    }
    
    // Nelson Mandela Bay (Port Elizabeth/Gqeberha)
    if (lat >= -34.2 && lat <= -33.7 && lng >= 25.3 && lng <= 25.9) {
      return { name: "Nelson Mandela Bay", type: "metro", province: "Eastern Cape" };
    }
    
    // Buffalo City (East London)
    if (lat >= -33.2 && lat <= -32.7 && lng >= 27.7 && lng <= 28.2) {
      return { name: "Buffalo City", type: "metro", province: "Eastern Cape" };
    }
    
    // Mangaung (Bloemfontein)
    if (lat >= -29.4 && lat <= -28.9 && lng >= 26.0 && lng <= 26.5) {
      return { name: "Mangaung", type: "metro", province: "Free State" };
    }
    
    // Provincial fallbacks for better coverage
    if (lat >= -35 && lat <= -30 && lng >= 16 && lng <= 25) {
      return { name: "Garden Route", type: "district", province: "Western Cape" };
    }
    
    if (lat >= -27 && lat <= -24 && lng >= 27 && lng <= 31) {
      return { name: "Waterberg", type: "district", province: "Limpopo" };
    }
    
    if (lat >= -32 && lat <= -30 && lng >= 29 && lng <= 32) {
      return { name: "King Cetshwayo", type: "district", province: "KwaZulu-Natal" };
    }
    
    if (lat >= -28 && lat <= -25 && lng >= 24 && lng <= 28) {
      return { name: "Dr Kenneth Kaunda", type: "district", province: "North West" };
    }
    
    // Enhanced Gauteng coverage  
    if (lat >= -27 && lat <= -25 && lng >= 27 && lng <= 29) {
      return { name: "Ekurhuleni", type: "metro", province: "Gauteng" };
    }
    
    // Default fallback - use a central SA municipality
    return { name: "Mangaung", type: "metro", province: "Free State" };
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: "Geolocation is not supported by this browser",
        loading: false,
        permissionRequested: true,
      }));
      return false;
    }

    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          setLocation(prev => ({
            ...prev,
            error: "Location access denied. Please enable location services and refresh the page.",
            loading: false,
            permissionRequested: true,
          }));
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('Permissions API not available, proceeding with geolocation request');
      return true;
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const success = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude,
          longitude,
          error: null,
          loading: false,
          permissionRequested: true,
        });
        
        const detectedMunicipality = getLocationDetails(latitude, longitude);
        setMunicipality(detectedMunicipality);
      };

      const error = (error: GeolocationPositionError) => {
        let errorMessage = "Unable to detect location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        setLocation(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
          permissionRequested: true,
        }));
        
        // Don't set default municipality - let user select manually
        setMunicipality(null);
      };

      navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 60000, // Allow cached position up to 1 minute
      });
    };

    initializeLocation();
  }, []);

  return { ...location, municipality };
};