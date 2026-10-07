// Website & Booking System Configuration
export const CONFIG = {
  timezone: "America/New_York",
  openDays: [0, 1, 2, 3, 4, 5, 6], // Sun - Sat (7 days / week)
  hours: { start: 7, end: 20 },   // 7:00 AM - 8:00 PM (7:00 - 20:00)
  slotMinutes: 60,                // Granularity of start times (every 60 mins)
  travelBufferMinutes: 30,        // Buffer time required after each job for travel/cleanup
  leadDays: 60,                   // Allow booking up to 60 days (2 months) in advance
  
  // Westchester County + NYC Boroughs Service ZIP Codes (Center: White Plains 10607)
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
    "10701", "10703", "10704", "10705", "10710",            // Yonkers
    // NYC Boroughs (booking only - not advertised on website)
    "10001", "10002", "10003", "10004", "10005", "10006", "10007", "10008", "10009", "10010", "10011", "10012", "10013", "10014", "10015", "10016", "10017", "10018", "10019", "10020", "10021", "10022", "10023", "10024", "10025", "10026", "10027", "10028", "10029", "10030", "10031", "10032", "10033", "10034", "10035", "10036", "10037", "10038", "10039", "10040", "10041", "10042", "10043", "10044", "10045", // Manhattan
    "11201", "11203", "11204", "11205", "11206", "11207", "11208", "11209", "11210", "11211", "11212", "11213", "11214", "11215", "11216", "11217", "11218", "11219", "11220", "11221", "11222", "11223", "11224", "11225", "11226", "11227", "11228", "11229", "11230", "11231", "11232", "11233", "11234", "11235", "11236", "11237", "11238", "11239", "11240", "11241", "11242", "11243", "11244", "11245", "11246", "11247", "11248", "11249", "11250", "11251", "11252", "11253", "11254", "11255", "11256", // Brooklyn
    "11354", "11355", "11356", "11357", "11358", "11359", "11360", "11361", "11362", "11363", "11364", "11365", "11366", "11367", "11368", "11369", "11370", "11371", "11372", "11373", "11374", "11375", "11376", "11377", "11378", "11379", "11380", "11381", "11382", "11383", "11384", "11385", "11386", "11387", "11388", "11390", "11394", "11395", "11396", "11397", "11398", "11399", // Queens
    "10451", "10452", "10453", "10454", "10455", "10456", "10457", "10458", "10459", "10460", "10461", "10462", "10463", "10464", "10465", "10466", "10467", "10468", "10469", "10470", "10471", "10472", "10473", "10474", "10475", // Bronx
    "10301", "10302", "10303", "10304", "10305", "10306", "10307", "10308", "10309", "10310", "10311", "10312", "10313", "10314" // Staten Island
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
