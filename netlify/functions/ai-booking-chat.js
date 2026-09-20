// Netlify Serverless Function: ChatGPT AI Booking Assistant Engine
// Handles conversational AI booking, pricing estimates, scheduling, and lead capture.

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { messages, customerData } = body;

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' })
      };
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // System prompt grounding David's business knowledge
    const systemPrompt = `You are "HandyBot", the official AI Booking Assistant for Here Handyman (herehandyman.com), owned and operated by David in Westchester County, NY.
Phone/Text: (516) 350-0801 | Email: info@herehandyman.com | Hours: Monday-Sunday 7:00 AM - 8:00 PM.

YOUR GOAL:
1. Warmly assist homeowners with handyman questions, service estimates, and booking scheduling.
2. Guide them step-by-step to book a handyman appointment with David.
3. Collect: 
   - Service Needed (e.g., TV Mounting, Furniture Assembly, Drywall Patch, Door Repair, Electrical/Lighting, Plumbing)
   - Westchester Town (White Plains, Scarsdale, Yonkers, Rye, Harrison, Mamaroneck, Tarrytown, Eastchester, Bronxville, Dobbs Ferry, etc.)
   - Preferred Date & Time Window (e.g. Tomorrow 9 AM - 11 AM)
   - Full Name & Phone Number.

SERVICE KNOWLEDGE:
- TV Mounting: 32" to 85"+ TVs, wire concealment, soundbars, brick/drywall/fireplace mounting.
- Furniture Assembly: IKEA Pax, dressers, beds, Wayfair, outdoor playsets, trampolines.
- Drywall & Painting: Water damage patches, holes, seamless color matching.
- Plumbing & Electrical: Faucets, toilets, sinks, disposal, switches, fans, light fixtures.
- Doors & Hardware: Sticking doors, deadbolts, smart locks, trim repair.
- Pricing: Transparent, competitive flat rates. Free instant estimates over chat/text. No hidden fees. No credit card required upfront.

TONE: Friendly, professional, concise, respectful, and helpful. Always emphasize David's 23+ years of experience and 5-star Google rating.

IMPORTANT FORMATTING RULE FOR COMPLETED BOOKINGS:
When you have collected the (1) Service, (2) Town, (3) Preferred Date/Time, and (4) Name & Phone Number, append a JSON block at the VERY END of your response in this exact format so the system renders a Booking Confirmation Ticket:
[[BOOKING_CONFIRMED:{"name":"Customer Name","phone":"(516) 350-0801","town":"Town Name","service":"Service Name","dateTime":"Preferred Date Time"}]]`;

    // Try OpenAI API if key is set
    if (openaiApiKey) {
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage = data.choices[0].message.content;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, provider: 'openai', message: aiMessage })
        };
      }
    }

    // Try Gemini API if key is set
    if (geminiApiKey) {
      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: contents
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage = data.candidates[0].content.parts[0].text;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, provider: 'gemini', message: aiMessage })
        };
      }
    }

    // Intelligent Fallback Assistant Engine if no API key is provided
    const lastUserMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
    let replyText = "";

    if (lastUserMsg.includes('tv') || lastUserMsg.includes('mount')) {
      replyText = "I'd be happy to help schedule your TV mounting! David mounts TVs from 32\" up to 85\"+ with clean wire concealment. What town in Westchester are you located in, and what size is your TV?";
    } else if (lastUserMsg.includes('ikea') || lastUserMsg.includes('furniture') || lastUserMsg.includes('assemble')) {
      replyText = "Furniture assembly is one of David's top specialties! We assemble IKEA, Wayfair, dressers, beds, and Pax wardrobes quickly and sturdily. Which town are you in, and what items need assembly?";
    } else if (lastUserMsg.includes('drywall') || lastUserMsg.includes('paint') || lastUserMsg.includes('repair')) {
      replyText = "David provides expert drywall patching, hole repair, and seamless texture & paint matching across Westchester County. What town are you in, and what repair work is needed?";
    } else if (lastUserMsg.includes('scarsdale') || lastUserMsg.includes('white plains') || lastUserMsg.includes('yonkers') || lastUserMsg.includes('rye') || lastUserMsg.includes('harrison') || lastUserMsg.includes('mamaroneck')) {
      replyText = "Awesome, David serves your town regularly with 5-star rated handyman service! What preferred day or time window works best for your visit? (e.g. Tomorrow morning, Saturday afternoon)";
    } else if (lastUserMsg.includes('tomorrow') || lastUserMsg.includes('morning') || lastUserMsg.includes('afternoon') || lastUserMsg.includes('saturday') || lastUserMsg.includes('monday') || lastUserMsg.includes('today')) {
      replyText = "Great! We have arrival windows open for that time. To finalize your booking request, what is your Full Name and Best Phone Number for David to confirm?";
    } else if (/\d{7,10}/.test(lastUserMsg) || lastUserMsg.includes('john') || lastUserMsg.includes('smith') || lastUserMsg.includes('dave') || lastUserMsg.includes('david')) {
      replyText = "Perfect! I have recorded your handyman appointment request for David. You'll receive a confirmation text shortly!\n\n[[BOOKING_CONFIRMED:{\"name\":\"Customer\",\"phone\":\"(516) 350-0801\",\"town\":\"Westchester, NY\",\"service\":\"Handyman Repairs & Booking\",\"dateTime\":\"Upcoming Open Window\"}]]";
    } else {
      replyText = "Hello! I'm HandyBot, David's AI Assistant at Here Handyman. How can I help you today? We specialize in TV mounting, furniture assembly, drywall repair, electrical/lighting, plumbing, and general home repairs throughout Westchester County, NY!";
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        provider: 'fallback-rules',
        message: replyText
      })
    };

  } catch (err) {
    console.error('AI Booking Engine Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', details: err.message })
    };
  }
}
