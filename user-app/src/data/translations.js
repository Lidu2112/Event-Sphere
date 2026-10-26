/**
 * translations.js
 * All UI strings for EN (English) and AM (Amharic).
 * Import { t } from this file and call t(lang, 'key') to get the string.
 */

const translations = {
    en: {
        // ── Navbar ──────────────────────────────────────────────
        nav_home: 'Home',
        nav_events: 'Events',
        nav_vendors: 'Vendors',
        nav_categories: 'Categories',
        nav_about: 'About Us',
        nav_attendee: 'Attendee',
        nav_my_tickets: 'My Tickets',
        nav_my_qr: 'My QR Codes',
        nav_purchase_history: 'Purchase History',
        nav_reviews: 'Reviews & Ratings',
        nav_my_profile: 'My Profile',
        nav_login: 'Login',
        nav_register: 'Register',
        nav_logout: 'Logout',
        nav_hi: 'Hi,',

        // ── Hero ────────────────────────────────────────────────
        hero_tag: 'Feel the Music. Live the Moment.',
        hero_title_1: 'Sounds in the',
        hero_title_accent: 'City Festival',
        hero_title_2: 'unforgettable vibes!',
        hero_subtitle: "Get ready to rock out! This year's lineup is packed with incredible talent from all genres. Don't miss out — get your tickets now!",
        hero_btn_explore: 'Explore Events',
        hero_btn_tickets: 'Get Tickets',
        hero_stat_festival: 'Festival',
        hero_stat_artist: 'Artist',
        hero_stat_visitors: 'Visitors',

        // ── Featured Events ─────────────────────────────────────
        featured_title: 'Featured Events',
        featured_search_name: 'Search name...',
        featured_search_city: 'City...',
        featured_clear: 'Clear',
        featured_view_all: 'View All Events →',
        featured_loading: 'Loading events...',
        featured_no_events: 'No events yet. Check back soon!',
        featured_no_match: 'No events match your search.',

        // ── About (landing section) ─────────────────────────────
        about_title: 'About EventSphere',
        about_body: 'EventSphere is a leading event management and tickethub platform connecting event organizers, premium vendors, eager attendees, and key staff across Ethiopia onto a unified, high-performance platform.',
        about_highlight: 'We have served 28,000+ attendees and supported 138+ live events in Ethiopia.',
        about_btn: 'Read more about who we are',
        about_stat_users: 'Registered Users',
        about_stat_users_desc: 'Empowered through direct tech tools & event access.',
        about_stat_events: 'Active Events',
        about_stat_events_desc: 'Curated experiences and venue management nationwide.',
        about_stat_tickets: 'Tickets Sold',
        about_stat_tickets_desc: 'Seamless ticketing and digital entry validation.',
        about_stat_vendors: 'Verified Vendors',
        about_stat_vendors_desc: 'End-to-end event logistics for organizers and staff.',

        // ── About Page ──────────────────────────────────────────
        ap_title: 'About',
        ap_subtitle: 'Your trusted platform for discovering and managing amazing events across Ethiopia',
        ap_stat_users: 'Registered Users',
        ap_stat_events: 'Active Events',
        ap_stat_tickets: 'Tickets Sold',
        ap_stat_vendors: 'Verified Vendors',
        ap_mission_title: 'Our Mission',
        ap_mission_desc: 'Connect event organizers, vendors, attendees, and staff in one seamless platform, making event discovery effortless.',
        ap_vision_title: 'Our Vision',
        ap_vision_desc: 'To become the most trusted event management platform across East Africa and beyond.',
        ap_values_title: 'Our Values',
        ap_values_desc: 'Transparency, innovation, community and excellence drive everything we build and every decision we make.',
        ap_who_serve: 'Who We Serve',
        ap_organizers: 'Event Organizers',
        ap_organizers_desc: 'Create, promote, and manage events with powerful tools and real-time analytics.',
        ap_attendees: 'Attendees',
        ap_attendees_desc: 'Browse, book, and experience incredible events. Get digital tickets on your phone.',
        ap_vendors: 'Vendors',
        ap_vendors_desc: 'Showcase your services, receive bookings, and grow your event business.',
        ap_staff: 'Event Staff',
        ap_staff_desc: 'Scan tickets, manage check-ins, and ensure smooth event day operations.',
        ap_team: 'Meet Our Team',
        ap_cta_title: 'Ready to discover amazing events?',
        ap_cta_sub: 'Join thousands of people already using EventSphere.',
        ap_cta_browse: 'Browse Events',
        ap_cta_create: 'Create Account',

        // ── Vendors (landing section) ───────────────────────────
        vendors_view_all: 'View All Vendors',
        vendors_category: 'Category:',
        vendors_loading: 'Fetching top vendors...',
        vendors_empty: 'No vendors found for this category.',
        vendors_contact: 'Contact for Price',
        // ── Vendors Page ────────────────────────────────────────
        vp_title: 'Event Vendors',
        vp_subtitle: 'Find the best service providers for your events',
        vp_search: 'Search services...',
        vp_loading: 'Loading services...',
        vp_empty: 'No vendors found matching your criteria.',
        vp_bookings: 'bookings',

        // ── Events Page ─────────────────────────────────────────
        ep_title: 'Explore Events',
        ep_subtitle: 'Find upcoming live shows, tech conferences, workshops, and meetups near you.',
        ep_search: 'Search by title or location...',
        ep_loading: 'Loading curated events...',
        ep_showing: 'Showing',
        ep_event: 'Event',
        ep_events: 'Events',
        ep_no_results: 'No events match your criteria',
        ep_no_results_sub: 'Try adjusting your search terms or clearing selected filters.',
        ep_clear_filters: 'Clear All Filters',
        ep_reset: 'Reset',
        ep_all_categories: 'All Categories',

        // ── Footer ──────────────────────────────────────────────
        footer_desc: 'Your one-stop platform to discover, book, and manage events with ease.',
        footer_quick: 'Quick Links',
        footer_categories: 'Categories',
        footer_support: 'Support',
        footer_contact: 'Contact Us',
        footer_home: 'Home',
        footer_events: 'Events',
        footer_vendors: 'Vendors',
        footer_about: 'About Us',
        footer_contact_link: 'Contact',
        footer_help: 'Help Center',
        footer_terms: 'Terms & Conditions',
        footer_privacy: 'Privacy Policy',
        footer_refund: 'Refund Policy',
        footer_copyright: '© 2026 EventSphere. All rights reserved.',
    },

    am: {
        // ── Navbar ──────────────────────────────────────────────
        nav_home: 'መነሻ',
        nav_events: 'ክስተቶች',
        nav_vendors: 'ሻጮች',
        nav_categories: 'ምድቦች',
        nav_about: 'ስለ እኛ',
        nav_attendee: 'ተሳታፊ',
        nav_my_tickets: 'የእኔ ቲኬቶች',
        nav_my_qr: 'የእኔ QR ኮዶች',
        nav_purchase_history: 'የግዢ ታሪክ',
        nav_reviews: 'ግምገማዎች',
        nav_my_profile: 'የእኔ መገለጫ',
        nav_login: 'ግባ',
        nav_register: 'ይመዝገቡ',
        nav_logout: 'ውጣ',
        nav_hi: 'ሰላም፣',

        // ── Hero ────────────────────────────────────────────────
        hero_tag: 'ሙዚቃን ይስሙ። ቅጽበቱን ይኑሩ።',
        hero_title_1: 'ድምፆች በ',
        hero_title_accent: 'የከተማ ፌስቲቫል',
        hero_title_2: 'የማይረሳ ስሜት!',
        hero_subtitle: 'ለእርስዎ ምርጥ የዓለም ደረጃ ሙዚቀኞች ዝግጁ ናቸው። አያምልጥዎ — አሁኑኑ ቲኬቶቻቸውን ያግኙ!',
        hero_btn_explore: 'ክስተቶችን ያስሱ',
        hero_btn_tickets: 'ቲኬት ያግኙ',
        hero_stat_festival: 'ፌስቲቫል',
        hero_stat_artist: 'አርቲስት',
        hero_stat_visitors: 'ጎብኚዎች',

        // ── Featured Events ─────────────────────────────────────
        featured_title: 'ተዘጋጅቶ የቀረቡ ዝግጅቶች',
        featured_search_name: 'ስም ይፈልጉ...',
        featured_search_city: 'ከተማ...',
        featured_clear: 'አጽዳ',
        featured_view_all: 'ሁሉንም ክስተቶች ይመልከቱ →',
        featured_loading: 'ክስተቶች በመጫን ላይ...',
        featured_no_events: 'ምንም ክስተቶች የሉም። ቆይተው ይምጡ!',
        featured_no_match: 'ከፍለጋዎ ጋር የሚዛምዱ ክስተቶች አልተገኙም።',

        // ── About (landing section) ─────────────────────────────
        about_title: 'ስለ EventSphere',
        about_body: 'EventSphere በኢትዮጵያ ውስጥ የዝግጅት አዘጋጆችን፣ ታዋቂ ሻጮችን፣ ተሳታፊዎችን እና ዋና ሰራተኞችን በአንድ ዘመናዊ መድረክ ላይ የሚያገናኝ ቀዳሚ የዝግጅት አስተዳደር ስርዓት ነው።',
        about_highlight: 'ከ28,000 በላይ ተሳታፊዎችን አገልግለናል እና ከ138 በላይ ቀጥታ ዝግጅቶችን በኢትዮጵያ ደግፈናል።',
        about_btn: 'ስለ እኛ የበለጠ ያንብቡ',
        about_stat_users: 'ተመዝጋቢ ተጠቃሚዎች',
        about_stat_users_desc: 'ቀጥታ ቴክ መሳሪያዎችና የዝግጅት ተደራሽነት ያግኙ።',
        about_stat_events: 'ንቁ ዝግጅቶች',
        about_stat_events_desc: 'በሀገር ውስጥ የሚተዳደሩ ተሞክሮዎችና ቦታዎች።',
        about_stat_tickets: 'የተሸጡ ቲኬቶች',
        about_stat_tickets_desc: 'ቀላል ቲኬቶች እና ዲጂታል መግቢያ ማረጋገጫ።',
        about_stat_vendors: 'የተረጋገጡ ሻጮች',
        about_stat_vendors_desc: 'ለአዘጋጆችና ሰራተኞች ሙሉ የዝግጅት ሎጂስቲክስ።',

        // ── About Page ──────────────────────────────────────────
        ap_title: 'ስለ',
        ap_subtitle: 'በኢትዮጵያ ውስጥ አስደናቂ ዝግጅቶችን ለማግኘትና ለማስተዳደር የሚያምኑት መድረካቸው',
        ap_stat_users: 'ተመዝጋቢ ተጠቃሚዎች',
        ap_stat_events: 'ንቁ ዝግጅቶች',
        ap_stat_tickets: 'የተሸጡ ቲኬቶች',
        ap_stat_vendors: 'የተረጋገጡ ሻጮች',
        ap_mission_title: 'ዓላማችን',
        ap_mission_desc: 'የዝግጅት አዘጋጆችን፣ ሻጮችን፣ ተሳታፊዎችን እና ሰራተኞችን በአንድ ቀልጣፋ መድረክ ላይ ማገናኘት።',
        ap_vision_title: 'ራዕያችን',
        ap_vision_desc: 'በምስራቅ አፍሪካ ውስጥ በጣም የሚታወቅ የዝግጅት አስተዳደር ስርዓት መሆን።',
        ap_values_title: 'እሴቶቻችን',
        ap_values_desc: 'ግልጽነት፣ ፈጠራ፣ ማህበረሰብ እና ልቀት በምንሠራቸው ነገሮች ሁሉ ይቀድሳሉ።',
        ap_who_serve: 'የምናገለግለው',
        ap_organizers: 'የዝግጅት አዘጋጆች',
        ap_organizers_desc: 'ዝግጅቶችን ፍጠሩ፣ አስተዋውቁ እና ያስተዳድሩ።',
        ap_attendees: 'ተሳታፊዎች',
        ap_attendees_desc: 'ዝግጅቶችን ያስሱ፣ ያስቀምጡ እና ዲጂታል ቲኬቶችን ያግኙ።',
        ap_vendors: 'ሻጮች',
        ap_vendors_desc: 'አገልግሎቶቻቸውን አሳዩ፣ ቦኪንጎችን ይቀበሉ።',
        ap_staff: 'የዝግጅት ሰራተኞች',
        ap_staff_desc: 'ቲኬቶችን ይቃኙ፣ ቼክ-ኢን ያስተዳድሩ።',
        ap_team: 'ቡድናችንን ያግኙ',
        ap_cta_title: 'አስደናቂ ዝግጅቶችን ለማግኘት ዝግጁ ናቸው?',
        ap_cta_sub: 'ሺዎች አስቀድሞ EventSphere ይጠቀማሉ።',
        ap_cta_browse: 'ዝግጅቶችን ያስሱ',
        ap_cta_create: 'መለያ ይክፈቱ',

        // ── Vendors (landing section) ───────────────────────────
        vendors_view_all: 'ሁሉንም ሻጮች ይመልከቱ',
        vendors_category: 'ምድብ:',
        vendors_loading: 'ሻጮችን በመጫን ላይ...',
        vendors_empty: 'ለዚህ ምድብ ሻጮች አልተገኙም።',
        vendors_contact: 'ለዋጋ ያግኙን',

        // ── Vendors Page ────────────────────────────────────────
        vp_title: 'የዝግጅት ሻጮች',
        vp_subtitle: 'ለዝግጅቶዎ ምርጥ አገልግሎት ሰጪዎችን ያግኙ',
        vp_search: 'አገልግሎቶችን ይፈልጉ...',
        vp_loading: 'አገልግሎቶችን በመጫን ላይ...',
        vp_empty: 'ለፍለጋዎ ሻጮች አልተገኙም።',
        vp_bookings: 'ቦኪንጎች',

        // ── Events Page ─────────────────────────────────────────
        ep_title: 'ክስተቶችን ያስሱ',
        ep_subtitle: 'በአካባቢዎ ያሉ ኮንሰርቶችን፣ ጉባኤዎችን፣ ወርክሾፖችን ያግኙ።',
        ep_search: 'በስም ወይም ቦታ ይፈልጉ...',
        ep_loading: 'ክስተቶችን በመጫን ላይ...',
        ep_showing: 'የሚታዩ',
        ep_event: 'ዝግጅት',
        ep_events: 'ዝግጅቶች',
        ep_no_results: 'ከፍለጋዎ ጋር የሚዛምዱ ክስተቶች አልተገኙም',
        ep_no_results_sub: 'ፍለጋዎን ያስተካክሉ ወይም ማጣሪያዎችን ያጽዱ።',
        ep_clear_filters: 'ሁሉንም ማጣሪያዎች አጽዳ',
        ep_reset: 'ዳግም ጀምር',
        ep_all_categories: 'ሁሉም ምድቦች',

        // ── Footer ──────────────────────────────────────────────
        footer_desc: 'ዝግጅቶችን ለማግኘት፣ ለማስያዝ እና ለማስተዳደር አንድ ቦታ።',
        footer_quick: 'ፈጣን አገናኞች',
        footer_categories: 'ምድቦች',
        footer_support: 'ድጋፍ',
        footer_contact: 'ያግኙን',
        footer_home: 'መነሻ',
        footer_events: 'ክስተቶች',
        footer_vendors: 'ሻጮች',
        footer_about: 'ስለ እኛ',
        footer_contact_link: 'አግኙን',
        footer_help: 'የእርዳታ ማዕከል',
        footer_terms: 'ውሎች እና ሁኔታዎች',
        footer_privacy: 'የግላዊነት ፖሊሲ',
        footer_refund: 'የተመላሽ ፖሊሲ',
        footer_copyright: '© 2026 EventSphere. ሁሉም መብቶች የተጠበቁ ናቸው።',
    },
};

/**
 * Get a translated string.
 * @param {string} lang - 'en' | 'am'
 * @param {string} key  - key from translations object
 * @returns {string}
 */
export function t(lang, key) {
    return (translations[lang] && translations[lang][key]) ||
        (translations['en'] && translations['en'][key]) ||
        key;
}

export default translations;
