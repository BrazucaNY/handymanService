// Netlify Serverless Function: AI SEO Review Reply Generator for Here Handyman
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { reviewerName, reviewText, town, service } = body;

    const name = reviewerName || 'valued customer';
    const location = town || 'Westchester County, NY';
    const jobService = service || 'home maintenance';

    // Core Westchester SEO Cities for local Google Maps ranking signals
    const westchesterCities = ['White Plains', 'Scarsdale', 'Yonkers', 'Harrison', 'Rye', 'Mamaroneck', 'Tarrytown', 'Dobbs Ferry', 'Eastchester'];
    const selectedCity = westchesterCities.find(c => location.toLowerCase().includes(c.toLowerCase())) || 'Westchester County';

    // Generate high-converting, local SEO optimized 5-star reply templates
    const templates = [
      `Thank you so much for the 5-star review, ${name}! We're thrilled we could help with your ${jobService} project in ${selectedCity}. At Here Handyman, we take pride in delivering prompt, professional, and reliable home repair services throughout Westchester County. We look forward to helping you again soon!`,
      `Hi ${name}, thank you for taking the time to share your experience with Here Handyman! It was a pleasure handling your ${jobService} in ${selectedCity}. Providing top-quality craftsmanship and clear communication is our top priority for every Westchester homeowner. Thanks again!`,
      `Thank you ${name}! We appreciate your business and kind words about our ${jobService} work in ${selectedCity}. Serving our local Westchester County community with reliable 5-star home maintenance is what we love to do. Give us a call anytime for your next project!`,
      `We're so happy to hear you're pleased with your ${jobService} in ${selectedCity}, ${name}! Thank you for choosing Here Handyman for your home repair needs in Westchester County. We're always here whenever you need expert local handyman service!`
    ];

    // Select template deterministically or pseudo-randomly based on name length
    const idx = (name.length + (reviewText ? reviewText.length : 0)) % templates.length;
    const generatedReply = templates[idx];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        reviewerName: name,
        location: selectedCity,
        service: jobService,
        seoReply: generatedReply
      })
    };
  } catch (err) {
    console.error('AI SEO Reply Generation Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
}
