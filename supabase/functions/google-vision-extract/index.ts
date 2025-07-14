/**
 * Google Vision API PDF/Image Text Extraction
 * Uses the GOOGLE_VISION_API_KEY for Google Vision OCR
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
    // Get the Google Vision API key from environment
    // Try multiple possible environment variable names
    const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY') || 
                   Deno.env.get('GOOGLEMAPS_API') || 
                   Deno.env.get('GOOGLE_CLOUD_API_KEY');
    
    if (!apiKey) {
      throw new Error('Google Vision API key not configured - please set GOOGLE_VISION_API_KEY environment variable');
    }

    // Parse request body
    const { imageData, fileName } = await req.json();
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

    console.log(`Processing document: ${fileName} with Google Vision API`);

    // Clean and prepare image data
    let cleanImageData = imageData;
    if (typeof imageData === 'string' && imageData.includes(',')) {
      // Remove data:image/... prefix if present
      cleanImageData = imageData.split(',')[1];
    }

    console.log(`Image data length: ${cleanImageData.length} characters`);

    // Call Google Vision API for OCR
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: cleanImageData
            },
            features: [{
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            }]
          }]
        })
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Google Vision API error:', errorText);
      throw new Error(`Google Vision API error: ${visionResponse.status}`);
    }

    const visionData = await visionResponse.json();
    console.log('Google Vision API response received');

    // Extract text from response
    const annotations = visionData.responses?.[0]?.textAnnotations;
    const extractedText = annotations?.[0]?.description || '';

    if (!extractedText) {
      console.warn('No text extracted from document');
    }

    // Calculate confidence and processing metadata
    const confidence = annotations?.[0]?.confidence || 0.85;
    const processingTime = Date.now();

    const result = {
      extractedText,
      confidence,
      processingMethod: 'google-vision',
      processingTime,
      wordCount: extractedText.split(' ').length,
      fileName
    };

    console.log(`Successfully extracted ${result.wordCount} words from ${fileName}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Google Vision extraction failed:', error);
    
    const errorResponse = {
      error: {
        code: 'VISION_EXTRACTION_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});