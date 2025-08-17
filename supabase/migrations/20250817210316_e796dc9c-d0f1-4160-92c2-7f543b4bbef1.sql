-- Fix recursive RLS on profiles and allow super admins to view/update all profiles without recursion

-- 1) Security definer helper to check super admin role without referencing profiles in the policy itself
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
  );
$$;

-- 2) Replace problematic policies that referenced profiles inside profiles policies (recursion)
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON public.profiles;

CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  public.is_super_admin() OR auth.uid() = id
);

CREATE POLICY "Super admins can update any profile"
ON public.profiles
FOR UPDATE
USING (
  public.is_super_admin() OR auth.uid() = id
);
