-- Add policy to allow municipality admins to read their profiles
CREATE POLICY "Municipality admins can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id AND 
  role = 'municipality_admin'
);