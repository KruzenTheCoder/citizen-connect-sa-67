-- Create a function to setup the admin user directly
CREATE OR REPLACE FUNCTION public.setup_admin_user()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id uuid;
    municipality_id uuid;
    result jsonb;
BEGIN
    -- Get the Johannesburg municipality ID
    SELECT id INTO municipality_id 
    FROM public.municipalities 
    WHERE code = 'JHB';
    
    IF municipality_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Municipality not found');
    END IF;
    
    -- Generate a UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert the admin user profile directly
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role, 
        is_verified, 
        municipality_id
    ) VALUES (
        admin_user_id,
        'admin@joburg.org.za',
        'Johannesburg Municipality Admin',
        'municipality_admin',
        true,
        municipality_id
    )
    ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        is_verified = EXCLUDED.is_verified,
        municipality_id = EXCLUDED.municipality_id,
        updated_at = now();
    
    RETURN jsonb_build_object(
        'success', true, 
        'user_id', admin_user_id,
        'municipality_id', municipality_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;