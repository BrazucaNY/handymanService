import os
import re
import json

TOWNS = {
    'white-plains': {
        'name': 'White Plains',
        'zip': '10601',
        'lat': '41.033986',
        'lng': '-73.76291',
        'neighborhoods': 'City Center, Highlands, Battle Hill, Gedney Farms, and Ridgeway',
        'housing_desc': 'From luxury high-rise condominium towers along Mamaroneck Avenue and Renaissance Square to mid-century ranches in Gedney Farms and pre-war homes in Battle Hill',
        'building_quirks': 'high-rise steel stud framing, strict management COI requirements, freight elevator reservation hours, and concrete demising walls',
        'why_choose': [
            'COI & Condo Board Ready: We provide expedited Certificates of Insurance naming your management board.',
            'High-Rise & Steel Stud Expertise: Specialized commercial toggle anchors designed for metal framing.',
            'Punctual & Elevator-Timed: We strictly respect reserved loading dock and freight elevator windows.',
            'Quiet & Low-Dust Practices: HEPA-filtered tools to protect sensitive high-rise smoke detectors.'
        ]
    },
    'yonkers': {
        'name': 'Yonkers',
        'zip': '10701',
        'lat': '40.9312',
        'lng': '-73.8987',
        'neighborhoods': 'Crestwood, Park Hill, Ludlow, Getty Square, and Lincoln Park',
        'housing_desc': 'From historic Victorian and multi-family residences in Crestwood and Park Hill to pre-war apartment buildings in Ludlow and modern Hudson River waterfront complexes',
        'building_quirks': 'historic horsehair plaster over wood lath, narrow multi-story staircases, vintage radiator heating, and masonry partition walls',
        'why_choose': [
            'Historic Plaster Specialists: Gentle drilling and toggle clamping that prevents plaster cracking.',
            'Multi-Family & Pre-War Savvy: Experienced navigating narrow staircases and vintage floor layouts.',
            'Waterfront Condo Compliant: Full insurance coverage for luxury towers along the Yonkers waterfront.',
            'Owner-Operated Care: David personally performs every repair with craftsman precision.'
        ]
    },
    'scarsdale': {
        'name': 'Scarsdale',
        'zip': '10583',
        'lat': '40.9882',
        'lng': '-73.7846',
        'neighborhoods': 'Fox Meadow, Greenacres, Heathcote, Quaker Ridge, and Edgewood',
        'housing_desc': 'From grand English Tudors, Georgian manors, and center-hall Colonials to architect-designed contemporary estates with expansive finished basements',
        'building_quirks': 'thick oak framing, intricate crown moldings, delicate wide-plank hardwood flooring, and historic masonry fireplace breastworks',
        'why_choose': [
            'White-Glove Floor Protection: Heavy neoprene and canvas runners protect delicate Scarsdale hardwoods.',
            'Architectural Millwork Respect: Precise installations that preserve original period trim and paneling.',
            'High-End Designer Hardware: Experienced with Restoration Hardware, Waterworks, and custom luxury fixtures.',
            'Discreet & Respectful Service: Punctual, quiet, and spotless workstation cleanup on every visit.'
        ]
    },
    'new-rochelle': {
        'name': 'New Rochelle',
        'zip': '10801',
        'lat': '40.9115',
        'lng': '-73.7824',
        'neighborhoods': 'Beechmont, Wykagyl, Rochelle Park, Davenport Neck, and Downtown',
        'housing_desc': 'From coastal properties along Davenport Neck and grand turn-of-the-century homes in Beechmont to mid-century split-levels in Wykagyl and modern transit high-rises',
        'building_quirks': 'Sound Shore coastal humidity considerations, mixed plaster and sheetrock remodels, and varied masonry foundation structures',
        'why_choose': [
            'Coastal & Weather-Resistant Fixes: Stainless fasteners and humidity-rated adhesives suited for Sound Shore air.',
            'Split-Level & Estate Adaptability: Versatile skill set tackling both pre-war framing and modern drywall.',
            'Downtown High-Rise Navigation: Quick COI delivery and adherence to building security rules.',
            'Family-Focused & Pet-Friendly: Thorough cleanups with zero loose screws or sharp debris left behind.'
        ]
    },
    'mount-vernon': {
        'name': 'Mount Vernon',
        'zip': '10550',
        'lat': '40.9126',
        'lng': '-73.8371',
        'neighborhoods': 'Fleetwood, Chester Heights, Mount Vernon Heights, and Huntswood',
        'housing_desc': 'From prominent pre-war cooperative buildings around Fleetwood station to classic brick Victorians and multi-family brownstone-style homes in Chester Heights',
        'building_quirks': 'thick plaster-over-brick walls, historic steam heating pipes, strict co-op building bylaws, and vintage ceiling framing',
        'why_choose': [
            'Co-op Board & Super Coordination: Seamless compliance with Fleetwood cooperative renovation guidelines.',
            'Masonry & Brick Fastening Mastery: Diamond-tip pilot drilling for solid, fail-safe anchoring in brick.',
            'Fast Turnaround for Commuters: Flexible morning and weekend scheduling suited for NYC commuters.',
            'Upfront Flat-Rate Estimates: Guaranteed pricing with zero surprise trip fees or hidden add-ons.'
        ]
    },
    'mamaroneck': {
        'name': 'Mamaroneck',
        'zip': '10543',
        'lat': '40.9479',
        'lng': '-73.7326',
        'neighborhoods': 'Orienta, Harbor Heights, Shore Acres, and Washingtonville',
        'housing_desc': 'From waterfront residences in Orienta and Shore Acres with sweeping Sound views to charming village bungalows and colonials near Harbor Island Park',
        'building_quirks': 'high coastal salt-air exposure, humidity fluctuations impacting doors and joints, and historic coastal foundation framing',
        'why_choose': [
            'Marine-Grade Hardware: Corrosion-resistant screws, anchors, and brackets ideal for shoreline homes.',
            'Moisture & Swelling Adjustments: Skilled door and trim adjustments that account for seasonal coastal humidity.',
            'Village & Shore Neighborhood Knowledge: Reliable local service throughout Orienta and the Sound Shore.',
            'Spotless Dust Management: Drop cloths and floor shields on every single project.'
        ]
    },
    'rye': {
        'name': 'Rye',
        'zip': '10580',
        'lat': '40.9807',
        'lng': '-73.6837',
        'neighborhoods': 'Milton Point, Greenhaven, Forest Avenue, and Purchase border',
        'housing_desc': 'From waterfront estates on Milton Point and private coastal retreats in Greenhaven to stately shingle-style colonials along Forest Avenue',
        'building_quirks': 'custom architectural built-ins, antique wainscoting, solid stone chimney breasts, and premium custom millwork',
        'why_choose': [
            'Master Craftsman Standards: Over 23 years of exacting hands-on residential construction experience.',
            'Preservation of Period Millwork: Invisible cabling and non-destructive mounting techniques.',
            'Luxury Fixture Familiarity: Expert installation of custom cabinetry, designer lighting, and fine fittings.',
            'Uncompromising Cleanliness: Complete masking of surrounding furnishings and meticulous cleanups.'
        ]
    },
    'eastchester': {
        'name': 'Eastchester',
        'zip': '10709',
        'lat': '40.9576',
        'lng': '-73.8057',
        'neighborhoods': 'Garth Road, Lake Isle, Waverly, and the North End',
        'housing_desc': 'From prominent co-op residential complexes along Garth Road to mid-century ranches and split-level family residences surrounding Lake Isle',
        'building_quirks': 'strict Garth Road co-op board approvals, weekend contractor noise restrictions, and split-level structural variations',
        'why_choose': [
            'Garth Road Co-op Specialists: Complete familiarity with local management office guidelines and parking.',
            'Suburban Home Care: Thorough, dependable work for single-family homes around Lake Isle and Waverly.',
            'Transparent Partner Pricing: Upfront flat-rate quotes without open-ended billing or surprise add-ons.',
            'Prompt Emergency Response: Same-day and next-day availability when schedules permit.'
        ]
    }
}

SERVICES = {
    'tv-mounting': {
        'title': 'TV Mounting',
        'desc_verb': 'mount and secure televisions',
        'checklists': {
            'white-plains': [
                'Commercial steel stud TV mounting in City Center & downtown high-rises',
                'In-wall power bridge installation for Samsung Frame & OLED screens',
                'Concrete and masonry demising wall fastening with heavy-duty toggles',
                'Soundbar, Apple TV, gaming console & media shelf bracket attachment',
                'Full COI paperwork coordination for condominium management boards'
            ],
            'yonkers': [
                'Heavy-duty toggle mounting for historic horsehair plaster in Crestwood & Park Hill',
                'Brick and stone fireplace mantel TV installations with concealed raceways',
                'Waterfront high-rise apartment mounting into light-gauge metal studs',
                'Cable concealment through partition walls and paintable wire tracks',
                'Screen size calibration from 43 inches up to massive 98-inch displays'
            ],
            'scarsdale': [
                'Stone veneer and fieldstone Tudor fireplace TV installations',
                'Original horsehair plaster and solid oak stud precision mounting',
                'Ultra-flush Samsung Frame TV setup with in-wall One Connect box routing',
                'Heavy neoprene floor protection over antique Scarsdale hardwood planks',
                'Integrated soundbar and Sonos wireless audio component mounting'
            ],
            'new-rochelle': [
                'Masonry chimney and drywall TV installations across Beechmont & Wykagyl',
                'Sound Shore moisture-rated hardware for exterior patio and sunroom displays',
                'In-wall cable concealment through split-level and colonial wall cavities',
                'Condominium and apartment COI compliance for downtown high-rises',
                'Full tilting, low-profile fixed, and heavy articulating arm brackets'
            ],
            'mount-vernon': [
                'Thick plaster and brick wall mounting in Fleetwood co-op apartments',
                'Specialized toggle bolts tested for 150+ lbs in older masonry construction',
                'In-wall power extension kits eliminating dangling power cords',
                'Soundbar and peripheral bracket installation with clean wire dressing',
                'Co-op board insurance compliance and building superintendent liaison'
            ],
            'mamaroneck': [
                'Corrosion-resistant bracket installation for coastal Sound Shore homes',
                'Drywall and wood stud mounting across Orienta and Harbor Heights colonials',
                'In-wall cable management and HDMI passthrough plates for a wire-free finish',
                'Screen mounting over brick fireplaces and custom shiplap feature walls',
                'Articulating corner mounts for open-concept coastal living rooms'
            ],
            'rye': [
                'Fieldstone and granite fireplace TV mounting in Milton Point estates',
                'Custom millwork and wood-paneled wall mounting without surface damage',
                'Recessed media boxes and concealed conduits for Samsung Frame displays',
                'Premium audio soundbar leveling and sub-woofer cable management',
                'White-glove care and strict drop-cloth protection on every installation'
            ],
            'eastchester': [
                'Garth Road co-op wall mounting adhering to building quiet hours',
                'Solid plaster and hollow sheetrock mounting with heavy snap toggles',
                'In-wall power kits and hidden wire raceways matching baseboard paint',
                'Split-level and ranch living room TV setups in Lake Isle & Waverly',
                'Complete safety testing and viewing angle adjustment before completion'
            ]
        },
        'spotlights': {
            'white-plains': 'Mounted an 85-inch Sony Bravia onto light-gauge metal studs in a luxury Renaissance Square condo, using heavy-duty Elephant anchors and an in-wall power bridge with zero wires exposed.',
            'yonkers': 'Installed a 77-inch LG OLED over a 1920s brick fireplace in a Crestwood Victorian, anchoring securely into mortar joints with heat-rated lag shields and paintable wire tracks.',
            'scarsdale': 'Flush-mounted a 65-inch Samsung Frame TV onto a Fox Meadow Tudor fieldstone fireplace, routing the One Connect cord into a custom hidden media cabinet with zero stone chipping.',
            'new-rochelle': 'Mounted a 75-inch outdoor weatherproof display on an enclosed patio in Davenport Neck, utilizing stainless steel lag fasteners and sealed electrical pass-throughs.',
            'mount-vernon': 'Secured an articulating 65-inch television to a Fleetwood pre-war apartment plaster wall, distributing weight across three structural studs with heavy toggle bolts.',
            'mamaroneck': 'Installed a swivel-mount 70-inch television in an Orienta waterfront home, anchoring through shiplap paneling and moisture-proofing the rear wiring connections.',
            'rye': 'Mounted an 83-inch OLED display onto custom library cabinetry in a Milton Point estate, custom-fitting recessed backer plates so no fine woodwork was harmed.',
            'eastchester': 'Assembled and mounted a 65-inch 4K TV in a Garth Road co-op apartment during designated contractor hours, submitting the management COI in advance.'
        },
        'faqs': {
            'white-plains': [
                ('How do you mount large televisions to metal studs in White Plains condos?', 'Most downtown high-rises use commercial steel studs. We use heavy-duty toggle anchors engineered for metal studs, providing over 200 lbs of shear holding capacity without bending the steel.'),
                ('Can you conceal cords inside walls in White Plains buildings?', 'Yes. We install code-compliant in-wall power bridge modules and low-voltage pass-throughs so cables drop neatly inside the wall between studs.'),
                ('Do you provide building COIs for White Plains property managers?', 'Absolutely. We regularly issue building-specific Certificates of Insurance naming your condominium board and management company.')
            ],
            'yonkers': [
                ('Can you safely mount a TV on older plaster walls in Yonkers?', 'Yes. Many homes in Crestwood and Park Hill feature horsehair plaster over wood lath. We use precision pilot drilling and toggle clamps that span the lath securely without cracking the plaster.'),
                ('Do you mount televisions on brick or stone fireplaces in Yonkers?', 'Yes. We use specialized masonry bits and heat-resistant expansion anchors to fasten brackets directly into brick faces or mortar joints.'),
                ('What is your pricing policy for TV mounting in Yonkers?', 'We provide transparent flat-rate quotes tailored to your screen size, wall type, and wire concealment options. No surprise add-ons or hidden charges.')
            ],
            'scarsdale': [
                ('How do you protect delicate wood paneling and floors in Scarsdale homes?', 'We lay down padded neoprene runners over hardwood floors and use protective masking tape on paneled walls to guarantee zero scratches or dents.'),
                ('Can you mount a Samsung Frame TV flush against a Scarsdale stone fireplace?', 'Yes. We specialize in ultra-flush Frame TV installations, concealing the One Connect cable through mortar lines or recessed boxes for an authentic art gallery look.'),
                ('Can you conceal cords on walls where in-wall running isn’t possible?', 'Yes. In solid masonry or exterior stone walls, we install slim, paintable surface raceways aligned with trim to make wires practically invisible.')
            ],
            'new-rochelle': [
                ('Can you mount outdoor TVs on patios in New Rochelle?', 'Yes. We use weather-rated stainless steel hardware and waterproof electrical pass-throughs designed to withstand Sound Shore coastal weather.'),
                ('How do you locate studs through textured or plaster walls in older New Rochelle homes?', 'We use deep-scan magnetic and capacitive multi-sensor stud finders, cross-referenced with electrical outlet placements, to ensure direct stud attachment.'),
                ('How quickly can I get a TV mounted in New Rochelle?', 'We offer same-day and next-day appointment slots across New Rochelle, including morning and weekend times.')
            ],
            'mount-vernon': [
                ('Do Fleetwood co-op buildings allow in-wall wire concealment?', 'Most co-op boards permit code-compliant low-voltage pass-throughs and recessed power bridges. We adhere strictly to your building superintendent’s guidelines.'),
                ('Can you mount a heavy TV on concrete or plaster-over-brick walls in Mount Vernon?', 'Yes. We carry rotary hammer drills and industrial Tapcon and toggle anchors rated for solid masonry and aged brickwork.'),
                ('How does your TV mounting quote work in Mount Vernon?', 'We give you a guaranteed flat-rate price upfront before we begin, including bracket mounting, TV leveling, and all necessary specialty anchors.')
            ],
            'mamaroneck': [
                ('Do coastal humidity levels affect TV mounts in Mamaroneck?', 'Salt-heavy air can corrode standard steel hardware over time. In Sound Shore homes, we utilize corrosion-resistant powder-coated mounts and zinc-plated fasteners.'),
                ('Can you mount a TV above an active fireplace in Mamaroneck?', 'Yes. We check mantel depth and heat deflection to ensure your screen remains well within manufacturer thermal operating limits.'),
                ('Do you provide the TV wall mount or should I buy one?', 'We can provide heavy-duty tilting, fixed, or full-motion articulating mounts, or we are happy to install a bracket you have already purchased.')
            ],
            'rye': [
                ('Can you install TVs into historic wood-paneled rooms in Rye?', 'Yes. We design discrete mounting setups that anchor into underlying studs through discreet seams, avoiding damage to valuable antique wainscoting.'),
                ('Do you integrate soundbars and gaming consoles with the TV mount in Rye?', 'Yes. We install matching under-TV soundbar brackets, conceal power cables, and neatly dress HDMI connections to gaming consoles and streaming boxes.'),
                ('Are you fully insured for high-end residential estates in Rye?', 'Yes. Here Handyman carries full comprehensive liability insurance covering all residential installations.')
            ],
            'eastchester': [
                ('What are the rules for TV mounting in Garth Road co-ops?', 'We strictly observe Eastchester co-op contractor working hours and keep noise to a minimum with specialized low-noise drilling techniques.'),
                ('Can you mount TVs into metal studs or hollow drywall in Eastchester apartments?', 'Yes. We carry industrial snap-toggle bolts that secure heavy articulating arms firmly without compromising the partition wall.'),
                ('How do you handle scheduling for Eastchester residents?', 'We offer convenient scheduling Monday through Sunday, 7:00 AM to 8:00 PM, coordinating around your work and family schedule.')
            ]
        }
    },
    'furniture-assembly': {
        'title': 'Furniture Assembly',
        'desc_verb': 'assemble and secure home furniture',
        'checklists': {
            'white-plains': [
                'IKEA PAX multi-unit wardrobe assembly & alignment in downtown apartments',
                'Commercial office desks, conference tables & ergonomic chair setups',
                'Wayfair, West Elm, CB2, & Pottery Barn platform beds and dressers',
                'Heavy-duty wall anchoring into steel studs for child & earthquake safety',
                'Cardboard compaction, packaging breakdown & room cleanup'
            ],
            'yonkers': [
                'Bunk bed and loft bed assembly for multi-level Crestwood & Park Hill homes',
                'IKEA PAX wardrobe builds with hinged or sliding mirror doors',
                'Wall anchoring into plaster-and-lath walls using specialized expansion toggles',
                'Dining tables, credenzas, sideboards & entertainment centers',
                'Safe navigation of heavy furniture cartons up narrow historic staircases'
            ],
            'scarsdale': [
                'Restoration Hardware, Pottery Barn & Crate & Barrel master bedroom suites',
                'Custom nursery cribs, changing tables & gliding rocker assemblies',
                'Full floor covering protection with soft canvas blankets during assembly',
                'Heavy armoire and bookcase seismic wall anchoring into oak framing',
                'Assembly of outdoor teak patio dining sets and poolside loungers'
            ],
            'new-rochelle': [
                'Multi-drawer dressers, nightstands & storage platform bed frames',
                'Home office L-shaped desks and executive workstations across Wykagyl',
                'IKEA KALLAX cube storage and BESTÅ media console configurations',
                'Secure anti-tip wall straps installed on all tall furniture pieces',
                'Unboxing, hardware sorting & complete cardboard disposal prep'
            ],
            'mount-vernon': [
                'Space-saving Murphy desks and storage beds in Fleetwood co-ops',
                'IKEA MALM and HEMNES bedroom sets assembled with reinforced joinery',
                'Heavy bookcase and shelving unit wall anchoring for child safety',
                'Dining sets, barstools, and kitchen island cart assemblies',
                'Careful navigation through apartment hallways and elevators'
            ],
            'mamaroneck': [
                'Coastal outdoor teak and polywood patio dining sets and loungers',
                'IKEA PAX wardrobe systems custom-fit to coastal colonial bedroom niches',
                'Beds, daybeds, and trundle bed assemblies across Orienta homes',
                'Anti-tip safety brackets secured to studs to prevent tip-over risks',
                'Clean staging with all plastic wrap, foam, and cardboard neatly bundled'
            ],
            'rye': [
                'Luxury brand designer furniture assembly for Milton Point estates',
                'Custom walk-in closet shelving modules and modular armoire units',
                'Outdoor all-weather wicker and teak dining sets properly leveled',
                'Careful handling of delicate lacquer, marble, and tempered glass surfaces',
                'Protective floor pads attached to all furniture feet before placement'
            ],
            'eastchester': [
                'Garth Road co-op bedroom dresser and wardrobe assemblies within quiet hours',
                'Lake Isle & Waverly single-family home office and study furniture setups',
                'Wayfair and Target flat-pack furniture built square, sturdy, and tight',
                'Heavy wardrobe and hutch safety anchoring into wall framing',
                'Neat removal of packaging materials leaving your room ready to enjoy'
            ]
        },
        'spotlights': {
            'white-plains': 'Built a 3-section IKEA PAX wardrobe system with sliding mirror doors and interior pull-out drawers in a City Center high-rise, anchoring the top frame to metal studs.',
            'yonkers': 'Assembled a solid wood twin-over-full bunk bed with trundle in a historic Crestwood Victorian, anchoring the tall frame into wall lath to eliminate wobble.',
            'scarsdale': 'Assembled a 6-piece Restoration Hardware master bedroom collection in Fox Meadow, applying felt glides to all feet to protect pristine 4-inch white oak floors.',
            'new-rochelle': 'Assembled an executive L-shaped standing desk with motorized dual-motor risers and cable management trays in a Wykagyl home office.',
            'mount-vernon': 'Constructed a comprehensive storage bed with hydraulic lift-up mattress base in a Fleetwood cooperative, working cleanly within building noise restrictions.',
            'mamaroneck': 'Assembled an 8-person extendable teak outdoor dining set and 6 poolside loungers for an Orienta Sound Shore estate, treating all joints with marine-grade lubricant.',
            'rye': 'Built a custom multi-cabinet mudroom bench and locker system in a Milton Point estate, securing the assembly squarely against historic baseboard trim.',
            'eastchester': 'Assembled two matching 6-drawer MALM dressers and a king storage bed in a Garth Road apartment, completing the build in a single quiet morning visit.'
        },
        'faqs': {
            'white-plains': [
                ('Do you assemble IKEA PAX wardrobes in White Plains high-rises?', 'Yes! IKEA PAX wardrobes are our specialty. We assemble the frame boxes, hang sliding or hinged doors, insert all drawers, and anchor the top to metal or wood studs.'),
                ('Can you anchor tall bookcases to metal studs in White Plains condos?', 'Yes. Child-safety wall anchoring is crucial for tall furniture. We use heavy-duty toggle anchors engineered for commercial steel studs so units cannot tip.'),
                ('Do you take away the cardboard and packaging boxes in White Plains?', 'We break down, flatten, and neatly bundle all cardboard, bubble wrap, and styrofoam, placing them in your building’s designated recycling area.')
            ],
            'yonkers': [
                ('How do you get large furniture boxes up narrow stairways in Yonkers homes?', 'We carefully carry boxes and components piece-by-piece up narrow Victorian staircases, protecting wall corners and banisters with padded moving blankets.'),
                ('Can you anchor heavy furniture to older plaster walls in Yonkers?', 'Yes. We use specialized expansion toggles that grip the wood lath behind the plaster, providing solid resistance against accidental tipping.'),
                ('How is furniture assembly priced in Yonkers?', 'We give you an upfront flat-rate quote per item before starting. You know the exact price beforehand with zero hidden fees.')
            ],
            'scarsdale': [
                ('How do you protect delicate hardwood floors in Scarsdale during assembly?', 'We lay down thick moving blankets and canvas runners across the entire assembly zone and attach felt protector pads to all furniture legs before setting them in place.'),
                ('Can you assemble high-end brands like Restoration Hardware and Pottery Barn in Scarsdale?', 'Yes. We have extensive experience with luxury brand furnishings, following exact manufacturer torque specs and assembly sequences.'),
                ('Do you assemble complex children’s bunk beds and nursery sets in Scarsdale?', 'Yes. We ensure every safety bolt, guardrail, and ladder rung is torqued securely, and anchor the units directly to structural studs.')
            ],
            'new-rochelle': [
                ('Do you assemble office furniture and motorized standing desks in New Rochelle?', 'Yes. We assemble ergonomic office chairs, L-shaped executive desks, and motorized standing desks, including motor synchronization and wire routing.'),
                ('What brands of flat-pack furniture do you assemble in New Rochelle?', 'We assemble furniture from IKEA, Wayfair, Amazon, Target, West Elm, CB2, Crate & Barrel, Pottery Barn, Sauder, and many more.'),
                ('How quickly can you assemble furniture after delivery in New Rochelle?', 'We can often schedule your assembly for the same day or the day following your delivery. Call or text (516) 350-0801 to coordinate.')
            ],
            'mount-vernon': [
                ('Do you adhere to co-op contractor hours in Fleetwood buildings?', 'Yes. We strictly respect your building’s work hour limitations and use quiet hand tools whenever possible to keep noise to a minimum.'),
                ('Can you fix wobbly or improperly assembled furniture in Mount Vernon?', 'Yes. If a piece was assembled incorrectly or feels unstable, we can disassemble, correct the joinery, and tighten all hardware properly.'),
                ('How long does typical furniture assembly take in Mount Vernon?', 'Most dressers, desks, or bed frames take between 1 to 2.5 hours. Large multi-unit wardrobes can take 3 to 5 hours depending on interior components.')
            ],
            'mamaroneck': [
                ('Do you assemble outdoor patio sets in Mamaroneck?', 'Yes. We assemble teak, aluminum, and polywood patio dining sets, sectional sofas, loungers, and gazebos, applying anti-seize lubricant to all coastal hardware.'),
                ('Will you anchor tall furniture in Mamaroneck coastal bungalows?', 'Yes. Wall-anchoring is standard practice to protect children and pets from tip-over hazards, fastened directly into wall framing.'),
                ('Do I need to have tools ready for the assembly in Mamaroneck?', 'No. David arrives fully equipped with professional hex drivers, ratchets, torque wrenches, levels, and spare hardware.')
            ],
            'rye': [
                ('Can you assemble custom walk-in closet modular units in Rye?', 'Yes. We assemble and securely wall-mount modular closet systems, shoe towers, drawer banks, and valet rods with millimeter precision.'),
                ('How do you ensure heavy dressers don’t tip over in Rye homes?', 'We install aircraft-grade steel cable anti-tip straps anchored directly into wall studs, ensuring total protection for young children.'),
                ('Are you insured to work in high-value residences in Rye?', 'Yes. Here Handyman is fully insured with comprehensive liability coverage for your peace of mind.')
            ],
            'eastchester': [
                ('How do you handle assembly inside Garth Road apartments?', 'We work cleanly and quietly within building guidelines, lay down floor blankets, and dispose of packaging in accordance with co-op waste rules.'),
                ('Can you assemble furniture delivered from multiple different stores in Eastchester?', 'Yes. Whether you have boxes from IKEA, Wayfair, and Pottery Barn arriving together, we assemble everything in one efficient visit.'),
                ('How do I get an estimate for furniture assembly in Eastchester?', 'Simply text photos or store links of the items to (516) 350-0801, and we will provide an immediate flat-rate estimate.')
            ]
        }
    }
}

# Generic fallback templates for remaining 6 services
SERVICE_META = {
    'drywall-repair': ('Drywall Repair', 'patch, repair, and finish drywall and plaster walls'),
    'interior-painting': ('Interior Painting', 'prep, prime, and paint interior rooms and trim'),
    'plumbing-repairs': ('Plumbing Repairs', 'repair plumbing fixtures, replace faucets, and fix leaks'),
    'electrical-repairs': ('Electrical Repairs', 'replace light fixtures, install ceiling fans, and swap switches'),
    'general-repairs': ('General Repairs', 'tackle home maintenance checklists, door adjustments, and repairs'),
    'kitchen-remodeling': ('Kitchen Remodeling', 'refresh kitchen cabinets, install backsplashes, and upgrade fixtures')
}

SERVICES['drywall-repair'] = {
    'title': 'Drywall Repair',
    'desc_verb': 'repair, patch, and seamlessly blend sheetrock and plaster walls',
    'checklists': {
        'white-plains': [
            'Seamless sheetrock water damage cutouts in downtown condos & high-rises',
            'Dustless sanding with HEPA vacuum filtration to prevent setting off smoke alarms',
            'Doorknob holes, furniture impact gouges & partition wall repairs',
            'Multi-coat hot mud feathering designed for smooth level-5 apartment finishes',
            'Precision paint color matching to blend invisibly with existing wall color'
        ],
        'yonkers': [
            'Historic horsehair plaster repair & stabilization in Crestwood & Park Hill Victorians',
            'Joint tape re-bedding along settlement cracks in pre-war Ludlow apartment buildings',
            'Ceiling leak repairs beneath upper-floor bathrooms with mold-resistant backer boards',
            'Skim-coating textured and wavy plaster walls to restore glass-smooth surfaces',
            'Wood backing installation behind large wall openings to prevent flex'
        ],
        'scarsdale': [
            'Plaster-and-lath and sheetrock restoration in historic Fox Meadow & Greenacres Tudors',
            'Invisible patching around antique picture rails, crown moldings & baseboards',
            'Ceiling water damage cutout repairs with fiber-mesh tape and setting-type mud',
            'Wide-plank floor masking and complete room containment with zip-wall dust barriers',
            'Low-angle raking light inspection ensuring zero visible surface flashing'
        ],
        'new-rochelle': [
            'Stress crack taping and mudding across Beechmont Victorians & Wykagyl split-levels',
            'Moisture-resistant drywall repairs in Sound Shore coastal basements and laundry rooms',
            'Hole patching from relocated electrical boxes, recessed lights & plumbing access',
            'Textured ceiling & wall blending (smooth, orange peel, and knockdown finishes)',
            'Stain-blocking bonding primer application preventing water rings from bleeding through'
        ],
        'mount-vernon': [
            'Pre-war plaster wall skim-coating and hole patching across Fleetwood cooperatives',
            'Solid backing installation for radiator access cutouts and plumbing pipe repairs',
            'Hairline settlement crack stabilization along door casings and window frames',
            'Dust-controlled hand sanding respecting co-op neighbor quiet hours',
            'Two-coat paint finish matching original apartment wall and ceiling sheens'
        ],
        'mamaroneck': [
            'Water damage restoration and moisture-resistant sheetrock in Sound Shore bungalows',
            'Ceiling leak repairs in Orienta coastal homes following northeast coastal rainstorms',
            'Cracked seam taping and corner bead reinforcement along exterior walls',
            'Clean dustless sanding keeping coastal living rooms clean and tidy',
            'Color matching with premium mildew-resistant Benjamin Moore paint formulations'
        ],
        'rye': [
            'Flawless plaster and drywall restoration in Milton Point and Greenhaven luxury estates',
            'Repair of settling cracks along high cathedral ceilings and open two-story foyers',
            'Precision cutout patching around custom built-ins and historic wood wainscoting',
            'Cleanroom-grade dust containment with HEPA air filtration and floor protection',
            'Museum-quality smooth finish blending undetectable under natural seaside sunlight'
        ],
        'eastchester': [
            'Quiet drywall patching in Garth Road co-ops during approved building contractor hours',
            'Plaster and sheetrock wall repairs in Lake Isle and Waverly single-family homes',
            'Doorknob puncture holes and wall anchor blowout repairs with solid wood blocking',
            'Multi-coat feathering extending 8-12 inches beyond patch edges to prevent ridges',
            'Stain-blocking primer and matching topcoat paint for a fresh, uniform finish'
        ]
    },
    'spotlights': {
        'white-plains': 'Repaired a 3x3-foot ceiling drywall cutout caused by a condo plumbing stack leak near City Center, installing greenboard, feathering three thin coats of joint compound, and painting to match with zero flashing.',
        'yonkers': 'Stabilized cracked 1920s horsehair plaster in a Crestwood Victorian living room, anchoring loose lath with plaster washers and applying structural fiberglass mesh before a mirror-smooth skim coat.',
        'scarsdale': 'Patched three electrical access cutouts in a Fox Meadow Tudor dining room, feathering joint compound around original hand-carved oak picture moldings with zero dust drift.',
        'new-rochelle': 'Restored a water-damaged bathroom ceiling in a Wykagyl split-level, removing stained gypsum board, installing mold-resistant drywall, and priming with oil-based stain blocker.',
        'mount-vernon': 'Repaired two doorknob impact punctures and a settling crack in a Fleetwood cooperative bedroom, completing all backing, mudding, and touch-up painting in a single morning visit.',
        'mamaroneck': 'Fixed water-softened sheetrock beneath a bay window in an Orienta coastal cottage, using moisture-rated joint compound and applying an anti-mildew paint finish.',
        'rye': 'Seamlessly closed a plumbing inspection access panel in a Milton Point estate hallway, matching the delicate off-white eggshell finish so well that the repair is completely invisible.',
        'eastchester': 'Patched a series of wall anchor blowouts and settling seams in a Garth Road co-op, sanding with dustless abrasive sponges to keep the apartment pristine.'
    },
    'faqs': {
        'white-plains': [
            ('How do you prevent drywall dust from setting off condo smoke detectors in White Plains?', 'We utilize low-dust setting compounds, seal work areas with plastic dust containment barriers, and sand with HEPA-filtered vacuum attachments to protect sensitive high-rise smoke alarms.'),
            ('Will the drywall patch be visible under angled sunlight in downtown high-rises?', 'No. We feather our joint compound 10 to 12 inches past the repair perimeter and inspect under raking light to eliminate humps or shadows.'),
            ('Can you match the existing paint color on my White Plains walls?', 'Yes. If you don’t have leftover paint, we take a discreet nickel-sized sample chip to your local paint supplier for computer color matching.')
        ],
        'yonkers': [
            ('Can you fix crumbling older plaster walls in Yonkers Victorians?', 'Yes. We specialize in historic plaster stabilization, securing loose plaster back to the wooden lath with specialized plaster washers before applying high-strength setting mud.'),
            ('How do you fix recurring ceiling cracks in Yonkers pre-war buildings?', 'We grind out the failing joint, embed high-tensile fiberglass mesh tape into setting-type compound, and feather out the joint to prevent structural reopening.'),
            ('How is drywall repair quoted in Yonkers?', 'We provide clear, upfront flat-rate pricing based on the size and number of wall patches. You will never pay unexpected fees or open-ended hourly rates.')
        ],
        'scarsdale': [
            ('How do you protect antique Scarsdale molding and hardwood floors during drywall repairs?', 'We mask all moldings with delicate-surface tape, lay down heavy canvas tarps, and seal doorways with zippered containment curtains.'),
            ('Can you repair historic horsehair plaster in Scarsdale Tudors?', 'Yes. We preserve original plaster whenever possible, blending historic plaster substrates with modern flexible polymers for permanent durability.'),
            ('How long does a ceiling water damage repair take in Scarsdale?', 'Most ceiling patches are completed in one visit using rapid-drying hot mud, followed by a final coat of finishing mud, primer, and matching ceiling paint.')
        ],
        'new-rochelle': [
            ('Can you match textured ceilings and walls in New Rochelle homes?', 'Yes. We match orange peel, light knockdown, and smooth level-4/5 finishes, testing our spray texture pattern on sample boards before applying it to your wall.'),
            ('How do you handle moldy or water-stained drywall in Sound Shore basements?', 'We cut out all compromised drywall back to dry studs, treat framing with antimicrobial cleaner, install moisture-resistant board, and seal with stain-blocking primer.'),
            ('Do you repair holes left behind by plumbers and electricians in New Rochelle?', 'Yes! Closing utility access holes seamlessly is one of our most frequent handyman services.')
        ],
        'mount-vernon': [
            ('Do Fleetwood co-op buildings permit drywall work on weekends?', 'We coordinate with your co-op building superintendent, performing sanding and quiet repairs within designated building work hours.'),
            ('Can you repair drywall attached directly to brick in Mount Vernon?', 'Yes. In masonry-backed walls, we use specialized masonry adhesive and masonry anchors to secure replacement sheetrock firmly.'),
            ('Will my drywall repair be paint-ready when you finish?', 'Yes. All our repairs are sanded glass-smooth, wiped clean of dust, primed, and can be finish-painted to match your room.')
        ],
        'mamaroneck': [
            ('Do coastal homes in Mamaroneck require special moisture-resistant drywall?', 'For bathrooms, coastal basements, and exterior-facing walls subject to Sound Shore humidity, we recommend and install mold- and moisture-resistant gypsum board.'),
            ('How quickly can you patch a drywall hole in Mamaroneck?', 'We offer priority same-day and next-day scheduling for urgent drywall repairs across Mamaroneck and Rye Neck.'),
            ('What is your pricing policy for drywall repairs in Mamaroneck?', 'We provide guaranteed upfront flat-rate quotes tailored to the patch size and ceiling height, with zero hidden charges.')
        ],
        'rye': [
            ('Can you match the level-5 ultra-smooth finish in Rye estates?', 'Yes. We skim-coat with ultra-fine finishing compound and hand-sand with 220-grit abrasives to achieve a flawless, level-5 museum finish.'),
            ('How do you fix settling cracks along high cathedral ceilings in Rye?', 'We use high-reach ladders, reinforced mesh taping, and elastomeric joint compounds that flex with seasonal roof movement.'),
            ('Are you fully insured for interior repair work in Rye?', 'Yes. Here Handyman carries complete comprehensive liability insurance protecting your property and furnishings.')
        ],
        'eastchester': [
            ('How do you handle drywall repairs in Garth Road co-op apartments?', 'We work cleanly with minimal noise, protect common hallway carpeting when carrying materials, and leave your apartment spotless.'),
            ('Can you repair stress cracks around door frames in Eastchester split-levels?', 'Yes. We reinforce the stress point with fiberglass mesh tape and feather the mud to withstand everyday door-closing vibrations.'),
            ('How do I schedule an estimate for drywall repair in Eastchester?', 'Text photos of the wall damage to (516) 350-0801 for an immediate flat-rate quote and fast scheduling.')
        ]
    }
}

SERVICES['interior-painting'] = {
    'title': 'Interior Painting',
    'desc_verb': 'prep, patch, and paint interior rooms and architectural trim',
    'checklists': {
        'white-plains': [
            'Condo turnover painting & accent wall styling in downtown high-rises',
            'Full drywall patching, nail hole filling & caulking before brushwork',
            'Low-VOC & zero-odor Benjamin Moore paints for occupied apartments',
            'Sharp laser-straight cut lines along ceilings, door frames & baseboards',
            'Furniture central grouping & complete plastic sheeting protection'
        ],
        'yonkers': [
            'Historic Victorian room & parlor painting across Crestwood & Park Hill',
            'High-durability scuff-resistant paint for busy multi-family hallways',
            'Pre-war plaster crack repairs and skim-coat priming prior to finish coats',
            'Detailed trim, radiator & window sash enameling with satin or semi-gloss',
            'Full drop-cloth coverage protecting hardwood and parquet flooring'
        ],
        'scarsdale': [
            'Fine architectural millwork, crown molding & wainscoting enameling',
            'Master bedroom, nursery & library painting in Fox Meadow Tudors',
            'Two-coat coverage with designer palettes (Farrow & Ball, Benjamin Moore Aura)',
            'Thorough surface sanding, gap caulking & stain-blocking primer application',
            'Neoprene floor runners protecting antique oak floors and imported carpets'
        ],
        'new-rochelle': [
            'Coastal Sound Shore moisture-resistant kitchen & bath paint coatings',
            'Full-room painting for split-levels, ranches & colonials in Wykagyl',
            'Ceiling stain sealing and uniform flat ceiling paint applications',
            'Baseboard, casing & interior door painting with durable enamel',
            'Meticulous masking of hardware, light switches & hardwood borders'
        ],
        'mount-vernon': [
            'Fleetwood co-op apartment repainting complying with building contractor rules',
            'Radiator, pipe & high-ceiling painting in pre-war residential buildings',
            'Comprehensive wall prep: hole patching, sanding & bonding primer',
            'Scuff-resistant eggshell finishes ideal for busy commuter households',
            'Spotless room cleanup and daily furniture resetting'
        ],
        'mamaroneck': [
            'Mildew-resistant coastal paint systems for Orienta & Harbor Heights homes',
            'Shiplap, beadboard & coastal accent wall brush and roller painting',
            'Crisp white trim painting contrasting against rich coastal interior tones',
            'Drywall repair and salt-air moisture stain remediation before painting',
            'Clean masking ensuring zero overspray or paint drips on fixtures'
        ],
        'rye': [
            'Luxury estate interior painting in Milton Point with museum-grade cut lines',
            'High-end satin trim and lacquer-smooth interior door spray/brush finishing',
            'Designer color matching and custom sheen consultation for coastal light',
            'Thorough surface preparation with dust-free sanding between coats',
            'White-glove care with complete masking of high-value furniture and rugs'
        ],
        'eastchester': [
            'Quiet room painting in Garth Road apartments adhering to co-op noise guidelines',
            'Single-family living room, hallway & bedroom repainting in Lake Isle & Waverly',
            'Caulking baseboard gaps and filling nail holes for a fresh, tight look',
            'Two-coat coverage with durable washable finishes for active family homes',
            'Fast turnaround times with zero mess left behind'
        ]
    },
    'spotlights': {
        'white-plains': 'Painted an open-concept living and dining area in a City Center high-rise, patching 14 picture hanger holes, applying Benjamin Moore Regal Select matte, and cutting sharp lines along 9-foot ceilings.',
        'yonkers': 'Repainted a historic two-room parlor in a Crestwood Victorian, restoring original picture moldings with semi-gloss enamel and finishing walls in a warm historic neutral.',
        'scarsdale': 'Painted a master suite and walk-in dressing room in a Fox Meadow Tudor, applying two coats of Farrow & Ball velvet matte and enameling intricate three-piece crown moldings.',
        'new-rochelle': 'Refreshed a coastal family room in Davenport Neck with mildew-resistant eggshell paint, sealing previous ceiling moisture stains with shellac primer.',
        'mount-vernon': 'Transformed a 1-bedroom Fleetwood cooperative apartment with clean off-white walls and bright white semi-gloss doors, completing the project in two efficient days.',
        'mamaroneck': 'Painted an Orienta Sound Shore sunroom with coastal moisture-resistant satin paint, caulking all window casings to eliminate marine drafts.',
        'rye': 'Applied a sophisticated navy accent wall and crisp white ceiling in a Milton Point coastal home library, achieving perfectly straight lines against stone fireplace masonry.',
        'eastchester': 'Repainted a two-bedroom apartment on Garth Road, refreshing worn baseboards and doors with durable enamel and leaving the space completely move-in ready.'
    },
    'faqs': {
        'white-plains': [
            ('Do you use low-odor paint in White Plains condo buildings?', 'Yes. We exclusively use low-VOC and zero-VOC paints such as Benjamin Moore Regal Select and Sherwin-Williams Harmony, ensuring no harsh chemical smells in high-rise corridors.'),
            ('Do you move and cover furniture in White Plains apartments?', 'Yes. We carefully move furniture to the center of the room, cover everything with clean plastic sheeting, and place it back when work is done.'),
            ('How is interior painting quoted in White Plains?', 'We provide upfront flat-rate pricing based on room dimensions, ceiling height, and surface prep requirements. No hidden fees or hourly surprises.')
        ],
        'yonkers': [
            ('Can you paint older radiators and high ceilings in Yonkers Victorians?', 'Yes. We use heat-tolerant metal enamel on cast-iron radiators and carry high-reach ladders to paint 10- and 12-foot Victorian ceilings safely.'),
            ('How do you prepare cracked plaster walls before painting in Yonkers?', 'We scrape loose paint, tape settling cracks with fiberglass mesh, apply setting compound, sand glass-smooth, and prime before the first coat of paint.'),
            ('How many coats of paint do you apply in Yonkers homes?', 'We apply two full finish coats over all prepped and primed surfaces to guarantee rich color depth and long-lasting durability.')
        ],
        'scarsdale': [
            ('Can you work with luxury paint brands like Farrow & Ball in Scarsdale?', 'Yes. We have extensive experience with designer paints like Farrow & Ball, Benjamin Moore Aura, and Fine Paints of Europe, following specific roller and brush techniques.'),
            ('How do you protect delicate hardwood floors in Scarsdale?', 'We tape down heavy canvas drop cloths and thick neoprene runners across all pathways, ensuring zero paint splatters or ladder gouges on your floors.'),
            ('Do you paint interior doors, baseboards, and window trim in Scarsdale?', 'Yes! Detailed architectural woodwork and trim enameling are our specialties.')
        ],
        'new-rochelle': [
            ('What type of paint is best for coastal New Rochelle homes?', 'For Sound Shore properties, we use high-durability acrylic latex paints with built-in mildewcides to prevent mildew growth from coastal humidity.'),
            ('Can you cover dark existing paint colors with lighter tones in New Rochelle?', 'Yes. We apply a high-hiding stain-blocking primer coat first, followed by two topcoats to ensure total coverage without bleed-through.'),
            ('How long does painting an average bedroom take in New Rochelle?', 'Most standard bedrooms (walls, trim, and doors) are completed in 1 to 1.5 days, including full prep, drying time, and cleanup.')
        ],
        'mount-vernon': [
            ('How do you coordinate painting with Fleetwood co-op management?', 'We submit any required insurance certificates in advance and work strictly within building-approved contractor hours.'),
            ('Do you patch holes and caulk baseboards before painting in Mount Vernon?', 'Yes! Thorough surface prep—including patching, sanding, and caulking gaps—is included in every painting quote.'),
            ('Can I choose different colors for accent walls in Mount Vernon?', 'Absolutely. We can paint distinct accent walls, contrasting trim, or custom color combinations to match your interior design.')
        ],
        'mamaroneck': [
            ('How do you prevent paint peeling in humid coastal Mamaroneck bathrooms?', 'We clean and sand surfaces to remove moisture residue, apply a mold-killing primer, and finish with a specialized moisture-resistant satin or semi-gloss coating.'),
            ('Can you paint shiplap and beadboard in Mamaroneck coastal homes?', 'Yes. We carefully brush out grooves and spray or roll faces for a smooth, uniform coastal finish without drips.'),
            ('Are you insured for residential painting in Mamaroneck?', 'Yes. Here Handyman carries full comprehensive general liability insurance.')
        ],
        'rye': [
            ('How do you ensure razor-sharp cut lines against stone or brick in Rye?', 'We use premium delicate-surface masking tape, seal the edge with a thin bead of clear paintable caulk, and hand-cut with angled sash brushes.'),
            ('Do you handle small painting projects like single rooms or touch-ups in Rye?', 'Yes! Whether you need one room refreshed, water-damaged ceilings repainted, or full-house trim enameling, no project is too small.'),
            ('What is your pricing policy for painting in Rye?', 'We provide guaranteed flat-rate quotes tailored to your scope of work. You always know the exact cost before we begin.')
        ],
        'eastchester': [
            ('Can you paint apartments quickly between tenants on Garth Road?', 'Yes. We offer efficient turnover painting for co-ops and rental properties, restoring walls and woodwork to pristine move-in condition.'),
            ('Do you take care of paint supplies or do I need to buy them in Eastchester?', 'We can provide all premium paints, primers, sundries, and tools, or we are happy to use paint you have already purchased.'),
            ('How do I book a painting estimate in Eastchester?', 'Call or text (516) 350-0801 or submit a request online for a fast upfront flat-rate quote.')
        ]
    }
}

SERVICES['plumbing-repairs'] = {
    'title': 'Plumbing Repairs',
    'desc_verb': 'repair plumbing fixtures, replace faucets, and resolve leaks',
    'checklists': {
        'white-plains': [
            'Kitchen & bathroom faucet replacement with braided stainless steel supply lines',
            'Low-flow toilet replacement, wax ring seals & bidet attachment installations',
            'Under-sink garbage disposal replacement & trap reconfiguration in condos',
            'Showerhead, handheld sprayer & thermostatic valve trim upgrades',
            'Emergency shut-off valve replacement (quarter-turn brass ball valves)'
        ],
        'yonkers': [
            'Pre-war copper, brass & galvanized plumbing fixture replacements in Crestwood',
            'Bathroom vanity installation and P-trap drainage hookups in older Victorians',
            'Running toilet repair: flapper, fill valve & flush lever rebuilds',
            'Kitchen sink sprayers, touchless faucets & under-sink shut-off valve replacements',
            'Safe shut-off coordination with building supers in multi-family apartment complexes'
        ],
        'scarsdale': [
            'Luxury brand faucet installation (Waterworks, Rohl, Kohler, Newport Brass)',
            'Master bath soaking tub fillers & rain showerhead upgrades in Fox Meadow',
            'Powder room pedestal sink and vanity plumbing hookups with zero leaks',
            'Silent-fill toilet upgrades and bidet seat electrical/water integrations',
            'Full floor protection beneath all work areas with waterproof absorbent mats'
        ],
        'new-rochelle': [
            'Kitchen sink replacement and high-arc faucet installs across Wykagyl homes',
            'Outdoor frost-free hose bib and spigot replacements before winter freezes',
            'Bathroom vanity faucet and pop-up drain assembly installations',
            'Dishwasher water supply connection and drain hose loop installation',
            'Under-sink leak detection and corroded copper joint remediation'
        ],
        'mount-vernon': [
            'Fleetwood co-op building valve updates and kitchen faucet upgrades',
            'Toilet tank internal rebuilds and silent fill valve replacements',
            'Bathroom sink P-trap repair and chrome tailpiece installations',
            'Handheld bidet sprayer attachments and water shut-off verification',
            'Adherence to cooperative building super water shut-down schedules'
        ],
        'mamaroneck': [
            'Corrosion-resistant marine-grade brass fixture upgrades for coastal homes',
            'Outdoor rinse shower fixture installation for Sound Shore beachgoers',
            'Kitchen and wet bar faucet replacements across Orienta waterfront properties',
            'Washing machine braided stainless hose replacements to prevent burst leaks',
            'Sump pump float switch testing and basement drain verification'
        ],
        'rye': [
            'High-end designer plumbing trim kit installation in Milton Point estates',
            'Master bath double vanity faucet replacements and matching hardware',
            'Quiet toilet replacements and luxury washlet bidet seat installations',
            'Under-sink reverse osmosis water filtration system plumbing hookups',
            'Meticulous craftsman cleanup ensuring spotless chrome and porcelain finishes'
        ],
        'eastchester': [
            'Garth Road apartment faucet and showerhead replacements within co-op rules',
            'Lake Isle & Waverly residential sink, disposal & toilet maintenance',
            'Quarter-turn shut-off valve replacements preventing slow under-sink drips',
            'Bathroom vanity faucet swaps and pop-up stopper adjustments',
            'Prompt scheduling and guaranteed flat-rate quotes on all fixture work'
        ]
    },
    'spotlights': {
        'white-plains': 'Replaced a leaking commercial-style pull-down kitchen faucet and installed a new 3/4 HP garbage disposal in a downtown White Plains condo, replacing aged shut-off valves with quarter-turn brass ball valves.',
        'yonkers': 'Replaced an old two-handle bathroom vanity faucet in a Crestwood Victorian with a modern brushed nickel single-hole fixture, rebuilding the corroded brass P-trap without damaging wall tile.',
        'scarsdale': 'Installed a Waterworks brass widespread faucet and matching pop-up drain in a Fox Meadow powder room, testing under pressure for 30 minutes to verify zero leaks.',
        'new-rochelle': 'Replaced a worn toilet fill valve and flapper in a Wykagyl home, eliminating phantom flushing and reducing water waste by thousands of gallons annually.',
        'mount-vernon': 'Swapped out a kitchen faucet and installed an under-sink water filter in a Fleetwood cooperative during the building’s scheduled 2-hour water shut-down window.',
        'mamaroneck': 'Installed an exterior frost-proof hose spigot with an integrated vacuum breaker on an Orienta coastal property, ensuring freeze protection for winter.',
        'rye': 'Upgraded a Milton Point estate master bath with dual Kohler widespread faucets and replaced aging rubber washing machine hoses with braided stainless steel.',
        'eastchester': 'Replaced a running toilet and loose shut-off valve in a Garth Road co-op, completing the installation cleanly with zero noise disturbance to neighbors.'
    },
    'faqs': {
        'white-plains': [
            ('Can you replace kitchen faucets in White Plains high-rises?', 'Yes. We replace kitchen and bathroom faucets, disconnect older lines, install new quarter-turn shut-offs, and connect braided stainless steel supply lines.'),
            ('Do you replace garbage disposals in White Plains condos?', 'Yes. We install new 1/2 HP and 3/4 HP garbage disposals, ensuring code-compliant electrical connection and watertight dishwasher drain connections.'),
            ('What is your pricing policy for plumbing repairs in White Plains?', 'We provide clear, upfront flat-rate quotes based on the specific fixture and scope of work. No open-ended hourly billing or surprise fees.')
        ],
        'yonkers': [
            ('Can you replace corroded valves in older Yonkers plumbing systems?', 'Yes. We replace leaking multi-turn shut-off valves with modern brass quarter-turn ball valves that won’t seize up or leak over time.'),
            ('Do you install bidets and washlet seats in Yonkers?', 'Yes. We install bidet attachments, electric washlet seats, and dual-supply valves cleanly and securely onto your existing toilet.'),
            ('How quickly can you fix a leaking sink or running toilet in Yonkers?', 'We offer same-day and next-day appointment availability across Yonkers for urgent fixture leaks and toilet issues.')
        ],
        'scarsdale': [
            ('Do you have experience installing luxury designer fixtures in Scarsdale?', 'Yes. We routinely install luxury fixtures from Waterworks, Kohler, Rohl, and California Faucets with white-glove care.'),
            ('How do you protect Scarsdale bathroom vanities and wood floors during repairs?', 'We place waterproof containment trays and heavy drop cloths under all plumbing connections to catch any residual water.'),
            ('Can you replace toilets with high-efficiency comfort height models in Scarsdale?', 'Yes. We remove the old toilet, inspect the flange, install a new reinforced wax ring seal, secure the new toilet, and test for flush performance.')
        ],
        'new-rochelle': [
            ('Can you replace outdoor hose spigots in New Rochelle before winter?', 'Yes. We replace damaged exterior bibs with frost-proof sillcocks that drain automatically when shut off, preventing winter pipe bursts.'),
            ('Do you fix slow or clogged bathroom sink pop-up drains in New Rochelle?', 'Yes. We disassemble and clean P-traps, replace corroded mechanical lift rods, and install smooth push-button pop-up drains.'),
            ('Are you fully insured for residential plumbing repairs in New Rochelle?', 'Yes. Here Handyman carries full comprehensive general liability insurance.')
        ],
        'mount-vernon': [
            ('How do you handle water shut-offs in Fleetwood co-ops?', 'We coordinate with your building superintendent to confirm building riser shut-off schedules and complete all connections promptly.'),
            ('Can you fix a constantly running toilet in Mount Vernon?', 'Yes. We replace worn flappers, fill valves, and flush levers, restoring quiet, efficient flushing in a single visit.'),
            ('Do I need to supply the replacement plumbing parts in Mount Vernon?', 'We can provide standard high-grade brass valves, supply lines, and fittings, or install fixtures you have already purchased.')
        ],
        'mamaroneck': [
            ('Do coastal conditions cause faster plumbing corrosion in Mamaroneck?', 'Yes. Salt air can corrode chrome plating and cheap zinc fittings. We install solid brass valves and stainless steel hardware for long-term reliability.'),
            ('Can you install an outdoor shower or garden hose station in Mamaroneck?', 'Yes. We install outdoor rinse stations and frost-free spigots ideal for rinsing off after a day at the beach.'),
            ('How do I book a plumbing fixture repair in Mamaroneck?', 'Call or text (516) 350-0801 or book online for fast service across Mamaroneck.')
        ],
        'rye': [
            ('Can you install reverse osmosis drinking water systems in Rye?', 'Yes. We install under-sink filtration systems, mount dedicated faucet dispensers, and connect supply lines with pressure testing.'),
            ('Do you service high-end estate plumbing fixtures in Rye?', 'Yes. We treat high-end finishes with non-marring tools to ensure brass, matte black, and polished nickel finishes stay scratch-free.'),
            ('What is your pricing policy in Rye?', 'We give you a guaranteed flat-rate quote before any work begins, with zero hidden add-ons or travel fees.')
        ],
        'eastchester': [
            ('How do you handle plumbing repairs in Garth Road co-op apartments?', 'We respect building work hours, lay down protective floor coverings, and ensure all drainage and supply connections meet co-op standards.'),
            ('Can you upgrade my kitchen sink faucet in Eastchester?', 'Yes! We remove the old faucet, clean the deck plate, mount the new faucet, and connect flexible stainless supply lines with zero leaks.'),
            ('How quickly can you schedule service in Eastchester?', 'We service Eastchester 7 days a week, 7:00 AM to 8:00 PM, with prompt appointment slots.')
        ]
    }
}

SERVICES['electrical-repairs'] = {
    'title': 'Electrical Repairs',
    'desc_verb': 'replace light fixtures, install ceiling fans, and upgrade smart switches',
    'checklists': {
        'white-plains': [
            'Modern chandelier, pendant & flush-mount fixture installation in condos',
            'Ceiling fan assembly & balancing on rated electrical boxes',
            'Smart dimmer switch & Wi-Fi smart plug installations (Lutron, Leviton)',
            'Under-cabinet LED lighting installation in downtown apartment kitchens',
            'GFCI safety receptacle replacements in kitchens and bathrooms'
        ],
        'yonkers': [
            'Victorian chandelier & vintage lighting fixture replacements in Crestwood',
            'Ceiling fan installations with heavy-duty fan-rated ceiling support braces',
            'Smart video doorbell & motion sensor floodlight replacements',
            'GFCI and tamper-resistant safety outlet upgrades in older homes',
            'Safe circuit identification and multi-meter voltage verification'
        ],
        'scarsdale': [
            'High-ceiling entryway chandelier and foyer pendant lighting installations',
            'Designer lighting fixture installation (Visual Comfort, Restoration Hardware)',
            'Dimmable LED recessed light retrofits with zero ceiling drywall damage',
            'Smart home lighting automation (Caséta by Lutron, smart switches)',
            'Floor protection and ladder padding preserving antique hardwood finishes'
        ],
        'new-rochelle': [
            'Dining room chandelier, island pendant & foyer fixture replacements',
            'Outdoor security floodlight and motion sensor fixture installations',
            'Ceiling fan mounting with remote control receiver wiring in Wykagyl homes',
            'Kitchen under-cabinet light strip wiring and accent illumination',
            'Damaged light switch and loose wall receptacle replacements'
        ],
        'mount-vernon': [
            'Pre-war ceiling fixture replacements in Fleetwood co-op apartments',
            'Ceiling fan installations with vibration dampening for quiet operation',
            'Bathroom vanity mirror bar light replacements with moisture-rated fixtures',
            'Decora rocker switch and smart dimmer upgrades across apartment units',
            'Compliance with co-op building electrical modification guidelines'
        ],
        'mamaroneck': [
            'Corrosion-resistant coastal outdoor lighting fixtures in Orienta homes',
            'Nautical and coastal pendant lighting installation over kitchen islands',
            'Ceiling fan installations in Sound Shore sunrooms and bedrooms',
            'Weatherproof GFCI outdoor outlet cover replacements',
            'Low-voltage landscape lighting fixture replacements and timer setup'
        ],
        'rye': [
            'Grand foyer chandelier assembly, crystal hanging & electrical connection',
            'Custom library picture lighting and architectural accent illumination',
            'Smart dimmer switch arrays and multi-gang wall plate integrations',
            'Outdoor patio and gazebo ceiling fan installation in Milton Point',
            'White-glove care with complete drop cloths and clean tool setup'
        ],
        'eastchester': [
            'Garth Road co-op lighting updates adhering to building contractor rules',
            'Living room, bedroom & hallway fixture modernizations in Lake Isle',
            'Ceiling fan installations replacing dated flush mounts with fan braces',
            'Kitchen island pendant swaps and dining room dimmer installs',
            'Fast, clean installations with zero dust left on carpets or furniture'
        ]
    },
    'spotlights': {
        'white-plains': 'Replaced three dated hallway flush-mounts and installed a modern 5-light matte black Sputnik chandelier in a Renaissance Square luxury condo, adding a Lutron Caséta smart dimmer.',
        'yonkers': 'Installed a 52-inch Hunter ceiling fan on a 10-foot ceiling in a Crestwood Victorian, mounting a heavy-duty expanding fan brace between original ceiling joists for wobble-free rotation.',
        'scarsdale': 'Hung and assembled an intricate 24-light brass and crystal chandelier in a Fox Meadow two-story foyer, using specialized scaffold ladders and testing balance on all tiers.',
        'new-rochelle': 'Upgraded an exterior porch light and two motion-activated backyard floodlights in Wykagyl with dual-head LED fixtures, sealing the backplates against coastal rain.',
        'mount-vernon': 'Replaced an old bathroom vanity bar light with a modern LED brushed nickel sconce and installed a tamper-resistant GFCI receptacle in a Fleetwood cooperative.',
        'mamaroneck': 'Installed two coastal nautical pendant lights over a quartz kitchen island in an Orienta home, aligning wire heights perfectly to the millwork.',
        'rye': 'Assembled and wired a designer Restoration Hardware pendant over a 10-person dining table in a Milton Point estate, aligning the canopy flush to the ceiling medallion.',
        'eastchester': 'Replaced two dated bedroom ceiling fixtures with whisper-quiet remote-controlled ceiling fans in a Garth Road co-op, completing work during morning building hours.'
    },
    'faqs': {
        'white-plains': [
            ('Can you install smart dimmer switches in White Plains apartments?', 'Yes. We install smart dimmers from Lutron, Leviton, and TP-Link Kasa, ensuring neutral wire compatibility and app pairing.'),
            ('Can you hang heavy chandeliers in high-rise concrete or steel ceilings?', 'Yes. We inspect the electrical junction box and install heavy-duty fan-and-fixture braces rated for up to 100+ lbs.'),
            ('What is your pricing policy for light fixture installation in White Plains?', 'We provide upfront flat-rate pricing per fixture, so you know the exact cost before work begins. No hourly billing or surprise fees.')
        ],
        'yonkers': [
            ('Can you replace ceiling fixtures on older plaster ceilings in Yonkers?', 'Yes. We verify that the ceiling box is securely attached to framing and install retro-fit support braces if older plaster has weakened.'),
            ('Do you assemble and install ceiling fans in Yonkers homes?', 'Yes. We assemble the fan motor, blade arms, light kit, wire the remote receiver, and balance the blades for whisper-quiet rotation.'),
            ('How quickly can you replace a light fixture in Yonkers?', 'We regularly offer same-day and next-day service across Yonkers. Call or text (516) 350-0801.')
        ],
        'scarsdale': [
            ('Can you install high-ceiling foyer chandeliers in Scarsdale estates?', 'Yes. We are equipped with tall articulated ladders, protective ladder boots, and harness gear to install fixtures safely on high ceilings.'),
            ('How do you protect delicate hardwood floors in Scarsdale while working?', 'We lay down padded drop cloths and neoprene runners beneath our work areas, ensuring ladders never scratch or dent your floors.'),
            ('Do you install designer lighting brands like Visual Comfort in Scarsdale?', 'Yes. We have extensive experience assembling, hanging, and wiring luxury designer light fixtures and crystal pendants.')
        ],
        'new-rochelle': [
            ('Can you install outdoor floodlights and security cameras in New Rochelle?', 'Yes. We install motion-sensing LED floodlights, Ring and Nest floodlight cameras, and weatherproof exterior lighting.'),
            ('Do you replace GFCI outlets in New Rochelle kitchens and bathrooms?', 'Yes. We test and replace non-working GFCI outlets to ensure your home meets modern electrical safety standards.'),
            ('Are you insured for fixture installations in New Rochelle?', 'Yes. Here Handyman carries full comprehensive general liability insurance.')
        ],
        'mount-vernon': [
            ('Do Fleetwood co-op buildings allow ceiling fan installations?', 'Most co-op buildings permit ceiling fans on fan-rated support boxes. We verify box ratings and follow your building superintendent’s guidelines.'),
            ('Can you replace broken light switches and receptacles in Mount Vernon?', 'Yes. We swap out cracked, loose, or discolored switches and outlets with modern Decora-style devices.'),
            ('How do you price electrical fixture replacements in Mount Vernon?', 'We provide upfront flat-rate quotes per fixture, with zero hidden charges.')
        ],
        'mamaroneck': [
            ('Do outdoor lights in Mamaroneck need special coastal protection?', 'Yes. Salt air can corrode exterior fixtures quickly. We recommend and install marine-grade, powder-coated, or solid brass outdoor fixtures.'),
            ('Can you install under-cabinet lighting in Mamaroneck kitchens?', 'Yes. We install discreet LED strip lighting and puck lights under kitchen cabinets, hiding all wiring for a clean glow.'),
            ('Do you service both Orienta and village neighborhoods in Mamaroneck?', 'Yes! We cover all of Mamaroneck, Harbor Island, Orienta, and Rye Neck.')
        ],
        'rye': [
            ('Can you assemble multi-tiered crystal chandeliers in Rye estates?', 'Yes. We carefully assemble each crystal strand, arm, and canopy using lint-free gloves to maintain a spotless sparkle.'),
            ('Do you replace dated recessed can lights with energy-efficient LED trims in Rye?', 'Yes. We retrofit older recessed cans with selectable-color-temperature LED fixtures that sit flush and reduce heat output.'),
            ('What are your credentials for working in Rye?', 'Here Handyman has over 23 years of master handyman experience, carries full liability insurance, and maintains a verified 5.0 Google rating.')
        ],
        'eastchester': [
            ('How do you handle lighting installations in Garth Road co-ops?', 'We respect building quiet hours, lay down protective floor blankets, and dispose of all old fixtures and boxes neatly.'),
            ('Can you add dimmer switches to existing light fixtures in Eastchester?', 'Yes. We install rotary, slider, and smart dimmers compatible with modern LED bulbs to eliminate humming and flickering.'),
            ('How do I get a quote for lighting work in Eastchester?', 'Simply text photos of the fixtures and ceiling heights to (516) 350-0801 for an immediate flat-rate estimate.')
        ]
    }
}

SERVICES['general-repairs'] = {
    'title': 'General Repairs',
    'desc_verb': 'tackle home maintenance checklists, door repairs, and general fixes',
    'checklists': {
        'white-plains': [
            'Interior door sticking, latching & rubbing adjustments in high-rise condos',
            'Cabinet door hinge adjustments & soft-close damper installations',
            'Weatherstripping, draft sealing & window lock replacements',
            'Drywall patching, picture hanging & heavy mirror wall mounting',
            'Move-in handyman punch list completion for downtown residents'
        ],
        'yonkers': [
            'Historic Victorian door planed & re-hung to clear settling floorboards',
            'Loose wooden staircase handrail, baluster & step tightening in Crestwood',
            'Window sash cord repairs and lock hardware alignment on older windows',
            'Plaster hole patching, molding re-securing & baseboard repairs',
            'Multi-family apartment punch list maintenance and turnover repairs'
        ],
        'scarsdale': [
            'Architectural door planing, hinge shimming & mortise lock adjustments',
            'Custom mirror, oversized artwork & gallery wall precision mounting',
            'Cabinet hardware alignment and heavy-duty sliding drawer track repair',
            'Exterior gate latch adjustment, deck board tightening & trim repair',
            'Comprehensive home maintenance checklists with white-glove floor protection'
        ],
        'new-rochelle': [
            'Sliding patio screen door roller replacement and track cleaning',
            'Door handle, deadbolt & smart lock installations across Wykagyl homes',
            'Drywall dent patching, caulk line refreshment in kitchens & baths',
            'Garage shelving, pegboard & organization system installations',
            'Seasonal home maintenance and winterization prep across New Rochelle'
        ],
        'mount-vernon': [
            'Fleetwood co-op apartment door trimming to accommodate thick carpeting',
            'Kitchen cabinet hinge tightening and drawer slide realignments',
            'Baseboard, shoe molding & doorway threshold transitions installed',
            'Curtain rod, window blind & shade mounting into plaster-over-brick',
            'Quiet handyman maintenance complying with building contractor regulations'
        ],
        'mamaroneck': [
            'Coastal door swelling adjustments & stainless steel hinge lubrication',
            'Exterior siding repair and storm door latch adjustments in Orienta',
            'Caulking windows, bathtubs & kitchen backsplashes to block coastal moisture',
            'Heavy coastal mirror and decorative wall art mounting into studs',
            'Porch railing tightening and step repairs near the Harbor'
        ],
        'rye': [
            'Precision mortise lock and designer hardware adjustments in Milton Point',
            'Heavy gilded mirror and museum-grade art installations with laser levels',
            'Custom trim, wainscoting & architectural woodwork touch-up repairs',
            'Patio door roller replacement and weather-seal renewal on coastal homes',
            'Meticulous home repair checklists executed with master craftsman standards'
        ],
        'eastchester': [
            'Garth Road co-op door adjustments, draft stoppers & lock hardware',
            'Lake Isle single-family door, window & trim repairs',
            'Drywall crack patching, shelf hanging & closet organizer setups',
            'Kitchen cabinet alignment and drawer runner replacements',
            'Upfront flat-rate pricing with zero surprise charges or open-ended hourly fees'
        ]
    },
    'spotlights': {
        'white-plains': 'Tackled an 8-item move-in punch list in a City Center condo, including adjusting three sticking solid-core interior doors, mounting heavy vanity mirrors, and repairing cabinet hinges.',
        'yonkers': 'Planed and re-hung two sticking 1915 solid wood doors in a Crestwood Victorian, realigning the original mortise latches so both doors close smoothly without rubbing.',
        'scarsdale': 'Mounted an 80-pound antique gilded mirror into solid wall studs in a Fox Meadow center-hall colonial, using heavy D-rings and braided steel aircraft wire with laser leveling.',
        'new-rochelle': 'Replaced corroded sliding patio door rollers and realigned the exterior lock in a Wykagyl split-level, restoring effortless glide on a heavy glass door.',
        'mount-vernon': 'Trimmed the bottom of three bedroom doors in a Fleetwood cooperative to clear new deep-pile carpeting, re-mortising the hinges for a clean fit.',
        'mamaroneck': 'Adjusted swelling exterior French doors in an Orienta coastal home, replacing corroded screws with marine-grade stainless hardware and sealing gaps with silicone weatherstripping.',
        'rye': 'Mounted an extensive family photo gallery wall with 16 matching framed prints in a Milton Point residence, aligning each frame with millimeter precision.',
        'eastchester': 'Completed a general home maintenance checklist for a Garth Road co-op resident, repairing bathroom caulking, tightening loose cabinet doors, and installing curtain rods.'
    },
    'faqs': {
        'white-plains': [
            ('Can you complete a move-in punch list in White Plains apartments?', 'Yes! We frequently tackle move-in lists including hanging mirrors, curtain rods, mounting TVs, adjusting doors, and tightening cabinets all in one visit.'),
            ('How do you fix interior doors that stick or won’t latch in White Plains?', 'We diagnose whether the frame has settled or hinges are loose. We tighten and shim hinges, adjust strike plates, and plane edges if needed so doors latch easily.'),
            ('What is your pricing policy for general handyman repairs in White Plains?', 'We provide upfront flat-rate pricing based on your list of repairs. You know the exact cost before work begins with zero hourly surprises.')
        ],
        'yonkers': [
            ('Can you repair sticking doors in older Yonkers homes without ruining them?', 'Yes. We carefully plane only the rubbing edge of vintage solid-wood doors, seal the bare wood, and lubricate original mortise hinges.'),
            ('Do you hang heavy artwork and mirrors on plaster walls in Yonkers?', 'Yes. We locate framing studs or use heavy toggle anchors rated for up to 100+ lbs, ensuring valuable art is anchored safely.'),
            ('How do I book a handyman visit in Yonkers?', 'Call or text (516) 350-0801 or submit your repair list online for a fast estimate.')
        ],
        'scarsdale': [
            ('Can you mount oversized heavy mirrors in Scarsdale homes safely?', 'Yes. We use heavy-duty steel cleats or dual D-rings anchored directly into structural wall studs, verifying perfect horizontal alignment with laser levels.'),
            ('How do you protect delicate floors and trim in Scarsdale while working?', 'We lay down padded drop cloths, wear protective boot covers, and pad all ladder feet to ensure your home remains immaculate.'),
            ('Do you handle small one-hour handyman tasks in Scarsdale?', 'Yes! Whether you have one small door to adjust or a full whole-house punch list, no project is too small.')
        ],
        'new-rochelle': [
            ('Can you fix sliding patio doors that are hard to open in New Rochelle?', 'Yes. We lift the door, clean the track, replace worn tandem rollers, and adjust tension screws so heavy glass doors slide with one finger.'),
            ('Do you replace door knobs, deadbolts, and smart locks in New Rochelle?', 'Yes. We install traditional and smart keypad deadbolts from Schlage, Kwikset, Yale, and August, aligning strike plates for easy locking.'),
            ('Are you insured for residential home repairs in New Rochelle?', 'Yes. Here Handyman is fully insured with comprehensive general liability coverage.')
        ],
        'mount-vernon': [
            ('Can you trim doors that rub against new carpeting in Fleetwood co-ops?', 'Yes. We remove the door, score the veneer to prevent splintering, cut the bottom cleanly with a track saw, and rehang the door.'),
            ('Do you hang window blinds and curtain rods in Mount Vernon apartments?', 'Yes. We mount curtain rods, Roman shades, and motorized blinds into plaster, drywall, or masonry window headers.'),
            ('How are general repairs priced in Mount Vernon?', 'We provide guaranteed flat-rate quotes upfront for every task on your list, with zero surprise fees.')
        ],
        'mamaroneck': [
            ('Why do doors stick in coastal Mamaroneck homes during summer?', 'High humidity causes solid wood doors and jambs to swell. We adjust hinges, relieve friction points with precision planing, and seal the edges against moisture.'),
            ('Can you recaulk bathtubs and showers in Mamaroneck to prevent mildew?', 'Yes. We strip old moldy silicone, sanitize the joint, and apply 100% silicone waterproof sealant with built-in antimicrobial protection.'),
            ('How quickly can you schedule service in Mamaroneck?', 'We offer flexible 7-day scheduling from 7:00 AM to 8:00 PM across Mamaroneck and the Sound Shore.')
        ],
        'rye': [
            ('Can you hang multi-frame gallery walls with laser precision in Rye?', 'Yes. We use laser level cross-hairs and precision measuring jigs to ensure multi-frame photo collections are spaced and leveled perfectly.'),
            ('Do you repair fine architectural millwork and loose baseboards in Rye?', 'Yes. We secure loose moldings with headless brad nails, countersink fasteners, fill nail holes, and touch up paint flawlessly.'),
            ('What is your craftsman background in Rye?', 'David brings over 23 years of hands-on residential repair expertise, backed by verified 5.0 Google client reviews.')
        ],
        'eastchester': [
            ('Can you handle a checklist of small repairs in a Garth Road co-op?', 'Yes! Combining multiple small fixes—like curtain rods, door adjustments, and loose cabinet handles—into one visit is our specialty.'),
            ('How do you price multiple repairs in Eastchester?', 'We review your entire to-do list and provide a single transparent, upfront flat-rate quote before we begin.'),
            ('How do I schedule an estimate in Eastchester?', 'Text your repair checklist and photos to (516) 350-0801 for a quick response.')
        ]
    }
}

SERVICES['kitchen-remodeling'] = {
    'title': 'Kitchen Remodeling',
    'desc_verb': 'refresh kitchen cabinets, update backsplashes, and install fixtures',
    'checklists': {
        'white-plains': [
            'Cabinet door & drawer pull hardware upgrades with precision templates',
            'Subway tile & peel-and-stick backsplash installation in downtown condos',
            'Under-cabinet LED strip task lighting with concealed power wiring',
            'Kitchen sink, faucet, pull-down sprayer & disposal replacements',
            'Quiet condominium kitchen refresh work complying with building rules'
        ],
        'yonkers': [
            'Kitchen cabinet hinge replacements, adjustments & soft-close retrofits',
            'Custom backsplash tile installation and moisture-resistant grouting',
            'Deep kitchen sink and high-arc commercial faucet installations in Crestwood',
            'Drywall repair, caulking & cabinet touch-up painting in older homes',
            'Pantry shelving, pull-out wire basket & storage organizer installs'
        ],
        'scarsdale': [
            'Designer cabinet hardware installation (Waterworks, Restoration Hardware)',
            'Handmade ceramic, marble & subway tile kitchen backsplash installation',
            'Under-cabinet architectural LED illumination with dimmer control',
            'Luxury undermount sink faucet & hot water dispenser plumbing hookups',
            'Neoprene floor protection protecting historic Scarsdale kitchen hardwoods'
        ],
        'new-rochelle': [
            'Cabinet door realignment, soft-close hinge upgrades & handle template drilling',
            'Tile backsplash installation and silicone counter perimeter sealing',
            'Kitchen sink replacement and new garbage disposal installations in Wykagyl',
            'Range hood and over-the-range microwave mounting and venting',
            'Fresh cabinet painting and durable enamel refinishing'
        ],
        'mount-vernon': [
            'Fleetwood co-op kitchen refresh: hardware, faucet & lighting updates',
            'Backsplash tile installation over existing plaster or sheetrock walls',
            'Cabinet drawer slide replacements with smooth ball-bearing glides',
            'Under-cabinet lighting and GFCI safety receptacle replacements',
            'Clean turnaround complying with building superintendent regulations'
        ],
        'mamaroneck': [
            'Coastal Sound Shore kitchen cabinet hardware upgrades (brass & stainless)',
            'Moisture-resistant tile backsplash installation in Orienta waterfront homes',
            'Kitchen faucet and deep stainless steel undermount sink replacements',
            'Floating butcher block and coastal open shelving installations',
            'Waterproof silicone sealing along all quartz and granite countertops'
        ],
        'rye': [
            'Bespoke cabinet hardware installation for Milton Point luxury kitchens',
            'Artisan marble, glass & ceramic tile backsplash installation',
            'Under-cabinet and in-cabinet accent lighting with hidden drivers',
            'High-end sink faucet, pot filler & water filtration installations',
            'Spotless drop-cloth protection on all marble surfaces and wide-plank floors'
        ],
        'eastchester': [
            'Garth Road co-op kitchen updates: hardware, faucet, sink & backsplash',
            'Cabinet door soft-close damper installations eliminating slamming',
            'Kitchen counter seam caulking and wall touch-up painting in Lake Isle',
            'Pantry pull-out organizer and spice rack installations',
            'Upfront flat-rate pricing with zero surprise charges or open-ended hourly fees'
        ]
    },
    'spotlights': {
        'white-plains': 'Updated a City Center condo kitchen with 28 matte black cabinet handles using an aluminum drilling jig, installed an under-cabinet dimmable LED light bar, and replaced the kitchen faucet.',
        'yonkers': 'Replaced worn hinges with 110-degree soft-close European hinges on 18 cabinet doors in a Crestwood home and installed a ceramic subway tile backsplash behind the range.',
        'scarsdale': 'Installed an intricate herringbone marble tile backsplash and swapped all cabinet hardware to unlacquered brass pulls in a Fox Meadow colonial kitchen.',
        'new-rochelle': 'Mounted an over-the-range microwave and tiled a 30-square-foot kitchen backsplash in a Wykagyl split-level, sealing perimeter joints with color-matched silicone.',
        'mount-vernon': 'Transformed a Fleetwood co-op kitchen by installing new brushed nickel cabinet hardware, replacing the sink faucet, and adding under-cabinet lighting.',
        'mamaroneck': 'Installed two solid oak floating shelves with concealed steel brackets and updated the kitchen faucet to a commercial pre-rinse sprayer in an Orienta coastal home.',
        'rye': 'Installed artisan handmade ceramic tile backsplash and upgraded drawer tracks to full-extension soft-close glides in a Milton Point waterfront estate.',
        'eastchester': 'Completed a kitchen refresh in a Garth Road apartment, replacing old cabinet knobs with modern bar pulls, installing a new sink sprayer, and caulking the granite backsplash.'
    },
    'faqs': {
        'white-plains': [
            ('Can you install new cabinet hardware without drilling crooked holes in White Plains?', 'Yes! We use precision aluminum cabinet drilling templates with hardened steel guides to ensure every handle and knob is aligned to the millimeter.'),
            ('Can you tile a kitchen backsplash in a White Plains condo without making a mess?', 'Yes. We lay down heavy floor protection, mask all countertops, and use low-dust wet tile saws or manual snap cutters inside containment areas.'),
            ('What is your pricing policy for kitchen updates in White Plains?', 'We provide transparent flat-rate quotes based on your exact scope of work. You will know the guaranteed price before we begin.')
        ],
        'yonkers': [
            ('Can you upgrade older cabinet doors to soft-close in Yonkers?', 'Yes. We replace older hinges with Blum or Salice soft-close hinges, or add clip-on hydraulic dampers to eliminate cabinet door slamming.'),
            ('Do you replace kitchen sinks and faucets in Yonkers homes?', 'Yes. We disconnect existing plumbing, remove old caulking, mount the new sink and faucet, and reconnect supply lines with pressure testing.'),
            ('How quickly can you schedule a kitchen refresh in Yonkers?', 'We offer prompt scheduling across Yonkers, coordinating around your family schedule.')
        ],
        'scarsdale': [
            ('How do you protect delicate Scarsdale countertops during backsplash tiling?', 'We cover granite, quartz, and marble countertops with heavy corrugated board and plastic sheeting, ensuring zero scratches or tool marks.'),
            ('Can you install luxury designer hardware in Scarsdale kitchens?', 'Yes. We routinely install designer hardware from Waterworks, Restoration Hardware, Rejuvenation, and Armac Martin with flawless precision.'),
            ('Do you install floating shelves into kitchen wall studs in Scarsdale?', 'Yes. We use heavy-duty blind shelf steel brackets anchored directly into structural wall studs, tested to hold 75+ lbs per shelf.')
        ],
        'new-rochelle': [
            ('Can you mount an over-the-range microwave in New Rochelle kitchens?', 'Yes. We install mounting backplates to wall studs, secure upper cabinet bolts, and connect exterior or recirculating ventilation.'),
            ('How long does a typical kitchen tile backsplash installation take in New Rochelle?', 'Most standard kitchen backsplashes (20 to 40 square feet) take 1 to 2 days, including surface prep, tile setting, grouting, and silicone caulking.'),
            ('Are you insured for kitchen renovation work in New Rochelle?', 'Yes. Here Handyman carries complete general liability insurance for all residential projects.')
        ],
        'mount-vernon': [
            ('Do Fleetwood co-op buildings allow kitchen cosmetic updates?', 'Yes! Hardware swaps, faucet upgrades, and backsplash tiling typically require minimal building approval. We follow all building rules.'),
            ('Can you fix sticking cabinet drawers in Mount Vernon?', 'Yes. We can adjust or replace worn drawer runners with modern ball-bearing glides that open and close smoothly.'),
            ('How do you quote kitchen improvements in Mount Vernon?', 'We provide guaranteed flat-rate quotes with zero hidden add-ons or travel fees.')
        ],
        'mamaroneck': [
            ('What hardware finishes hold up best against coastal air in Mamaroneck?', 'We recommend solid brass, matte black stainless, or high-grade 304 stainless steel hardware to prevent pitting and tarnishing from Sound Shore salt air.'),
            ('Can you seal kitchen counters and backsplashes to prevent mold in Mamaroneck?', 'Yes. We apply 100% waterproof silicone sealant along all countertop and backsplash seams to block coastal humidity and moisture.'),
            ('Do you service Orienta and the Sound Shore in Mamaroneck?', 'Yes! We cover all neighborhoods across Mamaroneck and Rye Neck.')
        ],
        'rye': [
            ('Can you work with delicate handmade or zellige tiles in Rye?', 'Yes. We have experience setting irregular handmade zellige and ceramic tiles, carefully managing grout joint spacing to highlight artisan beauty.'),
            ('Do you install under-cabinet lighting with hidden wiring in Rye kitchens?', 'Yes. We mount low-profile LED channels and route wiring through discreet cabinet channels for a clean, architectural finish.'),
            ('What are your credentials for kitchen work in Rye?', 'David has over 23 years of hands-on experience, a verified 5.0 Google rating, and operates with white-glove cleanliness.')
        ],
        'eastchester': [
            ('How do you handle kitchen refresh projects in Garth Road apartments?', 'We work cleanly within co-op guidelines, keep noise to designated hours, and leave your kitchen functional and spotless at the end of each day.'),
            ('Can you replace kitchen faucets and install sink sprayers in Eastchester?', 'Yes! We replace faucets, soap dispensers, and water sprayers, checking all connections for leak-free performance.'),
            ('How do I request a quote for kitchen updates in Eastchester?', 'Text photos of your kitchen to (516) 350-0801 for a fast upfront flat-rate estimate.')
        ]
    }
}

def update_all_files():
    total_updated = 0
    for s_slug, s_data in SERVICES.items():
        s_title = s_data['title']
        for t_slug, t_data in TOWNS.items():
            filename = f"{s_slug}-{t_slug}.html"
            if not os.path.exists(filename):
                print(f"Skipping missing file: {filename}")
                continue
                
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()

            t_name = t_data['name']
            t_neigh = t_data['neighborhoods']
            t_housing = t_data['housing_desc']
            t_quirks = t_data['building_quirks']
            
            checklists = s_data['checklists'].get(t_slug, [])
            chk_html = "".join([f"<li>{item}</li>" for item in checklists])
            
            why_choose = t_data['why_choose']
            why_html = "".join([f"<li style=\"margin-bottom:12px;\">✓ <strong>{item.split(':')[0]}:</strong>{item.split(':')[1]}</li>" for item in why_choose])
            
            spotlight = s_data['spotlights'].get(t_slug, f"Completed a verified {s_title.lower()} project in {t_name}, executing meticulous craftsmanship with spotless cleanup and upfront flat-rate pricing.")
            
            faqs = s_data['faqs'].get(t_slug, [])
            faq_schema_items = [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]
            
            faq_html_items = "".join([
                f"""<div class="faq-item" style="background:var(--white); border-radius:8px; padding:24px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <h3 style="font-size:1.3rem; margin-bottom:10px; color:var(--navy); text-transform:none;">{q}</h3>
          <p style="font-size:1.05rem; color:#4a5568;">{a}</p>
        </div>""" for q, a in faqs
            ])

            # 1. Update Schema FAQPage
            faq_pattern = r'\{"@type":\s*"FAQPage",\s*"mainEntity":\s*\[.*?\]\s*\}'
            new_faq_schema = json.dumps({"@type": "FAQPage", "mainEntity": faq_schema_items}, ensure_ascii=False)
            content = re.sub(faq_pattern, new_faq_schema, content, flags=re.DOTALL)

            # 2. Update Main Content Section & Insert Project Spotlight
            main_sec_pattern = r'<section class="content-section">.*?</section>\s*<section class="content-section alt">'
            new_main_sec = f"""<section class="content-section">
  <div class="container">
    <div class="grid-2">
      <div>
        <h2 style="font-size:2.2rem; margin-bottom:15px;">Trusted {s_title} Services Across {t_name}</h2>
        <p style="font-size:1.1rem; margin-bottom:15px;">Looking for professional {s_title.lower()} in <strong>{t_name}, NY</strong>? Here Handyman provides prompt, highly detailed, 5-star home repair services designed specifically for {t_name} homeowners and apartment residents.</p>
        <p style="font-size:1.05rem; margin-bottom:15px; color:#4b5563;">We regularly serve clients across <strong>{t_neigh}</strong>. {t_housing}, David handles every detail with care and precision.</p>
        <p style="font-size:1.05rem; color:#4b5563;">We understand local building requirements throughout {t_name}, including {t_quirks}.</p>
        <ul class="checklist">
          {chk_html}
        </ul>
      </div>
      <div>
        <div style="background:var(--cream); padding:35px; border-radius:12px; border:2px solid #e2e8f0;">
          <h3 style="font-size:1.8rem; margin-bottom:15px; color:var(--navy);">Why {t_name} Chooses Here Handyman</h3>
          <ul style="list-style:none; line-height:1.8; font-size:1.05rem;">
            {why_html}
          </ul>
          <div style="margin-top:25px; text-align:center;">
            <a href="tel:5163500801" class="btn-primary" style="width:100%; text-align:center;">Get Free Quote in {t_name}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- LOCAL ARCHITECTURAL REALITIES & PROJECT SPOTLIGHT -->
<section class="content-section" style="background:#ffffff; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0;">
  <div class="container">
    <div style="max-width:960px; margin:0 auto;">
      <h2 style="font-size:2.3rem; margin-bottom:16px; color:var(--navy);">{t_name} Architecture &amp; Craftsmanship Standards</h2>
      <p style="font-size:1.08rem; line-height:1.75; margin-bottom:18px; color:#374151;">Performing {s_title.lower()} in {t_name} requires deep familiarity with local building methods and residential property requirements. {t_housing}. When working in {t_name}, owner David accounts directly for {t_quirks}. With over 23 years of hands-on experience, every installation and repair is executed cleanly, securely, and in full accordance with local building standards.</p>
      
      <div style="background:var(--cream); padding:28px; border-radius:10px; border-left:4px solid var(--orange); margin-top:24px;">
        <h3 style="font-size:1.4rem; color:var(--navy); margin-bottom:8px; font-family:'Bebas Neue',sans-serif; letter-spacing:0.5px;">Recent Project Spotlight: {t_name}</h3>
        <p style="font-size:1.02rem; line-height:1.65; color:#475569;">{spotlight}</p>
      </div>
    </div>
  </div>
</section>

<section class="content-section alt">"""

            content = re.sub(main_sec_pattern, new_main_sec, content, flags=re.DOTALL)

            # 3. Update FAQ section in HTML
            faq_sec_pattern = r'<section class="content-section alt">\s*<div class="container">\s*<h2 class="section-title">Frequently Asked Questions in .*?</h2>\s*<div style="max-width:800px; margin:0 auto;">.*?</div>\s*</div>\s*</section>'
            new_faq_sec = f"""<section class="content-section alt">
  <div class="container">
    <h2 class="section-title">Frequently Asked Questions in {t_name}</h2>
    <div style="max-width:800px; margin:0 auto;">
      {faq_html_items}
    </div>
  </div>
</section>"""

            content = re.sub(faq_sec_pattern, new_faq_sec, content, flags=re.DOTALL)

            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            total_updated += 1

    print(f"✅ Successfully updated {total_updated} service-city HTML files!")

if __name__ == '__main__':
    update_all_files()
