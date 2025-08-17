-- Update RLS policies to ensure super admins have full access
-- Drop existing policies and recreate with super admin access

-- Update incidents policies to give super admins full access
DROP POLICY IF EXISTS "Users can view incidents in their municipality" ON public.incidents;
DROP POLICY IF EXISTS "Municipality admins can update incidents in their municipality" ON public.incidents;

-- Recreate incidents policies with super admin access
CREATE POLICY "Users can view incidents" ON public.incidents
    FOR SELECT USING (
        -- Super admins can see everything
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'super_admin'
        )
        OR
        -- Municipality admins can see their municipality
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'municipality_admin' 
            AND p.municipality_id = incidents.municipality_id
        )
        OR
        -- Citizens can see incidents in their municipality
        municipality_id = (
            SELECT municipality_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can update incidents" ON public.incidents
    FOR UPDATE USING (
        -- Super admins can update everything
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'super_admin'
        )
        OR
        -- Municipality admins can update their municipality incidents
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'municipality_admin' 
            AND p.municipality_id = incidents.municipality_id
        )
    );

-- Update profiles policies for super admin access
DROP POLICY IF EXISTS "Municipality admins can view profiles in their municipality" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        -- Users can view their own profile
        auth.uid() = id
        OR
        -- Super admins can see all profiles
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'super_admin'
        )
        OR
        -- Municipality admins can see profiles in their municipality
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'municipality_admin' 
            AND p.municipality_id = profiles.municipality_id
        )
    );

-- Add policy for super admins to update any profile
CREATE POLICY "Super admins can update any profile" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id
        OR
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'super_admin'
        )
    );

-- Create notifications table for real-time updates
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to send notifications when incident status changes
CREATE OR REPLACE FUNCTION public.notify_incident_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify the reporter when status changes
    INSERT INTO public.notifications (user_id, incident_id, title, message, type)
    VALUES (
        NEW.reporter_id,
        NEW.id,
        'Incident Status Updated',
        'Your incident "' || NEW.title || '" status has been changed to ' || NEW.status,
        CASE 
            WHEN NEW.status = 'resolved' THEN 'success'
            WHEN NEW.status = 'in_progress' THEN 'info'
            ELSE 'info'
        END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for incident status notifications
CREATE TRIGGER trigger_incident_status_notification
    AFTER UPDATE OF status ON public.incidents
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.notify_incident_status_change();

-- Create incident analytics view
CREATE OR REPLACE VIEW public.incident_analytics AS
SELECT 
    m.name as municipality_name,
    m.id as municipality_id,
    COUNT(*) as total_incidents,
    COUNT(*) FILTER (WHERE i.status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE i.status = 'in_progress') as in_progress_count,
    COUNT(*) FILTER (WHERE i.status = 'resolved') as resolved_count,
    COUNT(*) FILTER (WHERE i.status = 'closed') as closed_count,
    COUNT(*) FILTER (WHERE i.priority = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE i.priority = 'high') as high_priority_count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(i.resolved_at, NOW()) - i.created_at))/3600) as avg_resolution_hours,
    i.incident_type,
    DATE_TRUNC('day', i.created_at) as incident_date
FROM public.incidents i
JOIN public.municipalities m ON i.municipality_id = m.id
GROUP BY m.id, m.name, i.incident_type, DATE_TRUNC('day', i.created_at);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;