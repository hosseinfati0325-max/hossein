from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class GrammarLessonResponse(BaseModel):
    id: str
    module_id: str
    title: str
    title_fa: str
    level: str
    explanation_fa: str
    explanation_en: Optional[str] = None
    formula: Optional[str] = None
    examples: List[Dict[str, Any]]
    common_mistakes: List[Dict[str, Any]]
    exercises: List[Dict[str, Any]]
    order_index: int

    class Config:
        from_attributes = True

class GrammarModuleResponse(BaseModel):
    id: str
    language: str
    level: str
    title: str
    title_fa: str
    description_fa: Optional[str] = None
    order_index: int
    lessons: List[GrammarLessonResponse] = []

    class Config:
        from_attributes = True

class VocabularyWordResponse(BaseModel):
    id: str
    set_id: str
    word: str
    translation_fa: str
    phonetic: Optional[str] = None
    part_of_speech: Optional[str] = None
    example_target: Optional[str] = None
    example_fa: Optional[str] = None
    difficulty: str
    audio_url: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class VocabularySetResponse(BaseModel):
    id: str
    language: str
    level: str
    category: str
    title_fa: str
    title_native: str
    description_fa: Optional[str] = None
    icon_name: str
    words: List[VocabularyWordResponse] = []

    class Config:
        from_attributes = True
