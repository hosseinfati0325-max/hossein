from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_optional_user, rate_limit_user
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    DailyWordResponse,
    WritingCorrectionRequest,
    WritingCorrectionResponse,
    RoleplayTurnRequest,
    RoleplayTurnResponse,
)
from app.ai.gateway import ai_gateway
from app.ai.guardrails import check_prompt_injection, sanitize_user_input

router = APIRouter(prefix="/ai", tags=["AI Tutor & Intelligent Services"], dependencies=[Depends(rate_limit_user)])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_tutor(req: AIChatRequest):
    # Guardrail check against prompt injection
    is_safe, check_result = check_prompt_injection(req.message)
    if not is_safe:
        return AIChatResponse(
            reply="پیام شما شامل عبارات غیراستاندارد یا غیرمجاز آموزشی است. لطفاً پرسش خود را در چارچوب یادگیری زبان مطرح نمایید.",
            reply_in_target_lang="Please keep conversation focused on language learning practice.",
            explanation="سامانه امنیتی اجازه اجرای فرامین سیستمی یا تغییر قوانین معلم را نمی‌دهد.",
            provider="security_guardrail",
            model="heuristic-filter",
            latency_ms=1,
        )

    clean_message = check_result
    prompt = f"User ({req.user_level}) message: '{clean_message}'. Mode: {req.mode}. Reply naturally, correct subtle mistakes if any, and explain briefly in Persian if helpful."
    res = await ai_gateway.execute_with_failover(
        task_name=f"tutor_{req.mode}",
        is_json=True,
        prompt=prompt,
        idempotency_key=req.idempotency_key,
    )
    if res.parsed_json and "reply" in res.parsed_json:
        pj = res.parsed_json
        return AIChatResponse(
            reply=pj.get("reply", ""),
            reply_in_target_lang=pj.get("reply_in_target_lang"),
            corrections=pj.get("corrections", []),
            explanation=pj.get("explanation"),
            suggestions=pj.get("suggestions", []),
            vocabulary_tips=pj.get("vocabulary_tips", []),
            provider=res.provider_name,
            model=res.model_name,
            latency_ms=res.latency_ms,
        )
    return AIChatResponse(
        reply=res.raw_text or "متوجه شدم! لطفاً ادامه دهید.",
        provider=res.provider_name,
        model=res.model_name,
        latency_ms=res.latency_ms,
    )

@router.get("/daily-word", response_model=DailyWordResponse)
async def get_daily_word(language: str = "en"):
    prompt = f"Provide a high-frequency, evocative daily word for English language learners with: word, phonetic, part_of_speech, translation_fa, example_target, example_fa, pedagogical_tip_fa, fun_fact_fa."
    res = await ai_gateway.execute_with_failover(
        task_name="daily_word",
        is_json=True,
        prompt=prompt,
    )
    pj = res.parsed_json or {}
    return DailyWordResponse(
        word=pj.get("word", "Perseverance"),
        phonetic=pj.get("phonetic", "/ˌpɜːrsəˈvɪrəns/"),
        part_of_speech=pj.get("part_of_speech", "noun"),
        translation_fa=pj.get("translation_fa", "پشتکار و مداومت"),
        example_target=pj.get("example_target", "Through hard work and perseverance, she became fluent in English."),
        example_fa=pj.get("example_fa", "او از طریق کار سخت و پشتکار در زبان انگلیسی مسلط شد."),
        pedagogical_tip_fa=pj.get("pedagogical_tip_fa", "یادگیری پایدار نیازمند تمرین روزانه حتی به مدت ده دقیقه است."),
        fun_fact_fa=pj.get("fun_fact_fa", "این واژه از ریشه لاتین perseverare مشتق شده است."),
        is_fallback=res.provider_name == "local_fallback",
    )

@router.post("/writing-correction", response_model=WritingCorrectionResponse)
async def correct_writing(req: WritingCorrectionRequest):
    prompt = f"Analyze and correct this {req.target_language} text written by a {req.user_level} student: '{req.text}'. Prompt context: '{req.prompt}'. Return score (0-100), cefr_level, general_feedback_fa, strengths_fa, weaknesses_fa, corrected_text, detailed_corrections."
    res = await ai_gateway.execute_with_failover(
        task_name="writing_correction",
        is_json=True,
        prompt=prompt,
    )
    pj = res.parsed_json or {}
    return WritingCorrectionResponse(
        score=pj.get("score", 85),
        cefr_level=pj.get("cefr_level", req.user_level),
        general_feedback_fa=pj.get("general_feedback_fa", "متن شما بررسی شد و ساختار کلی آن منسجم و قابل درک است."),
        strengths_fa=pj.get("strengths_fa", ["استفاده مناسب از واژگان"]),
        weaknesses_fa=pj.get("weaknesses_fa", ["دقت بیشتر در حروف اضافه"]),
        corrected_text=pj.get("corrected_text", req.text),
        detailed_corrections=pj.get("detailed_corrections", []),
        provider=res.provider_name,
    )

@router.post("/roleplay-turn", response_model=RoleplayTurnResponse)
async def roleplay_turn(req: RoleplayTurnRequest):
    prompt = f"Roleplay scenario: {req.scenario_id}. User ({req.user_level}) says: '{req.user_message}'. Dialogue history: {req.dialogue_history}. Reply in character in target language and provide Persian translation and suggested replies."
    res = await ai_gateway.execute_with_failover(
        task_name="roleplay_turn",
        is_json=True,
        prompt=prompt,
    )
    pj = res.parsed_json or {}
    return RoleplayTurnResponse(
        ai_reply=pj.get("ai_reply", "Welcome! How can I assist you today?"),
        ai_reply_fa=pj.get("ai_reply_fa", "خوش آمدید! چطور می‌توانم امروز به شما کمک کنم؟"),
        feedback_fa=pj.get("feedback_fa"),
        is_goal_achieved=pj.get("is_goal_achieved", False),
        suggested_replies=pj.get("suggested_replies", ["Yes, please.", "Could you give me more details?"]),
    )
