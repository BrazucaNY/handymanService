// Netlify Serverless Function: TypeSafe AI Google Analytics 4 Performance Analyzer
import { TypeSafeClient, choice, noul, score } from '@typesafe-ai/sdk';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (e) {
        // ignore parse error
      }
    }

    let pageViews = requestBody.pageViews || 1450;
    let activeUsers = requestBody.activeUsers || 620;
    let eventCount = requestBody.eventCount || 3100;
    let leadConversions = requestBody.leadConversions || 48;
    let topCity = requestBody.topCity || 'White Plains';
    let topService = requestBody.topService || 'TV Mounting';

    const propertyId = process.env.GA4_PROPERTY_ID;
    const clientEmail = process.env.GA4_CLIENT_EMAIL;
    const privateKey = process.env.GA4_PRIVATE_KEY;

    let ga4ApiUsed = false;

    if (propertyId && clientEmail && privateKey) {
      try {
        const analyticsDataClient = new BetaAnalyticsDataClient({
          credentials: {
            client_email: clientEmail,
            private_key: privateKey.replace(/\\n/g, '\n')
          }
        });

        const [response] = await analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'city' }, { name: 'eventName' }],
          metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }, { name: 'screenPageViews' }]
        });

        if (response && response.rows && response.rows.length > 0) {
          ga4ApiUsed = true;
          let totalUsers = 0;
          let totalViews = 0;
          let totalEvents = 0;
          let cityMap = {};

          response.rows.forEach(row => {
            const cityName = row.dimensionValues?.[0]?.value || 'Westchester';
            const users = parseInt(row.metricValues?.[0]?.value || '0', 10);
            const events = parseInt(row.metricValues?.[1]?.value || '0', 10);
            const views = parseInt(row.metricValues?.[2]?.value || '0', 10);

            totalUsers += users;
            totalEvents += events;
            totalViews += views;

            cityMap[cityName] = (cityMap[cityName] || 0) + users;
          });

          pageViews = totalViews || pageViews;
          activeUsers = totalUsers || activeUsers;
          eventCount = totalEvents || eventCount;

          let topCityMatch = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0];
          if (topCityMatch) {
            topCity = topCityMatch[0];
          }
        }
      } catch (gaError) {
        console.warn('GA4 Data API warning (using fallback/telemetry metrics):', gaError.message);
      }
    }

    const conversionRate = activeUsers > 0 ? ((leadConversions / activeUsers) * 100).toFixed(1) : '7.7';
    let typeSafeUsed = false;
    let trafficHealthCategory = 'High Growth';
    let topTownMatch = topCity;
    let performanceRating = 3;
    let adBoostRecommended = false;

    const apiKey = process.env.TYPESAFE_API_KEY;

    if (apiKey) {
      try {
        const typeSafe = new TypeSafeClient({ apiKey });
        const evalResult = await typeSafe.systemOne({
          state: {
            pageViews,
            activeUsers,
            eventCount,
            leadConversions,
            conversionRate: `${conversionRate}%`,
            topCity,
            topService
          },
          questions: {
            trafficHealth: choice("Classify the overall website traffic health & visitor engagement level", {
              explosive_growth: "High volume of visitors with rapid month-over-month growth",
              steady_local: "Steady local traffic from Westchester County homeowners",
              seasonal_dip: "Moderate traffic with seasonal fluctuations",
              low_traffic: "Low traffic needing urgent SEO and local advertising support"
            }),
            topConversionTown: choice("Identify the primary Westchester County town generating leads", {
              white_plains: "White Plains, NY",
              scarsdale: "Scarsdale, NY",
              yonkers: "Yonkers, NY",
              harrison: "Harrison, NY",
              rye: "Rye, NY",
              mamaroneck: "Mamaroneck, NY",
              tarrytown: "Tarrytown, NY",
              dobbs_ferry: "Dobbs Ferry, NY",
              eastchester: "Eastchester, NY",
              westchester: "General Westchester County"
            }),
            performanceScore: score("Rate overall website conversion rate and lead capture performance on scale 1-3", {
              1: "Low conversion rate below 3%",
              2: "Good conversion rate between 3% and 7%",
              3: "Excellent conversion rate above 7%"
            }),
            requiresAdBoost: noul("Does current traffic suggest launching targeted Google Ads boost for Westchester towns?")
          }
        });

        if (evalResult && evalResult.answers) {
          typeSafeUsed = true;

          const healthMap = {
            explosive_growth: 'Explosive Growth',
            steady_local: 'Steady Westchester Traffic',
            seasonal_dip: 'Seasonal Dip',
            low_traffic: 'Requires SEO Boost'
          };
          if (evalResult.answers.trafficHealth?.choice) {
            trafficHealthCategory = healthMap[evalResult.answers.trafficHealth.choice] || trafficHealthCategory;
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
          if (evalResult.answers.topConversionTown?.choice) {
            topTownMatch = townMap[evalResult.answers.topConversionTown.choice] || topTownMatch;
          }

          if (evalResult.answers.performanceScore?.score) {
            performanceRating = Math.round(evalResult.answers.performanceScore.score);
          }

          if (evalResult.answers.requiresAdBoost?.probability) {
            adBoostRecommended = evalResult.answers.requiresAdBoost.probability > 0.5;
          }
        }
      } catch (tsErr) {
        console.warn('TypeSafe GA Analysis evaluation note:', tsErr.message);
      }
    }

    const aiSummaryText = `Here Handyman Analytics Insights: Website traffic is showing ${trafficHealthCategory} with an estimated ${conversionRate}% lead conversion rate across Westchester County. Top performing town: ${topTownMatch} (${topService} services). ${adBoostRecommended ? 'Recommendation: Consider launching targeted local Google Ads for high-demand towns like ' + topTownMatch + '.' : 'Recommendation: Maintain current local SEO strategy and Google Business Profile engagement.'}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        typeSafePowered: typeSafeUsed,
        ga4ApiConnected: ga4ApiUsed,
        metrics: {
          pageViews,
          activeUsers,
          eventCount,
          leadConversions,
          conversionRate: `${conversionRate}%`,
          topTown: topTownMatch,
          topService
        },
        analysis: {
          trafficHealth: trafficHealthCategory,
          performanceRating,
          adBoostRecommended,
          aiSummary: aiSummaryText
        }
      })
    };
  } catch (err) {
    console.error('Analytics AI Summary Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
}
