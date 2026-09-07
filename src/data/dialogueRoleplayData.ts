import { RoleplayScenario, TargetLanguageCode } from '../types';

export const DIALOGUE_ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  // -------------------------------------------------------------
  // 1. ORDERING COFFEE & CAFÉ (ENGLISH)
  // -------------------------------------------------------------
  {
    id: 'rp_en_cafe',
    titleFa: 'سفارش قهوه در کافه لندن',
    titleNative: 'Ordering Coffee at a London Specialty Café',
    icon: 'Coffee',
    level: 'A1',
    targetLanguage: 'en',
    category: 'daily',
    descriptionFa: 'مکالمه با باریستا در یک کافه مدرن؛ سفارش لاته با شیر جو، پرسیدن درباره شیرینی روز و پرداخت هزینه.',
    situation: 'You walk into "The Artisan Bean" near Covent Garden, London. The friendly barista greets you at the counter.',
    userRole: 'Customer (مشتری کافه)',
    aiRole: 'Barista Alex (باریستای کافه)',
    aiAvatar: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    goals: [
      { id: 'g1', titleFa: 'سلام و احوالپرسی اولیه با باریستا', isCompleted: false },
      { id: 'g2', titleFa: 'سفارش قهوه لاته با شیر گیاهی (Oat Milk)', isCompleted: false },
      { id: 'g3', titleFa: 'پرسش درباره کروسان یا شیرینی‌های موجود', isCompleted: false },
      { id: 'g4', titleFa: 'درخواست به صورت بیرون‌بر (Takeaway) و پرداخت', isCompleted: false },
    ],
    keyVocabulary: [
      { word: 'Oat milk', translationFa: 'شیر جو دوسر', phonetic: '/oʊt mɪlk/' },
      { word: 'Takeaway / To go', translationFa: 'بیرون‌بر', phonetic: '/ˈteɪkəweɪ/' },
      { word: 'Pastry / Croissant', translationFa: 'شیرینی / کروسان', phonetic: '/ˈpeɪstri/' },
      { word: 'Decaf', translationFa: 'بدون کافئین', phonetic: '/ˈdiːkæf/' },
    ],
    starterMessages: [
      {
        role: 'ai',
        text: 'Good morning! Welcome to The Artisan Bean. How can I help you today?',
        translationFa: 'صبح بخیر! به کافه آرتیسان بین خوش آمدید. امروز چطور می‌تونم کمکتون کنم؟',
      },
    ],
    suggestedPhrases: [
      'Hi! Could I please get a large oat milk latte?',
      'Do you have any fresh almond croissants today?',
      'Can I get that to take away, please?',
      'Can I pay by contactless card?',
      'Could you make that with decaf coffee, please?',
    ],
    dialogueScript: [
      {
        speaker: 'ai',
        text: 'Good morning! Welcome to The Artisan Bean. How can I help you today?',
        translationFa: 'صبح بخیر! به کافه آرتیسان بین خوش آمدید. امروز چطور می‌تونم کمکتون کنم؟',
      },
      {
        speaker: 'user',
        text: 'Hi! Could I please get a large oat milk latte?',
        translationFa: 'سلام! می‌تونم لطفاً یک لاته بزرگ با شیر جو داشته باشم؟',
        phonetic: '/haɪ kʊd aɪ pliːz ɡɛt ə lɑːrdʒ oʊt mɪlk ˈlɑːteɪ/',
        expectedKeywords: ['latte', 'oat', 'milk', 'please', 'large'],
      },
      {
        speaker: 'ai',
        text: 'Sure thing! A large oat latte. Would you like any extra espresso shot or flavor syrup with that?',
        translationFa: 'حتماً! یک لاته بزرگ با شیر جو. آیا شات اسپرسو اضافه یا سیروپ طعم‌دار میل دارید؟',
      },
      {
        speaker: 'user',
        text: 'Just a single shot, thank you. Do you have any fresh almond croissants today?',
        translationFa: 'فقط یک شات معمولی، متشکرم. آیا امروز کروسان بادام تازه دارید؟',
        phonetic: '/dʒʌst ə ˈsɪŋɡəl ʃɑːt θæŋk juː duː juː hæv ˈɛni frɛʃ ˈɑːmənd kwɑːˈsɑːnts təˈdeɪ/',
        expectedKeywords: ['shot', 'fresh', 'almond', 'croissant'],
      },
      {
        speaker: 'ai',
        text: 'Yes, we just baked a fresh batch ten minutes ago! Would you like that for here or takeaway?',
        translationFa: 'بله، ده دقیقه پیش پختیم! برای اینجا میل می‌کنید یا بیرون‌بر؟',
      },
      {
        speaker: 'user',
        text: 'To take away, please. How much is that in total?',
        translationFa: 'بیرون‌بر لطفاً. مجموعاً چقدر می‌شود؟',
        phonetic: '/tuː teɪk əˈweɪ pliːz haʊ mʌtʃ ɪz ðæt ɪn ˈtoʊtəl/',
        expectedKeywords: ['take away', 'how much', 'total', 'please'],
      },
      {
        speaker: 'ai',
        text: 'That will be £6.50 altogether. You can tap your card on the terminal right here.',
        translationFa: 'مجموعاً ۶.۵۰ پوند می‌شود. می‌توانید کارتتان را روی دستگاه پوز لمس کنید.',
      },
      {
        speaker: 'user',
        text: 'Here you go. Thank you very much, have a wonderful day!',
        translationFa: 'بفرمایید. خیلی متشکرم، روز فوق‌العاده‌ای داشته باشید!',
        phonetic: '/hɪr juː ɡoʊ θæŋk juː ˈvɛri mʌtʃ hæv ə ˈwʌndərfəl deɪ/',
        expectedKeywords: ['thank you', 'day', 'wonderful'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 2. TECH JOB INTERVIEW (ENGLISH)
  // -------------------------------------------------------------
  {
    id: 'rp_en_interview',
    titleFa: 'مصاحبه کاری تخصصی نرم‌افزار',
    titleNative: 'Tech & Engineering Job Interview',
    icon: 'Briefcase',
    level: 'B2',
    targetLanguage: 'en',
    category: 'work',
    descriptionFa: 'شبیه‌ساز مصاحبه شغلی با مدیر ارشد؛ معرفی تجربیات کاری، حل چالش‌های فنی، پاسخ به سوالات رفتاری و سوال از مصاحبه‌کننده.',
    situation: 'You are in an online video interview with Sarah, Engineering Director at a high-growth tech company.',
    userRole: 'Software Engineer Candidate (متقاضی موقعیت شغلی)',
    aiRole: 'Sarah - Engineering Director (مدیر ارشد فنی)',
    aiAvatar: '💼',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    goals: [
      { id: 'g1', titleFa: 'معرفی سوابق کاری و تخصص اصلی خود', isCompleted: false },
      { id: 'g2', titleFa: 'توضیح یک چالش فنی پیچیده و نحوه حل آن', isCompleted: false },
      { id: 'g3', titleFa: 'پاسخ به سوال درباره کار تیمی و مدیریت تعارض', isCompleted: false },
      { id: 'g4', titleFa: 'پرسیدن سوال هوشمندانه درباره فرهنگ تیم یا آینده پروژه', isCompleted: false },
    ],
    keyVocabulary: [
      { word: 'Scalable architecture', translationFa: 'معماری مقیاس‌پذیر', phonetic: '/ˈskeɪləbəl ˈɑːrkɪtɛktʃər/' },
      { word: 'Problem-solving mindset', translationFa: 'ذهنیت حل مسئله', phonetic: '/ˈprɑːbləm ˈsɑːlvɪŋ/' },
      { word: 'Cross-functional team', translationFa: 'تیم میان‌رشته‌ای', phonetic: '/krɔːs ˈfʌŋkʃənl tiːm/' },
      { word: 'Key achievement', translationFa: 'دستاورد کلیدی', phonetic: '/kiː əˈtʃiːvmənt/' },
    ],
    starterMessages: [
      {
        role: 'ai',
        text: 'Hello! Thank you for taking the time to meet today. We were really impressed by your background. Could you start by introducing yourself and highlighting your key strengths?',
        translationFa: 'سلام! ممنون که وقت گذاشتید. رزومه شما بسیار چشمگیر بود. می‌توانید با معرفی خودتان و بیان نقاط قوت اصلی‌تان شروع کنید؟',
      },
    ],
    suggestedPhrases: [
      'Thank you for this opportunity. I have over five years of experience building modern web applications.',
      'My primary expertise is in frontend performance optimization and reactive state management.',
      'In my previous role, I reduced page load times by 40% using code splitting and lazy loading.',
      'What are the biggest technical challenges your team is currently focusing on?',
    ],
    dialogueScript: [
      {
        speaker: 'ai',
        text: 'Hello! Thank you for taking the time to meet today. We were really impressed by your background. Could you start by introducing yourself and highlighting your key strengths?',
        translationFa: 'سلام! ممنون که وقت گذاشتید. رزومه شما بسیار چشمگیر بود. می‌توانید با معرفی خودتان و بیان نقاط قوت اصلی‌تان شروع کنید؟',
      },
      {
        speaker: 'user',
        text: 'Thank you for having me. I have over four years of experience developing high-performance web applications with React and TypeScript.',
        translationFa: 'ممنون از این فرصت. من بیش از چهار سال تجربه در توسعه وب‌اپلیکیشن‌های پرسرعت با ری‌اکت و تایپ‌اسکریپت دارم.',
        phonetic: '/θæŋk juː fɔːr ˈhævɪŋ miː aɪ hæv ˈoʊvər fɔːr jɪrz ʌv ɪkˈspɪriəns/',
        expectedKeywords: ['experience', 'react', 'typescript', 'applications'],
      },
      {
        speaker: 'ai',
        text: 'That sounds great! Can you describe a challenging technical bug or bottleneck you solved recently?',
        translationFa: 'عالی به نظر می‌رسد! می‌توانید یک باگ فنی پیچیده یا گلوگاهی را که اخیراً برطرف کردید توضیح دهید؟',
      },
      {
        speaker: 'user',
        text: 'We faced major memory leaks in real-time data streaming, so I refactored the subscriptions and optimized garbage collection, which cut CPU usage by thirty percent.',
        translationFa: 'ما با نشتی حافظه در استریم داده‌های لحظه‌ای مواجه بودیم، بنابراین اشتراک‌ها را بازنویسی و مصرف پردازنده را ۳۰ درصد کاهش دادم.',
        phonetic: '/wiː feɪst ˈmeɪdʒər ˈmɛməri liːks soʊ aɪ ˌriːˈfæktərd ðə sʌbˈskrɪpʃənz/',
        expectedKeywords: ['memory', 'leak', 'optimized', 'percent', 'data'],
      },
      {
        speaker: 'ai',
        text: 'Impressive problem solving! How do you typically handle disagreements with designers or product managers regarding technical feasibility?',
        translationFa: 'حل مسئله فوق‌العاده‌ای بود! معمولاً در مواجهه با اختلاف‌نظر با طراحان یا مدیران محصول بر سر امکان‌پذیری فنی چگونه عمل می‌کنید؟',
      },
      {
        speaker: 'user',
        text: 'I believe in transparent communication. I usually prepare visual prototypes and explain the trade-offs clearly to find a win-win solution.',
        translationFa: 'من به ارتباط شفاف اعتقاد دارم. معمولاً پروتوتایپ‌های بصری می‌سازم و بده‌بستان‌ها را واضح توضیح می‌دهم تا به راهکار برد-برد برسیم.',
        phonetic: '/aɪ bɪˈliːv ɪn trænsˈpærənt kəˌmjuːnɪˈkeɪʃən aɪ ˈjuːʒuəli prɪˈpɛr ˈvɪʒuəl ˈproʊtətaɪps/',
        expectedKeywords: ['communication', 'transparent', 'prototypes', 'solution'],
      },
      {
        speaker: 'ai',
        text: 'Spot on. Do you have any questions for me about the team roadmap or engineering culture?',
        translationFa: 'دقیقاً همین‌طور است. آیا سوالی از من درباره نقشه راه تیم یا فرهنگ مهندسی دارید؟',
      },
      {
        speaker: 'user',
        text: 'Yes! What does success look like for this position in the first six months, and how do you support continuous learning?',
        translationFa: 'بله! موفقیت در این موقعیت شغلی در شش ماه اول چگونه تعریف می‌شود و چگونه از یادگیری مستمر حمایت می‌کنید؟',
        phonetic: '/jɛs wʌt dʌz səkˈsɛs lʊk laɪk fɔːr ðɪs pəˈzɪʃən ɪn ðə fɜːrst sɪks mʌnθs/',
        expectedKeywords: ['success', 'six months', 'learning', 'position'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 3. AIRPORT CHECK-IN & BOARDING (ENGLISH)
  // -------------------------------------------------------------
  {
    id: 'rp_en_airport',
    titleFa: 'چک‌این و گیت پرواز فرودگاه',
    titleNative: 'Airport Check-in & Gate Boarding',
    icon: 'Plane',
    level: 'A2',
    targetLanguage: 'en',
    category: 'travel',
    descriptionFa: 'تحویل بار، درخواست صندلی کنار پنجره، بررسی کارت پرواز و زمان سوار شدن به هواپیما.',
    situation: 'You are checking in at London Heathrow Terminal 5 for your flight to Frankfurt.',
    userRole: 'Passenger (مسافر پرواز)',
    aiRole: 'Check-in Officer Daniel (مامور گیت پرواز)',
    aiAvatar: '✈️',
    imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600&auto=format&fit=crop&q=80',
    goals: [
      { id: 'g1', titleFa: 'ارائه پاسپورت و شماره رزرو به مامور', isCompleted: false },
      { id: 'g2', titleFa: 'تحویل یک چمدان و تایید عدم وجود اشیای ممنوعه', isCompleted: false },
      { id: 'g3', titleFa: 'درخواست صندلی کنار پنجره (Window Seat)', isCompleted: false },
      { id: 'g4', titleFa: 'پرسش درباره شماره گیت و زمان شروع سوار شدن', isCompleted: false },
    ],
    keyVocabulary: [
      { word: 'Boarding pass', translationFa: 'کارت پرواز', phonetic: '/ˈbɔːrdɪŋ pæs/' },
      { word: 'Window seat', translationFa: 'صندلی کنار پنجره', phonetic: '/ˈwɪndoʊ siːt/' },
      { word: 'Checked luggage', translationFa: 'بار تحویلی / چمدان', phonetic: '/tʃɛkt ˈlʌɡɪdʒ/' },
      { word: 'Gate number', translationFa: 'شماره گیت خروجی', phonetic: '/ɡeɪt ˈnʌmbər/' },
    ],
    starterMessages: [
      {
        role: 'ai',
        text: 'Good afternoon. Can I have your passport and ticket confirmation, please?',
        translationFa: 'عصر بخیر. می‌توانم پاسپورت و تاییدیه بلیت شما را داشته باشم؟',
      },
    ],
    suggestedPhrases: [
      'Good afternoon. Here is my passport and booking code.',
      'I have one suitcase to check in and one carry-on bag.',
      'Could I please request a window seat if available?',
      'What time will the gate open for boarding?',
    ],
    dialogueScript: [
      {
        speaker: 'ai',
        text: 'Good afternoon. Can I have your passport and ticket confirmation, please?',
        translationFa: 'عصر بخیر. می‌توانم پاسپورت و تاییدیه بلیت شما را داشته باشم؟',
      },
      {
        speaker: 'user',
        text: 'Good afternoon. Here is my passport and booking confirmation.',
        translationFa: 'عصر بخیر. بفرمایید این پاسپورت و تاییدیه رزرو من است.',
        phonetic: '/ɡʊd ˌæftərˈnuːn hɪr ɪz maɪ ˈpæspɔːrt ænd ˈbʊkɪŋ ˌkɑːnfərˈmeɪʃən/',
        expectedKeywords: ['passport', 'booking', 'afternoon'],
      },
      {
        speaker: 'ai',
        text: 'Thank you. Are you checking in any bags today? Please place them onto the scale.',
        translationFa: 'متشکرم. آیا امروز چمدانی برای تحویل دارید؟ لطفاً روی ترازو بگذارید.',
      },
      {
        speaker: 'user',
        text: 'Yes, just this one suitcase. It weighs eighteen kilograms.',
        translationFa: 'بله، فقط همین یک چمدان. وزنش ۱۸ کیلوگرم است.',
        phonetic: '/jɛs dʒʌst ðɪs wʌn ˈsuːtkeɪs ɪt weɪz ˈeɪˈtiːn ˈkɪləɡræmz/',
        expectedKeywords: ['suitcase', 'weighs', 'kilograms'],
      },
      {
        speaker: 'ai',
        text: 'Perfect, well within the limit. Do you have any seat preference for today\'s flight?',
        translationFa: 'عالی، کاملاً در محدوده مجاز است. آیا اولویت خاصی برای صندلی دارید؟',
      },
      {
        speaker: 'user',
        text: 'Could I please get a window seat towards the front?',
        translationFa: 'می‌تونم لطفاً یک صندلی کنار پنجره در ردیف‌های جلو داشته باشم؟',
        phonetic: '/kʊd aɪ pliːz ɡɛt ə ˈwɪndoʊ siːt təˈwɔːrdz ðə frʌnt/',
        expectedKeywords: ['window', 'seat', 'front', 'please'],
      },
      {
        speaker: 'ai',
        text: 'You got it! Seat 12A. Here is your boarding pass. Gate B24 will open at 16:30.',
        translationFa: 'ثبت شد! صندلی ۱۲A. بفرمایید این کارت پروازتان. گیت B24 ساعت ۱۶:۳۰ باز می‌شود.',
      },
      {
        speaker: 'user',
        text: 'Thank you very much. Have a great day!',
        translationFa: 'خیلی ممنونم. روز خوبی داشته باشید!',
        phonetic: '/θæŋk juː ˈvɛri mʌtʃ hæv ə ɡreɪt deɪ/',
        expectedKeywords: ['thank you', 'great day'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 4. HOTEL CHECK-IN & ROOM SERVICE (ENGLISH)
  // -------------------------------------------------------------
  {
    id: 'rp_en_hotel',
    titleFa: 'پذیرش و خدمات هتل',
    titleNative: 'Hotel Check-in & Concierge Assistance',
    icon: 'Building',
    level: 'A2',
    targetLanguage: 'en',
    category: 'travel',
    descriptionFa: 'دریافت کلید اتاق، پرسیدن درباره ساعت صبحانه، رمز وای‌فای و درخواست حوله یا خدمات اتاق.',
    situation: 'You have just arrived at "The Grand Metropolitan Hotel" in New York.',
    userRole: 'Hotel Guest (مهمان هتل)',
    aiRole: 'Front Desk Receptionist Emma (مسئول پذیرش هتل)',
    aiAvatar: '🏨',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
    goals: [
      { id: 'g1', titleFa: 'اعلام نام و کد رزرو اتاق دونفره', isCompleted: false },
      { id: 'g2', titleFa: 'پرسیدن درباره ساعت و محل سرو صبحانه', isCompleted: false },
      { id: 'g3', titleFa: 'دریافت رمز عبور اینترنت وای‌فای هتل', isCompleted: false },
      { id: 'g4', titleFa: 'درخواست راهنمایی برای رساندن چمدان‌ها به اتاق', isCompleted: false },
    ],
    keyVocabulary: [
      { word: 'Reservation / Booking', translationFa: 'رزرو', phonetic: '/ˌrɛzərˈveɪʃən/' },
      { word: 'Complimentary breakfast', translationFa: 'صبحانه رایگان هتل', phonetic: '/ˌkɑːmplɪˈmɛntəri ˈbrɛkfəst/' },
      { word: 'Key card', translationFa: 'کارت کلید اتاق', phonetic: '/kiː kɑːrd/' },
      { word: 'High-speed Wi-Fi', translationFa: 'اینترنت پرسرعت', phonetic: '/haɪ spiːd ˈwaɪfaɪ/' },
    ],
    starterMessages: [
      {
        role: 'ai',
        text: 'Welcome to The Grand Metropolitan! How may I assist you this evening?',
        translationFa: 'به هتل گرند متروپولیتن خوش آمدید! عصر امروز چطور می‌توانم در خدمتتان باشم؟',
      },
    ],
    suggestedPhrases: [
      'Hello! I have a reservation under the name Hossein Fathi.',
      'What time is breakfast served in the morning?',
      'Could you please give me the Wi-Fi password?',
      'Is there a gym or swimming pool available on the premises?',
    ],
    dialogueScript: [
      {
        speaker: 'ai',
        text: 'Welcome to The Grand Metropolitan! How may I assist you this evening?',
        translationFa: 'به هتل گرند متروپولیتن خوش آمدید! عصر امروز چطور می‌توانم در خدمتتان باشم؟',
      },
      {
        speaker: 'user',
        text: 'Good evening. I have a reservation for three nights under Hossein.',
        translationFa: 'عصر بخیر. من یک رزرو به مدت سه شب به نام حسین دارم.',
        phonetic: '/ɡʊd ˈiːvnɪŋ aɪ hæv ə ˌrɛzərˈveɪʃən fɔːr θriː naɪts ˈʌndər hoʊˈseɪn/',
        expectedKeywords: ['reservation', 'nights', 'evening'],
      },
      {
        speaker: 'ai',
        text: 'Found it! A deluxe king room on the 8th floor with city views. Here are your key cards.',
        translationFa: 'پیدا شد! اتاق لوکس کینگ در طبقه هشتم با نمای شهر. بفرمایید این کارت‌های کلید شماست.',
      },
      {
        speaker: 'user',
        text: 'Thank you. What time is breakfast served in the morning?',
        translationFa: 'متشکرم. صبح‌ها صبحانه چه ساعتی سرو می‌شود؟',
        phonetic: '/θæŋk juː wʌt taɪm ɪz ˈbrɛkfəst sɜːrvd ɪn ðə ˈmɔːrnɪŋ/',
        expectedKeywords: ['breakfast', 'time', 'served', 'morning'],
      },
      {
        speaker: 'ai',
        text: 'Breakfast buffet is served from 6:30 to 10:30 AM at the terrace restaurant on the 2nd floor.',
        translationFa: 'بوفه صبحانه از ساعت ۶:۳۰ تا ۱۰:۳۰ صبح در رستوران تراس طبقه دوم سرو می‌شود.',
      },
      {
        speaker: 'user',
        text: 'Great! Could you also give me the Wi-Fi password?',
        translationFa: 'عالیه! آیا می‌توانید رمز وای‌فای را هم به من بدهید؟',
        phonetic: '/ɡreɪt kʊd juː ˈɔːlsoʊ ɡɪv miː ðə ˈwaɪfaɪ ˈpæswɜːrd/',
        expectedKeywords: ['wifi', 'password', 'please'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 5. GERMAN BAKERY & GROCERY (GERMAN - DEUTSCH)
  // -------------------------------------------------------------
  {
    id: 'rp_de_bakery',
    titleFa: 'خرید از نانوایی سنتی آلمان',
    titleNative: 'Beim traditionellen Bäcker in Berlin',
    icon: 'Croissant',
    level: 'A1',
    targetLanguage: 'de',
    category: 'daily',
    descriptionFa: 'خرید نان بروتشن، چوب‌شور پرتزل و کیک سیب به زبان آلمانی با تلفظ دقیق و احوالپرسی رسمی.',
    situation: 'Sie sind in einer duftenden Bäckerei am Alexanderplatz in Berlin.',
    userRole: 'Kunde (مشتری)',
    aiRole: 'Bäckereiverkäuferin Frau Weber (فروشنده نانوایی)',
    aiAvatar: '🥨',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    goals: [
      { id: 'g1', titleFa: 'احوالپرسی به آلمانی (Guten Tag)', isCompleted: false },
      { id: 'g2', titleFa: 'سفارش ۲ عدد بروتشن و ۱ نان چاودار', isCompleted: false },
      { id: 'g3', titleFa: 'پرسش درباره قیمت کیک سیب (Apfelkuchen)', isCompleted: false },
      { id: 'g4', titleFa: 'پرداخت به یورو و خداحافظی مودبانه', isCompleted: false },
    ],
    keyVocabulary: [
      { word: 'Das Brötchen', translationFa: 'نان لقمه‌ای گرد', phonetic: '/ˈbʁøːtçən/' },
      { word: 'Die Brezel', translationFa: 'نان پرتزل چوب‌شوری', phonetic: '/ˈbʁeːt͡sl̩/' },
      { word: 'Das Roggenbrot', translationFa: 'نان چاودار تیره', phonetic: '/ˈʁɔɡn̩ˌbʁoːt/' },
      { word: 'Zusammen', translationFa: 'روی هم / مجموعاً', phonetic: '/t͡suˈzamən/' },
    ],
    starterMessages: [
      {
        role: 'ai',
        text: 'Guten Tag! Herzlich willkommen. Was darf ich Ihnen bringen?',
        translationFa: 'روز بخیر! خیلی خوش آمدید. چه چیزی براتون بیارم؟',
      },
    ],
    suggestedPhrases: [
      'Guten Tag! Ich hätte gerne zwei Brezeln und ein Roggenbrot, bitte.',
      'Haben Sie auch frischen Apfelkuchen?',
      'Wie viel kostet das zusammen?',
      'Ich bezahle mit Karte, bitte. Auf Wiedersehen!',
    ],
    dialogueScript: [
      {
        speaker: 'ai',
        text: 'Guten Tag! Herzlich willkommen. Was darf ich Ihnen bringen?',
        translationFa: 'روز بخیر! خیلی خوش آمدید. چه چیزی براتون بیارم؟',
      },
      {
        speaker: 'user',
        text: 'Guten Tag! Ich hätte gerne zwei Brezeln und ein Vollkornbrot, bitte.',
        translationFa: 'روز بخیر! من دو عدد پرتزل و یک نان سبوس‌دار میل دارم، لطفاً.',
        phonetic: '/ˈɡuːtn̩ taːk ɪç ˈhɛtə ˈɡɛʁnə t͡svaɪ ˈbʁeːt͡sl̩n ʊnt aɪn ˈfɔlˌkɔʁnˌbʁoːt ˈbɪtə/',
        expectedKeywords: ['guten tag', 'brezeln', 'brot', 'bitte'],
      },
      {
        speaker: 'ai',
        text: 'Sehr gerne! Darf es sonst noch etwas sein? Wir haben heute frischen Käsekuchen.',
        translationFa: 'با کمال میل! آیا چیز دیگری هم میل دارید؟ امروز کیک پنیر تازه هم داریم.',
      },
      {
        speaker: 'user',
        text: 'Ja, bitte ein Stück Käsekuchen zum Mitnehmen. Wie viel kostet das zusammen?',
        translationFa: 'بله، لطفاً یک برش چیزکیک برای بیرون‌بر. مجموعاً چقدر می‌شود؟',
        phonetic: '/jaː ˈbɪtə aɪn ʃtʏk ˈkɛːzəˌkuːxn̩ t͡sʊm ˈmɪtneːmən viː fiːl ˈkɔstət das t͡suˈzamən/',
        expectedKeywords: ['käsekuchen', 'wie viel', 'kostet', 'zusammen'],
      },
      {
        speaker: 'ai',
        text: 'Das macht zusammen genau 6 Euro 40, bitte.',
        translationFa: 'مجموعاً دقیقاً ۶ یورو و ۴۰ سنت می‌شود، لطفاً.',
      },
      {
        speaker: 'user',
        text: 'Hier sind sieben Euro. Stimmt so, vielen Dank und schönen Tag!',
        translationFa: 'بفرمایید این هفت یورو است. بقیه‌اش برای خودتان، خیلی ممنون و روز خوبی داشته باشید!',
        phonetic: '/hiːɐ̯ zɪnt ˈziːbn̩ ˈɔɪ̯ʁo ʃtɪmt zoː ˈfiːlən daŋk ʊnt ˈʃøːnən taːk/',
        expectedKeywords: ['euro', 'vielen dank', 'schönen tag'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 6. FRENCH CAFÉ & BISTRO (FRENCH - FRANÇAIS)
  // -------------------------------------------------------------
  {
    id: 'rp_fr_bistro',
    titleFa: 'سفارش در کافه پاریسی',
    titleNative: 'Au Café Parisien à Saint-Germain',
    icon: 'Utensils',
    level: 'A2',
    targetLanguage: 'fr',
    category: 'daily',
    descriptionFa: 'سفارش قهوه فرانسوی (Café au lait)، کروسان و درخواست صورت‌حساب با عبارات شیک و مؤدبانه.',
    situation: 'Vous êtes assis en terrasse dans un bistrot charmant à Paris.',
    userRole: 'Client (مشتری کافه)',
    aiRole: 'Le Serveur Pierre (گارسون کافه)',
    aiAvatar: '🥐',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    goals: [
      { id: 'g1', titleFa: 'احوالپرسی مؤدبانه (Bonjour Monsieur)', isCompleted: false },
      { id: 'g2', titleFa: 'سفارش قهوه کرم یا کافه لاته با کروسان', isCompleted: false },
      { id: 'g3', titleFa: 'درخواست یک لیوان آب (Une carafe d\'eau)', isCompleted: false },
      { id: 'g4', titleFa: 'درخواست صورت‌حساب (L\'addition, s\'il vous plaît)', isCompleted: false },
    ],
    keyVocabulary: [
      { word: 'Un café crème', translationFa: 'قهوه با خامه و شیر', phonetic: '/œ̃ kafe kʁɛm/' },
      { word: 'Le croissant chaud', translationFa: 'کروسان گرم', phonetic: '/lə kʁwasɑ̃ ʃo/' },
      { word: 'L\'addition', translationFa: 'صورت‌حساب', phonetic: '/ladiˈsjɔ̃/' },
      { word: 'S\'il vous plaît', translationFa: 'لطفاً (محترمانه)', phonetic: '/sil vu plɛ/' },
    ],
    starterMessages: [
      {
        role: 'ai',
        text: 'Bonjour ! Bienvenue au Bistro des Arts. Que désirez-vous prendre ?',
        translationFa: 'سلام! به بیسترو دیزآر خوش آمدید. چه چیزی میل دارید میل بفرمایید؟',
      },
    ],
    suggestedPhrases: [
      'Bonjour Monsieur ! Je voudrais un café crème et un croissant, s\'il vous plaît.',
      'Pourriez-vous m\'apporter une carafe d\'eau fraîche ?',
      'L\'addition, s\'il vous plaît. Est-ce que vous prenez la carte ?',
      'Merci beaucoup, bonne journée !',
    ],
    dialogueScript: [
      {
        speaker: 'ai',
        text: 'Bonjour ! Bienvenue au Bistro des Arts. Que désirez-vous prendre ?',
        translationFa: 'سلام! به بیسترو دیزآر خوش آمدید. چه چیزی میل دارید میل بفرمایید؟',
      },
      {
        speaker: 'user',
        text: 'Bonjour ! Je voudrais un café crème et un croissant au beurre, s\'il vous plaît.',
        translationFa: 'سلام! من یک کافه کرم و یک کروسان کره‌ای میل دارم، لطفاً.',
        phonetic: '/bɔ̃ʒuʁ ʒə vudʁɛ œ̃ kafe kʁɛm e œ̃ kʁwasɑ̃ o bœʁ sil vu plɛ/',
        expectedKeywords: ['bonjour', 'café crème', 'croissant', 'plaît'],
      },
      {
        speaker: 'ai',
        text: 'Très bien ! Tout de suite. Désirez-vous également un verre d\'eau ?',
        translationFa: 'بسیار عالی! فوراً حاضر می‌کنم. آیا یک لیوان آب هم میل دارید؟',
      },
      {
        speaker: 'user',
        text: 'Oui, une carafe d\'eau, merci beaucoup.',
        translationFa: 'بله، یک پارچ آب، خیلی ممنونم.',
        phonetic: '/wi yn kaʁaf do mɛʁsi boku/',
        expectedKeywords: ['carafe', 'eau', 'merci'],
      },
      {
        speaker: 'ai',
        text: 'Voilà pour vous. Bon appétit !',
        translationFa: 'بفرمایید این هم سفارش شما. نوش جان!',
      },
      {
        speaker: 'user',
        text: 'L\'addition, s\'il vous plaît. C\'était délicieux.',
        translationFa: 'صورت‌حساب لطفاً. فوق‌العاده خوشمزه بود.',
        phonetic: '/ladiˈsjɔ̃ sil vu plɛ setɛ deliˈsjø/',
        expectedKeywords: ['addition', 'plaît', 'délicieux'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 7. SPANISH TAPAS RESTAURANT (SPANISH - ESPAÑOL)
  // -------------------------------------------------------------
  {
    id: 'rp_es_restaurant',
    titleFa: 'سفارش تاپاس در رستوران مادرید',
    titleNative: 'Tapas y Cena en Madrid',
    icon: 'Utensils',
    level: 'A2',
    targetLanguage: 'es',
    category: 'daily',
    descriptionFa: 'سفارش پاتاتاس براواس، پائلا و نوشیدنی به زبان اسپانیایی همراه با درخواست صورت‌حساب.',
    situation: 'Estás en una animada taberna cerca de la Plaza Mayor en Madrid.',
    userRole: 'Cliente (مشتری)',
    aiRole: 'Camarero Carlos (گارسون رستوران)',
    aiAvatar: '🥘',
    imageUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600&auto=format&fit=crop&q=80',
    goals: [
      { id: 'g1', titleFa: 'احوالپرسی و درخواست میز برای دو نفر', isCompleted: false },
      { id: 'g2', titleFa: 'سفارش تاپاس و غذای اصلی اسپانیایی', isCompleted: false },
      { id: 'g3', titleFa: 'پرسش درباره ترکیبات غذا و توصیه سرآشپز', isCompleted: false },
      { id: 'g4', titleFa: 'درخواست صورت‌حساب (La cuenta, por favor)', isCompleted: false },
    ],
    keyVocabulary: [
      { word: 'Las tapas', translationFa: 'پیش‌غذاهای معروف اسپانیایی', phonetic: '/las ˈtapas/' },
      { word: 'Patatas bravas', translationFa: 'سیب‌زمینی تند سوخاری', phonetic: '/paˈtatas ˈbɾaβas/' },
      { word: 'La cuenta, por favor', translationFa: 'صورت‌حساب لطفاً', phonetic: '/la ˈkwenta poɾ faˈβoɾ/' },
      { word: 'Delicioso', translationFa: 'بسیار لذیذ', phonetic: '/deliˈθjoso/' },
    ],
    starterMessages: [
      {
        role: 'ai',
        text: '¡Buenas noches! Bienvenidos a La Taberna Real. ¿Tienen reserva o prefieren mesa en la terraza?',
        translationFa: 'عصر بخیر! به لا تابِرنا ریال خوش آمدید. رزرو دارید یا میز در تراس را ترجیح می‌دهید؟',
      },
    ],
    suggestedPhrases: [
      '¡Buenas noches! Una mesa para dos personas en la terraza, por favor.',
      '¿Qué nos recomienda para picar de primero?',
      'Queremos probar las patatas bravas y la paella de mariscos.',
      'La cuenta, por favor. Todo estaba riquísimo.',
    ],
    dialogueScript: [
      {
        speaker: 'ai',
        text: '¡Buenas noches! Bienvenidos a La Taberna Real. ¿Tienen reserva o prefieren mesa en la terraza?',
        translationFa: 'عصر بخیر! به لا تابِرنا ریال خوش آمدید. رزرو دارید یا میز در تراس را ترجیح می‌دهید؟',
      },
      {
        speaker: 'user',
        text: '¡Buenas noches! Queremos una mesa para dos personas en la terraza, por favor.',
        translationFa: 'عصر بخیر! ما یک میز دونفره در تراس می‌خواهیم، لطفاً.',
        phonetic: '/ˈbwenaz ˈnotʃes keˈɾemos ˈuna ˈmesa ˈpaɾa ðos peɾˈsonas/',
        expectedKeywords: ['buenas noches', 'mesa', 'dos', 'terraza'],
      },
      {
        speaker: 'ai',
        text: '¡Perfecto, pasen por aquí! ¿Qué les gustaría pedir de comer y beber?',
        translationFa: 'عالی، بفرمایید از این طرف! چه چیزی برای غذا و نوشیدنی میل دارید سفارش دهید؟',
      },
      {
        speaker: 'user',
        text: 'Queremos unas patatas bravas y una paella de verduras, por favor.',
        translationFa: 'ما مقداری پاتاتاس براواس و یک پائلای سبزیجات می‌خواهیم، لطفاً.',
        phonetic: '/keˈɾemos ˈunas paˈtatas ˈbɾaβas i ˈuna paˈeʎa/',
        expectedKeywords: ['patatas bravas', 'paella', 'por favor'],
      },
      {
        speaker: 'ai',
        text: '¡Excelente elección! La paella tardará unos 15 minutos.',
        translationFa: 'انتخاب فوق‌العاده‌ای است! پائلا حدود ۱۵ دقیقه طول می‌کشد.',
      },
      {
        speaker: 'user',
        text: 'Muchas gracias. Y la cuenta, por favor, cuando esté lista.',
        translationFa: 'خیلی متشکرم. و صورت‌حساب لطفاً هر وقت آماده شد.',
        phonetic: '/ˈmutʃaz ˈɣɾasjas i la ˈkwenta poɾ faˈβoɾ/',
        expectedKeywords: ['cuenta', 'por favor', 'gracias'],
      },
    ],
  },

  // -------------------------------------------------------------
  // 8. TURKISH GRAND BAZAAR & TEA (TURKISH - TÜRKÇE)
  // -------------------------------------------------------------
  {
    id: 'rp_tr_bazaar',
    titleFa: 'خرید در بازار بزرگ استانبول',
    titleNative: 'Kapalıçarşı\'da Alışveriş ve Çay',
    icon: 'ShoppingBag',
    level: 'A2',
    targetLanguage: 'tr',
    category: 'daily',
    descriptionFa: 'گفتگو با فروشنده، پرسیدن قیمت سوغات، تخفیف گرفتن مودبانه و نوشیدن چای ترکی.',
    situation: 'İstanbul Kapalıçarşı\'da bir lokum ve hediyelik eşya dükkanındasınız.',
    userRole: 'Müşteri (مشتری و خریدار)',
    aiRole: 'Esnaf Ahmet Bey (فروشنده صمیمی بازار)',
    aiAvatar: '🇹🇷',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&auto=format&fit=crop&q=80',
    goals: [
      { id: 'g1', titleFa: 'احوالپرسی سنتی ترکی (Kolay gelsin / Merhaba)', isCompleted: false },
      { id: 'g2', titleFa: 'پرسیدن قیمت راحت‌الحلقوم (Lokum) و قهوه ترکی', isCompleted: false },
      { id: 'g3', titleFa: 'درخواست تخفیف دوستانه (Bir indirim yapar mısınız?)', isCompleted: false },
      { id: 'g4', titleFa: 'تشکر و ابراز خرسندی (Çok teşekkür ederim)', isCompleted: false },
    ],
    keyVocabulary: [
      { word: 'Kolay gelsin', translationFa: 'خدا قوت / خسته نباشید', phonetic: '/koˈlaj ɟelˈsin/' },
      { word: 'Fiyatı ne kadar?', translationFa: 'قیمتش چقدره؟', phonetic: '/fi.jaˈtɯ ne kaˈdaɾ/' },
      { word: 'İndirim', translationFa: 'تخفیف', phonetic: '/in.diˈɾim/' },
      { word: 'Türk kahvesi', translationFa: 'قهوه ترک', phonetic: '/tyɾk kahveˈsi/' },
    ],
    starterMessages: [
      {
        role: 'ai',
        text: 'Merhaba, hoş geldiniz! Buyrun, bir fincan sıcak tavşan kanı çay ikram edeyim size.',
        translationFa: 'سلام، خوش آمدید! بفرمایید، اجازه دهید یک فنجان چای داغ دبش به شما تعارف کنم.',
      },
    ],
    suggestedPhrases: [
      'Merhaba! Kolay gelsin. Fıstıklı lokumun kilosu ne kadar?',
      'Biraz indirim yapabilir misiniz?',
      'İki kutu lokum ve bir paket Türk kahvesi alacağım.',
      'Çok teşekkürler, hayırlı işler!',
    ],
    dialogueScript: [
      {
        speaker: 'ai',
        text: 'Merhaba, hoş geldiniz! Buyrun, bir fincan sıcak tavşan kanı çay ikram edeyim size.',
        translationFa: 'سلام، خوش آمدید! بفرمایید، اجازه دهید یک فنجان چای داغ دبش به شما تعارف کنم.',
      },
      {
        speaker: 'user',
        text: 'Merhaba, kolay gelsin! Fıstıklı lokumun kutusu ne kadar?',
        translationFa: 'سلام، خدا قوت! هر جعبه باسلوق و راحت‌الحلقوم پسته چنده؟',
        phonetic: '/meɾhaˈba koˈlaj ɟelˈsin fɯstɯkˈlɯ lokuˈmun kutuˈsu ne kaˈdaɾ/',
        expectedKeywords: ['merhaba', 'kolay gelsin', 'lokum', 'ne kadar'],
      },
      {
        speaker: 'ai',
        text: 'Kutusu 250 Lira efendim. Taze Antep fıstıklı, çok özel.',
        translationFa: 'جعبه‌ای ۲۵۰ لیر است قربان. با پسته تازه عنتاب، بسیار ویژه است.',
      },
      {
        speaker: 'user',
        text: 'İki kutu alırsam biraz indirim yapar mısınız?',
        translationFa: 'اگر دو جعبه بردارم کمی تخفیف می‌دهید؟',
        phonetic: '/iˈci kuˈtu aˈlɯɾsam biˈɾaz indiˈɾim jaˈpaɾ mɯsɯˈnɯz/',
        expectedKeywords: ['kutu', 'indirim', 'yapar mısınız'],
      },
      {
        speaker: 'ai',
        text: 'Sizin güzel hatırınız için iki kutuyu 400 Lira yaparım!',
        translationFa: 'به خاطر روی گل شما دو جعبه را ۴۰۰ لیر حساب می‌کنم!',
      },
      {
        speaker: 'user',
        text: 'Harika! Çok teşekkür ederim, hayırlı işler bol kazançlar.',
        translationFa: 'عالیه! خیلی متشکرم، کسب‌وکار پربرکتی داشته باشید.',
        phonetic: '/haːɾiˈka tʃok teʃecˈcyɾ eˈdeɾim haˈjɯɾlɯ iʃˈleɾ/',
        expectedKeywords: ['teşekkür', 'harika', 'hayırlı işler'],
      },
    ],
  },
];

export function getRoleplayScenariosByLanguage(lang: TargetLanguageCode): RoleplayScenario[] {
  const filtered = DIALOGUE_ROLEPLAY_SCENARIOS.filter((s) => s.targetLanguage === lang);
  if (filtered.length > 0) return filtered;
  // If specific language has fewer scenarios, return all or English defaults
  return DIALOGUE_ROLEPLAY_SCENARIOS;
}
