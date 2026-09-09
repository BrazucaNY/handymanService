// Website & Booking System Configuration
export const CONFIG = {
  timezone: "America/New_York",
  openDays: [0, 1, 2, 3, 4, 5, 6], // Sun - Sat (7 days / week)
  hours: { start: 7, end: 20 },   // 7:00 AM - 8:00 PM (7:00 - 20:00)
  slotMinutes: 60,                // Granularity of start times (every 60 mins)
  travelBufferMinutes: 30,        // Buffer time required after each job for travel/cleanup
  leadDays: 14,                   // Allow booking up to 14 days in advance
  
  // Westchester County Service ZIP Codes
  zips: [
    "10601", "10603", "10604", "10605", "10606", "10607", // White Plains
    "10583",                                               // Scarsdale
    "10701", "10703", "10704", "10705", "10710",           // Yonkers
    "10591",                                               // Tarrytown
    "10530",                                               // Hartsdale
    "10528",                                               // Harrison
    "10801", "10804", "10805",                             // New Rochelle
    "10522",                                               // Dobbs Ferry
    "10502",                                               // Ardsley
    "10708"                                                // Bronxville
  ],

  // Handyman Services & Job Durations
  services: [
    { id: "tv", name: "TV Mounting & Cable Management", duration: 60, price: "From $99", icon: "📺" },
    { id: "furniture", name: "Furniture Assembly (IKEA, Wayfair)", duration: 60, price: "From $85", icon: "🛋️" },
    { id: "drywall", name: "Drywall & Hole Repair", duration: 120, price: "From $150", icon: "🔨" },
    { id: "painting", name: "Interior Painting & Patching", duration: 120, price: "From $175", icon: "🎨" },
    { id: "electrical", name: "Light Fixture & Dimmer Replacement", duration: 60, price: "From $95", icon: "💡" },
    { id: "plumbing", name: "Faucet, Toilet & Sink Repair", duration: 60, price: "From $95", icon: "🔧" },
    { id: "general", name: "General Handyman Punch-List", duration: 180, price: "From $180", icon: "🧰" }
  ]
};
