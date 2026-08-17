exports.handler = async function(event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { image, mimeType } = JSON.parse(event.body);

    if (!image || !mimeType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing image data or mimeType' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error: Missing API Key' })
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = 'You are a receipt parser for a handyman business. Extract data from this receipt image and return ONLY valid JSON with these fields: vendor (string), receipt_date (YYYY-MM-DD format or null), receipt_number (string or null), total (number), tax (number or null), payment_method (string or null), items (array of {name: string, price: number} or empty array), suggested_category (must be exactly one of: Materials, Tools, Plumbing, Electrical, Painting, Hardware, Lumber, Vehicle, Office, Advertising, Equipment, Other), notes (string or null). Return ONLY the JSON object, no markdown, no explanation.';

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: image
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('No valid response from Gemini');
    }

    // Clean up potential markdown formatting if Gemini ignored instructions
    let jsonString = candidateText.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7, -3).trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3, -3).trim();
    }

    const parsedData = JSON.parse(jsonString);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsedData)
    };
  } catch (error) {
    console.error('Error processing receipt:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
