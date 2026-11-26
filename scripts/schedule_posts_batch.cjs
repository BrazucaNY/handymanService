const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && line.includes('=')) {
    const idx = line.indexOf('=');
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
});

const client_id = env.GOOGLE_CLIENT_ID;
const client_secret = env.GOOGLE_CLIENT_SECRET;
const refresh_token = env.GOOGLE_OAUTH_REFRESH_TOKEN;
const accountId = "107235988987982670835";
const locationId = "1964673381603454408";

async function getAccessToken() {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id,
      client_secret,
      refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

const postsToSchedule = [
  {
    postNum: 2,
    scheduledTime: "2026-12-03T14:00:00Z", // Thursday, Dec 3, 9:00 AM EST
    summary: `Your to-do list does not need five separate appointments.

TV bracket, sticking door, loose shelf, cracked caulk, a mirror that never got hung: most small repairs can be grouped into one visit. That saves you time, saves a second trip, and usually costs less than booking each job separately.

How to get it quoted:
- List each task separately
- Send one wide photo plus a close-up of each issue
- Add measurements and product links where you have them

You will get a flat-rate quote for the agreed list, with materials and exclusions in writing.

Here Handyman serves White Plains, Scarsdale, Rye, and communities across Westchester County. One visit, one point of contact, no call center.

⭐ 5.0 ★ Top-Rated Westchester Handyman Service
Tap Book below to send your repair list!

#WhitePlainsNY #WestchesterHandyman #HomeRepairs #HereHandyman #SmallRepairs`,
    actionType: "BOOK",
    url: "https://www.herehandyman.com/book?utm_source=google&utm_medium=gbp&utm_campaign=post-w01-repair-list",
    imageUrl: "https://raw.githubusercontent.com/BrazucaNY/handymanService/main/assets/images/gbp_temp_post_2.jpg"
  },
  {
    postNum: 3,
    scheduledTime: "2026-12-07T14:00:00Z", // Monday, Dec 7, 9:00 AM EST
    summary: `A TV mount is only as safe as the wall behind it.

Before drilling, a proper install checks the wall material, finds the studs or the right anchor, confirms the bracket matches the TV size and weight, and levels the screen at the height you actually watch from.

Drywall, plaster, brick, and tile all need different hardware. Using the anchors that came in the box without checking the wall is how TVs end up on the floor.

Send a photo of the wall, your TV size, and the mount model. You will get a clear scope and flat price, including whether in-wall cable routing is possible. Electrical work is referred to a licensed electrician.

Here Handyman: TV mounting in White Plains, Scarsdale, Rye, and Westchester County.

⭐ 5.0 ★ Rated Precision Mounting
Tap Book below to schedule!

#TVMounting #WhitePlainsNY #WestchesterHandyman #CableManagement #HereHandyman`,
    actionType: "BOOK",
    url: "https://www.herehandyman.com/tv-mounting?utm_source=google&utm_medium=gbp&utm_campaign=post-w02-tv-mounting",
    imageUrl: "https://raw.githubusercontent.com/BrazucaNY/handymanService/main/assets/images/gbp_temp_post_3.jpg"
  },
  {
    postNum: 4,
    scheduledTime: "2026-12-10T14:00:00Z", // Thursday, Dec 10, 9:00 AM EST
    summary: `Furniture assembly looks simple until box three.

Missing hardware, backwards panels, and a wardrobe that wobbles because it was never anchored. Tall furniture should be secured to the wall when the manufacturer recommends it and the wall allows it.

Here Handyman assembles beds, dressers, desks, tables, cabinets, entertainment centers, IKEA and Wayfair pieces, and selected outdoor furniture. Customer-supplied items welcome. Have the instructions and all boxes ready.

The quote depends on the product, number of boxes, and whether wall anchoring is needed. Send product links or photos before the visit.

Serving White Plains, Scarsdale, Bedford, and Westchester County. Owner-operated, insured, and tidy.

⭐ 5.0 ★ Verified Customer Reviews
Tap Book below to send your furniture list!

#FurnitureAssembly #WhitePlainsNY #BedfordNY #IKEAAssembly #HereHandyman`,
    actionType: "BOOK",
    url: "https://www.herehandyman.com/furniture-assembly?utm_source=google&utm_medium=gbp&utm_campaign=post-w02-furniture",
    imageUrl: "https://raw.githubusercontent.com/BrazucaNY/handymanService/main/assets/images/gbp_temp_post_4.jpg"
  },
  {
    postNum: 5,
    scheduledTime: "2026-12-14T14:00:00Z", // Monday, Dec 14, 9:00 AM EST
    summary: `Small drywall damage rarely stays small.

A doorknob hole, a cracked corner, or a bad patch from the last repair can spread once moisture or settlement gets involved. Proper repair means backing, the right compound, tape, sanding, primer, and a finish that matches the wall.

What affects the price:
- Size and location of the damage
- Ceiling height and access
- Wall texture and paint match
- Number of coats and drying time
- Whether painting is included

Water damage should be fixed at the source first. Replacing drywall will not stop an active leak.

Send wide and close-up photos with approximate measurements for a flat-rate quote. Here Handyman serves White Plains, Scarsdale, Chappaqua, and all Westchester County.

⭐ 5.0 ★ Seamless Wall & Ceiling Restoration
Tap Book below to get started!

#DrywallRepair #WhitePlainsNY #ScarsdaleNY #WestchesterHandyman #HereHandyman`,
    actionType: "BOOK",
    url: "https://www.herehandyman.com/drywall-repair?utm_source=google&utm_medium=gbp&utm_campaign=post-w03-drywall",
    imageUrl: "https://raw.githubusercontent.com/BrazucaNY/handymanService/main/assets/images/gbp_temp_post_5.jpg"
  },
  {
    postNum: 6,
    scheduledTime: "2026-12-17T14:00:00Z", // Thursday, Dec 17, 9:00 AM EST
    summary: `Cracked caulk around a tub or sink is an invitation for moisture.

The fix is not a fresh bead over the old one. It means removing the failed caulk, cleaning and drying the joint, using a bathroom- or kitchen-rated sealant, and letting it cure before water hits it again.

Recaulking is not a repair for failed grout, loose tile, or an active leak. Those need to be addressed first.

Spots worth checking this week:
- Tub and shower edges
- Sink and countertop seams
- Backsplash joints
- Around the kitchen sink

Send photos of the joints for a flat-rate quote. Here Handyman serves White Plains, Scarsdale, Rye, and Westchester County.

⭐ 5.0 ★ Precision Craftsmanship & Clean Finishes
Tap Book below to schedule a caulking visit!

#CaulkingService #BathroomMaintenance #WhitePlainsNY #WestchesterHandyman #HereHandyman`,
    actionType: "BOOK",
    url: "https://www.herehandyman.com/book?utm_source=google&utm_medium=gbp&utm_campaign=post-w03-caulking",
    imageUrl: "https://raw.githubusercontent.com/BrazucaNY/handymanService/main/assets/images/gbp_temp_post_6.jpg"
  }
];

async function main() {
  const token = await getAccessToken();
  const listUrl = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`;

  for (const p of postsToSchedule) {
    console.log(`Scheduling Post #${p.postNum} for ${p.scheduledTime}...`);
    const payload = {
      languageCode: "en-US",
      summary: p.summary,
      topicType: "STANDARD",
      scheduledTime: p.scheduledTime,
      callToAction: {
        actionType: p.actionType,
        url: p.url
      },
      media: [
        {
          mediaFormat: "PHOTO",
          sourceUrl: p.imageUrl
        }
      ]
    };

    const res = await fetch(listUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.status === 200) {
      console.log(`✅ [HTTP 200] Post #${p.postNum} scheduled successfully. ID: ${data.name.split('/').pop()}`);
    } else {
      console.log(`❌ [HTTP ${res.status}] Failed Post #${p.postNum}:`, JSON.stringify(data, null, 2));
    }
  }
}

main().catch(console.error);
