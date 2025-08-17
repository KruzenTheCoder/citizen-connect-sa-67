-- Create enum types
CREATE TYPE public.user_role AS ENUM ('citizen', 'municipality_admin', 'super_admin');
CREATE TYPE public.incident_status AS ENUM ('pending', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.incident_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.incident_type AS ENUM ('water', 'electricity', 'roads', 'waste', 'other');

-- Create municipalities table
CREATE TABLE public.municipalities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    boundary_geojson JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create districts table
CREATE TABLE public.districts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    municipality_id UUID NOT NULL REFERENCES public.municipalities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    boundary_geojson JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(municipality_id, code)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    municipality_id UUID REFERENCES public.municipalities(id),
    role public.user_role NOT NULL DEFAULT 'citizen',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create incidents table
CREATE TABLE public.incidents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    municipality_id UUID NOT NULL REFERENCES public.municipalities(id) ON DELETE CASCADE,
    district_id UUID REFERENCES public.districts(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    incident_type public.incident_type NOT NULL,
    priority public.incident_priority NOT NULL DEFAULT 'medium',
    status public.incident_status NOT NULL DEFAULT 'pending',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_address TEXT,
    images TEXT[], -- Array of image URLs
    estimated_resolution_time TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create incident updates table for tracking progress
CREATE TABLE public.incident_updates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.incident_status,
    message TEXT NOT NULL,
    eta_update TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Municipality admins can view profiles in their municipality" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'municipality_admin' 
            AND p.municipality_id = profiles.municipality_id
        )
    );

-- Create RLS policies for municipalities (public read)
CREATE POLICY "Anyone can view municipalities" ON public.municipalities
    FOR SELECT USING (true);

-- Create RLS policies for districts (public read)
CREATE POLICY "Anyone can view districts" ON public.districts
    FOR SELECT USING (true);

-- Create RLS policies for incidents
CREATE POLICY "Users can view incidents in their municipality" ON public.incidents
    FOR SELECT USING (
        municipality_id = (
            SELECT municipality_id FROM public.profiles 
            WHERE id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('municipality_admin', 'super_admin')
        )
    );

CREATE POLICY "Citizens can create incidents" ON public.incidents
    FOR INSERT WITH CHECK (
        auth.uid() = reporter_id AND
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid()
        )
    );

CREATE POLICY "Municipality admins can update incidents in their municipality" ON public.incidents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'municipality_admin' 
            AND p.municipality_id = incidents.municipality_id
        )
    );

-- Create RLS policies for incident updates
CREATE POLICY "Users can view updates for incidents they can see" ON public.incident_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.incidents i 
            WHERE i.id = incident_updates.incident_id
        )
    );

CREATE POLICY "Municipality admins can create updates" ON public.incident_updates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('municipality_admin', 'super_admin')
        )
    );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_municipalities_updated_at
    BEFORE UPDATE ON public.municipalities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_districts_updated_at
    BEFORE UPDATE ON public.districts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample municipalities and districts
INSERT INTO public.municipalities (name, code, contact_email, contact_phone) VALUES
('City of Cape Town', 'CCT', 'info@capetown.gov.za', '+27 21 400 1111'),
('City of Johannesburg', 'COJ', 'info@joburg.org.za', '+27 11 407 7106'),
('eThekwini Municipality', 'ETH', 'info@durban.gov.za', '+27 31 311 1111');

-- Insert sample districts for Cape Town
INSERT INTO public.districts (municipality_id, name, code) VALUES
((SELECT id FROM public.municipalities WHERE code = 'CCT'), 'City Bowl', 'CB'),
((SELECT id FROM public.municipalities WHERE code = 'CCT'), 'Atlantic Seaboard', 'AS'),
((SELECT id FROM public.municipalities WHERE code = 'CCT'), 'Northern Suburbs', 'NS'),
((SELECT id FROM public.municipalities WHERE code = 'CCT'), 'Southern Suburbs', 'SS'),
((SELECT id FROM public.municipalities WHERE code = 'CCT'), 'Cape Flats', 'CF');

-- Insert sample districts for Johannesburg
INSERT INTO public.districts (municipality_id, name, code) VALUES
((SELECT id FROM public.municipalities WHERE code = 'COJ'), 'Sandton', 'SAN'),
((SELECT id FROM public.municipalities WHERE code = 'COJ'), 'Rosebank', 'RSB'),
((SELECT id FROM public.municipalities WHERE code = 'COJ'), 'Soweto', 'SOW'),
((SELECT id FROM public.municipalities WHERE code = 'COJ'), 'Alexandra', 'ALX');

-- Insert sample districts for eThekwini
INSERT INTO public.districts (municipality_id, name, code) VALUES
((SELECT id FROM public.municipalities WHERE code = 'ETH'), 'Durban Central', 'DC'),
((SELECT id FROM public.municipalities WHERE code = 'ETH'), 'Umhlanga', 'UMH'),
((SELECT id FROM public.municipalities WHERE code = 'ETH'), 'Pinetown', 'PIN'),
((SELECT id FROM public.municipalities WHERE code = 'ETH'), 'Chatsworth', 'CHA');