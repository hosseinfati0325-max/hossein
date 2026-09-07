import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  MessageSquare,
  Theater,
  FileCheck,
  Brain,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Coffee,
  Plane,
  Briefcase,
  Layers,
  ImagePlus,
  Camera,
  X,
  Eye,
  BookOpen,
  AudioLines,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AiChatMessage, RoleplayScenario } from '../../types';
import { ROLEPLAY_SCENARIOS, SUPPORTED_LANGUAGES } from '../../data/curriculumData';
import { audioService } from '../../services/audioService';
import { optimizeImageForAi } from '../../utils/imageOptimizer';
import { DialogueRoleplayExperience } from './DialogueRoleplayExperience';
import { PronunciationPracticeStudio } from './PronunciationPracticeStudio';

interface AiTutorViewProps {
  initialMode?: 'chat' | 'pronunciation' | 'roleplay' | 'writing' | 'vision' | 'remedial';
  initialRemedialTopic?: string | null;
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({
  initialMode,
  initialRemedialTopic,
}) => {
  const { user } = useApp();
  const [mode, setMode] = useState<'chat' | 'pronunciation' | 'roleplay' | 'writing' | 'vision' | 'remedial'>(
    initialMode || (initialRemedialTopic ? 'remedial' : 'chat')
  );
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(ROLEPLAY_SCENARIOS[0]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const visionFileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `سلام ${user.name}! من معلم هوشمند «حسین و فاطمه» هستم. امروز می‌خواهید با هم چه زبانی را تمرین کنیم؟ می‌توانیم مکالمه کنیم، عکس تمرین یا کتابتان را بفرستید تا تصحیح کنم، گرامر را مرور کنیم یا در یک موقعیت واقعی مثل کافه و فرودگاه نقش‌آفرینی کنیم.`,
      translationFa: 'من همیشه آماده‌ام تا به روان‌ترین شکل ممکن به شما در یادگیری کمک کنم.',
      suggestions: [
        'How can I introduce myself?',
        'Let\'s practice a dialogue.',
        'Please test my English grammar.',
      ],
      timestamp: Date.now(),
    },
  ]);

  // Free writing inputs
  const [writingInput, setWritingInput] = useState('');
  const [writingAnalysis, setWritingAnalysis] = useState<any | null>(null);
  const [isAnalyzingWriting, setIsAnalyzingWriting] = useState(false);

  // Vision analysis inputs
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [visionMime, setVisionMime] = useState<string>('image/jpeg');
  const [visionQuestion, setVisionQuestion] = useState('');
  const [visionAnalysis, setVisionAnalysis] = useState<any | null>(null);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);

  // Remedial practice generator
  const [remedialTopic, setRemedialTopic] = useState(initialRemedialTopic || 'افعال گذشته بی‌قاعده');

  useEffect(() => {
    if (initialRemedialTopic) {
      setRemedialTopic(initialRemedialTopic);
      setMode('remedial');
    }
  }, [initialRemedialTopic]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);
  const [generatedExercises, setGeneratedExercises] = useState<any[]>([]);
  const [isGeneratingEx, setIsGeneratingEx] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const currentLang = SUPPORTED_LANGUAGES[user.targetLanguage] || SUPPORTED_LANGUAGES.en;

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle file select with client-side optimization
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isVisionTab: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await optimizeImageForAi(file, 1024, 0.85);
      if (isVisionTab) {
        setVisionImage(optimized.dataUrl);
        setVisionMime(optimized.mimeType);
        setVisionAnalysis(null);
      } else {
        setSelectedImage(optimized.dataUrl);
        setImageMimeType(optimized.mimeType);
      }
    } catch (err) {
      console.warn('Image optimization fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (isVisionTab) {
          setVisionImage(result);
          setVisionMime(file.type || 'image/jpeg');
          setVisionAnalysis(null);
        } else {
          setSelectedImage(result);
          setImageMimeType(file.type || 'image/jpeg');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Send message to AI Tutor (supports text and image)
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if ((!textToSend && !selectedImage) || isLoading) return;

    audioService.playClickSound();
    setInputText('');

    const currentImg = selectedImage;
    const currentMime = imageMimeType;
    setSelectedImage(null);

    const userMsg: AiChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: textToSend || (currentImg ? 'لطفاً این تصویر/مشق را برای من تحلیل، تصحیح و آموزش دهید.' : ''),
      imageUrl: currentImg || undefined,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      if (currentImg) {
        // Send image to vision endpoint
        const response = await fetch('/api/ai-tutor/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImg,
            mimeType: currentMime,
            userQuestion: textToSend || 'لطفاً متن این تصویر یا مشق را تحلیل، ترجمه و تصحیح کرده و واژگان آن را استخراج کنید.',
            targetLanguage: user.targetLanguage,
            explanationLanguage: user.explanationLanguage,
          }),
        });

        const data = await response.json();

        const aiMsg: AiChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          text: data.replyInTargetLang || data.replyFa || 'تصویر با موفقیت تحلیل گردید.',
          translationFa: data.replyFa,
          textInTargetLang: data.replyInTargetLang,
          explanation: data.homeworkCorrection
            ? `تصحیح مشق و نکات دستوری: ${data.homeworkCorrection}`
            : data.replyFa,
          suggestions: data.practiceQuestions || ['Can you explain more?', 'Give another example', 'How do I pronounce these words?'],
          vocabularyTips:
            data.vocabulary?.map((v: any) => ({
              word: v.word,
              meaning: v.meaningFa,
              phonetic: v.phonetic,
            })) || [],
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMsg]);
        if (user.settings.autoPlayAudio && aiMsg.textInTargetLang) {
          audioService.speak(aiMsg.textInTargetLang, user.targetLanguage, user.settings.ttsSpeed);
        }
      } else {
        // Normal text / roleplay chat
        const response = await fetch('/api/ai-tutor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            targetLanguage: user.targetLanguage,
            explanationLanguage: user.explanationLanguage,
            userLevel: user.currentLevel,
            mode: mode === 'roleplay' ? 'roleplay' : 'general',
            scenario: mode === 'roleplay' ? selectedScenario?.situation : '',
            conversationHistory: messages.slice(-6).map((m) => ({
              role: m.role,
              content: m.text,
            })),
          }),
        });

        const data = await response.json();

        const aiMsg: AiChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          text: data.reply || data.text || 'متوجه شدم، بیایید ادامه دهیم.',
          textInTargetLang: data.replyInTargetLang || data.reply,
          corrections: data.corrections || [],
          explanation: data.explanation || '',
          suggestions: data.suggestions || [],
          vocabularyTips: data.vocabularyTips || [],
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (user.settings.autoPlayAudio && aiMsg.textInTargetLang) {
          audioService.speak(aiMsg.textInTargetLang, user.targetLanguage, user.settings.ttsSpeed);
        }
      }
    } catch (e) {
      console.error('AI error:', e);
      const offlineMsg: AiChatMessage = {
        id: `ai_fallback_${Date.now()}`,
        role: 'assistant',
        text: `That is very interesting! Keep practicing your ${currentLang.nameNative}.`,
        explanation: 'در حالت بدون اتصال، جملات استاندارد تمرینی برای شما آماده شده است.',
        suggestions: ['Can you give an example?', 'How do you say goodbye?'],
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, offlineMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze Image in Vision Tab
  const handleAnalyzeVisionTab = async () => {
    if (!visionImage || isAnalyzingVision) return;
    setIsAnalyzingVision(true);
    audioService.playClickSound();

    try {
      const response = await fetch('/api/ai-tutor/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: visionImage,
          mimeType: visionMime,
          userQuestion: visionQuestion,
          targetLanguage: user.targetLanguage,
          explanationLanguage: user.explanationLanguage,
        }),
      });

      const data = await response.json();
      setVisionAnalysis(data);
      if (user.settings.autoPlayAudio && data.replyInTargetLang) {
        audioService.speak(data.replyInTargetLang, user.targetLanguage, user.settings.ttsSpeed);
      }
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  // Toggle Voice Input
  const handleToggleVoice = () => {
    if (isRecording) {
      audioService.stopListening();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    audioService.playClickSound();

    const success = audioService.startListening(
      user.targetLanguage,
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsRecording(false);
          handleSendMessage(transcript);
        }
      },
      () => {
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      },
    );

    if (!success) {
      setIsRecording(false);
    }
  };

  // Free Writing Review
  const handleReviewWriting = async () => {
    if (!writingInput.trim() || isAnalyzingWriting) return;
    setIsAnalyzingWriting(true);
    audioService.playClickSound();

    try {
      const res = await fetch('/api/ai-tutor/writing-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: writingInput,
          targetLanguage: user.targetLanguage,
          explanationLanguage: user.explanationLanguage,
        }),
      });
      const data = await res.json();
      setWritingAnalysis(data);
    } catch (e) {
      console.error('Writing review error:', e);
    } finally {
      setIsAnalyzingWriting(false);
    }
  };

  // Generate Remedial Exercises
  const handleGenerateRemedial = async () => {
    if (isGeneratingEx) return;
    setIsGeneratingEx(true);
    audioService.playClickSound();

    try {
      const res = await fetch('/api/ai-tutor/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: user.targetLanguage,
          weaknessTopic: remedialTopic,
          explanationLanguage: user.explanationLanguage,
          count: 3,
        }),
      });
      const data = await res.json();
      setGeneratedExercises(data.exercises || []);
    } catch (e) {
      console.error('Remedial error:', e);
    } finally {
      setIsGeneratingEx(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-1 sm:p-4 overflow-hidden pb-12 sm:pb-16">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e, false)}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={visionFileInputRef}
        onChange={(e) => handleFileChange(e, true)}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-3 sm:p-5 mb-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 dark:shadow-none shrink-0">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-slate-100">
                دستیار و معلم هوشمند «حسین و فاطمه»
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                فعال با Gemini
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              تمرین زبان {currentLang.nameFa} {currentLang.flag} • گفتگو، ارسال عکس، نقش‌آفرینی و رفع اشکال
            </p>
          </div>
        </div>

        {/* Mode Selector Chips */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 text-xs flex-wrap">
          <button
            onClick={() => setMode('chat')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              mode === 'chat' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            گفتگو
          </button>
          <button
            onClick={() => setMode('pronunciation')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              mode === 'pronunciation'
                ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-xs'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AudioLines className="w-3.5 h-3.5" />
            <span>تمرین تلفظ صوتی (AI)</span>
          </button>
          <button
            onClick={() => setMode('vision')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              mode === 'vision' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            ارسال عکس
          </button>
          <button
            onClick={() => setMode('roleplay')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              mode === 'roleplay' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <Theater className="w-3.5 h-3.5" />
            نقش‌آفرینی صوتی
          </button>
          <button
            onClick={() => setMode('writing')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              mode === 'writing' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            تصحیح
          </button>
          <button
            onClick={() => setMode('remedial')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              mode === 'remedial' ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            تمرین هوشمند
          </button>
        </div>
      </div>

      {/* Main Mode Content */}
      {mode === 'pronunciation' && (
        <PronunciationPracticeStudio />
      )}
      {mode === 'chat' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs h-[calc(100dvh-290px)] min-h-[380px]">
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 px-1 py-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-4 shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#4F46E5] text-white rounded-br-none'
                      : 'bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  {/* Image attachment if any */}
                  {msg.imageUrl && (
                    <div className="mb-3 rounded-2xl overflow-hidden border border-white/20 dark:border-slate-700 max-h-56 bg-black/10">
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded for AI analysis"
                        className="w-full h-auto object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Message Text */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed font-latin">{msg.text}</p>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                        <button
                          onClick={() =>
                            audioService.speak(
                              msg.textInTargetLang || msg.text,
                              user.targetLanguage,
                              user.settings.ttsSpeed,
                            )
                          }
                          title="پخش صوت زبان مقصد"
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-200 active:scale-90 shadow-xs"
                        >
                          <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </button>
                        {msg.translationFa && (
                          <button
                            onClick={() => audioService.speakPersian(msg.translationFa!)}
                            title="پخش تلفظ فارسی (Persian Audio)"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 active:scale-90 shadow-xs flex items-center gap-0.5 text-[10px] font-bold"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>فارسی</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Vocabulary Tips if generated */}
                  {msg.vocabularyTips && msg.vocabularyTips.length > 0 && (
                    <div className="mt-3 p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-xs space-y-2">
                      <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        واژگان کلیدی استخراج‌شده:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {msg.vocabularyTips.map((v, vIdx) => (
                          <div
                            key={vIdx}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="font-bold font-latin text-indigo-700 dark:text-indigo-300 text-xs">{v.word}</div>
                              <div className="text-[11px] text-gray-600 dark:text-slate-400">{v.meaning}</div>
                            </div>
                            <button
                              onClick={() => audioService.speak(v.word, user.targetLanguage)}
                              className="p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Corrections Card if any */}
                  {msg.corrections && msg.corrections.length > 0 && (
                    <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5 text-gray-900 dark:text-slate-100">
                      <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        نکته تصحیح هوشمند:
                      </div>
                      {msg.corrections.map((c, i) => (
                        <div key={i} className="text-gray-800 dark:text-slate-200">
                          <span className="line-through text-rose-600 dark:text-rose-400 font-latin">{c.original}</span>
                          <span className="mx-1">→</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-latin font-bold">{c.corrected}</span>
                          <p className="text-[11px] text-gray-600 dark:text-slate-400 mt-0.5">{c.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pedagogical Explanation in Persian */}
                  {msg.explanation && (
                    <div className="mt-2.5 pt-2 border-t border-gray-200 dark:border-slate-700 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{msg.explanation}</span>
                    </div>
                  )}
                </div>

                {/* Quick Suggestion Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 justify-end">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(sug)}
                        className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-[11px] font-latin text-indigo-700 dark:text-indigo-300 transition-all active:scale-95 shadow-xs"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 p-2">
                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <span>معلم هوشمند در حال تحلیل و پاسخ‌گویی...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Image preview before sending */}
          {selectedImage && (
            <div className="mb-2 p-2 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-12 h-12 object-cover rounded-xl border border-gray-300"
                />
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  عکس انتخاب شد (آماده ارسال به معلم)
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Chat Input Bar */}
          <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2">
            {/* Image upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="ارسال عکس برای معلم هوشمند"
              className="p-3 rounded-2xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 border border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 transition-all active:scale-90 shadow-xs"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Mic button */}
            <button
              onClick={handleToggleVoice}
              className={`p-3 rounded-2xl transition-all shadow-xs active:scale-90 ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={selectedImage ? 'توضیح یا سوال درباره این عکس را بنویسید...' : 'سوالی دارید یا عکسی بفرستید...'}
              className="flex-1 py-3 px-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 font-latin transition-all"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={(!inputText.trim() && !selectedImage) || isLoading}
              className="p-3 rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-all active:scale-90 shadow-md shadow-indigo-100 dark:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mode: Vision & Photo Analysis (ارسال عکس به معلم) */}
      {mode === 'vision' && (
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-indigo-600" />
                  ارسال عکس برای معلم هوشمند (تحلیل بینایی ماشین)
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  عکس صفحه کتاب، تمرین دست‌نویس، تابلوی خیابان، منوی رستوران یا هر شیء واقعی را بارگذاری کنید تا معلم هوشمند آن را به زبان {currentLang.nameFa} ترجمه و آموزش دهد.
                </p>
              </div>
            </div>

            {/* Upload Area / Drag and Drop */}
            {!visionImage ? (
              <div
                onClick={() => visionFileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-300 dark:border-slate-700 rounded-3xl p-8 text-center cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <ImagePlus className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300">برای بارگذاری یا گرفتن عکس کلیک کنید</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">پشتیبانی از JPG, PNG, WEBP (حداکثر ۱۰ مگابایت)</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-slate-700 max-h-80 bg-slate-950 flex items-center justify-center">
                  <img
                    src={visionImage}
                    alt="Uploaded preview"
                    className="max-h-80 object-contain w-full"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={() => {
                      setVisionImage(null);
                      setVisionAnalysis(null);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Optional Question Input */}
                <input
                  type="text"
                  value={visionQuestion}
                  onChange={(e) => setVisionQuestion(e.target.value)}
                  placeholder="سوال یا درخواست خاصی درباره این تصویر دارید؟ (اختیاری)"
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-slate-100 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 font-latin"
                />

                <button
                  onClick={handleAnalyzeVisionTab}
                  disabled={isAnalyzingVision}
                  className="w-full py-3.5 rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzingVision ? (
                    <>
                      <Bot className="w-5 h-5 animate-spin" />
                      <span>معلم هوشمند در حال تحلیل تصویر و استخراج واژگان...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      <span>تحلیل هوشمند تصویر و دریافت نکات آموزشی</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Vision Analysis Results */}
            {visionAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-5 rounded-3xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 space-y-4"
              >
                {/* Reply in Persian */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      تحلیل معلم هوشمند:
                    </span>
                    <button
                      onClick={() => audioService.speakPersian(visionAnalysis.replyFa)}
                      className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      پخش صوت فارسی
                    </button>
                  </div>
                  <p className="text-xs text-gray-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-indigo-100 dark:border-slate-700">
                    {visionAnalysis.replyFa}
                  </p>
                </div>

                {/* Target Language Response */}
                {visionAnalysis.replyInTargetLang && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                      <span>توضیح به زبان مقصد ({currentLang.nameNative}):</span>
                      <button
                        onClick={() => audioService.speak(visionAnalysis.replyInTargetLang, user.targetLanguage)}
                        className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        پخش با تلفظ بومی
                      </button>
                    </div>
                    <p className="text-xs font-latin text-gray-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-700">
                      {visionAnalysis.replyInTargetLang}
                    </p>
                  </div>
                )}

                {/* Vocabulary Bank */}
                {visionAnalysis.vocabulary && visionAnalysis.vocabulary.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      واژگان و اصطلاحات مرتبط با عکس:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {visionAnalysis.vocabulary.map((voc: any, vIdx: number) => (
                        <div
                          key={vIdx}
                          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 space-y-1 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-latin text-indigo-700 dark:text-indigo-300 text-sm">
                              {voc.word}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => audioService.speak(voc.word, user.targetLanguage)}
                                title="تلفظ زبان مقصد"
                                className="p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-600"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => audioService.speakPersian(voc.meaningFa)}
                                title="تلفظ ترجمه فارسی"
                                className="p-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-800 text-emerald-600 text-[10px] font-bold"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-slate-400">{voc.meaningFa}</div>
                          {voc.exampleSentence && (
                            <div className="text-[11px] font-latin text-gray-500 dark:text-slate-400 italic pt-1 border-t border-gray-100 dark:border-slate-800">
                              "{voc.exampleSentence}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Mode: Interactive Dialogue Roleplay with Instant Pronunciation Scoring */}
      {mode === 'roleplay' && (
        <DialogueRoleplayExperience />
      )}

      {/* Mode: Writing Analysis */}
      {mode === 'writing' && (
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-1">
                تصحیح و آنالیز نگارش آزاد (Writing Coach)
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                پاراگراف یا متن انگلیسی، آلمانی یا فرانسوی خود را اینجا بنویسید تا معلم هوشمند آن را تصحیح کرده و نمره دهد.
              </p>
            </div>

            <textarea
              value={writingInput}
              onChange={(e) => setWritingInput(e.target.value)}
              placeholder={`متن خود را به زبان ${currentLang.nameFa} اینجا تایپ کنید...`}
              rows={5}
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-slate-100 font-latin focus:outline-none focus:border-indigo-600"
            />

            <button
              onClick={handleReviewWriting}
              disabled={isAnalyzingWriting || !writingInput.trim()}
              className="w-full py-3.5 rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzingWriting ? (
                <>
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>در حال بررسی توسط معلم هوشمند...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>بررسی نگارش و دریافت نمره</span>
                </>
              )}
            </button>

            {writingAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-300">نمره نگارش شما:</span>
                  <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-latin font-bold text-sm">
                    {writingAnalysis.score} / 100
                  </span>
                </div>

                <p className="text-xs text-gray-800 dark:text-slate-200 leading-relaxed">
                  {writingAnalysis.overallFeedback}
                </p>

                {writingAnalysis.correctedText && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs">
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 mb-1 font-latin">نسخه اصلاح‌شده و بومی:</div>
                    <div className="font-latin text-gray-800 dark:text-slate-200">{writingAnalysis.correctedText}</div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Mode: Remedial Generator */}
      {mode === 'remedial' && (
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-1">
                تولیدکننده خودکار تمرین‌های تقویتی
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                موضوعی که در آن احساس ضعف می‌کنید را وارد کنید تا هوش مصنوعی تمرین‌های هدفمند فوری برای شما طراحی کند.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={remedialTopic}
                onChange={(e) => setRemedialTopic(e.target.value)}
                placeholder="مثلاً: افعال بی‌قاعده زمان گذشته، حروف اضافه، زمان آینده..."
                className="flex-1 p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-slate-100 focus:outline-none focus:border-indigo-600"
              />
              <button
                onClick={handleGenerateRemedial}
                disabled={isGeneratingEx}
                className="px-5 py-3.5 rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-100 dark:shadow-none transition-all flex items-center gap-1.5 shrink-0"
              >
                {isGeneratingEx ? <Bot className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>تولید تمرین</span>
              </button>
            </div>

            {generatedExercises.length > 0 && (
              <div className="space-y-3 pt-2">
                {generatedExercises.map((ex: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">سوال {idx + 1}: {ex.instruction}</div>
                    <div className="text-sm font-latin font-semibold text-gray-900 dark:text-slate-100">{ex.question}</div>
                    {ex.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {ex.options.map((opt: string, optIdx: number) => (
                          <div
                            key={optIdx}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-latin text-gray-800 dark:text-slate-200"
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
