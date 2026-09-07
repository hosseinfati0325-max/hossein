import {
  CurriculumWeek,
  TargetLanguageCode,
  CEFRLevel,
  WeekDifficulty,
  WeekQuarter,
  WeekStageLesson,
  Exercise,
} from '../types';

// ============================================================================
// 52-WEEK CURRICULUM BLUEPRINTS (A1 to C2)
// 52 Weeks = 4 Quarters / 12 Months
// Q1: Weeks 1-13 (A1 -> A2)
// Q2: Weeks 14-26 (A2 -> B1)
// Q3: Weeks 27-39 (B1 -> B2)
// Q4: Weeks 40-52 (C1 -> C2)
// ============================================================================

export interface WeekBlueprint {
  weekNumber: number;
  quarter: WeekQuarter;
  monthNumber: number;
  level: CEFRLevel;
  difficulty: WeekDifficulty;
  titleFa: string;
  themeFa: string;
  grammarFocusFa: string;
  vocabularyFocusFa: string[];
  milestoneTitleFa?: string;
  isMilestone?: boolean;
  culturalNoteFa?: string;
  aiConversationTopic?: string;
}

export const WEEK_BLUEPRINTS: WeekBlueprint[] = [
  // -------------------------------------------------------------
  // QUARTER 1 (Weeks 1-13): Breakthrough Foundations (A1 - A2)
  // -------------------------------------------------------------
  {
    weekNumber: 1,
    quarter: 1,
    monthNumber: 1,
    level: 'A1',
    difficulty: 'easy',
    titleFa: 'الفبا، آواها و احوالپرسی اولیه',
    themeFa: 'شروع مسیر، سلام و احوالپرسی، خداحافظی و کلمات اولیه ادب',
    grammarFocusFa: 'آشنایی با صداها، ساختار جملات ساده و کلمات اشاره اولیه',
    vocabularyFocusFa: ['سلام', 'صبح بخیر', 'خداحافظ', 'لطفاً', 'متشکرم', 'بله', 'خیر'],
    culturalNoteFa: 'نحوه دست دادن و ارتباط چشمی در فرهنگ‌های مختلف هنگام احوالپرسی',
    aiConversationTopic: 'مکالمه اولیه برای سلام و معرفی نام',
  },
  {
    weekNumber: 2,
    quarter: 1,
    monthNumber: 1,
    level: 'A1',
    difficulty: 'easy',
    titleFa: 'ضمایر فاعلی، افعال بودن و معرفی خود',
    themeFa: 'نام، ملیت، سن، شغل و معرفی خود و دیگران',
    grammarFocusFa: 'صرف افعال بودن (To Be / Sein / Être / Ser) و ضمایر فاعلی (من، تو، او...)',
    vocabularyFocusFa: ['من', 'تو', 'او', 'نام', 'دانشجو', 'اهل ایران', 'خوشبختم'],
    culturalNoteFa: 'القاب رسمی و نحوه خطاب قرار دادن افراد (خانم/آقا) در جوامع مختلف',
  },
  {
    weekNumber: 3,
    quarter: 1,
    monthNumber: 1,
    level: 'A1',
    difficulty: 'easy',
    titleFa: 'اعداد، ساعت، روزهای هفته و تقویم',
    themeFa: 'شمارش اعداد ۱ تا ۱۰۰، پرسیدن ساعت، روزها و ماه‌های سال',
    grammarFocusFa: 'حروف اضافه زمان (در ساعت...، در روز...) و اعداد ترتیبی و اصلی',
    vocabularyFocusFa: ['یک تا ده', 'ساعت چند است؟', 'شنبه', 'یکشنبه', 'امروز', 'فردا', 'ماه'],
    culturalNoteFa: 'تفاوت سیستم‌های ۲۴ ساعته و ۱۲ ساعته (AM/PM) در کشورهای مقصد',
  },
  {
    weekNumber: 4,
    quarter: 1,
    monthNumber: 1,
    level: 'A1',
    difficulty: 'easy',
    titleFa: 'خانواده، بستگان و صفات ملکی',
    themeFa: 'شجره‌نامه، اعضای خانواده و توصیف روابط خانوادگی',
    grammarFocusFa: 'ضمایر و صفات ملکی (مال من، مال تو...) و حالت ملکی',
    vocabularyFocusFa: ['پدر', 'مادر', 'برادر', 'خواهر', 'همسر', 'فرزند', 'خانواده'],
    culturalNoteFa: 'نقش خانواده و دورهمی‌های آخر هفته در سبک زندگی کشورهای مختلف',
  },
  {
    weekNumber: 5,
    quarter: 1,
    monthNumber: 2,
    level: 'A1',
    difficulty: 'easy',
    titleFa: 'اشیای پیرامون، رنگ‌ها و صفات ساده',
    themeFa: 'وسایل اتاق، محل کار، رنگ‌ها، اندازه و توصیف ظاهری',
    grammarFocusFa: 'جایگاه صفات نسبت به اسم، مفرد و جمع و تطابق جنسیت در زبان‌های جنسیت‌دار',
    vocabularyFocusFa: ['کتاب', 'قلم', 'میز', 'قرمز', 'آبی', 'بزرگ', 'کوچک', 'زیبا'],
    culturalNoteFa: 'معانی نمادین رنگ‌ها و هدیه دادن اشیا در فرهنگ‌های گوناگون',
  },
  {
    weekNumber: 6,
    quarter: 1,
    monthNumber: 2,
    level: 'A1',
    difficulty: 'easy',
    titleFa: 'زمان حال ساده و فعالیت‌های روزمره',
    themeFa: 'برنامه روزانه از بیدار شدن تا خوابیدن، عادات و روتین زندگی',
    grammarFocusFa: 'صرف افعال باقاعده در زمان حال ساده، منفی کردن و سؤالی کردن با افعال کمکی',
    vocabularyFocusFa: ['بیدار شدن', 'صبحانه خوردن', 'رفتن به کار', 'مطالعه', 'ورزش', 'خوابیدن'],
    culturalNoteFa: 'ساعات کاری استاندارد و مفهوم استراحت نیمروزی (Siesta / Fika)',
  },
  {
    weekNumber: 7,
    quarter: 1,
    monthNumber: 2,
    level: 'A1',
    difficulty: 'medium',
    titleFa: 'غذاها، نوشیدنی‌ها و سفارش در کافه و رستوران',
    themeFa: 'منوی غذا، میوه‌ها، طعم‌ها، درخواست صورتحساب و انعام',
    grammarFocusFa: 'اسامی قابل شمارش و غیرقابل شمارش، کلمات مقداری (کمی، مقداری، چندتا)',
    vocabularyFocusFa: ['قهوه', 'آب', 'نان', 'گوشت', 'میوه', 'صورتحساب', 'خوشمزه', 'سفارش'],
    culturalNoteFa: 'قوانین و آداب انعام دادن (Tipping) در رستوران‌های سراسر جهان',
  },
  {
    weekNumber: 8,
    quarter: 1,
    monthNumber: 2,
    level: 'A1',
    difficulty: 'medium',
    titleFa: 'آزمون جامع پایان سطح A1 و مکالمه استقلال فردی',
    themeFa: 'جمع‌بندی تمام آموخته‌های مقدماتی، تثبیت مهارت‌های پایه و صدور گواهی A1',
    grammarFocusFa: 'مرور جامع گرامر زمان حال، ضمایر، افعال اساسی و ترکیب جملات',
    vocabularyFocusFa: ['واژگان کلیدی ۱۰۰تایی', 'سوالات روزمره', 'توصیف وضعیت', 'مکالمه پایه'],
    milestoneTitleFa: '🏆 نشان اتمام سطح A1 (Breakthrough Mastery)',
    isMilestone: true,
    culturalNoteFa: 'چگونه پس از سطح A1 با اعتماد به نفس در محیط واقعی ارتباط برقرار کنیم',
  },
  {
    weekNumber: 9,
    quarter: 1,
    monthNumber: 3,
    level: 'A2',
    difficulty: 'medium',
    titleFa: 'زمان گذشته ساده و افعال باقاعده',
    themeFa: 'روایت وقایع دیروز، آخر هفته گذشته و خاطرات نزدیک',
    grammarFocusFa: 'ساخت گذشته ساده با پسوندهای باقاعده (-ed / -te / -é)، منفی و سوالی در گذشته',
    vocabularyFocusFa: ['دیروز', 'هفته گذشته', 'اتفاق افتاد', 'کار کردم', 'دیدار کردم', 'تماشا کردم'],
    culturalNoteFa: 'نحوه روایت داستان‌های شخصی و صحبت درباره وقایع گذشته در گپ‌های دوستانه',
  },
  {
    weekNumber: 10,
    quarter: 1,
    monthNumber: 3,
    level: 'A2',
    difficulty: 'medium',
    titleFa: 'افعال گذشته بی‌قاعده و خاطرات سفر',
    themeFa: 'سفرهای گذشته، وسایل نقلیه، اقامت و حوادث جالب سفر',
    grammarFocusFa: 'صرف و به‌خاطرسپاری ۲۰ فعل بی‌قاعده پرتکرار در زمان گذشته',
    vocabularyFocusFa: ['رفتم', 'دیدم', 'خریدم', 'خوردم', 'آمدم', 'قطار', 'هواپیما', 'چمدان'],
    culturalNoteFa: 'فرهنگ سفر با قطار در اروپا و اقامت در هاستل‌ها و هتل‌ها',
  },
  {
    weekNumber: 11,
    quarter: 1,
    monthNumber: 3,
    level: 'A2',
    difficulty: 'medium',
    titleFa: 'جهت‌یابی، آدرس‌دهی و گشت‌وگذار در شهر',
    themeFa: 'پیدا کردن اماکن، پرسیدن نشانی، ایستگاه مترو، داروخانه و موزه',
    grammarFocusFa: 'حروف اضافه مکان و جهت (مستقیم، چپ، راست، روبرو، کنار) و افعال حرکتی',
    vocabularyFocusFa: ['مستقیم برو', 'بپیچ به راست', 'سمت چپ', 'ایستگاه', 'میدان', 'نزدیک', 'دور'],
    culturalNoteFa: 'علائم شهری و اپلیکیشن‌های محبوب حمل و نقل عمومی در هر کشور',
  },
  {
    weekNumber: 12,
    quarter: 1,
    monthNumber: 3,
    level: 'A2',
    difficulty: 'medium',
    titleFa: 'خرید، پوشاک، قیمت‌ها و پرداخت',
    themeFa: 'فروشگاه لباس، پرو لباس، سایز، رنگ، تخفیف، رسید و کارت اعتباری',
    grammarFocusFa: 'ضمایر اشاره دور و نزدیک، مقایسه قیمت‌ها و صفات اشاره',
    vocabularyFocusFa: ['پیراهن', 'شلوار', 'کفش', 'تخفیف', 'قیمت چنده؟', 'ارزان', 'گران', 'کارت'],
    culturalNoteFa: 'مقررات مرجوعی کالا (Refund/Exchange) و خرید در حراجی‌های فصلی',
  },
  {
    weekNumber: 13,
    quarter: 1,
    monthNumber: 3,
    level: 'A2',
    difficulty: 'medium',
    titleFa: 'آب و هوا، فصول سال، طبیعت و پوشش مناسب',
    themeFa: 'پیش‌بینی هواشناسی، دما، باران، برف، آفتابی و لباس متناسب',
    grammarFocusFa: 'جملات غیرشخصی هواشناسی (هوا سرد است، باران می‌بارد) و حروف اضافه فصول',
    vocabularyFocusFa: ['آفتابی', 'بارانی', 'برفی', 'گرم', 'سرد', 'بهار', 'تابستان', 'پاییز', 'زمستان'],
    culturalNoteFa: 'مکالمه درباره وضعیت هوا به عنوان یخ‌شکن (Icebreaker) اصلی در فرهنگ‌ها',
  },

  // -------------------------------------------------------------
  // QUARTER 2 (Weeks 14-26): Expanding Fluency (A2 -> B1)
  // -------------------------------------------------------------
  {
    weekNumber: 14,
    quarter: 2,
    monthNumber: 4,
    level: 'A2',
    difficulty: 'medium',
    titleFa: 'سلامتی، اعضای بدن، بیماری‌های ساده و داروخانه',
    themeFa: 'ویزیت پزشک، توصیف علائم بیماری، خرید دارو و بیمه درمانی',
    grammarFocusFa: 'عبارات بیان درد و نیاز (سرم درد می‌کند، باید استراحت کنم...) و امری‌های توصیه‌ای',
    vocabularyFocusFa: ['سردرد', 'تب', 'دکتر', 'دارو', 'استراحت', 'قرص', 'حالم خوب نیست'],
    culturalNoteFa: 'سیستم‌های نوبت‌دهی پزشکی و اورژانس در کشورهای مختلف',
  },
  {
    weekNumber: 15,
    quarter: 2,
    monthNumber: 4,
    level: 'A2',
    difficulty: 'medium',
    titleFa: 'زمان آینده و برنامه‌ریزی برای تعطیلات',
    themeFa: 'اهداف آینده، برنامه‌ریزی تعطیلات، رزرو هتل و بلیط',
    grammarFocusFa: 'آینده با قصد قبلی (Going to / Futur proche) در مقایسه با آینده آنی (Will)',
    vocabularyFocusFa: ['قصد دارم', 'سفر خواهم کرد', 'رزرو', 'تعطیلات', 'هتل', 'ساحل', 'کمپ'],
    culturalNoteFa: 'تعطیلات رسمی و تعطیلات سالانه تابستانی در اروپا و آسیا',
  },
  {
    weekNumber: 16,
    quarter: 2,
    monthNumber: 4,
    level: 'A2',
    difficulty: 'medium',
    titleFa: 'مقایسه صفات (تفضیل و عالی) و ترجیحات',
    themeFa: 'مقایسه هتل‌ها، گوشی‌های موبایل، شهرها و انتخاب بهترین گزینه',
    grammarFocusFa: 'ساخت صفات تفضیلی (تر) و عالی (ترین) باقاعده و بی‌قاعده (بهتر، بهترین)',
    vocabularyFocusFa: ['بهتر از', 'بهترین', 'بزرگتر', 'سریع‌تر', 'گران‌تر', 'ترجیح می‌دهم'],
    culturalNoteFa: 'فرهنگ نقد و بررسی آنلاین و رتبه‌بندی خدمات در خارج از کشور',
  },
  {
    weekNumber: 17,
    quarter: 2,
    monthNumber: 5,
    level: 'A2',
    difficulty: 'medium',
    titleFa: 'افعال کمکی وجهی (توانستن، اجبار، اجازه، توصیه)',
    themeFa: 'قوانین فرودگاه، خوابگاه، محل کار، توصیه‌های سلامتی و اجازه گرفتن',
    grammarFocusFa: 'افعال Modal (Can, Must, Should, May / Können, Müssen / Pouvoir, Devoir)',
    vocabularyFocusFa: ['می‌توانم', 'باید', 'نباید', 'بهتر است', 'اجازه دارم', 'ممنوع است'],
    culturalNoteFa: 'قوانین و تابوهای اجتماعی نانوشته در مکان‌های عمومی',
  },
  {
    weekNumber: 18,
    quarter: 2,
    monthNumber: 5,
    level: 'A2',
    difficulty: 'hard',
    titleFa: 'آزمون جامع پایان سطح A2 و مکالمه بقای زبانی',
    themeFa: 'ارزیابی مهارت‌های کامل سطح A2، آمادگی برای ورود به سطح متوسطه بین‌المللی',
    grammarFocusFa: 'ترکیب تمام ساختارهای گذشته، آینده، افعال کمکی و مقایسه‌ای',
    vocabularyFocusFa: ['واژگان سطح A2 (۵۰۰ واژه)', 'سناریوهای شبیه‌سازی سفر و خرید و دکتر'],
    milestoneTitleFa: '🏅 نشان اتمام سطح A2 (Elementary Fluency Certificate)',
    isMilestone: true,
    culturalNoteFa: 'پیروزی بزرگ! اکنون می‌توانید تمام نیازهای پایه اقامتی و گردشگری را شخصاً رفع کنید.',
  },
  {
    weekNumber: 19,
    quarter: 2,
    monthNumber: 5,
    level: 'B1',
    difficulty: 'hard',
    titleFa: 'زمان حال کامل و تجربیات زندگی',
    themeFa: 'صحبت درباره کشورهایی که دیده‌اید، کتاب‌هایی که خوانده‌اید و تجارب مهم',
    grammarFocusFa: 'زمان حال کامل (Present Perfect / Passé Composé / Perfekt) با کلمات Ever, Never, Just, Yet',
    vocabularyFocusFa: ['تاکنون', 'هرگز', 'به تازگی', 'تجربه کرده‌ام', 'سفر رفته‌ام', 'برنده شده‌ام'],
    culturalNoteFa: 'مکالمه درباره پیشینه تجربی در معرفی‌های حرفه‌ای و لینکدین',
  },
  {
    weekNumber: 20,
    quarter: 2,
    monthNumber: 5,
    level: 'B1',
    difficulty: 'hard',
    titleFa: 'زمان گذشته استمراری و وقایع هم‌زمان در داستان',
    themeFa: 'شرح حوادث غیرمنتظره، داستان‌سرایی، چه اتفاقی افتاد وقتی که...',
    grammarFocusFa: 'تلفیق گذشته استمراری با گذشته ساده (While I was sleeping, the phone rang)',
    vocabularyFocusFa: ['در حالی که', 'ناگهان', 'در آن لحظه', 'اتفاق می‌افتاد', 'تصادف', 'غافلگیری'],
    culturalNoteFa: 'هنر قصه‌گویی (Storytelling) در سخنرانی‌ها و تعاملات اجتماعی',
  },
  {
    weekNumber: 21,
    quarter: 2,
    monthNumber: 6,
    level: 'B1',
    difficulty: 'hard',
    titleFa: 'جملات شرطی نوع اول و دوم (فرضیات و تصمیم‌ها)',
    themeFa: 'برنامه‌های مشروط به شرایط، رویاپردازی (اگر پولدار بودم...) و تصمیم‌گیری',
    grammarFocusFa: 'شرطی نوع اول (واقعی/آینده) و شرطی نوع دوم (فرضی/حال حاضر با would/could)',
    vocabularyFocusFa: ['اگر', 'در صورتیکه', 'انجام می‌دادم', 'اتفاق می‌افتاد', 'رویا', 'فرصت'],
    culturalNoteFa: 'استفاده از لحن‌های فرضی برای مودبانه‌تر کردن درخواست‌ها در سازمان‌ها',
  },
  {
    weekNumber: 22,
    quarter: 2,
    monthNumber: 6,
    level: 'B1',
    difficulty: 'hard',
    titleFa: 'احساسات، ابراز عقیده و مخالفت مؤدبانه',
    themeFa: 'گفتگوهای گروهی، بیان نظر شخصی، ابراز احساسات، موافقت و مخالفت ظریف',
    grammarFocusFa: 'عبارات آغازین نظر (In my opinion, I believe) و حروف ربط تضاد (However, Although)',
    vocabularyFocusFa: ['به نظر من', 'موافقم', 'کاملاً مطمئن نیستم', 'از دیدگاه من', 'هیجان‌زده', 'نگران'],
    culturalNoteFa: 'تفاوت فرهنگ‌های مستقیم (Direct) و غیرمستقیم (Indirect) در بیان مخالفت',
  },
  {
    weekNumber: 23,
    quarter: 2,
    monthNumber: 6,
    level: 'B1',
    difficulty: 'hard',
    titleFa: 'شغل، رزومه‌نویسی و آمادگی برای مصاحبه کاری',
    themeFa: 'توصیف مهارت‌ها، سابقه کار، نقاط قوت و ضعف و پاسخ به سوالات مصاحبه',
    grammarFocusFa: 'افعال عملگرای رزومه (Action Verbs) و زمان‌های مناسب برای تجربیات گذشته و حال',
    vocabularyFocusFa: ['رزومه', 'مصاحبه', 'مسئولیت', 'مهارت', 'همکاری تیمی', 'پیشرفت کاری'],
    culturalNoteFa: 'فرمت استاندارد رزومه (CV) و اهمیت شبکه‌سازی شغلی (Networking)',
  },
  {
    weekNumber: 24,
    quarter: 2,
    monthNumber: 6,
    level: 'B1',
    difficulty: 'hard',
    titleFa: 'سفرهای بین‌المللی و حل چالش‌های غیرمنتظره',
    themeFa: 'گم شدن بار، تاخیر پرواز، تغییر رزرو هتل و حل اختلاف در سفر',
    grammarFocusFa: 'افعال عبارتی سفر (Check in, Drop off, Take off) و جملات گزارش شکایت',
    vocabularyFocusFa: ['تاخیر پرواز', 'گم شدن چمدان', 'جبران خسارت', 'اتاق جایگزین', 'مسئول خدمات'],
    culturalNoteFa: 'حقوق مسافران بین‌المللی و نحوه طرح شکایت اداری به صورت محترمانه',
  },
  {
    weekNumber: 25,
    quarter: 2,
    monthNumber: 7,
    level: 'B1',
    difficulty: 'hard',
    titleFa: 'ساختار مجهول در اخبار و اتفاقات روزمره',
    themeFa: 'گزارش‌های خبری، اختراعات، اکتشافات و فرآیندهای تولید',
    grammarFocusFa: 'مجهول زمان حال ساده و گذشته ساده (Passive Voice: is made / was discovered)',
    vocabularyFocusFa: ['کشف شد', 'ساخته شد', 'منتشر شد', 'برگزار می‌شود', 'تولید شده توسط'],
    culturalNoteFa: 'سبک نگارش روزنامه‌ها و رسانه‌های معتبر زبان هدف',
  },
  {
    weekNumber: 26,
    quarter: 2,
    monthNumber: 7,
    level: 'B1',
    difficulty: 'hard',
    titleFa: 'افعال عبارتی (Phrasal Verbs) و اصطلاحات روزمره',
    themeFa: 'زبان طبیعی کوچه و بازار، ارتباط غیررسمی با دوستان بومی',
    grammarFocusFa: 'افعال عبارتی جداشدنی و جدانشدنی (Give up, Turn on, Look forward to)',
    vocabularyFocusFa: ['منصرف شدن', 'ادامه دادن', 'مراقبت کردن', 'منتظر بودن', 'سر زدن'],
    culturalNoteFa: 'چرا افعال عبارتی کلید طبیعی صحبت کردن شبیه افراد بومی (Native) هستند',
  },

  // -------------------------------------------------------------
  // QUARTER 3 (Weeks 27-39): Professional & Academic Fluency (B1 -> B2)
  // -------------------------------------------------------------
  {
    weekNumber: 27,
    quarter: 3,
    monthNumber: 7,
    level: 'B1',
    difficulty: 'hard',
    titleFa: 'نقل قول مستقیم و غیرمستقیم در گزارش رویدادها',
    themeFa: 'انتقال سخنان دیگران، مصاحبه‌های خبری و گزارش پیام‌ها',
    grammarFocusFa: 'قوانین تغییر زمان‌ها و ضمایر در نقل قول غیرمستقیم (Reported Speech)',
    vocabularyFocusFa: ['او گفت که', 'توضیح داد', 'پرسید که آیا', 'تاکید کرد', 'بیانیه'],
    culturalNoteFa: 'اخلاق گزارش‌دهی و نقل قول دقیق سخنان در محیط‌های دانشگاهی',
  },
  {
    weekNumber: 28,
    quarter: 3,
    monthNumber: 7,
    level: 'B1',
    difficulty: 'hard',
    titleFa: 'آزمون جامع پایان سطح B1 (آستانه استقلال کامل زبانی)',
    themeFa: 'شبیه‌سازی کامل آزمون B1 معادل گوته B1 / آیلتس ۵.۵ / DELF B1',
    grammarFocusFa: 'آزمون چهارمهارته خواندن، شنیدن، نوشتن و قواعد تحلیلی B1',
    vocabularyFocusFa: ['تسلط بر ۱۲۰۰ واژه پرکاربرد', 'مکالمه روان در موقعیت‌های پیچیده'],
    milestoneTitleFa: '🎖️ نشان اتمام سطح B1 (Independent User Certification)',
    isMilestone: true,
    culturalNoteFa: 'تبریک! شما به آستانه رسمی مهاجرت تحصیلی و استقلال زبانی کامل رسیدید.',
  },
  {
    weekNumber: 29,
    quarter: 3,
    monthNumber: 8,
    level: 'B2',
    difficulty: 'expert',
    titleFa: 'شرطی نوع سوم و پشیمانی از گذشته',
    themeFa: 'تحلیل تاریخ، فرصت‌های از دست رفته و سناریوهای پشیمانی (اگر خوانده بودم...)',
    grammarFocusFa: 'شرطی نوع ۳ (If + Past Perfect, would have + V3) و ساختارهای Wish / If only',
    vocabularyFocusFa: ['کاش انجام داده بودم', 'اگر اتفاق افتاده بود', 'پشیمانی', 'فرصت از دست رفته'],
    culturalNoteFa: 'نحوه بیان عذرخواهی‌های رسمی و جبران اشتباهات در مدیریت بحران',
  },
  {
    weekNumber: 30,
    quarter: 3,
    monthNumber: 8,
    level: 'B2',
    difficulty: 'expert',
    titleFa: 'زمان‌های کامل استمراری و توالی زمانی دقیق',
    themeFa: 'پروژه‌های طولانی، سابقه تحقیقاتی و تداوم فعالیت‌ها تا زمان مشخص',
    grammarFocusFa: 'Present Perfect Continuous و Past Perfect Continuous با For / Since / All day',
    vocabularyFocusFa: ['مدت‌هاست که', 'مشغول تحقیق بوده‌ام', 'روند مستمر', 'پیشرفت تدریجی'],
    culturalNoteFa: 'گزارش پیشرفت پروژه‌های سازمانی (Progress Reports) به مدیران ارشد',
  },
  {
    weekNumber: 31,
    quarter: 3,
    monthNumber: 8,
    level: 'B2',
    difficulty: 'expert',
    titleFa: 'جملات موصولی پیشرفته و توصیف مفاهیم انتزاعی',
    themeFa: 'تعریف اصطلاحات علمی، ارجاعات دقیق به اسناد و تحلیل پیچیده پدیده‌ها',
    grammarFocusFa: 'Relative Clauses تعریفی و غیرتعریفی با Whom, Whose, Whereby, In which',
    vocabularyFocusFa: ['پدیده‌ای که توسط آن', 'شخصی که آثارش', 'موقعیتی که در آن', 'مشخصه بارز'],
    culturalNoteFa: 'ظرافت‌های نوشتاری در مقالات علمی و ژورنال‌های معتبر',
  },
  {
    weekNumber: 32,
    quarter: 3,
    monthNumber: 8,
    level: 'B2',
    difficulty: 'expert',
    titleFa: 'رسانه، اخبار جهان، تحلیل رویدادها و اعتبارسنجی خبر',
    themeFa: 'اخبار بین‌الملل، تیترهای ژورنالیستی، سوگیری رسانه‌ای و راستی‌آزمایی فکت‌ها',
    grammarFocusFa: 'واژگان متراکم خبری (Headlinese) و گرامر جملات فشرده مجهول',
    vocabularyFocusFa: ['تحلیل رویداد', 'سوگیری رسانه‌ای', 'منابع موثق', 'تیتر اول', 'پوشش خبری'],
    culturalNoteFa: 'آزادی بیان و تنوع دیدگاه‌های مطبوعاتی در کشورهای پیشرو',
  },
  {
    weekNumber: 33,
    quarter: 3,
    monthNumber: 9,
    level: 'B2',
    difficulty: 'expert',
    titleFa: 'فناوری، هوش مصنوعی و دنیای دیجیتال',
    themeFa: 'تحول دیجیتال، امنیت سایبری، شبکه‌های اجتماعی، اخلاق در AI و نوآوری',
    grammarFocusFa: 'افعال مرکب و نام‌گذاری فرآیندهای فنی با پسوندهای تخصصی (-ization, -ology)',
    vocabularyFocusFa: ['الگوریتم', 'امنیت سایبری', 'هوش مصنوعی', 'تحول دیجیتال', 'حریم خصوصی'],
    culturalNoteFa: 'قوانین حفاظت از داده‌ها مانند GDPR در اروپا و استانداردهای جهانی فناوری',
  },
  {
    weekNumber: 34,
    quarter: 3,
    monthNumber: 9,
    level: 'B2',
    difficulty: 'expert',
    titleFa: 'مکاتبات رسمی اداری و ایمیل‌های تجاری',
    themeFa: 'نگارش نامه اداری، درخواست همکاری، پیگیری قرارداد و مکاتبات دیپلماتیک',
    grammarFocusFa: 'قالب‌های فرمال ایمیل (Dear Sir/Madam, I am writing to inquire, Yours sincerely)',
    vocabularyFocusFa: ['جهت استحضار', 'پیرو مذاکرات', 'ضمیمه فایل', 'احتراماً', 'کمال امتنان'],
    culturalNoteFa: 'پروتکل‌های ایمیل‌نگاری حرفه‌ای و تفاوت ادب کلامی در مکاتبات سازمانی',
  },
  {
    weekNumber: 35,
    quarter: 3,
    monthNumber: 9,
    level: 'B2',
    difficulty: 'expert',
    titleFa: 'مناظره، فن بیان، استدلال و متقاعدسازی مخاطب',
    themeFa: 'شرکت در مباحثات آکادمیک، پاسخ به نقدهای تند و هنر اقناع شنوندگان',
    grammarFocusFa: 'ابزارهای انسجام کلام (Cohesive Devices: Furthermore, Conversely, In light of this)',
    vocabularyFocusFa: ['استدلال قانع‌کننده', 'دیدگاه مخالف', 'شواهد تجربی', 'نتیجه‌گیری منطقی'],
    culturalNoteFa: 'قواعد دموکراتیک مناظره و احترام به نظرات متفاوت در جوامع آکادمیک',
  },
  {
    weekNumber: 36,
    quarter: 3,
    monthNumber: 9,
    level: 'B2',
    difficulty: 'expert',
    titleFa: 'محیط زیست، تغییرات اقلیمی و پایداری سیاره',
    themeFa: 'انرژی‌های پاک، بحران آب، گرمایش زمین، بازیافت و اقتصاد چرخشی',
    grammarFocusFa: 'جملات سببی (Causative Structures: Have something done, Lead to, Result in)',
    vocabularyFocusFa: ['انرژی تجدیدپذیر', 'ردپای کربن', 'تغییر اقلیم', 'اکوسیستم', 'توسعه پایدار'],
    culturalNoteFa: 'فرهنگ تفکیک زباله و جنبش‌های سبز شهروندی در کشورهای پیشرفته',
  },
  {
    weekNumber: 37,
    quarter: 3,
    monthNumber: 10,
    level: 'B2',
    difficulty: 'expert',
    titleFa: 'روانشناسی، روابط انسانی و هوش هیجانی',
    themeFa: 'مدیریت استرس، تیپ‌های شخصیتی، انگیزه درونی، تعادل کار و زندگی',
    grammarFocusFa: 'اسامی مصدری (Gerunds) در نقش فاعل و مفعول جملات پیچیده',
    vocabularyFocusFa: ['هوش هیجانی', 'سلامت روان', 'انگیزه درونی', 'همدلی', 'تعادل کار و زندگی'],
    culturalNoteFa: 'اهمیت سلامت روان در محیط کار مدرن و مرخصی‌های سلامتی',
  },
  {
    weekNumber: 38,
    quarter: 3,
    monthNumber: 10,
    level: 'B2',
    difficulty: 'expert',
    titleFa: 'آزمون جامع پایان سطح B2 (معادل آیلتس 6.5 / گوته B2)',
    themeFa: 'سنجش جامع چهار مهارت اصلی برای پذیرش دانشگاهی و مهاجرت کاری تخصصی',
    grammarFocusFa: 'تسلط بر ساختارهای پیشرفته ترکیبی و نگارش مقاله تحلیلی ۲۵۰ کلمه‌ای',
    vocabularyFocusFa: ['دایره واژگان ۲۵۰۰ کلمه‌ای B2', 'نگارش مقاله استاندارد', 'درک مطلب فشرده'],
    milestoneTitleFa: '🌟 نشان طلایی تسلط فوق‌متوسط B2 (Upper-Intermediate Mastery)',
    isMilestone: true,
    culturalNoteFa: 'با گذراندن موفق این هفته، واجد شرایط تحصیل در دانشگاه‌های خارجی به زبان هدف هستید!',
  },

  // -------------------------------------------------------------
  // QUARTER 4 (Weeks 39-52): Advanced Rhetoric & Native Mastery (C1 -> C2)
  // -------------------------------------------------------------
  {
    weekNumber: 39,
    quarter: 4,
    monthNumber: 10,
    level: 'C1',
    difficulty: 'expert',
    titleFa: 'گرامر معکوس (Inversion) و ساختارهای تأکیدی شدید',
    themeFa: 'افزایش گیرایی و قدرت سخنرانی، تأکید دراماتیک در متن‌های سطح بالا',
    grammarFocusFa: 'Inversion بعد از قیدهای منفی (Hardly had I, Never before have we, Under no circumstances)',
    vocabularyFocusFa: ['به هیچ وجه', 'به ندرت چنین دیده‌ایم', 'تنها در صورتیکه', 'بدیهی است که'],
    culturalNoteFa: 'کاربرد ساختارهای معکوس در سخنرانی‌های تاریخی و مقالات سردبیری',
  },
  {
    weekNumber: 40,
    quarter: 4,
    monthNumber: 10,
    level: 'C1',
    difficulty: 'expert',
    titleFa: 'واژگان هم‌آیند آکادمیک (Advanced Collocations) و استعاره‌ها',
    themeFa: 'ترکیب طبیعی کلمات با یکدیگر مانند اهل زبان بدون ترجمه واژه به واژه',
    grammarFocusFa: 'قوانین همنشینی قید + صفت (Utterly devastated, Bitterly disappointed, Highly acclaimed)',
    vocabularyFocusFa: ['تحسین گسترده', 'عمیقاً متأثر', 'ضرورت اجتناب‌ناپذیر', 'نقش کلیدی داشتن'],
    culturalNoteFa: 'چرا هم‌آیندها تمایز اصلی یک سخنور مسلط و یک زبان‌آموز معمولی هستند',
  },
  {
    weekNumber: 41,
    quarter: 4,
    monthNumber: 11,
    level: 'C1',
    difficulty: 'expert',
    titleFa: 'تحلیل اقتصادی، بازارهای مالی و تجارت جهانی',
    themeFa: 'تورم، نرخ بهره، سهام، سرمایه‌گذاری خطرپذیر، استارتاپ‌ها و زنجیره تأمین',
    grammarFocusFa: 'کاربرد اصطلاحات نموداری و روندها (Plummet, Skyrocket, Fluctuate, Plateau)',
    vocabularyFocusFa: ['شاخص تورم', 'تسهیلات مالی', 'سرمایه خطرپذیر', 'نوسان بازار', 'رشد چشمگیر'],
    culturalNoteFa: 'گزارش‌های وال‌استریت و فایننشال تایمز و ادبیات اقتصاددانان بین‌المللی',
  },
  {
    weekNumber: 42,
    quarter: 4,
    monthNumber: 11,
    level: 'C1',
    difficulty: 'expert',
    titleFa: 'حقوق، قراردادها، سیاست بین‌الملل و دیپلماسی',
    themeFa: 'مفاد قانونی، تعهدات قراردادی، کنوانسیون‌های بین‌المللی و معاهدات صلح',
    grammarFocusFa: 'کاربرد افعال حقوقی (Shall, Herein, Thereof, Breach of contract)',
    vocabularyFocusFa: ['مفاد قرارداد', 'تعهد قانونی', 'نقض عهد', 'داوری بین‌المللی', 'حاکمیت ملی'],
    culturalNoteFa: 'پروتکل‌های دیپلماتیک و حساسیت واژگان در بیانیه‌های سازمان ملل',
  },
  {
    weekNumber: 43,
    quarter: 4,
    monthNumber: 11,
    level: 'C1',
    difficulty: 'expert',
    titleFa: 'هنر، نقد فیلم، ادبیات و تحلیل جامعه‌شناختی',
    themeFa: 'نقد آثار سینمایی، مکاتب هنری، ساختار رمان و زیبایی‌شناسی',
    grammarFocusFa: 'صفات مرکب پیشرفته و صنایع ادبی (Allegory, Foreshadowing, Nuance)',
    vocabularyFocusFa: ['روایت تمثیلی', 'شاهکار هنری', 'جلوه‌های بصری', 'زیبایی‌شناسی', 'تفسیر متن'],
    culturalNoteFa: 'سنت نقد هنری در مجلات پاریس، لندن و نیویورک',
  },
  {
    weekNumber: 44,
    quarter: 4,
    monthNumber: 11,
    level: 'C1',
    difficulty: 'expert',
    titleFa: 'کنایه، طنز ظریف، ایهام و زیرمتن‌های زبانی (Subtext)',
    themeFa: 'فهم طنزهای فرهنگی، مطایبه، شوخی‌های کلامی و لایه‌های پنهان کلام',
    grammarFocusFa: 'لحن‌های طعنه‌آمیز، مبالغه (Hyperbole) و جملات چندپهلو (Understatement)',
    vocabularyFocusFa: ['طعنه ظریف', 'ایهام', 'زیرمتن کلام', 'طنز موقعیت', 'کنایه‌آمیز'],
    culturalNoteFa: 'تفاوت طنز بریتانیایی (Dry Wit / Sarcasm) با سایر سبک‌های کمدی جهان',
  },
  {
    weekNumber: 45,
    quarter: 4,
    monthNumber: 12,
    level: 'C1',
    difficulty: 'master',
    titleFa: 'نگارش پایان‌نامه، تز علمی و متدولوژی پژوهش',
    themeFa: 'چارچوب نگارش پروپوزال، متدولوژی، تحلیل آماری و چکیده دانشگاهی',
    grammarFocusFa: 'ساختارهای آکادمیک استاندارد انتزاعی (It is hypothesized that, Extrapolating from)',
    vocabularyFocusFa: ['فرضیه پژوهش', 'متدولوژی تجربی', 'پیشینه تحقیق', 'داده‌های آماری', 'نتیجه‌گیری'],
    culturalNoteFa: 'استانداردهای اخلاق در پژوهش (Peer-Review) و استناددهی APA/Harvard',
  },
  {
    weekNumber: 46,
    quarter: 4,
    monthNumber: 12,
    level: 'C1',
    difficulty: 'master',
    titleFa: 'آزمون جامع پایان سطح C1 (معادل آیلتس 7.5-8 / گوته C1 / CAE)',
    themeFa: 'ارزیابی صلاحیت نگارش پیشرفته دانشگاهی و درک متون تخصصی سنگین',
    grammarFocusFa: 'آزمون تسلط کامل بر دستور زبان و ظرافت‌های معنایی C1',
    vocabularyFocusFa: ['۴۰۰۰ واژه پیشرفته و تخصصی', 'مکالمه خودجوش با روانی کامل'],
    milestoneTitleFa: '💎 نشان استادی C1 (Advanced Fluency & Academic Diploma)',
    isMilestone: true,
    culturalNoteFa: 'شما به سطحی رسیدید که می‌توانید به عنوان استاد یا مدیر ارشد در کشور هدف تدریس و مدیریت کنید.',
  },
  {
    weekNumber: 47,
    quarter: 4,
    monthNumber: 12,
    level: 'C2',
    difficulty: 'master',
    titleFa: 'اصطلاحات کهن، ضرب‌المثل‌های نایاب و بازی‌های کلامی بومی',
    themeFa: 'تسلط بر ریشه‌های ادبی زبان، ضرب‌المثل‌های محلی و عبارات باستانی',
    grammarFocusFa: 'ساختارهای کهن بازمانده در زبان مدرن (Archaic Subjunctive, Fixed Idiomatic Formations)',
    vocabularyFocusFa: ['حکمت کهن', 'ضرب‌المثل تاریخی', 'ایهام نغز', 'بازی با کلمات', 'بلاغت'],
    culturalNoteFa: 'میراث ادبی کهن زبان هدف (شکسپیر، گوته، دانته، سروانتس، تولستوی)',
  },
  {
    weekNumber: 48,
    quarter: 4,
    monthNumber: 12,
    level: 'C2',
    difficulty: 'master',
    titleFa: 'فلسفه، اخلاق، متافیزیک و بحث‌های عمیق وجودی',
    themeFa: 'معنای زندگی، جبر و اختیار، اخلاق هوش مصنوعی، تئوری‌های آگاهی',
    grammarFocusFa: 'استدلال‌های منطقی قیاسی و استقرایی در زبان مقصد (Deductive & Inductive Reasoning)',
    vocabularyFocusFa: ['هستی‌شناسی', 'معرفت‌شناسی', 'اخلاق هنجاری', 'تناقض فلسفی', 'آگاهی ناب'],
    culturalNoteFa: 'مکاتب فلسفی بزرگ که جهان اندیشه غرب و شرق را دگرگون کردند',
  },
  {
    weekNumber: 49,
    quarter: 4,
    monthNumber: 12,
    level: 'C2',
    difficulty: 'master',
    titleFa: 'لهجه‌ها، گویش‌های منطقه‌ای و اسلنگ‌های نسل جوان (Slang)',
    themeFa: 'تفاوت‌های لهجه‌ای محلی، اصطلاحات خیابانی نسل Z و تغییرات زبان در شبکه‌های اجتماعی',
    grammarFocusFa: 'تغییرات گرامری در گفتار عامیانه و کاهش‌های آوایی (Phonetic Reductions & Slang Syntax)',
    vocabularyFocusFa: ['اسلنگ روز', 'لهجه محلی', 'تغییر لحن سریع', 'اصطلاح ترند', 'زبان خودمانی'],
    culturalNoteFa: 'چگونه بین محیط کاملاً رسمی و محیط صمیمی دوستانه با لهجه بومی تغییر لحن دهیم (Code-Switching)',
  },
  {
    weekNumber: 50,
    quarter: 4,
    monthNumber: 12,
    level: 'C2',
    difficulty: 'master',
    titleFa: 'مذاکرات سطح بالای بین‌المللی و دیپلماسی تجاری کلان',
    themeFa: 'مذاکرات ادغام شرکت‌ها، مدیریت بحران‌های بین‌المللی و مصالحه‌های راهبردی',
    grammarFocusFa: 'استراتژی‌های زبانی متقاعدسازی و زبان غیرتهاجمی در توافقات حساس',
    vocabularyFocusFa: ['مصالحه استراتژیک', 'اهرم مذاکره', 'حل اختلاف', 'توافق دوجانبه', 'منافع مشترک'],
    culturalNoteFa: 'روانشناسی مذاکره در اتاق‌های تصمیم‌گیری سازمان‌های بین‌المللی',
  },
  {
    weekNumber: 51,
    quarter: 4,
    monthNumber: 12,
    level: 'C2',
    difficulty: 'master',
    titleFa: 'ترجمه هم‌زمان، بداهه‌پردازی و تغییر سبک لحظه‌ای',
    themeFa: 'انتقال سریع مفاهیم بین دو زبان بدون افت معنا، ترجمه ادبی و ویرایش فوق‌حرفه‌ای',
    grammarFocusFa: 'معادل‌سازی ساختارهای نحوی پیچیده و حفظ لحن و ریتم کلام',
    vocabularyFocusFa: ['ترجمه هم‌زمان', 'بداهه‌گویی بلیغ', 'انتقال بار معنایی', 'سبک‌شناسی', 'روانی کلام'],
    culturalNoteFa: 'چالش‌های مترجمان هم‌زمان در اجلاس‌های سازمان ملل و کنفرانس‌های خبری',
  },
  {
    weekNumber: 52,
    quarter: 4,
    monthNumber: 12,
    level: 'C2',
    difficulty: 'master',
    titleFa: 'جشن فارغ‌التحصیلی ۵۲ هفته و آزمون جامع استادی C2 (Native Mastery Grand Exam)',
    themeFa: 'تاج‌گذاری سال یادگیری زبان، شبیه‌سازی آزمون استادی زبان و اهدای دیپلم افتخار',
    grammarFocusFa: 'تسلط بی‌نقص و اتوماتیک بر تمام ابعاد دستوری، واژگانی، شنیداری و گفتاری زبان',
    vocabularyFocusFa: ['تسلط ۵۰۰۰+ واژه و اصطلاح بومی', 'روانی ۱۰۰٪ مانند اهل زبان'],
    milestoneTitleFa: '👑 تاج زرین استادی زبان و گواهی تسلط بومی C2 (Native Proficiency Laureate)',
    isMilestone: true,
    culturalNoteFa: 'تبریک شگفت‌انگیز! شما یک سال کامل با ۵۲ هفته تلاش پیوسته، زبان جدید را مانند زبان مادری فرا گرفتید.',
  },
];

// ============================================================================
// LANGUAGE-SPECIFIC VOCABULARY & EXERCISE ADAPTERS (For all 10 Languages)
// ============================================================================

interface LangWeekData {
  titleNative: string;
  grammarFocusNative: string;
  keyPhrases: { target: string; phonetic?: string; fa: string }[];
  stageVocabList: { target: string; fa: string; phonetic?: string }[];
  dialoguePairs: { speaker: string; target: string; fa: string }[];
}

const LANGUAGE_WEEKLY_ADAPTERS: Record<TargetLanguageCode, Record<number, LangWeekData>> = {
  en: {
    1: {
      titleNative: 'Alphabet, Phonics & Essential Greetings',
      grammarFocusNative: 'Phonetics, Basic Sentence Order (SVO), Demonstratives',
      keyPhrases: [
        { target: 'Hello, good morning!', phonetic: 'həˈloʊ ɡʊd ˈmɔːrnɪŋ', fa: 'سلام، صبح بخیر!' },
        { target: 'Nice to meet you.', phonetic: 'naɪs tu miːt juː', fa: 'از آشنایی با شما خوشوقتم.' },
        { target: 'Thank you very much.', phonetic: 'θæŋk juː ˈveri mʌtʃ', fa: 'خیلی متشکرم.' },
      ],
      stageVocabList: [
        { target: 'Hello', fa: 'سلام' },
        { target: 'Goodbye', fa: 'خداحافظ' },
        { target: 'Please', fa: 'لطفاً' },
        { target: 'Thank you', fa: 'متشکرم' },
        { target: 'Yes', fa: 'بله' },
        { target: 'No', fa: 'خیر' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'Hello! How are you today?', fa: 'سلام! امروز حالت چطوره؟' },
        { speaker: 'B', target: 'I am doing great, thank you!', fa: 'عالی هستم، متشکرم!' },
      ],
    },
    2: {
      titleNative: 'Pronouns, To Be & Personal Introduction',
      grammarFocusNative: 'Personal Pronouns, Verb To Be (am/is/are)',
      keyPhrases: [
        { target: 'My name is Sarah.', phonetic: 'maɪ neɪm ɪz ˈsærə', fa: 'نام من سارا است.' },
        { target: 'I am a software engineer.', phonetic: 'aɪ æm ə ˈsɔːftwer ˌendʒɪˈnɪr', fa: 'من مهندس نرم‌افزار هستم.' },
        { target: 'Where are you from?', phonetic: 'wer ɑːr ju frʌm', fa: 'اهل کجا هستید؟' },
      ],
      stageVocabList: [
        { target: 'I am', fa: 'من هستم' },
        { target: 'You are', fa: 'تو هستی' },
        { target: 'He is', fa: 'او هست (مذکر)' },
        { target: 'She is', fa: 'او هست (مونث)' },
        { target: 'Student', fa: 'دانشجو' },
        { target: 'Teacher', fa: 'معلم' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'Hi, what is your name?', fa: 'سلام، اسمت چیه؟' },
        { speaker: 'B', target: 'My name is Alex. I am from Canada.', fa: 'اسمم الکس است. اهل کانادا هستم.' },
      ],
    },
    8: {
      titleNative: 'A1 Milestone: Comprehensive Mastery & Independence',
      grammarFocusNative: 'A1 Comprehensive Review: Present Simple, Questions, Daily Verbs',
      keyPhrases: [
        { target: 'I can speak English now!', phonetic: 'aɪ kæn spiːk ˈɪŋɡlɪʃ naʊ', fa: 'من اکنون می‌توانم انگلیسی صحبت کنم!' },
        { target: 'Can you help me, please?', phonetic: 'kæn ju help miː pliːz', fa: 'می‌توانید لطفاً کمکم کنید؟' },
      ],
      stageVocabList: [
        { target: 'Understand', fa: 'فهمیدن' },
        { target: 'Speak', fa: 'صحبت کردن' },
        { target: 'Practice', fa: 'تمرین کردن' },
        { target: 'Every day', fa: 'هر روز' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'Congratulations on completing Level A1!', fa: 'تبریک برای اتمام سطح A1!' },
        { speaker: 'B', target: 'Thank you! I am ready for Level A2.', fa: 'متشکرم! برای سطح A2 آماده‌ام.' },
      ],
    },
    52: {
      titleNative: 'C2 Grand Capstone: Native Fluency Laureate',
      grammarFocusNative: 'C2 Native Nuances: Spontaneous Rhetoric & Stylistic Mastery',
      keyPhrases: [
        { target: 'Language is the dress of thought.', phonetic: 'ˈlæŋɡwɪdʒ ɪz ðə dres ʌv θɔːt', fa: 'زبان جامه اندیشه است.' },
        { target: 'We have attained native fluency with flying colors.', phonetic: 'wiː hæv əˈteɪnd ˈneɪtɪv ˈfluːənsi', fa: 'ما با شایستگی کامل به تسلط بومی رسیدیم.' },
      ],
      stageVocabList: [
        { target: 'Eloquence', fa: 'فصاحت و بلاغت' },
        { target: 'Mastery', fa: 'استادی و تسلط' },
        { target: 'Nuance', fa: 'ظرافت معنایی' },
        { target: 'Proficiency', fa: 'مهارت در حد بومی' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'You articulate your thoughts with effortless precision.', fa: 'افکارت را با دقتی بی‌نقص و روان بیان می‌کنی.' },
        { speaker: 'B', target: 'A year of consistent 52-week training made all the difference.', fa: 'یک سال تمرین منظم ۵۲ هفته‌ای این تمایز را رقم زد.' },
      ],
    },
  },
  de: {
    1: {
      titleNative: 'Alphabet, Aussprache & Grundlegende Begrüßung',
      grammarFocusNative: 'Deutsche Phonetik (Umlaute ä, ö, ü, ß), Begrüßung',
      keyPhrases: [
        { target: 'Guten Tag, wie geht es Ihnen?', phonetic: 'ˈɡuːtn̩ taːk viː ɡeːt ɛs ˈiːnən', fa: 'روز بخیر، حال شما چطور است؟' },
        { target: 'Freut mich, Sie kennenzulernen.', phonetic: 'frɔɪt mɪç ziː ˈkɛnəntsuːˌlɛrnən', fa: 'از آشنایی با شما خوشحالم.' },
        { target: 'Vielen Dank für Ihre Hilfe.', phonetic: 'ˈfiːlən daŋk fyːr ˈiːrə ˈhɪlfə', fa: 'بسیار ممنون از کمکتان.' },
      ],
      stageVocabList: [
        { target: 'Hallo', fa: 'سلام' },
        { target: 'Auf Wiedersehen', fa: 'خداحافظ' },
        { target: 'Bitte', fa: 'لطفاً / خواهش می‌کنم' },
        { target: 'Danke', fa: 'متشکرم' },
        { target: 'Ja', fa: 'بله' },
        { target: 'Nein', fa: 'خیر' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'Guten Morgen! Wie geht es dir?', fa: 'صبح بخیر! حالت چطوره؟' },
        { speaker: 'B', target: 'Sehr gut, danke! Und dir?', fa: 'بسیار خوب، ممنون! و تو؟' },
      ],
    },
    2: {
      titleNative: 'Personalpronomen, Sein & Sich Vorstellen',
      grammarFocusNative: 'Verb "sein" (ich bin, du bist, er/sie/es ist)',
      keyPhrases: [
        { target: 'Ich heiße Thomas.', phonetic: 'ɪç ˈhaɪsə ˈtoːmas', fa: 'نام من توماس است.' },
        { target: 'Ich komme aus dem Iran.', phonetic: 'ɪç ˈkɔmə aʊs deːm iˈraːn', fa: 'من اهل ایران هستم.' },
      ],
      stageVocabList: [
        { target: 'Ich bin', fa: 'من هستم' },
        { target: 'Du bist', fa: 'تو هستی' },
        { target: 'Er ist', fa: 'او هست (مذکر)' },
        { target: 'Sie ist', fa: 'او هست (مونث)' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'Wer bist du?', fa: 'تو کی هستی؟' },
        { speaker: 'B', target: 'Ich bin Student in Berlin.', fa: 'من دانشجو در برلین هستم.' },
      ],
    },
  } as any,
  fr: {
    1: {
      titleNative: 'Alphabet, Phonétique & Salutations Essentielles',
      grammarFocusNative: 'Sons nasaux français, voyelles et salutations polies',
      keyPhrases: [
        { target: 'Bonjour, comment allez-vous ?', phonetic: 'bɔ̃ʒuʁ kɔmɑ̃t‿ale vu', fa: 'سلام، حال شما چطور است؟' },
        { target: 'Enchanté de faire votre connaissance.', phonetic: 'ɑ̃ʃɑ̃te də fɛʁ vɔtʁ kɔnɛsɑ̃s', fa: 'از آشنایی با شما مفتخرم.' },
        { target: 'Merci beaucoup !', phonetic: 'mɛʁsi boku', fa: 'بسیار متشکرم!' },
      ],
      stageVocabList: [
        { target: 'Bonjour', fa: 'سلام / روز بخیر' },
        { target: 'Au revoir', fa: 'خداحافظ' },
        { target: 'S’il vous plaît', fa: 'لطفاً' },
        { target: 'Merci', fa: 'متشکرم' },
        { target: 'Oui', fa: 'بله' },
        { target: 'Non', fa: 'خیر' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'Bonjour ! Comment vous vous appelez ?', fa: 'سلام! اسمتان چیست؟' },
        { speaker: 'B', target: 'Je m’appelle Sophie. Et vous ?', fa: 'اسمم سوفی است. و شما؟' },
      ],
    },
  } as any,
  es: {
    1: {
      titleNative: 'Alfabeto, Fonética y Saludos Básicos',
      grammarFocusNative: 'Fonética del español (ñ, rr, ll), saludos formales e informales',
      keyPhrases: [
        { target: '¡Hola! ¿Cómo estás?', phonetic: 'ˈola ˈkomo esˈtas', fa: 'سلام! چطوری؟' },
        { target: 'Mucho gusto en conocerte.', phonetic: 'ˈmutʃo ˈɣusto en konoˈseɾte', fa: 'از آشنایی با شما بسیار خوشبختم.' },
        { target: '¡Muchas gracias por todo!', phonetic: 'ˈmutʃaz ˈɣɾasjas poɾ ˈtoðo', fa: 'خیلی ممنون بابت همه چیز!' },
      ],
      stageVocabList: [
        { target: 'Hola', fa: 'سلام' },
        { target: 'Adiós', fa: 'خداحافظ' },
        { target: 'Por favor', fa: 'لطفاً' },
        { target: 'Gracias', fa: 'متشکرم' },
        { target: 'Sí', fa: 'بله' },
        { target: 'No', fa: 'خیر' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: '¡Buenos días! ¿Qué tal?', fa: 'صبح بخیر! چطوری؟' },
        { speaker: 'B', target: '¡Muy bien, gracias! ¿Y tú?', fa: 'بسیار عالی، ممنون! و تو؟' },
      ],
    },
  } as any,
  it: {
    1: {
      titleNative: 'Alfabeto, Fonetica & Saluti Quotidiani',
      grammarFocusNative: 'Fonetica italiana (c/ch, g/gh, gli), Saluti formali',
      keyPhrases: [
        { target: 'Ciao! Come stai?', phonetic: 'ˈtʃaːo ˈkome ˈstai', fa: 'سلام! چطوری؟' },
        { target: 'Piacere di conoscerti.', phonetic: 'pjaˈtʃeːre di koˈnoʃʃerti', fa: 'از آشنایی با شما خوشحالم.' },
        { target: 'Grazie mille!', phonetic: 'ˈɡrattsje ˈmille', fa: 'یک دنیا ممنون!' },
      ],
      stageVocabList: [
        { target: 'Ciao', fa: 'سلام / خداحافظ' },
        { target: 'Arrivederci', fa: 'به امید دیدار' },
        { target: 'Per favore', fa: 'لطفاً' },
        { target: 'Grazie', fa: 'متشکرم' },
        { target: 'Sì', fa: 'بله' },
        { target: 'No', fa: 'خیر' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'Buongiorno! Come si chiama?', fa: 'روز بخیر! نام شما چیست؟' },
        { speaker: 'B', target: 'Mi chiamo Marco. E Lei?', fa: 'نامم مارکو است. و شما؟' },
      ],
    },
  } as any,
  tr: {
    1: {
      titleNative: 'Alfabe, Sesler & Temel Selamlaşma',
      grammarFocusNative: 'Türkçe ses uyumu (kalın/ince ünlüler), selamlaşma kalıpları',
      keyPhrases: [
        { target: 'Merhaba, nasılsınız?', phonetic: 'mɛɾhaˈba nasɯɫsɯˈnɯz', fa: 'سلام، حال شما چطور است؟' },
        { target: 'Tanıştığımıza memnun oldum.', phonetic: 'tanɯʃtɯɣɯmɯˈza mɛmˈnun oɫˈdum', fa: 'از آشنایی با شما خرسندم.' },
        { target: 'Çok teşekkür ederim.', phonetic: 'tʃok tɛʃɛkˈcyɾ ɛdɛˈɾim', fa: 'خیلی تشکر می‌کنم.' },
      ],
      stageVocabList: [
        { target: 'Merhaba', fa: 'سلام' },
        { target: 'Hoşça kalın', fa: 'خداحافظ' },
        { target: 'Lütfen', fa: 'لطفاً' },
        { target: 'Teşekkürler', fa: 'متشکرم' },
        { target: 'Evet', fa: 'بله' },
        { target: 'Hayır', fa: 'خیر' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'Günaydın! Nasılsın?', fa: 'صبح بخیر! چطوری؟' },
        { speaker: 'B', target: 'İyiyim, teşekkürler! Sen nasılsın?', fa: 'خوبم، ممنون! تو چطوری؟' },
      ],
    },
  } as any,
  ar: {
    1: {
      titleNative: 'الحروف والأصوات والتحيات اليومية الأساسية',
      grammarFocusNative: 'الحركات والحروف العربية، التنوين وأساليب التحية',
      keyPhrases: [
        { target: 'السلام عليكم ورحمة الله', phonetic: 'as-salāmu ʿalaykum', fa: 'سلام و درود بر شما' },
        { target: 'تشرفت بمعرفتكم', phonetic: 'tasharraftu bi-maʿrifatikum', fa: 'از آشنایی با شما مشرف شدم.' },
        { target: 'شكراً جزيلاً لك', phonetic: 'shukran jazīlan lak', fa: 'بسیار از شما سپاسگزارم.' },
      ],
      stageVocabList: [
        { target: 'مرحباً', fa: 'سلام' },
        { target: 'مع السلامة', fa: 'خداحافظ' },
        { target: 'من فضلك', fa: 'لطفاً' },
        { target: 'شكراً', fa: 'متشکرم' },
        { target: 'نعم', fa: 'بله' },
        { target: 'لا', fa: 'خیر' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'صباح الخير! كيف حالك؟', fa: 'صبح بخیر! حالت چطوره؟' },
        { speaker: 'B', target: 'أنا بخير والحمد لله، شكراً لك!', fa: 'من خوبم، خدا رو شکر، ممنون ازت!' },
      ],
    },
  } as any,
  ja: {
    1: {
      titleNative: 'ひらがな・発音・基本のあいさつ (Hiragana & Greetings)',
      grammarFocusNative: 'ひらがな (Hiragana), 語順 (SOV), 丁寧語 (Desu/Masu)',
      keyPhrases: [
        { target: 'こんにちは、お元気ですか？', phonetic: 'Konnichiwa, ogenki desu ka?', fa: 'سلام، حالتان چطور است؟' },
        { target: 'はじめまして、よろしくお願いします。', phonetic: 'Hajimemashite, yoroshiku onegaishimasu.', fa: 'از دیدار شما خوشبختم، به من لطف داشته باشید.' },
        { target: 'どうもありがとうございます。', phonetic: 'Dōmo arigatō gozaimasu.', fa: 'بسیار از شما سپاسگزارم.' },
      ],
      stageVocabList: [
        { target: 'こんにちは (Konnichiwa)', fa: 'سلام' },
        { target: 'さようなら (Sayōnara)', fa: 'خداحافظ' },
        { target: 'お願いします (Onegaishimasu)', fa: 'لطفاً' },
        { target: 'ありがとう (Arigatō)', fa: 'متشکرم' },
        { target: 'はい (Hai)', fa: 'بله' },
        { target: 'いいえ (Iie)', fa: 'خیر' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'おはようございます！', fa: 'صبح بخیر!' },
        { speaker: 'B', target: 'おはようございます！元気です。', fa: 'صبح بخیر! سرحالم.' },
      ],
    },
  } as any,
  ru: {
    1: {
      titleNative: 'Алфавит, Фонетика и Базовые Приветствия',
      grammarFocusNative: 'Русский алфавит (Кириллица), Ударение, Приветствия',
      keyPhrases: [
        { target: 'Здравствуйте! Как ваши дела?', phonetic: 'Zdrávstvuyte! Kak váshi delá?', fa: 'سلام! احوال شما چطور است؟' },
        { target: 'Очень приятно познакомиться.', phonetic: 'Óchen priyátno poznakómit’sya.', fa: 'از آشنایی با شما بسیار خوشوقتم.' },
        { target: 'Большое спасибо за помощь.', phonetic: 'Bol’shóye spasíbo za pómoshch’.', fa: 'خیلی ممنون بابت کمک.' },
      ],
      stageVocabList: [
        { target: 'Привет', fa: 'سلام (صمیمی)' },
        { target: 'До свидания', fa: 'خداحافظ' },
        { target: 'Пожалуйста', fa: 'لطفاً / خواهش می‌کنم' },
        { target: 'Спасибо', fa: 'متشکرم' },
        { target: 'Да', fa: 'بله' },
        { target: 'Нет', fa: 'خیر' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: 'Доброе утро! Как дела?', fa: 'صبح بخیر! احوالت چطوره؟' },
        { speaker: 'B', target: 'Всё отлично, спасибо!', fa: 'همه چیز عالیه، ممنون!' },
      ],
    },
  } as any,
  zh: {
    1: {
      titleNative: '拼音・声调・基础问候 (Pinyin, Tones & Greetings)',
      grammarFocusNative: '四声 (Four Tones), 拼音 (Pinyin), 汉字结构 (Hanzi Basics)',
      keyPhrases: [
        { target: '你好！你好吗？', phonetic: 'Nǐ hǎo! Nǐ hǎo ma?', fa: 'سلام! حالت چطوره؟' },
        { target: '认识你很高兴。', phonetic: 'Rènshí nǐ hěn gāoxìng.', fa: 'از آشنایی با شما خیلی خوشحالم.' },
        { target: '非常感谢你的帮助！', phonetic: 'Fēicháng gǎnxiè nǐ de bāngzhù!', fa: 'بسیار بابت کمکتان سپاسگزارم!' },
      ],
      stageVocabList: [
        { target: '你好 (Nǐ hǎo)', fa: 'سلام' },
        { target: '再见 (Zàijiàn)', fa: 'خداحافظ' },
        { target: '请 (Qǐng)', fa: 'لطفاً' },
        { target: '谢谢 (Xièxiè)', fa: 'متشکرم' },
        { target: '是的 (Shì de)', fa: 'بله' },
        { target: '不 (Bù)', fa: 'خیر / نه' },
      ],
      dialoguePairs: [
        { speaker: 'A', target: '早上好！你怎么样？', fa: 'صبح بخیر! چطوری؟' },
        { speaker: 'B', target: '我很好，谢谢你！', fa: 'من خیلی خوبم، ممنون ازت!' },
      ],
    },
  } as any,
};

// ============================================================================
// STAGE LESSON BUILDER (Generates 20 Diverse Exercises per Stage)
// ============================================================================

function generateExercisesForStage(
  lang: TargetLanguageCode,
  weekNum: number,
  stageNum: number,
  level: CEFRLevel,
  themeFa: string,
  vocabList: { target: string; fa: string; phonetic?: string }[],
  keyPhrases: { target: string; phonetic?: string; fa: string }[],
  grammarRuleFa: string,
  culturalNoteFa?: string,
): Exercise[] {
  const exList: Exercise[] = [];
  const baseId = `${lang}_w${weekNum}_s${stageNum}`;

  // Safe fallback words and phrases
  const fallbackVocab = [
    { target: 'Hello', fa: 'سلام', phonetic: '/həˈloʊ/' },
    { target: 'Thank you', fa: 'متشکرم', phonetic: '/θæŋk juː/' },
    { target: 'Please', fa: 'لطفاً', phonetic: '/pliːz/' },
    { target: 'Good', fa: 'خوب', phonetic: '/ɡʊd/' },
    { target: 'Yes', fa: 'بله', phonetic: '/jɛs/' },
    { target: 'No', fa: 'خیر', phonetic: '/noʊ/' },
    { target: 'Friend', fa: 'دوست', phonetic: '/frɛnd/' },
    { target: 'Book', fa: 'کتاب', phonetic: '/bʊk/' },
  ];

  const fullVocab = vocabList.length >= 4 ? vocabList : [...vocabList, ...fallbackVocab];
  const primaryPhrase = keyPhrases[0] || {
    target: fullVocab[0].target,
    fa: fullVocab[0].fa,
    phonetic: fullVocab[0].phonetic,
  };
  const secondaryPhrase = keyPhrases[1] || {
    target: fullVocab[1] ? fullVocab[1].target : 'Good morning',
    fa: fullVocab[1] ? fullVocab[1].fa : 'صبح بخیر',
  };

  const v0 = fullVocab[0] || fallbackVocab[0];
  const v1 = fullVocab[1] || fallbackVocab[1];
  const v2 = fullVocab[2] || fallbackVocab[2];
  const v3 = fullVocab[3] || fallbackVocab[3];
  const v4 = fullVocab[4] || fallbackVocab[4];
  const v5 = fullVocab[5] || fallbackVocab[5];
  const v6 = fullVocab[6] || fallbackVocab[6];
  const v7 = fullVocab[7] || fallbackVocab[7];

  // Helper for multiple-choice options with shuffler
  const makeOptions = (correct: string, distractor1: string, distractor2: string, distractor3: string) => {
    return [correct, distractor1, distractor2, distractor3].filter(
      (val, idx, self) => self.indexOf(val) === idx,
    ).sort(() => 0.5 - Math.random());
  };

  // 1. MATCH PAIRS (جفت کردن لغات ۱ تا ۴)
  exList.push({
    id: `${baseId}_ex1_match1`,
    type: 'match_pairs',
    direction: 'target_to_fa',
    instructionFa: `تطبیق واژگان بخش ${stageNum}: کلمات زیر را با معنی فارسی جفت کنید`,
    promptText: `تطبیق واژگان کلیدی: ${themeFa}`,
    matchingPairs: [
      { id: 'p1', target: v0.target, nativeFa: v0.fa, targetAudio: v0.target, persianAudio: v0.fa },
      { id: 'p2', target: v1.target, nativeFa: v1.fa, targetAudio: v1.target, persianAudio: v1.fa },
      { id: 'p3', target: v2.target, nativeFa: v2.fa, targetAudio: v2.target, persianAudio: v2.fa },
      { id: 'p4', target: v3.target, nativeFa: v3.fa, targetAudio: v3.target, persianAudio: v3.fa },
    ],
    correctAnswer: 'matched_all',
    explanationFa: `این ۴ لغت از مهم‌ترین کلمات این درس هستند و در مکالمات روزمره کاربرد فراوان دارند.`,
    grammarNoteFa: `نکته: به تلفظ و نحوه کاربرد هر واژه در متن درس دقت نمایید.`,
    difficulty: 'easy',
  });

  // 2. MATCH PAIRS (جفت کردن واژگان ۵ تا ۸)
  exList.push({
    id: `${baseId}_ex2_match2`,
    type: 'match_pairs',
    direction: 'target_to_fa',
    instructionFa: `تطبیق مرحله دوم: واژگان تکمیلی را با معادل فارسی جفت نمایید`,
    promptText: `تطبیق کلمات تکمیلی هفته ${weekNum}`,
    matchingPairs: [
      { id: 'p5', target: v4.target, nativeFa: v4.fa, targetAudio: v4.target, persianAudio: v4.fa },
      { id: 'p6', target: v5.target, nativeFa: v5.fa, targetAudio: v5.target, persianAudio: v5.fa },
      { id: 'p7', target: v6.target, nativeFa: v6.fa, targetAudio: v6.target, persianAudio: v6.fa },
      { id: 'p8', target: v7.target, nativeFa: v7.fa, targetAudio: v7.target, persianAudio: v7.fa },
    ],
    correctAnswer: 'matched_all',
    explanationFa: `تسلط بر این واژگان دامنه لغات فعال شما را به طور چشمگیری افزایش می‌دهد.`,
    difficulty: 'easy',
  });

  // 3. TRANSLATE TO TARGET (ترجمه لغت/عبارت پایه به زبان مقصد)
  exList.push({
    id: `${baseId}_ex3_tr_target`,
    type: 'translate_to_target',
    direction: 'fa_to_target',
    instructionFa: `معادل صحیح عبارت فارسی زیر را به زبان ${lang.toUpperCase()} انتخاب یا تایپ کنید:`,
    promptText: v0.fa,
    options: makeOptions(v0.target, v1.target, v2.target, v3.target),
    correctAnswer: v0.target,
    wordTiles: v0.target.split(' '),
    targetAudioText: v0.target,
    persianAudioText: v0.fa,
    explanationFa: `معادل مستقیم «${v0.fa}» برابر است با «${v0.target}».`,
    phonetic: v0.phonetic,
    grammarNoteFa: `در این سطح (${level}) به تفاوت‌های آوایی و استرس واژه توجه کنید.`,
    difficulty: 'easy',
  });

  // 4. TRANSLATE TO NATIVE (ترجمه جمله کلیدی به فارسی روان)
  exList.push({
    id: `${baseId}_ex4_tr_native`,
    type: 'translate_to_native',
    direction: 'target_to_fa',
    instructionFa: `ترجمه دقیق و روان عبارت زیر به زبان فارسی کدام است؟`,
    promptText: primaryPhrase.target,
    targetAudioText: primaryPhrase.target,
    phonetic: primaryPhrase.phonetic,
    options: makeOptions(
      primaryPhrase.fa,
      `ترجمه تحت‌اللفظی نادرست ۱`,
      `معنی متضاد یا غیرمرتبط`,
      `جمله سوالی بدون ارتباط با موضوع`,
    ),
    correctAnswer: primaryPhrase.fa,
    persianAudioText: primaryPhrase.fa,
    explanationFa: `ترجمه طبیعی و سلیس «${primaryPhrase.target}» در فارسی «${primaryPhrase.fa}» است.`,
    difficulty: 'easy',
  });

  // 5. FILL IN THE BLANK (پر کردن جای خالی ۱ با گزینه‌ها یا تایپ)
  const blank1Target = primaryPhrase.target.includes(v0.target)
    ? primaryPhrase.target.replace(v0.target, '_____')
    : `${primaryPhrase.target.split(' ')[0]} _____ ${primaryPhrase.target.split(' ').slice(2).join(' ')}`;
  exList.push({
    id: `${baseId}_ex5_blank1`,
    type: 'fill_in_blank',
    direction: 'target_to_fa',
    instructionFa: `جای خالی را با کلمه مناسب کامل کنید (امکان تایپ مستقیم یا انتخاب از گزینه‌ها):`,
    promptText: blank1Target,
    options: makeOptions(v0.target, v1.target, v2.target, v3.target),
    correctAnswer: v0.target,
    targetAudioText: primaryPhrase.target,
    explanationFa: `کلمه «${v0.target}» به معنی «${v0.fa}» بخش صحیح این ساختار است.`,
    grammarNoteFa: `این جمله بیانگر: ${grammarRuleFa}`,
    difficulty: 'medium',
  });

  // 6. FILL IN THE BLANK (پر کردن جای خالی ۲)
  const blank2Target = secondaryPhrase.target.includes(v1.target)
    ? secondaryPhrase.target.replace(v1.target, '_____')
    : `${secondaryPhrase.target} (_____)`;
  exList.push({
    id: `${baseId}_ex6_blank2`,
    type: 'fill_in_blank',
    direction: 'target_to_fa',
    instructionFa: `کلمه مناسب برای تکمیل این مفهوم را انتخاب یا تایپ کنید:`,
    promptText: blank2Target,
    options: makeOptions(v1.target, v0.target, v4.target, v5.target),
    correctAnswer: v1.target,
    targetAudioText: secondaryPhrase.target,
    explanationFa: `کلمه صحیح برای جای خالی «${v1.target}» (${v1.fa}) است.`,
    difficulty: 'medium',
  });

  // 7. WORD JUMBLE (مرتب‌سازی جمله مثبت با کاشی‌ها یا کیبورد)
  exList.push({
    id: `${baseId}_ex7_jumble1`,
    type: 'word_jumble',
    instructionFa: `کلمات زیر را به ترتیب صحیح گرامری بچینید یا تایپ کنید تا جمله کامل شود:`,
    promptText: `ترجمه کنید: «${primaryPhrase.fa}»`,
    correctAnswer: primaryPhrase.target,
    wordTiles: primaryPhrase.target.split(' ').sort(() => 0.5 - Math.random()),
    targetAudioText: primaryPhrase.target,
    phonetic: primaryPhrase.phonetic,
    explanationFa: `چیدمان صحیح ارکان جمله: "${primaryPhrase.target}" مطابق قواعد دستوری زبان مقصد است.`,
    grammarNoteFa: `قاعده ساختار: ${grammarRuleFa}`,
    difficulty: 'medium',
  });

  // 8. WORD JUMBLE (مرتب‌سازی جمله دوم / مکالمه)
  exList.push({
    id: `${baseId}_ex8_jumble2`,
    type: 'word_jumble',
    instructionFa: `چیدمان کلمات: جمله زیر را مرتب نمایید:`,
    promptText: `ترجمه کنید: «${secondaryPhrase.fa}»`,
    correctAnswer: secondaryPhrase.target,
    wordTiles: secondaryPhrase.target.split(' ').sort(() => 0.5 - Math.random()),
    targetAudioText: secondaryPhrase.target,
    phonetic: secondaryPhrase.phonetic,
    explanationFa: `ساختار درست: "${secondaryPhrase.target}" است.`,
    difficulty: 'medium',
  });

  // 9. LISTENING MCQ (تشخیص مفهوم صوتی ۱)
  exList.push({
    id: `${baseId}_ex9_listen1`,
    type: 'listening_mcq',
    instructionFa: `به صوت با دقت گوش دهید و معنای دقیق آن را مشخص کنید:`,
    promptText: `شنیداری: به فایل صوتی گوش دهید و مفهوم را بیابید`,
    targetAudioText: primaryPhrase.target,
    options: makeOptions(
      primaryPhrase.fa,
      `درخواست آدرس در فرودگاه`,
      `خرید میوه در بازار محلی`,
      `اعلام ساعت حرکت قطار`,
    ),
    correctAnswer: primaryPhrase.fa,
    persianAudioText: primaryPhrase.fa,
    explanationFa: `عبارت صوتی پخش شده دقیقاً معادل «${primaryPhrase.fa}» است.`,
    difficulty: 'medium',
  });

  // 10. LISTENING MCQ (تشخیص پاسخ مکالمه‌ای به صوت ۲)
  exList.push({
    id: `${baseId}_ex10_listen2`,
    type: 'listening_mcq',
    instructionFa: `به سوال صوتی گوش دهید: بهترین پاسخ مؤدبانه به این جمله کدام است؟`,
    promptText: `شنیداری و تحلیل مکالمه: پاسخ متناسب را برگزینید`,
    targetAudioText: secondaryPhrase.target,
    options: makeOptions(
      v0.target,
      `No, I am completely against it`,
      `Where is the train station?`,
      `It is raining outside`,
    ),
    correctAnswer: v0.target,
    explanationFa: `در این موقعیت مکالمه‌ای، پاسخ مناسب و طبیعی «${v0.target}» می‌باشد.`,
    difficulty: 'medium',
  });

  // 11. LISTENING DICTATION (دیکته شنیداری با کلمات یا تایپ مستقیم)
  exList.push({
    id: `${baseId}_ex11_dictation`,
    type: 'listening_dictation',
    instructionFa: `دیکته شنیداری: صوت را گوش دهید و کلمات را کلمه به کلمه بچینید یا تایپ کنید:`,
    promptText: `دیکته شنیداری (با دور تند یا آرام گوش دهید)`,
    targetAudioText: primaryPhrase.target,
    correctAnswer: primaryPhrase.target,
    wordTiles: primaryPhrase.target.split(' ').sort(() => 0.5 - Math.random()),
    phonetic: primaryPhrase.phonetic,
    explanationFa: `نگارش دقیق عبارت شنیده شده: "${primaryPhrase.target}" است.`,
    difficulty: 'hard',
  });

  // 12. SPEAKING PRONUNCIATION (تلفظ عبارت کلیدی شماره ۱)
  exList.push({
    id: `${baseId}_ex12_speaking1`,
    type: 'speaking_pronunciation',
    instructionFa: `تمرین گفتاری: دکمه میکروفون را بزنید و جمله زیر را با صدای رسا بخوانید:`,
    promptText: primaryPhrase.target,
    targetAudioText: primaryPhrase.target,
    correctAnswer: primaryPhrase.target,
    phonetic: primaryPhrase.phonetic,
    explanationFa: `هوش مصنوعی لحن، وضوح و تلفظ صحیح حروف شما را ارزیابی می‌کند. معادل: ${primaryPhrase.fa}`,
    grammarNoteFa: `توصیه: به استرس هجاها و وصل کردن کلمات (Connected Speech) توجه فرمایید.`,
    difficulty: 'medium',
  });

  // 13. SPEAKING PRONUNCIATION (تلفظ عبارت کلیدی شماره ۲)
  exList.push({
    id: `${baseId}_ex13_speaking2`,
    type: 'speaking_pronunciation',
    instructionFa: `تلفظ پیشرفته: این عبارت را با لهجه طبیعی ادا کنید:`,
    promptText: secondaryPhrase.target,
    targetAudioText: secondaryPhrase.target,
    correctAnswer: secondaryPhrase.target,
    phonetic: secondaryPhrase.phonetic,
    explanationFa: `تلفظ روان این جمله شما را به زبان مادری اهل این زبان نزدیک‌تر می‌کند.`,
    difficulty: 'hard',
  });

  // 14. SPOT THE MISTAKE (یافتن اشتباه گرامری / ساختاری)
  exList.push({
    id: `${baseId}_ex14_mistake`,
    type: 'spot_the_mistake',
    instructionFa: `کدام گزینه وضعیت ساختار و گرامر این جمله را به درستی بیان می‌کند؟`,
    promptText: `${primaryPhrase.target} (بررسی گرامر و ساختار)`,
    options: [
      'ساختار کاملاً صحیح و استاندارد است',
      'ترتیب فاعل و فعل معکوس است',
      'زمان فعل با فاعل تطابق ندارد',
      'حرف اضافه یا آرتیکل اشتباه به کار رفته است',
    ],
    correctAnswer: 'ساختار کاملاً صحیح و استاندارد است',
    explanationFa: `این جمله نمونه استاندارد رعایت گرامر «${grammarRuleFa}» در سطح ${level} است.`,
    difficulty: 'hard',
  });

  // 15. GRAMMAR EXPLANATION QUIZ (کوییز مفهومی گرامر)
  exList.push({
    id: `${baseId}_ex15_grammar_quiz`,
    type: 'grammar_explanation_quiz',
    instructionFa: `کوییز گرامری: نکته دستوری این هفته چیست؟`,
    promptText: `قاعده کلیدی درس: ${grammarRuleFa}`,
    options: [
      `رعایت اصول «${grammarRuleFa}» در زمان حال و کاربرد روزمره`,
      `قاعده گذشته نامنظم در متون کهن`,
      `صرف افعال استثنایی در سبک غیررسمی`,
      `حذف فاعل در جملات مرکب`,
    ],
    correctAnswer: `رعایت اصول «${grammarRuleFa}» در زمان حال و کاربرد روزمره`,
    explanationFa: `تمرکز این هفته بر تسلط کامل روی «${grammarRuleFa}» و ساخت جملات بی‌نقص است.`,
    difficulty: 'medium',
  });

  // 16. ROLEPLAY CHAT (مکالمه و دیالوگ موقعیتی)
  exList.push({
    id: `${baseId}_ex16_roleplay`,
    type: 'roleplay_chat',
    instructionFa: `شبیه‌سازی مکالمه: در این گفتگو، پاسخ طبیعی و محترمانه کدام است؟`,
    promptText: `هم‌صحبت: «${primaryPhrase.target}»`,
    options: makeOptions(
      secondaryPhrase.target,
      `No, thank you, I have no money`,
      `Please leave immediately`,
      `I do not know any words`,
    ),
    correctAnswer: secondaryPhrase.target,
    targetAudioText: primaryPhrase.target,
    explanationFa: `در مکالمه واقعی، در پاسخ به این عبارت، گفتن «${secondaryPhrase.target}» (${secondaryPhrase.fa}) کاملاً متناسب است.`,
    difficulty: 'medium',
  });

  // 17. TRANSLATE TO TARGET (جمله کاربردی با تایپ یا کاشی)
  exList.push({
    id: `${baseId}_ex17_sentence_tr`,
    type: 'translate_to_target',
    direction: 'fa_to_target',
    instructionFa: `جمله کاربردی: معادل عبارت زیر را بنویسید یا بسازید:`,
    promptText: secondaryPhrase.fa,
    options: makeOptions(secondaryPhrase.target, primaryPhrase.target, v4.target, v5.target),
    correctAnswer: secondaryPhrase.target,
    wordTiles: secondaryPhrase.target.split(' ').sort(() => 0.5 - Math.random()),
    targetAudioText: secondaryPhrase.target,
    persianAudioText: secondaryPhrase.fa,
    explanationFa: `ترجمه مستقیم و سلیس: "${secondaryPhrase.target}" است.`,
    difficulty: 'hard',
  });

  // 18. FILL IN THE BLANK (چالش تکمیلی با حروف اضافه یا واژگان کلیدی)
  exList.push({
    id: `${baseId}_ex18_blank3`,
    type: 'fill_in_blank',
    direction: 'target_to_fa',
    instructionFa: `چالش پایانی جای خالی: گزینه مناسب برای تکمیل مفهوم را بیابید:`,
    promptText: `${v2.target} is very _____ in this lesson`,
    options: makeOptions(v3.target, v0.target, v6.target, v7.target),
    correctAnswer: v3.target,
    explanationFa: `کلمه «${v3.target}» بهترین پیوند معنایی را ایجاد می‌کند.`,
    difficulty: 'hard',
  });

  // 19. TRANSLATE TO NATIVE (ترجمه اصطلاح و ضرب‌المثل فرهنگی)
  exList.push({
    id: `${baseId}_ex19_cultural_tr`,
    type: 'translate_to_native',
    direction: 'target_to_fa',
    instructionFa: `مفهوم و اصطلاح کاربردی: این عبارت در فارسی به چه معناست؟`,
    promptText: v2.target,
    targetAudioText: v2.target,
    phonetic: v2.phonetic,
    options: makeOptions(v2.fa, `معنای نامرتبط دیگر`, `اشتباه در ترجمه`, `مفهوم معکوس`),
    correctAnswer: v2.fa,
    persianAudioText: v2.fa,
    explanationFa: `معادل روان «${v2.target}» در زبان فارسی برابر با «${v2.fa}» است.`,
    difficulty: 'easy',
  });

  // 20. FREE WRITING (نگارش آزاد با تصحیح هوش مصنوعی)
  exList.push({
    id: `${baseId}_ex20_writing`,
    type: 'free_writing',
    instructionFa: `نگارش آزاد (با تصحیح هوش مصنوعی): یک جمله کامل مرتبط با موضوع «${themeFa}» بنویسید:`,
    promptText: `نگارش به زبان مقصد: درباره «${themeFa}» حداقل یک جمله بنویسید. هوش مصنوعی نگارش، املا و گرامر شما را به دقت بررسی خواهد کرد.`,
    correctAnswer: primaryPhrase.target,
    explanationFa: `شما می‌توانید جملاتی مانند "${primaryPhrase.target}" یا "${secondaryPhrase.target}" یا هر جمله خلاقانه دیگری بنویسید.`,
    grammarNoteFa: `نکته گرامری: ${grammarRuleFa}`,
    difficulty: 'hard',
  });

  return exList;
}


// ============================================================================
// COMPLETE 52-WEEK CURRICULUM GENERATOR FOR ANY TARGET LANGUAGE
// ============================================================================

export function get52WeeksCurriculumForLanguage(lang: TargetLanguageCode): CurriculumWeek[] {
  const langAdapter = LANGUAGE_WEEKLY_ADAPTERS[lang] || LANGUAGE_WEEKLY_ADAPTERS.en;

  return WEEK_BLUEPRINTS.map((bp) => {
    const weekNum = bp.weekNumber;
    const langData = langAdapter[weekNum] || {
      titleNative: `Week ${weekNum}: ${bp.titleFa}`,
      grammarFocusNative: bp.grammarFocusFa,
      keyPhrases: [
        { target: `Key Phrase Week ${weekNum}`, fa: bp.titleFa },
        { target: `Practice Sentence ${weekNum}`, fa: `تمرین جمله هفته ${weekNum}` },
      ],
      stageVocabList: bp.vocabularyFocusFa.map((faWord, idx) => ({
        target: `Word_${weekNum}_${idx + 1}`,
        fa: faWord,
      })),
      dialoguePairs: [
        { speaker: 'A', target: `Hello Week ${weekNum}`, fa: `سلام هفته ${weekNum}` },
        { speaker: 'B', target: `Great Progress`, fa: `پیشرفت عالی` },
      ],
    };

    // 5 Modular Stages per Week (Days 1 to 5)
    const stageTemplates: {
      stageNum: number;
      titleFa: string;
      titleNative: string;
      type: WeekStageLesson['stageType'];
      duration: number;
      xp: number;
      gems: number;
    }[] = [
      {
        stageNum: 1,
        titleFa: 'روز ۱: واژگان و مفاهیم بنیادین',
        titleNative: 'Day 1: Core Vocabulary & Concepts',
        type: 'vocab_concept',
        duration: 10,
        xp: 25,
        gems: 5,
      },
      {
        stageNum: 2,
        titleFa: 'روز ۲: تسلط بر قواعد و گرامر کاربردی',
        titleNative: 'Day 2: Grammar & Sentence Structure',
        type: 'grammar_mastery',
        duration: 12,
        xp: 30,
        gems: 6,
      },
      {
        stageNum: 3,
        titleFa: 'روز ۳: شنیداری و تلفظ گفتاری',
        titleNative: 'Day 3: Listening & Pronunciation',
        type: 'listening_speaking',
        duration: 10,
        xp: 30,
        gems: 6,
      },
      {
        stageNum: 4,
        titleFa: 'روز ۴: درک مطلب و دیالوگ تعاملی',
        titleNative: 'Day 4: Reading & Interactive Dialogue',
        type: 'reading_dialogue',
        duration: 15,
        xp: 35,
        gems: 8,
      },
      {
        stageNum: 5,
        titleFa: 'روز ۵: چالش و آزمون هفتگی تسلط',
        titleNative: 'Day 5: Weekly Mastery Challenge Exam',
        type: 'weekly_exam',
        duration: 15,
        xp: 50,
        gems: 10,
      },
    ];

    const primaryKeyPhrase = langData.keyPhrases[0] || {
      target: `Week ${weekNum} sentence`,
      fa: bp.titleFa,
    };

    const stages: WeekStageLesson[] = stageTemplates.map((st) => {
      const stageExercises = generateExercisesForStage(
        lang,
        weekNum,
        st.stageNum,
        bp.level,
        bp.themeFa,
        langData.stageVocabList,
        langData.keyPhrases || [primaryKeyPhrase],
        bp.grammarFocusFa,
        bp.culturalNoteFa,
      );

      return {
        id: `${lang}_w${weekNum}_stage${st.stageNum}`,
        stageNumber: st.stageNum,
        titleFa: st.titleFa,
        titleNative: st.titleNative,
        descriptionFa: `بخش ${st.stageNum} از ۵ در هفته ${weekNum} (${bp.titleFa})`,
        stageType: st.type,
        difficulty: bp.difficulty,
        durationMinutes: st.duration,
        xpReward: st.xp,
        gemReward: st.gems,
        exercises: stageExercises,
      };
    });

    const totalXp = stages.reduce((acc, s) => acc + s.xpReward, 0);
    const totalGems = stages.reduce((acc, s) => acc + s.gemReward, 0);

    return {
      weekNumber: weekNum,
      quarter: bp.quarter,
      monthNumber: bp.monthNumber,
      level: bp.level,
      difficulty: bp.difficulty,
      titleFa: bp.titleFa,
      titleNative: langData.titleNative || bp.titleFa,
      themeFa: bp.themeFa,
      grammarFocusFa: bp.grammarFocusFa,
      grammarFocusNative: langData.grammarFocusNative || bp.grammarFocusFa,
      vocabularyFocusFa: bp.vocabularyFocusFa,
      keyPhrases: langData.keyPhrases || [],
      milestoneTitleFa: bp.milestoneTitleFa,
      isMilestone: bp.isMilestone,
      stages: stages,
      culturalNoteFa: bp.culturalNoteFa,
      aiConversationTopic: bp.aiConversationTopic,
      xpTotal: totalXp,
      gemTotal: totalGems,
    };
  });
}
