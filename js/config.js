// Website & Booking System Configuration
export const CONFIG = {
  timezone: "America/New_York",
  openDays: [0, 1, 2, 3, 4, 5, 6], // Sun - Sat (7 days / week)
  hours: { start: 7, end: 20 },   // 7:00 AM - 8:00 PM (7:00 - 20:00)
  slotMinutes: 60,                // Granularity of start times (every 60 mins)
  travelBufferMinutes: 30,        // Buffer time required after each job for travel/cleanup
  leadDays: 14,                   // Allow booking up to 14 days in advance
  
  // Westchester County 20-Mile Radius Service ZIP Codes (Center: White Plains 10607)
  zips: [
    "10601", "10603", "10604", "10605", "10606", "10607", // White Plains / Greenburgh
    "10583",                                               // Scarsdale
    "10528", "10577",                                     // Harrison & Purchase
    "10580", "10573",                                     // Rye, Rye Brook & Port Chester
    "10538", "10543",                                     // Larchmont & Mamaroneck
    "10504", "10514",                                     // Armonk & Chappaqua
    "10506", "10536", "10549",                             // Bedford, Katonah & Mount Kisco
    "10570", "10510", "10562",                             // Pleasantville, Briarcliff Manor & Ossining
    "10591", "10533", "10522", "10706",                   // Tarrytown, Irvington, Dobbs Ferry & Hastings
    "10530", "10502", "10523", "10595",                   // Hartsdale, Ardsley, Elmsford & Valhalla
    "10708", "10707", "10709",                             // Bronxville, Tuckahoe & Eastchester
    "10803", "10801", "10804", "10805",                   // Pelham & New Rochelle
    "10701", "10703", "10704", "10705", "10710"            // Yonkers
  ],

  // Handyman Services with Descriptions & Durations (No rigid prices shown)
  services: [
    { 
      id: "tv", 
      name: "TV Mounting & Cable Management", 
      desc: "Flat-screen TV mounting on drywall, brick, or studs with in-wall wire hiding & soundbars.",
      duration: 60, 
      icon: "📺" 
    },
    { 
      id: "furniture", 
      name: "Furniture Assembly", 
      desc: "IKEA, Wayfair, Target & Amazon flat-pack beds, dressers, tables, desks & bookshelves.",
      duration: 60, 
      icon: "🛋️" 
    },
    { 
      id: "drywall", 
      name: "Drywall & Hole Repair", 
      desc: "Wall hole patching, spackling, seam taping, water stain prep, and smooth sanding.",
      duration: 120, 
      icon: "🔨" 
    },
    { 
      id: "painting", 
      name: "Interior Painting & Touch-ups", 
      desc: "Accent walls, room painting, baseboard trim, door refinishing, and dent repair.",
      duration: 120, 
      icon: "🎨" 
    },
    { 
      id: "electrical", 
      name: "Light Fixture & Dimmer Replacement", 
      desc: "Ceiling light fixtures, chandeliers, smart switches, outlets, and ceiling fans.",
      duration: 60, 
      icon: "💡" 
    },
    { 
      id: "plumbing", 
      name: "Faucet, Toilet & Sink Repair", 
      desc: "Bathroom faucet upgrades, leak fixes, toilet valve replacement, and garbage disposals.",
      duration: 60, 
      icon: "🔧" 
    },
    { 
      id: "general", 
      name: "General Handyman Punch-List", 
      desc: "Multi-item repair list: door adjustment, curtain rods, picture hanging & general fixes.",
      duration: 180, 
      icon: "🧰" 
    }
  ]
};
