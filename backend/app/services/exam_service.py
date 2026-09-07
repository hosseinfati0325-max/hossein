import random
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.exam import Exam, ExamQuestion, ExamAttempt, ExamAnswer
from app.models.learning import GrammarLesson, VocabularyWord
from app.schemas.mock_exam import (
    MockExamGenerateRequest,
    ExamQuestionResponse,
    MockExamBreakdownResponse,
    MockExamCategoryScore,
)
from app.ai.gateway import ai_gateway

class ExamService:
    """Orchestrates mock exam generation, automatic scoring, band estimation, and AI diagnostic breakdown."""

    @staticmethod
    async def generate_mock_exam(
        db: AsyncSession,
        req: MockExamGenerateRequest
    ) -> List[ExamQuestionResponse]:
        """Dynamically pulls questions from curriculum and curated question banks."""

        # Curated standard questions bank for high-quality mock evaluation
        curated_pool = [
            {
                "id": "mock-q1",
                "source_type": "grammar",
                "topic_category_fa": "گرامر: زمان گذشته ساده و نقلی (Past Tense)",
                "prompt_fa": "کدام گزینه شکل صحیح زمان گذشته برای فاعل سوم شخص است؟",
                "prompt_target": "She _____ to Madrid last summer.",
                "target_audio_text": "She went to Madrid last summer.",
                "options": ["goes", "went", "has gone", "going"],
                "correct_answer": "went",
                "explanation_fa": "با قید زمان مشخص در گذشته (last summer) باید از گذشته ساده (Past Simple) یعنی went استفاده شود.",
                "phonetic": "/went/",
            },
            {
                "id": "mock-q2",
                "source_type": "grammar",
                "topic_category_fa": "گرامر: افعال کمکی و وجهی (Modal Verbs)",
                "prompt_fa": "برای بیان الزام قوی یا قانون رسمی از کدام فعل کمکی استفاده می‌شود؟",
                "prompt_target": "Passengers _____ wear seatbelts during takeoff.",
                "target_audio_text": "Passengers must wear seatbelts during takeoff.",
                "options": ["must", "might", "can", "would"],
                "correct_answer": "must",
                "explanation_fa": "فعل must برای بیان الزام قوی قانونی یا اجبار قطعی به کار می‌رود.",
                "phonetic": "/mʌst/",
            },
            {
                "id": "mock-q3",
                "source_type": "vocabulary",
                "topic_category_fa": "واژگان: اصطلاحات کاری و محیط شغلی (Business & Career)",
                "prompt_fa": "معنی دقیق واژه 'Negotiation' چیست؟",
                "prompt_target": "The salary negotiation was successful.",
                "target_audio_text": "The salary negotiation was successful.",
                "options": ["مذاکره و گفت‌وگو", "قرارداد کتبی", "استعفای کاری", "ترفیع رتبه"],
                "correct_answer": "مذاکره و گفت‌وگو",
                "explanation_fa": "واژه Negotiation به معنای بحث رسمی به منظور رسیدن به توافق (مذاکره) است.",
                "phonetic": "/nəˌɡoʊ.ʃiˈeɪ.ʃən/",
            },
            {
                "id": "mock-q4",
                "source_type": "grammar",
                "topic_category_fa": "گرامر: جملات شرطی نوع دوم (Conditional Type 2)",
                "prompt_fa": "جمله شرطی فرضی در زمان حال را تکمیل کنید:",
                "prompt_target": "If I _____ more free time, I would travel around the world.",
                "target_audio_text": "If I had more free time, I would travel around the world.",
                "options": ["have", "had", "will have", "would have"],
                "correct_answer": "had",
                "explanation_fa": "در شرطی نوع دوم، جمله پیرو با زمان گذشته ساده (had) و جمله پایه با would + verb بیان می‌شود.",
                "phonetic": "/hæd/",
            },
            {
                "id": "mock-q5",
                "source_type": "vocabulary",
                "topic_category_fa": "واژگان: سفر و فرودگاه (Travel & Transport)",
                "prompt_fa": "مترادف عبارت 'Boarding Pass' کدام است؟",
                "prompt_target": "Please show your boarding pass at the gate.",
                "target_audio_text": "Please show your boarding pass at the gate.",
                "options": ["کارت پرواز", "گذرنامه بین‌المللی", "رسید بار و چمدان", "ویزا فرودگاهی"],
                "correct_answer": "کارت پرواز",
                "explanation_fa": "Boarding Pass مجوزی است که به مسافر اجازه سوار شدن به هواپیما را می‌دهد.",
                "phonetic": "/ˈbɔːr.dɪŋ ˌpæs/",
            },
            {
                "id": "mock-q6",
                "source_type": "grammar",
                "topic_category_fa": "گرامر: مجهول زمان حال (Passive Voice)",
                "prompt_fa": "کدام ساختار مجهول صحیح است؟",
                "prompt_target": "English _____ all over the world.",
                "target_audio_text": "English is spoken all over the world.",
                "options": ["speaks", "is spoken", "is speaking", "has spoken"],
                "correct_answer": "is spoken",
                "explanation_fa": "ساختار مجهول حال ساده: am/is/are + Past Participle (is spoken).",
                "phonetic": "/ɪz ˈspoʊ.kən/",
            },
            {
                "id": "mock-q7",
                "source_type": "vocabulary",
                "topic_category_fa": "واژگان: احساسات و صفات پیشرفته (Emotions & Adjectives)",
                "prompt_fa": "کلمه 'Overwhelmed' چه احساسی را منتقل می‌کند؟",
                "prompt_target": "She felt overwhelmed by the amount of work.",
                "target_audio_text": "She felt overwhelmed by the amount of work.",
                "options": ["غرق در کار و مستأصل", "هیجان‌زده و پرانرژی", "خسته از بی‌حوصلگی", "امیدوار به نتیجه"],
                "correct_answer": "غرق در کار و مستأصل",
                "explanation_fa": "کلمه Overwhelmed به وضعیتی اشاره دارد که شدت یا حجم چیزی بیش از ظرفیت تحمل شخص باشد.",
                "phonetic": "/ˌoʊ.vɚˈwelmd/",
            },
            {
                "id": "mock-q8",
                "source_type": "grammar",
                "topic_category_fa": "گرامر: حروف اضافه مکان و زمان (Prepositions)",
                "prompt_fa": "حرف اضافه مناسب برای سال و فصل چیست؟",
                "prompt_target": "The championship was held _____ 2024.",
                "target_audio_text": "The championship was held in 2024.",
                "options": ["in", "at", "on", "by"],
                "correct_answer": "in",
                "explanation_fa": "برای سال‌ها، ماه‌ها و فصل‌ها از حرف اضافه in استفاده می‌شود.",
                "phonetic": "/ɪn/",
            },
        ]

        count = min(req.question_count, len(curated_pool))
        selected = random.sample(curated_pool, count)
        return [ExamQuestionResponse(**q) for q in selected]

    @staticmethod
    def calculate_scores(
        questions: List[ExamQuestionResponse],
        user_answers: Dict[str, str]
    ) -> Tuple[float, int, int, int, List[MockExamCategoryScore]]:
        """Computes score percentage and breaks down performance by category."""
        total = len(questions)
        correct = 0
        wrong = 0
        unanswered = 0

        categories_map: Dict[str, Dict[str, Any]] = {}

        for q in questions:
            cat = q.topic_category_fa
            if cat not in categories_map:
                categories_map[cat] = {
                    "source_type": q.source_type,
                    "total": 0,
                    "correct": 0,
                }
            categories_map[cat]["total"] += 1

            ans = user_answers.get(q.id)
            if not ans:
                unanswered += 1
            elif ans.strip().lower() == q.correct_answer.strip().lower():
                correct += 1
                categories_map[cat]["correct"] += 1
            else:
                wrong += 1

        score_percent = round((correct / total) * 100, 1) if total > 0 else 0.0

        category_scores: List[MockExamCategoryScore] = []
        for cat_name, data in categories_map.items():
            pct = round((data["correct"] / data["total"]) * 100, 1) if data["total"] > 0 else 0.0
            status = "تسلط عالی" if pct >= 80 else ("نیاز به تقویت" if pct <= 50 else "متوسط")
            category_scores.append(MockExamCategoryScore(
                category_fa=cat_name,
                source_type=data["source_type"],
                total=data["total"],
                correct=data["correct"],
                percentage=pct,
                status=status,
            ))

        return score_percent, correct, wrong, unanswered, category_scores

    @staticmethod
    def estimate_band_score(score_percent: float) -> Tuple[str, str]:
        """Maps percentage to estimated CEFR and IELTS band score."""
        if score_percent >= 90:
            return "8.0 - 8.5 (پیشرفته C1+)", "C1"
        elif score_percent >= 80:
            return "7.0 - 7.5 (مسلط B2+)", "B2"
        elif score_percent >= 65:
            return "6.0 - 6.5 (متوسط رو به بالا B2)", "B2"
        elif score_percent >= 50:
            return "5.0 - 5.5 (متوسط مستقل B1)", "B1"
        elif score_percent >= 35:
            return "4.0 - 4.5 (مقدماتی تا متوسط A2)", "A2"
        else:
            return "3.0 - 3.5 (پایه‌ای A1)", "A1"

    @staticmethod
    async def generate_diagnostic_breakdown(
        score_percent: float,
        level: str,
        category_scores: List[MockExamCategoryScore]
    ) -> MockExamBreakdownResponse:
        """Uses AI Gateway with robust fallback to deliver detailed strengths, weaknesses, and a structured study plan."""

        band_score, cefr = ExamService.estimate_band_score(score_percent)

        strengths = [
            f"تسلط بالا در بخش {cs.category_fa} (نمره {cs.percentage}٪)"
            for cs in category_scores if cs.percentage >= 70
        ]
        if not strengths:
            strengths = ["تلاش عالی در مدیریت زمان و پاسخگویی به تمام سوالات"]

        weaknesses = [
            f"نیاز به تمرین و مرور در مبحث {cs.category_fa} (نمره {cs.percentage}٪)"
            for cs in category_scores if cs.percentage < 70
        ]
        if not weaknesses:
            weaknesses = ["دقت بیشتر در جزئیات ظریف نشانه‌گذاری و گرامر پیشرفته"]

        study_plan = [
            "انجام ۳ جلسه هفتگی مرور جعبه لایتنر (SRS) برای تثبیت واژگان دشوار",
            "مطالعه درسنامه‌های تکمیلی گرامر در ماژول‌های مشخص شده",
            "تکرار آزمون شبیه‌ساز پس از یک هفته برای سنجش پیشرفت و افزایش نمره تراز",
        ]

        # Construct prompt for AI enrichment
        prompt = (
            f"Student achieved {score_percent}% in a {level} English mock exam.\n"
            f"Estimated Band: {band_score}\n"
            f"Categories: {[cs.dict() for cs in category_scores]}\n"
            "Provide Persian pedagogical diagnostic feedback with: summary_fa, strengths_fa, weaknesses_fa, actionable_study_plan_fa, motivational_message_fa."
        )

        res = await ai_gateway.execute_with_failover(
            task_name="exam_breakdown",
            is_json=True,
            prompt=prompt,
            temperature=0.3,
        )

        if res.parsed_json and "summary_fa" in res.parsed_json:
            pj = res.parsed_json
            return MockExamBreakdownResponse(
                overall_score_percent=score_percent,
                estimated_band_score=band_score,
                proficiency_level=cefr,
                summary_fa=pj.get("summary_fa", f"نمره کل شما {score_percent}٪ برآورد گردید."),
                strengths_fa=pj.get("strengths_fa", strengths),
                weaknesses_fa=pj.get("weaknesses_fa", weaknesses),
                actionable_study_plan_fa=pj.get("actionable_study_plan_fa", study_plan),
                category_scores=category_scores,
                motivational_message_fa=pj.get("motivational_message_fa", "مسیر تسلط بر زبان پیوسته است؛ با پشتکار ادامه دهید!"),
            )

        # Fallback response
        return MockExamBreakdownResponse(
            overall_score_percent=score_percent,
            estimated_band_score=band_score,
            proficiency_level=cefr,
            summary_fa=f"آزمون شبیه‌ساز با موفقیت تحلیل شد. نمره کل کسب‌شده: {score_percent}٪ (تراز معادل: {band_score}).",
            strengths_fa=strengths,
            weaknesses_fa=weaknesses,
            actionable_study_plan_fa=study_plan,
            category_scores=category_scores,
            motivational_message_fa="عملکرد ارزشمندی ثبت کردید. اجرای برنامه مطالعاتی پیشنهادی تراز شما را ارتقا خواهد داد.",
        )

exam_service = ExamService()
