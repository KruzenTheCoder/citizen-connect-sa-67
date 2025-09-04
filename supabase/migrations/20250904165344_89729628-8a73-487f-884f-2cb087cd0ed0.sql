-- Enable real-time for incident_updates table  
ALTER TABLE public.incident_updates REPLICA IDENTITY FULL;

-- Add incident_updates table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_updates;