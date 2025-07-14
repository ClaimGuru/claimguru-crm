/**
 * Google Vision API PDF/Image Text Extraction
 * Uses the GOOGLEMAPS_API key for Google Vision OCR
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get the Google API key from environment
    const apiKey = Deno.env.get('GOOGLEMAPS_API');
    
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    // Parse request body
    const { imageData, fileName } = await req.json();
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

    console.log(`Processing document: ${fileName}`);

    // Call Google Vision API
    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageData
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      })
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Google Vision API error:', errorText);
      throw new Error(`Google Vision API error: ${visionResponse.status}`);
    }

    const visionResult = await visionResponse.json();
    const annotation = visionResult.responses[0]?.fullTextAnnotation;
    
    if (!annotation || !annotation.text) {
      console.warn('No text detected in document');
      return new Response(JSON.stringify({
        text: '',
        confidence: 0,
        error: 'No text detected in document'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate confidence based on detection quality
    const confidence = annotation.pages?.[0]?.confidence || 0.9;
    
    console.log(`Text extraction successful. Length: ${annotation.text.length} characters`);
    
    // Return successful response
    return new Response(JSON.stringify({
      text: annotation.text,
      confidence: confidence,
      wordCount: annotation.text.split(/\s+/).length,
      characterCount: annotation.text.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Google Vision extraction failed:', error);
    
    // Return error response
    return new Response(JSON.stringify({
      error: {
        code: 'VISION_EXTRACTION_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});