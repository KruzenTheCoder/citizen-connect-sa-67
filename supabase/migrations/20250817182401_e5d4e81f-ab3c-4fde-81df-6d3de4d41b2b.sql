-- Promote the specific user to super admin
UPDATE public.profiles 
SET role = 'super_admin', 
    is_verified = true,
    full_name = 'Super Administrator',
    updated_at = now()
WHERE email = 'knaidoo@hyderelectrical.co.za';