
import { AppLanguage } from "./types";

export const APP_NAME = "AniGuard AI";

export const SYSTEM_INSTRUCTION = `
You are AniGuard AI, an advanced Animal & Agriculture Intelligence Platform for Indian farmers, students, and researchers.
Your objective is to provide professional, empathetic, and data-backed advice.

GUIDELINES:
1. HEALTH SCANS: Categorize severity as MILD, URGENT, or EMERGENCY. 
2. ECONOMICS: Use 'Hold vs Sell' logic. 
3. RESEARCH: Support bio-material exchange between farmers and scientists.
4. VOICE: Keep responses concise for audio playback.
`;

export const getLanguageInstruction = (lang: AppLanguage) => {
  switch (lang) {
    case AppLanguage.HINDI: return "Respond entirely in HINDI (Devanagari).";
    case AppLanguage.MARATHI: return "Respond entirely in MARATHI.";
    case AppLanguage.TAMIL: return "Respond entirely in TAMIL.";
    case AppLanguage.GUJARATI: return "Respond entirely in GUJARATI.";
    case AppLanguage.TELUGU: return "Respond entirely in TELUGU.";
    default: return "Respond in professional ENGLISH.";
  }
};

// Hardcoded responses for offline simulation
export const OFFLINE_EMERGENCY_COMMANDS: Record<string, string> = {
  "rabies": "OFFLINE ALERT: Keep the animal isolated. Do not touch saliva. Contact local municipal vet immediately.",
  "fmd": "OFFLINE ALERT: Foot and Mouth Disease detected. Wash feet with potassium permanganate solution. Restrict movement.",
  "lumpy": "OFFLINE ALERT: Lumpy Skin Disease. Isolate animal from mosquitoes/flies. Use neem oil on lumps.",
  "bloat": "OFFLINE ALERT: Emergency! Walk the animal, do not let it lie down. Contact vet for a trocar immediately."
};

export const VOICE_CATEGORIES = [
  { id: 'health', icon: 'fa-stethoscope', label: 'Health' },
  { id: 'market', icon: 'fa-chart-line', label: 'Market' },
  { id: 'finance', icon: 'fa-wallet', label: 'Finance' }
];

export const VOICE_EXAMPLES = {
  [AppLanguage.ENGLISH]: [
    { text: "Signs of Rabies in dogs?", category: "health" },
    { text: "Wheat price in Punjab Mandi?", category: "market" },
    { text: "My dairy profit this month?", category: "finance" }
  ],
  [AppLanguage.HINDI]: [
    { text: "गायों में लंपी के लक्षण क्या हैं?", category: "health" },
    { text: "आज गेहूं का भाव क्या है?", category: "market" },
    { text: "दूध का मुनाफा कैसे बढ़ाएं?", category: "finance" }
  ],
  [AppLanguage.GUJARATI]: [
    { text: "ગાયમાં લમ્પીના લક્ષણો?", category: "health" },
    { text: "ઘઉંના બજાર ભાવ શું છે?", category: "market" },
    { text: "દૂધનો નફો કેવી રીતે ગણવો?", category: "finance" }
  ],
  [AppLanguage.TELUGU]: [
    { text: "ఆవుల్లో లంపి లక్షణాలు ఏమిటి?", category: "health" },
    { text: "ఈరోజు మార్కెట్ ధరలు ఎలా ఉన్నాయి?", category: "market" },
    { text: "పాల లాభం ఎలా లెక్కించాలి?", category: "finance" }
  ]
};

// Fix: Added missing SUGGESTED_QUESTIONS export for AdvisorChat component
export const SUGGESTED_QUESTIONS: Record<AppLanguage, string[]> = {
  [AppLanguage.ENGLISH]: [
    "How to optimize soil nitrogen levels organically?",
    "Best organic treatment for leaf curl disease?",
    "Current market trends for wheat in North India?",
    "How to reduce feed costs for dairy cattle?"
  ],
  [AppLanguage.HINDI]: [
    "मिट्टी में नाइट्रोजन कैसे बढ़ाएं?",
    "पत्तियों के मुड़ने के रोग का जैविक उपचार?",
    "उत्तर भारत में गेहूं के बाजार भाव क्या हैं?",
    "पशुओं के चारे की लागत कैसे कम करें?"
  ],
  [AppLanguage.MARATHI]: [
    "जमिनीत नत्र कसे वाढवायचे?",
    "पाने चुरगळणे रोगावर सेंद्रिय उपचार?",
    "गव्हाचे बाजार भाव काय आहेत?",
    "दुभत्या जनावरांच्या खाद्याचा खर्च कसा कमी करावा?"
  ],
  [AppLanguage.TAMIL]: [
    "மண்ணில் நைட்ரஜனை எவ்வாறு அதிகரிப்பது?",
    "இலை சுருக்கல் நோய்க்கு சிறந்த இயற்கை சிகிச்சை?",
    "கோதுமை சந்தை நிலவரம் என்ன?",
    "கால்நடை தீவன செலவை எவ்வாறு குறைப்பது?"
  ],
  [AppLanguage.GUJARATI]: [
    "જમીનમાં નાઇટ્રોજન કેવી રીતે વધારવો?",
    "પાંદડા વળવાના રોગનો જૈવિક ઉપચાર?",
    "ઘઉંના બજાર ભાવ શું છે?",
    "પશુ આહારનો ખર્ચ કેવી રીતે ઘટાડવો?"
  ],
  [AppLanguage.TELUGU]: [
    "నేలలో నత్రజనిని ఎలా పెంచాలి?",
    "ఆకు ముడత తెగులుకు ఉత్తమ సేంద్రియ చికిత్స?",
    "గోధుమ మార్కెట్ ట్రెండ్స్ ఎలా ఉన్నాయి?",
    "పశువుల దాణా ఖర్చును ఎలా తగ్గించాలి?"
  ],
  [AppLanguage.HINGLISH]: [
    "Soil nitrogen kaise increase karein?",
    "Leaf curl disease ka organic ilaj?",
    "Wheat market trends kya hain?",
    "Dairy cattle ka feed cost kaise kam karein?"
  ]
};

// Fix: Expanded UI_STRINGS with all missing translation keys used by the application components
export const UI_STRINGS: Record<AppLanguage, any> = {
  [AppLanguage.ENGLISH]: {
    home: "Dashboard", health: "Health Scan", market: "Decision Engine", finance: "Profit Analyzer", radar: "Risk Radar", voice: "Live AI",
    voiceTitle: "Vernacular Voice Assistant",
    voiceExplainer: "Speak naturally in Hindi, Marathi, Tamil, Gujarati, or Telugu. Get feeding advice, market trends, and emergency guidance without typing. Optimized for performance on all smartphones.",
    voicePrompt: "Press mic and speak clearly...",
    voiceOffline: "Connected to Local Emergency Database (Offline Mode)",
    voiceOnline: "Connected to Live Cloud Intelligence",
    analyzing: "AI Processing...",
    welcome: "Welcome to AniGuard AI",
    vets: "Vet Finder", lab: "Video Lab",
    detect: "Disease Detector",
    healthDesc: "Scan livestock for disease",
    financeDesc: "Analyze dairy profitability",
    schemes: "Govt Schemes",
    schemesDesc: "Subsidies & grants",
    wasteHub: "Bio-Waste Hub",
    wasteDesc: "Collab with researchers",
    reportOutbreakDesc: "Local disease alerts",
    activeRequests: "Research Inquiries",
    research: "Research Portal",
    guidelines: "Safety Protocols",
    feedback: "Feedback Hub",
    thankYou: "Thank you for your feedback!",
    rateExperience: "Rate your experience",
    suggestions: "Any suggestions?",
    submit: "Submit Feedback",
    recipes: "Success Stories",
    readStory: "Read Full Story"
  },
  [AppLanguage.HINDI]: {
    home: "डैशबोर्ड", health: "स्वास्थ्य जांच", market: "निर्णय इंजन", finance: "लाभ विश्लेषक", radar: "बीमारी रडार", voice: "लाइव एआई",
    voiceTitle: "स्थानीय भाषा आवाज सहायक",
    voiceExplainer: "हिंदी, मराठी, तमिल, गुजराती या तेलुगु में स्वाभाविक रूप से बोलें। टाइप किए बिना चारे की सलाह, बाजार के रुझान और आपातकालीन मार्गदर्शन प्राप्त करें।",
    voicePrompt: "माइक दबाएं और स्पष्ट रूप से बोलें...",
    voiceOffline: "स्थानीय आपातकालीन डेटाबेस से जुड़े (ऑफलाइन)",
    voiceOnline: "लाइव क्लाउड इंटेलिजेंस से जुड़े",
    analyzing: "एआई विश्लेषण जारी है...",
    welcome: "AniGuard AI में आपका स्वागत है",
    vets: "डॉक्टर खोजें", lab: "वीडियो लैब",
    detect: "रोग पहचान",
    healthDesc: "पशु स्वास्थ्य की जांच करें",
    financeDesc: "डेयरी लाभ का विश्लेषण करें",
    schemes: "सरकारी योजनाएं",
    schemesDesc: "सब्सिडी और अनुदान",
    wasteHub: "बायो-वेस्ट हब",
    wasteDesc: "शोधकर्ताओं के साथ जुड़ें",
    reportOutbreakDesc: "स्थानीय बीमारी अलर्ट",
    activeRequests: "शोध पूछताछ",
    research: "अनुसंधान पोर्टल",
    guidelines: "सुरक्षा नियम",
    feedback: "प्रतिक्रिया हब",
    thankYou: "आपकी प्रतिक्रिया के लिए धन्यवाद!",
    rateExperience: "अपना अनुभव बताएं",
    suggestions: "कोई सुझाव?",
    submit: "प्रतिक्रिया भेजें",
    recipes: "सफलता की कहानियां",
    readStory: "पूरी कहानी पढ़ें"
  },
  [AppLanguage.GUJARATI]: {
    home: "ડેશબોર્ડ", health: "આરોગ્ય તપાસ", market: "નિર્ણય એન્જિન", finance: "નફો વિશ્લેષક", radar: "રોગચાળો રડાર", voice: "વોઇસ AI",
    voiceTitle: "સ્થાનિક ભાષા અવાજ સહાયક",
    voiceExplainer: "ગુજરાતી, હિન્દી, મરાઠી, તમિલ અથવા તેલુગુમાં કુદરતી રીતે બોલો. ટાઇપ કર્યા વગર ખોરાકની સલાહ, બજારના ભાવ અને કટોકટીમાં માર્ગદર્શન મેળવો.",
    voicePrompt: "માઇક દબાવો અને સ્પષ્ટ રીતે બોલો...",
    voiceOffline: "સ્થાનિક કટોકટી ડેટાબેઝ સાથે જોડાયેલ (ઓફલાઇન)",
    voiceOnline: "લાઇવ ક્લાઉડ ઇન્ટેલિજન્સ સાથે જોડાયેલ",
    analyzing: "વિશ્લેષણ ચાલુ છે...",
    welcome: "AniGuard AI માં સ્વાગત છે",
    vets: "ડોક્ટર શોધો", lab: "વિડિઓ લેબ",
    detect: "રોગ શોધક",
    healthDesc: "પશુઓના સ્વાસ્થ્યની તપાસ",
    financeDesc: "ડેરી નફાનું વિશ્લેષણ",
    schemes: "સરકારી યોજનાઓ",
    schemesDesc: "સબસિડી અને ગ્રાન્ટ",
    wasteHub: "બાયો-વેસ્ટ હબ",
    wasteDesc: "સંશોધકો સાથે જોડાઓ",
    reportOutbreakDesc: "સ્થાનિક રોગ એલર્ટ",
    activeRequests: "સંશોધન પૂછપરછ",
    research: "સંશોધન પોર્ટલ",
    guidelines: "સુરક્ષા નિયમો",
    feedback: "પ્રતિસાદ હબ",
    thankYou: "તમારા પ્રતિસાદ બદલ આભાર!",
    rateExperience: "તમારા અનુભવને રેટ કરો",
    suggestions: "કોઈ સૂચનો?",
    submit: "સબમિટ કરો",
    recipes: "સફળતાની વાતો",
    readStory: "આખી વાર્તા વાંચો"
  },
  [AppLanguage.TELUGU]: {
    home: "డ్యాష్‌బోర్డ్", health: "ఆరోగ్య స్కాన్", market: "నిర్ణయ ఇంజిన్", finance: "లాభ విశ్లేషకుడు", radar: "వ్యాధి రాడార్", voice: " వాయిస్ AI",
    voiceTitle: "స్థానిక భాష వాయిస్ అసిస్టెంట్",
    voiceExplainer: "తెలుగు, హిందీ, మరాఠీ, తమిళం లేదా గుజరాతీలో సహజంగా మాట్లాడండి. టైప్ చేయకుండా ఆహార సలహాలు, మార్కెట్ ధరలు మరియు అత్యవసర మార్గదర్శకత్వం పొందండి.",
    voicePrompt: "మైక్‌ని నొక్కి స్పష్టంగా మాట్లాడండి...",
    voiceOffline: "స్థానిక అత్యవసర డేటాబేస్‌కు అనుసంధానించబడింది (ఆఫ్ లైన్)",
    voiceOnline: "లైవ్ క్లౌడ్ ఇంటెలిజెన్స్‌కు అనుసంధానించబడింది",
    analyzing: "విశ్లేషణ జరుగుతోంది...",
    welcome: "AniGuard AI లోకి స్వాగతం",
    vets: "వైద్యుడిని కనుగొనండి", lab: "వీడియో ల్యాబ్",
    detect: "వ్యాధి గుర్తింపు",
    healthDesc: "పశువుల ఆరోగ్యం తనిఖీ",
    financeDesc: "డైరీ లాభాల విశ్లేషణ",
    schemes: "ప్రభుత్వ పథకాలు",
    schemesDesc: "సబ్సిడీలు & గ్రాంట్లు",
    wasteHub: "బయో-వేస్ట్ హబ్",
    wasteDesc: "పరిశోధకులతో కలవండి",
    reportOutbreakDesc: "వ్యాధి హెచ్చరికలు",
    activeRequests: "పరిశోధన విచారణలు",
    research: "పరిశోధన పోర్టல்",
    guidelines: "భద్రతా నిబంధనలు",
    feedback: "అభిప్రాయ కేంద్రం",
    thankYou: "మీ అభిప్రాయానికి ధన్యవాదాలు!",
    rateExperience: "అనుభవాన్ని రేట్ చేయండి",
    suggestions: "ఏదైనా సూచనలు?",
    submit: "సమర్పించు",
    recipes: "విజయ గాథలు",
    readStory: "పూర్తి కథ చదవండి"
  },
  [AppLanguage.MARATHI]: {
    home: "डॅशबोर्ड", health: "आरोग्य तपासणी", market: "निर्णय इंजिन", finance: "नफा विश्लेषक", radar: "रोग राडार", voice: "लाइव्ह AI",
    voiceTitle: "प्रादेशिक आवाज सहाय्यक",
    voiceExplainer: "मराठी, हिंदी, तामिळ, गुजराती किंवा तेलगूमध्ये नैसर्गिकरित्या बोला. चार्‍याचा सल्ला, बाजार भाव आणि आपत्कालीन मार्गदर्शन मिळवा.",
    voicePrompt: "माईक दाबा आणि स्पष्ट बोला...",
    voiceOffline: "स्थानिक आपत्कालीन डेटाबेसशी जोडलेले (ऑफलाइन)",
    voiceOnline: "लाइव्ह क्लाउड इंटेलिजन्सशी जोडलेले",
    analyzing: "विश्लेषण सुरू आहे...",
    welcome: "AniGuard AI मध्ये आपले स्वागत आहे",
    vets: "डॉक्टर शोधा", lab: "व्हिडिओ लॅब",
    detect: "रोग शोधक",
    healthDesc: "पशु आरोग्याची तपासणी करा",
    financeDesc: "डेअरी नफ्याचे विश्लेषण",
    schemes: "सरकारी योजना",
    schemesDesc: "अनुदान आणि मदती",
    wasteHub: "बायो-वेस्ट हब",
    wasteDesc: "संशोधकांशी संपर्क साधा",
    reportOutbreakDesc: "रोग चेतावणी",
    activeRequests: "संशोधन चौकशी",
    research: "संशोधन पोर्टल",
    guidelines: "सुरक्षा नियम",
    feedback: "प्रतिक्रिया केंद्र",
    thankYou: "तुमच्या प्रतिक्रियेबद्दल धन्यवाद!",
    rateExperience: "तुमचा अनुभव सांगा",
    suggestions: "काही सूचना?",
    submit: "पाठवा",
    recipes: "यशोगाथा",
    readStory: "पूर्ण कथा वाचा"
  },
  [AppLanguage.TAMIL]: {
    home: "டாஷ்போர்டு", health: "சுகாதார சோதனை", market: "முடிவு இயந்திரம்", finance: "லாப ஆய்வாளர்", radar: "நோய் ரேடார்", voice: "நேரடி AI",
    voiceTitle: "வட்டார மொழி குரல் உதவியாளர்",
    voiceExplainer: "தமிழ், இந்தி, மராத்தி அல்லது தெலுங்கில் இயல்பாகப் பேசுங்கள். தீவன ஆலோசனை மற்றும் சந்தை நிலவரங்களைப் பெறுங்கள்.",
    voicePrompt: "மைக்கை அழுத்தி தெளிவாகப் பேசுங்கள்...",
    voiceOffline: "உள்ளூர் அவசர தரவுத்தளத்துடன் இணைக்கப்பட்டுள்ளது (ஆஃப்லைன்)",
    voiceOnline: "நேரடி கிளவுட் இன்டெலிஜென்ஸுடன் இணைக்கப்பட்டுள்ளது",
    analyzing: "AI ஆய்வு செய்கிறது...",
    welcome: "AniGuard AI-க்கு உங்களை வரவேற்கிறோம்",
    vets: "மருத்துவர் தேடல்", lab: "வீடியோ ஆய்வகம்",
    detect: "நோய் கண்டறிதல்",
    healthDesc: "கால்நடை நோய்களைக் கண்டறியவும்",
    financeDesc: "பண்ணை லாபத்தை பகுப்பாய்வு செய்யவும்",
    schemes: "அரசு திட்டங்கள்",
    schemesDesc: "மானியங்கள் மற்றும் நிதியுதவி",
    wasteHub: "உயிர் கழிவு மையம்",
    wasteDesc: "ஆராய்ச்சியாளர்களுடன் இணையுங்கள்",
    reportOutbreakDesc: "உள்ளூர் நோய் எச்சரிக்கைகள்",
    activeRequests: "ஆராய்ச்சி விசாரணைகள்",
    research: "ஆராய்ச்சி போர்டல்",
    guidelines: "பாதுகாப்பு விதிகள்",
    feedback: "கருத்து மையம்",
    thankYou: "உங்கள் கருத்துக்கு நன்றி!",
    rateExperience: "உங்கள் அனுபவத்தை மதிப்பிடவும்",
    suggestions: "ஏதேனும் ஆலோசனைகள்?",
    submit: "சமர்ப்பிக்கவும்",
    recipes: "வெற்றி கதைகள்",
    readStory: "முழு கதையையும் படிக்கவும்"
  },
  // Fix: Added missing HINGLISH translations to UI_STRINGS to satisfy the Record<AppLanguage, any> requirement.
  [AppLanguage.HINGLISH]: {
    home: "Dashboard", health: "Health Scan", market: "Decision Engine", finance: "Profit Analyzer", radar: "Risk Radar", voice: "Live AI",
    voiceTitle: "Hinglish Voice Assistant",
    voiceExplainer: "Natural Hindi aur English mix mein bole. Feeding advice, market trends, aur emergency guidance bina type karein paayein.",
    voicePrompt: "Mic dabayein aur saaf bole...",
    voiceOffline: "Local Emergency Database se connected (Offline Mode)",
    voiceOnline: "Live Cloud Intelligence se connected",
    analyzing: "AI Processing...",
    welcome: "AniGuard AI mein aapka swagat hai",
    vets: "Vet Finder", lab: "Video Lab",
    detect: "Disease Detector",
    healthDesc: "Livestock disease scan karein",
    financeDesc: "Dairy profitability analyze karein",
    schemes: "Sarkari Schemes",
    schemesDesc: "Subsidies & grants",
    wasteHub: "Bio-Waste Hub",
    wasteDesc: "Researchers ke saath collab karein",
    reportOutbreakDesc: "Local disease alerts",
    activeRequests: "Research Inquiries",
    research: "Research Portal",
    guidelines: "Safety Protocols",
    feedback: "Feedback Hub",
    thankYou: "Feedback ke liye dhanyawad!",
    rateExperience: "Apna experience rate karein",
    suggestions: "Koi suggestions?",
    submit: "Feedback Submit karein",
    recipes: "Success Stories",
    readStory: "Poori kahani padhein"
  }
};
