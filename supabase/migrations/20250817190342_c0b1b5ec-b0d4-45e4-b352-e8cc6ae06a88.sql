-- Create a test municipality for Johannesburg
INSERT INTO public.municipalities (id, name, code, contact_email, contact_phone, website) 
VALUES (
  gen_random_uuid(),
  'City of Johannesburg Metropolitan Municipality',
  'JHB',
  'admin@joburg.org.za',
  '+27 11 407 6911',
  'https://www.joburg.org.za'
) ON CONFLICT (code) DO NOTHING;

-- Create a test district for Johannesburg
INSERT INTO public.districts (id, name, code, municipality_id, boundary_geojson)
SELECT 
  gen_random_uuid(),
  'Johannesburg Central',
  'JHB-CENTRAL',
  m.id,
  '{
    "type": "Polygon",
    "coordinates": [[
      [28.0473, -26.2041],
      [28.0573, -26.2041], 
      [28.0573, -26.1941],
      [28.0473, -26.1941],
      [28.0473, -26.2041]
    ]]
  }'::jsonb
FROM public.municipalities m 
WHERE m.code = 'JHB'
ON CONFLICT (code) DO NOTHING;

-- Create a test municipality admin account
-- First insert the profile manually (since we can't use auth.users directly)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  is_verified,
  municipality_id
)
SELECT 
  gen_random_uuid(),
  'admin@joburg.org.za',
  'Johannesburg Municipality Admin',
  'municipality_admin'::user_role,
  true,
  m.id
FROM public.municipalities m 
WHERE m.code = 'JHB'
ON CONFLICT (email) DO UPDATE SET
  role = 'municipality_admin'::user_role,
  is_verified = true,
  municipality_id = EXCLUDED.municipality_id;