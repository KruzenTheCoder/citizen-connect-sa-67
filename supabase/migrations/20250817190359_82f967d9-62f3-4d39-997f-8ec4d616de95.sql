-- Create a test municipality for Johannesburg
INSERT INTO public.municipalities (name, code, contact_email, contact_phone, website) 
VALUES (
  'City of Johannesburg Metropolitan Municipality',
  'JHB',
  'admin@joburg.org.za',
  '+27 11 407 6911',
  'https://www.joburg.org.za'
);

-- Create a test district for Johannesburg
INSERT INTO public.districts (name, code, municipality_id, boundary_geojson)
SELECT 
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
WHERE m.code = 'JHB';

-- Create another district for testing
INSERT INTO public.districts (name, code, municipality_id, boundary_geojson)
SELECT 
  'Johannesburg North',
  'JHB-NORTH',
  m.id,
  '{
    "type": "Polygon",
    "coordinates": [[
      [28.0473, -26.1941],
      [28.0673, -26.1941], 
      [28.0673, -26.1741],
      [28.0473, -26.1741],
      [28.0473, -26.1941]
    ]]
  }'::jsonb
FROM public.municipalities m 
WHERE m.code = 'JHB';