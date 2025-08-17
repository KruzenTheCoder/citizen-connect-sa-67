import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password } = await req.json()

    if (email !== 'admin@joburg.org.za' || password !== 'admin123') {
      return new Response(
        JSON.stringify({ error: 'Invalid admin credentials' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Setting up admin user...')

    // Check if user already exists in auth
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(user => user.email === email)

    let userId: string

    if (existingUser) {
      console.log('Admin user already exists in auth')
      userId = existingUser.id
    } else {
      // Create the admin user in auth
      console.log('Creating admin user in auth...')
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Skip email confirmation
      })

      if (createError) {
        console.error('Error creating admin user:', createError)
        throw createError
      }

      userId = newUser.user.id
      console.log('Admin user created successfully')
    }

    // Get the Johannesburg municipality ID
    const { data: municipality, error: municipalityError } = await supabaseClient
      .from('municipalities')
      .select('id')
      .eq('code', 'JHB')
      .single()

    if (municipalityError || !municipality) {
      throw new Error('Municipality not found')
    }

    // Create or update the profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: 'Johannesburg Municipality Admin',
        role: 'municipality_admin',
        is_verified: true,
        municipality_id: municipality.id
      })

    if (profileError) {
      console.error('Error creating/updating profile:', profileError)
      throw profileError
    }

    console.log('Admin profile created/updated successfully')

    return new Response(
      JSON.stringify({ success: true, message: 'Admin user setup complete' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Setup admin error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to setup admin user' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})