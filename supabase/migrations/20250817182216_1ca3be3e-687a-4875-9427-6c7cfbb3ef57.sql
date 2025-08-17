-- Create function to promote user to super admin
CREATE OR REPLACE FUNCTION public.promote_to_super_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles 
    SET role = 'super_admin', 
        is_verified = true,
        updated_at = now()
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the super admin user directly (for testing purposes)
-- First, we'll insert into auth.users table (this is usually handled by Supabase Auth)
-- Instead, let's create a function that can be called after normal signup

-- Function to setup initial super admin after they sign up normally
CREATE OR REPLACE FUNCTION public.setup_super_admin()
RETURNS void AS $$
BEGIN
    -- Promote the specific email to super admin
    UPDATE public.profiles 
    SET role = 'super_admin', 
        is_verified = true,
        full_name = 'Super Administrator',
        updated_at = now()
    WHERE email = 'knaidoo@hyderelectrical.co.za';
    
    -- If user doesn't exist yet, that's ok - they need to sign up first
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Run the setup function
SELECT public.setup_super_admin();