/**
 * Internationalization (i18n) translations for English, Kannada, Hindi, Telugu, and Tamil.
 */

export type LanguageCode = "en" | "kn" | "hi" | "te" | "ta";

export interface TranslationDict {
  app_title: string;
  app_subtitle: string;
  tab_birth_chart: string;
  tab_marriage_match: string;
  method_upload: string;
  method_paste: string;
  method_manual: string;
  field_name: string;
  field_gender: string;
  field_gender_male: string;
  field_gender_female: string;
  field_dob: string;
  field_tob: string;
  field_tob_unknown: string;
  field_pob: string;
  field_pob_placeholder: string;
  field_stated_rashi: string;
  field_stated_nakshatra: string;
  field_stated_gothra: string;
  review_title: string;
  review_subtitle: string;
  review_confidence_low: string;
  review_date_in_words: string;
  review_confirm_btn: string;
  review_continue_without_place: string;
  review_stated_vs_computed: string;
  chart_style_south: string;
  chart_style_north: string;
  chart_style_east: string;
  chart_d1_lagna: string;
  chart_d9_navamsa: string;
  table_planet: string;
  table_sign: string;
  table_degree: string;
  table_nakshatra: string;
  table_pada: string;
  table_house: string;
  table_status: string;
  table_retrograde: string;
  table_combust: string;
  section_grahas: string;
  section_dasha: string;
  section_panchang: string;
  section_avakahada: string;
  section_doshas: string;
  section_boundary_alerts: string;
  groom: string;
  bride: string;
  split_profiles_btn: string;
  match_ashtakoota_title: string;
  match_dasa_koota_title: string;
  match_dosha_samya_title: string;
  match_score_summary: string;
  match_min_score_label: string;
  btn_export_pdf: string;
  btn_share_link: string;
  privacy_badge: string;
  privacy_delete_btn: string;
  source_code_link: string;
  disclaimer_text: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
  en: {
    app_title: "Kundli",
    app_subtitle: "Accurate, Privacy-First Vedic Astrology & Ashtakoota Milan",
    tab_birth_chart: "Janma Kundali (Birth Chart)",
    tab_marriage_match: "Marriage Matching (Kundali Milan)",
    method_upload: "Upload Biodata",
    method_paste: "Paste Text / WhatsApp",
    method_manual: "Manual Entry",
    field_name: "Full Name",
    field_gender: "Gender",
    field_gender_male: "Male",
    field_gender_female: "Female",
    field_dob: "Date of Birth",
    field_tob: "Time of Birth",
    field_tob_unknown: "I don't know the exact time of birth",
    field_pob: "Place of Birth",
    field_pob_placeholder: "Type city name (e.g. Bengaluru, Mumbai, Chennai)...",
    field_stated_rashi: "Stated Rashi (Moon Sign)",
    field_stated_nakshatra: "Stated Nakshatra (Star)",
    field_stated_gothra: "Stated Gothra",
    review_title: "Review Extracted Details",
    review_subtitle: "Verify all fields carefully before chart computation. Fields with lower confidence are highlighted.",
    review_confidence_low: "Low Confidence - Please Confirm",
    review_date_in_words: "Date in words:",
    review_confirm_btn: "Confirm & Generate Chart",
    review_continue_without_place: "Continue Without Place (Moon-based only)",
    review_stated_vs_computed: "Cross-check Alert: Stated does not match astronomical position",
    chart_style_south: "South Indian (Default)",
    chart_style_north: "North Indian (Diamond)",
    chart_style_east: "East Indian (Surya)",
    chart_d1_lagna: "Lagna Chart (D1)",
    chart_d9_navamsa: "Navamsa Chart (D9)",
    table_planet: "Graha (Planet)",
    table_sign: "Rashi (Sign)",
    table_degree: "Degree",
    table_nakshatra: "Nakshatra",
    table_pada: "Pada",
    table_house: "House",
    table_status: "Status",
    table_retrograde: "Retrograde (V)",
    table_combust: "Combust (A)",
    section_grahas: "Graha Table & Planetary Positions",
    section_dasha: "Vimshottari Dasha Periods",
    section_panchang: "Panchanga at Birth",
    section_avakahada: "Avakahada Chakra Details",
    section_doshas: "Dosha & Yoga Evaluations",
    section_boundary_alerts: "Critical Boundary (Sandhi) Warnings",
    groom: "Groom",
    bride: "Bride",
    split_profiles_btn: "Split into Groom & Bride Profiles",
    match_ashtakoota_title: "Ashtakoota Milan (36 Points)",
    match_dasa_koota_title: "Dasa Koota (10 Poruthams)",
    match_dosha_samya_title: "Dosha Samya (Mars Dosha Balance)",
    match_score_summary: "Score alone is not enough — Comprehensive Analysis",
    match_min_score_label: "Minimum Score Threshold:",
    btn_export_pdf: "Export Clean PDF Report",
    btn_share_link: "Shareable Link",
    privacy_badge: "Zero-Storage by Default (DPDP Act Compliant)",
    privacy_delete_btn: "One-Click Clear Session",
    source_code_link: "Source code (AGPL-3.0 / Swiss Ephemeris)",
    disclaimer_text: "Traditional Vedic astrology provides archetypal and cultural insights. It should never serve as a basis for critical decisions in health, medical treatments, or financial investments."
  },
  kn: {
    app_title: "ಕುಂಡಲಿ",
    app_subtitle: "ನಿಖರ, ಗೌಪ್ಯತೆ-ಆಧಾರಿತ ಜನ್ಮ ಕುಂಡಲಿ ಮತ್ತು ಅಷ್ಟಕೂಟ ವಿವಾಹ ಹೊಂದಾಣಿಕೆ",
    tab_birth_chart: "ಜನ್ಮ ಕುಂಡಲಿ",
    tab_marriage_match: "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ (ಗುಣ ಮಿಲನ)",
    method_upload: "ಬಯೋಡೇಟಾ ಅಪ್‌ಲೋಡ್",
    method_paste: "ಪಠ್ಯ / ವಾಟ್ಸಾಪ್ ಪೇಸ್ಟ್",
    method_manual: "ನೇರ ನಮೂದು",
    field_name: "ಪೂರ್ಣ ಹೆಸರು",
    field_gender: "ಲಿಂಗ",
    field_gender_male: "ಪುರುಷ",
    field_gender_female: "ಮಹಿಳೆ",
    field_dob: "ಜನನ ದಿನಾಂಕ",
    field_tob: "ಜನನ ಸಮಯ",
    field_tob_unknown: "ನನಗೆ ನಿಖರ ಜನನ ಸಮಯ ತಿಳಿದಿಲ್ಲ",
    field_pob: "ಜನನ ಸ್ಥಳ",
    field_pob_placeholder: "ಊರಿನ ಹೆಸರು (ಉದಾ: ಬೆಂಗಳೂರು, ಮೈಸೂರು, ಬೆಳಗಾವಿ)...",
    field_stated_rashi: "ಹೇಳಲಾದ ರಾಶಿ",
    field_stated_nakshatra: "ಹೇಳಲಾದ ನಕ್ಷತ್ರ",
    field_stated_gothra: "ಗೋತ್ರ",
    review_title: "ಮಾಹಿತಿ ಪರಿಶೀಲನೆ",
    review_subtitle: "ಕುಂಡಲಿ ಲೆಕ್ಕಾಚಾರಕ್ಕೆ ಮುನ್ನ ವಿವರಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
    review_confidence_low: "ದಯವಿಟ್ಟು ದೃಢೀಕರಿಸಿ",
    review_date_in_words: "ದಿನಾಂಕ ಅಕ್ಷರಗಳಲ್ಲಿ:",
    review_confirm_btn: "ದೃಢೀಕರಿಸಿ ಮತ್ತು ಕುಂಡಲಿ ರಚಿಸಿ",
    review_continue_without_place: "ಸ್ಥಳವಿಲ್ಲದೆ ಮುಂದುವರಿಯಿರಿ (ಚಂದ್ರ ಆಧಾರಿತ)",
    review_stated_vs_computed: "ಗಮನಿಸಿ: ಹೇಳಲಾದ ರಾಶಿ/ನಕ್ಷತ್ರ ಗಣಿತ ಲೆಕ್ಕಾಚಾರಕ್ಕೆ ಭಿನ್ನವಾಗಿದೆ",
    chart_style_south: "ದಕ್ಷಿಣ ಭಾರತೀಯ ಶೈಲಿ (ಡಿಫಾಲ್ಟ್)",
    chart_style_north: "ಉತ್ತರ ಭಾರತೀಯ ಶೈಲಿ",
    chart_style_east: "ಪೂರ್ವ ಭಾರತೀಯ ಶೈಲಿ",
    chart_d1_lagna: "ಲಗ್ನ ಕುಂಡಲಿ (D1)",
    chart_d9_navamsa: "ನವಾಂಶ ಕುಂಡಲಿ (D9)",
    table_planet: "ಗ್ರಹ",
    table_sign: "ರಾಶಿ",
    table_degree: "ಅಂಶ",
    table_nakshatra: "ನಕ್ಷತ್ರ",
    table_pada: "ಪಾದ",
    table_house: "ಭಾವ",
    table_status: "ಸ್ಥಿತಿ",
    table_retrograde: "ವಕ್ರ (V)",
    table_combust: "ಅಸ್ತ (A)",
    section_grahas: "ಗ್ರಹಗಳ ಸ್ಥಿತಿ ವಿವರ",
    section_dasha: "ವಿಂಶೋತ್ತರಿ ದಶಾ ಅವಧಿಗಳು",
    section_panchang: "ಜನನ ಕಾಲದ ಪಂಚಾಂಗ",
    section_avakahada: "ಅವಕಹಡ ಚಕ್ರ ವಿವರಗಳು",
    section_doshas: "ದೋಷ ಮತ್ತು ಯೋಗಗಳ ಪರಿಶೀಲನೆ",
    section_boundary_alerts: "ಸಂಧಿ (ಗಡಿ) ಎಚ್ಚರಿಕೆಗಳು",
    groom: "ವರ",
    bride: "ವಧು",
    split_profiles_btn: "ವರ ಮತ್ತು ವಧು ವಿವರಗಳಾಗಿ ವಿಂಗಡಿಸಿ",
    match_ashtakoota_title: "ಅಷ್ಟಕೂಟ ಮಿಲನ (36 ಗುಣಗಳು)",
    match_dasa_koota_title: "ದಶ ಕೂಟ (10 ಪೊರುತ್ತಂ)",
    match_dosha_samya_title: "ದೋಷ ಸಾಮ್ಯ (ಕುಜ ದೋಷ ಸಮತೋಲನ)",
    match_score_summary: "ಅಂಕವಷ್ಟೇ ಸಾಲದು — ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆ",
    match_min_score_label: "ಕನಿಷ್ಠ ಗುಣ ಅಂಕಗಳು:",
    btn_export_pdf: "ಸ್ವಚ್ಛ PDF ವರದಿ ಡೌನ್‌ಲೋಡ್",
    btn_share_link: "ಹಂಚಿಕೊಳ್ಳಬಹುದಾದ ಲಿಂಕ್",
    privacy_badge: "ಶೂನ್ಯ ಡೇಟಾ ಸಂಗ್ರಹಣೆ (DPDP ಕಾಯಿದೆ ಅನುಸರಣೆ)",
    privacy_delete_btn: "ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಅಳಿಸಿ",
    source_code_link: "ಮೂಲ ಕೋಡ್ (AGPL-3.0 / Swiss Ephemeris)",
    disclaimer_text: "ಸಾಂಪ್ರದಾಯಿಕ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯವು ಸಾಂಸ್ಕೃತಿಕ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ. ಆರೋಗ್ಯ ಅಥವಾ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳಿಗೆ ಇದು ಆಧಾರವಲ್ಲ."
  },
  hi: {
    app_title: "कुण्डली",
    app_subtitle: "सटीक, गोपनीयता-प्रधान वैदिक ज्योतिष एवं अष्टकूट मिलान",
    tab_birth_chart: "जन्म कुण्डली",
    tab_marriage_match: "विवाह मिलान (गुण मिलान)",
    method_upload: "बायोडाटा अपलोड",
    method_paste: "टेक्स्ट / व्हाट्सएप पेस्ट",
    method_manual: "मैन्युअल प्रविष्टि",
    field_name: "पूरा नाम",
    field_gender: "लिंग",
    field_gender_male: "पुरुष",
    field_gender_female: "महिला",
    field_dob: "जन्म तिथि",
    field_tob: "जन्म समय",
    field_tob_unknown: "मुझे जन्म का सही समय नहीं पता",
    field_pob: "जन्म स्थान",
    field_pob_placeholder: "शहर का नाम (जैसे दिल्ली, मुम्बई, जयपुर)...",
    field_stated_rashi: "उल्लिखित राशि",
    field_stated_nakshatra: "उल्लिखित नक्षत्र",
    field_stated_gothra: "गोत्र",
    review_title: "विवरण की समीक्षा करें",
    review_subtitle: "कुण्डली निर्माण से पूर्व कृपया सभी विवरण सत्यापित करें।",
    review_confidence_low: "कम विश्वसनीयता - पुष्टि करें",
    review_date_in_words: "तिथि शब्दों में:",
    review_confirm_btn: "पुष्टि करें और कुण्डली बनाएं",
    review_continue_without_place: "स्थान के बिना आगे बढ़ें (केवल चंद्र आधारित)",
    review_stated_vs_computed: "चेतावनी: उल्लिखित राशि/नक्षत्र गणितीय गणना से भिन्न है",
    chart_style_south: "दक्षिण भारतीय शैली",
    chart_style_north: "उत्तर भारतीय शैली (डबल डायमंड)",
    chart_style_east: "पूर्व भारतीय शैली",
    chart_d1_lagna: "लग्न कुण्डली (D1)",
    chart_d9_navamsa: "नवांश कुण्डली (D9)",
    table_planet: "ग्रह",
    table_sign: "राशि",
    table_degree: "अंश",
    table_nakshatra: "नक्षत्र",
    table_pada: "पाद",
    table_house: "भाव",
    table_status: "स्थिति",
    table_retrograde: "वक्री (V)",
    table_combust: "अस्त (A)",
    section_grahas: "ग्रह स्थिति सारणी",
    section_dasha: "विंशोत्तरी दशा काल",
    section_panchang: "जन्म पंचांग",
    section_avakahada: "अवकहड़ा चक्र विवरण",
    section_doshas: "दोष एवं योग विश्लेषण",
    section_boundary_alerts: "संधि (सीमा) चेतावनी",
    groom: "वर",
    bride: "वधू",
    split_profiles_btn: "वर एवं वधू में विभाजित करें",
    match_ashtakoota_title: "अष्टकूट मिलान (36 गुण)",
    match_dasa_koota_title: "दश कूट (10 पोरुथम)",
    match_dosha_samya_title: "दोष साम्य (मंगल दोष संतुलन)",
    match_score_summary: "केवल अंक पर्याप्त नहीं — समग्र विश्लेषण",
    match_min_score_label: "न्यूनतम गुण सीमा:",
    btn_export_pdf: "पीडीएफ रिपोर्ट डाउनलोड करें",
    btn_share_link: "साझा करने योग्य लिंक",
    privacy_badge: "शून्य डाटा भंडारण (DPDP अधिनियम अनुपालित)",
    privacy_delete_btn: "एक-क्लिक में डाटा हटाएं",
    source_code_link: "सोर्स कोड (AGPL-3.0 / Swiss Ephemeris)",
    disclaimer_text: "पारंपरिक वैदिक ज्योतिष सांस्कृतिक और आध्यात्मिक अंतर्दृष्टि प्रदान करता है। इसे स्वास्थ्य या वित्तीय निर्णयों का आधार न बनाएं।"
  },
  te: {
    app_title: "కుండలి",
    app_subtitle: "ఖచ్చితమైన, గోప్యతతో కూడిన వేద జ్యోతిష్యం మరియు అష్టకూట వివాహ పొంతన",
    tab_birth_chart: "జన్మ కుండలి",
    tab_marriage_match: "వివాహ పొంతన (గుణ మేళనం)",
    method_upload: "బయోడేటా అప్‌లోడ్",
    method_paste: "టెక్స్ట్ / వాట్సాప్ పేస్ట్",
    method_manual: "నేరుగా నమోదు చేయండి",
    field_name: "పూర్తి పేరు",
    field_gender: "లింగం",
    field_gender_male: "పురుషుడు",
    field_gender_female: "స్త్రీ",
    field_dob: "పుట్టిన తేదీ",
    field_tob: "పుట్టిన సమయం",
    field_tob_unknown: "నాకు పుట్టిన సమయం సరిగ్గా తెలియదు",
    field_pob: "పుట్టిన ప్రదేశం",
    field_pob_placeholder: "నగరం పేరు (ఉదా: హైదరాబాద్, విజయవాడ, విశాఖపట్నం)...",
    field_stated_rashi: "పేర్కొన్న రాశి",
    field_stated_nakshatra: "పేర్కొన్న నక్షత్రం",
    field_stated_gothra: "గోత్రం",
    review_title: "వివరాలను సమీక్షించండి",
    review_subtitle: "కుండలి రూపొందించే ముందు వివరాలను సరిచూసుకోండి.",
    review_confidence_low: "దయచేసి నిర్ధారించండి",
    review_date_in_words: "తేదీ అక్షరాల్లో:",
    review_confirm_btn: "నిర్ధారించి కుండలిని రూపొందించండి",
    review_continue_without_place: "ప్రదేశం లేకుండా కొనసాగించండి",
    review_stated_vs_computed: "హెచ్చరిక: పేర్కొన్న రాశి ఖగోళ గణనకు భిన్నంగా ఉంది",
    chart_style_south: "దక్షిణ భారతీయ శైలి (డిఫాల్ట్)",
    chart_style_north: "ఉత్తర భారతీయ శైలి",
    chart_style_east: "తూర్పు భారతీయ శైలి",
    chart_d1_lagna: "లగ్న కుండలి (D1)",
    chart_d9_navamsa: "నవాంశ కుండలి (D9)",
    table_planet: "గ్రహం",
    table_sign: "రాశి",
    table_degree: "డిగ్రీ",
    table_nakshatra: "నక్షత్రం",
    table_pada: "పాదం",
    table_house: "భావం",
    table_status: "స్థితి",
    table_retrograde: "వక్ర (V)",
    table_combust: "అస్తంగతం (A)",
    section_grahas: "గ్రహ స్థితుల పట్టిక",
    section_dasha: "వింశోత్తరి దశలు",
    section_panchang: "జన్మ పంచాంగం",
    section_avakahada: "అవకహడ చక్రం",
    section_doshas: "దోషాలు మరియు యోగాలు",
    section_boundary_alerts: "సంధి హెచ్చరికలు",
    groom: "వరుడు",
    bride: "వధువు",
    split_profiles_btn: "వధూవరుల వివరాలుగా విభజించండి",
    match_ashtakoota_title: "అష్టకూట పొంతన (36 గుణాలు)",
    match_dasa_koota_title: "దశ కూట (10 పొరుత్తాలు)",
    match_dosha_samya_title: "దోష సామ్యం (కుజ దోష సమతుల్యత)",
    match_score_summary: "కేవలం మార్కులు మాత్రమే సరిపోవు — సమగ్ర విశ్లేషణ",
    match_min_score_label: "కనిష్ట గుణాల సంఖ్య:",
    btn_export_pdf: "పీడీఎఫ్ రిపోర్ట్ డౌన్‌లోడ్",
    btn_share_link: "షేర్ చేయదగిన లింక్",
    privacy_badge: "డేటా నిల్వ ఉండదు (DPDP చట్టం ప్రకారం)",
    privacy_delete_btn: "వెంటనే తొలగించండి",
    source_code_link: "సోర్స్ కోడ్ (AGPL-3.0 / Swiss Ephemeris)",
    disclaimer_text: "సాంప్రదాయ వేద జ్యోతిష్యం సాంస్కృతిక అవగాహన కోసం మాత్రమే. వైద్య లేదా ఆర్థిక నిర్ణయాలకు ఇది ఆధారం కాదు."
  },
  ta: {
    app_title: "குண்டலி",
    app_subtitle: "துல்லியமான, தனியுரிமை காக்கும் வேத ஜோதிடம் & அஷ்டகூட பொருத்தம்",
    tab_birth_chart: "ஜன்ம ஜாதகம்",
    tab_marriage_match: "திருமணப் பொருத்தம் (குணப் பொருத்தம்)",
    method_upload: "பயோடேட்டா பதிவேற்றம்",
    method_paste: "உரை / வாட்ஸ்அப் ஒட்டுக",
    method_manual: "கைமுறை உள்ளீடு",
    field_name: "முழுப் பெயர்",
    field_gender: "பாலினம்",
    field_gender_male: "ஆண்",
    field_gender_female: "பெண்",
    field_dob: "பிறந்த தேதி",
    field_tob: "பிறந்த நேரம்",
    field_tob_unknown: "சரியான பிறந்த நேரம் தெரியாது",
    field_pob: "பிறந்த ஊர்",
    field_pob_placeholder: "ஊரின் பெயர் (உதா: சென்னை, மதுரை, கோவை)...",
    field_stated_rashi: "குறிப்பிடப்பட்ட ராசி",
    field_stated_nakshatra: "குறிப்பிடப்பட்ட நட்சத்திரம்",
    field_stated_gothra: "கோத்திரம்",
    review_title: "விவரங்களை மதிப்பாய்வு செய்க",
    review_subtitle: "ஜாதகம் கணிக்கும் முன் விவரங்களை சரிபார்க்கவும்.",
    review_confidence_low: "தயவுசெய்து உறுதிப்படுத்தவும்",
    review_date_in_words: "தேதி எழுத்துக்களில்:",
    review_confirm_btn: "உறுதிசெய்து ஜாதகம் கணிக்கவும்",
    review_continue_without_place: "ஊர் இல்லாமல் தொடர்க (சந்திரன் மட்டும்)",
    review_stated_vs_computed: "எச்சரிக்கை: குறிப்பிட்ட ராசி வானியல் கணிப்பில் வேறுபடுகிறது",
    chart_style_south: "தென்னிந்திய பாணி (வழக்கமானது)",
    chart_style_north: "வடஇந்திய பாணி",
    chart_style_east: "கிழக்கிந்திய பாணி",
    chart_d1_lagna: "ராசிக் கட்டம் (D1)",
    chart_d9_navamsa: "நவாம்சக் கட்டம் (D9)",
    table_planet: "கிரகம்",
    table_sign: "ராசி",
    table_degree: "பாகை",
    table_nakshatra: "நட்சத்திரம்",
    table_pada: "பாதம்",
    table_house: "பாவகம்",
    table_status: "நிலை",
    table_retrograde: "வக்ரம் (V)",
    table_combust: "அஸ்தமனம் (A)",
    section_grahas: "கிரக நிலைகள் அட்டவணை",
    section_dasha: "விம்சோத்தரி திசா காலங்கள்",
    section_panchang: "பிறந்த பஞ்சாங்கம்",
    section_avakahada: "அவகஹட சக்கரம்",
    section_doshas: "தோஷங்கள் & யோகங்கள்",
    section_boundary_alerts: "சந்தி எச்சரிக்கைகள்",
    groom: "மணமகன்",
    bride: "மணமகள்",
    split_profiles_btn: "மணமகன் & மணமகள் என பிரிக்கவும்",
    match_ashtakoota_title: "அஷ்டகூட பொருத்தம் (36 குணங்கள்)",
    match_dasa_koota_title: "தசவிதப் பொருத்தம் (10 பொருத்தங்கள்)",
    match_dosha_samya_title: "தோஷ சாம்யம் (செவ்வாய் தோஷ சமநிலை)",
    match_score_summary: "புள்ளிகள் மட்டுமே போதுமானதல்ல — முழுமையான ஆய்வு",
    match_min_score_label: "குறைந்தபட்ச குண வரம்பு:",
    btn_export_pdf: "பிடிஎஃப் அறிக்கை பதிவிறக்குக",
    btn_share_link: "பகிர்வு இணைப்பு",
    privacy_badge: "தரவு சேமிக்கப்படாது (DPDP சட்டம்)",
    privacy_delete_btn: "உடனடியாக நீக்குக",
    source_code_link: "மூலக் குறியீடு (AGPL-3.0 / Swiss Ephemeris)",
    disclaimer_text: "பாரம்பரிய வேத ஜோதிடம் ஆன்மீக வழிகாட்டுதல் மட்டுமே. மருத்துவம் அல்லது நிதி முடிவுகளுக்கு இது அடிப்படையல்ல."
  }
};
