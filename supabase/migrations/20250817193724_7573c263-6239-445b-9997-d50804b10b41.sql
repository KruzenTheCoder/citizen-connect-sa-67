-- Drop the problematic policies that reference auth.users
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON public.profiles;

-- Create new policies that don't reference auth.users table
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.email = 'knaidoo@hyderelectrical.co.za'
    AND p.role = 'super_admin'
  )
  OR auth.uid() = id
);

CREATE POLICY "Super admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.email = 'knaidoo@hyderelectrical.co.za' 
    AND p.role = 'super_admin'
  )
  OR auth.uid() = id
);