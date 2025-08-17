import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceReportRequest {
  transcript: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript }: VoiceReportRequest = await req.json();

    if (!transcript) {
      throw new Error('No transcript provided');
    }

    // You'll need to add OPENAI_API_KEY in Supabase Edge Functions secrets
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing transcript:', transcript);

    // Call OpenAI to analyze the voice report
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes citizen incident reports for South African municipalities. 
            
Extract and classify the following from the speech transcript:
1. Title: A clear, concise title (max 100 chars)
2. Description: A detailed description of the incident
3. Type: Classify as one of: water, electricity, roads, waste, other
4. Priority: Classify as: low, medium, high, critical

Consider these factors for priority:
- Critical: Safety hazards, major infrastructure failures, emergencies
- High: Service disruptions affecting many people
- Medium: Standard maintenance issues
- Low: Minor cosmetic or non-urgent issues

Respond ONLY with a valid JSON object in this exact format:
{
  "title": "Brief incident title",
  "description": "Detailed description of the incident",
  "type": "water|electricity|roads|waste|other",
  "priority": "low|medium|high|critical"
}`
          },
          {
            role: 'user',
            content: `Please analyze this incident report: "${transcript}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI response:', content);

    // Parse the JSON response
    let parsedReport;
    try {
      parsedReport = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from AI');
    }

    // Validate the response structure
    const requiredFields = ['title', 'description', 'type', 'priority'];
    for (const field of requiredFields) {
      if (!parsedReport[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate enum values
    const validTypes = ['water', 'electricity', 'roads', 'waste', 'other'];
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    if (!validTypes.includes(parsedReport.type)) {
      parsedReport.type = 'other';
    }

    if (!validPriorities.includes(parsedReport.priority)) {
      parsedReport.priority = 'medium';
    }

    console.log('Processed report:', parsedReport);

    return new Response(JSON.stringify(parsedReport), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in process-voice-report function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to process voice report'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);