-- Fix security definer view by recreating as regular view
DROP VIEW IF EXISTS public.incident_analytics;

-- Create regular view without SECURITY DEFINER
CREATE VIEW public.incident_analytics AS
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