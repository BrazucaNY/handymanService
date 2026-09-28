// Netlify Serverless Function: TypeSafe AI SEO Review Reply Generator for Here Handyman
import { TypeSafeClient, choice, noul, score } from '@typesafe-ai/sdk';

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
    const rawReview = reviewText || '';

    let selectedCity = town || 'Westchester County';
    let jobService = service || 'home maintenance';
    let isUrgentFollowup = false;
    let sentimentScore = 3;
    let typeSafeUsed = false;

    // Check if TypeSafe API Key is set in environment
    const apiKey = process.env.TYPESAFE_API_KEY;

    if (apiKey && rawReview) {
      try {
        const client = new TypeSafeClient({ apiKey });
        const evalResult = await client.systemOne({
          state: {
            reviewerName: name,
            reviewText: rawReview,
            providedTown: town || '',
            providedService: service || ''
          },
          questions: {
            serviceType: choice("What category of handyman work is discussed in this review?", {
              tv_mounting: "TV mounting, bracket installation, cable concealment, soundbars",
              furniture_assembly: "IKEA, Wayfair, desk, bed, table, or flat-pack assembly",
              drywall_painting: "Drywall patching, hole repair, interior wall painting",
              plumbing_electrical: "Light fixtures, ceiling fans, outlets, faucets, toilets",
              general_repairs: "Doors, locks, gutters, power washing, general home repair"
            }),
            townLocation: choice("Which Westchester County town or city is mentioned or implied?", {
              white_plains: "White Plains, NY",
              scarsdale: "Scarsdale, NY",
              yonkers: "Yonkers, NY",
              harrison: "Harrison, NY",
              rye: "Rye, NY",
              mamaroneck: "Mamaroneck, NY",
              tarrytown: "Tarrytown, NY",
              dobbs_ferry: "Dobbs Ferry, NY",
              eastchester: "Eastchester, NY",
              westchester: "Westchester County, NY"
            }),
            sentimentLevel: score("Rate the overall customer satisfaction level in the review", {
              1: "Negative experience or complaint",
              2: "Neutral or average experience",
              3: "Highly positive 5-star experience"
            }),
            requiresUrgentFollowup: noul("Does this review ask for immediate contact or report an unresolved issue?")
          }
        });

        if (evalResult && evalResult.answers) {
          typeSafeUsed = true;

          const serviceMap = {
            tv_mounting: 'TV Mounting & Cable Hiding',
            furniture_assembly: 'Furniture Assembly',
            drywall_painting: 'Drywall Repair & Painting',
            plumbing_electrical: 'Electrical & Plumbing Fixture',
            general_repairs: 'General Home Repair'
          };
          if (evalResult.answers.serviceType?.choice) {
            jobService = serviceMap[evalResult.answers.serviceType.choice] || jobService;
          }

          const townMap = {
            white_plains: 'White Plains',
            scarsdale: 'Scarsdale',
            yonkers: 'Yonkers',
            harrison: 'Harrison',
            rye: 'Rye',
            mamaroneck: 'Mamaroneck',
            tarrytown: 'Tarrytown',
            dobbs_ferry: 'Dobbs Ferry',
            eastchester: 'Eastchester',
            westchester: 'Westchester County'
          };
          if (evalResult.answers.townLocation?.choice) {
            selectedCity = townMap[evalResult.answers.townLocation.choice] || selectedCity;
          }

          if (evalResult.answers.sentimentLevel?.score) {
            sentimentScore = Math.round(evalResult.answers.sentimentLevel.score);
          }

          if (evalResult.answers.requiresUrgentFollowup?.probability) {
            isUrgentFollowup = evalResult.answers.requiresUrgentFollowup.probability > 0.6;
          }
        }
      } catch (tsErr) {
        console.warn('TypeSafe AI evaluation note:', tsErr.message);
      }
    }

    if (!typeSafeUsed && town) {
      const westchesterCities = ['White Plains', 'Scarsdale', 'Yonkers', 'Harrison', 'Rye', 'Mamaroneck', 'Tarrytown', 'Dobbs Ferry', 'Eastchester'];
      selectedCity = westchesterCities.find(c => town.toLowerCase().includes(c.toLowerCase())) || 'Westchester County';
    }

    let generatedReply = "";

    if (sentimentScore <= 1) {
      generatedReply = `Hi ${name}, thank you for your feedback. We always aim for 100% customer satisfaction for every ${jobService} job in ${selectedCity}. Please contact owner David directly at (516) 350-0801 so we can make this right immediately!`;
    } else if (isUrgentFollowup) {
      generatedReply = `Thank you ${name}! We received your message regarding your ${jobService} in ${selectedCity}. David will reach out to you directly, or feel free to call/text us at (516) 350-0801 for immediate service!`;
    } else {
      const templates = [
        `Thank you so much for the 5-star review, ${name}! We're thrilled we could help with your ${jobService} project in ${selectedCity}. At Here Handyman, we take pride in delivering prompt, professional, and reliable home repair services throughout Westchester County. We look forward to helping you again soon!`,
        `Hi ${name}, thank you for taking the time to share your experience with Here Handyman! It was a pleasure handling your ${jobService} in ${selectedCity}. Providing top-quality craftsmanship and clear communication is our top priority for every Westchester homeowner. Thanks again!`,
        `Thank you ${name}! We appreciate your business and kind words about our ${jobService} work in ${selectedCity}. Serving our local Westchester County community with reliable 5-star home maintenance is what we love to do. Give us a call anytime for your next project!`,
        `We're so happy to hear you're pleased with your ${jobService} in ${selectedCity}, ${name}! Thank you for choosing Here Handyman for your home repair needs in Westchester County. We're always here whenever you need expert local handyman service!`
      ];

      const idx = (name.length + (rawReview ? rawReview.length : 0)) % templates.length;
      generatedReply = templates[idx];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        typeSafePowered: typeSafeUsed,
        reviewerName: name,
        location: selectedCity,
        service: jobService,
        sentimentScore: sentimentScore,
        isUrgentFollowup: isUrgentFollowup,
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
