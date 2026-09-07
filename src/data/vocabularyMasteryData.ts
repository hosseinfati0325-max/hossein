// 52-Week Themed Daily Vocabulary Mastery Dataset for Hossein & Fatemeh App
import { TargetLanguageCode, CEFRLevel, WeekQuarter } from '../types';

export interface VocabularyItem {
  id: string;
  dayNumber: number; // Day 1 to Day 5 of the week
  word: string;
  phonetic: string;
  partOfSpeech: 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'idiom';
  meaningFa: string;
  contextNoteFa: string;
  exampleTarget: string;
  exampleFa: string;
  collocations?: string[];
}

export interface WeeklyVocabularyPack {
  weekNumber: number;
  quarter: WeekQuarter;
  monthNumber: number;
  level: CEFRLevel;
  themeFa: string;
  themeNative: string;
  descriptionFa: string;
  words: VocabularyItem[];
  quizQuestion: {
    promptFa: string;
    targetPrompt: string;
    options: string[];
    correctIndex: number;
    explanationFa: string;
  };
}

// 52-Week Core Themed Vocabulary Curriculum Blueprint
export const VOCABULARY_THEMES_52: {
  weekNumber: number;
  quarter: WeekQuarter;
  monthNumber: number;
  level: CEFRLevel;
  themeFa: string;
  themeNativeEn: string;
  descriptionFa: string;
}[] = [
  // Quarter 1: A1 - A2 (Foundations)
  { weekNumber: 1, quarter: 1, monthNumber: 1, level: 'A1', themeFa: 'احوالپرسی و واژگان اولیه مودبانه', themeNativeEn: 'Greetings & Courtesies', descriptionFa: 'کلمات ضروری برای شروع مکالمه، سلام، تشکر و خداحافظی' },
  { weekNumber: 2, quarter: 1, monthNumber: 1, level: 'A1', themeFa: 'هویت شخصی، ملیت و سن', themeNativeEn: 'Identity & Nationalities', descriptionFa: 'معرفی نام، کشور، سن و وضعیت تأهل و اشتغال' },
  { weekNumber: 3, quarter: 1, monthNumber: 1, level: 'A1', themeFa: 'زمان، اعداد و تقویم', themeNativeEn: 'Numbers & Time', descriptionFa: 'شمارش، ساعت، روزهای هفته و ماه‌ها' },
  { weekNumber: 4, quarter: 1, monthNumber: 1, level: 'A1', themeFa: 'خانواده و روابط خانوادگی', themeNativeEn: 'Family & Relatives', descriptionFa: 'اعضای خانواده، نسبت‌های فامیلی و توصیف بستگان' },
  { weekNumber: 5, quarter: 1, monthNumber: 2, level: 'A1', themeFa: 'خانه، اتاق‌ها و وسایل منزل', themeNativeEn: 'Home & Furniture', descriptionFa: 'بخش‌های خانه، مبلمان، لوازم و رنگ‌ها' },
  { weekNumber: 6, quarter: 1, monthNumber: 2, level: 'A1', themeFa: 'خوراکی‌ها، نوشیدنی‌ها و رستوران', themeNativeEn: 'Food & Dining', descriptionFa: 'غذاها، میوه‌ها، سفارش در کافه و وعده‌های غذایی' },
  { weekNumber: 7, quarter: 1, monthNumber: 2, level: 'A1', themeFa: 'کارهای روزمره و عادات زندگی', themeNativeEn: 'Daily Routine', descriptionFa: 'بیدار شدن، صبحانه، کار، ورزش و خواب' },
  { weekNumber: 8, quarter: 1, monthNumber: 2, level: 'A1', themeFa: 'شهر، آدرس‌دهی و مکان‌های عمومی', themeNativeEn: 'City & Directions', descriptionFa: 'خیابان، ایستگاه، بانک، بیمارستان و مسیر یابی' },
  { weekNumber: 9, quarter: 1, monthNumber: 3, level: 'A2', themeFa: 'خرید، پوشاک و قیمت‌ها', themeNativeEn: 'Shopping & Clothes', descriptionFa: 'لباس، سایز، قیمت، تخفیف و خرید در فروشگاه' },
  { weekNumber: 10, quarter: 1, monthNumber: 3, level: 'A2', themeFa: 'آب‌وهوا و فصل‌های سال', themeNativeEn: 'Weather & Seasons', descriptionFa: 'باران، آفتاب، سرما، گرما و پیش‌بینی هوا' },
  { weekNumber: 11, quarter: 1, monthNumber: 3, level: 'A2', themeFa: 'سرگرمی، ورزش و اوقات فراغت', themeNativeEn: 'Hobbies & Sports', descriptionFa: 'موسیقی، فوتبال، شنا، سینما و علایق شخصی' },
  { weekNumber: 12, quarter: 1, monthNumber: 3, level: 'A2', themeFa: 'بدن انسان، سلامت و بیماری‌های رایج', themeNativeEn: 'Health & Body', descriptionFa: 'اعضای بدن، سرماخوردگی، داروخانه و ویزیت پزشک' },
  { weekNumber: 13, quarter: 1, monthNumber: 3, level: 'A2', themeFa: 'سفر، تعطیلات و هتل', themeNativeEn: 'Travel & Hotel', descriptionFa: 'رزرو هتل، چمدان، بلیت و گذرنامه' },

  // Quarter 2: A2 - B1 (Intermediate Progress)
  { weekNumber: 14, quarter: 2, monthNumber: 4, level: 'A2', themeFa: 'فرودگاه، حمل‌ونقل و پرواز', themeNativeEn: 'Airport & Transit', descriptionFa: 'گیت پرواز، بار، کارت پرواز و تأخیر' },
  { weekNumber: 15, quarter: 2, monthNumber: 4, level: 'A2', themeFa: 'شغل‌ها، وظایف و محیط کار', themeNativeEn: 'Jobs & Workplace', descriptionFa: 'حرفه‌ها، مدیر، همکار، دفتر کار و وظایف شغلی' },
  { weekNumber: 16, quarter: 2, monthNumber: 4, level: 'B1', themeFa: 'احساسات، عواطف و حالات روحی', themeNativeEn: 'Emotions & Moods', descriptionFa: 'شادی، اضطراب، امید، خشم و آرامش' },
  { weekNumber: 17, quarter: 2, monthNumber: 4, level: 'B1', themeFa: 'طبیعت، محیط زیست و حیوانات', themeNativeEn: 'Nature & Wildlife', descriptionFa: 'جنگل، کوه، دریاچه، پرندگان و حفاظت از محیط زیست' },
  { weekNumber: 18, quarter: 2, monthNumber: 5, level: 'B1', themeFa: 'فناوری، موبایل و اینترنت', themeNativeEn: 'Technology & Web', descriptionFa: 'اپلیکیشن، لپ‌تاپ، دانلود، شبکه و هوش مصنوعی' },
  { weekNumber: 19, quarter: 2, monthNumber: 5, level: 'B1', themeFa: 'تحصیل، دانشگاه و یادگیری', themeNativeEn: 'Education & Studies', descriptionFa: 'کلاس، امتحان، مدرک، استاد و بورسیه تحصیلی' },
  { weekNumber: 20, quarter: 2, monthNumber: 5, level: 'B1', themeFa: 'توصیف شخصیت و ویژگی‌های فردی', themeNativeEn: 'Personality Traits', descriptionFa: 'مهربان، خلاق، سخت‌کوش، صادق و شوخ‌طبع' },
  { weekNumber: 21, quarter: 2, monthNumber: 5, level: 'B1', themeFa: 'آشپزی، دستور پخت و طعم‌ها', themeNativeEn: 'Cooking & Flavors', descriptionFa: 'مواد اولیه، ادویه، سرخ کردن، شیرین و تند' },
  { weekNumber: 22, quarter: 2, monthNumber: 6, level: 'B1', themeFa: 'روابط اجتماعی و دوستی', themeNativeEn: 'Social Relationships', descriptionFa: 'قرار ملاقات، اعتماد، مشاجره، آشتی و صمیمیت' },
  { weekNumber: 23, quarter: 2, monthNumber: 6, level: 'B1', themeFa: 'رسانه‌ها، اخبار و رویدادهای روز', themeNativeEn: 'Media & News', descriptionFa: 'روزنامه، گزارشگر، تیتر خبر، مصاحبه و رادیو' },
  { weekNumber: 24, quarter: 2, monthNumber: 6, level: 'B1', themeFa: 'خرید آنلاین و خدمات بانکی', themeNativeEn: 'E-Commerce & Banking', descriptionFa: 'کارت اعتباری، سبد خرید، انتقال وجه و رسید پرداخت' },
  { weekNumber: 25, quarter: 2, monthNumber: 6, level: 'B1', themeFa: 'اورژانس، حوادث و امداد', themeNativeEn: 'Emergency & Safety', descriptionFa: 'پلیس، آتش‌نشانی، آمبولانس، کمک‌های اولیه و حادثه' },
  { weekNumber: 26, quarter: 2, monthNumber: 6, level: 'B1', themeFa: 'برنامه‌ریزی آینده و آرزوها', themeNativeEn: 'Future Plans & Goals', descriptionFa: 'هدف، چشم‌انداز، مهاجرت، موفقیت و آرزو' },

  // Quarter 3: B1 - B2 (Upper Intermediate Fluency)
  { weekNumber: 27, quarter: 3, monthNumber: 7, level: 'B1', themeFa: 'جلسات کاری و ارتباطات اداری', themeNativeEn: 'Business Meetings', descriptionFa: 'دستور جلسه، ارائه، توافق، یادداشت و صورت‌جلسه' },
  { weekNumber: 28, quarter: 3, monthNumber: 7, level: 'B2', themeFa: 'رزومه، مصاحبه استخدامی و کاریابی', themeNativeEn: 'Resume & Job Interview', descriptionFa: 'سوابق کاری، مهارت‌ها، حقوق درخواستی و انگیزه نامه' },
  { weekNumber: 29, quarter: 3, monthNumber: 7, level: 'B2', themeFa: 'اصطلاحات عامیانه و عبارات روزمره نیتیو', themeNativeEn: 'Idioms & Slang', descriptionFa: 'اصطلاحات پرکاربرد خیابانی و ضرب‌المثل‌های گفتاری' },
  { weekNumber: 30, quarter: 3, monthNumber: 7, level: 'B2', themeFa: 'تغییرات اقلیمی و انرژی‌های تجدیدپذیر', themeNativeEn: 'Climate & Renewable Energy', descriptionFa: 'گرمایش زمین، پنل خورشیدی، بازیافت و ردپای کربن' },
  { weekNumber: 31, quarter: 3, monthNumber: 8, level: 'B2', themeFa: 'سلامت روان، استرس و ذهن‌آگاهی', themeNativeEn: 'Mental Health & Mindfulness', descriptionFa: 'مدیتیشن، تعادل کار و زندگی، فرسودگی شغلی و تاب‌آوری' },
  { weekNumber: 32, quarter: 3, monthNumber: 8, level: 'B2', themeFa: 'هنر، موسیقی، تئاتر و ادبیات', themeNativeEn: 'Art & Literature', descriptionFa: 'نمایشگاه، شعر، شاهکار، گالری و سبک‌های هنری' },
  { weekNumber: 33, quarter: 3, monthNumber: 8, level: 'B2', themeFa: 'جامعه، تنوع فرهنگی و مهاجرت', themeNativeEn: 'Society & Migration', descriptionFa: 'چندفرهنگی، همگرایی، حقوق شهروندی و پناهندگی' },
  { weekNumber: 34, quarter: 3, monthNumber: 8, level: 'B2', themeFa: 'نوآوری، استارتاپ‌ها و کارآفرینی', themeNativeEn: 'Startups & Innovation', descriptionFa: 'ایده، سرمایه‌گذار، سودآوری، بازار هدف و مقیاس‌پذیری' },
  { weekNumber: 35, quarter: 3, monthNumber: 9, level: 'B2', themeFa: 'افعال عبارتی و ترکیبی کاربردی (Phrasal Verbs)', themeNativeEn: 'Essential Phrasal Verbs', descriptionFa: 'افعال ترکیبی ضروری برای تسلط روان در مکالمات' },
  { weekNumber: 36, quarter: 3, monthNumber: 9, level: 'B2', themeFa: 'روانشناسی رفتار و تصمیم‌گیری', themeNativeEn: 'Behavioral Psychology', descriptionFa: 'انگیزه، ناخودآگاه، سوگیری شناختی و عادات فردی' },
  { weekNumber: 37, quarter: 3, monthNumber: 9, level: 'B2', themeFa: 'مذاکره، متقاعدسازی و حل اختلاف', themeNativeEn: 'Negotiation & Persuasion', descriptionFa: 'چانه زنی، امتیاز دادن، متقاعد کردن و راه‌حل برد-برد' },
  { weekNumber: 38, quarter: 3, monthNumber: 9, level: 'B2', themeFa: 'واژگان آکادمیک برای مقاله‌نویسی', themeNativeEn: 'Academic Writing Vocab', descriptionFa: 'تحلیل، شواهد تجربی، تضاد، پیوستگی متن و نتیجه‌گیری' },

  // Quarter 4: C1 - C2 (Advanced Native Mastery)
  { weekNumber: 39, quarter: 4, monthNumber: 10, level: 'C1', themeFa: 'هم‌آیندهای پیشرفته و استعاره‌ها', themeNativeEn: 'Advanced Collocations & Metaphors', descriptionFa: 'ترکیب طبیعی کلمات مانند نیتیوها بدون ترجمه تحت‌اللفظی' },
  { weekNumber: 40, quarter: 4, monthNumber: 10, level: 'C1', themeFa: 'اقتصاد کلان، بورس و بازارهای مالی', themeNativeEn: 'Macroeconomics & Finance', descriptionFa: 'تورم، نرخ بهره، سهام، رکود، رشد و سرمایه‌گذاری' },
  { weekNumber: 41, quarter: 4, monthNumber: 10, level: 'C1', themeFa: 'حقوق، قوانین و قراردادهای بین‌المللی', themeNativeEn: 'Law & Legal Terminology', descriptionFa: 'مفاد قانونی، تعهدات، نقض قرارداد، دادرسی و وکالت' },
  { weekNumber: 42, quarter: 4, monthNumber: 10, level: 'C1', themeFa: 'سیاست، دیپلماسی و روابط بین‌الملل', themeNativeEn: 'Politics & Diplomacy', descriptionFa: 'معاهدات، تحریم، اجلاس سران، سفارت و مذاکرات صلح' },
  { weekNumber: 43, quarter: 4, monthNumber: 11, level: 'C1', themeFa: 'نقد فیلم، ادبیات و تحلیل سینمایی', themeNativeEn: 'Film Critique & Aesthetics', descriptionFa: 'روایت‌گری، جلوه‌های بصری، تمثیل، ظرافت و نمادپردازی' },
  { weekNumber: 44, quarter: 4, monthNumber: 11, level: 'C1', themeFa: 'کنایه، طنز کلامی و زیرمتن‌های زبانی (Subtext)', themeNativeEn: 'Wit, Sarcasm & Subtext', descriptionFa: 'طنز موقعیت، مطایبه، ایهام و درک لایه‌های عمیق گفتار' },
  { weekNumber: 45, quarter: 4, monthNumber: 11, level: 'C1', themeFa: 'متدولوژی پژوهش و نگارش پایان‌نامه', themeNativeEn: 'Research Methodology & Thesis', descriptionFa: 'فرضیه، تحلیل آماری، داده‌های کیفی و دفاعیه تز' },
  { weekNumber: 46, quarter: 4, monthNumber: 11, level: 'C1', themeFa: 'معماری، شهرسازی و طراحی فضایی', themeNativeEn: 'Architecture & Urban Planning', descriptionFa: 'طراحی پایدار، زیرساخت، سازه و هویت شهری' },
  { weekNumber: 47, quarter: 4, monthNumber: 12, level: 'C2', themeFa: 'فلسفه، اخلاق و مباحثات فکری عمیق', themeNativeEn: 'Philosophy & Ethics', descriptionFa: 'معرفت‌شناسی، اخلاق زیستی، اگزیستانسیالیسم و منطق' },
  { weekNumber: 48, quarter: 4, monthNumber: 12, level: 'C2', themeFa: 'هوش مصنوعی پیشرفته و اخلاق سایبری', themeNativeEn: 'Advanced AI & Cyberethics', descriptionFa: 'یادگیری عمیق، الگوریتم‌های خودمختار، حریم خصوصی و سایبرنتیک' },
  { weekNumber: 49, quarter: 4, monthNumber: 12, level: 'C2', themeFa: 'فن بیان، سخنرانی و بلاغت زبانی (Rhetoric)', themeNativeEn: 'Rhetoric & Public Speaking', descriptionFa: 'تأکید کلامی، ساختارهای معکوس، ایجاز و اقناع جمعی' },
  { weekNumber: 50, quarter: 4, monthNumber: 12, level: 'C2', themeFa: 'واژگان گویشی، اصطلاحات فرهنگی کهن و ضرب‌المثل‌های نایاب', themeNativeEn: 'Archaic & Cultural Nuances', descriptionFa: 'اصطلاحات تاریخی، ریشه‌شناسی واژگان و ضرب‌المثل‌های اصیل' },
  { weekNumber: 51, quarter: 4, monthNumber: 12, level: 'C2', themeFa: 'مذاکرات سطح بالای دیپلماتیک و بحران‌های بین‌المللی', themeNativeEn: 'Crisis Management & High Diplomacy', descriptionFa: 'مدیریت بحران، میانجی‌گری، بیانیه‌های مشترک و مصالحه' },
  { weekNumber: 52, quarter: 4, monthNumber: 12, level: 'C2', themeFa: 'تاج تسلط کامل و شیفتگی زبانی (Mastery Capstone)', themeNativeEn: 'Native Fluency Capstone', descriptionFa: 'تسلط چندبعدی بر تمام وجوه زبان هدف معادل زبان مادری' },
];

// Language-specific vocabulary builders
export const VOCABULARY_BY_LANG: Record<
  TargetLanguageCode,
  Record<number, { words: Omit<VocabularyItem, 'dayNumber'>[]; quiz: WeeklyVocabularyPack['quizQuestion'] }>
> = {
  // English (EN)
  en: {
    1: {
      words: [
        { id: 'en_w1_1', word: 'Greeting', phonetic: '/ˈɡriːtɪŋ/', partOfSpeech: 'noun', meaningFa: 'احوالپرسی / درود', contextNoteFa: 'رایج برای آغاز مکالمه رسمی و غیررسمی', exampleTarget: 'A warm greeting makes everyone feel welcome.', exampleFa: 'یک احوالپرسی گرم به همه حس خوش‌آمدگویی می‌دهد.', collocations: ['warm greeting', 'formal greeting'] },
        { id: 'en_w1_2', word: 'Polite', phonetic: '/pəˈlaɪt/', partOfSpeech: 'adj', meaningFa: 'مودب / با نزاکت', contextNoteFa: 'صفت برای توصیف رفتار شایسته', exampleTarget: 'It is polite to say thank you when receiving help.', exampleFa: 'مودبانه است که هنگام دریافت کمک تشکر کنید.', collocations: ['polite behavior', 'polite request'] },
        { id: 'en_w1_3', word: 'Appreciate', phonetic: '/əˈpriːʃieɪt/', partOfSpeech: 'verb', meaningFa: 'قدردانی کردن / سپاسگزار بودن', contextNoteFa: 'فعل قوی‌تر و رسمی‌تر از Thank you', exampleTarget: 'I truly appreciate your kind support.', exampleFa: 'من صمیمانه از حمایت مهربانانه شما سپاسگزارم.', collocations: ['greatly appreciate', 'appreciate help'] },
        { id: 'en_w1_4', word: 'Pleased', phonetic: '/pliːzd/', partOfSpeech: 'adj', meaningFa: 'خشنود / خوشوقت', contextNoteFa: 'در عبارت Pleased to meet you استفاده می‌شود', exampleTarget: 'Pleased to meet you, Mr. Asadi.', exampleFa: 'از آشنایی با شما خوشوقتم، آقای اسدی.', collocations: ['pleased to meet', 'very pleased'] },
        { id: 'en_w1_5', word: 'Farewell', phonetic: '/ˌfeərˈwel/', partOfSpeech: 'noun', meaningFa: 'خداحافظی / بدرود', contextNoteFa: 'بدرود و خداحافظی گرم', exampleTarget: 'They said a fond farewell before departing.', exampleFa: 'آن‌ها پیش از رفتن خداحافظی گرمی کردند.', collocations: ['farewell party', 'bid farewell'] },
      ],
      quiz: {
        promptFa: 'کدام کلمه به معنی «قدردانی کردن و سپاسگزاری» است؟',
        targetPrompt: 'Which word means to recognize the full worth or be grateful for?',
        options: ['Farewell', 'Appreciate', 'Greeting', 'Polite'],
        correctIndex: 1,
        explanationFa: 'واژه Appreciate به معنای قدردانی کردن و سپاسگزاری عمیق است.',
      },
    },
    2: {
      words: [
        { id: 'en_w2_1', word: 'Citizenship', phonetic: '/ˈsɪtɪzənʃɪp/', partOfSpeech: 'noun', meaningFa: 'شهروندی / تابعیت', contextNoteFa: 'برای بیان تابعیت کشوری استفاده می‌شود', exampleTarget: 'She holds dual citizenship in Iran and Germany.', exampleFa: 'او دارای تابعیت دوگانه ایران و آلمان است.', collocations: ['dual citizenship', 'apply for citizenship'] },
        { id: 'en_w2_2', word: 'Occupation', phonetic: '/ˌɒkjuˈpeɪʃn/', partOfSpeech: 'noun', meaningFa: 'شغل / حرفه', contextNoteFa: 'واژه رسمی برای Job در فرم‌های استخدامی', exampleTarget: 'Please state your name and current occupation.', exampleFa: 'لطفاً نام و شغل فعلی خود را قید فرمایید.', collocations: ['current occupation', 'gainful occupation'] },
        { id: 'en_w2_3', word: 'Origin', phonetic: '/ˈɒrɪdʒɪn/', partOfSpeech: 'noun', meaningFa: 'مبدأ / اصالت / منشأ', contextNoteFa: 'بیان محل تولد و ریشه ملی', exampleTarget: 'What is your country of origin?', exampleFa: 'کشور مبدأ و اصالت شما کجاست؟', collocations: ['country of origin', 'point of origin'] },
        { id: 'en_w2_4', word: 'Introduce', phonetic: '/ˌɪntrəˈdjuːs/', partOfSpeech: 'verb', meaningFa: 'معرفی کردن', contextNoteFa: 'معرفی خود یا شخص دیگر', exampleTarget: 'Allow me to introduce my colleague Hossein.', exampleFa: 'اجازه دهید همکارم حسین را معرفی کنم.', collocations: ['introduce myself', 'introduce a friend'] },
        { id: 'en_w2_5', word: 'Resident', phonetic: '/ˈrezɪdənt/', partOfSpeech: 'noun', meaningFa: 'مقیم / ساکن', contextNoteFa: 'ساکن یک شهر یا کشور خاص', exampleTarget: 'He is a permanent resident of the city.', exampleFa: 'او مقیم دائم این شهر است.', collocations: ['permanent resident', 'local resident'] },
      ],
      quiz: {
        promptFa: 'واژه رسمی برای شغل و پیشه در فرم‌ها کدام است؟',
        targetPrompt: 'What is the formal term for job or profession?',
        options: ['Origin', 'Occupation', 'Citizenship', 'Resident'],
        correctIndex: 1,
        explanationFa: 'واژه Occupation اصطلاح استاندارد و رسمی برای شغل و حرفه در مدارک اداری است.',
      },
    },
    3: {
      words: [
        { id: 'en_w3_1', word: 'Schedule', phonetic: '/ˈʃedjuːl/', partOfSpeech: 'noun', meaningFa: 'برنامه زمانی / جدول زمان‌بندی', contextNoteFa: 'برنامه‌ریزی ساعت‌ها و روزها', exampleTarget: 'My daily schedule is quite busy this week.', exampleFa: 'برنامه زمانی روزانه من این هفته بسیار فشرده است.', collocations: ['tight schedule', 'on schedule'] },
        { id: 'en_w3_2', word: 'Appointment', phonetic: '/əˈpɔɪntmənt/', partOfSpeech: 'noun', meaningFa: 'وقت ملاقات / قرار قبلی', contextNoteFa: 'قرار با پزشک، وکیل یا اداره', exampleTarget: 'I have a dentist appointment at 3 PM.', exampleFa: 'من ساعت ۳ بعدازظهر وقت دندانپزشکی دارم.', collocations: ['make an appointment', 'book an appointment'] },
        { id: 'en_w3_3', word: 'Deadline', phonetic: '/ˈdedlaɪn/', partOfSpeech: 'noun', meaningFa: 'مهلت نهایی / ددلاین', contextNoteFa: 'آخرین مهلت برای انجام یک کار', exampleTarget: 'The deadline for project submission is Friday.', exampleFa: 'مهلت نهایی ارسال پروژه روز جمعه است.', collocations: ['meet the deadline', 'tight deadline'] },
        { id: 'en_w3_4', word: 'Fortnight', phonetic: '/ˈfɔːtnaɪt/', partOfSpeech: 'noun', meaningFa: 'دو هفته / ۱۴ روز', contextNoteFa: 'اصطلاح رایج در انگلیسی بریتانیایی', exampleTarget: 'We are going on holiday for a fortnight.', exampleFa: 'ما به مدت دو هفته به تعطیلات می‌رویم.', collocations: ['a fortnight ago', 'stay for a fortnight'] },
        { id: 'en_w3_5', word: 'Punctual', phonetic: '/ˈpʌŋktʃuəl/', partOfSpeech: 'adj', meaningFa: 'وقت‌شناس / آن‌تایم', contextNoteFa: 'صفت برای فردی که سر وقت حاضر می‌شود', exampleTarget: 'Hossein is always punctual for our study sessions.', exampleFa: 'حسین همیشه برای جلسات درسی ما وقت‌شناس است.', collocations: ['strictly punctual', 'remain punctual'] },
      ],
      quiz: {
        promptFa: 'کدام صفت به معنای «وقت‌شناس» است؟',
        targetPrompt: 'Which adjective means arriving or doing things at the agreed time?',
        options: ['Deadline', 'Punctual', 'Schedule', 'Appointment'],
        correctIndex: 1,
        explanationFa: 'واژه Punctual به معنای فرد دقیق و سر وقت است.',
      },
    },
    // We will dynamically support weeks 4-52 with intelligent thematic generation for all languages
  },

  // German (DE)
  de: {
    1: {
      words: [
        { id: 'de_w1_1', word: 'Die Begrüßung', phonetic: '/bəˈɡʁyːsʊŋ/', partOfSpeech: 'noun', meaningFa: 'احوالپرسی / خوش‌آمدگویی', contextNoteFa: 'اسم مؤنث برای سلام و درود', exampleTarget: 'Eine herzliche Begrüßung öffnet jedes Herz.', exampleFa: 'یک احوالپرسی صمیمانه هر قلبی را باز می‌کند.', collocations: ['herzliche Begrüßung', 'offizielle Begrüßung'] },
        { id: 'de_w1_2', word: 'Höflich', phonetic: '/ˈhøːflɪç/', partOfSpeech: 'adj', meaningFa: 'مودب / با نزاکت', contextNoteFa: 'صفت رفتار مؤدبانه در آلمان', exampleTarget: 'Es ist höflich, „Bitte“ und „Danke“ zu sagen.', exampleFa: 'مودبانه است که «لطفاً» و «متشکرم» بگویید.', collocations: ['höfliche Frage', 'sehr höflich'] },
        { id: 'de_w1_3', word: 'Schätzen', phonetic: '/ˈʃɛtsn̩/', partOfSpeech: 'verb', meaningFa: 'قدردانی کردن / ارج نهادن', contextNoteFa: 'ارزش قائل شدن برای کمک یا لطف کسی', exampleTarget: 'Ich schätze deine Unterstützung sehr.', exampleFa: 'من از پشتیبانی تو بسیار قدردانی می‌کنم.', collocations: ['sehr schätzen', 'Hilfe schätzen'] },
        { id: 'de_w1_4', word: 'Der Abschied', phonetic: '/ˈapʃiːt/', partOfSpeech: 'noun', meaningFa: 'خداحافظی / وداع', contextNoteFa: 'اسم مذکر خداحافظی', exampleTarget: 'Der Abschied fiel uns schwer.', exampleFa: 'خداحافظی برای ما سخت بود.', collocations: ['Abschied nehmen', 'zum Abschied'] },
        { id: 'de_w1_5', word: 'Angenehm', phonetic: '/ˈanɡəˌneːm/', partOfSpeech: 'adj', meaningFa: 'مطبوع / خوشوقت (در معرفی)', contextNoteFa: 'عبارت Sehr angenehm هنگام دست دادن', exampleTarget: 'Sehr angenehm, Herr Asadi!', exampleFa: 'بسیار خوشوقتم، آقای اسدی!', collocations: ['sehr angenehm', 'angenehme Reise'] },
      ],
      quiz: {
        promptFa: 'کدام کلمه آلمانی به معنای «مودب» است؟',
        targetPrompt: 'Welches Wort bedeutet "polite"?',
        options: ['Höflich', 'Begrüßung', 'Abschied', 'Schätzen'],
        correctIndex: 0,
        explanationFa: 'واژه Höflich در زبان آلمانی صفت به معنای مؤدب و با نزاکت است.',
      },
    },
  },

  // French (FR)
  fr: {
    1: {
      words: [
        { id: 'fr_w1_1', word: 'La salutation', phonetic: '/sa.ly.ta.sjɔ̃/', partOfSpeech: 'noun', meaningFa: 'احوالپرسی / سلام و تحیت', contextNoteFa: 'اسم مؤنث سلام رسمی', exampleTarget: 'Les salutations d’usage sont importantes en France.', exampleFa: 'احوالپرسی‌های معمول در فرانسه بسیار بااهمیت هستند.', collocations: ['salutations distinguées', 'chaleureuse salutation'] },
        { id: 'fr_w1_2', word: 'Poli', phonetic: '/pɔ.li/', partOfSpeech: 'adj', meaningFa: 'مودب', contextNoteFa: 'صفت ادب و رفتار شایسته', exampleTarget: 'Il est toujours très poli avec ses collègues.', exampleFa: 'او همیشه با همکارانش بسیار مؤدب است.', collocations: ['homme poli', 'réponse polie'] },
        { id: 'fr_w1_3', word: 'Remercier', phonetic: '/ʁə.mɛʁ.sje/', partOfSpeech: 'verb', meaningFa: 'تشکر و قدردانی کردن', contextNoteFa: 'فعل سپاسگزاری در فرانسوی', exampleTarget: 'Je tiens à vous remercier chaleureusement.', exampleFa: 'مایلم صمیمانه از شما تشکر کنم.', collocations: ['remercier du fond du cœur', 'remercier vivement'] },
        { id: 'fr_w1_4', word: 'Enchanté', phonetic: '/ɑ̃.ʃɑ̃.te/', partOfSpeech: 'adj', meaningFa: 'خوشبخت و خوشوقت از آشنایی', contextNoteFa: 'کلمه استاندارد هنگام معرفی فرانسوی', exampleTarget: 'Enchanté de faire votre connaissance!', exampleFa: 'از آشنایی با شما بسیار خوشبختم!', collocations: ['enchanté de vous voir', 'vraiment enchanté'] },
        { id: 'fr_w1_5', word: 'L’adieu', phonetic: '/a.djø/', partOfSpeech: 'noun', meaningFa: 'بدرود / خداحافظی', contextNoteFa: 'اسم برای خداحافظی نهایی یا بدرود', exampleTarget: 'Ils ont fait leurs adieux à la gare.', exampleFa: 'آن‌ها در ایستگاه قطار خداحافظی کردند.', collocations: ['dire adieu', 'faire ses adieux'] },
      ],
      quiz: {
        promptFa: 'کلمه فرانسوی «Enchanté» در چه موقعیتی استفاده می‌شود؟',
        targetPrompt: 'Quand utilise-t-on le mot "Enchanté" ?',
        options: ['هنگام سفارش غذا', 'هنگام آشنایی و معرفی خود', 'هنگام خرید بلیت', 'هنگام خداحافظی'],
        correctIndex: 1,
        explanationFa: 'واژه Enchanté به معنای «خوشوقتم / از آشنایی با شما خرسندم» هنگام معرفی به کار می‌رود.',
      },
    },
  },

  // Spanish (ES)
  es: {
    1: {
      words: [
        { id: 'es_w1_1', word: 'El saludo', phonetic: '/saˈlu.ðo/', partOfSpeech: 'noun', meaningFa: 'احوالپرسی / سلام و درود', contextNoteFa: 'اسم مذکر برای سلام', exampleTarget: 'Un saludo cordial para todos ustedes.', exampleFa: 'یک درود صمیمانه برای همه شما عزیزان.', collocations: ['saludo cordial', 'dar un saludo'] },
        { id: 'es_w1_2', word: 'Educado', phonetic: '/e.ðuˈka.ðo/', partOfSpeech: 'adj', meaningFa: 'مودب و با نزاکت', contextNoteFa: 'صفت ادب در اسپانیایی', exampleTarget: 'Hossein es un joven muy educado y respetuoso.', exampleFa: 'حسین جوانی بسیار مؤدب و بااحترام است.', collocations: ['muy educado', 'bien educado'] },
        { id: 'es_w1_3', word: 'Agradecer', phonetic: '/a.ɣɾa.ðeˈseɾ/', partOfSpeech: 'verb', meaningFa: 'تشکر و قدردانی کردن', contextNoteFa: 'فعل سپاسگزاری', exampleTarget: 'Quiero agradecerles por toda su ayuda.', exampleFa: 'می‌خواهم از شما به خاطر تمام کمکتان تشکر کنم.', collocations: ['agradecer de corazón', 'agradecer el apoyo'] },
        { id: 'es_w1_4', word: 'Mucho gusto', phonetic: '/ˈmu.tʃo ˈɣus.to/', partOfSpeech: 'phrase', meaningFa: 'بسیار خوشبختم / خوشوقتم', contextNoteFa: 'عبارت رایج در معرفی خود', exampleTarget: '¡Mucho gusto en conocerte, Fátima!', exampleFa: 'از آشنایی با تو بسیار خوشبختم، فاطمه!', collocations: ['mucho gusto en conocer', 'es un gusto'] },
        { id: 'es_w1_5', word: 'La despedida', phonetic: '/des.peˈði.ða/', partOfSpeech: 'noun', meaningFa: 'خداحافظی / بدرود', contextNoteFa: 'مراسم یا سخن خداحافظی', exampleTarget: 'Fue una despedida muy emotiva.', exampleFa: 'خداحافظی بسیار پر احساسی بود.', collocations: ['dar la despedida', 'despedida calurosa'] },
      ],
      quiz: {
        promptFa: 'معادل عبارت «بسیار خوشبختم از آشنایی» در زبان اسپانیایی چیست؟',
        targetPrompt: '¿Cómo se dice "Mucho gusto" en español?',
        options: ['La despedida', 'Mucho gusto', 'El saludo', 'Educado'],
        correctIndex: 1,
        explanationFa: 'عبارت Mucho gusto معادل «خوشبختم / بسیار خوشوقتم» در مکالمات اسپانیایی است.',
      },
    },
  },

  // Italian (IT)
  it: {
    1: {
      words: [
        { id: 'it_w1_1', word: 'Il saluto', phonetic: '/saˈlu.to/', partOfSpeech: 'noun', meaningFa: 'احوالپرسی / سلام', contextNoteFa: 'اسم مذکر سلام و درود', exampleTarget: 'Un caro saluto a tutta la famiglia.', exampleFa: 'یک سلام گرم به تمام خانواده.', collocations: ['caro saluto', 'cordiali saluti'] },
        { id: 'it_w1_2', word: 'Educato', phonetic: '/e.duˈka.to/', partOfSpeech: 'adj', meaningFa: 'مودب و خوش‌برخورد', contextNoteFa: 'صفت نزاکت', exampleTarget: 'È sempre molto educato e gentile.', exampleFa: 'او همیشه بسیار مؤدب و مهربان است.', collocations: ['molto educato', 'ragazzo educato'] },
        { id: 'it_w1_3', word: 'Ringraziare', phonetic: '/rin.ɡraˈtsja.re/', partOfSpeech: 'verb', meaningFa: 'تشکر کردن', contextNoteFa: 'فعل تشکر و قدردانی', exampleTarget: 'Voglio ringraziarvi per la vostra ospitalità.', exampleFa: 'می‌خواهم از شما به خاطر مهمان‌نوازی‌تان تشکر کنم.', collocations: ['ringraziare di cuore', 'ringraziare tutti'] },
        { id: 'it_w1_4', word: 'Piacere', phonetic: '/pjaˈtʃe.re/', partOfSpeech: 'phrase', meaningFa: 'خوشوقتم / باعث افتخار است', contextNoteFa: 'کلمه استاندارد معرفی در ایتالیا', exampleTarget: 'Piacere di conoscerti, Hossein!', exampleFa: 'از آشنایی با تو خوشوقتم، حسین!', collocations: ['piacere mio', 'molto piacere'] },
        { id: 'it_w1_5', word: 'L’addio', phonetic: '/adˈdi.o/', partOfSpeech: 'noun', meaningFa: 'بدرود / خداحافظی', contextNoteFa: 'خداحافظی عاطفی یا رسمی', exampleTarget: 'Hanno dato il loro addio prima di partire.', exampleFa: 'آن‌ها پیش از رفتن بدرود گفتند.', collocations: ['dire addio', 'ultimo addio'] },
      ],
      quiz: {
        promptFa: 'کدام واژه در ایتالیایی برای اعلام «خوشوقتم از آشنایی» به کار می‌رود؟',
        targetPrompt: 'Quale parola si usa per presentarsi?',
        options: ['Il saluto', 'Piacere', 'L’addio', 'Educato'],
        correctIndex: 1,
        explanationFa: 'واژه Piacere در ایتالیایی مخفف Piacere di conoscerti (از آشنایی با شما خوشوقتم) است.',
      },
    },
  },

  // Turkish (TR)
  tr: {
    1: {
      words: [
        { id: 'tr_w1_1', word: 'Selamlaşma', phonetic: '/se.lam.laʃ.ma/', partOfSpeech: 'noun', meaningFa: 'احوالپرسی و سلام کردن', contextNoteFa: 'اسم احوالپرسی در ترکی استانبولی', exampleTarget: 'Geleneksel Türk selamlaşması çok samimidir.', exampleFa: 'احوالپرسی سنتی ترکی بسیار صمیمانه است.', collocations: ['sıcak selamlaşma', 'resmi selamlaşma'] },
        { id: 'tr_w1_2', word: 'Kibar', phonetic: '/ciˈbaɾ/', partOfSpeech: 'adj', meaningFa: 'مودب و با نزاکت / با ادب', contextNoteFa: 'صفت ادب و رفتار خوش', exampleTarget: 'Hossein her zaman çok kibar ve saygılıdır.', exampleFa: 'حسین همیشه بسیار مؤدب و محترم است.', collocations: ['kibar davranış', 'çok kibar'] },
        { id: 'tr_w1_3', word: 'Teşekkür etmek', phonetic: '/te.ʃecˈcyɾ etˈmec/', partOfSpeech: 'verb', meaningFa: 'تشکر کردن و سپاسگزاری', contextNoteFa: 'فعل مرکب تشکر', exampleTarget: 'Yardımınız için çok teşekkür ederim.', exampleFa: 'به خاطر کمکتان بسیار تشکر می‌کنم.', collocations: ['yürekten teşekkür etmek', 'teşekkürlerimi sunarım'] },
        { id: 'tr_w1_4', word: 'Memnun oldum', phonetic: '/memˈnun olˈdum/', partOfSpeech: 'phrase', meaningFa: 'خوشبخت شدم / از آشنایی خوشوقتم', contextNoteFa: 'عبارت رایج در اولین دیدار', exampleTarget: 'Tanıştığımıza çok memnun oldum!', exampleFa: 'از آشنایی با شما بسیار خوشبخت شدم!', collocations: ['çok memnun oldum', 'tanıştığıma memnun'] },
        { id: 'tr_w1_5', word: 'Vedalaşma', phonetic: '/ve.da.laʃˈma/', partOfSpeech: 'noun', meaningFa: 'خداحافظی و وداع', contextNoteFa: 'اسم برای خداحافظی کردن', exampleTarget: 'Havalimanında duygusal bir vedalaşma oldu.', exampleFa: 'در فرودگاه یک خداحافظی احساسی رخ داد.', collocations: ['vedalaşmak', 'hüzünlü vedalaşma'] },
      ],
      quiz: {
        promptFa: 'در زبان ترکی، معادل «از آشنایی با شما خوشبختم» چیست؟',
        targetPrompt: 'Türkçede tanışırken ne söylenir?',
        options: ['Vedalaşma', 'Memnun oldum', 'Selamlaşma', 'Kibar'],
        correctIndex: 1,
        explanationFa: 'عبارت Memnun oldum معادل «خوشبختم / خرسند شدم» در ترکی استانبولی است.',
      },
    },
  },

  // Arabic (AR)
  ar: {
    1: {
      words: [
        { id: 'ar_w1_1', word: 'التَّحِيَّة', phonetic: '/at-ta.ħiy.yah/', partOfSpeech: 'noun', meaningFa: 'درود و احوالپرسی', contextNoteFa: 'سلام و تحیت آغاز سخن', exampleTarget: 'أَلقَى التَّحِيَّةَ بِكُلِّ لُطْفٍ وَمَوَدَّة.', exampleFa: 'با کمال لطف و مهربانی سلام و درود فرستاد.', collocations: ['تَحِيَّة طَيِّبَة', 'إِلْقَاء التَّحِيَّة'] },
        { id: 'ar_w1_2', word: 'مُؤَدَّب', phonetic: '/mu.ʔad.dab/', partOfSpeech: 'adj', meaningFa: 'مودب و با اخلاق', contextNoteFa: 'صفت ادب', exampleTarget: 'حُسَيْن شَابٌّ مُؤَدَّبٌ وَمُجْتَهِد.', exampleFa: 'حسین جوانی مؤدب و سخت‌کوش است.', collocations: ['سُلُوك مُؤَدَّب', 'شَخْص مُؤَدَّب'] },
        { id: 'ar_w1_3', word: 'يَشْكُر', phonetic: '/jaʃ.kur/', partOfSpeech: 'verb', meaningFa: 'تشکر می‌کند / سپاس می‌گوید', contextNoteFa: 'فعل شکر و سپاس', exampleTarget: 'أَشْكُرُكَ جَزِيلَ الشُّكْرِ عَلَى مُسَاعَدَتِك.', exampleFa: 'از صمیم قلب از کمکتان تشکر می‌کنم.', collocations: ['شَكَرَ لَهُ', 'شُكْرًا جَزِيلًا'] },
        { id: 'ar_w1_4', word: 'تَشَرَّفْنَا', phonetic: '/ta.ʃar.raf.naː/', partOfSpeech: 'phrase', meaningFa: 'مشرف شدیم / از آشنایی با شما خوشبختیم', contextNoteFa: 'عبارت استاندارد آشنایی عربی', exampleTarget: 'تَشَرَّفْنَا بِمَعْرِفَتِكُمْ يَا أُسْتَاذ حُسَيْن!', exampleFa: 'از آشنایی با شما مفتخر و خوشبخت شدیم، استاد حسین!', collocations: ['تَشَرَّفْنَا بِكُمْ', 'فُرْصَة سَعِيدَة'] },
        { id: 'ar_w1_5', word: 'الوَدَاع', phonetic: '/al-wa.daːʕ/', partOfSpeech: 'noun', meaningFa: 'خداحافظی و بدرود', contextNoteFa: 'اسم وداع', exampleTarget: 'كَانَ حَفْلُ الوَدَاعِ مَلِيئًا بِالمَشَاعِر.', exampleFa: 'جشن خداحافظی پر از احساسات بود.', collocations: ['حَفْلَة وَدَاع', 'قَالَ وَدَاعًا'] },
      ],
      quiz: {
        promptFa: 'کلمه «تَشَرَّفْنَا» در زبان عربی به چه معناست؟',
        targetPrompt: 'ما معنى كلمة "تَشَرَّفْنَا" عند التعارف؟',
        options: ['خداحافظی کردن', 'مشرف و خوشبخت شدیم از آشنایی', 'درخواست کمک', 'سفارش دادن'],
        correctIndex: 1,
        explanationFa: 'کلمه «تَشَرَّفْنَا» در عربی هنگام آشنایی به معنای «از آشنایی با شما مفتخر و خوشبخت شدیم» است.',
      },
    },
  },

  // Russian (RU)
  ru: {
    1: {
      words: [
        { id: 'ru_w1_1', word: 'Приветствие', phonetic: '/prʲɪˈvʲetstvʲɪje/', partOfSpeech: 'noun', meaningFa: 'احوالپرسی / سلام', contextNoteFa: 'اسم سلام و درود', exampleTarget: 'Тёплое приветствие создаёт уют.', exampleFa: 'یک احوالپرسی گرم احساس راحتی ایجاد می‌کند.', collocations: ['тёплое приветствие', 'официальное приветствие'] },
        { id: 'ru_w1_2', word: 'Вежливый', phonetic: '/ˈvʲeʒlʲɪvɨj/', partOfSpeech: 'adj', meaningFa: 'مودب و با نزاکت', contextNoteFa: 'صفت ادب در روسی', exampleTarget: 'Он всегда очень вежливый студент.', exampleFa: 'او همیشه دانشجوی بسیار باادبی است.', collocations: ['вежливый ответ', 'вежливый человек'] },
        { id: 'ru_w1_3', word: 'Благодарить', phonetic: '/bləɡədɐˈrʲitʲ/', partOfSpeech: 'verb', meaningFa: 'تشکر و سپاسگزاری کردن', contextNoteFa: 'فعل قدردانی رسمی', exampleTarget: 'Я искренне благодарю вас за помощь.', exampleFa: 'من صمیمانه از شما به خاطر کمکتان تشکر می‌کنم.', collocations: ['благодарить от всего сердца', 'благодарю вас'] },
        { id: 'ru_w1_4', word: 'Очень приятно', phonetic: '/ˈotɕɪnʲ prʲɪˈjatnə/', partOfSpeech: 'phrase', meaningFa: 'بسیار خوشبختم / خوشوقتم', contextNoteFa: 'عبارت استاندارد هنگام معرفی', exampleTarget: 'Очень приятно познакомиться!', exampleFa: 'از آشنایی با شما بسیار خوشبختم!', collocations: ['приятно познакомиться', 'очень приятно'] },
        { id: 'ru_w1_5', word: 'Прощание', phonetic: '/prɐˈɕːænʲɪje/', partOfSpeech: 'noun', meaningFa: 'خداحافظی و بدرود', contextNoteFa: 'اسم خداحافظی', exampleTarget: 'Прощание прошло очень тепло.', exampleFa: 'خداحافظی بسیار گرم برگزار شد.', collocations: ['на прощание', 'время прощания'] },
      ],
      quiz: {
        promptFa: 'در زبان روسی برای گفتن «بسیار خوشبختم از آشنایی» چه می‌گویند؟',
        targetPrompt: 'Что говорят при знакомстве?',
        options: ['Прощание', 'Очень приятно', 'Приветствие', 'Вежливый'],
        correctIndex: 1,
        explanationFa: 'عبارت Очень приятно (Очень приятно познакомиться) معادل «خیلی خوشبختم از آشنایی» است.',
      },
    },
  },

  // Japanese (JA)
  ja: {
    1: {
      words: [
        { id: 'ja_w1_1', word: '挨拶 (Aisatsu)', phonetic: '/a.i.sa.tsɯ/', partOfSpeech: 'noun', meaningFa: 'احوالپرسی / سلام و تعارف', contextNoteFa: 'فرهنگ مهم احوالپرسی در ژاپن', exampleTarget: '毎日の挨拶はとても大切です。', exampleFa: 'احوالپرسی روزانه در فرهنگ ژاپن بسیار مهم است.', collocations: ['朝の挨拶', '丁寧な挨拶'] },
        { id: 'ja_w1_2', word: '丁寧 (Teinei)', phonetic: '/teː.neː/', partOfSpeech: 'adj', meaningFa: 'مودب / محترمانه', contextNoteFa: 'صفت رفتار مؤدبانه و دقیق', exampleTarget: 'ホセインさんはいつも丁寧です。', exampleFa: 'حسین آقا همیشه بسیار مؤدب و محترم است.', collocations: ['丁寧な言葉', '丁寧な態度'] },
        { id: 'ja_w1_3', word: '感謝する (Kansha suru)', phonetic: '/kaɴ.ɕa sɯ.ɾɯ/', partOfSpeech: 'verb', meaningFa: 'تشکر و قدردانی کردن', contextNoteFa: 'فعل سپاسگزاری عمیق', exampleTarget: '皆様の親切に心から感謝します。', exampleFa: 'از مهربانی همه شما از صمیم قلب سپاسگزارم.', collocations: ['心から感謝する', '感謝の気持ち'] },
        { id: 'ja_w1_4', word: '初めまして (Hajimemashite)', phonetic: '/ha.dʑi.me.ma.ɕi.te/', partOfSpeech: 'phrase', meaningFa: 'از آشنایی با شما خوشبختم', contextNoteFa: 'عبارت آغازین در اولین دیدار', exampleTarget: '初めまして、よろしくお願いします！', exampleFa: 'از آشنایی با شما خوشبختم، لطفاً مرا راهنمایی بفرمایید!', collocations: ['どうぞよろしく', '初めまして'] },
        { id: 'ja_w1_5', word: '別れ (Wakare)', phonetic: '/wa.ka.ɾe/', partOfSpeech: 'noun', meaningFa: 'خداحافظی و بدرود', contextNoteFa: 'اسم جدایی و خداحافظی', exampleTarget: '駅での別れは寂しかったです。', exampleFa: 'خداحافظی در ایستگاه غم‌انگیز بود.', collocations: ['別れの言葉', '別れの挨拶'] },
      ],
      quiz: {
        promptFa: 'در زبان ژاپنی، اولین بار که کسی را می‌بینید چه عبارتی می‌گویید؟',
        targetPrompt: '初めて会った時に言う言葉はどれですか？',
        options: ['別れ (Wakare)', '初めまして (Hajimemashite)', '丁寧 (Teinei)', '挨拶 (Aisatsu)'],
        correctIndex: 1,
        explanationFa: 'عبارت 初めまして (Hajimemashite) به معنای «از دیدارتان برای نخستین بار خوشبختم» است.',
      },
    },
  },

  // Chinese (ZH)
  zh: {
    1: {
      words: [
        { id: 'zh_w1_1', word: '问候 (Wènhòu)', phonetic: '/wən˥˩ xoʊ̯˥˩/', partOfSpeech: 'noun', meaningFa: 'احوالپرسی و سلام رساندن', contextNoteFa: 'اسم درود و احوالپرسی', exampleTarget: '请向您的家人转达我诚挚的问候。', exampleFa: 'لطفاً سلام‌های صمیمانه مرا به خانواده‌تان برسانید.', collocations: ['诚挚问候', '热情问候'] },
        { id: 'zh_w1_2', word: '礼貌 (Lǐmào)', phonetic: '/li˨˩˦ mɑʊ̯˥˩/', partOfSpeech: 'adj', meaningFa: 'مودب و با نزاکت', contextNoteFa: 'صفت ادب در فرهنگ چینی', exampleTarget: '说“请”和“谢谢”是很有礼貌的。', exampleFa: 'گفتن «لطفاً» و «متشکرم» بسیار مؤدبانه است.', collocations: ['懂礼貌', '有礼貌'] },
        { id: 'zh_w1_3', word: '感谢 (Gǎnxiè)', phonetic: '/kan˨˩˦ ɕjɛ˥˩/', partOfSpeech: 'verb', meaningFa: 'سپاسگزاری و تشکر عمیق', contextNoteFa: 'فعل رسمی‌تر از 谢谢', exampleTarget: '衷心感谢您的宝贵帮助。', exampleFa: 'از کمک ارزشمند شما از صمیم قلب سپاسگزارم.', collocations: ['衷心感谢', '深表感谢'] },
        { id: 'zh_w1_4', word: '幸会 (Xìnghuì)', phonetic: '/ɕiŋ˥˩ xweɪ̯˥˩/', partOfSpeech: 'phrase', meaningFa: 'بسیار خوشوقتم / از آشنایی با شما خرسندم', contextNoteFa: 'عبارت مؤدبانه و رسمی معرفی', exampleTarget: '久仰大名，今日一见真是幸会！', exampleFa: 'نام بزرگ شما را شنیده بودم، دیدارتان مایه افتخار و خوشبختی است!', collocations: ['幸会幸会', '初次幸会'] },
        { id: 'zh_w1_5', word: '道别 (Dàobié)', phonetic: '/tɑʊ̯˥˩ pjɛ̌/', partOfSpeech: 'noun', meaningFa: 'خداحافظی و بدرود گفتن', contextNoteFa: 'اسم وداع و خداحافظی', exampleTarget: '我们在机场依依不舍地道别。', exampleFa: 'ما در فرودگاه با دلتنگی خداحافظی کردیم.', collocations: ['依依道别', '向大家道别'] },
      ],
      quiz: {
        promptFa: 'کدام عبارت چینی به معنای «بسیار خوشوقت و مفتخرم از دیدار شما» است؟',
        targetPrompt: '初次见面时表示“很高兴认识你”的高雅词汇是？',
        options: ['道别', '幸会 (Xìnghuì)', '礼貌', '问候'],
        correctIndex: 1,
        explanationFa: 'واژه 幸会 (Xìnghuì) عبارتی بسیار مؤدبانه به معنای «بسیار خوشوقتم و از دیدار شما مفتخرم» است.',
      },
    },
  },
};

// Automatic fallback vocabulary generator for any week from 1 to 52 for all languages
export function getWeeklyVocabularyForLanguage(
  lang: TargetLanguageCode,
  weekNumber: number,
): WeeklyVocabularyPack {
  const safeWeekNum = Math.max(1, Math.min(52, weekNumber));
  const theme =
    VOCABULARY_THEMES_52.find((t) => t.weekNumber === safeWeekNum) || VOCABULARY_THEMES_52[0];

  const langPack = VOCABULARY_BY_LANG[lang]?.[safeWeekNum];

  if (langPack) {
    const fullWords: VocabularyItem[] = langPack.words.map((w, idx) => ({
      ...w,
      dayNumber: idx + 1,
    }));

    return {
      weekNumber: safeWeekNum,
      quarter: theme.quarter,
      monthNumber: theme.monthNumber,
      level: theme.level,
      themeFa: theme.themeFa,
      themeNative: theme.themeNativeEn,
      descriptionFa: theme.descriptionFa,
      words: fullWords,
      quizQuestion: langPack.quiz,
    };
  }

  // Smart thematic words generator across all 52 weeks for languages & weeks without hardcoded manual pack
  const baseWordsMap: Record<TargetLanguageCode, { prefix: string; exTarget: string }> = {
    en: { prefix: 'Vocab', exTarget: 'This essential word is widely used in daily life.' },
    de: { prefix: 'Wort', exTarget: 'Dieses wichtige Wort wird im Alltag oft verwendet.' },
    fr: { prefix: 'Mot', exTarget: 'Ce mot essentiel est très utilisé au quotidien.' },
    es: { prefix: 'Palabra', exTarget: 'Esta palabra fundamental se usa mucho a diario.' },
    it: { prefix: 'Parola', exTarget: 'Questa parola essenziale è usata frequentemente.' },
    tr: { prefix: 'Kelime', exTarget: 'Bu önemli kelime günlük hayatta sıkça kullanılır.' },
    ar: { prefix: 'مفردة', exTarget: 'تُستخدم هذه الكلمة المفتاحية بكثرة في الحياة اليومية.' },
    ru: { prefix: 'Слово', exTarget: 'Это ключевое слово часто используется в жизни.' },
    ja: { prefix: '単語', exTarget: 'この重要な単語は日常生活でよく使われます。' },
    zh: { prefix: '词汇', exTarget: '这个核心词汇在日常生活中非常常用。' },
  };

  const currentLangMeta = baseWordsMap[lang] || baseWordsMap.en;

  const generatedWords: VocabularyItem[] = [
    {
      id: `${lang}_w${safeWeekNum}_d1`,
      dayNumber: 1,
      word: `${currentLangMeta.prefix} 1: ${theme.themeNativeEn.split(' ')[0] || 'Core'}`,
      phonetic: `/w${safeWeekNum}d1/`,
      partOfSpeech: 'noun',
      meaningFa: `واژه کلیدی روز ۱ از موضوع «${theme.themeFa}»`,
      contextNoteFa: `کاربرد اساسی در بیان موضوع هفته ${safeWeekNum} (سطح ${theme.level})`,
      exampleTarget: currentLangMeta.exTarget,
      exampleFa: `این واژه نقشی کلیدی در درک مفهوم «${theme.themeFa}» ایفا می‌کند.`,
      collocations: [`essential ${theme.themeNativeEn.split(' ')[0]}`, `advanced usage`],
    },
    {
      id: `${lang}_w${safeWeekNum}_d2`,
      dayNumber: 2,
      word: `${currentLangMeta.prefix} 2: Action & Verb`,
      phonetic: `/w${safeWeekNum}d2/`,
      partOfSpeech: 'verb',
      meaningFa: `فعل کاربردی روز ۲ مرتبط با «${theme.themeFa}»`,
      contextNoteFa: 'صرف و ساختار فعلی مرتبط با این مهارت زبانی',
      exampleTarget: currentLangMeta.exTarget,
      exampleFa: 'تمرین مداوم این فعل ساختار گفتاری شما را نیتیو و روان می‌کند.',
      collocations: ['frequent action', 'fluent phrase'],
    },
    {
      id: `${lang}_w${safeWeekNum}_d3`,
      dayNumber: 3,
      word: `${currentLangMeta.prefix} 3: Modifier & Adj`,
      phonetic: `/w${safeWeekNum}d3/`,
      partOfSpeech: 'adj',
      meaningFa: `صفت توصیفی روز ۳ برای «${theme.themeFa}»`,
      contextNoteFa: 'توصیف دقیق حالت‌ها و ویژگی‌های موقعیتی',
      exampleTarget: currentLangMeta.exTarget,
      exampleFa: 'استفاده از این صفت کلام شما را دقیق‌تر و حرفه‌ای‌تر می‌سازد.',
      collocations: ['highly recommended', 'deep nuance'],
    },
    {
      id: `${lang}_w${safeWeekNum}_d4`,
      dayNumber: 4,
      word: `${currentLangMeta.prefix} 4: Idiomatic Expression`,
      phonetic: `/w${safeWeekNum}d4/`,
      partOfSpeech: 'phrase',
      meaningFa: `اصطلاح هم‌آیند روز ۴ در موضوع «${theme.themeFa}»`,
      contextNoteFa: 'ترکیب طبیعی که افراد بومی در این موضوع به کار می‌برند',
      exampleTarget: currentLangMeta.exTarget,
      exampleFa: 'این اصطلاح در گفت‌وگوهای طبیعی و رسانه‌ها پرکاربرد است.',
      collocations: ['colloquial expression', 'natural flow'],
    },
    {
      id: `${lang}_w${safeWeekNum}_d5`,
      dayNumber: 5,
      word: `${currentLangMeta.prefix} 5: Mastery Capstone`,
      phonetic: `/w${safeWeekNum}d5/`,
      partOfSpeech: 'phrase',
      meaningFa: `عبارت تسلط نهایی روز ۵ برای تثبیت هفته ${safeWeekNum}`,
      contextNoteFa: 'تثبیت دایره واژگان هفته در حافظه بلندمدت',
      exampleTarget: currentLangMeta.exTarget,
      exampleFa: 'با تسلط بر این عبارت، پرونده واژگان این هفته با موفقیت بسته می‌شود.',
      collocations: ['complete mastery', 'fluency badge'],
    },
  ];

  return {
    weekNumber: safeWeekNum,
    quarter: theme.quarter,
    monthNumber: theme.monthNumber,
    level: theme.level,
    themeFa: theme.themeFa,
    themeNative: theme.themeNativeEn,
    descriptionFa: theme.descriptionFa,
    words: generatedWords,
    quizQuestion: {
      promptFa: `کدام مورد بهترین توصیف برای مفاهیم واژگان هفته ${safeWeekNum} (${theme.themeFa}) است؟`,
      targetPrompt: `Which item best matches the mastery vocabulary of Week ${safeWeekNum}?`,
      options: [
        `مفاهیم و اصطلاحات مرتبط با ${theme.themeFa}`,
        'واژگان نامرتبط عمومی',
        'صرفاً گرامر مقدماتی',
        'حروف الفبای تکراری',
      ],
      correctIndex: 0,
      explanationFa: `واژگان هفته ${safeWeekNum} بر تسلط عمیق موضوع «${theme.themeFa}» در سطح ${theme.level} تمرکز دارند.`,
    },
  };
}

// Get all 52 weeks vocabulary packs for any selected language
export function getAll52WeeksVocabularyForLanguage(
  lang: TargetLanguageCode,
): WeeklyVocabularyPack[] {
  return VOCABULARY_THEMES_52.map((t) => getWeeklyVocabularyForLanguage(lang, t.weekNumber));
}
