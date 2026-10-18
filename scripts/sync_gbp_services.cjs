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
const locationId = '1964673381603454408';

const backupData = JSON.parse(fs.readFileSync('scripts/gbp_services_backup.json', 'utf8'));
let serviceItems = [...backupData.serviceItems];

// The 12 discrete services to ensure are present in freeForm:
const servicesToEnsure = [
  {
    displayName: 'Smart Home & Lock Installation',
    description: 'Complete setup of smart door locks, keyless deadbolts, Ring and Nest video doorbells, smart thermostats, and motion cameras. Precise door latch alignment, hardware mortising, and app configuration across Westchester.'
  },
  {
    displayName: 'Handrail & Grab Bar Safety Installation',
    description: 'Secure ADA-compliant grab bar and stair handrail mounting into solid wall studs or heavy-duty hollow-wall anchors. Safety solutions for showers, bathtubs, hallways, and indoor or outdoor stairs.'
  },
  {
    displayName: 'TV Mounting & Wall Hanging',
    description: 'Professional TV wall mounting on drywall, plaster, brick, and above fireplaces. Concealed in-wall cable routing, soundbar mounting, floating shelves, and heavy framed art hanging. Insured, owner-operated service across Westchester County.'
  },
  {
    displayName: 'Furniture Assembly',
    description: 'Expert assembly of flat-pack furniture from IKEA, Wayfair, Pottery Barn, West Elm, and Amazon. Beds, dressers, dining sets, executive desks, outdoor patio sets, and playsets built right with sturdy wall anchors included.'
  },
  {
    displayName: 'Drywall Repair & Patching',
    description: 'Seamless drywall patching for doorknob holes, water damage, electrical cutouts, and stress cracks. Expert joint compound feathering, sanding, and texture matching ready for flawless painting. Clean, dust-controlled workspace.'
  },
  {
    displayName: 'Kitchen Remodeling & Upgrades',
    description: 'Kitchen refreshes including cabinet handle and pull installations, under-cabinet lighting, backsplash tile touch-ups, faucet replacements, garbage disposal hookups, and custom floating shelves.'
  },
  {
    displayName: 'Gutter Cleaning & Guard Maintenance',
    description: 'Complete removal of leaves, sticks, and roof debris from gutters and downspouts. Downspout flush testing, gutter bracket re-securing, and leaf filter guard inspections to prevent water damage.'
  },
  {
    displayName: 'Interior Painting & Touch-Ups',
    description: 'Precision interior painting for bedrooms, living rooms, trim, baseboards, doors, and accent walls. Detailed surface preparation, clean tape lines, and durable premium paint finishes with zero mess left behind.'
  }
];

// Check existing displayNames
const existingNames = new Set();
serviceItems.forEach(item => {
  if (item.freeFormServiceItem && item.freeFormServiceItem.label) {
    existingNames.add(item.freeFormServiceItem.label.displayName.toLowerCase());
  }
});

// Update "Tech" to "Smart Home & Lock Installation" if present
serviceItems.forEach(item => {
  if (item.freeFormServiceItem && item.freeFormServiceItem.label && item.freeFormServiceItem.label.displayName.toLowerCase() === 'tech') {
    item.freeFormServiceItem.label.displayName = 'Smart Home & Lock Installation';
    item.freeFormServiceItem.label.description = 'Complete setup of smart door locks, keyless deadbolts, Ring and Nest video doorbells, smart thermostats, and motion cameras. Precise door latch alignment, hardware mortising, and app configuration across Westchester.';
    existingNames.add('smart home & lock installation');
    console.log('Upgraded "Tech" to "Smart Home & Lock Installation"');
  }
});

// Add remaining services that do not yet exist
servicesToEnsure.forEach(s => {
  if (!existingNames.has(s.displayName.toLowerCase())) {
    serviceItems.push({
      freeFormServiceItem: {
        category: 'categories/gcid:handyman',
        label: {
          displayName: s.displayName,
          description: s.description
        }
      }
    });
    console.log(`Added new service: "${s.displayName}"`);
  } else {
    console.log(`Service "${s.displayName}" already exists or was updated.`);
  }
});

async function applyToGbp() {
  console.log('\nRefreshing Google OAuth token...');
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id, client_secret, refresh_token, grant_type: 'refresh_token' })
  });
  const { access_token } = await tokenRes.json();
  if (!access_token) {
    throw new Error('Could not obtain access token');
  }

  console.log(`Sending PATCH request to update ${serviceItems.length} service items on GBP...`);
  const patchRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/locations/${locationId}?updateMask=serviceItems`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ serviceItems })
  });

  const resData = await patchRes.json();
  if (!patchRes.ok) {
    console.error('PATCH failed:', JSON.stringify(resData, null, 2));
    process.exit(1);
  }

  console.log('✅ GBP Service Items successfully updated in Google Business Profile!');
  console.log('Updated service count:', (resData.serviceItems || []).length);
}

applyToGbp();
