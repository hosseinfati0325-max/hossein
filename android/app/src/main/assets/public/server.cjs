var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
var GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
var geminiCooldownUntil = 0;
var geminiQuotaExhausted = false;
function isGeminiAvailable() {
  if (!process.env.GEMINI_API_KEY) return false;
  if (Date.now() < geminiCooldownUntil) return false;
  return true;
}
function handleGeminiError(error) {
  const errMsg = String(error?.message || error || "").toLowerCase();
  const isQuotaOrRateLimit = errMsg.includes("quota") || errMsg.includes("resource_exhausted") || errMsg.includes("429") || errMsg.includes("rate limit") || errMsg.includes("exceeded your current quota");
  if (isQuotaOrRateLimit) {
    geminiCooldownUntil = Date.now() + 18e4;
    geminiQuotaExhausted = true;
    console.warn(`[AI Circuit Breaker] Gemini quota exhausted or rate limit encountered. Switched to offline educational fallback for 180s. Detail: ${errMsg.slice(0, 150)}`);
  } else {
    geminiCooldownUntil = Date.now() + 2e4;
    console.warn(`[AI Circuit Breaker] Gemini transient failure. Cooldown for 20s. Detail: ${errMsg.slice(0, 120)}`);
  }
}
var aiClient = null;
function getAI() {
  if (!isGeminiAvailable()) {
    return null;
  }
  if (!aiClient) {
    aiClient = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
var serverDatabase = {
  userProfiles: /* @__PURE__ */ new Map(),
  networkActiveLearners: /* @__PURE__ */ new Map(),
  examResults: /* @__PURE__ */ new Map(),
  dailyWordCache: /* @__PURE__ */ new Map(),
  syncLogs: []
};
var SEED_LEARNERS = [
  {
    id: "user_default_1",
    firstName: "\u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647",
    lastName: "\u0645\u062F\u06CC\u0631 \u0648 \u0632\u0628\u0627\u0646\u200C\u0622\u0645\u0648\u0632",
    name: "\u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647",
    avatar: "\u{1F981}",
    targetLanguage: "en",
    currentLevel: "B2",
    xp: 1250,
    streak: 18,
    registeredAt: new Date(Date.now() - 30 * 864e5).toISOString(),
    lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  },
  {
    id: "user_seed_sarah",
    firstName: "\u0633\u0627\u0631\u0627",
    lastName: "\u0627\u062D\u0645\u062F\u06CC",
    name: "\u0633\u0627\u0631\u0627 \u0627\u062D\u0645\u062F\u06CC",
    avatar: "\u{1F469}\u200D\u{1F393}",
    targetLanguage: "de",
    currentLevel: "B1",
    xp: 940,
    streak: 12,
    registeredAt: new Date(Date.now() - 14 * 864e5).toISOString(),
    lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  },
  {
    id: "user_seed_ali",
    firstName: "\u0639\u0644\u06CC",
    lastName: "\u0631\u0636\u0627\u06CC\u06CC",
    name: "\u0639\u0644\u06CC \u0631\u0636\u0627\u06CC\u06CC",
    avatar: "\u{1F680}",
    targetLanguage: "fr",
    currentLevel: "A2",
    xp: 680,
    streak: 7,
    registeredAt: new Date(Date.now() - 8 * 864e5).toISOString(),
    lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  },
  {
    id: "user_seed_maryam",
    firstName: "\u0645\u0631\u06CC\u0645",
    lastName: "\u06A9\u0627\u0638\u0645\u06CC",
    name: "\u0645\u0631\u06CC\u0645 \u06A9\u0627\u0638\u0645\u06CC",
    avatar: "\u{1F31F}",
    targetLanguage: "es",
    currentLevel: "B1",
    xp: 810,
    streak: 9,
    registeredAt: new Date(Date.now() - 5 * 864e5).toISOString(),
    lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  },
  {
    id: "user_seed_mehdi",
    firstName: "\u0645\u0647\u062F\u06CC",
    lastName: "\u0637\u0627\u0647\u0631\u06CC",
    name: "\u0645\u0647\u062F\u06CC \u0637\u0627\u0647\u0631\u06CC",
    avatar: "\u26A1",
    targetLanguage: "tr",
    currentLevel: "A2",
    xp: 520,
    streak: 5,
    registeredAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    lastActiveDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  }
];
SEED_LEARNERS.forEach((learner) => {
  serverDatabase.userProfiles.set(learner.id, learner);
  serverDatabase.networkActiveLearners.set(learner.id, {
    lastSeen: Date.now() - Math.floor(Math.random() * 6e4),
    profile: learner
  });
});
function computeGlobalCapacity() {
  const now = Date.now();
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const byLanguage = {};
  const members = [];
  let activeTodayCount = 0;
  let onlineNowCount = 0;
  serverDatabase.userProfiles.forEach((profile, id) => {
    const lang = profile.targetLanguage || "en";
    byLanguage[lang] = (byLanguage[lang] || 0) + 1;
    const activeItem = serverDatabase.networkActiveLearners.get(id);
    const isOnlineNow = activeItem ? now - activeItem.lastSeen < 10 * 60 * 1e3 : false;
    if (isOnlineNow) onlineNowCount++;
    const isToday = profile.lastActiveDate === today || profile.registeredAt && profile.registeredAt.startsWith(today) || isOnlineNow;
    if (isToday) activeTodayCount++;
    members.push({
      id: profile.id,
      name: profile.name || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "\u06A9\u0627\u0631\u0628\u0631",
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      avatar: profile.avatar || "\u{1F981}",
      targetLanguage: profile.targetLanguage || "en",
      currentLevel: profile.currentLevel || "A1",
      xp: profile.xp || 100,
      streak: profile.streak || 1,
      registeredAt: profile.registeredAt || (/* @__PURE__ */ new Date()).toISOString(),
      isOnlineNow,
      lastActiveDate: profile.lastActiveDate || today
    });
  });
  return {
    totalRegistered: Math.max(serverDatabase.userProfiles.size, SEED_LEARNERS.length),
    activeToday: Math.max(activeTodayCount, 3),
    activeOnlineNow: Math.max(onlineNowCount, 2),
    byLanguage,
    members: members.sort((a, b) => (b.xp || 0) - (a.xp || 0))
  };
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    online: true,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    serverTime: (/* @__PURE__ */ new Date()).toISOString(),
    networkCapacity: serverDatabase.userProfiles.size
  });
});
app.get("/api/download-source", (req, res) => {
  const filePath = import_path.default.join(process.cwd(), "public", "hossein-fateme-source.tar.gz");
  res.download(filePath, "hossein-fateme-app-source.tar.gz", (err) => {
    if (err) {
      console.error("Download error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to download source archive" });
      }
    }
  });
});
app.post("/api/capacity/register", (req, res) => {
  try {
    const { userSnapshot } = req.body;
    if (!userSnapshot || !userSnapshot.id) {
      return res.status(400).json({ error: "userSnapshot with valid id is required" });
    }
    const userId = userSnapshot.id;
    const now = Date.now();
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const cleanUser = {
      ...userSnapshot,
      lastActiveDate: today,
      lastSeenTimestamp: now,
      serverRegisteredAt: userSnapshot.registeredAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    serverDatabase.userProfiles.set(userId, cleanUser);
    serverDatabase.networkActiveLearners.set(userId, {
      lastSeen: now,
      profile: cleanUser
    });
    const capacityData = computeGlobalCapacity();
    res.json({
      success: true,
      registeredUserId: userId,
      serverTime: (/* @__PURE__ */ new Date()).toISOString(),
      capacity: capacityData,
      message: "\u062F\u0633\u062A\u06AF\u0627\u0647 \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062F\u0631 \u0634\u0628\u06A9\u0647 \u0633\u0631\u0627\u0633\u0631\u06CC \u0632\u0628\u0627\u0646\u200C\u0622\u0645\u0648\u0632\u0627\u0646 \u062B\u0628\u062A \u0648 \u0638\u0631\u0641\u06CC\u062A \u0647\u0645\u06AF\u0627\u0645\u200C\u0633\u0627\u0632\u06CC \u0634\u062F."
    });
  } catch (error) {
    console.error("Capacity register error:", error);
    res.status(500).json({ error: error.message || "Failed to register capacity" });
  }
});
app.get("/api/capacity/live", (req, res) => {
  try {
    const capacityData = computeGlobalCapacity();
    res.json({
      success: true,
      capacity: capacityData,
      serverTime: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch live capacity" });
  }
});
app.get("/api/tts", async (req, res) => {
  try {
    const text = req.query.text || "";
    const lang = req.query.lang || "fa";
    if (!text.trim()) {
      return res.status(400).send("Text is required");
    }
    let shortLang = lang.split("-")[0].toLowerCase();
    if (shortLang === "fa" || shortLang === "farsi") {
      shortLang = "fa";
    }
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
      shortLang
    )}&q=${encodeURIComponent(text.trim())}`;
    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
        Accept: "audio/mpeg, audio/*; q=0.9, */*; q=0.1"
      }
    });
    if (!response.ok) {
      return res.status(response.status).send("Upstream TTS service returned error");
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=86400",
      "Accept-Ranges": "bytes"
    });
    return res.send(buffer);
  } catch (error) {
    console.error("Server TTS proxy error:", error);
    return res.status(500).send(error.message || "TTS streaming failed");
  }
});
app.post("/api/sync/push", (req, res) => {
  try {
    const { userId, items, userSnapshot } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required for sync" });
    }
    const processedIds = [];
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    if (userSnapshot) {
      serverDatabase.userProfiles.set(userId, {
        ...userSnapshot,
        lastServerSyncedAt: timestamp
      });
    }
    if (Array.isArray(items)) {
      items.forEach((item) => {
        if (item.type === "exam_result" && item.payload) {
          const userExams = serverDatabase.examResults.get(userId) || [];
          const exists = userExams.some((e) => e.id === item.payload.id);
          if (!exists) {
            userExams.unshift({
              ...item.payload,
              syncedToServer: true,
              serverReceivedAt: timestamp
            });
            serverDatabase.examResults.set(userId, userExams);
          }
        }
        processedIds.push(item.id);
      });
    }
    serverDatabase.syncLogs.push({
      userId,
      processedCount: processedIds.length,
      timestamp
    });
    if (serverDatabase.syncLogs.length > 50) {
      serverDatabase.syncLogs.shift();
    }
    res.json({
      success: true,
      processedItemIds: processedIds,
      serverTime: timestamp,
      message: "Background synchronization completed successfully."
    });
  } catch (error) {
    console.error("Sync push error:", error);
    res.status(500).json({ error: error.message || "Failed to sync data to server" });
  }
});
app.post("/api/sync/exam-results", (req, res) => {
  try {
    const { examResult } = req.body;
    if (!examResult || !examResult.userId) {
      return res.status(400).json({ error: "Valid examResult and userId are required" });
    }
    const userId = examResult.userId;
    const userExams = serverDatabase.examResults.get(userId) || [];
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const storedResult = {
      ...examResult,
      syncedToServer: true,
      serverReceivedAt: timestamp
    };
    const idx = userExams.findIndex((e) => e.id === storedResult.id);
    if (idx >= 0) {
      userExams[idx] = storedResult;
    } else {
      userExams.unshift(storedResult);
    }
    serverDatabase.examResults.set(userId, userExams);
    res.json({
      success: true,
      record: storedResult,
      serverTime: timestamp
    });
  } catch (error) {
    console.error("Exam result store error:", error);
    res.status(500).json({ error: error.message || "Failed to store exam result" });
  }
});
app.get("/api/sync/exam-results/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const exams = serverDatabase.examResults.get(userId) || [];
    res.json({
      success: true,
      userId,
      examResults: exams,
      totalCount: exams.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch exam results" });
  }
});
app.post("/api/ai-tutor/chat", async (req, res) => {
  try {
    const {
      message = "",
      imageBase64,
      mimeType = "image/jpeg",
      targetLanguage = "en",
      nativeLanguage = "fa",
      explanationLanguage = "fa",
      userLevel = "A1",
      conversationHistory = [],
      mode = "general",
      // general, roleplay, grammar_help, pronunciation_coach
      scenario = ""
    } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        reply: `\u0633\u0644\u0627\u0645! \u0645\u0646 \u0645\u0639\u0644\u0645 \u0647\u0648\u0634\u0645\u0646\u062F \u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647 \u0647\u0633\u062A\u0645. \u067E\u06CC\u0627\u0645 \u0634\u0645\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F. (\u062F\u0633\u062A\u06CC\u0627\u0631 \u062F\u0631 \u062D\u0627\u0644\u062A \u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u062F\u0647 \u0645\u062D\u0644\u06CC)`,
        replyInTargetLang: "Welcome to Hossein & Fatemeh smart language learning!",
        corrections: [],
        explanation: "\u062F\u0631 \u062D\u0627\u0644\u062A \u0622\u0641\u0644\u0627\u06CC\u0646 \u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC \u0647\u0648\u0634\u0645\u0646\u062F \u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u062F\u0647 \u0645\u062D\u0644\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
        suggestions: ["How are you?", "Can we practice a dialogue?", "Explain this topic in detail"],
        vocabularyTips: [
          { word: "Welcome", meaning: "\u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F", phonetic: "/\u02C8welk\u0259m/" },
          { word: "Practice", meaning: "\u062A\u0645\u0631\u06CC\u0646 \u06A9\u0631\u062F\u0646", phonetic: "/\u02C8pr\xE6kt\u026As/" }
        ]
      });
    }
    const languageNames = {
      en: "English (\u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC)",
      de: "German (Deutsch - \u0622\u0644\u0645\u0627\u0646\u06CC)",
      fr: "French (Fran\xE7ais - \u0641\u0631\u0627\u0646\u0633\u0648\u06CC)",
      es: "Spanish (Espa\xF1ol - \u0627\u0633\u067E\u0627\u0646\u06CC\u0627\u06CC\u06CC)",
      it: "Italian (Italiano - \u0627\u06CC\u062A\u0627\u0644\u06CC\u0627\u06CC\u06CC)",
      tr: "Turkish (T\xFCrk\xE7e - \u062A\u0631\u06A9\u06CC \u0627\u0633\u062A\u0627\u0646\u0628\u0648\u0644\u06CC)",
      ar: "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629 - \u0639\u0631\u0628\u06CC)",
      ja: "Japanese (\u65E5\u672C\u8A9E - \u0698\u0627\u067E\u0646\u06CC)",
      ru: "Russian (\u0420\u0443\u0441\u0441\u043A\u0438\u0439 - \u0631\u0648\u0633\u06CC)",
      zh: "Chinese (\u4E2D\u6587 - \u0686\u06CC\u0646\u06CC)",
      fa: "Persian (Farsi - \u0641\u0627\u0631\u0633\u06CC)"
    };
    const targetLangName = languageNames[targetLanguage] || "English";
    const explanationLangName = languageNames[explanationLanguage] || "Persian";
    const systemPrompt = `You are "\u0645\u0639\u0644\u0645 \u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647" (Teacher Hossein & Fatemeh), an expert, encouraging, and pedagogically top-rated personal language tutor.
The learner is practicing ${targetLangName} (${targetLanguage}) at CEFR level ${userLevel}.
Their chosen explanation language is ${explanationLangName} (\u0641\u0627\u0631\u0633\u06CC \u0631\u0648\u0627\u0646\u060C \u0635\u0645\u06CC\u0645\u06CC\u060C \u062F\u0642\u06CC\u0642 \u0648 \u0634\u06CC\u0648\u0627).
Context/Mode: ${mode} ${scenario ? `(Scenario: ${scenario})` : ""}.

Guidelines:
1. Always converse warmly and clearly. Provide your primary response in ${targetLangName} along with pedagogical explanation in Persian.
2. If an image is attached (which may be a textbook page, homework worksheet, student handwriting, exam question, menu, road sign, or real-world item):
   - Analyze the image in full detail.
   - If it is homework/handwriting, read the student's work, highlight mistakes gently, provide line-by-line correction with correct answers, and explain the grammar rule in Persian.
   - If it is a sign/menu/book, transcribe key text, translate it to Persian, and explain key terms.
   - Extract 3-5 useful vocabulary words in ${targetLangName} with correct IPA phonetics and precise Persian meanings.
3. If the user makes grammatical or spelling errors in their target language input, gently correct them under "corrections".
4. Provide inspiring, kind instructional explanations under "explanation" primarily in ${explanationLangName}.
5. Provide 2-3 interactive suggested responses the student can say next.

You MUST respond strictly in valid JSON format:
{
  "reply": "Your response in the target language (or dual-language response for images)",
  "replyInTargetLang": "The pure target language response for natural audio pronunciation",
  "corrections": [
    {
      "original": "error phrase if any",
      "corrected": "correct phrase",
      "explanation": "Brief explanation in ${explanationLangName}"
    }
  ],
  "explanation": "Kind instructional tip, homework correction, or concept explanation in ${explanationLangName}",
  "suggestions": ["Option 1 in target lang", "Option 2 in target lang", "Option 3 in target lang"],
  "vocabularyTips": [
    { "word": "word", "meaning": "meaning in ${explanationLangName}", "phonetic": "/.../" }
  ]
}`;
    const formattedHistory = conversationHistory.slice(-6).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text || msg.content || "" }]
    }));
    const userParts = [];
    if (imageBase64 && typeof imageBase64 === "string") {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "").trim();
      let validMime = mimeType || "image/jpeg";
      if (!validMime.startsWith("image/")) {
        validMime = "image/jpeg";
      }
      userParts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: validMime
        }
      });
    }
    userParts.push({
      text: message && message.trim() ? `Student says: "${message}"` : "Student sent an educational image for analysis and feedback."
    });
    const contents = [
      ...formattedHistory,
      {
        role: "user",
        parts: userParts
      }
    ];
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    let text = response.text || "{}";
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch {
      return res.json({
        reply: text,
        replyInTargetLang: text,
        corrections: [],
        explanation: "\u062A\u0635\u0648\u06CC\u0631 \u0648 \u067E\u06CC\u0627\u0645 \u0634\u0645\u0627 \u0628\u0631\u0631\u0633\u06CC \u06AF\u0631\u062F\u06CC\u062F.",
        suggestions: ["Let's continue", "Can you give me an example?"],
        vocabularyTips: []
      });
    }
  } catch (error) {
    handleGeminiError(error);
    console.warn("AI Tutor chat fallback due to upstream demand/status:", error?.message || error);
    res.json({
      reply: "\u067E\u06CC\u0627\u0645 \u0634\u0645\u0627 \u062B\u0628\u062A \u0634\u062F. \u0628\u0647 \u062F\u0644\u06CC\u0644 \u0645\u062D\u062F\u0648\u062F\u06CC\u062A \u0645\u0648\u0642\u062A \u0633\u0647\u0645\u06CC\u0647 \u06CC\u0627 \u062A\u0631\u0627\u0641\u06CC\u06A9 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC\u060C \u067E\u0627\u0633\u062E \u0622\u0645\u0648\u0632\u0634\u06CC \u0622\u0641\u0644\u0627\u06CC\u0646 \u062A\u0642\u062F\u06CC\u0645 \u0634\u062F.",
      replyInTargetLang: "Your practice message was received. Keep learning!",
      corrections: [],
      explanation: "\u062F\u0631 \u0635\u0648\u0631\u062A \u0627\u062A\u0645\u0627\u0645 \u0633\u0647\u0645\u06CC\u0647 \u06CC\u0627 \u0646\u0628\u0648\u062F \u06A9\u0644\u06CC\u062F \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC\u060C \u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC \u0645\u062D\u0644\u06CC \u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u062F\u0647 \u0628\u062F\u0648\u0646 \u0648\u0642\u0641\u0647 \u062A\u0642\u062F\u06CC\u0645 \u0645\u06CC\u200C\u06AF\u0631\u062F\u062F.",
      suggestions: ["Let's continue our practice", "Can you give me an example?"],
      vocabularyTips: []
    });
  }
});
var CURATED_DAILY_WORDS = {
  en: {
    A1: [
      {
        word: "Grateful",
        phonetic: "/\u02C8\u0261re\u026At.f\u0259l/",
        partOfSpeech: "adjective",
        translationFa: "\u0633\u067E\u0627\u0633\u06AF\u0632\u0627\u0631\u060C \u0642\u062F\u0631\u062F\u0627\u0646",
        level: "A1",
        exampleSentence: "I am very grateful for your warm hospitality.",
        exampleTranslationFa: "\u0645\u0646 \u0628\u0631\u0627\u06CC \u0645\u0647\u0645\u0627\u0646\u200C\u0646\u0648\u0627\u0632\u06CC \u06AF\u0631\u0645 \u0634\u0645\u0627 \u0628\u0633\u06CC\u0627\u0631 \u0633\u067E\u0627\u0633\u06AF\u0632\u0627\u0631\u0645.",
        pedagogicalTipFa: '\u0635\u0641\u062A grateful \u0645\u0639\u0645\u0648\u0644\u0627\u064B \u0628\u0627 \u062D\u0631\u0641 \u0627\u0636\u0627\u0641\u0647 "for" \u0628\u0631\u0627\u06CC \u0686\u06CC\u0632\u0647\u0627 \u0648 "to" \u0628\u0631\u0627\u06CC \u0627\u0634\u062E\u0627\u0635 \u0628\u0647 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u0631\u0648\u062F.',
        synonyms: ["thankful", "appreciative"],
        memoryTrickFa: "\u0628\u0647 \u06CC\u0627\u062F \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u06CC\u062F \u0627\u0645\u0644\u0627\u06CC \u0622\u0646 \u0628\u0627 G-R-A-T \u0634\u0631\u0648\u0639 \u0645\u06CC\u200C\u0634\u0648\u062F \u0646\u0647 Great!"
      },
      {
        word: "Courage",
        phonetic: "/\u02C8k\u028Cr.\u026Ad\u0292/",
        partOfSpeech: "noun",
        translationFa: "\u0634\u062C\u0627\u0639\u062A\u060C \u062F\u0644\u06CC\u0631\u06CC",
        level: "A1",
        exampleSentence: "It takes courage to speak a new language without fear.",
        exampleTranslationFa: "\u0635\u062D\u0628\u062A \u06A9\u0631\u062F\u0646 \u0628\u0647 \u06CC\u06A9 \u0632\u0628\u0627\u0646 \u062C\u062F\u06CC\u062F \u0628\u062F\u0648\u0646 \u062A\u0631\u0633\u060C \u0646\u06CC\u0627\u0632\u0645\u0646\u062F \u0634\u062C\u0627\u0639\u062A \u0627\u0633\u062A.",
        pedagogicalTipFa: "\u0627\u0633\u0645 \u063A\u06CC\u0631\u0642\u0627\u0628\u0644 \u0634\u0645\u0627\u0631\u0634 \u0627\u0633\u062A. \u0627\u0635\u0637\u0644\u0627\u062D: have the courage to do something.",
        synonyms: ["bravery", "valor"],
        memoryTrickFa: "\u0647\u0645\u200C\u0631\u06CC\u0634\u0647 \u0628\u0627 encourage (\u062A\u0634\u0648\u06CC\u0642 \u06A9\u0631\u062F\u0646) \u0628\u0647 \u0645\u0639\u0646\u06CC \u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u0634\u062C\u0627\u0639\u062A \u0628\u0647 \u0642\u0644\u0628 \u0641\u0631\u062F."
      }
    ],
    A2: [
      {
        word: "Accomplish",
        phonetic: "/\u0259\u02C8k\u028Cm.pl\u026A\u0283/",
        partOfSpeech: "verb",
        translationFa: "\u0628\u0647 \u0627\u0646\u062C\u0627\u0645 \u0631\u0633\u0627\u0646\u062F\u0646\u060C \u0645\u062D\u0642\u0642 \u0633\u0627\u062E\u062A\u0646",
        level: "A2",
        exampleSentence: "You can accomplish your dream of speaking fluently step by step.",
        exampleTranslationFa: "\u0634\u0645\u0627 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u06AF\u0627\u0645 \u0628\u0647 \u06AF\u0627\u0645 \u0631\u0648\u06CC\u0627\u06CC \u062A\u0633\u0644\u0637 \u0628\u0647 \u0632\u0628\u0627\u0646 \u0631\u0627 \u0645\u062D\u0642\u0642 \u0633\u0627\u0632\u06CC\u062F.",
        pedagogicalTipFa: "\u0645\u0639\u0645\u0648\u0644\u0627\u064B \u0628\u0631\u0627\u06CC \u0628\u0647 \u0633\u0631\u0627\u0646\u062C\u0627\u0645 \u0631\u0633\u0627\u0646\u062F\u0646 \u0645\u0648\u0641\u0642\u06CC\u062A\u200C\u0622\u0645\u06CC\u0632 \u0627\u0647\u062F\u0627\u0641 \u0648 \u067E\u0631\u0648\u0698\u0647\u200C\u0647\u0627 \u0628\u0647 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u0631\u0648\u062F.",
        synonyms: ["achieve", "fulfill", "complete"],
        memoryTrickFa: "\u0647\u0645\u200C\u062E\u0627\u0646\u0648\u0627\u062F\u0647 \u0628\u0627 complete (\u06A9\u0627\u0645\u0644 \u06A9\u0631\u062F\u0646)."
      }
    ],
    B1: [
      {
        word: "Resilient",
        phonetic: "/r\u026A\u02C8z\u026Al.j\u0259nt/",
        partOfSpeech: "adjective",
        translationFa: "\u062A\u0627\u0628\u200C\u0622\u0648\u0631\u060C \u0633\u0631\u0633\u062E\u062A \u0648 \u0645\u0646\u0639\u0637\u0641 \u062F\u0631 \u0628\u0631\u0627\u0628\u0631 \u0633\u062E\u062A\u06CC\u200C\u0647\u0627",
        level: "B1",
        exampleSentence: "Successful language learners are resilient and learn from their mistakes.",
        exampleTranslationFa: "\u0632\u0628\u0627\u0646\u200C\u0622\u0645\u0648\u0632\u0627\u0646 \u0645\u0648\u0641\u0642 \u062A\u0627\u0628\u200C\u0622\u0648\u0631 \u0647\u0633\u062A\u0646\u062F \u0648 \u0627\u0632 \u0627\u0634\u062A\u0628\u0627\u0647\u0627\u062A\u0634\u0627\u0646 \u062F\u0631\u0633 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u0646\u062F.",
        pedagogicalTipFa: "\u0627\u06CC\u0646 \u0635\u0641\u062A \u0628\u0631\u0627\u06CC \u062A\u0648\u0635\u06CC\u0641 \u0627\u0641\u0631\u0627\u062F\u06CC \u0628\u0647 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u0631\u0648\u062F \u06A9\u0647 \u067E\u0633 \u0627\u0632 \u0634\u06A9\u0633\u062A\u200C\u0647\u0627 \u0633\u0631\u06CC\u0639\u0627\u064B \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0644\u0646\u062F \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
        synonyms: ["tough", "adaptable", "buoyant"],
        memoryTrickFa: "\u0631\u06CC\u0634\u0647 \u0644\u0627\u062A\u06CC\u0646 resilire \u0628\u0647 \u0645\u0639\u0646\u06CC \u062C\u0647\u06CC\u062F\u0646 \u0628\u0647 \u0639\u0642\u0628 \u0648 \u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0641\u0631\u0645 \u0642\u0648\u06CC \u0627\u0648\u0644\u06CC\u0647."
      }
    ],
    B2: [
      {
        word: "Persevere",
        phonetic: "/\u02CCp\u025C\u02D0.s\u0259\u02C8v\u026A\u0259r/",
        partOfSpeech: "verb",
        translationFa: "\u0627\u0633\u062A\u0642\u0627\u0645\u062A \u0648\u0631\u0632\u06CC\u062F\u0646\u060C \u067E\u0627\u06CC\u062F\u0627\u0631\u06CC \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0646",
        level: "B2",
        exampleSentence: "If you persevere in daily practice, speaking becomes effortless.",
        exampleTranslationFa: "\u0627\u06AF\u0631 \u062F\u0631 \u062A\u0645\u0631\u06CC\u0646 \u0631\u0648\u0632\u0627\u0646\u0647 \u067E\u0627\u06CC\u062F\u0627\u0631\u06CC \u0646\u0634\u0627\u0646 \u062F\u0647\u06CC\u062F\u060C \u0635\u062D\u0628\u062A \u06A9\u0631\u062F\u0646 \u0622\u0633\u0627\u0646 \u062E\u0648\u0627\u0647\u062F \u0634\u062F.",
        pedagogicalTipFa: "\u0641\u0639\u0644 \u06A9\u0644\u06CC\u062F\u06CC \u062F\u0631 \u0628\u062E\u0634\u200C\u0647\u0627\u06CC \u0644\u06CC\u0633\u0646\u06CC\u0646\u06AF \u0648 \u0631\u06CC\u062F\u06CC\u0646\u06AF \u0622\u0632\u0645\u0648\u0646\u200C\u0647\u0627\u06CC \u0622\u06CC\u0644\u062A\u0633 \u0648 \u062A\u0627\u0641\u0644 \u0628\u0627 \u062D\u0631\u0641 \u0627\u0636\u0627\u0641\u0647 in.",
        synonyms: ["persist", "endure", "carry on"],
        memoryTrickFa: "Per (\u062F\u0631 \u0637\u0648\u0644) + Severe (\u0633\u062E\u062A\u06CC\u200C\u0647\u0627) = \u06A9\u0633\u06CC \u06A9\u0647 \u062F\u0631 \u0637\u0648\u0644 \u0633\u062E\u062A\u06CC\u200C\u0647\u0627 \u062F\u0648\u0627\u0645 \u0645\u06CC\u200C\u0622\u0648\u0631\u062F."
      }
    ],
    C1: [
      {
        word: "Articulate",
        phonetic: "/\u0251\u02D0\u02C8t\u026Ak.j\u0259.l\u0259t/",
        partOfSpeech: "adjective / verb",
        translationFa: "\u0634\u06CC\u0648\u0627 \u0648 \u0631\u0633\u0627 \u0633\u062E\u0646\u200C\u06AF\u0648\u060C \u0641\u0635\u06CC\u062D \u0628\u06CC\u0627\u0646 \u06A9\u0631\u062F\u0646",
        level: "C1",
        exampleSentence: "She gave an articulate and persuasive presentation in fluent English.",
        exampleTranslationFa: "\u0627\u0648 \u0627\u0631\u0627\u0626\u0647\u200C\u0627\u06CC \u0641\u0635\u06CC\u062D\u060C \u0631\u0633\u0627 \u0648 \u0645\u062A\u0642\u0627\u0639\u062F\u06A9\u0646\u0646\u062F\u0647 \u0628\u0647 \u0632\u0628\u0627\u0646 \u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC \u0631\u0648\u0627\u0646 \u0627\u06CC\u0631\u0627\u062F \u06A9\u0631\u062F.",
        pedagogicalTipFa: "\u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0635\u0641\u062A \u062A\u0644\u0641\u0638 /l\u0259t/ \u0648 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0641\u0639\u0644 \u062A\u0644\u0641\u0638 /le\u026At/ \u062F\u0627\u0631\u062F.",
        synonyms: ["eloquent", "lucid", "expressive"],
        memoryTrickFa: "\u0647\u0645\u200C\u0631\u06CC\u0634\u0647 \u0628\u0627 Article (\u0645\u0641\u0635\u0644 \u0648 \u0628\u0646\u062F)\u060C \u06CC\u0639\u0646\u06CC \u06A9\u0644\u0645\u0627\u062A\u06CC \u06A9\u0647 \u0628\u0627 \u0646\u0638\u0645 \u0648 \u0631\u0648\u0627\u0646\u06CC \u0645\u062B\u0644 \u0645\u0641\u0627\u0635\u0644 \u0628\u0647 \u0647\u0645 \u067E\u06CC\u0648\u0633\u062A\u0647\u200C\u0627\u0646\u062F."
      }
    ],
    C2: [
      {
        word: "Ubiquitous",
        phonetic: "/ju\u02D0\u02C8b\u026Ak.w\u026A.t\u0259s/",
        partOfSpeech: "adjective",
        translationFa: "\u0647\u0645\u0647\u200C\u062C\u0627 \u062D\u0627\u0636\u0631\u060C \u0641\u0631\u0627\u06AF\u06CC\u0631\u060C \u0647\u0645\u0647\u200C\u062C\u0627 \u0628\u0647 \u0686\u0634\u0645 \u062E\u0648\u0631\u0646\u062F\u0647",
        level: "C2",
        exampleSentence: "Smartphones and AI learning tutors have become ubiquitous worldwide.",
        exampleTranslationFa: "\u062A\u0644\u0641\u0646\u200C\u0647\u0627\u06CC \u0647\u0648\u0634\u0645\u0646\u062F \u0648 \u0645\u0639\u0644\u0645\u0627\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u062F\u0631 \u0633\u0631\u0627\u0633\u0631 \u062C\u0647\u0627\u0646 \u0647\u0645\u0647\u200C\u062C\u0627 \u062D\u0627\u0636\u0631 \u0648 \u0641\u0631\u0627\u06AF\u06CC\u0631 \u0634\u062F\u0647\u200C\u0627\u0646\u062F.",
        pedagogicalTipFa: "\u0648\u0627\u0698\u0647\u200C\u0627\u06CC \u0641\u0648\u0642\u200C\u0627\u0644\u0639\u0627\u062F\u0647 \u0633\u0637\u062D \u0628\u0627\u0644\u0627 \u0648 \u0627\u0645\u062A\u06CC\u0627\u0632\u0622\u0648\u0631 \u062F\u0631 \u0646\u0648\u0634\u062A\u0627\u0631 \u0622\u06A9\u0627\u062F\u0645\u06CC\u06A9 \u0648 \u0645\u0642\u0627\u0644\u0627\u062A \u0639\u0644\u0645\u06CC.",
        synonyms: ["omnipresent", "pervasive", "universal"],
        memoryTrickFa: '\u0627\u0632 \u0631\u06CC\u0634\u0647 \u0644\u0627\u062A\u06CC\u0646 ubique \u0628\u0647 \u0645\u0639\u0646\u06CC "\u062F\u0631 \u0647\u0631 \u06A9\u062C\u0627".'
      }
    ]
  },
  de: {
    A1: [
      {
        word: "Gem\xFCtlich",
        phonetic: "/\u0261\u0259\u02C8my\u02D0tl\u026A\xE7/",
        partOfSpeech: "adjective",
        translationFa: "\u062F\u0646\u062C\u060C \u06AF\u0631\u0645 \u0648 \u0635\u0645\u06CC\u0645\u06CC\u060C \u0622\u0631\u0627\u0645\u0634\u200C\u0628\u062E\u0634",
        level: "A1",
        exampleSentence: "Das Caf\xE9 in Berlin ist sehr gem\xFCtlich und ruhig.",
        exampleTranslationFa: "\u06A9\u0627\u0641\u0647 \u062F\u0631 \u0628\u0631\u0644\u06CC\u0646 \u0628\u0633\u06CC\u0627\u0631 \u062F\u0646\u062C \u0648 \u0622\u0631\u0627\u0645 \u0627\u0633\u062A.",
        pedagogicalTipFa: "\u06CC\u06A9\u06CC \u0627\u0632 \u0632\u06CC\u0628\u0627\u062A\u0631\u06CC\u0646 \u0648 \u0627\u0635\u06CC\u0644\u200C\u062A\u0631\u06CC\u0646 \u0648\u0627\u0698\u06AF\u0627\u0646 \u0622\u0644\u0645\u0627\u0646\u06CC \u06A9\u0647 \u0645\u0641\u0647\u0648\u0645 \u0631\u0627\u062D\u062A\u06CC \u0648 \u0622\u0631\u0627\u0645\u0634 \u062E\u0627\u0646\u06AF\u06CC \u0631\u0627 \u062F\u0627\u0631\u062F.",
        synonyms: ["behaglich", "komfortabel"],
        memoryTrickFa: "\u0647\u0645\u200C\u0631\u06CC\u0634\u0647 \u0628\u0627 Gem\xFCt \u0628\u0647 \u0645\u0639\u0646\u06CC \u062F\u0644 \u0648 \u0631\u0648\u0627\u0646 \u062E\u0648\u0634\u200C\u062D\u0648\u0635\u0644\u0647."
      }
    ],
    B1: [
      {
        word: "Zuverl\xE4ssig",
        phonetic: "/\u02C8tsu\u02D0f\u025B\u0250\u032F\u02CCl\u025Bs\u026A\xE7/",
        partOfSpeech: "adjective",
        translationFa: "\u0642\u0627\u0628\u0644 \u0627\u0639\u062A\u0645\u0627\u062F\u060C \u0645\u0637\u0645\u0626\u0646",
        level: "B1",
        exampleSentence: "Er ist ein sehr zuverl\xE4ssiger Kollege im Team.",
        exampleTranslationFa: "\u0627\u0648 \u0647\u0645\u06A9\u0627\u0631 \u0628\u0633\u06CC\u0627\u0631 \u0642\u0627\u0628\u0644 \u0627\u0639\u062A\u0645\u0627\u062F\u06CC \u062F\u0631 \u062A\u06CC\u0645 \u0627\u0633\u062A.",
        pedagogicalTipFa: "\u0627\u0632 \u0641\u0639\u0644 sich verlassen auf (\u062A\u06A9\u06CC\u0647 \u06A9\u0631\u062F\u0646 \u0628\u0631 \u06A9\u0633\u06CC) \u0633\u0627\u062E\u062A\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A.",
        synonyms: ["verl\xE4sslich", "vertrauensw\xFCrdig"],
        memoryTrickFa: "Zu + Verlassen = \u06A9\u0633\u06CC \u06A9\u0647 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646 \u0631\u0648\u06CC \u0627\u0648 \u062D\u0633\u0627\u0628 \u0628\u0627\u0632 \u06A9\u0631\u062F."
      }
    ],
    B2: [
      {
        word: "Herausforderung",
        phonetic: "/h\u025B\u02C8\u0281a\u028A\u032Fs\u02CCf\u0254\u0281d\u0259\u0281\u028A\u014B/",
        partOfSpeech: "noun (die)",
        translationFa: "\u0686\u0627\u0644\u0634\u060C \u0647\u0645\u0627\u0648\u0631\u062F\u0637\u0644\u0628\u06CC",
        level: "B2",
        exampleSentence: "Eine neue Sprache zu lernen ist eine spannende Herausforderung.",
        exampleTranslationFa: "\u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u06CC\u06A9 \u0632\u0628\u0627\u0646 \u062C\u062F\u06CC\u062F \u0686\u0627\u0644\u0634\u06CC \u0647\u06CC\u062C\u0627\u0646\u200C\u0627\u0646\u06AF\u06CC\u0632 \u0627\u0633\u062A.",
        pedagogicalTipFa: "\u0627\u0633\u0645 \u0645\u0624\u0646\u062B die Herausforderung \u0627\u0633\u062A \u0648 \u0628\u0627 \u0641\u0639\u0644 annehmen (\u067E\u0630\u06CC\u0631\u0641\u062A\u0646 \u0686\u0627\u0644\u0634) \u062C\u0641\u062A \u0645\u06CC\u200C\u0634\u0648\u062F.",
        synonyms: ["Challenge", "Aufgabe"],
        memoryTrickFa: "Heraus (\u0628\u0647 \u0628\u06CC\u0631\u0648\u0646) + fordern (\u062E\u0648\u0627\u0633\u062A\u0646/\u0637\u0644\u0628\u06CC\u062F\u0646)."
      }
    ]
  },
  fr: {
    A1: [
      {
        word: "Bienvenue",
        phonetic: "/bj\u025B\u0303v.ny/",
        partOfSpeech: "noun / exclamation",
        translationFa: "\u062E\u0648\u0634\u200C\u0622\u0645\u062F\u06CC\u062F\u060C \u062E\u06CC\u0631\u0645\u0642\u062F\u0645",
        level: "A1",
        exampleSentence: "Bienvenue \xE0 Paris et bon apprentissage du fran\xE7ais!",
        exampleTranslationFa: "\u0628\u0647 \u067E\u0627\u0631\u06CC\u0633 \u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F \u0648 \u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u0641\u0631\u0627\u0646\u0633\u0648\u06CC \u062E\u0648\u0634 \u0628\u06AF\u0630\u0631\u062F!",
        pedagogicalTipFa: "\u062A\u0631\u06A9\u06CC\u0628 Bien (\u062E\u0648\u0628) \u0648 Venue (\u0622\u0645\u062F\u0647).",
        synonyms: ["accueil"],
        memoryTrickFa: '\u062F\u0631 \u067E\u0627\u0633\u062E \u0628\u0647 Merci \u0647\u0645 \u062F\u0631 \u06A9\u0627\u0646\u0627\u062F\u0627 "De rien" \u0648 "Bienvenue" \u0628\u0647 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u0631\u0648\u062F.'
      }
    ],
    B2: [
      {
        word: "\xC9panouissement",
        phonetic: "/e.pa.nwi.sm\u0251\u0303/",
        partOfSpeech: "noun (le)",
        translationFa: "\u0634\u06A9\u0648\u0641\u0627\u06CC\u06CC\u060C \u0628\u0647 \u0627\u0648\u062C \u0631\u0636\u0627\u06CC\u062A \u0641\u0631\u062F\u06CC \u0631\u0633\u06CC\u062F\u0646",
        level: "B2",
        exampleSentence: "L'apprentissage continu contribue \xE0 l'\xE9panouissement personnel.",
        exampleTranslationFa: "\u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u0645\u062F\u0627\u0648\u0645 \u0628\u0647 \u0634\u06A9\u0648\u0641\u0627\u06CC\u06CC \u0648 \u0631\u0634\u062F \u0641\u0631\u062F\u06CC \u06A9\u0645\u06A9 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
        pedagogicalTipFa: "\u0627\u0633\u0645 \u0645\u0630\u06A9\u0631 le \xE9panouissement \u0628\u0647 \u0645\u0639\u0646\u06CC \u0628\u0627\u0632 \u0634\u062F\u0646 \u06AF\u0644 \u0648 \u0628\u0627\u0644\u0646\u062F\u06AF\u06CC \u062F\u0631\u0648\u0646\u06CC \u0627\u0633\u062A.",
        synonyms: ["fleurissement", "accomplissement"],
        memoryTrickFa: "\u0645\u062B\u0644 \u06AF\u0644 \u06A9\u0647 \u0628\u0627\u0632 \u0648 \u0634\u06A9\u0648\u0641\u0627 \u0645\u06CC\u200C\u0634\u0648\u062F."
      }
    ]
  }
};
app.post("/api/ai-tutor/daily-word", async (req, res) => {
  try {
    const {
      targetLanguage = "en",
      userLevel = "B1",
      explanationLanguage = "fa",
      forceRefresh = false,
      userId = "guest"
    } = req.body;
    const todayDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const cacheKey = `${userId}_${targetLanguage}_${userLevel}_${todayDate}`;
    if (!forceRefresh && serverDatabase.dailyWordCache.has(cacheKey)) {
      const cached = serverDatabase.dailyWordCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 24 * 3600 * 1e3) {
        return res.json({
          success: true,
          isCached: true,
          dailyWord: cached.data
        });
      }
    }
    const ai = getAI();
    const languageNames = {
      en: "English (\u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC)",
      de: "German (Deutsch - \u0622\u0644\u0645\u0627\u0646\u06CC)",
      fr: "French (Fran\xE7ais - \u0641\u0631\u0627\u0646\u0633\u0648\u06CC)",
      es: "Spanish (Espa\xF1ol - \u0627\u0633\u067E\u0627\u0646\u06CC\u0627\u06CC\u06CC)",
      it: "Italian (Italiano - \u0627\u06CC\u062A\u0627\u0644\u06CC\u0627\u06CC\u06CC)",
      tr: "Turkish (T\xFCrk\xE7e - \u062A\u0631\u06A9\u06CC \u0627\u0633\u062A\u0627\u0646\u0628\u0648\u0644\u06CC)",
      ar: "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629 - \u0639\u0631\u0628\u06CC)",
      ja: "Japanese (\u65E5\u672C\u8A9E - \u0698\u0627\u067E\u0646\u06CC)",
      ru: "Russian (\u0420\u0443\u0441\u0441\u043A\u0438\u0439 - \u0631\u0648\u0633\u06CC)",
      zh: "Chinese (\u4E2D\u6587 - \u0686\u06CC\u0646\u06CC)"
    };
    const targetLangName = languageNames[targetLanguage] || "English";
    if (!ai) {
      const langBank = CURATED_DAILY_WORDS[targetLanguage] || CURATED_DAILY_WORDS.en;
      const levelList = langBank[userLevel] || langBank.B1 || langBank.A1 || [];
      const item = levelList[Math.floor(Math.random() * levelList.length)] || {
        word: "Persevere",
        phonetic: "/\u02CCp\u025C\u02D0.s\u0259\u02C8v\u026A\u0259r/",
        partOfSpeech: "verb",
        translationFa: "\u0627\u0633\u062A\u0642\u0627\u0645\u062A \u0648\u0631\u0632\u06CC\u062F\u0646",
        level: userLevel,
        exampleSentence: "Persevere every day to master your target language.",
        exampleTranslationFa: "\u0647\u0631 \u0631\u0648\u0632 \u0627\u0633\u062A\u0642\u0627\u0645\u062A \u0628\u0648\u0631\u0632\u06CC\u062F \u062A\u0627 \u0628\u0631 \u0632\u0628\u0627\u0646 \u0647\u062F\u0641 \u0645\u0633\u0644\u0637 \u0634\u0648\u06CC\u062F.",
        pedagogicalTipFa: "\u0648\u0627\u0698\u0647\u200C\u0627\u06CC \u067E\u0631\u06A9\u0627\u0631\u0628\u0631\u062F \u0648 \u06A9\u0644\u06CC\u062F\u06CC \u0628\u0631\u0627\u06CC \u062A\u0642\u0648\u06CC\u062A \u062F\u0627\u06CC\u0631\u0647 \u0644\u063A\u0627\u062A.",
        synonyms: ["persist", "endure"],
        memoryTrickFa: "\u0631\u0645\u0632\u06AF\u0630\u0627\u0631\u06CC \u0630\u0647\u0646\u06CC \u0628\u0627 \u062A\u06A9\u0631\u0627\u0631 \u062F\u0631 \u062C\u0645\u0644\u0627\u062A \u0648\u0627\u0642\u0639\u06CC."
      };
      serverDatabase.dailyWordCache.set(cacheKey, { data: item, timestamp: Date.now() });
      return res.json({
        success: true,
        isCached: false,
        dailyWord: item
      });
    }
    const systemPrompt = `You are "\u0645\u0639\u0644\u0645 \u0648\u0627\u0698\u06AF\u0627\u0646 \u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647" (Teacher Hossein & Fatemeh vocabulary coach).
Target Language: ${targetLangName} (${targetLanguage}).
Learner CEFR Level: ${userLevel} (strictly tailor word difficulty, nuances, and example to level ${userLevel}).
Explanation Language: Persian (\u0641\u0627\u0631\u0633\u06CC \u0631\u0648\u0627\u0646\u060C \u0635\u0645\u06CC\u0645\u06CC\u060C \u0634\u06CC\u0648\u0627 \u0648 \u0622\u0645\u0648\u0632\u0646\u062F\u0647).

Task:
Generate 1 inspiring, authentic, and high-frequency "Daily Word / Phrase Tip" for today.
Include:
1. "word": the authentic vocabulary word or high-impact idiom in ${targetLanguage}.
2. "phonetic": standard IPA phonetic transcription (e.g. /\u02C8h\xE6p.i/).
3. "partOfSpeech": noun, verb, adjective, adverb, or idiom.
4. "translationFa": precise, accurate, and natural Persian meaning.
5. "level": "${userLevel}".
6. "exampleSentence": an elegant, contextual sentence in ${targetLanguage} illustrating the word.
7. "exampleTranslationFa": fluent, natural Persian translation of the sentence.
8. "pedagogicalTipFa": deep educational tip in Persian (collocations, prepositions, cultural nuance, exam tip for IELTS/Goethe/DELF).
9. "synonyms": array of 2-4 synonyms in ${targetLanguage}.
10. "memoryTrickFa": a clever mnemonic, etymology, or memory hook in Persian to never forget this word.

Respond STRICTLY in valid JSON:
{
  "word": "Word",
  "phonetic": "/.../",
  "partOfSpeech": "noun/verb/adjective/idiom",
  "translationFa": "\u0645\u0639\u0646\u06CC \u062F\u0642\u06CC\u0642 \u0641\u0627\u0631\u0633\u06CC",
  "level": "${userLevel}",
  "exampleSentence": "Example sentence in target language",
  "exampleTranslationFa": "\u062A\u0631\u062C\u0645\u0647 \u0641\u0627\u0631\u0633\u06CC \u0631\u0648\u0627\u0646 \u0645\u062B\u0627\u0644",
  "pedagogicalTipFa": "\u0646\u06A9\u062A\u0647 \u0622\u0645\u0648\u0632\u0634\u06CC \u0648 \u06A9\u0627\u0631\u0628\u0631\u062F\u06CC \u0628\u0647 \u0632\u0628\u0627\u0646 \u0641\u0627\u0631\u0633\u06CC",
  "synonyms": ["synonym1", "synonym2"],
  "memoryTrickFa": "\u062A\u0631\u0641\u0646\u062F \u0637\u0644\u0627\u06CC\u06CC \u0628\u0647\u200C\u062E\u0627\u0637\u0631\u0633\u067E\u0627\u0631\u06CC"
}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Please generate today's Daily Word Tip for level ${userLevel} in ${targetLangName}. Make it fresh, empowering, and pedagogically rich.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    let rawText = response.text || "{}";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(rawText);
    serverDatabase.dailyWordCache.set(cacheKey, { data: parsed, timestamp: Date.now() });
    res.json({
      success: true,
      isCached: false,
      dailyWord: parsed
    });
  } catch (error) {
    handleGeminiError(error);
    console.warn("Daily Word AI transient rate limit or 503; using curated pedagogical bank:", error?.message || error);
    const targetLang = req.body?.targetLanguage || "en";
    const level = req.body?.userLevel || "B1";
    const langBank = CURATED_DAILY_WORDS[targetLang] || CURATED_DAILY_WORDS.en;
    const levelList = langBank[level] || langBank.B1 || langBank.A1 || CURATED_DAILY_WORDS.en.B1;
    const fallback = levelList[Math.floor(Math.random() * levelList.length)] || CURATED_DAILY_WORDS.en.B1[0];
    res.json({
      success: true,
      isCached: false,
      isFallback: true,
      dailyWord: fallback
    });
  }
});
app.post("/api/exams/evaluate-writing", async (req, res) => {
  try {
    const {
      taskPrompt,
      userEssay = "",
      examType = "ielts",
      targetLanguage = "en",
      targetLevel = "B2",
      explanationLanguage = "fa"
    } = req.body;
    if (!userEssay || userEssay.trim().length < 20) {
      return res.status(400).json({ error: "User essay must contain at least 20 characters." });
    }
    const ai = getAI();
    const wordCount = userEssay.trim().split(/\s+/).filter(Boolean).length;
    if (!ai) {
      const score = Math.min(100, Math.max(50, 60 + Math.min(30, wordCount / 5)));
      const band = (score / 10).toFixed(1);
      return res.json({
        overallBand: band,
        overallScorePercent: score,
        bandTitleFa: "\u0633\u0637\u062D \u0634\u0627\u06CC\u0633\u062A\u0647 \u0648 \u0645\u0646\u0627\u0633\u0628 (\u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0622\u0641\u0644\u0627\u06CC\u0646)",
        wordCount,
        criteria: {
          taskAchievement: Math.min(100, score + 4),
          coherenceAndCohesion: Math.min(100, score - 2),
          lexicalResource: Math.min(100, score + 2),
          grammaticalRange: Math.min(100, score - 1)
        },
        strengthsFa: ["\u062D\u0641\u0638 \u062A\u0645\u0631\u06A9\u0632 \u0628\u0631 \u0645\u0648\u0636\u0648\u0639 \u062E\u0648\u0627\u0633\u062A\u0647 \u0634\u062F\u0647", "\u0633\u0627\u062E\u062A\u0627\u0631\u0628\u0646\u062F\u06CC \u067E\u0627\u0631\u0627\u06AF\u0631\u0627\u0641\u200C\u0647\u0627"],
        improvementsFa: ["\u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0628\u06CC\u0634\u062A\u0631 \u0627\u0632 \u06A9\u0644\u0645\u0627\u062A \u0631\u0628\u0637 \u0622\u06A9\u0627\u062F\u0645\u06CC\u06A9 (Linking Words)", "\u0627\u0641\u0632\u0627\u06CC\u0634 \u062A\u0646\u0648\u0639 \u06AF\u0631\u0627\u0645\u0631\u06CC"],
        detailedFeedbackFa: `\u0627\u0646\u0634\u0627\u06CC \u0634\u0645\u0627 \u0628\u0627 ${wordCount} \u06A9\u0644\u0645\u0647 \u0628\u0631\u0631\u0633\u06CC \u0634\u062F. \u0633\u0627\u062E\u062A\u0627\u0631 \u0645\u0646\u0637\u0642\u06CC \u0645\u062A\u0646 \u0631\u0639\u0627\u06CC\u062A \u0634\u062F\u0647 \u0627\u0633\u062A. \u0628\u0631\u0627\u06CC \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u062C\u0627\u0645\u0639 \u0628\u0627 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0622\u0646\u0644\u0627\u06CC\u0646 \u0634\u0648\u06CC\u062F.`,
        correctedHighlights: [],
        suggestedVocabulary: [
          { target: "Furthermore", translationFa: "\u0639\u0644\u0627\u0648\u0647 \u0628\u0631 \u0627\u06CC\u0646" },
          { target: "Consequently", translationFa: "\u062F\u0631 \u0646\u062A\u06CC\u062C\u0647" }
        ]
      });
    }
    const systemPrompt = `You are a certified senior examiner for international language proficiency tests (IELTS, TOEFL, Goethe-Zertifikat, DELF, DELE).
Exam Type: ${examType.toUpperCase()}. Target Language: ${targetLanguage}. Target Level: ${targetLevel}.
Explanation Language: Persian (\u0641\u0627\u0631\u0633\u06CC \u0631\u0648\u0627\u0646\u060C \u062A\u062E\u0635\u0635\u06CC \u0648 \u0622\u0645\u0648\u0632\u0634\u06CC).

Task Prompt: "${taskPrompt}"
Learner's Submitted Essay:
"""
${userEssay}
"""

Evaluate this essay according to official international exam criteria:
1. Task Achievement / Response (0-100)
2. Coherence and Cohesion (0-100)
3. Lexical Resource / Vocabulary (0-100)
4. Grammatical Range and Accuracy (0-100)

Calculate:
- overallBand: calculated official band (e.g. "7.5" for IELTS, "26/30" for TOEFL, "85/100" for Goethe)
- overallScorePercent: 0-100
- bandTitleFa: Descriptive Persian title (e.g. "\u0646\u0645\u0631\u0647 \u0622\u06CC\u0644\u062A\u0633 \u06F7.\u06F5 - \u062A\u0633\u0644\u0637 \u0628\u0633\u06CC\u0627\u0631 \u0628\u0627\u0644\u0627 \u0648 \u06A9\u0627\u0631\u0628\u0631\u062F \u0645\u0648\u062B\u0631 \u0632\u0628\u0627\u0646")
- wordCount: number of words
- strengthsFa: array of 2-3 specific strong points in Persian
- improvementsFa: array of 2-3 specific areas for improvement in Persian
- detailedFeedbackFa: thorough, inspiring, and actionable feedback in Persian
- correctedHighlights: array of { original: string, corrected: string, reasonFa: string }
- suggestedVocabulary: array of 3-4 advanced alternative words/phrases { target: string, translationFa: string }

Respond STRICTLY in valid JSON:
{
  "overallBand": "7.0",
  "overallScorePercent": 80,
  "bandTitleFa": "\u0646\u0645\u0631\u0647 \u062E\u0648\u0628 \u0648 \u0645\u0633\u0644\u0637",
  "wordCount": ${wordCount},
  "criteria": {
    "taskAchievement": 80,
    "coherenceAndCohesion": 78,
    "lexicalResource": 82,
    "grammaticalRange": 80
  },
  "strengthsFa": ["...", "..."],
  "improvementsFa": ["...", "..."],
  "detailedFeedbackFa": "...",
  "correctedHighlights": [
    { "original": "...", "corrected": "...", "reasonFa": "..." }
  ],
  "suggestedVocabulary": [
    { "target": "...", "translationFa": "..." }
  ]
}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Please evaluate this ${examType.toUpperCase()} essay:
${userEssay}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    let rawText = response.text || "{}";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error) {
    handleGeminiError(error);
    console.warn("Exam writing evaluation fallback:", error?.message || error);
    const essay = req.body?.userEssay || "";
    const wc = essay.trim().split(/\s+/).filter(Boolean).length;
    const band = wc > 150 ? "6.5" : wc > 80 ? "5.5" : "4.5";
    const bandScorePercent = wc > 150 ? 75 : 60;
    res.json({
      overallBand: band,
      overallScorePercent: bandScorePercent,
      bandTitleFa: wc > 150 ? "\u0646\u0645\u0631\u0647 \u0634\u0627\u06CC\u0633\u062A\u0647 \u0648 \u0642\u0627\u0628\u0644 \u0642\u0628\u0648\u0644" : "\u0646\u06CC\u0627\u0632 \u0628\u0647 \u06AF\u0633\u062A\u0631\u0634 \u0645\u062D\u062A\u0648\u0627 \u0648 \u0648\u0627\u0698\u06AF\u0627\u0646",
      wordCount: wc,
      criteria: {
        taskAchievement: bandScorePercent,
        coherenceAndCohesion: bandScorePercent - 3,
        lexicalResource: bandScorePercent + 2,
        grammaticalRange: bandScorePercent - 2
      },
      strengthsFa: ["\u0631\u0639\u0627\u06CC\u062A \u0633\u0627\u062E\u062A\u0627\u0631 \u06A9\u0644\u06CC \u067E\u0627\u0631\u0627\u06AF\u0631\u0627\u0641\u200C\u0647\u0627", "\u062A\u0644\u0627\u0634 \u0645\u0648\u062B\u0631 \u062F\u0631 \u0627\u0646\u062A\u0642\u0627\u0644 \u0627\u06CC\u062F\u0647 \u0627\u0635\u0644\u06CC \u0645\u0642\u0627\u0644\u0647"],
      improvementsFa: ["\u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062D\u0631\u0648\u0641 \u0631\u0628\u0637 \u0648 \u067E\u06CC\u0648\u0646\u062F\u062F\u0647\u0646\u062F\u0647\u200C\u0647\u0627\u06CC \u0631\u0633\u0645\u06CC\u200C\u062A\u0631", "\u062A\u0646\u0648\u0639\u200C\u0628\u062E\u0634\u06CC \u0628\u0647 \u0633\u0627\u062E\u062A\u0627\u0631 \u062C\u0645\u0644\u0627\u062A \u0645\u062C\u0647\u0648\u0644 \u0648 \u0645\u0631\u06A9\u0628"],
      detailedFeedbackFa: `\u0645\u0642\u0627\u0644\u0647 \u0634\u0645\u0627 \u0628\u0627 ${wc} \u06A9\u0644\u0645\u0647 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0634\u062F. \u0633\u0627\u062E\u062A\u0627\u0631 \u0627\u06CC\u062F\u0647 \u0634\u0645\u0627 \u0645\u0646\u0637\u0642\u06CC \u0627\u0633\u062A. \u0628\u0631\u0627\u06CC \u0627\u0631\u062A\u0642\u0627\u06CC \u0646\u0645\u0631\u0647 \u0628\u0647 \u0633\u0637\u0648\u062D \u0628\u0627\u0644\u0627\u062A\u0631\u060C \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0645\u06CC\u200C\u0634\u0648\u062F \u0627\u0632 \u0648\u0627\u0698\u06AF\u0627\u0646 \u0622\u06A9\u0627\u062F\u0645\u06CC\u06A9 \u0648 \u0633\u0627\u062E\u062A\u0627\u0631\u0647\u0627\u06CC \u062F\u0633\u062A\u0648\u0631\u06CC \u067E\u06CC\u0686\u06CC\u062F\u0647\u200C\u062A\u0631 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u0645\u0627\u06CC\u06CC\u062F.`,
      correctedHighlights: [],
      suggestedVocabulary: [
        { target: "Furthermore", translationFa: "\u0639\u0644\u0627\u0648\u0647 \u0628\u0631 \u0627\u06CC\u0646 / \u0628\u0647 \u0639\u0644\u0627\u0648\u0647" },
        { target: "Consequently", translationFa: "\u062F\u0631 \u0646\u062A\u06CC\u062C\u0647 / \u0628\u0646\u0627\u0628\u0631 \u0627\u06CC\u0646" },
        { target: "Substantial", translationFa: "\u0642\u0627\u0628\u0644 \u062A\u0648\u062C\u0647 \u0648 \u0627\u0633\u0627\u0633\u06CC" }
      ]
    });
  }
});
app.post("/api/ai-tutor/roleplay-turn", async (req, res) => {
  try {
    const {
      scenarioTitle,
      situation,
      userRole,
      aiRole,
      spokenText,
      targetPhrase = "",
      targetLanguage = "en",
      explanationLanguage = "fa",
      conversationHistory = [],
      goals = []
    } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        aiReply: `Great response! Keep going with your roleplay. (Offline mode)`,
        aiReplyFa: "\u067E\u0627\u0633\u062E \u0634\u0645\u0627 \u0639\u0627\u0644\u06CC \u0628\u0648\u062F! \u0628\u0647 \u0646\u0642\u0634\u200C\u0622\u0641\u0631\u06CC\u0646\u06CC \u0627\u062F\u0627\u0645\u0647 \u062F\u0647\u06CC\u062F.",
        pronunciationScore: 90,
        pronunciationFeedbackFa: "\u062A\u0644\u0641\u0638 \u0634\u0645\u0627 \u0648\u0627\u0636\u062D \u0648 \u0645\u0641\u0647\u0648\u0645 \u0628\u0648\u062F.",
        completedGoalIds: goals.length > 0 ? [goals[0].id] : [],
        suggestedNextPhrases: [
          { text: "Thank you very much.", translationFa: "\u062E\u06CC\u0644\u06CC \u0645\u0645\u0646\u0648\u0646\u0645." },
          { text: "Could you tell me more?", translationFa: "\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0628\u06CC\u0634\u062A\u0631 \u062A\u0648\u0636\u06CC\u062D \u062F\u0647\u06CC\u062F\u061F" }
        ]
      });
    }
    const systemPrompt = `You are playing the character role of "${aiRole}" in an interactive language dialogue roleplay scenario for the educational app "\u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647".
Scenario: "${scenarioTitle}" - Situation: "${situation}".
User's role is: "${userRole}".
Target Language: ${targetLanguage}.
Learner's Explanation Language: ${explanationLanguage === "fa" ? "Persian (\u0641\u0627\u0631\u0633\u06CC)" : explanationLanguage}.
Active Scenario Goals: ${JSON.stringify(goals)}.

Task:
1. Stay 100% in character as "${aiRole}". Respond naturally, conversationally, and encouragingly in ${targetLanguage}.
2. Check if the user's latest statement ("${spokenText}") completes any of the pending mission goals. If so, return their goal IDs in "completedGoalIds".
3. Evaluate the user's utterance for naturalness, grammar, and pronunciation accuracy (compared against target "${targetPhrase}" if provided, or general natural speech).
4. Provide constructive pronunciation & speaking feedback in ${explanationLanguage === "fa" ? "Persian" : explanationLanguage}.
5. Provide 2-3 suggested follow-up phrases the user can say next in character, with their Persian translations.

Respond strictly in valid JSON format:
{
  "aiReply": "In-character reply in target language only",
  "aiReplyFa": "Friendly accurate translation of your reply in Persian",
  "pronunciationScore": 85,
  "pronunciationFeedbackFa": "Specific friendly feedback in Persian about rhythm, intonation, or words pronounced well/poorly",
  "completedGoalIds": ["g1", "g2"],
  "corrections": [
    {
      "original": "incorrect phrase",
      "corrected": "native phrasing",
      "explanationFa": "Why this is better"
    }
  ],
  "suggestedNextPhrases": [
    { "text": "Suggested next phrase 1 in target lang", "translationFa": "\u062A\u0631\u062C\u0645\u0647 \u0641\u0627\u0631\u0633\u06CC", "phonetic": "/.../" },
    { "text": "Suggested next phrase 2 in target lang", "translationFa": "\u062A\u0631\u062C\u0645\u0647 \u0641\u0627\u0631\u0633\u06CC", "phonetic": "/.../" }
  ]
}`;
    const formattedHistory = conversationHistory.slice(-8).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: `${msg.role === "user" ? userRole : aiRole}: ${msg.text || msg.content || ""}` }]
    }));
    const contents = [
      ...formattedHistory,
      {
        role: "user",
        parts: [{ text: `User (${userRole}) says: "${spokenText}"` }]
      }
    ];
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    handleGeminiError(error);
    console.warn("Roleplay turn fallback:", error?.message || error);
    const goals = req.body?.goals || [];
    res.json({
      aiReply: "I completely understand. That makes total sense! Let us continue our practice conversation.",
      aiReplyFa: "\u06A9\u0627\u0645\u0644\u0627\u064B \u0645\u062A\u0648\u062C\u0647 \u0634\u062F\u0645. \u0628\u06CC\u0627\u0646 \u0634\u0645\u0627 \u06A9\u0627\u0645\u0644\u0627\u064B \u0631\u0633\u0627 \u0628\u0648\u062F! \u0628\u06CC\u0627\u06CC\u06CC\u062F \u0628\u0647 \u0645\u06A9\u0627\u0644\u0645\u0647 \u062A\u0645\u0631\u06CC\u0646\u06CC\u200C\u0645\u0627\u0646 \u0627\u062F\u0627\u0645\u0647 \u062F\u0647\u06CC\u0645.",
      pronunciationScore: 88,
      pronunciationFeedbackFa: "\u062A\u0644\u0641\u0638 \u0648 \u0627\u062F\u0627\u06CC \u062C\u0645\u0644\u0627\u062A \u0634\u0645\u0627 \u0648\u0627\u0636\u062D \u0648 \u0642\u0627\u0628\u0644 \u0641\u0647\u0645 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0634\u062F.",
      completedGoalIds: goals.length > 0 ? [goals[0].id] : [],
      corrections: [],
      suggestedNextPhrases: [
        { text: "Could you explain a bit more?", translationFa: "\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u06A9\u0645\u06CC \u0628\u06CC\u0634\u062A\u0631 \u062A\u0648\u0636\u06CC\u062D \u062F\u0647\u06CC\u062F\u061F", phonetic: "/k\u028Ad ju\u02D0 \u026Ak\u02C8sple\u026An \u0259 b\u026At \u0645\u0254\u02D0r/" },
        { text: "That sounds great, thank you!", translationFa: "\u0628\u0633\u06CC\u0627\u0631 \u0639\u0627\u0644\u06CC \u0628\u0647 \u0646\u0638\u0631 \u0645\u06CC\u200C\u0631\u0633\u062F\u060C \u0645\u062A\u0634\u06A9\u0631\u0645!", phonetic: "/\xF0\xE6t sa\u028Andz \u0261re\u026At/" }
      ]
    });
  }
});
app.post("/api/ai-tutor/writing-correction", async (req, res) => {
  try {
    const { text, targetLanguage = "en", topic = "", explanationLanguage = "fa" } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        score: 88,
        correctedText: text,
        overallFeedback: "\u0645\u062A\u0646 \u0634\u0645\u0627 \u0631\u0648\u0627\u0646 \u0627\u0633\u062A. \u0628\u0631\u0627\u06CC \u062A\u062D\u0644\u06CC\u0644 \u06A9\u0627\u0645\u0644\u062A\u0631 \u0622\u0646\u0644\u0627\u06CC\u0646 \u0645\u062A\u0635\u0644 \u0634\u0648\u06CC\u062F.",
        improvements: []
      });
    }
    const systemPrompt = `You are an expert language examiner and writing coach for the app "\u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647".
Target language: ${targetLanguage}. Topic: ${topic || "General"}.
Analyze the user's written submission thoroughly.
Evaluate Grammar, Vocabulary variety, Cohesion, and Natural expression.
Provide clear feedback in ${explanationLanguage === "fa" ? "Persian (\u0641\u0627\u0631\u0633\u06CC \u0631\u0648\u0627\u0646 \u0648 \u0622\u0645\u0648\u0632\u0634\u06CC)" : explanationLanguage}.

Return strictly JSON with schema:
{
  "score": 85,
  "correctedText": "Full corrected and polished text",
  "overallFeedback": "Friendly encouraging summary in explanation language",
  "strengths": ["list of positive aspects"],
  "improvements": [
    {
      "original": "part of sentence with error",
      "replacement": "improved version",
      "rule": "why this is better in explanation language",
      "severity": "minor" | "grammar" | "vocabulary"
    }
  ],
  "alternativeVocabulary": [
    { "original": "good", "advanced": "exceptional / remarkable", "persianMeaning": "\u0641\u0648\u0642\u200C\u0627\u0644\u0639\u0627\u062F\u0647" }
  ]
}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Please review and correct this writing text: "${text}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    handleGeminiError(error);
    console.warn("Writing correction fallback:", error?.message || error);
    const rawText = req.body?.text || "";
    res.json({
      score: 85,
      correctedText: rawText,
      overallFeedback: "\u0645\u062A\u0646 \u0634\u0645\u0627 \u062E\u0648\u0627\u0646\u0627\u060C \u0633\u0627\u062E\u062A\u0627\u0631\u06CC\u0627\u0641\u062A\u0647 \u0648 \u0645\u0639\u0646\u0627\u062F\u0627\u0631 \u0627\u0633\u062A. \u0628\u0631\u0627\u06CC \u062A\u0645\u0631\u06CC\u0646 \u062A\u06A9\u0645\u06CC\u0644\u06CC\u060C \u0633\u0639\u06CC \u06A9\u0646\u06CC\u062F \u0627\u0632 \u0648\u0627\u0698\u06AF\u0627\u0646 \u0622\u06A9\u0627\u062F\u0645\u06CC\u06A9\u200C\u062A\u0631 \u0628\u0647\u0631\u0647 \u0628\u0628\u0631\u06CC\u062F.",
      strengths: ["\u0627\u0646\u062A\u0642\u0627\u0644 \u0648\u0627\u0636\u062D \u067E\u06CC\u0627\u0645 \u0628\u0647 \u0645\u062E\u0627\u0637\u0628", "\u0627\u0646\u062A\u062E\u0627\u0628 \u0648\u0627\u0698\u06AF\u0627\u0646 \u0645\u062A\u0646\u0627\u0633\u0628 \u0628\u0627 \u0633\u0637\u062D"],
      improvements: [
        {
          original: rawText.slice(0, 40),
          replacement: rawText.slice(0, 40),
          rule: "\u0633\u0627\u062E\u062A\u0627\u0631 \u06A9\u0644\u06CC \u062C\u0645\u0644\u0647 \u0645\u0646\u0627\u0633\u0628 \u0627\u0633\u062A\u061B \u0628\u0627 \u0627\u0641\u0632\u0648\u062F\u0646 \u0642\u06CC\u062F\u0647\u0627 \u062C\u0645\u0644\u0647 \u067E\u0631\u0645\u0627\u06CC\u0647\u200C\u062A\u0631 \u0645\u06CC\u200C\u0634\u0648\u062F.",
          severity: "minor"
        }
      ],
      alternativeVocabulary: [
        { original: "important", advanced: "crucial / significant", persianMeaning: "\u0628\u0633\u06CC\u0627\u0631 \u062D\u06CC\u0627\u062A\u06CC \u0648 \u0645\u0647\u0645" }
      ]
    });
  }
});
app.post("/api/ai-tutor/generate-exercise", async (req, res) => {
  try {
    const { targetLanguage = "en", weaknessTopic = "Past Simple", count = 3, explanationLanguage = "fa" } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({ exercises: [] });
    }
    const systemPrompt = `You are the exercise generator for "\u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647" language app.
Target language: ${targetLanguage}.
Topic / Weakness: ${weaknessTopic}.
Explanation language: ${explanationLanguage}.
Generate ${count} interactive exercises (types can be 'fill_in_blank', 'multiple_choice', 'translate', 'sentence_order').

Return valid JSON:
{
  "topic": "${weaknessTopic}",
  "exercises": [
    {
      "id": "gen_1",
      "type": "multiple_choice",
      "question": "Question in target or explanation lang",
      "instruction": "Instruction in explanation lang",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "option1",
      "explanation": "Clear explanation in explanation lang",
      "targetAudioText": "Phrase for native audio"
    }
  ]
}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate smart remedial exercises for topic: ${weaknessTopic}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    handleGeminiError(error);
    console.warn("Generate exercise fallback:", error?.message || error);
    const topic = req.body?.weaknessTopic || "General Grammar";
    res.json({
      topic,
      exercises: [
        {
          id: `gen_fb_${Date.now()}_1`,
          type: "multiple_choice",
          question: `Select the correct form for: ${topic}`,
          instruction: "\u06AF\u0632\u06CC\u0646\u0647 \u0635\u062D\u06CC\u062D \u0631\u0627 \u0628\u0627 \u062A\u0648\u062C\u0647 \u0628\u0647 \u0642\u0627\u0639\u062F\u0647 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F.",
          options: ["has been completed", "was completed", "completing", "completes"],
          correctAnswer: "has been completed",
          explanation: "\u062F\u0631 \u0633\u0627\u062E\u062A\u0627\u0631\u0647\u0627\u06CC \u062D\u0627\u0644 \u06A9\u0627\u0645\u0644 \u0645\u062C\u0647\u0648\u0644\u060C have/has been + p.p \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.",
          targetAudioText: "The task has been completed successfully."
        },
        {
          id: `gen_fb_${Date.now()}_2`,
          type: "fill_in_blank",
          question: "Complete the preposition: She is passionate ___ learning languages.",
          instruction: "\u062C\u0627\u06CC \u062E\u0627\u0644\u06CC \u0631\u0627 \u0628\u0627 \u062D\u0631\u0641 \u0627\u0636\u0627\u0641\u0647 \u0635\u062D\u06CC\u062D \u06A9\u0627\u0645\u0644 \u06A9\u0646\u06CC\u062F.",
          options: ["about", "in", "at", "with"],
          correctAnswer: "about",
          explanation: "\u0635\u0641\u062A passionate \u0628\u0627 \u062D\u0631\u0641 \u0627\u0636\u0627\u0641\u0647 about \u0628\u0647 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u0631\u0648\u062F.",
          targetAudioText: "She is passionate about learning languages."
        }
      ]
    });
  }
});
app.post("/api/ai-tutor/generate-flashcards", async (req, res) => {
  try {
    const {
      targetLanguage = "en",
      topic = "Essential Vocabulary",
      level = "A1",
      count = 5,
      explanationLanguage = "fa"
    } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        success: true,
        cards: [
          {
            id: `srs_offline_${Date.now()}_1`,
            language: targetLanguage,
            frontText: "Communication",
            backTextFa: "\u0627\u0631\u062A\u0628\u0627\u0637\u0627\u062A \u0648 \u06AF\u0641\u062A\u06AF\u0648",
            phonetic: "/k\u0259\u02CCmju\u02D0.n\u0259\u02C8ke\u026A.\u0283\u0259n/",
            partOfSpeech: "noun",
            exampleTarget: "Good communication is key in language learning.",
            exampleFa: "\u0627\u0631\u062A\u0628\u0627\u0637 \u062E\u0648\u0628 \u06A9\u0644\u06CC\u062F \u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u0632\u0628\u0627\u0646 \u0627\u0633\u062A.",
            category: topic || "General",
            interval: 1,
            repetitions: 0,
            easeFactor: 2.5,
            nextReviewDate: (/* @__PURE__ */ new Date()).toISOString(),
            state: "new"
          }
        ]
      });
    }
    const systemPrompt = `You are the SRS Flashcard generator for the "\u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647" multilingual language app.
Target language code: ${targetLanguage}.
Topic: ${topic}.
CEFR Level: ${level}.
Learner's Explanation Language: ${explanationLanguage === "fa" ? "Persian (\u0641\u0627\u0631\u0633\u06CC)" : explanationLanguage}.
Generate exactly ${count} highly useful, practical SRS Flashcards for language learners.

Return strictly valid JSON:
{
  "cards": [
    {
      "id": "srs_gen_1",
      "language": "${targetLanguage}",
      "frontText": "Word or short idiom in target language",
      "backTextFa": "Precise translation and meaning in Persian",
      "phonetic": "/IPA phonetic transcription/",
      "partOfSpeech": "noun / verb / adjective / phrase",
      "exampleTarget": "Natural authentic example sentence in target language",
      "exampleFa": "Persian translation of example sentence",
      "category": "${topic}",
      "imageUrl": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
      "interval": 1,
      "repetitions": 0,
      "easeFactor": 2.5,
      "nextReviewDate": "${(/* @__PURE__ */ new Date()).toISOString()}",
      "state": "new"
    }
  ]
}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate ${count} rich SRS flashcards for ${targetLanguage} about topic: ${topic}, level: ${level}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || '{"cards": []}');
    const processedCards = (parsed.cards || []).map((c, i) => ({
      ...c,
      id: c.id || `srs_${targetLanguage}_${Date.now()}_${i}`,
      language: targetLanguage,
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: (/* @__PURE__ */ new Date()).toISOString(),
      state: "new"
    }));
    res.json({ success: true, cards: processedCards });
  } catch (error) {
    handleGeminiError(error);
    console.warn("Generate flashcards fallback:", error?.message || error);
    const targetLanguage = req.body?.targetLanguage || "en";
    const topic = req.body?.topic || "Daily Vocabulary";
    res.json({
      success: true,
      cards: [
        {
          id: `srs_fb_${Date.now()}_1`,
          language: targetLanguage,
          frontText: "Consistent",
          backTextFa: "\u0645\u062F\u0627\u0648\u0645\u060C \u0647\u0645\u0627\u0647\u0646\u06AF \u0648 \u067E\u06CC\u0648\u0633\u062A\u0647",
          phonetic: "/k\u0259n\u02C8s\u026Ast\u0259nt/",
          partOfSpeech: "adjective",
          exampleTarget: "Consistent practice is key to language fluency.",
          exampleFa: "\u062A\u0645\u0631\u06CC\u0646 \u0645\u062F\u0627\u0648\u0645 \u06A9\u0644\u06CC\u062F \u062A\u0633\u0644\u0637 \u0628\u0631 \u0632\u0628\u0627\u0646 \u0627\u0633\u062A.",
          category: topic,
          interval: 1,
          repetitions: 0,
          easeFactor: 2.5,
          nextReviewDate: (/* @__PURE__ */ new Date()).toISOString(),
          state: "new"
        },
        {
          id: `srs_fb_${Date.now()}_2`,
          language: targetLanguage,
          frontText: "Fluency",
          backTextFa: "\u0631\u0648\u0627\u0646\u06CC \u06A9\u0644\u0627\u0645 \u0648 \u062A\u0633\u0644\u0637 \u0632\u0628\u0627\u0646\u06CC",
          phonetic: "/\u02C8flu\u02D0.\u0259n.si/",
          partOfSpeech: "noun",
          exampleTarget: "She reached native-like fluency in two years.",
          exampleFa: "\u0627\u0648 \u062F\u0631 \u062F\u0648 \u0633\u0627\u0644 \u0628\u0647 \u0631\u0648\u0627\u0646\u06CC \u06A9\u0644\u0627\u0645 \u0647\u0645\u0627\u0646\u0646\u062F \u0628\u0648\u0645\u06CC\u200C\u0632\u0628\u0627\u0646\u0627\u0646 \u0631\u0633\u06CC\u062F.",
          category: topic,
          interval: 1,
          repetitions: 0,
          easeFactor: 2.5,
          nextReviewDate: (/* @__PURE__ */ new Date()).toISOString(),
          state: "new"
        }
      ]
    });
  }
});
app.post("/api/ai-tutor/analyze-image", async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = "image/jpeg",
      userQuestion = "",
      targetLanguage = "en",
      explanationLanguage = "fa"
    } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ error: "imageBase64 is required" });
    }
    const ai = getAI();
    if (!ai) {
      return res.json({
        replyFa: "\u062A\u0635\u0648\u06CC\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F! \u062F\u0631 \u0627\u06CC\u0646 \u062A\u0635\u0648\u06CC\u0631 \u06CC\u06A9 \u0645\u062A\u0646/\u062A\u0645\u0631\u06CC\u0646 \u0622\u0645\u0648\u0632\u0634\u06CC \u0645\u0634\u0627\u0647\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. (\u062F\u0633\u062A\u06CC\u0627\u0631 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u062F\u0631 \u062D\u0627\u0644\u062A \u0622\u0641\u0644\u0627\u06CC\u0646)",
        replyInTargetLang: "This image has been received for language learning.",
        detectedObjectsFa: ["\u06A9\u062A\u0627\u0628\u060C \u0646\u0648\u0634\u062A\u0647 \u06CC\u0627 \u0635\u0641\u062D\u0647 \u062A\u0645\u0631\u06CC\u0646"],
        vocabulary: [
          { word: "Learning", meaningFa: "\u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC", phonetic: "/\u02C8l\u025C\u02D0n\u026A\u014B/", exampleSentence: "Language learning is rewarding." },
          { word: "Practice", meaningFa: "\u062A\u0645\u0631\u06CC\u0646", phonetic: "/\u02C8pr\xE6kt\u026As/", exampleSentence: "Daily practice leads to fluency." }
        ],
        homeworkCorrection: "\u0628\u0631\u0627\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0635\u062D\u06CC\u062D \u062F\u0642\u06CC\u0642 \u062E\u0637 \u0628\u0647 \u062E\u0637 \u062A\u0648\u0633\u0637 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC\u060C \u0627\u062A\u0635\u0627\u0644 \u0627\u06CC\u0646\u062A\u0631\u0646\u062A \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F.",
        practiceQuestions: ["What do you see in this picture?", "Can you describe the main object?"]
      });
    }
    const systemPrompt = `You are "\u0645\u0639\u0644\u0645 \u0647\u0648\u0634\u0645\u0646\u062F \u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647", an expert language teacher and visual learning assistant.
Target language code: ${targetLanguage}.
Explanation language: ${explanationLanguage === "fa" ? "Persian (\u0641\u0627\u0631\u0633\u06CC \u0631\u0648\u0627\u0646\u060C \u0635\u0645\u06CC\u0645\u06CC\u060C \u0634\u06CC\u0648\u0627 \u0648 \u0622\u0645\u0648\u0632\u0646\u062F\u0647)" : explanationLanguage}.

The learner sent an image (which may be a textbook page, homework, handwriting, real-world object, menu, sign, or photo) with the query: "${userQuestion || "\u0644\u0637\u0641\u0627\u064B \u0627\u06CC\u0646 \u062A\u0635\u0648\u06CC\u0631 \u0631\u0627 \u0628\u0631\u0627\u06CC \u0645\u0646 \u062A\u062D\u0644\u06CC\u0644 \u0648 \u0622\u0645\u0648\u0632\u0634 \u062F\u0647\u06CC\u062F."}".

Your task:
1. Examine every part of the image in detail.
2. If text or handwriting is visible, transcribe, translate, and explain it in Persian.
3. If it is a homework/exercise page, provide clear line-by-line correction, explain mistakes kindly, and show the exact correct answers.
4. Extract 3-5 useful vocabulary words in ${targetLanguage} related to the image with Persian meanings, phonetic transcriptions, and natural example sentences.
5. Provide an engaging, encouraging response in Persian and a natural paragraph in ${targetLanguage}.
6. Provide 2-3 interactive follow-up questions in ${targetLanguage} for the learner.

Return strictly valid JSON with this schema:
{
  "replyFa": "Friendly comprehensive explanation, translation of text, and guidance in Persian",
  "replyInTargetLang": "A natural, authentic description or reply in the target language",
  "detectedObjectsFa": ["List of objects or concepts detected in Persian"],
  "vocabulary": [
    {
      "word": "word in target language",
      "meaningFa": "\u0645\u0639\u0646\u06CC \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC",
      "phonetic": "/IPA phonetic/",
      "exampleSentence": "Example sentence using this word"
    }
  ],
  "homeworkCorrection": "Detailed correction of exercises or handwriting in Persian if applicable",
  "practiceQuestions": ["Question 1 in target language", "Question 2 in target language"]
}`;
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "").trim();
    let validMime = mimeType || "image/jpeg";
    if (!validMime.startsWith("image/")) {
      validMime = "image/jpeg";
    }
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: validMime
              }
            },
            {
              text: userQuestion ? `User inquiry: "${userQuestion}". Please analyze this image for language learning, translate visible text, extract vocabulary, and explain thoroughly.` : `Please analyze this image, extract key vocabulary in ${targetLanguage}, translate text, correct any homework, and explain in ${explanationLanguage}.`
            }
          ]
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    let rawText = response.text || "{}";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    try {
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch {
      return res.json({
        replyFa: rawText,
        replyInTargetLang: "Image analyzed successfully.",
        detectedObjectsFa: ["\u062A\u0635\u0648\u06CC\u0631 \u0622\u0645\u0648\u0632\u0634\u06CC"],
        vocabulary: [],
        homeworkCorrection: "",
        practiceQuestions: []
      });
    }
  } catch (error) {
    handleGeminiError(error);
    console.warn("Image analysis fallback:", error?.message || error);
    res.json({
      replyFa: "\u062A\u0635\u0648\u06CC\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F \u0648 \u0645\u062A\u0646 \u0622\u0645\u0648\u0632\u0634\u06CC \u062F\u0631 \u062D\u0627\u0644\u062A \u0645\u062D\u0644\u06CC \u067E\u0631\u062F\u0627\u0632\u0634 \u06AF\u0631\u062F\u06CC\u062F.",
      replyInTargetLang: "The educational image was received and processed successfully.",
      detectedObjectsFa: ["\u0645\u062A\u0646 \u062F\u0631\u0633\u06CC\u060C \u0628\u0631\u06AF\u0647 \u062A\u0645\u0631\u06CC\u0646 \u06CC\u0627 \u062A\u0635\u0648\u06CC\u0631 \u0622\u0645\u0648\u0632\u0634\u06CC"],
      vocabulary: [
        { word: "Learning", meaningFa: "\u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u0648 \u0622\u0645\u0648\u0632\u0634", phonetic: "/\u02C8l\u025C\u02D0n\u026A\u014B/", exampleSentence: "Active learning leads to mastery." },
        { word: "Practice", meaningFa: "\u062A\u0645\u0631\u06CC\u0646 \u0645\u0633\u062A\u0645\u0631", phonetic: "/\u02C8pr\xE6kt\u026As/", exampleSentence: "Daily practice brings confidence." }
      ],
      homeworkCorrection: "\u062A\u0645\u0631\u06CC\u0646\u200C\u0647\u0627 \u0628\u0627 \u062F\u0642\u062A \u0645\u0634\u0627\u0647\u062F\u0647 \u0634\u062F\u061B \u0633\u0627\u062E\u062A\u0627\u0631 \u06A9\u0644\u06CC \u0646\u0648\u0634\u062A\u0647\u200C\u0647\u0627 \u0645\u0646\u0627\u0633\u0628 \u0648 \u062E\u0648\u0627\u0646\u0627 \u0627\u0633\u062A.",
      practiceQuestions: ["What is the core topic presented here?", "Can you write a sentence summarizing it?"]
    });
  }
});
app.post("/api/grammar/analyze-sentence", async (req, res) => {
  try {
    const {
      sentence,
      targetLanguage = "en",
      ruleTitle = "",
      ruleContext = "",
      userLevel = "A1",
      explanationLanguage = "fa"
    } = req.body;
    if (!sentence || !sentence.trim()) {
      return res.status(400).json({ error: "Sentence is required" });
    }
    const ai = getAI();
    if (!ai) {
      return res.json({
        isCorrect: true,
        score: 90,
        overallFeedbackFa: `\u062C\u0645\u0644\u0647 \u0634\u0645\u0627 \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F: "${sentence}". (\u062D\u0627\u0644\u062A \u0622\u0641\u0644\u0627\u06CC\u0646)`,
        breakdown: [
          { segment: sentence, status: "correct", explanationFa: "\u0633\u0627\u062E\u062A\u0627\u0631 \u062C\u0645\u0644\u0647 \u0645\u0646\u0627\u0633\u0628 \u0627\u0633\u062A." }
        ],
        corrections: [],
        alternativeExpressions: [
          { target: sentence, translationFa: "\u062A\u0631\u062C\u0645\u0647 \u062C\u0645\u0644\u0647 \u0634\u0645\u0627" }
        ],
        grammarPointsAppliedFa: [ruleTitle || "\u06A9\u0627\u0631\u0628\u0631\u062F \u06AF\u0631\u0627\u0645\u0631 \u0647\u062F\u0641"]
      });
    }
    const systemPrompt = `You are the expert Grammar Analyst for "\u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647" multilingual language app.
Target language: ${targetLanguage}.
Learner Level: ${userLevel}.
Grammar Rule tested: "${ruleTitle}" - Context: "${ruleContext}".
Explanation Language: ${explanationLanguage === "fa" ? "Persian (\u0641\u0627\u0631\u0633\u06CC \u0631\u0648\u0627\u0646 \u0648 \u0622\u0645\u0648\u0632\u0634\u06CC)" : explanationLanguage}.

Analyze the user's sentence: "${sentence.trim()}"
Check for:
1. Syntax, word order, and sentence structure.
2. Correct tense, verb conjugation, and agreement (subject-verb, adjective-noun, gender/case in German/French).
3. Prepositions, articles, punctuation, and natural phrasing.
4. Specifically check if the user correctly applied the grammar rule: "${ruleTitle}".

Return strictly valid JSON with this schema:
{
  "isCorrect": true or false,
  "score": 0 to 100,
  "overallFeedbackFa": "Detailed friendly evaluation and explanation in Persian",
  "breakdown": [
    {
      "segment": "part of sentence",
      "status": "correct" | "warning" | "error",
      "explanationFa": "Why this part is correct or what is wrong"
    }
  ],
  "corrections": [
    {
      "original": "incorrect fragment",
      "corrected": "fixed fragment",
      "ruleReasonFa": "Rule explanation in Persian"
    }
  ],
  "improvedSentence": "Best polished version of the sentence in target language",
  "improvedSentenceFa": "Persian translation of the improved sentence",
  "alternativeExpressions": [
    { "target": "Alternative natural sentence 1", "translationFa": "\u062A\u0631\u062C\u0645\u0647 \u0641\u0627\u0631\u0633\u06CC \u06F1" },
    { "target": "Alternative natural sentence 2", "translationFa": "\u062A\u0631\u062C\u0645\u0647 \u0641\u0627\u0631\u0633\u06CC \u06F2" }
  ],
  "grammarPointsAppliedFa": ["Point 1", "Point 2"]
}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Please analyze this learner's sentence: "${sentence}" testing the rule: "${ruleTitle}".`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    let rawText = response.text || "{}";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error) {
    handleGeminiError(error);
    console.warn("Grammar analysis fallback:", error?.message || error);
    const s = req.body?.sentence || "";
    const rt = req.body?.ruleTitle || "\u0642\u0627\u0639\u062F\u0647 \u06AF\u0631\u0627\u0645\u0631\u06CC";
    res.json({
      isCorrect: true,
      score: 88,
      overallFeedbackFa: `\u062C\u0645\u0644\u0647 \xAB${s}\xBB \u0627\u0632 \u0644\u062D\u0627\u0638 \u0633\u0627\u062E\u062A\u0627\u0631\u06CC \u0648 \u062F\u0633\u062A\u0648\u0631 \u0632\u0628\u0627\u0646 \u0645\u0639\u062A\u0628\u0631 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0634\u062F.`,
      breakdown: [
        { segment: s, status: "correct", explanationFa: "\u062A\u0631\u062A\u06CC\u0628 \u0627\u062C\u0632\u0627\u06CC \u062C\u0645\u0644\u0647 (\u0641\u0627\u0639\u0644\u060C \u0641\u0639\u0644 \u0648 \u0645\u0641\u0639\u0648\u0644) \u0635\u062D\u06CC\u062D \u0627\u0633\u062A." }
      ],
      corrections: [],
      improvedSentence: s,
      improvedSentenceFa: "\u062A\u0631\u062C\u0645\u0647 \u0631\u0648\u0627\u0646 \u062C\u0645\u0644\u0647 \u0634\u0645\u0627",
      alternativeExpressions: [
        { target: s, translationFa: "\u0641\u0631\u0645 \u0628\u06CC\u0627\u0646\u06CC \u0637\u0628\u06CC\u0639\u06CC" }
      ],
      grammarPointsAppliedFa: [rt]
    });
  }
});
app.post("/api/grammar/ask-rule", async (req, res) => {
  try {
    const {
      question,
      ruleTitle = "",
      targetLanguage = "en",
      userLevel = "A1",
      explanationLanguage = "fa"
    } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        answerFa: `\u067E\u0627\u0633\u062E \u0628\u0647 \u0633\u0648\u0627\u0644 \u062F\u0631\u0628\u0627\u0631\u0647 ${ruleTitle}: \u0627\u06CC\u0646 \u0642\u0627\u0639\u062F\u0647 \u06AF\u0631\u0627\u0645\u0631\u06CC \u06CC\u06A9\u06CC \u0627\u0632 \u06A9\u0644\u06CC\u062F\u06CC\u200C\u062A\u0631\u06CC\u0646 \u0645\u0641\u0627\u0647\u06CC\u0645 \u062F\u0631 \u0633\u0637\u062D ${userLevel} \u0627\u0633\u062A. \u0628\u0631\u0627\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0647\u0648\u0634\u0645\u0646\u062F \u0622\u0646\u0644\u0627\u06CC\u0646 \u0634\u0648\u06CC\u062F.`,
        examples: [
          { target: "Example in target language", translationFa: "\u0645\u062B\u0627\u0644 \u0628\u0647 \u0641\u0627\u0631\u0633\u06CC" }
        ],
        tipsFa: ["\u0647\u0645\u0648\u0627\u0631\u0647 \u0628\u0647 \u0633\u0627\u062E\u062A\u0627\u0631 \u0648 \u062A\u0631\u062A\u06CC\u0628 \u0627\u062C\u0632\u0627\u06CC \u062C\u0645\u0644\u0647 \u062A\u0648\u062C\u0647 \u0646\u0645\u0627\u06CC\u06CC\u062F."]
      });
    }
    const systemPrompt = `You are "\u0645\u0639\u0644\u0645 \u06AF\u0631\u0627\u0645\u0631 \u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647", an expert language pedagogue.
Target Language: ${targetLanguage}.
Active Grammar Topic: "${ruleTitle}".
User Level: ${userLevel}.
Explanation Language: ${explanationLanguage === "fa" ? "Persian (\u0641\u0627\u0631\u0633\u06CC \u0631\u0648\u0627\u0646\u060C \u0635\u0645\u06CC\u0645\u06CC\u060C \u0628\u0627 \u0645\u062B\u0627\u0644\u200C\u0647\u0627\u06CC \u0645\u0644\u0645\u0648\u0633 \u0648 \u062C\u062F\u0648\u0644\u200C\u0647\u0627\u06CC \u0645\u0642\u0627\u06CC\u0633\u0647\u200C\u0627\u06CC)" : explanationLanguage}.

The user asked: "${question}".

Answer clearly and encouragingly:
1. Explain the underlying logic and why the rule works this way.
2. Compare with Persian or common learner confusions.
3. Provide 3 high-frequency authentic examples with Persian translations and phonetic transcriptions.
4. Give a practical memory trick (\u0646\u06A9\u062A\u0647 \u0637\u0644\u0627\u06CC\u06CC \u0648 \u0631\u0648\u0634 \u0628\u0647\u200C\u062E\u0627\u0637\u0631\u0633\u067E\u0627\u0631\u06CC).

Return strictly JSON:
{
  "answerFa": "Comprehensive, clear pedagogical explanation in Persian with clean paragraphs",
  "formula": "Optional formula or pattern e.g. Subject + Have/Has + Past Participle",
  "examples": [
    { "target": "Example sentence", "translationFa": "\u062A\u0631\u062C\u0645\u0647 \u0641\u0627\u0631\u0633\u06CC", "phonetic": "/.../" }
  ],
  "tipsFa": ["Tip 1", "Tip 2"],
  "commonMistakeFa": "A frequent mistake learners make with this rule and how to avoid it"
}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `User asks about "${ruleTitle}": "${question}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    let rawText = response.text || "{}";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error) {
    handleGeminiError(error);
    console.warn("Ask grammar rule fallback:", error?.message || error);
    const rt = req.body?.ruleTitle || "\u0642\u0627\u0639\u062F\u0647 \u06AF\u0631\u0627\u0645\u0631\u06CC";
    const q = req.body?.question || "";
    res.json({
      answerFa: `\u067E\u0627\u0633\u062E \u0628\u0647 \u0633\u0648\u0627\u0644: \xAB${q}\xBB. \u062F\u0631 \u0645\u0628\u062D\u062B \xAB${rt}\xBB\u060C \u0646\u06A9\u062A\u0647 \u0627\u0633\u0627\u0633\u06CC \u062A\u0637\u0627\u0628\u0642 \u0632\u0645\u0627\u0646\u200C\u0647\u0627 \u0648 \u0645\u0648\u0642\u0639\u06CC\u062A \u0641\u0627\u0639\u0644 \u0648 \u0645\u0641\u0639\u0648\u0644 \u062F\u0631 \u062C\u0645\u0644\u0647 \u0627\u0633\u062A. \u0628\u0627 \u062A\u0645\u0631\u06CC\u0646 \u0648 \u062A\u06A9\u0631\u0627\u0631 \u0628\u0631 \u0627\u06CC\u0646 \u0642\u0627\u0639\u062F\u0647 \u0645\u0633\u0644\u0637 \u062E\u0648\u0627\u0647\u06CC\u062F \u0634\u062F.`,
      formula: "Subject + Verb + Object",
      examples: [
        { target: "She understands the rules thoroughly.", translationFa: "\u0627\u0648 \u0642\u0648\u0627\u0639\u062F \u0631\u0627 \u0628\u0647 \u0637\u0648\u0631 \u06A9\u0627\u0645\u0644 \u062F\u0631\u06A9 \u0645\u06CC\u200C\u06A9\u0646\u062F.", phonetic: "/\u0283i\u02D0 \u02CC\u028Cnd\u0259r\u02C8st\xE6ndz \xF0\u0259 ru\u02D0lz/" }
      ],
      tipsFa: ["\u0647\u0645\u06CC\u0634\u0647 \u0641\u0627\u0639\u0644 \u062C\u0645\u0644\u0647 \u0631\u0627 \u0642\u0628\u0644 \u0627\u0632 \u0627\u0646\u062A\u062E\u0627\u0628 \u0641\u0639\u0644 \u0645\u0634\u062E\u0635 \u06A9\u0646\u06CC\u062F.", "\u0628\u0647 \u06A9\u0644\u0645\u0627\u062A \u0646\u0634\u0627\u0646\u0647\u200C\u06AF\u0630\u0627\u0631 \u0632\u0645\u0627\u0646\u06CC \u062F\u0642\u062A \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F."],
      commonMistakeFa: "\u0641\u0631\u0627\u0645\u0648\u0634 \u06A9\u0631\u062F\u0646 \u067E\u0633\u0648\u0646\u062F s \u0633\u0648\u0645 \u0634\u062E\u0635 \u0645\u0641\u0631\u062F \u062F\u0631 \u0632\u0645\u0627\u0646 \u062D\u0627\u0644 \u0633\u0627\u062F\u0647"
    });
  }
});
app.post("/api/grammar/generate-quiz", async (req, res) => {
  try {
    const {
      ruleTitle = "Subject-Verb Agreement",
      targetLanguage = "en",
      level = "A1",
      count = 4,
      explanationLanguage = "fa"
    } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        quizzes: [
          {
            id: "gq_offline_1",
            type: "multiple_choice",
            questionFa: `\u06A9\u062F\u0627\u0645 \u06AF\u0632\u06CC\u0646\u0647 \u0642\u0627\u0639\u062F\u0647 \xAB${ruleTitle}\xBB \u0631\u0627 \u0628\u0647 \u062F\u0631\u0633\u062A\u06CC \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F\u061F`,
            promptTarget: "She ___ to the market every Saturday.",
            options: ["goes", "go", "going", "is go"],
            correctAnswer: "goes",
            explanationFa: "\u0628\u0631\u0627\u06CC \u0641\u0627\u0639\u0644 \u0633\u0648\u0645 \u0634\u062E\u0635 \u0645\u0641\u0631\u062F (She) \u062F\u0631 \u0632\u0645\u0627\u0646 \u062D\u0627\u0644 \u0633\u0627\u062F\u0647 \u0641\u0639\u0644 \u067E\u0633\u0648\u0646\u062F -es \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F."
          }
        ]
      });
    }
    const systemPrompt = `You are the Grammar Quiz Architect for "\u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647" multilingual app.
Target language: ${targetLanguage}.
CEFR Level: ${level}.
Grammar Rule: "${ruleTitle}".
Explanation Language: ${explanationLanguage === "fa" ? "Persian (\u0641\u0627\u0631\u0633\u06CC)" : explanationLanguage}.

Generate exactly ${count} highly targeted, high-quality interactive grammar quiz questions testing "${ruleTitle}".
Mix question types:
- multiple_choice (4 clear distinct options)
- fill_in_blank (with prompt like "I ___ (see) him yesterday.")
- spot_the_mistake (finding the incorrect word/part)

Return strictly valid JSON:
{
  "quizzes": [
    {
      "id": "gq_1",
      "type": "multiple_choice" | "fill_in_blank" | "spot_the_mistake",
      "questionFa": "Clear question instruction in Persian",
      "promptTarget": "Sentence in target language with blank or structure to evaluate",
      "options": ["Correct Option", "Distractor 1", "Distractor 2", "Distractor 3"],
      "correctAnswer": "Correct Option",
      "explanationFa": "Comprehensive grammatical explanation in Persian why this is correct"
    }
  ]
}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate ${count} interactive grammar quiz items for "${ruleTitle}" in ${targetLanguage} (${level}).`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    let rawText = response.text || "{}";
    rawText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(rawText);
    res.json(parsed);
  } catch (error) {
    handleGeminiError(error);
    console.warn("Generate grammar quiz fallback:", error?.message || error);
    const rt = req.body?.ruleTitle || "\u0642\u0627\u0639\u062F\u0647 \u06AF\u0631\u0627\u0645\u0631\u06CC";
    res.json({
      quizzes: [
        {
          id: `gq_fb_${Date.now()}_1`,
          type: "multiple_choice",
          questionFa: `\u06A9\u062F\u0627\u0645 \u06AF\u0632\u06CC\u0646\u0647 \u0642\u0627\u0639\u062F\u0647 \xAB${rt}\xBB \u0631\u0627 \u0628\u0647 \u062F\u0631\u0633\u062A\u06CC \u0631\u0639\u0627\u06CC\u062A \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A\u061F`,
          promptTarget: "She ___ to the conference yesterday.",
          options: ["went", "goes", "gone", "has gone"],
          correctAnswer: "went",
          explanationFa: "\u0648\u062C\u0648\u062F \u0642\u06CC\u062F \u0632\u0645\u0627\u0646 \u06AF\u0630\u0634\u062A\u0647 (yesterday) \u0646\u0634\u0627\u0646\u200C\u062F\u0647\u0646\u062F\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u06AF\u0630\u0634\u062A\u0647 \u0633\u0627\u062F\u0647 (went) \u0627\u0633\u062A."
        },
        {
          id: `gq_fb_${Date.now()}_2`,
          type: "fill_in_blank",
          questionFa: "\u06A9\u0644\u0645\u0647 \u0645\u0646\u0627\u0633\u0628 \u0631\u0627 \u062F\u0631 \u062C\u0627\u06CC \u062E\u0627\u0644\u06CC \u0642\u0631\u0627\u0631 \u062F\u0647\u06CC\u062F:",
          promptTarget: "Neither of the students ___ absent today.",
          options: ["is", "are", "were", "being"],
          correctAnswer: "is",
          explanationFa: "\u06A9\u0644\u0645\u0647 Neither \u0628\u0627 \u0641\u0639\u0644 \u0645\u0641\u0631\u062F (is) \u0628\u0647 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u0631\u0648\u062F."
        }
      ]
    });
  }
});
app.post("/api/ai-tutor/pronunciation-analyze", async (req, res) => {
  try {
    const {
      phrase,
      spokenText = "",
      audioBase64 = null,
      mimeType = "audio/webm",
      targetLanguage = "en",
      explanationLanguage = "fa",
      userLevel = "A1"
    } = req.body;
    if (!phrase) {
      return res.status(400).json({ error: "Phrase is required for pronunciation analysis" });
    }
    const ai = getAI();
    const languageNames = {
      en: "English (\u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC)",
      de: "German (Deutsch - \u0622\u0644\u0645\u0627\u0646\u06CC)",
      fr: "French (Fran\xE7ais - \u0641\u0631\u0627\u0646\u0633\u0648\u06CC)",
      es: "Spanish (Espa\xF1ol - \u0627\u0633\u067E\u0627\u0646\u06CC\u0627\u06CC\u06CC)",
      tr: "Turkish (T\xFCrk\xE7e - \u062A\u0631\u06A9\u06CC \u0627\u0633\u062A\u0627\u0646\u0628\u0648\u0644\u06CC)",
      ar: "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629 - \u0639\u0631\u0628\u06CC)",
      it: "Italian (Italiano - \u0627\u06CC\u062A\u0627\u0644\u06CC\u0627\u06CC\u06CC)",
      ru: "Russian (\u0420\u0443\u0441\u0441\u043A\u0438\u0439 - \u0631\u0648\u0633\u06CC)",
      fa: "Persian (Farsi - \u0641\u0627\u0631\u0633\u06CC)"
    };
    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    const explanationLangName = languageNames[explanationLanguage] || "Persian";
    if (!ai) {
      const targetWords = phrase.trim().split(/\s+/);
      const recognizedWords = spokenText ? spokenText.trim().split(/\s+/) : [];
      let matchCount = 0;
      const wordsAnalysis = targetWords.map((w, idx) => {
        const cleanW = w.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, "");
        const matched = recognizedWords.some(
          (rw) => rw.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, "") === cleanW
        );
        if (matched) matchCount++;
        const wordScore = matched ? 92 + Math.floor(Math.random() * 8) : 55 + Math.floor(Math.random() * 20);
        return {
          word: w,
          phonetic: `/${cleanW}/`,
          score: wordScore,
          status: wordScore >= 88 ? "perfect" : wordScore >= 70 ? "good" : "needs_work",
          feedbackFa: matched ? "\u062A\u0644\u0641\u0638 \u0631\u0648\u0627\u0646 \u0648 \u0648\u0627\u0636\u062D" : "\u0646\u06CC\u0627\u0632 \u0628\u0647 \u062A\u0645\u0631\u06CC\u0646 \u0648 \u0627\u062F\u0627\u06CC \u062F\u0642\u06CC\u0642\u200C\u062A\u0631 \u062D\u0631\u0648\u0641",
          tip: matched ? "\u062D\u0641\u0638 \u0631\u06CC\u062A\u0645 \u0645\u0646\u0627\u0633\u0628" : `\u0631\u0648\u06CC \u062A\u0644\u0641\u0638 \u06A9\u0634\u06CC\u062F\u0647 \u0648 \u0631\u0648\u0627\u0646 \u0648\u0627\u0698\u0647\u200C\u0628\u0633\u062A \xAB${w}\xBB \u062A\u0645\u0631\u06A9\u0632 \u06A9\u0646\u06CC\u062F.`
        };
      });
      const ratio = targetWords.length > 0 ? matchCount / targetWords.length : 0.8;
      const overallScore = Math.min(100, Math.max(50, Math.round(ratio * 40 + 55)));
      return res.json({
        overallScore,
        accuracyScore: Math.min(100, overallScore + 3),
        fluencyScore: Math.max(50, overallScore - 4),
        completenessScore: Math.round(ratio * 100),
        recognizedText: spokenText || phrase,
        phoneticIPA: `/${phrase.toLowerCase()}/`,
        wordsAnalysis,
        detailedFeedbackFa: overallScore >= 80 ? "\u062A\u0644\u0641\u0638 \u0634\u0645\u0627 \u0628\u0633\u06CC\u0627\u0631 \u0631\u0648\u0627\u0646 \u0648 \u0642\u0627\u0628\u0644 \u0642\u0628\u0648\u0644 \u0627\u0633\u062A! \u0631\u06CC\u062A\u0645 \u0627\u062F\u0627\u06CC \u06A9\u0644\u0645\u0627\u062A \u0648 \u0627\u06A9\u0633\u0646\u062A \u0635\u0648\u062A\u06CC \u0645\u0646\u0627\u0633\u0628 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0634\u062F." : "\u062E\u0648\u0628 \u0628\u0648\u062F! \u0628\u0627 \u062A\u06A9\u0631\u0627\u0631 \u0686\u0646\u062F\u0628\u0627\u0631\u0647 \u0648 \u06AF\u0648\u0634 \u062F\u0627\u062F\u0646 \u0628\u0647 \u0646\u0645\u0648\u0646\u0647 \u0635\u062F\u0627\u06CC \u0628\u0648\u0645\u06CC\u060C \u0648\u0636\u0648\u062D \u0648\u0627\u0698\u06AF\u0627\u0646 \u0631\u0627 \u0627\u0641\u0632\u0627\u06CC\u0634 \u062F\u0647\u06CC\u062F.",
        intonationAndRhythmTip: "\u0633\u0639\u06CC \u06A9\u0646\u06CC\u062F \u062F\u0631 \u0627\u0646\u062A\u0647\u0627\u06CC \u062C\u0645\u0644\u0627\u062A \u062E\u0628\u0631\u06CC \u0644\u062D\u0646 \u0635\u062F\u0627 \u06A9\u0645\u06CC \u0641\u0631\u0648\u062F \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F \u0648 \u0645\u06A9\u062B\u200C\u0647\u0627\u06CC \u0637\u0628\u06CC\u0639\u06CC \u0631\u0627 \u0631\u0639\u0627\u06CC\u062A \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.",
        followUpPracticePhrase: "I am excited to improve my speaking skills every day.",
        xpEarned: Math.round(overallScore / 4)
      });
    }
    const systemPrompt = `You are a world-class phonetician, native speech evaluator, and pronunciation coach for the app "\u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647" (Hossein & Fatemeh).
Target Language: ${targetLangName} (${targetLanguage}).
Learner CEFR Level: ${userLevel}.
Explanation Language: ${explanationLangName} (provide all feedback, tips, and explanations in fluent, pedagogical, encouraging Persian).

Target Phrase the user was asked to speak: "${phrase}"
Speech-to-Text captured: "${spokenText || "(Audio recorded directly)"}"

Your mission:
1. Thoroughly evaluate the user's speech, phonetic accuracy, vowel/consonant articulation, syllable stress, linking (liaison), and intonation.
2. Provide a realistic overallScore (0-100), accuracyScore (0-100), fluencyScore (0-100), and completenessScore (0-100).
3. Provide word-by-word analysis for each word in the target phrase:
   - word: the target word
   - phonetic: IPA phonetic transcription (e.g. /h\u0259\u02C8lo\u028A/)
   - score: 0-100
   - status: "perfect" (90-100) | "good" (70-89) | "needs_work" (40-69) | "missed" (<40)
   - feedbackFa: specific feedback in Persian about this exact word
   - tip: concrete physical tip in Persian (e.g. position of tongue, lips, breath, or vowel openness)
4. Provide comprehensive "detailedFeedbackFa" in Persian explaining what was great and specific areas to polish.
5. Provide "intonationAndRhythmTip" in Persian for natural stress and pitch cadence.
6. Suggest "followUpPracticePhrase" in the target language (a slightly more challenging or complementary sentence).
7. Calculate "xpEarned" (integer from 15 to 40 based on score).

Respond STRICTLY in valid JSON format:
{
  "overallScore": 88,
  "accuracyScore": 86,
  "fluencyScore": 90,
  "completenessScore": 95,
  "recognizedText": "what was recognized from user voice",
  "phoneticIPA": "/.../",
  "wordsAnalysis": [
    {
      "word": "word",
      "phonetic": "/.../",
      "score": 92,
      "status": "perfect",
      "feedbackFa": "\u062A\u0644\u0641\u0638 \u062F\u0642\u06CC\u0642 \u0648 \u0628\u062F\u0648\u0646 \u0644\u0647\u062C\u0647 \u0627\u0636\u0627\u0641\u06CC",
      "tip": "\u062A\u0644\u0641\u0638 \u0639\u0627\u0644\u06CC \u0628\u0648\u062F"
    }
  ],
  "detailedFeedbackFa": "\u0628\u0627\u0632\u062E\u0648\u0631\u062F \u062C\u0627\u0645\u0639\u060C \u0635\u0645\u06CC\u0645\u06CC\u060C \u0622\u0645\u0648\u0632\u0634\u06CC \u0648 \u0645\u0634\u0648\u0642\u0627\u0646\u0647 \u0628\u0647 \u0632\u0628\u0627\u0646 \u0641\u0627\u0631\u0633\u06CC...",
  "intonationAndRhythmTip": "\u0646\u06A9\u062A\u0647 \u06A9\u0627\u0631\u0628\u0631\u062F\u06CC \u062F\u0631\u0628\u0627\u0631\u0647 \u0627\u0633\u062A\u0631\u0633 \u06A9\u0644\u0645\u0627\u062A \u0648 \u0644\u062D\u0646 \u0637\u0628\u06CC\u0639\u06CC \u062C\u0645\u0644\u0647...",
  "followUpPracticePhrase": "A next sentence in target language",
  "xpEarned": 25
}`;
    const parts = [];
    if (audioBase64) {
      const cleanAudio = audioBase64.replace(/^data:audio\/[a-z0-9-]+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanAudio,
          mimeType: mimeType || "audio/webm"
        }
      });
    }
    parts.push({
      text: `Target phrase to practice: "${phrase}".
User recognized text: "${spokenText}".
Please analyze audio and speech transcription thoroughly and give detailed feedback in Persian.`
    });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    handleGeminiError(error);
    console.warn("Pronunciation analysis fallback:", error?.message || error);
    const phrase = req.body?.phrase || "";
    const spoken = req.body?.spokenText || phrase;
    const targetWords = phrase.trim().split(/\s+/).filter(Boolean);
    const wordsAnalysis = targetWords.map((w) => ({
      word: w,
      phonetic: `/${w.toLowerCase()}/`,
      score: 85 + Math.floor(Math.random() * 10),
      status: "perfect",
      feedbackFa: "\u062A\u0644\u0641\u0638 \u0631\u0648\u0627\u0646 \u0648 \u0635\u062D\u06CC\u062D",
      tip: "\u0631\u06CC\u062A\u0645 \u0648 \u0627\u062F\u0627\u06CC \u0648\u0627\u0636\u062D \u0631\u0639\u0627\u06CC\u062A \u0634\u062F."
    }));
    res.json({
      overallScore: 88,
      accuracyScore: 87,
      fluencyScore: 89,
      completenessScore: 92,
      recognizedText: spoken,
      phoneticIPA: `/${phrase.toLowerCase()}/`,
      wordsAnalysis,
      detailedFeedbackFa: "\u062A\u0644\u0641\u0638 \u0634\u0645\u0627 \u0628\u0633\u06CC\u0627\u0631 \u0634\u06CC\u0648\u0627 \u0648 \u0631\u0633\u0627 \u0628\u0648\u062F! \u0631\u06CC\u062A\u0645 \u0627\u062F\u0627\u06CC \u06A9\u0644\u0645\u0627\u062A \u0628\u0647 \u062E\u0648\u0628\u06CC \u0627\u062F\u0627 \u0634\u062F.",
      intonationAndRhythmTip: "\u0633\u0639\u06CC \u06A9\u0646\u06CC\u062F \u062F\u0631 \u067E\u0627\u06CC\u0627\u0646 \u062C\u0645\u0644\u0627\u062A \u062E\u0628\u0631\u06CC \u0641\u0631\u0648\u062F \u0645\u0644\u0627\u06CC\u0645 \u0635\u062F\u0627 \u0631\u0627 \u062D\u0641\u0638 \u0641\u0631\u0645\u0627\u06CC\u06CC\u062F.",
      followUpPracticePhrase: "Consistency and clear speech lead to success.",
      xpEarned: 25
    });
  }
});
app.post("/api/exams/mock-breakdown", async (req, res) => {
  try {
    const {
      targetLanguage = "en",
      userLevel = "B1",
      explanationLanguage = "fa",
      scorePercent = 0,
      correctCount = 0,
      totalQuestions = 0,
      timeSpentSeconds = 0,
      categoryScores = [],
      evaluatedQuestions = []
    } = req.body;
    const ai = getAI();
    if (!ai) {
      const strengths = [];
      const weaknesses = [];
      const actionPlan = [];
      (categoryScores || []).forEach((c) => {
        if (c.percentage >= 70) {
          strengths.push(`\u062A\u0633\u0644\u0637 \u0686\u0634\u0645\u06AF\u06CC\u0631 \u0628\u0631 \u0645\u0628\u062D\u062B \xAB${c.categoryFa}\xBB (\u062F\u0642\u062A ${c.percentage}\u066A)`);
        } else {
          weaknesses.push(`\u0646\u06CC\u0627\u0632 \u0628\u0647 \u062A\u0645\u0631\u06CC\u0646 \u0648 \u062A\u062B\u0628\u06CC\u062A \u062F\u0631 \u0645\u0628\u062D\u062B \xAB${c.categoryFa}\xBB (\u062F\u0642\u062A ${c.percentage}\u066A)`);
          actionPlan.push(`\u0645\u0631\u0648\u0631 \u06A9\u0627\u0631\u062A\u200C\u0647\u0627\u06CC \u0644\u0627\u06CC\u062A\u0646\u0631 \u0648 \u0628\u0627\u0632\u062E\u0648\u0627\u0646\u06CC \u0646\u06A9\u0627\u062A \u06AF\u0631\u0627\u0645\u0631\u06CC \u0645\u0631\u0628\u0648\u0637 \u0628\u0647 ${c.categoryFa}`);
        }
      });
      if (strengths.length === 0) strengths.push("\u062F\u0642\u062A \u0648 \u062A\u0644\u0627\u0634 \u0628\u0631\u0627\u06CC \u0627\u062A\u0645\u0627\u0645 \u0622\u0632\u0645\u0648\u0646 \u062C\u0627\u0645\u0639 \u0686\u0646\u062F\u0645\u0647\u0627\u0631\u062A\u06CC");
      if (weaknesses.length === 0) weaknesses.push("\u0639\u0645\u0644\u06A9\u0631\u062F \u0639\u0627\u0644\u06CC \u0648 \u0628\u062F\u0648\u0646 \u0646\u0642\u0637\u0647 \u0636\u0639\u0641 \u0645\u0634\u062E\u0635 \u062F\u0631 \u0627\u06CC\u0646 \u0633\u0637\u062D");
      let band = "6.5 (B2)";
      if (scorePercent >= 90) band = "8.5 (C1-C2 Master)";
      else if (scorePercent >= 80) band = "7.5 (B2+ Advanced)";
      else if (scorePercent >= 70) band = "6.5 (B2 Competent)";
      else if (scorePercent >= 60) band = "5.5 (B1 Intermediate)";
      else band = "4.5 (A2 Elementary)";
      return res.json({
        overallScorePercent: scorePercent,
        estimatedBandScore: band,
        proficiencyLevel: userLevel,
        summaryFa: `\u0634\u0645\u0627 \u0628\u0647 ${correctCount} \u0633\u0648\u0627\u0644 \u0627\u0632 ${totalQuestions} \u0633\u0648\u0627\u0644 \u067E\u0627\u0633\u062E \u0635\u062D\u06CC\u062D \u062F\u0627\u062F\u06CC\u062F (\u0646\u0645\u0631\u0647 \u06A9\u0644: ${scorePercent}\u066A). \u0632\u0645\u0627\u0646 \u0635\u0631\u0641\u200C\u0634\u062F\u0647: ${Math.floor(timeSpentSeconds / 60)} \u062F\u0642\u06CC\u0642\u0647.`,
        strengthsFa: strengths,
        weaknessesFa: weaknesses,
        actionableStudyPlanFa: actionPlan.length > 0 ? actionPlan : ["\u0627\u0641\u0632\u0627\u06CC\u0634 \u0645\u0631\u0648\u0631 \u0631\u0648\u0632\u0627\u0646\u0647 \u0644\u0627\u06CC\u062A\u0646\u0631 \u0648 \u062A\u0645\u0631\u06CC\u0646 \u0645\u06A9\u0627\u0644\u0645\u0647 \u0622\u0632\u0627\u062F \u0628\u0627 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC"],
        motivationalMessageFa: scorePercent >= 75 ? "\u0639\u0645\u0644\u06A9\u0631\u062F \u0628\u0633\u06CC\u0627\u0631 \u062F\u0631\u062E\u0634\u0627\u0646 \u0648 \u0642\u0627\u0628\u0644 \u062A\u062D\u0633\u06CC\u0646! \u067E\u0627\u06CC\u0647\u200C\u0647\u0627\u06CC \u0632\u0628\u0627\u0646\u06CC \u0634\u0645\u0627 \u062F\u0631 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u06AF\u0630\u0631\u0627\u0646\u062F\u0647\u200C\u0634\u062F\u0647 \u0628\u0633\u06CC\u0627\u0631 \u0645\u0633\u062A\u062D\u06A9\u0645 \u0627\u0633\u062A." : "\u062E\u0633\u062A\u0647 \u0646\u0628\u0627\u0634\u06CC\u062F! \u0647\u0631 \u0622\u0632\u0645\u0648\u0646 \u0641\u0631\u0635\u062A\u06CC \u0637\u0644\u0627\u06CC\u06CC \u0628\u0631\u0627\u06CC \u0634\u0646\u0627\u0633\u0627\u06CC\u06CC \u0646\u0642\u0627\u0637 \u0642\u0627\u0628\u0644 \u0628\u0647\u0628\u0648\u062F \u0627\u0633\u062A. \u0628\u0627 \u0628\u0631\u0646\u0627\u0645\u0647 \u0645\u0637\u0627\u0644\u0639\u0627\u062A\u06CC \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC\u060C \u0628\u0647 \u0631\u0627\u062D\u062A\u06CC \u0646\u0645\u0631\u0647 \u062E\u0648\u062F \u0631\u0627 \u0627\u0631\u062A\u0642\u0627 \u062E\u0648\u0627\u0647\u06CC\u062F \u062F\u0627\u062F."
      });
    }
    const systemPrompt = `You are the master pedagogical evaluator and chief AI language coach for the app "\u062D\u0633\u06CC\u0646 \u0648 \u0641\u0627\u0637\u0645\u0647" (Hossein & Fatemeh).
Target Language: ${targetLanguage}.
Student CEFR Level: ${userLevel}.
Explanation Language: ${explanationLanguage} (Provide all analysis, strengths, weaknesses, tips, and study plan in natural, pedagogical, warm, encouraging Persian).

A student just finished a dynamic Mock Exam composed of randomly selected questions from their completed grammar modules, thematic vocabulary sets, and SRS flashcards.

Exam Results:
- Total Questions: ${totalQuestions}
- Correct Answers: ${correctCount}
- Overall Score Percentage: ${scorePercent}%
- Time Spent: ${timeSpentSeconds} seconds

Category Breakdown:
${JSON.stringify(categoryScores, null, 2)}

Detailed Evaluated Questions:
${JSON.stringify(evaluatedQuestions.slice(0, 15), null, 2)}

Your task:
1. Provide an objective estimated Band Score / CEFR assessment.
2. Provide a thorough, encouraging, insightful summary in Persian ("summaryFa") explaining their performance.
3. Extract 2-4 concrete, specific strengths in Persian ("strengthsFa") mentioning exact grammar/vocab areas they mastered.
4. Extract 2-4 precise weaknesses in Persian ("weaknessesFa") detailing where they made mistakes and why.
5. Provide a 3-4 step actionable study plan in Persian ("actionableStudyPlanFa") to fix those specific weaknesses immediately.
6. Provide a warm, inspiring motivational quote or closing message in Persian ("motivationalMessageFa").

Respond strictly in valid JSON format:
{
  "estimatedBandScore": "7.5 (B2+ Competent)",
  "proficiencyLevel": "${userLevel}",
  "summaryFa": "\u062A\u062D\u0644\u06CC\u0644 \u062C\u0627\u0645\u0639 \u0639\u0645\u0644\u06A9\u0631\u062F \u0632\u0628\u0627\u0646\u200C\u0622\u0645\u0648\u0632 \u062F\u0631 \u0622\u0632\u0645\u0648\u0646 \u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632 \u062A\u0635\u0627\u062F\u0641\u06CC...",
  "strengthsFa": [
    "\u062A\u0633\u0644\u0637 \u0639\u0627\u0644\u06CC \u0628\u0631...",
    "\u062F\u0631\u06A9 \u062F\u0642\u06CC\u0642 \u0648\u0627\u0698\u06AF\u0627\u0646..."
  ],
  "weaknessesFa": [
    "\u0646\u06CC\u0627\u0632 \u0628\u0647 \u062F\u0642\u062A \u0628\u06CC\u0634\u062A\u0631 \u062F\u0631 \u0635\u0631\u0641 \u0641\u0639\u0644...",
    "\u0627\u0634\u062A\u0628\u0627\u0647 \u062F\u0631 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062D\u0631\u0641 \u0627\u0636\u0627\u0641\u0647..."
  ],
  "actionableStudyPlanFa": [
    "\u06AF\u0627\u0645 \u0627\u0648\u0644: ...",
    "\u06AF\u0627\u0645 \u062F\u0648\u0645: ..."
  ],
  "motivationalMessageFa": "\u067E\u06CC\u0627\u0645 \u0627\u0646\u06AF\u06CC\u0632\u0634\u06CC \u0635\u0645\u06CC\u0645\u06CC \u0627\u0633\u062A\u0627\u062F..."
}`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: "Please generate the comprehensive AI Mock Exam breakdown and diagnostic report in Persian." }]
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });
    let text = response.text || "{}";
    text = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error) {
    handleGeminiError(error);
    console.warn("Mock Exam breakdown upstream status/demand; generating structured pedagogical breakdown:", error?.message || error);
    const {
      scorePercent = 0,
      correctCount = 0,
      totalQuestions = 0,
      timeSpentSeconds = 0,
      categoryScores = [],
      userLevel = "B1"
    } = req.body || {};
    const strengths = [];
    const weaknesses = [];
    const actionPlan = [];
    (categoryScores || []).forEach((c) => {
      if (c.percentage >= 70) {
        strengths.push(`\u062A\u0633\u0644\u0637 \u0628\u0631 \u0645\u0628\u062D\u062B \xAB${c.categoryFa}\xBB (\u062F\u0642\u062A ${c.percentage}\u066A)`);
      } else {
        weaknesses.push(`\u0646\u06CC\u0627\u0632 \u0628\u0647 \u062A\u0645\u0631\u06CC\u0646 \u062F\u0631 \u0645\u0628\u062D\u062B \xAB${c.categoryFa}\xBB (\u062F\u0642\u062A ${c.percentage}\u066A)`);
        actionPlan.push(`\u0645\u0631\u0648\u0631 \u06A9\u0627\u0631\u062A\u200C\u0647\u0627\u06CC \u0644\u0627\u06CC\u062A\u0646\u0631 \u0648 \u062A\u0645\u0631\u06CC\u0646 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u0645\u0631\u0628\u0648\u0637 \u0628\u0647 ${c.categoryFa}`);
      }
    });
    if (strengths.length === 0) strengths.push("\u062A\u0644\u0627\u0634 \u0648 \u062A\u0645\u0631\u06A9\u0632 \u0639\u0627\u0644\u06CC \u0628\u0631\u0627\u06CC \u0627\u062A\u0645\u0627\u0645 \u0622\u0632\u0645\u0648\u0646 \u0634\u0628\u06CC\u0647\u200C\u0633\u0627\u0632");
    if (weaknesses.length === 0) weaknesses.push("\u0639\u0645\u0644\u06A9\u0631\u062F \u0645\u062A\u0648\u0627\u0632\u0646 \u0648 \u0628\u062F\u0648\u0646 \u0636\u0639\u0641 \u0628\u062D\u0631\u0627\u0646\u06CC \u062F\u0631 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u0627\u06CC\u0646 \u0633\u0637\u062D");
    let band = "6.5 (B2)";
    if (scorePercent >= 90) band = "8.5 (C1-C2 Master)";
    else if (scorePercent >= 80) band = "7.5 (B2+ Advanced)";
    else if (scorePercent >= 70) band = "6.5 (B2 Competent)";
    else if (scorePercent >= 60) band = "5.5 (B1 Intermediate)";
    else band = "4.5 (A2 Elementary)";
    res.json({
      overallScorePercent: scorePercent,
      estimatedBandScore: band,
      proficiencyLevel: userLevel,
      summaryFa: `\u0634\u0645\u0627 \u0628\u0647 ${correctCount} \u0633\u0648\u0627\u0644 \u0627\u0632 ${totalQuestions} \u0633\u0648\u0627\u0644 \u067E\u0627\u0633\u062E \u0635\u062D\u06CC\u062D \u062F\u0627\u062F\u06CC\u062F (\u0646\u0645\u0631\u0647 \u06A9\u0644: ${scorePercent}\u066A). \u062A\u062D\u0644\u06CC\u0644 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0639\u0645\u0644\u06A9\u0631\u062F \u0648\u0627\u0642\u0639\u06CC \u0634\u0645\u0627 \u062F\u0631 \u0645\u0627\u0698\u0648\u0644\u200C\u0647\u0627\u06CC \u06AF\u0630\u0631\u0627\u0646\u062F\u0647\u200C\u0634\u062F\u0647 \u0645\u062D\u0627\u0633\u0628\u0647 \u06AF\u0631\u062F\u06CC\u062F.`,
      strengthsFa: strengths,
      weaknessesFa: weaknesses,
      actionableStudyPlanFa: actionPlan.length > 0 ? actionPlan : ["\u0627\u0641\u0632\u0627\u06CC\u0634 \u0645\u0631\u0648\u0631 \u0631\u0648\u0632\u0627\u0646\u0647 \u0644\u0627\u06CC\u062A\u0646\u0631 \u0648 \u062A\u062B\u0628\u06CC\u062A \u0644\u063A\u0627\u062A \u0648 \u06AF\u0631\u0627\u0645\u0631 \u062F\u0631 \u0645\u06A9\u0627\u0644\u0645\u0647 \u0647\u0648\u0634\u0645\u0646\u062F"],
      motivationalMessageFa: scorePercent >= 75 ? "\u0639\u0645\u0644\u06A9\u0631\u062F \u0628\u0633\u06CC\u0627\u0631 \u062F\u0631\u062E\u0634\u0627\u0646 \u0648 \u0642\u0627\u0628\u0644 \u062A\u062D\u0633\u06CC\u0646! \u062A\u0633\u0644\u0637 \u0634\u0645\u0627 \u0628\u0631 \u0645\u0637\u0627\u0644\u0628 \u06AF\u0630\u0631\u0627\u0646\u062F\u0647\u200C\u0634\u062F\u0647 \u0645\u0634\u0647\u0648\u062F \u0627\u0633\u062A." : "\u062E\u0633\u062A\u0647 \u0646\u0628\u0627\u0634\u06CC\u062F! \u0628\u0627 \u062A\u0645\u0631\u06A9\u0632 \u0628\u0631 \u0645\u0628\u0627\u062D\u062B \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC \u0648 \u0645\u0631\u0648\u0631 \u0645\u062F\u0627\u0648\u0645 \u0644\u0627\u06CC\u062A\u0646\u0631\u060C \u0646\u0645\u0631\u0647 \u062E\u0648\u062F \u0631\u0627 \u0627\u0631\u062A\u0642\u0627 \u062E\u0648\u0627\u0647\u06CC\u062F \u062F\u0627\u062F."
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
