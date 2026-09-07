import { CEFRLevel, DailyWordTip, TargetLanguageCode, SRSCard } from '../types';

const DAILY_WORD_STORAGE_PREFIX = 'lingua_daily_word_';

// Comprehensive offline fallback word bank by language and CEFR level
const OFFLINE_WORD_BANK: Record<string, Record<string, DailyWordTip[]>> = {
  en: {
    A1: [
      {
        word: 'Grateful',
        phonetic: '/ˈɡreɪt.fəl/',
        partOfSpeech: 'adjective (صفت)',
        translationFa: 'سپاسگزار، قدردان',
        level: 'A1',
        exampleSentence: 'I am deeply grateful for your continuous encouragement.',
        exampleTranslationFa: 'من برای تشویق‌های مداوم شما عمیقاً سپاسگزارم.',
        pedagogicalTipFa: 'صفت grateful با حرف اضافه "for" برای ابراز تشکر از کارها و "to" برای افراد استفاده می‌شود.',
        synonyms: ['thankful', 'appreciative', 'obliged'],
        memoryTrickFa: 'املای آن با G-R-A-T شروع می‌شود (هم‌ریشه با gratitude).',
        targetLanguage: 'en',
        dateKey: new Date().toISOString().split('T')[0],
      },
      {
        word: 'Courage',
        phonetic: '/ˈkʌr.ɪdʒ/',
        partOfSpeech: 'noun (اسم)',
        translationFa: 'شجاعت، دلیری',
        level: 'A1',
        exampleSentence: 'Speaking a foreign language in public takes immense courage.',
        exampleTranslationFa: 'صحبت کردن به یک زبان خارجی در جمع نیازمند شجاعت فراوان است.',
        pedagogicalTipFa: 'اسم غیرقابل شمارش است. اصطلاح کاربردی: have the courage to try.',
        synonyms: ['bravery', 'valor', 'boldness'],
        memoryTrickFa: 'هم‌ریشه با Encourage (تشویق کردن) به معنی تزریق شجاعت.',
        targetLanguage: 'en',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
    A2: [
      {
        word: 'Accomplish',
        phonetic: '/əˈkʌm.plɪʃ/',
        partOfSpeech: 'verb (فعل)',
        translationFa: 'به انجام رساندن، محقق ساختن',
        level: 'A2',
        exampleSentence: 'You will accomplish your target fluency through daily micro-habits.',
        exampleTranslationFa: 'شما با عادت‌های کوچک روزانه، تسلط زبانی مد نظرتان را محقق خواهید کرد.',
        pedagogicalTipFa: 'برای دستیابی به اهداف تحصیلی و شغلی به کار می‌رود.',
        synonyms: ['achieve', 'fulfill', 'attain'],
        memoryTrickFa: 'هم‌خانواده با complete (کامل کردن هدف).',
        targetLanguage: 'en',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
    B1: [
      {
        word: 'Resilient',
        phonetic: '/rɪˈzɪl.jənt/',
        partOfSpeech: 'adjective (صفت)',
        translationFa: 'تاب‌آور، منعطف و سرسخت در مواجهه با چالش‌ها',
        level: 'B1',
        exampleSentence: 'The most fluent learners are resilient; they embrace errors as learning steps.',
        exampleTranslationFa: 'مسلط‌ترین زبان‌آموزان تاب‌آور هستند؛ آنها اشتباهات را گام‌های یادگیری می‌دانند.',
        pedagogicalTipFa: 'این واژه در مصاحبه‌های کاری و آزمون‌های بین‌المللی یک برگ برنده توصیفی است.',
        synonyms: ['adaptable', 'tough', 'buoyant'],
        memoryTrickFa: 'ریشه لاتین resilire یعنی جهیدن به جلو پس از هر افتادن.',
        targetLanguage: 'en',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
    B2: [
      {
        word: 'Persevere',
        phonetic: '/ˌpɜː.səˈvɪər/',
        partOfSpeech: 'verb (فعل)',
        translationFa: 'پایداری نشان دادن، استقامت ورزیدن در مسیر هدف',
        level: 'B2',
        exampleSentence: 'If you persevere in listening to native podcasts, understanding becomes natural.',
        exampleTranslationFa: 'اگر در گوش دادن به پادکست‌های بومی پایداری نشان دهید، درک مطلب طبیعی و آسان می‌شود.',
        pedagogicalTipFa: 'معمولاً با حرف اضافه "in" یا "with" جفت می‌شود و در آیلتس/تافل امتیاز بالایی دارد.',
        synonyms: ['persist', 'endure', 'tenaciously continue'],
        memoryTrickFa: 'Per (در طول مسیر) + Severe (سختی‌ها) = کسی که در طول سختی‌ها ثابت‌قدم می‌ماند.',
        targetLanguage: 'en',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
    C1: [
      {
        word: 'Articulate',
        phonetic: '/ɑːˈtɪk.jə.lət/',
        partOfSpeech: 'adjective & verb (صفت و فعل)',
        translationFa: 'فصیح، شیوا و رسا در بیان نظرات',
        level: 'C1',
        exampleSentence: 'She is an articulate speaker capable of delivering intricate ideas effortlessly.',
        exampleTranslationFa: 'او سخنوری فصیح است که ایده‌های پیچیده را به آسانی و رسا بیان می‌کند.',
        pedagogicalTipFa: 'تلفظ صفت /lət/ و تلفظ فعل /leɪt/ است. کلمه‌ای برجسته در ریدینگ و رایتینگ آکادمیک.',
        synonyms: ['eloquent', 'lucid', 'expressive', 'coherent'],
        memoryTrickFa: 'هم‌ریشه با Article (بند و مفصل): واژگانی که مثل مفاصل دقیق به هم متصل‌اند.',
        targetLanguage: 'en',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
    C2: [
      {
        word: 'Ubiquitous',
        phonetic: '/juːˈbɪk.wɪ.təs/',
        partOfSpeech: 'adjective (صفت)',
        translationFa: 'فراگیر، همه‌جا حاضر و به چشم خورنده',
        level: 'C2',
        exampleSentence: 'Digital learning tools have become ubiquitous across modern universities.',
        exampleTranslationFa: 'ابزارهای یادگیری دیجیتال در سراسر دانشگاه‌های مدرن فراگیر و همه‌جا حاضر شده‌اند.',
        pedagogicalTipFa: 'واژه‌ای فاخر و ادبی برای مقالات علمی و انشاهای نمره ۹ آیلتس.',
        synonyms: ['omnipresent', 'pervasive', 'universal'],
        memoryTrickFa: 'از واژه لاتین Ubique به معنای "در هر گوشه و کنار".',
        targetLanguage: 'en',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
  },
  de: {
    A1: [
      {
        word: 'Gemütlich',
        phonetic: '/ɡəˈmyːtlɪç/',
        partOfSpeech: 'adjective (صفت)',
        translationFa: 'دنج، گرم و دلنشین، صمیمی',
        level: 'A1',
        exampleSentence: 'Dieses kleine Café in Hamburg ist besonders gemütlich.',
        exampleTranslationFa: 'این کافه کوچک در هامبورگ فوق‌العاده دنج و دلنشین است.',
        pedagogicalTipFa: 'یکی از کلیدی‌ترین مفاهیم فرهنگی آلمان برای توصیف محیط‌های آرام و دوستانه.',
        synonyms: ['behaglich', 'komfortabel', 'einladend'],
        memoryTrickFa: 'از ریشه Gemüt به معنای خاطر و دل آرام.',
        targetLanguage: 'de',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
    B1: [
      {
        word: 'Zuverlässig',
        phonetic: '/ˈtsuːfɛɐ̯ˌlɛsɪç/',
        partOfSpeech: 'adjective (صفت)',
        translationFa: 'قابل اعتماد، دقیق و وقت‌شناس',
        level: 'B1',
        exampleSentence: 'Pünktlichkeit und zuverlässige Arbeit sind in Deutschland sehr geschätzt.',
        exampleTranslationFa: 'وقت‌شناسی و کار قابل اعتماد در آلمان بسیار مورد احترام و تقدیر است.',
        pedagogicalTipFa: 'از ترکیب فعل sich verlassen auf (تکیه کردن) به وجود آمده است.',
        synonyms: ['verlässlich', 'vertrauenswürdig'],
        memoryTrickFa: 'Zu + Verlassen = فردی که همیشه می‌توان به او تکیه کرد.',
        targetLanguage: 'de',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
    B2: [
      {
        word: 'Herausforderung',
        phonetic: '/hɛˈʁaʊ̯sˌfɔʁdəʁʊŋ/',
        partOfSpeech: 'noun (die - اسم مؤنث)',
        translationFa: 'چالش، فرصت هماوردطلبی و رشد',
        level: 'B2',
        exampleSentence: 'Die Prüfungen zu bestehen ist eine anspruchsvolle Herausforderung.',
        exampleTranslationFa: 'قبولی در آزمون‌ها یک چالش جذاب و نیازمند تلاش است.',
        pedagogicalTipFa: 'همیشه اسم مؤنث است (die) و با فعل eine Herausforderung annehmen جفت می‌شود.',
        synonyms: ['Challenge', 'anspruchsvolle Aufgabe'],
        memoryTrickFa: 'Heraus (به بیرون) + fordern (طلبیدن).',
        targetLanguage: 'de',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
  },
  fr: {
    A1: [
      {
        word: 'Bienvenue',
        phonetic: '/bjɛ̃v.ny/',
        partOfSpeech: 'noun & exclamation (اسم و عبارت خوش‌آمد)',
        translationFa: 'خوش آمدید، خیرمقدم',
        level: 'A1',
        exampleSentence: 'Bienvenue à notre communauté d\'apprentissage des langues!',
        exampleTranslationFa: 'به جامعه یادگیری زبان ما خوش آمدید!',
        pedagogicalTipFa: 'ترکیب Bien (خوب) و Venue (آمده). در فرانسه هنگام ورود به مکانی بیان می‌شود.',
        synonyms: ['bon accueil'],
        memoryTrickFa: 'Bien (خوب) + Venu (آمده) = به سلامتی و خوبی آمدید.',
        targetLanguage: 'fr',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
    B2: [
      {
        word: 'Épanouissement',
        phonetic: '/e.pa.nwi.smɑ̃/',
        partOfSpeech: 'noun (le - اسم مذکر)',
        translationFa: 'شکوفایی، به اوج کمال و آرامش درونی رسیدن',
        level: 'B2',
        exampleSentence: 'La maîtrise d\'une langue favorise l\'épanouissement intellectuel et personnel.',
        exampleTranslationFa: 'تسلط بر یک زبان به شکوفایی فکری و فردی انسان کمک شایانی می‌کند.',
        pedagogicalTipFa: 'واژه‌ای بسیار زیبا در متون ادبی، فلسفی و آزمون‌های DELF B2/DALF C1.',
        synonyms: ['fleurissement', 'accomplissement', 'réalisation de soi'],
        memoryTrickFa: 'مانند گل که باز می‌شود و به اوج زیبایی می‌رسد.',
        targetLanguage: 'fr',
        dateKey: new Date().toISOString().split('T')[0],
      },
    ],
  },
};

export const dailyWordService = {
  // Get Daily Word Tip with offline caching & AI endpoint integration
  async getDailyWordTip(
    targetLanguage: TargetLanguageCode,
    userLevel: CEFRLevel,
    explanationLanguage: string = 'fa',
    userId: string = 'default',
    forceRefresh: boolean = false
  ): Promise<DailyWordTip> {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `${DAILY_WORD_STORAGE_PREFIX}${userId}_${targetLanguage}_${userLevel}_${today}`;

    // 1. Try local storage cache if not forced
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.word) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to read daily word from storage cache', e);
      }
    }

    // 2. Try fetching from AI endpoint
    try {
      const response = await fetch('/api/ai-tutor/daily-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage,
          userLevel,
          explanationLanguage,
          forceRefresh,
          userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.dailyWord && data.dailyWord.word) {
          const result: DailyWordTip = {
            ...data.dailyWord,
            targetLanguage,
            dateKey: today,
            isAiGenerated: true,
          };
          try {
            localStorage.setItem(storageKey, JSON.stringify(result));
          } catch (e) {
            console.warn('Failed to cache daily word', e);
          }
          return result;
        }
      }
    } catch (err) {
      console.warn('Network request for daily word failed, switching to offline bank', err);
    }

    // 3. Fallback to curated offline database
    const langDict = OFFLINE_WORD_BANK[targetLanguage] || OFFLINE_WORD_BANK.en;
    const levelList = langDict[userLevel] || langDict.B1 || langDict.A1 || OFFLINE_WORD_BANK.en.B1;
    const randomIndex = Math.floor(Math.random() * levelList.length);
    const chosen = {
      ...levelList[randomIndex],
      targetLanguage,
      dateKey: today,
      isAiGenerated: false,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(chosen));
    } catch (e) {
      // ignore
    }

    return chosen;
  },

  // Convert daily word tip to SRS flashcard for spaced repetition
  createSRSCardFromWord(tip: DailyWordTip): SRSCard {
    return {
      id: `srs_daily_${tip.targetLanguage}_${tip.word.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      language: tip.targetLanguage,
      frontText: tip.word,
      backTextFa: tip.translationFa,
      phonetic: tip.phonetic,
      partOfSpeech: tip.partOfSpeech,
      exampleTarget: tip.exampleSentence,
      exampleFa: tip.exampleTranslationFa,
      category: 'واژگان روزانه',
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
      state: 'new',
    };
  },
};
