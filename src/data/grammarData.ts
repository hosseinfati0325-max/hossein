import { GrammarLesson, TargetLanguageCode } from '../types';

// ============================================================================
// ENGLISH GRAMMAR LESSONS (A1 to C1 - از پایه تا پیشرفته)
// ============================================================================
const ENGLISH_GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 'en_g1_alphabet_phonetics',
    language: 'en',
    level: 'A1',
    titleFa: 'الفبا، آواشناسی و حروف صدادار/بی‌صدا',
    titleNative: 'Alphabet, Vowels, Consonants & Phonetics',
    summaryFa: 'آشنایی با ۲۶ حرف انگلیسی، تفاوت حروف صدادار (Vowels) و بی‌صدا (Consonants) و قواعد اولیه تلفظ.',
    categoryFa: 'پایه و آواشناسی',
    formula: '26 Letters: 5 Vowels (A, E, I, O, U) + 21 Consonants',
    contentMarkdownFa: `### الفبای زبان انگلیسی و آواشناسی پایه
زبان انگلیسی دارای **۲۶ حرف** است که به دو دسته اصلی تقسیم می‌شوند:
1. **حروف صدادار (Vowels):** A, E, I, O, U (و گاهی Y). این حروف صداهای باز تولید می‌کنند.
2. **حروف بی‌صدا (Consonants):** سایر حروف مانند B, C, D, F, G, H, J, K, L, M, N, P, Q, R, S, T, V, W, X, Y, Z.

#### تفاوت صدای کوتاه و کشیده حروف صدادار (Short vs Long Vowels):
- **A کوتاه:** cat /kæt/ (گربه) | **A کشیده:** cake /keɪk/ (کیک)
- **E کوتاه:** bed /bɛd/ (تخت) | **E کشیده:** be /biː/ (بودن)
- **I کوتاه:** sit /sɪt/ (نشستن) | **I کشیده:** site /saɪt/ (محل)
- **O کوتاه:** hot /hɒt/ (داغ) | **O کشیده:** home /hoʊm/ (خانه)
- **U کوتاه:** cup /kʌp/ (فنجان) | **U کشیده:** cute /kjuːt/ (زیبا/بانمک)`,
    rules: [
      {
        ruleTitleFa: 'قاعده E جادویی در انتهای کلمات (Magic E)',
        explanationFa: 'وقتی حرف e در انتهای یک کلمه تک‌سیلابی بعد از یک حرف بی‌صدا بیاید، حرف e تلفظ نمی‌شود اما باعث می‌شود حرف صدادار قبلی به صورت کشیده (نام حرف در الفبا) خوانده شود.',
        formula: 'Vowel + Consonant + E -> Long Vowel Sound',
        examples: [
          { target: 'cap /kæp/ -> cape /keɪp/', fa: 'کلاه لبه‌دار -> شنل', phonetic: '/keɪp/' },
          { target: 'hop /hɒp/ -> hope /hoʊp/', fa: 'پریدن -> امید داشتن', phonetic: '/hoʊp/' },
          { target: 'kit /kɪt/ -> kite /kaɪt/', fa: 'جعبه ابزار -> بادبادک', phonetic: '/kaɪt/' },
        ],
        commonMistakesFa: [
          { wrong: 'تلفظ حرف e در انتهای make به صورت /meɪk-e/', correct: 'make /meɪk/', reasonFa: 'حرف e پایانی ساکت (Silent E) است.' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'eq_1',
        questionFa: 'کدام کلمه دارای صدای کشیده (Long A) است؟',
        promptTarget: 'Find the word with long "A" sound:',
        options: ['Plane', 'Plan', 'Pan', 'Map'],
        correctAnswer: 'Plane',
        explanationFa: 'کلمه Plane دارای Magic E در انتهاست و صدای /eɪ/ می‌دهد.',
      },
    ],
    aiDiscussionPrompts: [
      'چگونه تلفظ صحیح حروف th (/θ/ و /ð/) را تمرین کنم؟',
      'تفاوت بین لهجه بریتیش و امریکن در تلفظ حروف صدادار چیست؟',
    ],
  },
  {
    id: 'en_g2_to_be_pronouns',
    language: 'en',
    level: 'A1',
    titleFa: 'ضمایر فاعلی و فعل بودن (To Be: am, is, are)',
    titleNative: 'Subject Pronouns & Verb To Be',
    summaryFa: 'مهم‌ترین رکن زبان انگلیسی برای معرفی خود، بیان شغل، سن، احساسات و ویژگی‌ها.',
    categoryFa: 'افعال و ساختار پایه',
    formula: 'Subject + am / is / are + Complement',
    contentMarkdownFa: `### ضمایر فاعلی (Subject Pronouns)
در انگلیسی هر جمله باید فاعل داشته باشد:
- **I:** من (فعل: am)
- **You:** تو / شما (فعل: are)
- **He:** او (مذکر) (فعل: is)
- **She:** او (مونث) (فعل: is)
- **It:** آن (اشیاء و حیوانات) (فعل: is)
- **We:** ما (فعل: are)
- **They:** آن‌ها (فعل: are)

#### حالت منفی و سوالی:
- **منفی:** اضافه کردن not بعد از فعل To Be: (I am not, He is not, They are not)
- **سوالی:** جابجا کردن فعل To Be با فاعل: (?Are you ready? / Is he a doctor)`,
    rules: [
      {
        ruleTitleFa: 'اختصارات رایج (Contractions)',
        explanationFa: 'در مکالمه روزمره معمولاً از فرم خلاصه استفاده می‌شود: I\'m, You\'re, He\'s, She\'s, We\'re, They\'re.',
        examples: [
          { target: 'I am a student.', fa: 'من یک دانش‌آموز هستم.', phonetic: '/aɪ æm ə ˈstjuːdənt/' },
          { target: 'She is very smart.', fa: 'او بسیار باهوش است.', phonetic: '/ʃiː ɪz ˈvɛri smɑːrt/' },
          { target: 'They are not at home.', fa: 'آن‌ها در خانه نیستند.', phonetic: '/ðeɪ ɑːr nɒt æt hoʊm/' },
          { target: 'Are you from Iran?', fa: 'آیا شما اهل ایران هستید؟', phonetic: '/ɑːr juː frəm ɪˈrɑːn/' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'eq_2',
        questionFa: 'جای خالی را با فرم درست فعل To Be کامل کنید:',
        promptTarget: 'My brother and I ___ very excited today.',
        options: ['are', 'is', 'am', 'be'],
        correctAnswer: 'are',
        explanationFa: 'فاعل جمله جمع است (من و برادرم = ما / We)، بنابراین are صحیح است.',
      },
    ],
    aiDiscussionPrompts: [
      'تفاوت استفاده از it و this در جملات آغازین چیست؟',
      'چرا در انگلیسی نمی‌توان فاعل را مثل فارسی حذف کرد؟',
    ],
  },
  {
    id: 'en_g3_present_simple',
    language: 'en',
    level: 'A1',
    titleFa: 'زمان حال ساده و قاعده سوم شخص (Present Simple)',
    titleNative: 'Present Simple Tense & Daily Routines',
    summaryFa: 'بیان عادات روزمره، حقایق علمی و برنامه‌های ثابت با افعال کمکی Do و Does.',
    categoryFa: 'زمان‌ها و صرف فعل',
    formula: 'Positive: Sub + Verb(s/es) | Negative: Sub + do/does not + Verb | Question: Do/Does + Sub + Verb?',
    contentMarkdownFa: `### زمان حال ساده (Present Simple)
برای بیان کارهایی که به طور منظم تکرار می‌شوند، عادات، و حقایق عمومی جهان:
- **I / You / We / They:** شکل ساده فعل (I work, We live)
- **He / She / It:** فعل پسوند **-s** یا **-es** می‌گیرد (He works, She watches)

#### منفی و سوالی با Do و Does:
- **منفی:** I do not (don't) know / He does not (doesn't) like coffee. *(نکته طلایی: بعد از doesn't فعل ساده می‌شود و s حذف می‌گردد!)*
- **سوالی:** Do you speak English? / Does she live in Berlin?`,
    rules: [
      {
        ruleTitleFa: 'قواعد افزودن -s و -es به انتهای افعال سوم شخص',
        explanationFa: 'افعالی که به ch, sh, ss, x, z یا o ختم می‌شوند es می‌گیرند (watches, washes, goes). افعالی که به حرف بی‌صدا + y ختم می‌شوند y به ies تبدیل می‌شود (study -> studies).',
        examples: [
          { target: 'He plays football every weekend.', fa: 'او هر آخر هفته فوتبال بازی می‌کند.', phonetic: '/hiː pleɪz ˈfʊtbɔːl/' },
          { target: 'The sun rises in the east.', fa: 'خورشید از شرق طلوع می‌کند.', phonetic: '/ðə sʌn ˈraɪzɪz ɪn ðiː iːst/' },
          { target: 'She doesn\'t drink tea.', fa: 'او چای نمی‌نوشد.', phonetic: '/ʃiː ˈdʌznt drɪŋk tiː/' },
        ],
        commonMistakesFa: [
          { wrong: 'He doesn\'t plays football.', correct: 'He doesn\'t play football.', reasonFa: 'وجود does یا doesn\'t علامت سوم شخص را جذب می‌کند و فعل اصلی ساده می‌ماند.' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'eq_3',
        questionFa: 'کدام گزینه از نظر گرامری کاملاً صحیح است؟',
        promptTarget: 'Choose the correct sentence:',
        options: ['She always watches English movies.', 'She always watch English movies.', 'She always watchs English movies.', 'She does watches English movies.'],
        correctAnswer: 'She always watches English movies.',
        explanationFa: 'فعل watch به ch ختم شده و در سوم شخص مفرد es می‌گیرد (watches).',
      },
    ],
    aiDiscussionPrompts: [
      'چگونه قیدهای تکرار (always, usually, never) را در جمله جای‌گذاری کنیم؟',
      'تفاوت حال ساده و حال استمراری در افعال حالتی (Stative Verbs) مانند love و understand چیست؟',
    ],
  },
  {
    id: 'en_g4_past_simple',
    language: 'en',
    level: 'A2',
    titleFa: 'زمان گذشته ساده و افعال بی‌قاعده (Past Simple)',
    titleNative: 'Past Simple & Irregular Verbs',
    summaryFa: 'روایت وقایعی که در زمان مشخصی در گذشته رخ داده و پایان یافته‌اند با فعل کمکی Did.',
    categoryFa: 'زمان‌ها و صرف فعل',
    formula: 'Positive: Sub + Verb(ed/V2) | Negative: Sub + did not + Verb | Question: Did + Sub + Verb?',
    contentMarkdownFa: `### گذشته ساده (Past Simple)
برای صحبت درباره رویدادهایی که در گذشته رخ داده و تمام شده‌اند:
- **افعال باقاعده (Regular):** با اضافه کردن -ed ساخته می‌شوند (walk -> walked, live -> lived).
- **افعال بی‌قاعده (Irregular):** شکل آن‌ها تغییر می‌کند (go -> went, see -> saw, buy -> bought, have -> had).

#### منفی و سوالی با Did:
- **منفی:** I did not (didn't) see him yesterday. *(نکته: بعد از did/didn't فعل به فرم پایه برمی‌گردد!)*
- **سوالی:** Did you finish your homework?`,
    rules: [
      {
        ruleTitleFa: 'پرتکرارترین افعال بی‌قاعده انگلیسی',
        explanationFa: 'افعالی مانند be (was/were), have (had), do (did), make (made), take (took), get (got) ستون فقرات مکالمه گذشته هستند.',
        examples: [
          { target: 'We went to Paris last summer.', fa: 'ما تابستان گذشته به پاریس رفتیم.', phonetic: '/wiː wɛnt tuː ˈpærɪs lɑːst ˈsʌmər/' },
          { target: 'I didn\'t sleep well last night.', fa: 'من دیشب خوب نخوابیدم.', phonetic: '/aɪ ˈdɪdnt sliːp wɛl lɑːst naɪt/' },
          { target: 'Did they buy the new car?', fa: 'آیا آن‌ها ماشین جدید را خریدند؟', phonetic: '/dɪd ðeɪ baɪ ðə njuː kɑːr/' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'eq_4',
        questionFa: 'جای خالی را با فعل مناسب گذشته پر کنید:',
        promptTarget: 'Yesterday, she ___ (buy) a beautiful dress.',
        options: ['bought', 'buyed', 'buys', 'was buy'],
        correctAnswer: 'bought',
        explanationFa: 'فعل buy بی‌قاعده است و شکل گذشته آن bought می‌باشد.',
      },
    ],
    aiDiscussionPrompts: [
      'چگونه شکل دوم و سوم افعال بی‌قاعده را در حافظه بلندمدت تثبیت کنم؟',
      'تفاوت تلفظ پسوند -ed (/t/, /d/, /ɪd/) چیست؟',
    ],
  },
  {
    id: 'en_g5_present_perfect',
    language: 'en',
    level: 'B1',
    titleFa: 'حال کامل و تفاوت با گذشته ساده (Present Perfect)',
    titleNative: 'Present Perfect Tense (have/has + V3)',
    summaryFa: 'اتصال گذشته به زمان حال، بیان تجربیات زندگی با ever, never, just, already, yet, since, for.',
    categoryFa: 'زمان‌ها و صرف فعل',
    formula: 'Subject + have / has + Past Participle (V3)',
    contentMarkdownFa: `### زمان حال کامل (Present Perfect)
کاربردهای کلیدی:
1. **تجربیات زندگی (بدون ذکر زمان دقیق):** I have visited Italy twice.
2. **کارهای به تازگی انجام‌شده:** I have just finished lunch.
3. **کاری که در گذشته شروع شده و تا حال ادامه دارد:** I have lived here for 5 years.

#### کلمات کلیدی:
- **Ever / Never:** Have you ever been to London? / I have never seen snow.
- **Already / Yet:** I have already done it. / Have you called him yet?
- **Since (مبدأ زمان) vs For (طول مدت):** since 2018 / for 6 years.`,
    rules: [
      {
        ruleTitleFa: 'تفاوت بنیادین Present Perfect و Past Simple',
        explanationFa: 'اگر زمان دقیق گذشته مشخص باشد (yesterday, in 2020, 2 days ago) حتماً از Past Simple استفاده می‌شود. اگر زمان نامشخص باشد یا اثر آن در حال جاری باشد، از Present Perfect استفاده می‌کنیم.',
        examples: [
          { target: 'I have lost my key. (I can\'t open the door now)', fa: 'کلیدم را گم کرده‌ام. (هنوز پیدایش نکرده‌ام و در قفل است)', phonetic: '/aɪ hæv lɒst maɪ kiː/' },
          { target: 'I lost my key yesterday, but found it.', fa: 'دیروز کلیدم را گم کردم، اما پیدایش کردم.', phonetic: '/aɪ lɒst maɪ kiː ˈjɛstərdeɪ/' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'eq_5',
        questionFa: 'کدام کلمه برای پر کردن جای خالی مناسب است؟',
        promptTarget: 'She has worked in this company ___ 2019.',
        options: ['since', 'for', 'from', 'in'],
        correctAnswer: 'since',
        explanationFa: 'چون نقطه شروع مشخص است (2019)، از since استفاده می‌شود.',
      },
    ],
    aiDiscussionPrompts: [
      'تفاوت have been to و have gone to چیست؟',
      'چرا آمریکایی‌ها گاهی با already و yet از گذشته ساده استفاده می‌کنند؟',
    ],
  },
];

// ============================================================================
// GERMAN GRAMMAR LESSONS (A1 to C1 - آلمانی از پایه تا پیشرفته)
// ============================================================================
const GERMAN_GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 'de_g1_alphabet_pronunciation',
    language: 'de',
    level: 'A1',
    titleFa: 'الفبا، حروف خاص (Umlaute: ä, ö, ü, ß) و آواشناسی',
    titleNative: 'Alphabet, Umlaute & Aussprache',
    summaryFa: 'تسلط بر ۲۶ حرف به علاوه ۴ حرف اختصاصی آلمانی، ترکیب‌های صوتی (ei, ie, sch, ch) و استرس کلمات.',
    categoryFa: 'پایه و آواشناسی',
    formula: '26 Standard + 4 Spezielle Buchstaben (Ä, Ö, Ü, ß)',
    contentMarkdownFa: `### الفبای آلمانی و حروف اختصاصی (Umlaute)
در آلمانی ۴ حرف ویژه وجود دارد:
1. **Ä / ä:** شبیه به "اِ" کشیده در فارسی (Mädchen / Äpfel)
2. **Ö / ö:** تلفظ با گرد کردن لب‌ها و گفتن "اِ" (schön / hören)
3. **Ü / ü:** تلفظ با غنچه کردن لب‌ها و گفتن "ای" (über / Tür)
4. **Eszett (ß):** صدای "س" دوبرابر کشیده و تند (Straße / heißen)

#### ترکیب‌های صوتی کلیدی:
- **ei:** صدای «آی» می‌دهد (mein / frei / nein)
- **ie:** صدای «ای» کشیده می‌دهد (sie / hier / Liebe)
- **eu / äu:** صدای «اُی» می‌دهد (heute / Häuser / Euro)
- **sch:** صدای «ش» قوی (Schule / schön)
- **sp / st در ابتدای کلمه:** صدای «شپ» و «شت» (Sport -> شپورت / Stadt -> شتات)
- **w:** همیشه صدای «و» (V انگلیسی) می‌دهد (Wasser -> واسِر / wo -> وو)
- **v:** معمولاً صدای «ف» می‌دهد (Vater -> فاتر / vier -> فیر)`,
    rules: [
      {
        ruleTitleFa: 'قاعده بزرگ نوشتن تمام اسامی (Großschreibung)',
        explanationFa: 'در زبان آلمانی، **تمام اسامی (Nomen)** بدون استثنا با حرف بزرگ (Capital Letter) آغاز می‌شوند (der Tisch, das Buch, die Freude).',
        examples: [
          { target: 'Guten Tag! Wie heißen Sie?', fa: 'روز بخیر! نام شما چیست؟', phonetic: '/ˈɡuːtn̩ taːk viː ˈhaɪsn̩ ziː/' },
          { target: 'Ich trinke Wasser.', fa: 'من آب می‌نوشم.', phonetic: '/ɪç ˈtrɪŋkə ˈvasɐ/' },
          { target: 'Die Schule ist sehr schön.', fa: 'مدرسه بسیار زیبا است.', phonetic: '/diː ˈʃuːlə ɪst zeːɐ̯ ʃøːn/' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'dq_1',
        questionFa: 'کلمه آلمانی "Wein" (شراب) چگونه تلفظ می‌شود؟',
        promptTarget: 'How is "Wein" pronounced?',
        options: ['واین (/vaɪn/)', 'وین (/viːn/)', 'وِین (/veɪn/)', 'فین (/fiːn/)'],
        correctAnswer: 'واین (/vaɪn/)',
        explanationFa: 'ترکیب ei در آلمانی همواره صدای «آی» می‌دهد و w صدای «و» دارد.',
      },
    ],
    aiDiscussionPrompts: [
      'تفاوت تلفظ ich-Laut (/ç/) و ach-Laut (/x/) در زبان آلمانی چیست؟',
      'چگونه تلفظ ö و ü را به درستی در خانه تمرین کنم؟',
    ],
  },
  {
    id: 'de_g2_articles_gender',
    language: 'de',
    level: 'A1',
    titleFa: 'جنسیت اسامی و حروف تعریف معین و نامعین (der, die, das / ein, eine)',
    titleNative: 'Bestimmte & unbestimmte Artikel (Genus)',
    summaryFa: 'شناخت سه جنسیت مذکر (Maskulin)، مونث (Feminin) و خنثی (Neutral) و منفی‌ساز kein.',
    categoryFa: 'آرتیکل‌ها و صرف',
    formula: 'Maskulin: der / ein | Feminin: die / eine | Neutral: das / ein | Plural: die / -',
    contentMarkdownFa: `### سه جنسیت در زبان آلمانی
هر اسم در آلمانی یکی از این ۳ جنسیت را دارد:
1. **مذکر (Maskulin):** **der** Mann (مرد)، **der** Tisch (میز)، **der** Apfel (سیب)
2. **مونث (Feminin):** **die** Frau (زن)، **die** Sonne (خورشید)، **die** Lampe (چراغ)
3. **خنثی (Neutral):** **das** Kind (کودک)، **das** Buch (کتاب)، **das** Auto (ماشین)
4. **جمع (Plural):** همه اسامی در حالت جمع آرتیکل **die** می‌گیرند!

#### حروف تعریف نامعین (Unbestimmte Artikel - یک...):
- مذکر: **ein** Mann
- خنثی: **ein** Buch
- مونث: **eine** Frau
- جمع: بدون ein (اسامی جمع حرف تعریف نامعین ندارند).

#### منفی کردن اسامی با kein:
- **kein** Mann / **kein** Buch / **keine** Frau / **keine** Kinder`,
    rules: [
      {
        ruleTitleFa: 'پسوندهای طلایی برای تشخیص جنسیت اسامی',
        explanationFa: 'اسامی با پسوند -ung, -heit, -keit, -schaft, -tion, -tät همیشه مونث (die) هستند. اسامی با پسوند -chen, -lein همیشه خنثی (das) هستند. اسامی با پسوند -er, -ling, -or معمولاً مذکر (der) هستند.',
        examples: [
          { target: 'die Zeitung (روزنامه) - پسوند ung', fa: 'روزنامه (مونث)', phonetic: '/diː ˈtsaɪtʊŋ/' },
          { target: 'das Mädchen (دختربچه) - پسوند chen', fa: 'دختربچه (خنثی)', phonetic: '/das ˈmɛːtçən/' },
          { target: 'der Lehrer (معلم مذکر) - پسوند er', fa: 'معلم (مذکر)', phonetic: '/deːɐ̯ ˈleːrɐ/' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'dq_2',
        questionFa: 'آرتیکل صحیح کلمه "Freiheit" (آزادی) چیست؟',
        promptTarget: 'Choose the correct article for "Freiheit":',
        options: ['die', 'der', 'das', 'den'],
        correctAnswer: 'die',
        explanationFa: 'اسامی با پسوند -heit همیشه مونث هستند (die Freiheit).',
      },
    ],
    aiDiscussionPrompts: [
      'بهترین روش برای حفظ کردن همزمان آرتیکل همراه با کلمه چیست؟',
      'تفاوت استفاده از nicht و kein در منفی‌سازی آلمانی چیست؟',
    ],
  },
  {
    id: 'de_g3_sentence_structure_v2',
    language: 'de',
    level: 'A1',
    titleFa: 'ساختار جمله در آلمانی و قانون جایگاه دوم فعل (Verb auf Position 2)',
    titleNative: 'Satzbau & Verbposition im Hauptsatz',
    summaryFa: 'مهم‌ترین قانون دستوری زبان آلمانی: در جملات اصلی، فعل صرف‌شده همواره در جایگاه ۲ می‌نشیند.',
    categoryFa: 'ساختار جمله و افعال',
    formula: 'Position 1 (Subject or Time) + Position 2 (CONJUGATED VERB) + Position 3 + ...',
    contentMarkdownFa: `### قانون طلایی جایگاه دوم فعل (Position 2 Rule)
در جملات خبری اصلی (Hauptsatz)، **فعل صرف‌شده همیشه و بدون استثنا در جایگاه دوم** قرار می‌گیرد:
- **حالت عادی:** Ich **trinke** heute Kaffee. (من امروز قهوه می‌نوشم.)
- **شروع با قید زمان (Inversion):** Heute **trinke** ich Kaffee. (امروز من قهوه می‌نوشم.)

*توجه کنید در هر دو حالت، فعل "trinke" در جایگاه دوم نشسته است!*

#### ساختار جملات سوالی:
1. **سوالات W-Fragen:** W-Wort در جایگاه ۱ + فعل در جایگاه ۲: (Wo **wohnst** du? / Was **machst** du?)
2. **سوالات بله/خیر (Ja/Nein-Fragen):** فعل در جایگاه ۱: (**Kommst** du aus Deutschland?)`,
    rules: [
      {
        ruleTitleFa: 'چیدمان قاب فعل (Satzklammer) با افعال دوتایی یا مدال',
        explanationFa: 'وقتی دو فعل داریم (مانند فعل مدال + مصدر یا گذشته پرفکت)، فعل اول صرف‌شده در جایگاه ۲ می‌نشیند و فعل دوم (مصدر یا Partizip II) به **آخرین کلمه جمله** پرتاب می‌شود!',
        examples: [
          { target: 'Ich kann sehr gut Deutsch sprechen.', fa: 'من می‌توانم خیلی خوب آلمانی صحبت کنم.', phonetic: '/ɪç kan zeːɐ̯ ɡuːt dɔɪtʃ ˈʃprɛçn̩/' },
          { target: 'Wir haben gestern ein Auto gekauft.', fa: 'ما دیروز یک ماشین خریدیم.', phonetic: '/viːɐ̯ ˈhaːbn̩ ˈɡɛstɐn aɪn ˈaʊtoː ɡəˈkaʊft/' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'dq_3',
        questionFa: 'ترتیب درست کلمات برای جمله زیر کدام است؟',
        promptTarget: 'Am Wochenende / wir / Fußball / spielen',
        options: ['Am Wochenende spielen wir Fußball.', 'Am Wochenende wir spielen Fußball.', 'Am Wochenende wir Fußball spielen.', 'Wir spielen am Wochenende Fußball nicht.'],
        correctAnswer: 'Am Wochenende spielen wir Fußball.',
        explanationFa: 'وقتی قید زمان (Am Wochenende) در جایگاه ۱ می‌آید، فعل (spielen) باید در جایگاه ۲ و فاعل (wir) در جایگاه ۳ قرار گیرد.',
      },
    ],
    aiDiscussionPrompts: [
      'چرا در جملات پیرو با weil و dass فعل به انتهای جمله می‌رود؟',
      'تفاوت ترتیب اجزای جمله در قانون TeKaMoLo در سطوح بالاتر چیست؟',
    ],
  },
  {
    id: 'de_g4_akkusativ_dativ',
    language: 'de',
    level: 'A2',
    titleFa: 'حالت‌های مفعولی آکوزاتیو (Akkusativ) و داتیو (Dativ)',
    titleNative: 'Der Akkusativ & Der Dativ (Kasus)',
    summaryFa: 'تحول آرتیکل‌ها در حالت‌های دستوری: تفاوت مفعول بی‌واسطه (چه چیزی/چه کسی را؟) و مفعول باواسطه (به چه کسی؟).',
    categoryFa: 'آرتیکل‌ها و صرف',
    formula: 'Akkusativ: der -> den | Dativ: der -> dem, die -> der, das -> dem, die(Pl) -> den + n',
    contentMarkdownFa: `### حالت‌های گرامری در آلمانی (Kasus)
در آلمانی حالت اسامی بر اساس نقش آن‌ها تغییر می‌کند:

| جنسیت | نُمیناتیو (فاعل) | آکوزاتیو (مفعول مستقیم) | داتیو (مفعول غیرمستقیم) |
| :--- | :--- | :--- | :--- |
| **مذکر (m)** | **der** / ein | **den** / einen | **dem** / einem |
| **مونث (f)** | **die** / eine | **die** / eine | **der** / einer |
| **خنثی (n)** | **das** / ein | **das** / ein | **dem** / einem |
| **جمع (pl)** | **die** | **die** | **den** + n به اسم |

#### افعال اختصاصی داتیو (Dativverben):
برخی افعال همواره مفعول خود را داتیو می‌کنند:
- **helfen** (کمک کردن): Ich helfe **dem** Mann. (من به آن مرد کمک می‌کنم.)
- **danken** (تشکر کردن): Ich danke **dir**. (از تو ممنونم.)
- **gefallen** (مورد پسند واقع شدن): Das Buch gefällt **mir**. (کتاب مورد پسند من است.)`,
    rules: [
      {
        ruleTitleFa: 'قاعده حروف اضافه داتیو و آکوزاتیو',
        explanationFa: 'حروف اضافه mit, nach, von, zu, bei, seit, aus همیشه داتیو می‌سازند. حروف اضافه für, durch, ohne, um, gegen همیشه آکوزاتیو می‌سازند.',
        examples: [
          { target: 'Ich gehe mit meiner Freundin ins Kino.', fa: 'من با دوستم به سینما می‌روم. (mit + Dativ: die -> meiner)', phonetic: '/ɪç ˈɡeːə mɪt ˈmaɪnɐ ˈfrɔɪndɪn ɪns ˈkiːnoː/' },
          { target: 'Das Geschenk ist für meinen Vater.', fa: 'این هدیه برای پدرم است. (für + Akkusativ: der -> meinen)', phonetic: '/das ɡəˈʃɛŋk ɪst fyːɐ̯ ˈmaɪnən ˈfaːtɐ/' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'dq_4',
        questionFa: 'جای خالی را با آرتیکل صحیح پر کنید:',
        promptTarget: 'Ich sehe ___ (der) Hund im Park.',
        options: ['den', 'dem', 'der', 'des'],
        correctAnswer: 'den',
        explanationFa: 'فعل sehen مفعول آکوزاتیو می‌خواهد و آرتیکل مذکر der به den تبدیل می‌شود.',
      },
    ],
    aiDiscussionPrompts: [
      'چگونه حروف اضافه دوگانه (Wechselpräpositionen) با سوال Wo? (مکان/داتیو) و Wohin? (جهت/آکوزاتیو) کار می‌کنند؟',
      'صرف ضمایر شخصی در حالت داتیو (mir, dir, ihm, ihr, uns, euch, ihnen) چگونه است؟',
    ],
  },
];

// ============================================================================
// FRENCH GRAMMAR LESSONS (A1 to C1 - فرانسوی از پایه تا پیشرفته)
// ============================================================================
const FRENCH_GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: 'fr_g1_alphabet_accents',
    language: 'fr',
    level: 'A1',
    titleFa: 'الفبا، اکسان‌ها (é, è, ê, ç) و پیوند صوتی (La Liaison)',
    titleNative: 'L\'alphabet, les accents et la liaison',
    summaryFa: 'آشنایی با حروف الفبا، نقش اکسان‌های پنج‌گانه فرانسوی و قانون پیوند حروف صوتی در مکالمه سلیس.',
    categoryFa: 'پایه و آواشناسی',
    formula: '26 Lettres + 5 Accents: Aigu (é), Grave (è, à), Circonflexe (ê, î, ô), Tréma (ë, ï), Cédille (ç)',
    contentMarkdownFa: `### الفبای فرانسوی و اکسان‌های پنج‌گانه
در زبان فرانسوی اکسان‌ها تلفظ و معنای کلمات را کاملاً دگرگون می‌کنند:
1. **L'accent aigu (é):** صدای "اِ" بسته و رسا (café, répéter, étudiant).
2. **L'accent grave (è, à, ù):** صدای "اِ" باز و کشیده (père, mère, où).
3. **L'accent circonflexe (â, ê, î, ô, û):** نشان‌دهنده حرف s حذف‌شده در لاتین کهن و صدای کشیده (fête, hôtel, château).
4. **Le tréma (ë, ï):** باعث می‌شود دو حرف صدادار کنار هم جداگانه تلفظ شوند (Noël /no-ɛl/, naïf).
5. **La cédille (ç):** حرف c قبل از a, o, u صدای "س" می‌دهد (français, garçon).

#### قانون پیوند صوتی (La Liaison):
وقتی کلمه‌ای به حرف بی‌صدا (معمولاً ساکت) ختم شود و کلمه بعدی با حرف صدادار آغاز شود، آن حرف بی‌صدا به کلمه بعدی وصل و خوانده می‌شود:
- **les amis:** /le-za-mi/ (دوستان)
- **vous avez:** /vu-za-ve/ (شما دارید)`,
    rules: [
      {
        ruleTitleFa: 'حروف صامت ناخوانا در انتهای کلمات (Lettres muettes)',
        explanationFa: 'حروف e, s, t, d, p, x در انتهای اکثر کلمات فرانسوی تلفظ نمی‌شوند (مانند: grand /ɡʁɑ̃/, Paris /pa.ʁi/, chat /ʃa/).',
        examples: [
          { target: 'Bonjour, comment vous appelez-vous ?', fa: 'سلام، نام شما چیست؟', phonetic: '/bɔ̃.ʒuʁ kɔ.mɑ̃ vu.za.ple.vu/' },
          { target: 'Je suis un étudiant français.', fa: 'من یک دانشجوی فرانسوی هستم.', phonetic: '/ʒə sɥi zœ̃.ne.ty.djɑ̃ fʁɑ̃.sɛ/' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'fq_1',
        questionFa: 'کدام کلمه دارای اکسان اِگو (Accent Aigu) است؟',
        promptTarget: 'Find the word with Accent Aigu:',
        options: ['Café', 'Père', 'Hôtel', 'Français'],
        correctAnswer: 'Café',
        explanationFa: 'در کلمه Café روی حرف e اکسان aigu (é) قرار دارد.',
      },
    ],
    aiDiscussionPrompts: [
      'چگونه صدای R فرانسوی (خ یا غ فرانسوی /ʁ/) را بدون فشار به حنجره تلفظ کنم؟',
      'تفاوت تلفظ صداهای خیشومی (Nasales: an, on, in) در چیست؟',
    ],
  },
  {
    id: 'fr_g2_etre_avoir_pronouns',
    language: 'fr',
    level: 'A1',
    titleFa: 'ضمایر فاعلی و صرف افعال پایه بودن و داشتن (Être & Avoir)',
    titleNative: 'Les pronoms sujets et les verbes ÊTRE et AVOIR',
    summaryFa: 'دو فعل بنیادین و حیاتی در زبان فرانسوی برای ساخت تمام زمان‌های ترکیبی، سن، مشخصات و توصیف.',
    categoryFa: 'افعال و ساختار پایه',
    formula: 'Être (suis, es, est, sommes, êtes, sont) | Avoir (ai, as, a, avons, avez, ont)',
    contentMarkdownFa: `### ضمایر فاعلی (Pronoms Sujets)
- **Je / J' :** من
- **Tu :** تو (دوستانه)
- **Il / Elle / On :** او (مذکر / مونث / ما عامیانه)
- **Nous :** ما
- **Vous :** شما (رسمی یا جمع)
- **Ils / Elles :** آن‌ها (مذکر / مونث)

#### صرف فعل Être (بودن):
- Je suis (من هستم) | Tu es (تو هستی) | Il/Elle est (او هست)
- Nous sommes (ما هستیم) | Vous êtes (شما هستید) | Ils/Elles sont (آن‌ها هستند)

#### صرف فعل Avoir (داشتن):
- J'ai (من دارم) | Tu as (تو داری) | Il/Elle a (او دارد)
- Nous avons (ما داریم) | Vous avez (شما دارید) | Ils/Elles ont (آن‌ها دارند)

*(نکته جالب: برای بیان سن در فرانسوی از فعل Avoir استفاده می‌شود: J'ai 25 ans = من ۲۵ سال دارم!)*`,
    rules: [
      {
        ruleTitleFa: 'ساختار منفی کردن جملات با ne ... pas',
        explanationFa: 'برای منفی کردن فعل در فرانسوی، کلمه ne قبل از فعل و pas بعد از فعل قرار می‌گیرد (Je ne suis pas = من نیستم). قبل از حرف صدادار ne به n\' تبدیل می‌شود (Je n\'ai pas = من ندارم).',
        examples: [
          { target: 'Je suis très heureux de vous rencontrer.', fa: 'من از ملاقات شما بسیار خوشحالم.', phonetic: '/ʒə sɥi tʁɛ.zø.ʁø də vu ʁɑ̃.kɔ̃.tʁe/' },
          { target: 'Elle a deux frères et une sœur.', fa: 'او دو برادر و یک خواهر دارد.', phonetic: '/ɛ.la dø fʁɛʁ e yn sœʁ/' },
          { target: 'Nous ne sommes pas en retard.', fa: 'ما دیر نکرده‌ایم.', phonetic: '/nu nə sɔm pa ɑ̃ ʁə.taʁ/' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'fq_2',
        questionFa: 'کدام گزینه برای تکمیل جمله صحیح است؟',
        promptTarget: 'Vous ___ très gentils.',
        options: ['êtes', 'avez', 'sont', 'sommes'],
        correctAnswer: 'êtes',
        explanationFa: 'صرف فعل être برای فاعل vous برابر با êtes است (Vous êtes).',
      },
    ],
    aiDiscussionPrompts: [
      'چرا فرانسوی‌ها در مکالمات محاوره‌ای خیابانی ne را حذف می‌کنند و فقط pas می‌گویند؟',
      'تفاوت استفاده از Tu و Vous (Tutoiement vs Vouvoiement) در فرهنگ فرانسه چیست؟',
    ],
  },
  {
    id: 'fr_g3_passe_compose',
    language: 'fr',
    level: 'A2',
    titleFa: 'گذشته مرکب و تطابق اسم مفعول (Le Passé Composé)',
    titleNative: 'Le Passé Composé avec Avoir et Être',
    summaryFa: 'زمان گذشته پرکاربرد برای بیان رویدادهای مشخص و پایان‌یافته، شناخت افعال حرکتی خانه دکتر ونتامپ با Être.',
    categoryFa: 'زمان‌ها و صرف فعل',
    formula: 'Avoir / Être (au présent) + Participe Passé',
    contentMarkdownFa: `### زمان گذشته مرکب (Passé Composé)
ساختار: **فعل کمکی (avoir یا être) + اسم مفعول (Participe Passé)**

#### ۱. افعال با فعل کمکی Avoir (اکثر افعال):
- parler -> **j'ai parlé** (صحبت کردم)
- finir -> **tu as fini** (تمام کردی)
- vendre -> **il a vendu** (فروخت)

#### ۲. افعال با فعل کمکی Être (افعال حرکتی و بازتابی):
۱۴ فعل حرکتی معروف (aller, venir, partir, arriver, entrer, sortir, naître, mourir, rester, tomber, monter, descendre, retourner, passer) با être صرف می‌شوند:
- Je suis allé(e) | Elle est partie

**قاعده تطابق (L'accord):** اسم مفعول همراه با être با فاعل از نظر جنس (مونث: e+) و تعداد (جمع: s+) تطابق پیدا می‌کند!`,
    rules: [
      {
        ruleTitleFa: 'اسم مفعول افعال بی‌قاعده مهم',
        explanationFa: 'افعالی مانند avoir (eu), être (été), faire (fait), prendre (pris), voir (vu), mettre (mis) شکل خاص اسم مفعول دارند.',
        examples: [
          { target: 'Hier, nous avons visité le musée du Louvre.', fa: 'دیروز ما از موزه لوور بازدید کردیم.', phonetic: '/jɛʁ nu.za.vɔ̃ vi.zi.te lə my.ze dy luvʁ/' },
          { target: 'Elle est venue à la fête hier soir.', fa: 'او دیشب به جشن آمد. (تطابق با اضافه شدن e به venue)', phonetic: '/ɛ.l‿ɛ və.ny a la fɛt jɛʁ swaʁ/' },
        ],
      },
    ],
    interactiveQuizzes: [
      {
        id: 'fq_3',
        questionFa: 'فرم گذشته صحیح جمله زیر کدام است؟ (فاعل مونث جمع)',
        promptTarget: 'Elles ___ (partir) en vacances.',
        options: ['sont parties', 'ont parti', 'sont partis', 'ont parties'],
        correctAnswer: 'sont parties',
        explanationFa: 'فعل partir با être صرف می‌شود و چون فاعل Elles (مونث جمع) است، تطابق e و s می‌گیرد (parties).',
      },
    ],
    aiDiscussionPrompts: [
      'تفاوت اساسی بین Passé Composé و Imparfait چیست؟',
      'چگونه تفاوت تلفظ j\'ai parlé و je parlais را تشخیص دهیم؟',
    ],
  },
];

// ============================================================================
// ALL GRAMMAR LESSONS REPOSITORY
// ============================================================================
export const ALL_GRAMMAR_LESSONS: Record<TargetLanguageCode, GrammarLesson[]> = {
  en: ENGLISH_GRAMMAR_LESSONS,
  de: GERMAN_GRAMMAR_LESSONS,
  fr: FRENCH_GRAMMAR_LESSONS,
  es: [
    {
      id: 'es_g1_ser_estar',
      language: 'es',
      level: 'A1',
      titleFa: 'تفاوت افعال بنیادین Ser و Estar (بودن)',
      titleNative: 'Diferencia entre SER y ESTAR',
      summaryFa: 'تسلط بر تفاوت صفات ذاتی و هویتی (Ser) در برابر حالات موقت و مکان (Estar).',
      categoryFa: 'افعال و ساختار پایه',
      formula: 'SER (Esencia / Identidad) vs ESTAR (Estado / Ubicación)',
      contentMarkdownFa: `### دو فعل "بودن" در اسپانیایی
در زبان اسپانیایی دو فعل متمایز برای بودن وجود دارد:
1. **SER:** برای هویت، ملیت، شغل، ویژگی‌های ذاتی و زمان: (Soy de España / Ella es médica / Es la una).
2. **ESTAR:** برای مکان، احساسات، حالات موقت سلامتی و وضعیت: (Estoy en casa / Estoy cansado / La sopa está caliente).`,
      rules: [
        {
          ruleTitleFa: 'روش به خاطر سپاری DOCTOR و PLACE',
          explanationFa: 'برای SER از کلمه DOCTOR (Description, Occupation, Characteristic, Time, Origin, Relationship) و برای ESTAR از PLACE (Position, Location, Action, Condition, Emotion) استفاده کنید.',
          examples: [
            { target: 'Yo soy profesor y estoy feliz hoy.', fa: 'من معلم هستم (ذاتی) و امروز خوشحالم (حالت موقت).', phonetic: '/jo soi pɾo.feˈsoɾ i esˈtoi feˈliθ oi/' },
          ],
        },
      ],
      interactiveQuizzes: [
        {
          id: 'es_q1',
          questionFa: 'جای خالی را با فعل مناسب پر کنید:',
          promptTarget: 'Madrid ___ en España.',
          options: ['está', 'es', 'son', 'están'],
          correctAnswer: 'está',
          explanationFa: 'برای موقعیت جغرافیایی و مکان همواره از Estar استفاده می‌شود.',
        },
      ],
      aiDiscussionPrompts: ['چگونه تغییر معنی صفات با ser و estar (مانند ser aburrido vs estar aburrido) رخ می‌دهد؟'],
    },
  ],
  it: [],
  tr: [],
  ar: [],
  ja: [],
  ru: [],
  zh: [],
};
